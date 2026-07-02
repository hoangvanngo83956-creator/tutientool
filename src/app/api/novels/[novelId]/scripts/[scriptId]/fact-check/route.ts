import { NextResponse } from "next/server";
import { factCheckScript } from "@/lib/ai/script-generator/scriptFactChecker";
import { fetchScriptEvidenceForExistingScript, updateVideoScript } from "@/lib/module4-data";

export const runtime = "nodejs";
type RouteProps = { params: Promise<{ novelId: string; scriptId: string }> };
export async function POST(_request: Request, { params }: RouteProps) {
  const { novelId, scriptId } = await params;
  const { script, evidence } = await fetchScriptEvidenceForExistingScript(novelId, scriptId);
  const factCheck = await factCheckScript({ script: script.script_json, evidence });
  await updateVideoScript(novelId, scriptId, { fact_check_status: factCheck.overall_status });
  return NextResponse.json({ fact_check_status: factCheck.overall_status, fact_check: factCheck });
}
