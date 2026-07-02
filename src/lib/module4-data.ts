import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getNovelWithChapters } from "@/lib/data";
import { AUDIENCE_LEVELS, FACT_CHECK_STATUSES, SCRIPT_DURATIONS, SCRIPT_STATUSES, SCRIPT_STYLES, SCRIPT_TONES, VIDEO_TYPES, VISUAL_STYLE_PRESETS, type GeneratedScriptPayload, type ScriptDuration, type ScriptEvidenceBundle, type ScriptFactCheckStatus, type ScriptGeneratorInput, type ScriptStatus, type ScriptStyle, type ScriptTone, type VideoScript, type VideoScriptScene, type VideoType } from "@/lib/module4-types";

export function normalizeScriptInput(raw: any): ScriptGeneratorInput {
  const videoType = VIDEO_TYPES.includes(raw?.video_type) ? raw.video_type : "custom";
  const duration = SCRIPT_DURATIONS.includes(Number(raw?.duration_seconds) as ScriptDuration) ? Number(raw.duration_seconds) as ScriptDuration : 60;
  const tone = SCRIPT_TONES.includes(raw?.tone) ? raw.tone : "mysterious";
  const style = SCRIPT_STYLES.includes(raw?.style) ? raw.style : "tiktok_viral";
  const audience = AUDIENCE_LEVELS.includes(raw?.audience_level) ? raw.audience_level : "newbie";
  const visualPreset = VISUAL_STYLE_PRESETS.includes(raw?.visual_style_preset) ? raw.visual_style_preset : "xianxia_cinematic";
  return {
    topic: String(raw?.topic || "").trim(),
    source_type: ["entity", "research_notes", "ai_report", "search_results", "custom"].includes(raw?.source_type) ? raw.source_type : "entity",
    entity_ids: Array.isArray(raw?.entity_ids) ? raw.entity_ids.filter(Boolean).map(String) : [],
    research_note_ids: Array.isArray(raw?.research_note_ids) ? raw.research_note_ids.filter(Boolean).map(String) : [],
    ai_report_id: raw?.ai_report_id ? String(raw.ai_report_id) : null,
    custom_query: raw?.custom_query ? String(raw.custom_query) : "",
    video_type: videoType,
    duration_seconds: duration,
    tone,
    style,
    audience_level: audience,
    special_requirements: raw?.special_requirements ? String(raw.special_requirements) : "",
    visual_style_preset: visualPreset,
    strict_xianxia_visual_mode: raw?.strict_xianxia_visual_mode !== false
  };
}

