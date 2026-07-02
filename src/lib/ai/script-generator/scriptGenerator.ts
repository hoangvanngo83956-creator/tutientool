import { createJsonChatCompletion } from "@/lib/ai/openaiClient";
import { buildGenerateTikTokScriptPrompt } from "@/lib/ai/prompts/generateTikTokScriptPrompt";
import { enhanceSceneVisualPrompts } from "@/lib/ai/script-generator/visualPromptValidator";
import { SCRIPT_DURATIONS, SCRIPT_STYLES, SCRIPT_TONES, VIDEO_TYPES, type GeneratedScriptPayload, type ScriptEvidenceBundle, type ScriptGeneratorInput } from "@/lib/module4-types";

export async function generateTikTokScript(input: ScriptGeneratorInput & { evidence: ScriptEvidenceBundle }): Promise<GeneratedScriptPayload> {
  const prompt = buildGenerateTikTokScriptPrompt(input);
  const content = await createJsonChatCompletion({ prompt });
  return validateGeneratedScript(parseJson(content), input);
}

function parseJson(value: string) {
  try { return JSON.parse(value); } catch { throw new Error("AI trả về JSON sai format khi tạo kịch bản."); }
}

function validateGeneratedScript(value: unknown, input: ScriptGeneratorInput & { evidence: ScriptEvidenceBundle }): GeneratedScriptPayload {
  if (!value || typeof value !== "object") throw new Error("Script output không phải object JSON.");
  const raw = value as any;
  const scenes = Array.isArray(raw.scenes) ? raw.scenes : [];
  const visualWarnings: string[] = [];
  const firstEntity = Array.isArray(input.evidence.entity_profile) ? (input.evidence.entity_profile[0] as any) : null;

  const validScenes = scenes.map((scene: any, index: number) => {
    const baseScene = {
      scene_index: Number(scene.scene_index) || index + 1,
      start_time: String(scene.start_time || ""),
      end_time: String(scene.end_time || ""),
      scene_title: String(scene.scene_title || `Scene ${index + 1}`).slice(0, 180),
      visual_description: String(scene.visual_description || "Không đủ dữ kiện trong nguyên tác").slice(0, 1000),
      voice_text: String(scene.voice_text || "Không đủ dữ kiện trong nguyên tác").slice(0, 1200),
      xianxia_visual_elements: Array.isArray(scene.xianxia_visual_elements) ? scene.xianxia_visual_elements.map((item: unknown) => String(item)).slice(0, 8) : [],
      image_prompt: String(scene.image_prompt || "Cinematic xianxia fantasy scene, Eastern immortal cultivation world, a mysterious cultivator silhouette, spiritual energy, vertical 9:16 composition, no text, no logo, no watermark."),
      video_prompt: String(scene.video_prompt || "Create a vertical 9:16 cinematic xianxia cultivation video in an Eastern immortal cultivation world, slow camera push-in, spiritual energy flowing, no text, no logo, no watermark."),
      negative_prompt: String(scene.negative_prompt || ""),
      warning: scene.warning ? String(scene.warning) : null,
      source_reference: Array.isArray(scene.source_reference) ? scene.source_reference.slice(0, 5).map(normalizeSourceRef) : []
    };
    const enhanced = enhanceSceneVisualPrompts(baseScene, {
      visualStylePreset: input.visual_style_preset,
      strictMode: input.strict_xianxia_visual_mode,
      entityType: firstEntity?.entity_type ?? null,
      entityName: firstEntity?.name ?? null,
      hasAppearanceEvidence: false
    });
    visualWarnings.push(...enhanced.warnings);
    return enhanced.scene;
  }).slice(0, 12);

  return {
    title: String(raw.title || input.topic || "Không đủ dữ kiện trong nguyên tác").slice(0, 220),
    video_type: VIDEO_TYPES.includes(raw.video_type) ? raw.video_type : input.video_type,
    duration_seconds: SCRIPT_DURATIONS.includes(Number(raw.duration_seconds) as any) ? Number(raw.duration_seconds) as any : input.duration_seconds,
    tone: SCRIPT_TONES.includes(raw.tone) ? raw.tone : input.tone,
    style: SCRIPT_STYLES.includes(raw.style) ? raw.style : input.style,
    hook: { text: String(raw.hook?.text || "Không đủ dữ kiện trong nguyên tác").slice(0, 500), purpose: String(raw.hook?.purpose || "Hook cần được kiểm tra lại theo evidence.").slice(0, 500) },
    voice_over: String(raw.voice_over || validScenes.map((scene: any) => scene.voice_text).join("\n")).slice(0, 6000),
    scenes: validScenes,
    caption: String(raw.caption || "").slice(0, 500),
    hashtags: Array.isArray(raw.hashtags) ? raw.hashtags.map((tag: unknown) => String(tag).trim()).filter(Boolean).slice(0, 12) : ["#tutien", "#tienhiep", "#reviewtruyen"],
    source_references: Array.isArray(raw.source_references) ? raw.source_references.slice(0, 30).map(normalizeSourceRef) : [],
    warnings: [...(Array.isArray(raw.warnings) ? raw.warnings.map((item: unknown) => String(item)).slice(0, 20) : []), ...visualWarnings],
    original_accuracy_checklist: Array.isArray(raw.original_accuracy_checklist) ? raw.original_accuracy_checklist.slice(0, 12).map((item: any) => ({ check: String(item.check || "Kiểm tra nguyên tác"), status: ["passed", "warning", "failed"].includes(item.status) ? item.status : "warning", note: String(item.note || "") })) : []
  };
}

function normalizeSourceRef(ref: any) {
  return { type: ref?.type ? String(ref.type) : "chapter_chunk", chapter_number: ref?.chapter_number == null ? null : Number(ref.chapter_number), chunk_id: ref?.chunk_id ? String(ref.chunk_id) : null, summary: String(ref?.summary || "Nguồn dữ kiện").slice(0, 300) };
}

