import { buildFactCheckPrompt } from "@/lib/ai/prompts/factCheckPrompt";
import { createJsonChatCompletion } from "@/lib/ai/openaiClient";

export async function factCheckReport(input: { report: unknown; evidence: string }) {
  const content = await createJsonChatCompletion({
    prompt: buildFactCheckPrompt({ reportJson: JSON.stringify(input.report), evidence: input.evidence })
  });

  try {
    return JSON.parse(content) as any;
  } catch {
    throw new Error("Fact checker trả về JSON sai format.");
  }
}
