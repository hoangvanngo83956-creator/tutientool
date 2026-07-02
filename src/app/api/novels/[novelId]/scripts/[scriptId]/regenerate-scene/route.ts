import { NextResponse } from "next/server";
import { createJsonChatCompletion, parseAIJson } from "@/lib/ai/openaiClient";
import { buildRegenerateScenePrompt } from "@/lib/ai/prompts/regenerateScenePrompt";
import { fetchScriptEvidenceForExistingScript } from "@/lib/module4-data";

export const runtime = "nodejs";
type RouteProps = { params: Promise<{ novelId: string; scriptId: string }> };
export async function POST(request: Request, { params }: RouteProps) {
  const { novelId, scriptId } = await params;
  const body = await request.json().catch(() => ({}));
  const sceneIndex = Number(body.scene_index) || 1;
  const { script, evidence } = await fetchScriptEvidenceForExistingScript(novelId, scriptId);
  const content = await createJsonChatCompletion({ prompt: buildRegenerateScenePrompt({ sceneIndex, scriptJson: JSON.stringify(script.script_json), evidence }) });
  return NextResponse.json({ scene: parseAIJson(content, "AI returned invalid JSON format while regenerating scene.") });
}
