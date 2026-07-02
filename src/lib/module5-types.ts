import type { ScriptStyle, ScriptTone, VideoType } from "@/lib/module4-types";

export const SERIES_TYPES = ["character_series", "item_series", "technique_series", "realm_series", "sect_series", "event_series", "hidden_detail_series", "comparison_series", "beginner_guide_series", "lore_explainer_series", "custom_series"] as const;
export const SERIES_STATUSES = ["draft", "active", "paused", "completed", "archived"] as const;
export const IDEA_VIDEO_TYPES = ["character_analysis", "item_analysis", "technique_analysis", "realm_explanation", "sect_explanation", "location_explanation", "event_recap", "comparison", "hidden_detail", "top_list", "beginner_guide", "custom"] as const;
export const IDEA_STATUSES = ["idea", "approved", "script_generated", "image_prompt_ready", "video_prompt_ready", "recording", "editing", "scheduled", "published", "skipped", "archived"] as const;
export const CALENDAR_PLATFORMS = ["tiktok", "reels", "youtube_shorts", "facebook_reels", "multi_platform"] as const;
export const CALENDAR_STATUSES = ["planned", "script_needed", "asset_needed", "ready", "scheduled", "published", "delayed", "cancelled"] as const;
export const TASK_TYPES = ["research", "script", "image_generation", "video_generation", "voice_over", "editing", "subtitle", "caption", "posting", "review", "other"] as const;
export const TASK_STATUSES = ["todo", "doing", "done", "blocked", "skipped"] as const;

export type SeriesType = (typeof SERIES_TYPES)[number];
export type SeriesStatus = (typeof SERIES_STATUSES)[number];
export type IdeaVideoType = (typeof IDEA_VIDEO_TYPES)[number];
export type IdeaStatus = (typeof IDEA_STATUSES)[number];
export type CalendarPlatform = (typeof CALENDAR_PLATFORMS)[number];
export type CalendarStatus = (typeof CALENDAR_STATUSES)[number];
export type TaskType = (typeof TASK_TYPES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type Audience = "newbie" | "familiar_with_story" | "hardcore_fan";

export type PlannerSourceReference = { type: string; id?: string | null; chapter_number?: number | null; summary: string };

export type ContentSeries = { id: string; novel_id: string; title: string; description: string | null; series_type: SeriesType; target_audience: Audience; tone: ScriptTone; style: ScriptStyle; total_planned_videos: number; status: SeriesStatus; created_at: string; updated_at: string; idea_count?: number };
export type ContentIdea = { id: string; novel_id: string; series_id: string | null; title: string; topic: string; video_type: IdeaVideoType; suggested_duration_seconds: number; hook_angle: string | null; content_summary: string | null; related_entity_ids_json: string[]; related_research_note_ids_json: string[]; related_report_ids_json: string[]; source_references_json: PlannerSourceReference[]; priority_score: number; viral_score: number; originality_score: number; evidence_strength_score: number; warning_notes_json: string[]; status: IdeaStatus; created_at: string; updated_at: string; series?: Pick<ContentSeries, "id" | "title"> | null };
export type ContentCalendarItem = { id: string; novel_id: string; series_id: string | null; content_idea_id: string | null; video_script_id: string | null; publish_date: string; publish_time: string; platform: CalendarPlatform; title: string; caption: string | null; hashtags_json: string[]; status: CalendarStatus; notes: string | null; created_at: string; updated_at: string; series?: Pick<ContentSeries, "id" | "title"> | null; idea?: Pick<ContentIdea, "id" | "title" | "status"> | null };
export type ProductionTask = { id: string; novel_id: string; content_idea_id: string | null; video_script_id: string | null; calendar_item_id: string | null; task_title: string; task_type: TaskType; assigned_to: string | null; status: TaskStatus; due_date: string | null; notes: string | null; created_at: string; updated_at: string; idea?: Pick<ContentIdea, "id" | "title" | "status"> | null };

export type GenerateSeriesInput = { channel_goal: string; number_of_series: number; videos_per_series: number; target_audience: Audience; tone: ScriptTone; style: ScriptStyle; default_duration_seconds: number; special_requirements?: string };
export type GenerateIdeasInput = { series_id?: string | null; number_of_ideas: number; video_type: IdeaVideoType | "all"; duration_seconds: number; target_audience: Audience; tone: ScriptTone; style: ScriptStyle; source_scope: string };
export type GenerateCalendarInput = { start_date: string; end_date: string; posts_per_day: number; preferred_publish_times: string[]; platforms: CalendarPlatform[]; selected_series_ids: string[]; selected_idea_ids: string[]; strategy: string };
