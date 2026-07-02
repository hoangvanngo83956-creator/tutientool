export function buildScriptFactCheckPrompt(input: { scriptJson: string; evidence: string }) {
  return `Bạn là AI Fact Checker kiểm tra kịch bản TikTok/Reels về truyện tu tiên.

Luật:
- Chỉ dùng EVIDENCE để kiểm tra.
- Nếu claim không có evidence, đánh dấu unsupported.
- Nếu claim suy diễn nhẹ, đánh dấu weakly_supported.
- Nếu có unsupported claim quan trọng, overall_status = failed.
- Không dùng kiến thức ngoài truyện.

SCRIPT_JSON:
${input.scriptJson.slice(0, 20000)}

EVIDENCE:
${input.evidence.slice(0, 24000)}

Kiểm tra thêm visual prompts:
1. Có đúng phong cách tu tiên/xianxia không?
2. Có bối cảnh hiện đại không?
3. Có fantasy phương Tây như castle/knight/medieval/dragon không?
4. Có sci-fi/cyberpunk/robot không?
5. Có text/logo/watermark không?
6. Có tự bịa ngoại hình nếu evidence không mô tả rõ không?

Trả về JSON thuần đúng schema:
{
  "overall_status": "passed | needs_review | failed",
  "checks": [{ "claim": "Nội dung/kết luận", "status": "supported | weakly_supported | unsupported", "reason": "Lý do", "evidence_reference": "chapter/chunk/entity evidence nếu có" }],
  "warnings": [],
  "suggested_fixes": [],
  "visual_prompt_check": {
    "overall_status": "passed | needs_review | failed",
    "checks": [{ "scene_index": 1, "status": "passed | needs_review | failed", "reason": "Lý do", "suggested_fix": "Prompt sửa lại nếu cần" }]
  }
}`;
}

