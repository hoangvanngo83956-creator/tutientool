export function buildRegenerateHookPrompt(input: { scriptJson: string; evidence: string }) {
  return `Tạo lại hook TikTok 3 giây đầu cho kịch bản sau. Chỉ dùng evidence, không thêm dữ kiện mới. Trả JSON: {"hook":{"text":"...","purpose":"..."}}

SCRIPT:${input.scriptJson.slice(0, 10000)}
EVIDENCE:${input.evidence.slice(0, 12000)}`;
}
