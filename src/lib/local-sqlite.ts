import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

type Row = Record<string, any>;
type Filter = { type: "eq" | "gte" | "lte" | "ilike" | "in" | "or"; column?: string; value: any };
type Order = { column: string; ascending: boolean };
type ExecuteResult<T = any> = { data: T | null; error: Error | null };

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.LOCAL_DATABASE_PATH || path.join(DATA_DIR, "tutien.db");
const JSON_COLUMNS = new Set([
  "input_data", "result_summary", "facts_json", "warnings_json", "source_references_json", "script_json",
  "image_prompts_json", "video_prompts_json", "hashtags_json", "source_reference", "xianxia_visual_elements",
  "chapters_json", "thumbnail_prompts_json", "seo_metadata_json", "shorts_cutdowns_json", "alternative_titles_json",
  "target_keywords_json", "warning_notes_json", "related_entity_ids_json", "related_research_note_ids_json",
  "related_report_ids_json", "checklist_json"
]);
const TABLES = new Set([
  "novels", "chapters", "chapter_chunks", "research_notes", "entities", "entity_evidence", "entity_relationships",
  "research_jobs", "ai_research_reports", "script_generation_jobs", "video_scripts", "video_script_scenes",
  "content_series", "content_ideas", "content_calendar_items", "production_tasks", "content_batches",
  "youtube_videos", "youtube_seo_packages", "youtube_thumbnail_concepts", "youtube_shorts_cutdowns", "youtube_playlists", "youtube_upload_checklists"
]);

let db: Database.Database | null = null;

