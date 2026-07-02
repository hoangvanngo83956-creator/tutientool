import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getNovelWithChapters } from "@/lib/data";
import { createJsonChatCompletion } from "@/lib/ai/openaiClient";
import { buildGenerateContentSeriesPrompt } from "@/lib/ai/prompts/generateContentSeriesPrompt";
import { buildGenerateVideoIdeasPrompt } from "@/lib/ai/prompts/generateVideoIdeasPrompt";
import { buildGenerateContentCalendarPrompt } from "@/lib/ai/prompts/generateContentCalendarPrompt";
import { buildGenerateProductionTasksPrompt } from "@/lib/ai/prompts/generateProductionTasksPrompt";
import { CALENDAR_PLATFORMS, CALENDAR_STATUSES, IDEA_STATUSES, IDEA_VIDEO_TYPES, SERIES_STATUSES, SERIES_TYPES, TASK_STATUSES, TASK_TYPES, type ContentCalendarItem, type ContentIdea, type ContentSeries, type GenerateCalendarInput, type GenerateIdeasInput, type GenerateSeriesInput, type ProductionTask } from "@/lib/module5-types";

export async function getPlannerContext(novelId: string) {
  const supabase = getSupabaseServerClient();
  const novel = await getNovelWithChapters(novelId);
  if (!novel) throw new Error("Không tìm thấy truyện.");
  const [entities, reports, scripts, notes] = await Promise.all([
    supabase.from("entities").select("id,name,entity_type,description,confidence_score,status,entity_evidence(id,evidence_summary,chapter_number)").eq("novel_id", novelId).limit(80),
    supabase.from("ai_research_reports").select("id,title,report_type,summary,source_references_json").eq("novel_id", novelId).limit(40),
    supabase.from("video_scripts").select("id,title,video_type,hook,fact_check_status,status,source_references_json").eq("novel_id", novelId).limit(40),
    supabase.from("research_notes").select("id,title,note_type,content").eq("novel_id", novelId).limit(40)
  ]);
  for (const result of [entities, reports, scripts, notes]) if (result.error) throw result.error;
  return { novel: { id: novel.id, title: novel.title, chapter_count: novel.chapters.length }, entities: entities.data ?? [], reports: reports.data ?? [], scripts: scripts.data ?? [], notes: notes.data ?? [] };
}

export async function listSeries(novelId: string): Promise<ContentSeries[]> {
  const { data, error } = await getSupabaseServerClient().from("content_series").select("id,novel_id,title,description,series_type,target_audience,tone,style,total_planned_videos,status,created_at,updated_at,content_ideas(id)").eq("novel_id", novelId).order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as any[]).map((s) => ({ ...s, idea_count: s.content_ideas?.length ?? 0 }));
}

