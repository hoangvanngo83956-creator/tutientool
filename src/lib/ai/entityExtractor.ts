import { createJsonChatCompletion, parseAIJson } from "@/lib/ai/openaiClient";
import { buildExtractEntitiesPrompt } from "@/lib/ai/prompts/extractEntitiesPrompt";
import { ENTITY_TYPES, RELATIONSHIP_TYPES, type EntityType, type ExtractEntitiesResult } from "@/lib/module3-types";

type AIChunk = { id: string; chapter_number: number; chunk_index: number; content: string };

export async function extractEntitiesWithAI(input: { novelTitle: string; chunks: AIChunk[]; entityTypes: EntityType[] | "all" }): Promise<ExtractEntitiesResult> {
  const prompt = buildExtractEntitiesPrompt(input);
  const content = await createJsonChatCompletion({ prompt });
  return validateExtractEntitiesResult(parseAIJson(content, "AI returned invalid JSON format."));
}


function validateExtractEntitiesResult(value: unknown): ExtractEntitiesResult {
  if (!value || typeof value !== "object") throw new Error("AI output không phải object JSON.");
  const raw = value as any;
  const entities = Array.isArray(raw.entities) ? raw.entities : [];
  const relationships = Array.isArray(raw.relationships) ? raw.relationships : [];
  const warnings = Array.isArray(raw.warnings) ? raw.warnings.filter((item: unknown) => typeof item === "string") : [];

  return {
    entities: entities
      .filter((item: any) => item?.name && item?.entity_type && ENTITY_TYPES.includes(item.entity_type))
      .map((item: any) => ({
        name: String(item.name).slice(0, 160),
        normalized_name: typeof item.normalized_name === "string" ? item.normalized_name.slice(0, 180) : undefined,
        entity_type: item.entity_type,
        description: String(item.description || "Không đủ dữ kiện trong nguyên tác").slice(0, 900),
        first_appearance_chapter: Number.isFinite(Number(item.first_appearance_chapter)) ? Number(item.first_appearance_chapter) : null,
        confidence_score: clampScore(Number(item.confidence_score)),
        evidence: Array.isArray(item.evidence)
          ? item.evidence
              .filter((evidence: any) => evidence?.chunk_id && evidence?.evidence_text)
              .map((evidence: any) => ({
                chapter_number: Number(evidence.chapter_number) || 0,
                chunk_id: String(evidence.chunk_id),
                evidence_text: String(evidence.evidence_text).slice(0, 500),
                evidence_summary: String(evidence.evidence_summary || "").slice(0, 500)
              }))
          : []
      }))
      .filter((item: any) => item.evidence.length > 0),
    relationships: relationships
      .filter((item: any) => item?.source_entity_name && item?.target_entity_name && RELATIONSHIP_TYPES.includes(item.relationship_type))
      .map((item: any) => ({
        source_entity_name: String(item.source_entity_name),
        target_entity_name: String(item.target_entity_name),
        relationship_type: item.relationship_type,
        description: String(item.description || ""),
        evidence_text: String(item.evidence_text || "").slice(0, 500),
        confidence_score: clampScore(Number(item.confidence_score))
      })),
    warnings
  };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
