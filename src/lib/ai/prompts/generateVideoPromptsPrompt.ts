import { XIANXIA_VISUAL_STYLE_SYSTEM } from "@/lib/ai/prompts/xianxiaVisualStylePrompt";

export function buildGenerateVideoPromptsPrompt(input?: { scriptJson?: string; evidence?: string }) {
  return `Bạn là AI Prompt Engineer chuyên tạo prompt video cho VEO hoặc công cụ tạo video AI về truyện tu tiên, tiên hiệp.

${XIANXIA_VISUAL_STYLE_SYSTEM}

Luật bắt buộc:
1. Prompt phải bằng tiếng Anh.
2. Luôn có cụm: vertical 9:16 cinematic xianxia cultivation video, Eastern immortal cultivation world, spiritual energy, no text, no logo, no watermark.
3. Mỗi prompt phải có chuyển động camera: slow push-in, slow orbit, crane shot, tracking shot, close-up reveal, dramatic zoom-in.
4. Mỗi prompt phải có chuyển động tu tiên: qi energy flowing, mist drifting, glowing runes rotating, sword light passing through the air, formation array pulsing, robe sleeves moving in the wind, spiritual particles floating.
5. Không dùng cảnh hiện đại.
6. Không dùng fantasy phương Tây.
7. Không thêm nhân vật hoặc hành động ngoài evidence.
8. Nếu không rõ ngoại hình nhân vật, dùng góc quay sau lưng, silhouette, close-up tay, hoặc che mặt bằng bóng tối/sương.
9. Mỗi cảnh nên phù hợp 3-8 giây.
10. Không có subtitle, text overlay, logo, watermark.

SCRIPT_JSON:
${input?.scriptJson?.slice(0, 12000) || ""}

EVIDENCE:
${input?.evidence?.slice(0, 12000) || ""}

Output JSON: {"prompts":[{"scene_index":1,"video_prompt":"...","negative_prompt":"modern city, modern clothing, cars, phones, guns, western castle, knight armor, sci-fi, cyberpunk, text, logo, watermark","warning":"Nếu có dữ kiện hình ảnh chưa rõ"}]}`;
}
