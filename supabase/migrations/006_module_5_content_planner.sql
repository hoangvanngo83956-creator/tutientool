create table if not exists public.content_series (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  title text not null,
  description text,
  series_type text not null check (series_type in ('character_series','item_series','technique_series','realm_series','sect_series','event_series','hidden_detail_series','comparison_series','beginner_guide_series','lore_explainer_series','custom_series')),
  target_audience text not null check (target_audience in ('newbie','familiar_with_story','hardcore_fan')),
  tone text not null check (tone in ('mysterious','dramatic','epic','fast_viral','storyteller','analytical','dark','emotional')),
  style text not null check (style in ('tiktok_viral','cinematic_narration','lore_explainer','dramatic_recap','short_documentary','anime_recap_style')),
  total_planned_videos integer not null default 0,
  status text not null default 'draft' check (status in ('draft','active','paused','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_ideas (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  series_id uuid null references public.content_series(id) on delete set null,
  title text not null,
  topic text not null,
  video_type text not null check (video_type in ('character_analysis','item_analysis','technique_analysis','realm_explanation','sect_explanation','location_explanation','event_recap','comparison','hidden_detail','top_list','beginner_guide','custom')),
  suggested_duration_seconds integer not null default 60,
  hook_angle text,
  content_summary text,
  related_entity_ids_json jsonb not null default '[]'::jsonb,
  related_research_note_ids_json jsonb not null default '[]'::jsonb,
  related_report_ids_json jsonb not null default '[]'::jsonb,
  source_references_json jsonb not null default '[]'::jsonb,
  priority_score integer not null default 5 check (priority_score between 1 and 10),
  viral_score integer not null default 5 check (viral_score between 1 and 10),
  originality_score integer not null default 5 check (originality_score between 1 and 10),
  evidence_strength_score integer not null default 5 check (evidence_strength_score between 1 and 10),
  warning_notes_json jsonb not null default '[]'::jsonb,
  status text not null default 'idea' check (status in ('idea','approved','script_generated','image_prompt_ready','video_prompt_ready','recording','editing','scheduled','published','skipped','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_calendar_items (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  series_id uuid null references public.content_series(id) on delete set null,
  content_idea_id uuid null references public.content_ideas(id) on delete set null,
  video_script_id uuid null references public.video_scripts(id) on delete set null,
  publish_date date not null,
  publish_time time not null default '20:00',
  platform text not null default 'tiktok' check (platform in ('tiktok','reels','youtube_shorts','facebook_reels','multi_platform')),
  title text not null,
  caption text,
  hashtags_json jsonb not null default '[]'::jsonb,
  status text not null default 'planned' check (status in ('planned','script_needed','asset_needed','ready','scheduled','published','delayed','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.production_tasks (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  content_idea_id uuid null references public.content_ideas(id) on delete cascade,
  video_script_id uuid null references public.video_scripts(id) on delete cascade,
  calendar_item_id uuid null references public.content_calendar_items(id) on delete cascade,
  task_title text not null,
  task_type text not null check (task_type in ('research','script','image_generation','video_generation','voice_over','editing','subtitle','caption','posting','review','other')),
  assigned_to text,
  status text not null default 'todo' check (status in ('todo','doing','done','blocked','skipped')),
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_batches (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  batch_name text not null,
  batch_type text not null check (batch_type in ('generate_ideas','generate_series','generate_calendar','generate_scripts_from_ideas','weekly_plan','monthly_plan')),
  input_data jsonb not null default '{}'::jsonb,
  result_summary jsonb,
  total_ideas_generated integer not null default 0,
  total_scripts_generated integer not null default 0,
  status text not null default 'pending' check (status in ('pending','running','completed','failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_content_series_novel on public.content_series(novel_id, created_at desc);
create index if not exists idx_content_ideas_novel on public.content_ideas(novel_id, created_at desc);
create index if not exists idx_content_ideas_series on public.content_ideas(series_id) where series_id is not null;
create index if not exists idx_content_ideas_status_scores on public.content_ideas(novel_id, status, priority_score desc, evidence_strength_score desc);
create index if not exists idx_content_calendar_novel_date on public.content_calendar_items(novel_id, publish_date, publish_time);
create index if not exists idx_production_tasks_novel_status on public.production_tasks(novel_id, status, due_date);
create index if not exists idx_content_batches_novel on public.content_batches(novel_id, created_at desc);

alter table public.content_series enable row level security;
alter table public.content_ideas enable row level security;
alter table public.content_calendar_items enable row level security;
alter table public.production_tasks enable row level security;
alter table public.content_batches enable row level security;

drop policy if exists "Allow service role content_series" on public.content_series;
create policy "Allow service role content_series" on public.content_series for all using (true) with check (true);
drop policy if exists "Allow service role content_ideas" on public.content_ideas;
create policy "Allow service role content_ideas" on public.content_ideas for all using (true) with check (true);
drop policy if exists "Allow service role content_calendar_items" on public.content_calendar_items;
create policy "Allow service role content_calendar_items" on public.content_calendar_items for all using (true) with check (true);
drop policy if exists "Allow service role production_tasks" on public.production_tasks;
create policy "Allow service role production_tasks" on public.production_tasks for all using (true) with check (true);
drop policy if exists "Allow service role content_batches" on public.content_batches;
create policy "Allow service role content_batches" on public.content_batches for all using (true) with check (true);
