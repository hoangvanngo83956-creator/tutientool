import { buildAnalyzePrompt } from "@/lib/ai/prompts/analyzeCharacterPrompt";
import { createJsonChatCompletion, parseAIJson } from "@/lib/ai/openaiClient";
import type { EntityType } from "@/lib/module3-types";

export async function analyzeEntityWithAI(input: { entityName: string; entityType: EntityType; evidence: string }) {
  const content = await createJsonChatCompletion({
    prompt: buildAnalyzePrompt(input.entityType, input.entityName, input.evidence)
  });

  return parseAIJson(content, "AI analysis returned invalid JSON format.") as any;
}
