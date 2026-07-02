import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ENTITY_TYPES, RELATIONSHIP_TYPES, type AIResearchReport, type Entity, type EntityEvidence, type EntityRelationship, type EntityStatus, type EntityType, type ExtractEntitiesResult, type ExtractedEntityPayload, type RelationshipType, type ResearchJob } from "@/lib/module3-types";

export function normalizeEntityName(name: string) {
  return name
    .toLocaleLowerCase("vi-VN")
    .normalize("NFC")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s/g, "_");
}

export async function createResearchJob(input: { novelId: string; jobType: string; inputData: unknown }) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("research_jobs")
    .insert({ novel_id: input.novelId, job_type: input.jobType, status: "running", input_data: input.inputData })
    .select("id,novel_id,job_type,status,input_data,result_summary,error_message,created_at,completed_at")
    .single();

  if (error) throw error;
  return data as ResearchJob;
}

export async function completeResearchJob(jobId: string, resultSummary: unknown) {
  const supabase = getSupabaseServerClient();
  await supabase.from("research_jobs").update({ status: "completed", result_summary: resultSummary, completed_at: new Date().toISOString() }).eq("id", jobId).throwOnError();
}

export async function failResearchJob(jobId: string, message: string) {
  const supabase = getSupabaseServerClient();
  await supabase.from("research_jobs").update({ status: "failed", error_message: message, completed_at: new Date().toISOString() }).eq("id", jobId).throwOnError();
}

export async function getResearchJob(jobId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("research_jobs")
    .select("id,novel_id,job_type,status,input_data,result_summary,error_message,created_at,completed_at")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw error;
  return data as ResearchJob | null;
}

export async function fetchChunksForAI(input: { novelId: string; chapterStart?: number | null; chapterEnd?: number | null; limit?: number }) {
  const supabase = getSupabaseServerClient();
  let request = supabase
    .from("chapter_chunks")
    .select("id,novel_id,chapter_id,chapter_number,chunk_index,content,created_at,chapters(chapter_title),novels(title)")
    .eq("novel_id", input.novelId)
    .order("chapter_number", { ascending: true })
    .order("chunk_index", { ascending: true })
    .limit(input.limit ?? 30);

  if (input.chapterStart != null) request = request.gte("chapter_number", input.chapterStart);
  if (input.chapterEnd != null) request = request.lte("chapter_number", input.chapterEnd);

  const { data, error } = await request;
  if (error) throw error;
  return data ?? [];
}

export async function fetchResearchNotesForAI(novelId: string, limit = 30) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("research_notes")
    .select("id,novel_id,chapter_id,chunk_id,title,note_type,content,user_note,created_at,chapters(chapter_number,chapter_title)")
    .eq("novel_id", novelId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function saveExtractedEntities(input: { novelId: string; result: ExtractEntitiesResult; chunks: Array<{ id: string; chapter_id: string; chapter_number: number }> }) {
  const savedEntities: Entity[] = [];
  const warnings = [...(input.result.warnings ?? [])];
  const chunkById = new Map(input.chunks.map((chunk) => [chunk.id, chunk]));

  for (const entity of input.result.entities ?? []) {
    const saved = await upsertEntity(input.novelId, entity);
    savedEntities.push(saved);
    await insertEvidenceForEntity({ novelId: input.novelId, entityId: saved.id, entity, chunkById });
  }

  await saveRelationships({ novelId: input.novelId, relationships: input.result.relationships ?? [] });
  return { savedEntities, warnings };
}

export async function listEntities(novelId: string): Promise<Entity[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("entities")
    .select("id,novel_id,name,normalized_name,entity_type,description,first_appearance_chapter,confidence_score,status,created_at,updated_at,entity_evidence(id)")
    .eq("novel_id", novelId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as Array<Entity & { entity_evidence?: { id: string }[] }>).map((entity) => ({ ...entity, evidence_count: entity.entity_evidence?.length ?? 0 }));
}

export async function getEntityDetail(entityId: string) {
  const supabase = getSupabaseServerClient();
  const [{ data: entity, error: entityError }, { data: evidence, error: evidenceError }, { data: relationships, error: relError }, { data: reports, error: reportsError }] = await Promise.all([
    supabase.from("entities").select("id,novel_id,name,normalized_name,entity_type,description,first_appearance_chapter,confidence_score,status,created_at,updated_at").eq("id", entityId).maybeSingle(),
    supabase.from("entity_evidence").select("id,entity_id,novel_id,chapter_id,chunk_id,chapter_number,evidence_text,evidence_summary,confidence_score,created_at").eq("entity_id", entityId).order("chapter_number", { ascending: true }),
    supabase.from("entity_relationships").select("id,novel_id,source_entity_id,target_entity_id,relationship_type,description,evidence_text,chapter_id,chunk_id,confidence_score,created_at,source:entities!entity_relationships_source_entity_id_fkey(id,name,entity_type),target:entities!entity_relationships_target_entity_id_fkey(id,name,entity_type)").or(`source_entity_id.eq.${entityId},target_entity_id.eq.${entityId}`),
    supabase.from("ai_research_reports").select("id,novel_id,entity_id,report_type,title,summary,facts_json,warnings_json,source_references_json,created_at,updated_at").eq("entity_id", entityId).order("created_at", { ascending: false })
  ]);

  if (entityError) throw entityError;
  if (evidenceError) throw evidenceError;
  if (relError) throw relError;
  if (reportsError) throw reportsError;

  return {
    entity: entity as Entity | null,
    evidence: (evidence ?? []) as EntityEvidence[],
    relationships: ((relationships ?? []) as any[]).map((item) => ({ ...item, source_entity: item.source, target_entity: item.target })) as EntityRelationship[],
    reports: (reports ?? []) as AIResearchReport[]
  };
}

export async function updateEntityStatus(entityId: string, status: EntityStatus) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("entities").update({ status, updated_at: new Date().toISOString() }).eq("id", entityId).select("id").single();
  if (error) throw error;
  return data;
}

