export const ENTITY_TYPES = ["character", "item", "technique", "realm", "sect", "location", "event", "other"] as const;
export const ENTITY_STATUSES = ["draft", "verified", "rejected"] as const;
export const RELATIONSHIP_TYPES = ["owns", "uses", "learns", "belongs_to", "enemy_of", "ally_of", "master_of", "disciple_of", "appears_in", "related_to"] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];
export type EntityStatus = (typeof ENTITY_STATUSES)[number];
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export type Entity = {
  id: string;
  novel_id: string;
  name: string;
  normalized_name: string;
  entity_type: EntityType;
  description: string | null;
  first_appearance_chapter: number | null;
  confidence_score: number;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
  evidence_count?: number;
};

export type EntityEvidence = {
  id: string;
  entity_id: string;
  novel_id: string;
  chapter_id: string | null;
  chunk_id: string | null;
  chapter_number: number | null;
  evidence_text: string;
  evidence_summary: string | null;
  confidence_score: number;
  created_at: string;
};

export type EntityRelationship = {
  id: string;
  novel_id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: RelationshipType;
  description: string | null;
  evidence_text: string | null;
  chapter_id: string | null;
  chunk_id: string | null;
  confidence_score: number;
  created_at: string;
  source_entity?: Pick<Entity, "id" | "name" | "entity_type">;
  target_entity?: Pick<Entity, "id" | "name" | "entity_type">;
};

export type AIResearchReport = {
  id: string;
  novel_id: string;
  entity_id: string | null;
  report_type: string;
  title: string;
  summary: string | null;
  facts_json: unknown;
  warnings_json: unknown;
  source_references_json: unknown;
  created_at: string;
  updated_at: string;
};

export type ResearchJob = {
  id: string;
  novel_id: string;
  job_type: string;
  status: "pending" | "running" | "completed" | "failed";
  input_data: unknown;
  result_summary: unknown;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

export type ExtractedEntityPayload = {
  name: string;
  normalized_name?: string;
  entity_type: EntityType;
  description: string;
  first_appearance_chapter?: number | null;
  confidence_score: number;
  evidence: Array<{
    chapter_number: number;
    chunk_id: string;
    evidence_text: string;
    evidence_summary: string;
  }>;
};

export type ExtractEntitiesResult = {
  entities: ExtractedEntityPayload[];
  relationships: Array<{
    source_entity_name: string;
    target_entity_name: string;
    relationship_type: RelationshipType;
    description: string;
    evidence_text: string;
    confidence_score: number;
  }>;
  warnings: string[];
};