export function getLocalDatabasePath() { return DB_PATH; }
export function getLocalDatabase() {
  if (!db) {
    mkdirSync(DATA_DIR, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
  }
  return db;
}
export function getLocalSupabaseClient() { getLocalDatabase(); return { from: (table: string) => new LocalQuery(assertTable(table)) }; }

class LocalQuery {
  private action: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private selectClause = "*";
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private maxRows: number | null = null;
  private maybeSingleFlag = false;
  private singleFlag = false;
  private payload: any;
  private upsertOptions: any;
  constructor(private table: string) {}
  select(columns = "*") { this.selectClause = columns; return this; }
  insert(payload: any) { this.action = "insert"; this.payload = payload; return this; }
  update(payload: any) { this.action = "update"; this.payload = payload; return this; }
  delete() { this.action = "delete"; return this; }
  upsert(payload: any, options?: any) { this.action = "upsert"; this.payload = payload; this.upsertOptions = options; return this; }
  eq(column: string, value: any) { this.filters.push({ type: "eq", column, value }); return this; }
  gte(column: string, value: any) { this.filters.push({ type: "gte", column, value }); return this; }
  lte(column: string, value: any) { this.filters.push({ type: "lte", column, value }); return this; }
  ilike(column: string, value: any) { this.filters.push({ type: "ilike", column, value }); return this; }
  in(column: string, value: any[]) { this.filters.push({ type: "in", column, value }); return this; }
  or(value: string) { this.filters.push({ type: "or", value }); return this; }
  order(column: string, options?: { ascending?: boolean }) { this.orders.push({ column, ascending: options?.ascending !== false }); return this; }
  limit(value: number) { this.maxRows = value; return this; }
  maybeSingle() { this.maybeSingleFlag = true; return this; }
  single() { this.singleFlag = true; return this; }
  async throwOnError() { const result = this.execute(); if (result.error) throw result.error; }
  then(resolve: (value: ExecuteResult) => void, reject?: (reason: unknown) => void) { try { resolve(this.execute()); } catch (error) { if (reject) reject(error); else throw error; } }
  private execute(): ExecuteResult {
    try {
      if (this.action === "insert") return this.executeInsert(false);
      if (this.action === "upsert") return this.executeInsert(true);
      if (this.action === "update") return this.executeUpdate();
      if (this.action === "delete") return this.executeDelete();
      return this.executeSelect();
    } catch (error) { return { data: null, error: error instanceof Error ? error : new Error(String(error)) }; }
  }
  private executeSelect(): ExecuteResult {
    let rows = getAllRows(this.table).filter((row) => matchesFilters(row, this.filters));
    rows = applyOrders(rows, this.orders);
    if (this.maxRows != null) rows = rows.slice(0, this.maxRows);
    rows = rows.map((row) => attachRelations(this.table, row, this.selectClause));
    if (this.singleFlag) return { data: rows[0] ?? null, error: rows[0] ? null : new Error("No rows returned") };
    if (this.maybeSingleFlag) return { data: rows[0] ?? null, error: null };
    return { data: rows, error: null };
  }
  private executeInsert(isUpsert: boolean): ExecuteResult {
    const values = Array.isArray(this.payload) ? this.payload : [this.payload];
    const inserted: Row[] = [];
    for (const raw of values) {
      const row = prepareRow(this.table, raw);
      if (isUpsert) {
        const existing = findUpsertRow(this.table, row, this.upsertOptions?.onConflict);
        if (existing) {
          if (this.upsertOptions?.ignoreDuplicates) { inserted.push(existing); continue; }
          const patch = { ...existing, ...row, updated_at: row.updated_at ?? existing.updated_at };
          updateById(this.table, existing.id, patch);
          inserted.push(patch);
          continue;
        }
      }
      insertRow(this.table, row);
      inserted.push(row);
    }
    return { data: this.singleFlag ? inserted[0] : inserted, error: null };
  }
  private executeUpdate(): ExecuteResult {
    const rows = getAllRows(this.table).filter((row) => matchesFilters(row, this.filters));
    const updated = rows.map((row) => ({ ...row, ...this.payload }));
    for (const row of updated) updateById(this.table, row.id, row);
    return { data: this.singleFlag ? updated[0] ?? null : updated, error: null };
  }
  private executeDelete(): ExecuteResult {
    const rows = getAllRows(this.table).filter((row) => matchesFilters(row, this.filters));
    const database = getLocalDatabase();
    if (this.table === "novels") {
      const byNovelIdTables = ["chapter_chunks", "research_notes", "entities", "entity_evidence", "entity_relationships", "research_jobs", "ai_research_reports", "script_generation_jobs", "video_scripts", "video_script_scenes", "content_series", "content_ideas", "content_calendar_items", "production_tasks", "content_batches", "youtube_videos", "youtube_seo_packages", "youtube_thumbnail_concepts", "youtube_shorts_cutdowns", "youtube_playlists", "youtube_upload_checklists"];
      for (const row of rows) for (const table of byNovelIdTables) database.prepare(`DELETE FROM ${table} WHERE novel_id = ?`).run(row.id);
    }
    if (this.table === "video_scripts") {
      for (const row of rows) database.prepare("DELETE FROM video_script_scenes WHERE video_script_id = ?").run(row.id);
    }
    const stmt = database.prepare(`DELETE FROM ${this.table} WHERE id = ?`);
    for (const row of rows) stmt.run(row.id);
    return { data: null, error: null };
  }
}

function migrate(database: Database.Database) { database.exec(`
CREATE TABLE IF NOT EXISTS novels (id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT, description TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS chapters (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, chapter_number INTEGER NOT NULL, chapter_title TEXT, content TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(novel_id) REFERENCES novels(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS chapter_chunks (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, chapter_id TEXT NOT NULL, chapter_number INTEGER NOT NULL, chunk_index INTEGER NOT NULL, content TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(novel_id, chapter_id, chunk_index));
CREATE TABLE IF NOT EXISTS research_notes (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, chapter_id TEXT, chunk_id TEXT, title TEXT NOT NULL, note_type TEXT NOT NULL, content TEXT NOT NULL, user_note TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS entities (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, name TEXT NOT NULL, normalized_name TEXT NOT NULL, entity_type TEXT NOT NULL, description TEXT, first_appearance_chapter INTEGER, confidence_score REAL, status TEXT DEFAULT 'draft', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(novel_id, normalized_name, entity_type));
CREATE TABLE IF NOT EXISTS entity_evidence (id TEXT PRIMARY KEY, entity_id TEXT NOT NULL, novel_id TEXT NOT NULL, chapter_id TEXT, chunk_id TEXT, chapter_number INTEGER, evidence_text TEXT, evidence_summary TEXT, confidence_score REAL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS entity_relationships (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, source_entity_id TEXT, target_entity_id TEXT, relationship_type TEXT, description TEXT, evidence_text TEXT, chapter_id TEXT, chunk_id TEXT, confidence_score REAL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS research_jobs (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, job_type TEXT, status TEXT, input_data TEXT, result_summary TEXT, error_message TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, completed_at TEXT);
CREATE TABLE IF NOT EXISTS ai_research_reports (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, entity_id TEXT, report_type TEXT, title TEXT, summary TEXT, facts_json TEXT, warnings_json TEXT, source_references_json TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS script_generation_jobs (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, entity_id TEXT, job_type TEXT, status TEXT, input_data TEXT, result_summary TEXT, error_message TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, completed_at TEXT);
CREATE TABLE IF NOT EXISTS video_scripts (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, entity_id TEXT, title TEXT, video_type TEXT, duration_seconds INTEGER, tone TEXT, style TEXT, hook TEXT, voice_over TEXT, script_json TEXT, image_prompts_json TEXT, video_prompts_json TEXT, caption TEXT, hashtags_json TEXT, source_references_json TEXT, fact_check_status TEXT, status TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS video_script_scenes (id TEXT PRIMARY KEY, video_script_id TEXT NOT NULL, novel_id TEXT NOT NULL, scene_index INTEGER, start_time TEXT, end_time TEXT, scene_title TEXT, visual_description TEXT, voice_text TEXT, image_prompt TEXT, video_prompt TEXT, source_reference TEXT, xianxia_visual_elements TEXT, negative_prompt TEXT, warning TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS content_series (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, title TEXT, description TEXT, series_type TEXT, target_audience TEXT, tone TEXT, style TEXT, total_planned_videos INTEGER, status TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS content_ideas (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, series_id TEXT, title TEXT, topic TEXT, video_type TEXT, suggested_duration_seconds INTEGER, hook_angle TEXT, content_summary TEXT, related_entity_ids_json TEXT, related_research_note_ids_json TEXT, related_report_ids_json TEXT, source_references_json TEXT, priority_score INTEGER, viral_score INTEGER, originality_score INTEGER, evidence_strength_score INTEGER, warning_notes_json TEXT, status TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS content_calendar_items (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, series_id TEXT, content_idea_id TEXT, video_script_id TEXT, publish_date TEXT, publish_time TEXT, platform TEXT, title TEXT, caption TEXT, hashtags_json TEXT, status TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS production_tasks (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, content_idea_id TEXT, video_script_id TEXT, calendar_item_id TEXT, task_title TEXT, task_type TEXT, assigned_to TEXT, status TEXT, due_date TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS content_batches (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, batch_type TEXT, status TEXT, input_data TEXT, result_summary TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, completed_at TEXT);
CREATE TABLE IF NOT EXISTS youtube_videos (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, source_script_id TEXT, source_content_idea_id TEXT, source_series_id TEXT, video_format TEXT, title TEXT, working_title TEXT, video_type TEXT, duration_target_minutes INTEGER, duration_target_seconds INTEGER, audience_level TEXT, tone TEXT, style TEXT, script_text TEXT, script_json TEXT, hook TEXT, intro TEXT, body TEXT, conclusion TEXT, chapters_json TEXT, thumbnail_prompts_json TEXT, seo_metadata_json TEXT, shorts_cutdowns_json TEXT, source_references_json TEXT, fact_check_status TEXT, visual_check_status TEXT, production_status TEXT, youtube_status TEXT DEFAULT 'draft', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS youtube_seo_packages (id TEXT PRIMARY KEY, youtube_video_id TEXT, novel_id TEXT NOT NULL, primary_title TEXT, alternative_titles_json TEXT, description TEXT, tags_json TEXT, hashtags_json TEXT, chapters_text TEXT, pinned_comment TEXT, playlist_suggestion TEXT, target_keywords_json TEXT, search_intent TEXT, seo_score INTEGER, click_score INTEGER, retention_score INTEGER, warning_notes_json TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS youtube_thumbnail_concepts (id TEXT PRIMARY KEY, youtube_video_id TEXT, novel_id TEXT NOT NULL, title TEXT, concept_summary TEXT, thumbnail_text TEXT, image_prompt TEXT, negative_prompt TEXT, layout_type TEXT, emotion_angle TEXT, visual_style_preset TEXT, source_references_json TEXT, warning_notes_json TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS youtube_shorts_cutdowns (id TEXT PRIMARY KEY, youtube_video_id TEXT, novel_id TEXT NOT NULL, title TEXT, short_hook TEXT, source_start_time TEXT, source_end_time TEXT, duration_seconds INTEGER, short_script TEXT, image_prompt TEXT, video_prompt TEXT, caption TEXT, hashtags_json TEXT, source_reference TEXT, status TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS youtube_playlists (id TEXT PRIMARY KEY, novel_id TEXT NOT NULL, title TEXT, description TEXT, playlist_type TEXT, target_audience TEXT, video_order_strategy TEXT, status TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS youtube_upload_checklists (id TEXT PRIMARY KEY, youtube_video_id TEXT, novel_id TEXT NOT NULL, checklist_json TEXT, overall_status TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
`); }

function assertTable(table: string) { if (!TABLES.has(table)) throw new Error(`Unknown local table: ${table}`); return table; }
function now() { return new Date().toISOString(); }
function getColumns(table: string) { return getLocalDatabase().prepare(`PRAGMA table_info(${table})`).all().map((row: any) => row.name as string); }
function getAllRows(table: string): Row[] { return getLocalDatabase().prepare(`SELECT * FROM ${table}`).all().map((row: any) => parseRow(row)); }
function parseRow(row: Row) { const out: Row = {}; for (const [key, value] of Object.entries(row)) out[key] = JSON_COLUMNS.has(key) && typeof value === "string" && value ? safeJson(value) : value; return out; }
function safeJson(value: string) { try { return JSON.parse(value); } catch { return value; } }
function serializeValue(column: string, value: any) { return JSON_COLUMNS.has(column) ? JSON.stringify(value ?? null) : value; }
function prepareRow(table: string, raw: Row) { const cols = getColumns(table); const row: Row = {}; for (const col of cols) if (raw[col] !== undefined) row[col] = raw[col]; if (!row.id) row.id = randomUUID(); if (cols.includes("created_at") && !row.created_at) row.created_at = now(); if (cols.includes("updated_at") && !row.updated_at) row.updated_at = now(); return row; }
function insertRow(table: string, row: Row) { const cols = getColumns(table).filter((col) => row[col] !== undefined); getLocalDatabase().prepare(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`).run(cols.map((col) => serializeValue(col, row[col]))); }
function updateById(table: string, id: string, patch: Row) { const cols = getColumns(table).filter((col) => col !== "id" && patch[col] !== undefined); if (!cols.length) return; getLocalDatabase().prepare(`UPDATE ${table} SET ${cols.map((col) => `${col} = ?`).join(",")} WHERE id = ?`).run([...cols.map((col) => serializeValue(col, patch[col])), id]); }
function findUpsertRow(table: string, row: Row, conflict?: string) { const cols = conflict ? String(conflict).split(",").map((item) => item.trim()).filter(Boolean) : ["id"]; return getAllRows(table).find((item) => cols.every((col) => item[col] === row[col])) ?? null; }
function matchesFilters(row: Row, filters: Filter[]) { return filters.every((filter) => { if (filter.type === "eq") return row[filter.column as string] === filter.value; if (filter.type === "gte") return Number(row[filter.column as string]) >= Number(filter.value); if (filter.type === "lte") return Number(row[filter.column as string]) <= Number(filter.value); if (filter.type === "in") return Array.isArray(filter.value) && filter.value.includes(row[filter.column as string]); if (filter.type === "ilike") return ilike(row[filter.column as string], filter.value); if (filter.type === "or") return matchesOr(row, String(filter.value)); return true; }); }
function ilike(value: any, pattern: string) { const needle = String(pattern).replace(/^%|%$/g, "").toLocaleLowerCase("vi-VN"); return String(value ?? "").toLocaleLowerCase("vi-VN").includes(needle); }
function matchesOr(row: Row, expression: string) { return expression.split(",").some((part) => { const ilikeMatch = part.match(/^([^\.]+)\.ilike\.%(.+)%$/); if (ilikeMatch) return ilike(row[ilikeMatch[1]], `%${ilikeMatch[2]}%`); const eqMatch = part.match(/^([^\.]+)\.eq\.(.+)$/); if (eqMatch) return String(row[eqMatch[1]]) === eqMatch[2]; return false; }); }
function applyOrders(rows: Row[], orders: Order[]) { return [...rows].sort((a, b) => { for (const order of orders) { if (a[order.column] === b[order.column]) continue; const result = a[order.column] > b[order.column] ? 1 : -1; return order.ascending ? result : -result; } return 0; }); }
function attachRelations(table: string, row: Row, select: string) { const out = { ...row }; if (table === "novels" && select.includes("chapters")) out.chapters = getAllRows("chapters").filter((c) => c.novel_id === row.id).map((c) => ({ id: c.id })); if (table === "chapters" && select.includes("novels")) out.novels = pick(getAllRows("novels").find((n) => n.id === row.novel_id), ["id", "title", "author"]); if (table === "chapter_chunks") { if (select.includes("chapters")) out.chapters = pick(getAllRows("chapters").find((c) => c.id === row.chapter_id), ["chapter_title"]); if (select.includes("novels")) out.novels = pick(getAllRows("novels").find((n) => n.id === row.novel_id), ["title"]); } if (table === "research_notes" && select.includes("chapters")) out.chapters = pick(getAllRows("chapters").find((c) => c.id === row.chapter_id), ["chapter_number", "chapter_title"]); if (table === "entities" && select.includes("entity_evidence")) out.entity_evidence = getAllRows("entity_evidence").filter((e) => e.entity_id === row.id).map((e) => pick(e, ["id", "evidence_summary", "chapter_number"])); if (table === "entity_relationships") { if (select.includes("source:")) out.source = pick(getAllRows("entities").find((e) => e.id === row.source_entity_id), ["id", "name", "entity_type"]); if (select.includes("target:")) out.target = pick(getAllRows("entities").find((e) => e.id === row.target_entity_id), ["id", "name", "entity_type"]); } if (table === "video_scripts" && select.includes("entity:")) out.entity = pick(getAllRows("entities").find((e) => e.id === row.entity_id), ["id", "name", "entity_type"]); if (table === "content_series" && select.includes("content_ideas")) out.content_ideas = getAllRows("content_ideas").filter((i) => i.series_id === row.id).map((i) => ({ id: i.id })); if (table === "content_ideas" && select.includes("series:")) out.series = pick(getAllRows("content_series").find((s) => s.id === row.series_id), ["id", "title"]); if (table === "content_calendar_items") { if (select.includes("series:")) out.series = pick(getAllRows("content_series").find((s) => s.id === row.series_id), ["id", "title"]); if (select.includes("idea:")) out.idea = pick(getAllRows("content_ideas").find((i) => i.id === row.content_idea_id), ["id", "title", "status"]); } if (table === "production_tasks" && select.includes("idea:")) out.idea = pick(getAllRows("content_ideas").find((i) => i.id === row.content_idea_id), ["id", "title", "status"]); return out; }
function pick(row: Row | undefined, keys: string[]) { if (!row) return null; return Object.fromEntries(keys.map((key) => [key, row[key]])); }
