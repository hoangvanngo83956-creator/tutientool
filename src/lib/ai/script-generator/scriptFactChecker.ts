import { createJsonChatCompletion } from "@/lib/ai/openaiClient";
import { buildScriptFactCheckPrompt } from "@/lib/ai/prompts/scriptFactCheckPrompt";
import type { ScriptFactCheckResult } from "@/lib/module4-types";

export async function factCheckScript(input: { script: unknown; evidence: string }): Promise<ScriptFactCheckResult> {
  const content = await createJsonChatCompletion({ prompt: buildScriptFactCheckPrompt({ scriptJson: JSON.stringify(input.script), evidence: input.evidence }) });
  return validate(parseJson(content));
}

function parseJson(value: string) { try { return JSON.parse(value); } catch { throw new Error("Script fact checker trả về JSON sai format."); } }
function validate(value: unknown): ScriptFactCheckResult {
  const raw = value as any;
  const checks = Array.isArray(raw?.checks) ? raw.checks : [];
  const overall = ["passed", "needs_review", "failed"].includes(raw?.overall_status) ? raw.overall_status : "needs_review";
  return {
    overall_status: overall,
    checks: checks.slice(0, 30).map((item: any) => ({ claim: String(item.claim || ""), status: ["supported", "weakly_supported", "unsupported"].includes(item.status) ? item.status : "weakly_supported", reason: String(item.reason || "Cần kiểm tra lại."), evidence_reference: item.evidence_reference ? String(item.evidence_reference) : null })),
    warnings: Array.isArray(raw?.warnings) ? raw.warnings.map((item: unknown) => String(item)).slice(0, 20) : [],
    suggested_fixes: Array.isArray(raw?.suggested_fixes) ? raw.suggested_fixes.map((item: unknown) => String(item)).slice(0, 20) : [],
    visual_prompt_check: normalizeVisualPromptCheck(raw?.visual_prompt_check)
  };
}

function normalizeVisualPromptCheck(value: any) {
  const checks = Array.isArray(value?.checks) ? value.checks : [];
  return {
    overall_status: ["passed", "needs_review", "failed"].includes(value?.overall_status) ? value.overall_status : "needs_review",
    checks: checks.slice(0, 20).map((item: any) => ({ scene_index: Number(item.scene_index) || 0, status: ["passed", "needs_review", "failed"].includes(item.status) ? item.status : "needs_review", reason: String(item.reason || "Cần kiểm tra visual prompt."), suggested_fix: String(item.suggested_fix || "") }))
  };
}

