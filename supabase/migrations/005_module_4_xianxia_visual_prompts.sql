alter table public.video_script_scenes
  add column if not exists xianxia_visual_elements jsonb not null default '[]'::jsonb,
  add column if not exists negative_prompt text,
  add column if not exists warning text;
