import { NextResponse } from "next/server";
import { generateTikTokScript } from "@/lib/ai/script-generator/scriptGenerator";
import { factCheckScript } from "@/lib/ai/script-generator/scriptFactChecker";
import { buildScriptEvidence, completeScriptJob, createScriptJob, failScriptJob, normalizeScriptInput, saveGeneratedScript } from "@/lib/module4-data";

export const runtime = "nodejs";
type RouteProps = { params: Promise<{ novelId: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  const { novelId } = await params;
  const body = await request.json().catch(() => ({}));
  const input = normalizeScriptInput(body);
  if (!input.topic && !input.custom_query) return NextResponse.json({ error: "Vui lòng nhập chủ đề video hoặc custom query." }, { status: 400 });
  if (input.source_type !== "custom" && input.entity_ids.length === 0 && input.research_note_ids.length === 0 && !input.ai_report_id) return NextResponse.json({ error: "Chưa chọn nguồn dữ liệu/evidence." }, { status: 400 });
  const jobId = await createScriptJob({ novelId, entityId: input.entity_ids[0] ?? null, jobType: input.source_type === "research_notes" ? "generate_script_from_research_notes" : input.source_type === "custom" ? "generate_script_from_custom_query" : "generate_script_from_entity", inputData: input });
  try {
    const evidence = await buildScriptEvidence(novelId, input);
    if (!evidence.evidence_text.trim()) throw new Error("Không có evidence. Không đủ dữ kiện trong nguyên tác.");
    const script = await generateTikTokScript({ ...input, evidence });
    const factCheck = await factCheckScript({ script, evidence: evidence.evidence_text });
    const visualStatus = (factCheck as any).visual_prompt_check?.overall_status;
    const finalFactStatus = visualStatus === "failed" ? "failed" : visualStatus === "needs_review" && factCheck.overall_status === "passed" ? "needs_review" : factCheck.overall_status;
    const visualWarnings = visualStatus === "failed" ? ["Prompt hình ảnh/video chưa đúng phong cách tu tiên. Cần regenerate visual prompts."] : [];
    const scriptId = await saveGeneratedScript({ novelId, entityId: input.entity_ids[0] ?? null, script: { ...script, warnings: [...script.warnings, ...evidence.warnings, ...visualWarnings] }, factCheckStatus: finalFactStatus, factCheck });
    await completeScriptJob(jobId, { script_id: scriptId, fact_check_status: finalFactStatus, title: script.title });
    return NextResponse.json({ script_id: scriptId, fact_check_status: finalFactStatus, title: script.title, warnings: [...script.warnings, ...factCheck.warnings, ...evidence.warnings] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generate script thất bại.";
    await failScriptJob(jobId, message).catch(() => undefined);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

