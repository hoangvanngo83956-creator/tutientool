create table if not exists public.youtube_videos (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  source_script_id uuid null references public.video_scripts(id) on delete set null,
  source_content_idea_id uuid null references public.content_ideas(id) on delete set null,
  source_series_id uuid null references public.content_series(id) on delete set null,
  video_format text not null check (video_format in ('long_form','short','livestream_outline','community_post','playlist_intro')),
  title text not null,
  working_title text,
  video_type text not null check (video_type in ('character_analysis','item_analysis','technique_analysis','realm_explanation','sect_explanation','location_explanation','event_recap','comparison','lore_explainer','timeline_analysis','beginner_guide','top_list','hidden_detail','story_arc_explainer','custom')),
  duration_target_minutes integer,
  duration_target_seconds integer,
  audience_level text not null default 'newbie' check (audience_level in ('newbie','familiar_with_story','hardcore_fan')),
  tone text not null default 'mysterious',
  style text not null default 'cinematic_narration',
  script_text text,
  script_json jsonb not null default '{}'::jsonb,
  hook text,
  intro text,
  body text,
  conclusion text,
  chapters_json jsonb not null default '[]'::jsonb,
  thumbnail_prompts_json jsonb not null default '[]'::jsonb,
  seo_metadata_json jsonb not null default '{}'::jsonb,
  shorts_cutdowns_json jsonb not null default '[]'::jsonb,
  source_references_json jsonb not null default '[]'::jsonb,
  fact_check_status text not null default 'pending' check (fact_check_status in ('pending','passed','needs_review','failed')),
  visual_check_status text not null default 'pending' check (visual_check_status in ('pending','passed','needs_review','failed')),
  production_status text not null default 'idea' check (production_status in ('idea','scripting','script_ready','thumbnail_ready','voice_over_ready','editing','ready_to_upload','uploaded','archived')),
  youtube_status text not null default 'draft' check (youtube_status in ('draft','scheduled','published','unlisted','private','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.youtube_seo_packages (
  id uuid primary key default gen_random_uuid(),
  youtube_video_id uuid not null references public.youtube_videos(id) on delete cascade,
  novel_id uuid not null references public.novels(id) on delete cascade,
  primary_title text not null,
  alternative_titles_json jsonb not null default '[]'::jsonb,
  description text,
  tags_json jsonb not null default '[]'::jsonb,
  hashtags_json jsonb not null default '[]'::jsonb,
  chapters_text text,
  pinned_comment text,
  playlist_suggestion text,
  target_keywords_json jsonb not null default '[]'::jsonb,
  search_intent text,
  seo_score integer not null default 5 check (seo_score between 1 and 10),
  click_score integer not null default 5 check (click_score between 1 and 10),
  retention_score integer not null default 5 check (retention_score between 1 and 10),
  warning_notes_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.youtube_thumbnail_concepts (
  id uuid primary key default gen_random_uuid(),
  youtube_video_id uuid not null references public.youtube_videos(id) on delete cascade,
  novel_id uuid not null references public.novels(id) on delete cascade,
  title text not null,
  concept_summary text,
  thumbnail_text text,
  image_prompt text not null,
  negative_prompt text,
  layout_type text not null default 'cinematic_scene' check (layout_type in ('character_closeup','artifact_focus','split_comparison','battle_scene','mysterious_silhouette','sect_background','text_heavy','cinematic_scene')),
  emotion_angle text,
  visual_style_preset text not null default 'xianxia_cinematic',
  source_references_json jsonb not null default '[]'::jsonb,
  warning_notes_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.youtube_shorts_cutdowns (
  id uuid primary key default gen_random_uuid(),
  youtube_video_id uuid not null references public.youtube_videos(id) on delete cascade,
  novel_id uuid not null references public.novels(id) on delete cascade,
  title text not null,
  short_hook text,
  source_start_time text,
  source_end_time text,
  duration_seconds integer not null default 60,
  short_script text,
  image_prompt text,
  video_prompt text,
  caption text,
  hashtags_json jsonb not null default '[]'::jsonb,
  source_reference jsonb not null default '{}'::jsonb,
  status text not null default 'idea' check (status in ('idea','script_ready','asset_ready','scheduled','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.youtube_playlists (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  title text not null,
  description text,
  playlist_type text not null check (playlist_type in ('character_playlist','item_playlist','technique_playlist','realm_playlist','lore_playlist','timeline_playlist','beginner_guide_playlist','full_series_playlist','custom')),
  target_audience text not null default 'newbie',
  video_order_strategy text not null default 'beginner_to_advanced',
  status text not null default 'draft' check (status in ('draft','active','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.youtube_upload_checklists (
  id uuid primary key default gen_random_uuid(),
  youtube_video_id uuid not null references public.youtube_videos(id) on delete cascade,
  novel_id uuid not null references public.novels(id) on delete cascade,
  checklist_json jsonb not null default '[]'::jsonb,
  overall_status text not null default 'incomplete' check (overall_status in ('incomplete','ready','needs_review','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_youtube_videos_novel on public.youtube_videos(novel_id, created_at desc);
create index if not exists idx_youtube_videos_status on public.youtube_videos(novel_id, video_format, production_status, youtube_status);
create index if not exists idx_youtube_seo_video on public.youtube_seo_packages(youtube_video_id);
create index if not exists idx_youtube_thumbnails_video on public.youtube_thumbnail_concepts(youtube_video_id);
create index if not exists idx_youtube_shorts_video on public.youtube_shorts_cutdowns(youtube_video_id);
create index if not exists idx_youtube_playlists_novel on public.youtube_playlists(novel_id, created_at desc);

alter table public.youtube_videos enable row level security;
alter table public.youtube_seo_packages enable row level security;
alter table public.youtube_thumbnail_concepts enable row level security;
alter table public.youtube_shorts_cutdowns enable row level security;
alter table public.youtube_playlists enable row level security;
alter table public.youtube_upload_checklists enable row level security;

drop policy if exists "Allow service role youtube_videos" on public.youtube_videos;
create policy "Allow service role youtube_videos" on public.youtube_videos for all using (true) with check (true);
drop policy if exists "Allow service role youtube_seo_packages" on public.youtube_seo_packages;
create policy "Allow service role youtube_seo_packages" on public.youtube_seo_packages for all using (true) with check (true);
drop policy if exists "Allow service role youtube_thumbnail_concepts" on public.youtube_thumbnail_concepts;
create policy "Allow service role youtube_thumbnail_concepts" on public.youtube_thumbnail_concepts for all using (true) with check (true);
drop policy if exists "Allow service role youtube_shorts_cutdowns" on public.youtube_shorts_cutdowns;
create policy "Allow service role youtube_shorts_cutdowns" on public.youtube_shorts_cutdowns for all using (true) with check (true);
drop policy if exists "Allow service role youtube_playlists" on public.youtube_playlists;
create policy "Allow service role youtube_playlists" on public.youtube_playlists for all using (true) with check (true);
drop policy if exists "Allow service role youtube_upload_checklists" on public.youtube_upload_checklists;
create policy "Allow service role youtube_upload_checklists" on public.youtube_upload_checklists for all using (true) with check (true);
