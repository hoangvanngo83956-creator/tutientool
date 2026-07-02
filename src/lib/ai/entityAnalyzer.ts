import { buildAnalyzePrompt } from "@/lib/ai/prompts/analyzeCharacterPrompt";
import { createJsonChatCompletion } from "@/lib/ai/openaiClient";
import type { EntityType } from "@/lib/module3-types";

export async function analyzeEntityWithAI(input: { entityName: string; entityType: EntityType; evidence: string }) {
  const content = await createJsonChatCompletion({
    prompt: buildAnalyzePrompt(input.entityType, input.entityName, input.evidence)
  });

  try {
    return JSON.parse(content) as any;
  } catch {
    throw new Error("AI analysis trả về JSON sai format.");
  }
}
