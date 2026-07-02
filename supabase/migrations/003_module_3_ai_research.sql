create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  entity_type text not null check (entity_type in ('character', 'item', 'technique', 'realm', 'sect', 'location', 'event', 'other')),
  description text,
  first_appearance_chapter integer,
  confidence_score numeric(4,3) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entities_unique unique (novel_id, normalized_name, entity_type)
);

create table if not exists public.entity_evidence (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.entities(id) on delete cascade,
  novel_id uuid not null references public.novels(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete set null,
  chunk_id uuid references public.chapter_chunks(id) on delete set null,
  chapter_number integer,
  evidence_text text not null,
  evidence_summary text,
  confidence_score numeric(4,3) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.entity_relationships (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  source_entity_id uuid not null references public.entities(id) on delete cascade,
  target_entity_id uuid not null references public.entities(id) on delete cascade,
  relationship_type text not null check (relationship_type in ('owns','uses','learns','belongs_to','enemy_of','ally_of','master_of','disciple_of','appears_in','related_to')),
  description text,
  evidence_text text,
  chapter_id uuid references public.chapters(id) on delete set null,
  chunk_id uuid references public.chapter_chunks(id) on delete set null,
  confidence_score numeric(4,3) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.research_jobs (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  job_type text not null check (job_type in ('extract_entities_from_chapter','extract_entities_from_chunks','analyze_character','analyze_item','analyze_technique','analyze_event','generate_entity_summary')),
  status text not null default 'pending' check (status in ('pending','running','completed','failed')),
  input_data jsonb,
  result_summary jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_research_reports (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  entity_id uuid references public.entities(id) on delete set null,
  report_type text not null check (report_type in ('character_analysis','item_analysis','technique_analysis','realm_analysis','sect_analysis','location_analysis','event_analysis','custom_research')),
  title text not null,
  summary text,
  facts_json jsonb,
  warnings_json jsonb,
  source_references_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entities_novel_type_idx on public.entities (novel_id, entity_type);
create index if not exists entities_novel_status_idx on public.entities (novel_id, status);
create index if not exists entity_evidence_entity_idx on public.entity_evidence (entity_id);
create index if not exists entity_evidence_novel_idx on public.entity_evidence (novel_id, chapter_number);
create index if not exists entity_relationships_source_idx on public.entity_relationships (source_entity_id);
create index if not exists entity_relationships_target_idx on public.entity_relationships (target_entity_id);
create index if not exists research_jobs_novel_idx on public.research_jobs (novel_id, created_at desc);
create index if not exists ai_research_reports_entity_idx on public.ai_research_reports (entity_id, created_at desc);

alter table public.entities enable row level security;
alter table public.entity_evidence enable row level security;
alter table public.entity_relationships enable row level security;
alter table public.research_jobs enable row level security;
alter table public.ai_research_reports enable row level security;