import type { ScriptGeneratorInput, ScriptEvidenceBundle } from "@/lib/module4-types";
import { XIANXIA_VISUAL_STYLE_SYSTEM, XIANXIA_VISUAL_PRESETS } from "@/lib/ai/prompts/xianxiaVisualStylePrompt";

export function buildGenerateTikTokScriptPrompt(input: ScriptGeneratorInput & { evidence: ScriptEvidenceBundle }) {
  return `Bạn là AI Script Writer chuyên tạo kịch bản TikTok/Reels về truyện tu tiên, tiên hiệp.

Nhiệm vụ:
Tạo kịch bản video ngắn dựa trên dữ liệu nguyên tác được cung cấp.

Luật bắt buộc:
1. Chỉ sử dụng dữ liệu trong phần EVIDENCE.
2. Không dùng kiến thức bên ngoài.
3. Không tự thêm chi tiết không có nguồn.
4. Không phóng đại thành "mạnh nhất", "duy nhất", "bất bại", "vô địch" nếu evidence không xác nhận.
5. Nếu dữ kiện không đủ, ghi rõ "Không đủ dữ kiện trong nguyên tác" trong warnings.
6. Kịch bản phải hấp dẫn, nhịp nhanh, đúng format TikTok/Reels.
7. 3 giây đầu phải có hook mạnh.
8. Mỗi cảnh phải có visual_description, voice_text, image_prompt và video_prompt.
9. Prompt hình ảnh/video phải bằng tiếng Anh, không có chữ, không logo, không watermark, vertical 9:16.
10. Nếu không có mô tả ngoại hình/hình dạng rõ trong evidence, dùng silhouette hoặc mô tả chung và thêm warning.
11. Không xuất lại nguyên văn truyện quá dài.

VISUAL STYLE REQUIREMENTS:
${XIANXIA_VISUAL_STYLE_SYSTEM}

Preset đang chọn: ${input.visual_style_preset}
Preset description: ${XIANXIA_VISUAL_PRESETS[input.visual_style_preset]}
Strict Tu Tien Visual Mode: ${input.strict_xianxia_visual_mode ? "ON" : "OFF"}

Bắt buộc cho mọi image_prompt:
- Must include "cinematic xianxia fantasy"
- Must include "Eastern immortal cultivation world"
- Must include "spiritual energy" or "qi aura"
- Must include "vertical 9:16 composition"
- Must include "no text, no logo, no watermark"

Bắt buộc cho mọi video_prompt:
- Must include "vertical 9:16 cinematic xianxia cultivation video"
- Must include "Eastern immortal cultivation world"
- Must include camera movement such as slow push-in, slow orbit, tracking shot, crane shot, or dramatic zoom-in
- Must include spiritual energy or mist movement
- Must include "no text, no logo, no watermark"

Cấm trong visual prompts: modern city, modern clothes, cars, phones, computers, guns, office, street, apartment, school, western castle, knight armor, medieval fantasy, European dragon, sci-fi, cyberpunk, robot.
Nếu evidence không mô tả ngoại hình rõ, dùng silhouette/back view/face hidden. Không tự bịa mặt, tóc, màu áo, tuổi, vóc dáng.

Cấu trúc theo thời lượng:
30s: 0-3s Hook; 3-8s Bối cảnh; 8-18s Dữ kiện chính; 18-25s Cao trào/phân tích; 25-30s Kết luận.
45s: 0-3s Hook; 3-10s Bối cảnh; 10-25s Phân tích chính; 25-38s Điểm đặc biệt; 38-45s Kết luận.
60s: 0-3s Hook; 3-10s Giới thiệu; 10-25s Dữ kiện; 25-40s Ý nghĩa; 40-52s Tác động; 52-60s Kết luận.
90s: 0-3s Hook; 3-12s Bối cảnh; 12-30s Dữ kiện; 30-55s Phân tích sâu; 55-75s Tác động; 75-90s Kết luận.

INPUT:
novel_title: ${input.evidence.novel_title}
topic: ${input.topic}
video_type: ${input.video_type}
duration_seconds: ${input.duration_seconds}
tone: ${input.tone}
style: ${input.style}
audience_level: ${input.audience_level}
special_requirements: ${input.special_requirements || "Không có"}
visual_style_preset: ${input.visual_style_preset}
strict_xianxia_visual_mode: ${input.strict_xianxia_visual_mode}

ENTITY_PROFILE:
${JSON.stringify(input.evidence.entity_profile).slice(0, 12000)}

AI_RESEARCH_REPORT:
${JSON.stringify(input.evidence.ai_research_report).slice(0, 12000)}

RESEARCH_NOTES:
${JSON.stringify(input.evidence.research_notes).slice(0, 12000)}

EVIDENCE:
${input.evidence.evidence_text.slice(0, 24000)}

SOURCE_REFERENCES:
${JSON.stringify(input.evidence.source_references).slice(0, 12000)}

WARNINGS:
${input.evidence.warnings.join("\n") || "Không có"}

Output bắt buộc: JSON thuần, không markdown, không giải thích ngoài JSON. Schema:
{
  "title": "Tiêu đề video",
  "video_type": "${input.video_type}",
  "duration_seconds": ${input.duration_seconds},
  "tone": "${input.tone}",
  "style": "${input.style}",
  "hook": { "text": "Câu mở đầu trong 3 giây", "purpose": "Vì sao hấp dẫn" },
  "voice_over": "Toàn bộ lời thoại",
  "scenes": [{ "scene_index": 1, "start_time": "0s", "end_time": "3s", "scene_title": "Hook", "visual_description": "...", "xianxia_visual_elements": ["spiritual energy", "misty immortal mountain", "formation array"], "voice_text": "...", "image_prompt": "Cinematic xianxia fantasy scene, Eastern immortal cultivation world, spiritual energy, vertical 9:16 composition, no text, no logo, no watermark", "video_prompt": "Create a vertical 9:16 cinematic xianxia cultivation video in an Eastern immortal cultivation world, slow camera push-in, spiritual energy flowing, no text, no logo, no watermark", "negative_prompt": "modern city, modern clothing, cars, phones, guns, western castle, knight armor, sci-fi, cyberpunk, text, logo, watermark", "source_reference": [{ "type": "entity_evidence", "chapter_number": 1, "chunk_id": "id", "summary": "Nguồn" }] }],
  "caption": "Caption TikTok/Reels",
  "hashtags": ["#tutien", "#tienhiep", "#reviewtruyen"],
  "source_references": [{ "chapter_number": 1, "chunk_id": "id", "summary": "Nguồn dữ kiện" }],
  "warnings": [],
  "original_accuracy_checklist": [{ "check": "Không thêm nhân vật ngoài nguyên tác", "status": "passed", "note": "..." }]
}`;
}