export async function listIdeas(novelId: string): Promise<ContentIdea[]> {
  const { data, error } = await getSupabaseServerClient().from("content_ideas").select("id,novel_id,series_id,title,topic,video_type,suggested_duration_seconds,hook_angle,content_summary,related_entity_ids_json,related_research_note_ids_json,related_report_ids_json,source_references_json,priority_score,viral_score,originality_score,evidence_strength_score,warning_notes_json,status,created_at,updated_at,series:content_series(id,title)").eq("novel_id", novelId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as any;
}

export async function listCalendarItems(novelId: string): Promise<ContentCalendarItem[]> {
  const { data, error } = await getSupabaseServerClient().from("content_calendar_items").select("id,novel_id,series_id,content_idea_id,video_script_id,publish_date,publish_time,platform,title,caption,hashtags_json,status,notes,created_at,updated_at,series:content_series(id,title),idea:content_ideas(id,title,status)").eq("novel_id", novelId).order("publish_date", { ascending: true }).order("publish_time", { ascending: true });
  if (error) throw error;
  return (data ?? []) as any;
}

export async function listProductionTasks(novelId: string): Promise<ProductionTask[]> {
  const { data, error } = await getSupabaseServerClient().from("production_tasks").select("id,novel_id,content_idea_id,video_script_id,calendar_item_id,task_title,task_type,assigned_to,status,due_date,notes,created_at,updated_at,idea:content_ideas(id,title,status)").eq("novel_id", novelId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as any;
}

export async function createSeries(novelId: string, raw: any) {
  const payload = normalizeSeries(novelId, raw);
  const { data, error } = await getSupabaseServerClient().from("content_series").insert(payload).select("id").single();
  if (error) throw error;
  return data;
}

export async function createIdea(novelId: string, raw: any) {
  const payload = normalizeIdea(novelId, raw);
  if (!payload.source_references_json.length) throw new Error("Ý tưởng này chưa có source reference, không thể lưu đúng nguyên tác.");
  const { data, error } = await getSupabaseServerClient().from("content_ideas").insert(payload).select("id").single();
  if (error) throw error;
  return data;
}

export async function generateSeries(novelId: string, input: GenerateSeriesInput) {
  const context = await getPlannerContext(novelId);
  if (!context.entities.length) throw new Error("Chưa có đủ dữ liệu nguyên tác để tạo series. Hãy chạy AI Research ở Module 3 trước.");
  const content = await createJsonChatCompletion({ prompt: buildGenerateContentSeriesPrompt({ ...context, ...input }) });
  const parsed = parseJson(content);
  const saved = [];
  for (const item of (Array.isArray(parsed.series) ? parsed.series : []).slice(0, input.number_of_series)) saved.push(await createSeries(novelId, item));
  return { count: saved.length, items: saved };
}

export async function generateIdeas(novelId: string, input: GenerateIdeasInput) {
  const [context, series] = await Promise.all([getPlannerContext(novelId), input.series_id ? getSeries(novelId, input.series_id) : Promise.resolve(null)]);
  if (!context.entities.length && !context.reports.length && !context.notes.length) throw new Error("Chưa có đủ dữ liệu nguyên tác để tạo ideas. Hãy chạy AI Research hoặc lưu Research Notes trước.");
  const content = await createJsonChatCompletion({ prompt: buildGenerateVideoIdeasPrompt({ ...context, series_info: series, ...input }) });
  const parsed = parseJson(content);
  const saved = [];
  for (const item of (Array.isArray(parsed.ideas) ? parsed.ideas : []).slice(0, input.number_of_ideas)) saved.push(await createIdea(novelId, { ...item, series_id: input.series_id ?? null }));
  return { count: saved.length, items: saved };
}

export async function generateCalendar(novelId: string, input: GenerateCalendarInput) {
  const [context, ideas, series] = await Promise.all([getPlannerContext(novelId), listIdeas(novelId), listSeries(novelId)]);
  const approved = ideas.filter((idea) => input.selected_idea_ids.length ? input.selected_idea_ids.includes(idea.id) : idea.status === "approved");
  if (!approved.length) throw new Error("Không có content idea được duyệt để tạo lịch.");
  const content = await createJsonChatCompletion({ prompt: buildGenerateContentCalendarPrompt({ ...context, start_date: input.start_date, end_date: input.end_date, posts_per_day: input.posts_per_day, preferred_publish_times: input.preferred_publish_times, platforms: input.platforms, selected_series: series.filter((s) => !input.selected_series_ids.length || input.selected_series_ids.includes(s.id)), approved_content_ideas: approved, strategy: input.strategy }) });
  const parsed = parseJson(content);
  const saved = [];
  for (const item of (Array.isArray(parsed.calendar_items) ? parsed.calendar_items : []).slice(0, 120)) saved.push(await createCalendarItem(novelId, item));
  return { count: saved.length, posting_strategy_summary: parsed.posting_strategy_summary, warnings: parsed.warnings ?? [] };
}

export async function createCalendarItem(novelId: string, raw: any) {
  const payload = { novel_id: novelId, series_id: raw.series_id || null, content_idea_id: raw.content_idea_id || null, video_script_id: raw.video_script_id || null, publish_date: raw.publish_date, publish_time: raw.publish_time || "20:00", platform: CALENDAR_PLATFORMS.includes(raw.platform) ? raw.platform : "tiktok", title: String(raw.title || "Untitled"), caption: raw.caption || raw.caption_suggestion || null, hashtags_json: Array.isArray(raw.hashtags) ? raw.hashtags : [], status: CALENDAR_STATUSES.includes(raw.status) ? raw.status : "planned", notes: raw.reason_for_slot || raw.notes || null };
  const { data, error } = await getSupabaseServerClient().from("content_calendar_items").insert(payload).select("id").single();
  if (error) throw error;
  return data;
}

export async function createProductionTask(novelId: string, raw: any) {
  const payload = { novel_id: novelId, content_idea_id: raw.content_idea_id || null, video_script_id: raw.video_script_id || null, calendar_item_id: raw.calendar_item_id || null, task_title: String(raw.task_title || "Task"), task_type: TASK_TYPES.includes(raw.task_type) ? raw.task_type : "other", assigned_to: raw.assigned_to || null, status: TASK_STATUSES.includes(raw.status) ? raw.status : "todo", due_date: raw.due_date || null, notes: raw.notes || null };
  const { data, error } = await getSupabaseServerClient().from("production_tasks").insert(payload).select("id").single();
  if (error) throw error;
  return data;
}

export async function generateProductionTasks(novelId: string, input: any) {
  const content = await createJsonChatCompletion({ prompt: buildGenerateProductionTasksPrompt(input) });
  const parsed = parseJson(content);
  const saved = [];
  for (const task of (Array.isArray(parsed.tasks) ? parsed.tasks : defaultTasks()).slice(0, 20)) saved.push(await createProductionTask(novelId, { ...task, ...input }));
  return { count: saved.length, items: saved };
}

export async function patchRow(table: string, novelId: string, id: string, raw: any) {
  const { error } = await getSupabaseServerClient().from(table).update({ ...raw, updated_at: new Date().toISOString() }).eq("novel_id", novelId).eq("id", id);
  if (error) throw error;
}
export async function deleteRow(table: string, novelId: string, id: string) { const { error } = await getSupabaseServerClient().from(table).delete().eq("novel_id", novelId).eq("id", id); if (error) throw error; }
export async function getSeries(novelId: string, id: string) { const { data, error } = await getSupabaseServerClient().from("content_series").select("*").eq("novel_id", novelId).eq("id", id).maybeSingle(); if (error) throw error; return data; }
export async function getIdea(novelId: string, id: string) { const { data, error } = await getSupabaseServerClient().from("content_ideas").select("*").eq("novel_id", novelId).eq("id", id).maybeSingle(); if (error) throw error; return data as ContentIdea | null; }

function normalizeSeries(novelId: string, raw: any) { return { novel_id: novelId, title: String(raw.title || "Untitled series"), description: raw.description || raw.reason_why_this_series_works || null, series_type: SERIES_TYPES.includes(raw.series_type) ? raw.series_type : "custom_series", target_audience: ["newbie", "familiar_with_story", "hardcore_fan"].includes(raw.target_audience) ? raw.target_audience : "newbie", tone: raw.tone || "mysterious", style: raw.style || "tiktok_viral", total_planned_videos: Number(raw.suggested_video_count || raw.total_planned_videos || 10), status: SERIES_STATUSES.includes(raw.status) ? raw.status : "draft" }; }
function normalizeIdea(novelId: string, raw: any) { const refs = Array.isArray(raw.source_references) ? raw.source_references : Array.isArray(raw.source_references_json) ? raw.source_references_json : []; const warnings = Array.isArray(raw.warning_notes) ? raw.warning_notes : Array.isArray(raw.warning_notes_json) ? raw.warning_notes_json : []; const evidenceScore = clampScore(raw.evidence_strength_score); return { novel_id: novelId, series_id: raw.series_id || null, title: String(raw.title || "Untitled idea"), topic: String(raw.topic || raw.title || ""), video_type: IDEA_VIDEO_TYPES.includes(raw.video_type) ? raw.video_type : "custom", suggested_duration_seconds: Number(raw.suggested_duration_seconds || raw.duration_seconds || 60), hook_angle: raw.hook_angle || null, content_summary: raw.content_summary || null, related_entity_ids_json: (raw.related_entities || []).map((e: any) => e.entity_id).filter(Boolean), related_research_note_ids_json: raw.related_research_note_ids_json || [], related_report_ids_json: raw.related_report_ids_json || [], source_references_json: refs, priority_score: clampScore(raw.priority_score), viral_score: clampScore(raw.viral_score), originality_score: clampScore(raw.originality_score), evidence_strength_score: evidenceScore, warning_notes_json: evidenceScore < 5 && warnings.length === 0 ? ["Không đủ dữ kiện trong nguyên tác"] : warnings, status: IDEA_STATUSES.includes(raw.status) ? raw.status : "idea" }; }
function clampScore(value: any) { const n = Number(value); return Math.max(1, Math.min(10, Number.isFinite(n) ? Math.round(n) : 5)); }
function parseJson(value: string) { try { return JSON.parse(value); } catch { throw new Error("AI trả về JSON sai format."); } }
function defaultTasks() { return ["Research check", "Generate script", "Fact check script", "Generate image prompts", "Generate video prompts", "Create voice-over", "Generate visuals", "Edit video", "Add subtitles", "Prepare caption", "Final review", "Publish"].map((task_title, index) => ({ task_title, task_type: ["research","script","review","image_generation","video_generation","voice_over","video_generation","editing","subtitle","caption","review","posting"][index], status: "todo" })); }
