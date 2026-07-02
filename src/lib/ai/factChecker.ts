import { buildFactCheckPrompt } from "@/lib/ai/prompts/factCheckPrompt";
import { createJsonChatCompletion, parseAIJson } from "@/lib/ai/openaiClient";

export async function factCheckReport(input: { report: unknown; evidence: string }) {
  const content = await createJsonChatCompletion({
    prompt: buildFactCheckPrompt({ reportJson: JSON.stringify(input.report), evidence: input.evidence })
  });

  return parseAIJson(content, "Fact checker returned invalid JSON format.") as any;
}