export async function updateEntity(entityId: string, input: { name?: string; description?: string; status?: EntityStatus }) {
  const supabase = getSupabaseServerClient();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name) {
    patch.name = input.name;
    patch.normalized_name = normalizeEntityName(input.name);
  }
  if (input.description != null) patch.description = input.description;
  if (input.status) patch.status = input.status;
  const { data, error } = await supabase.from("entities").update(patch).eq("id", entityId).select("id").single();
  if (error) throw error;
  return data;
}

export async function deleteEntity(entityId: string) {
  const supabase = getSupabaseServerClient();
  await supabase.from("entities").delete().eq("id", entityId).throwOnError();
}

export async function saveAIReport(input: { novelId: string; entityId?: string | null; reportType: string; title: string; summary: string; facts: unknown; warnings: unknown; sourceReferences: unknown }) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ai_research_reports")
    .insert({ novel_id: input.novelId, entity_id: input.entityId ?? null, report_type: input.reportType, title: input.title, summary: input.summary, facts_json: input.facts, warnings_json: input.warnings, source_references_json: input.sourceReferences })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

async function upsertEntity(novelId: string, entity: ExtractedEntityPayload): Promise<Entity> {
  const supabase = getSupabaseServerClient();
  const entityType = ENTITY_TYPES.includes(entity.entity_type) ? entity.entity_type : "other";
  const normalizedName = entity.normalized_name?.trim() || normalizeEntityName(entity.name);
  const payload = { novel_id: novelId, name: entity.name, normalized_name: normalizedName, entity_type: entityType, description: entity.description, first_appearance_chapter: entity.first_appearance_chapter ?? null, confidence_score: clampScore(entity.confidence_score), status: "draft" };

  const { data, error } = await supabase.from("entities").upsert(payload, { onConflict: "novel_id,normalized_name,entity_type" }).select("id,novel_id,name,normalized_name,entity_type,description,first_appearance_chapter,confidence_score,status,created_at,updated_at").single();
  if (error) throw error;
  return data as Entity;
}

async function insertEvidenceForEntity(input: { novelId: string; entityId: string; entity: ExtractedEntityPayload; chunkById: Map<string, { id: string; chapter_id: string; chapter_number: number }> }) {
  const supabase = getSupabaseServerClient();
  const rows = (input.entity.evidence ?? []).slice(0, 5).map((evidence) => {
    const chunk = input.chunkById.get(evidence.chunk_id);
    return { entity_id: input.entityId, novel_id: input.novelId, chapter_id: chunk?.chapter_id ?? null, chunk_id: evidence.chunk_id || null, chapter_number: evidence.chapter_number ?? chunk?.chapter_number ?? null, evidence_text: truncateEvidence(evidence.evidence_text), evidence_summary: evidence.evidence_summary, confidence_score: clampScore(input.entity.confidence_score) };
  }).filter((row) => row.evidence_text);

  if (rows.length > 0) await supabase.from("entity_evidence").insert(rows).throwOnError();
}

async function saveRelationships(input: { novelId: string; relationships: ExtractEntitiesResult["relationships"] }) {
  const supabase = getSupabaseServerClient();
  for (const relationship of input.relationships.slice(0, 20)) {
    if (!RELATIONSHIP_TYPES.includes(relationship.relationship_type)) continue;
    const [source, target] = await Promise.all([findEntityByName(input.novelId, relationship.source_entity_name), findEntityByName(input.novelId, relationship.target_entity_name)]);
    if (!source || !target || source.id === target.id) continue;
    await supabase.from("entity_relationships").insert({ novel_id: input.novelId, source_entity_id: source.id, target_entity_id: target.id, relationship_type: relationship.relationship_type, description: relationship.description, evidence_text: truncateEvidence(relationship.evidence_text), confidence_score: clampScore(relationship.confidence_score) }).throwOnError();
  }
}

async function findEntityByName(novelId: string, name: string) {
  const supabase = getSupabaseServerClient();
  const normalizedName = normalizeEntityName(name);
  const { data, error } = await supabase.from("entities").select("id,name,entity_type").eq("novel_id", novelId).eq("normalized_name", normalizedName).limit(1).maybeSingle();
  if (error) throw error;
  return data as Pick<Entity, "id" | "name" | "entity_type"> | null;
}

function clampScore(value: number) { return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)); }
function truncateEvidence(value: string) { return value.trim().slice(0, 500); }