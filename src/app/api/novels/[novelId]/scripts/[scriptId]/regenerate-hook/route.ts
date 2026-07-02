import { NextResponse } from "next/server";
import { createJsonChatCompletion } from "@/lib/ai/openaiClient";
import { buildRegenerateHookPrompt } from "@/lib/ai/prompts/regenerateHookPrompt";
import { fetchScriptEvidenceForExistingScript } from "@/lib/module4-data";

export const runtime = "nodejs";
type RouteProps = { params: Promise<{ novelId: string; scriptId: string }> };
export async function POST(_request: Request, { params }: RouteProps) {
  const { novelId, scriptId } = await params;
  const { script, evidence } = await fetchScriptEvidenceForExistingScript(novelId, scriptId);
  const content = await createJsonChatCompletion({ prompt: buildRegenerateHookPrompt({ scriptJson: JSON.stringify(script.script_json), evidence }) });
  const payload = JSON.parse(content) as { hook?: { text?: string; purpose?: string } };
  return NextResponse.json({ hook: payload.hook ?? { text: script.hook, purpose: "Giữ hook cũ vì AI không trả hook hợp lệ." } });
}