export async function buildScriptEvidence(novelId: string, input: ScriptGeneratorInput): Promise<ScriptEvidenceBundle> {
  const supabase = getSupabaseServerClient();
  const novel = await getNovelWithChapters(novelId);
  if (!novel) throw new Error("Không tìm thấy truyện.");

  const warnings: string[] = [];
  const sourceReferences: ScriptEvidenceBundle["source_references"] = [];
  const entityProfiles: unknown[] = [];
  const researchNotes: unknown[] = [];
  let report: unknown | null = null;
  const evidenceBlocks: string[] = [];

  if (input.entity_ids.length > 0) {
    const [{ data: entities, error: entityError }, { data: evidence, error: evidenceError }] = await Promise.all([
      supabase.from("entities").select("id,name,entity_type,description,first_appearance_chapter,confidence_score,status").eq("novel_id", novelId).in("id", input.entity_ids),
      supabase.from("entity_evidence").select("id,entity_id,chapter_number,chunk_id,evidence_text,evidence_summary,confidence_score").eq("novel_id", novelId).in("entity_id", input.entity_ids).order("chapter_number", { ascending: true }).limit(80)
    ]);
    if (entityError) throw entityError;
    if (evidenceError) throw evidenceError;
    entityProfiles.push(...(entities ?? []));
    for (const item of evidence ?? []) {
      evidenceBlocks.push(`[entity_evidence ch.${item.chapter_number ?? "?"} chunk:${item.chunk_id ?? "?"}] ${item.evidence_summary || ""}\n${String(item.evidence_text).slice(0, 500)}`);
      sourceReferences.push({ type: "entity_evidence", chapter_number: item.chapter_number, chunk_id: item.chunk_id, summary: item.evidence_summary || String(item.evidence_text).slice(0, 120) });
    }
    if (!evidence?.length) warnings.push("Entity đã chọn chưa có evidence. Không đủ dữ kiện trong nguyên tác.");
  }

  if (input.research_note_ids.length > 0 || input.source_type === "research_notes") {
    let query = supabase.from("research_notes").select("id,title,note_type,content,user_note,chunk_id,chapters(chapter_number,chapter_title)").eq("novel_id", novelId).limit(60);
    if (input.research_note_ids.length > 0) query = query.in("id", input.research_note_ids);
    const { data, error } = await query;
    if (error) throw error;
    researchNotes.push(...(data ?? []));
    for (const note of data ?? []) {
      const chapterNumber = (note as any).chapters?.chapter_number ?? null;
      evidenceBlocks.push(`[research_note ch.${chapterNumber ?? "?"}] ${(note as any).title}\n${String((note as any).content || "").slice(0, 500)}\nGhi chú: ${String((note as any).user_note || "").slice(0, 300)}`);
      sourceReferences.push({ type: "research_note", chapter_number: chapterNumber, chunk_id: (note as any).chunk_id, summary: (note as any).title || String((note as any).content || "").slice(0, 120) });
    }
  }

  if (input.ai_report_id) {
    const { data, error } = await supabase.from("ai_research_reports").select("id,report_type,title,summary,facts_json,warnings_json,source_references_json").eq("novel_id", novelId).eq("id", input.ai_report_id).maybeSingle();
    if (error) throw error;
    report = data;
    if (data) {
      evidenceBlocks.push(`[ai_report] ${data.title}\n${data.summary || ""}\nFACTS:${JSON.stringify(data.facts_json).slice(0, 3000)}`);
      const refs = Array.isArray(data.source_references_json) ? data.source_references_json as any[] : [];
      for (const ref of refs) sourceReferences.push({ type: "ai_report", chapter_number: ref.chapter_number ?? null, chunk_id: ref.chunk_id ?? null, summary: ref.summary || data.title });
    }
  }

  if (input.custom_query) evidenceBlocks.push(`[custom_query] ${input.custom_query.slice(0, 1000)}`);
  if (evidenceBlocks.length === 0) warnings.push("Không có evidence được chọn. Không đủ dữ kiện trong nguyên tác.");

  return { novel_title: novel.title, topic: input.topic || input.custom_query || "Không đủ dữ kiện trong nguyên tác", evidence_text: evidenceBlocks.join("\n\n---\n\n"), entity_profile: entityProfiles, ai_research_report: report, research_notes: researchNotes, source_references: sourceReferences, warnings };
}

