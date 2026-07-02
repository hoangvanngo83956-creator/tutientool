import { XIANXIA_VISUAL_STYLE_SYSTEM } from "@/lib/ai/prompts/xianxiaVisualStylePrompt";

export function buildGenerateImagePromptsPrompt(input?: { scriptJson?: string; evidence?: string }) {
  return `Bạn là AI Prompt Engineer chuyên tạo prompt hình ảnh cho video TikTok/Reels về truyện tu tiên, tiên hiệp.

${XIANXIA_VISUAL_STYLE_SYSTEM}

Luật bắt buộc:
1. Prompt phải có phong cách tu tiên/xianxia rõ ràng.
2. Luôn viết prompt bằng tiếng Anh.
3. Luôn có cụm: cinematic xianxia fantasy, Eastern immortal cultivation world, spiritual energy, vertical 9:16 composition, no text, no logo, no watermark.
4. Không dùng bối cảnh hiện đại.
5. Không dùng fantasy phương Tây.
6. Không dùng chi tiết ngoại hình không có evidence.
7. Nếu nhân vật không có mô tả ngoại hình, dùng silhouette/back view/face hidden.
8. Nếu vật phẩm không có mô tả rõ, dùng "mysterious ancient spiritual artifact".
9. Bối cảnh ưu tiên: misty immortal mountain, ancient cultivation cave, sect training ground, moonlit bamboo forest, floating sword light, glowing formation array, ancient battlefield with spiritual aura, Daoist temple in the clouds.
10. Không thêm chữ vào ảnh.

SCRIPT_JSON:
${input?.scriptJson?.slice(0, 12000) || ""}

EVIDENCE:
${input?.evidence?.slice(0, 12000) || ""}

Output JSON: {"prompts":[{"scene_index":1,"image_prompt":"...","negative_prompt":"modern city, modern clothing, cars, phones, guns, western castle, knight armor, sci-fi, cyberpunk, realistic office, text, logo, watermark","warning":"Nếu có dữ kiện hình ảnh chưa rõ"}]}`;
}
