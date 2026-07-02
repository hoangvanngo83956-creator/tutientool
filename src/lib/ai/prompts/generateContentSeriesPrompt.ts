export function buildGenerateContentSeriesPrompt(input: any) {
  return `Bạn là AI Content Strategist chuyên xây kênh TikTok/Reels về truyện tu tiên, tiên hiệp.

Nhiệm vụ: Dựa trên dữ liệu nguyên tác, entity, evidence, AI reports và video scripts đã có, đề xuất series nội dung dài hạn.

Luật bắt buộc:
1. Chỉ đề xuất series dựa trên dữ liệu có thật trong truyện đã upload.
2. Không tự bịa nhân vật, vật phẩm, công pháp, cảnh giới, tông môn, địa danh hoặc sự kiện.
3. Mỗi series phải có source_references.
4. Nếu dữ liệu yếu hoặc chưa đủ, ghi warning: "Không đủ dữ kiện trong nguyên tác".
5. Series phải phù hợp TikTok/Reels, dễ chia thành nhiều video ngắn.
6. Ưu tiên giữ chân người xem, dễ làm liên tục và dễ tạo bình luận.

INPUT:
${JSON.stringify(input).slice(0, 30000)}

Output JSON bắt buộc:
{"series":[{"title":"Tên series","description":"Mô tả series","series_type":"character_series | item_series | technique_series | realm_series | sect_series | event_series | hidden_detail_series | comparison_series | beginner_guide_series | lore_explainer_series | custom_series","target_audience":"newbie | familiar_with_story | hardcore_fan","tone":"mysterious | dramatic | epic | fast_viral | storyteller | analytical | dark | emotional","style":"tiktok_viral | cinematic_narration | lore_explainer | dramatic_recap | short_documentary | anime_recap_style","suggested_video_count":10,"reason_why_this_series_works":"Vì sao series này phù hợp","related_entities":[{"entity_id":"id nếu có","name":"Tên entity","entity_type":"character | item | technique | realm | sect | location | event | other"}],"source_references":[{"type":"entity | ai_report | video_script | research_note | chapter_chunk","id":"id nếu có","summary":"Nguồn dữ liệu liên quan"}],"warnings":[]}]}.
Chỉ trả JSON hợp lệ, không markdown.`;
}