export async function createScriptJob(input: { novelId: string; entityId?: string | null; jobType: string; inputData: unknown }) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("script_generation_jobs").insert({ novel_id: input.novelId, entity_id: input.entityId ?? null, job_type: input.jobType, status: "running", input_data: input.inputData }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function completeScriptJob(jobId: string, summary: unknown) {
  await getSupabaseServerClient().from("script_generation_jobs").update({ status: "completed", result_summary: summary, completed_at: new Date().toISOString() }).eq("id", jobId).throwOnError();
}

export async function failScriptJob(jobId: string, message: string) {
  await getSupabaseServerClient().from("script_generation_jobs").update({ status: "failed", error_message: message, completed_at: new Date().toISOString() }).eq("id", jobId).throwOnError();
}

export async function saveGeneratedScript(input: { novelId: string; entityId?: string | null; script: GeneratedScriptPayload; factCheckStatus: ScriptFactCheckStatus; factCheck: unknown }) {
  const supabase = getSupabaseServerClient();
  const status: ScriptStatus = input.factCheckStatus === "passed" ? "ready" : "draft";
  const scriptJson = { ...input.script, fact_check_result: input.factCheck };
  const { data, error } = await supabase.from("video_scripts").insert({ novel_id: input.novelId, entity_id: input.entityId ?? null, title: input.script.title, video_type: input.script.video_type, duration_seconds: input.script.duration_seconds, tone: input.script.tone, style: input.script.style, hook: input.script.hook.text, voice_over: input.script.voice_over, script_json: scriptJson, image_prompts_json: input.script.scenes.map((scene) => scene.image_prompt), video_prompts_json: input.script.scenes.map((scene) => scene.video_prompt), caption: input.script.caption, hashtags_json: input.script.hashtags, source_references_json: input.script.source_references, fact_check_status: input.factCheckStatus, status }).select("id").single();
  if (error) throw error;
  const scriptId = data.id as string;
  const scenes = input.script.scenes.map((scene) => ({ video_script_id: scriptId, novel_id: input.novelId, scene_index: scene.scene_index, start_time: scene.start_time, end_time: scene.end_time, scene_title: scene.scene_title, visual_description: scene.visual_description, voice_text: scene.voice_text, image_prompt: scene.image_prompt, video_prompt: scene.video_prompt, source_reference: scene.source_reference ?? [], xianxia_visual_elements: scene.xianxia_visual_elements ?? [], negative_prompt: scene.negative_prompt, warning: scene.warning ?? null }));
  if (scenes.length > 0) await supabase.from("video_script_scenes").insert(scenes).throwOnError();
  return scriptId;
}

export async function listVideoScripts(novelId: string): Promise<VideoScript[]> {
  const { data, error } = await getSupabaseServerClient().from("video_scripts").select("id,novel_id,entity_id,title,video_type,duration_seconds,tone,style,hook,voice_over,script_json,image_prompts_json,video_prompts_json,caption,hashtags_json,source_references_json,fact_check_status,status,created_at,updated_at,entity:entities(id,name,entity_type)").eq("novel_id", novelId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as any;
}

export async function getVideoScriptDetail(novelId: string, scriptId: string): Promise<{ script: VideoScript | null; scenes: VideoScriptScene[] }> {
  const supabase = getSupabaseServerClient();
  const [{ data: script, error: scriptError }, { data: scenes, error: scenesError }] = await Promise.all([
    supabase.from("video_scripts").select("id,novel_id,entity_id,title,video_type,duration_seconds,tone,style,hook,voice_over,script_json,image_prompts_json,video_prompts_json,caption,hashtags_json,source_references_json,fact_check_status,status,created_at,updated_at,entity:entities(id,name,entity_type)").eq("novel_id", novelId).eq("id", scriptId).maybeSingle(),
    supabase.from("video_script_scenes").select("id,video_script_id,novel_id,scene_index,start_time,end_time,scene_title,visual_description,voice_text,image_prompt,video_prompt,source_reference,xianxia_visual_elements,negative_prompt,warning,created_at").eq("video_script_id", scriptId).order("scene_index", { ascending: true })
  ]);
  if (scriptError) throw scriptError;
  if (scenesError) throw scenesError;
  return { script: script as any, scenes: (scenes ?? []) as any };
}

export async function updateVideoScript(novelId: string, scriptId: string, patch: Partial<Pick<VideoScript, "title" | "status" | "fact_check_status">>) {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.title) payload.title = patch.title;
  if (patch.status && SCRIPT_STATUSES.includes(patch.status)) payload.status = patch.status;
  if (patch.fact_check_status && FACT_CHECK_STATUSES.includes(patch.fact_check_status)) payload.fact_check_status = patch.fact_check_status;
  await getSupabaseServerClient().from("video_scripts").update(payload).eq("novel_id", novelId).eq("id", scriptId).throwOnError();
}

export async function deleteVideoScript(novelId: string, scriptId: string) {
  await getSupabaseServerClient().from("video_scripts").delete().eq("novel_id", novelId).eq("id", scriptId).throwOnError();
}

export async function fetchScriptEvidenceForExistingScript(novelId: string, scriptId: string) {
  const { script } = await getVideoScriptDetail(novelId, scriptId);
  if (!script) throw new Error("Không tìm thấy script.");
  const refs = Array.isArray(script.source_references_json) ? script.source_references_json : [];
  const evidence = refs.map((ref) => `[${ref.type || "source"} ch.${ref.chapter_number ?? "?"} chunk:${ref.chunk_id ?? "?"}] ${ref.summary}`).join("\n");
  return { script, evidence };
}

