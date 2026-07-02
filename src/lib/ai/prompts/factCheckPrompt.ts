export function buildFactCheckPrompt(input: { reportJson: string; evidence: string }) {
  return `Kiểm tra report AI dưới đây với evidence gốc. Không dùng kiến thức ngoài.

Report JSON:
${input.reportJson}

Evidence gốc:
${input.evidence}

Trả JSON không markdown:
{
  "fact_check_result": [
    { "claim": "Dữ kiện AI đưa ra", "status": "supported | weakly_supported | unsupported", "reason": "Lý do", "evidence_reference": "chapter/chunk nếu có" }
  ],
  "overall_status": "passed | needs_review | failed",
  "warnings": []
}`;
}