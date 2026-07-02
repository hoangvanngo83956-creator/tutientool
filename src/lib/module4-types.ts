export const VIDEO_TYPES = ["character_analysis", "item_analysis", "technique_analysis", "realm_explanation", "sect_explanation", "location_explanation", "event_recap", "comparison", "hidden_detail", "top_list", "custom"] as const;
export const SCRIPT_DURATIONS = [30, 45, 60, 90] as const;
export const SCRIPT_TONES = ["mysterious", "dramatic", "epic", "fast_viral", "storyteller", "analytical", "dark", "emotional"] as const;
export const SCRIPT_STYLES = ["tiktok_viral", "cinematic_narration", "lore_explainer", "dramatic_recap", "short_documentary", "anime_recap_style"] as const;
export const AUDIENCE_LEVELS = ["newbie", "familiar_with_story", "hardcore_fan"] as const;
export const FACT_CHECK_STATUSES = ["pending", "passed", "needs_review", "failed"] as const;
export const SCRIPT_STATUSES = ["draft", "ready", "archived"] as const;
export const VISUAL_STYLE_PRESETS = ["xianxia_cinematic", "dark_cultivation", "immortal_mountain", "ancient_sect", "mystical_artifact", "sword_cultivator", "alchemy_cave", "formation_array"] as const;

export type VideoType = (typeof VIDEO_TYPES)[number];
export type ScriptDuration = (typeof SCRIPT_DURATIONS)[number];
export type ScriptTone = (typeof SCRIPT_TONES)[number];
export type ScriptStyle = (typeof SCRIPT_STYLES)[number];
export type AudienceLevel = (typeof AUDIENCE_LEVELS)[number];
export type ScriptFactCheckStatus = (typeof FACT_CHECK_STATUSES)[number];
export type ScriptStatus = (typeof SCRIPT_STATUSES)[number];
export type VisualStylePreset = (typeof VISUAL_STYLE_PRESETS)[number];

export type SourceReference = {
  type?: "entity_evidence" | "research_note" | "ai_report" | "chapter_chunk" | string;
  chapter_number?: number | null;
  chunk_id?: string | null;
  summary: string;
};

export type ScriptScenePayload = {
  scene_index: number;
  start_time: string;
  end_time: string;
  scene_title: string;
  visual_description: string;
  voice_text: string;
  xianxia_visual_elements: string[];
  image_prompt: string;
  video_prompt: string;
  negative_prompt: string;
  warning?: string | null;
  source_reference: SourceReference[];
};

export type GeneratedScriptPayload = {
  title: string;
  video_type: VideoType;
  duration_seconds: ScriptDuration;
  tone: ScriptTone;
  style: ScriptStyle;
  hook: { text: string; purpose: string };
  voice_over: string;
  scenes: ScriptScenePayload[];
  caption: string;
  hashtags: string[];
  source_references: SourceReference[];
  warnings: string[];
  original_accuracy_checklist: Array<{ check: string; status: "passed" | "warning" | "failed"; note: string }>;
};

export type ScriptFactCheckResult = {
  overall_status: "passed" | "needs_review" | "failed";
  checks: Array<{ claim: string; status: "supported" | "weakly_supported" | "unsupported"; reason: string; evidence_reference?: string | null }>;
  warnings: string[];
  suggested_fixes: string[];
  visual_prompt_check?: {
    overall_status: "passed" | "needs_review" | "failed";
    checks: Array<{ scene_index: number; status: "passed" | "needs_review" | "failed"; reason: string; suggested_fix: string }>;
  };
};

export type VideoScript = {
  id: string;
  novel_id: string;
  entity_id: string | null;
  title: string;
  video_type: VideoType;
  duration_seconds: ScriptDuration;
  tone: ScriptTone;
  style: ScriptStyle;
  hook: string;
  voice_over: string;
  script_json: GeneratedScriptPayload | Record<string, unknown>;
  image_prompts_json: string[];
  video_prompts_json: string[];
  caption: string | null;
  hashtags_json: string[];
  source_references_json: SourceReference[];
  fact_check_status: ScriptFactCheckStatus;
  status: ScriptStatus;
  created_at: string;
  updated_at: string;
  entity?: { id: string; name: string; entity_type: string } | null;
};

export type VideoScriptScene = ScriptScenePayload & {
  id: string;
  video_script_id: string;
  novel_id: string;
  created_at: string;
};

export type ScriptGeneratorInput = {
  topic: string;
  source_type: "entity" | "research_notes" | "ai_report" | "search_results" | "custom";
  entity_ids: string[];
  research_note_ids: string[];
  ai_report_id?: string | null;
  custom_query?: string;
  video_type: VideoType;
  duration_seconds: ScriptDuration;
  tone: ScriptTone;
  style: ScriptStyle;
  audience_level: AudienceLevel;
  special_requirements?: string;
  visual_style_preset: VisualStylePreset;
  strict_xianxia_visual_mode: boolean;
};

export type ScriptEvidenceBundle = {
  novel_title: string;
  topic: string;
  evidence_text: string;
  entity_profile: unknown[];
  ai_research_report: unknown | null;
  research_notes: unknown[];
  source_references: SourceReference[];
  warnings: string[];
};


