export function buildRegenerateScenePrompt(input: { sceneIndex: number; scriptJson: string; evidence: string }) {
  return `Tạo lại scene_index ${input.sceneIndex} cho kịch bản TikTok. Chỉ dùng evidence, không thêm dữ kiện mới. Prompt ảnh/video bằng tiếng Anh, vertical 9:16, no text, no logo, no watermark. Trả JSON đúng object scene.

SCRIPT:${input.scriptJson.slice(0, 10000)}
EVIDENCE:${input.evidence.slice(0, 12000)}`;
}
