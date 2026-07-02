create table if not exists public.video_scripts (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  entity_id uuid null references public.entities(id) on delete set null,
  title text not null,
  video_type text not null check (video_type in ('character_analysis','item_analysis','technique_analysis','realm_explanation','sect_explanation','location_explanation','event_recap','comparison','hidden_detail','top_list','custom')),
  duration_seconds integer not null check (duration_seconds in (30,45,60,90)),
  tone text not null check (tone in ('mysterious','dramatic','epic','fast_viral','storyteller','analytical','dark','emotional')),
  style text not null check (style in ('tiktok_viral','cinematic_narration','lore_explainer','dramatic_recap','short_documentary','anime_recap_style')),
  hook text not null,
  voice_over text not null,
  script_json jsonb not null default '{}'::jsonb,
  image_prompts_json jsonb not null default '[]'::jsonb,
  video_prompts_json jsonb not null default '[]'::jsonb,
  caption text,
  hashtags_json jsonb not null default '[]'::jsonb,
  source_references_json jsonb not null default '[]'::jsonb,
  fact_check_status text not null default 'pending' check (fact_check_status in ('pending','passed','needs_review','failed')),
  status text not null default 'draft' check (status in ('draft','ready','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_script_scenes (
  id uuid primary key default gen_random_uuid(),
  video_script_id uuid not null references public.video_scripts(id) on delete cascade,
  novel_id uuid not null references public.novels(id) on delete cascade,
  scene_index integer not null,
  start_time text not null,
  end_time text not null,
  scene_title text not null,
  visual_description text,
  voice_text text,
  image_prompt text,
  video_prompt text,
  source_reference jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(video_script_id, scene_index)
);

create table if not exists public.script_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  entity_id uuid null references public.entities(id) on delete set null,
  job_type text not null check (job_type in ('generate_script_from_entity','generate_script_from_research_notes','generate_script_from_custom_query','regenerate_hook','regenerate_scenes','fact_check_script')),
  status text not null default 'pending' check (status in ('pending','running','completed','failed')),
  input_data jsonb not null default '{}'::jsonb,
  result_summary jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_video_scripts_novel_id on public.video_scripts(novel_id, created_at desc);
create index if not exists idx_video_scripts_entity_id on public.video_scripts(entity_id) where entity_id is not null;
create index if not exists idx_video_scripts_filters on public.video_scripts(novel_id, video_type, fact_check_status, status);
create index if not exists idx_video_script_scenes_script_id on public.video_script_scenes(video_script_id, scene_index);
create index if not exists idx_script_generation_jobs_novel_id on public.script_generation_jobs(novel_id, created_at desc);

alter table public.video_scripts enable row level security;
alter table public.video_script_scenes enable row level security;
alter table public.script_generation_jobs enable row level security;

drop policy if exists "Allow service role video_scripts" on public.video_scripts;
create policy "Allow service role video_scripts" on public.video_scripts for all using (true) with check (true);
drop policy if exists "Allow service role video_script_scenes" on public.video_script_scenes;
create policy "Allow service role video_script_scenes" on public.video_script_scenes for all using (true) with check (true);
drop policy if exists "Allow service role script_generation_jobs" on public.script_generation_jobs;
create policy "Allow service role script_generation_jobs" on public.script_generation_jobs for all using (true) with check (true);

