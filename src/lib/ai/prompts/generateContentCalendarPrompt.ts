export function buildGenerateContentCalendarPrompt(input: any) {
  return `Bạn là AI Content Calendar Planner cho kênh TikTok/Reels về truyện tu tiên, tiên hiệp.

Luật bắt buộc:
1. Chỉ dùng content ideas được cung cấp.
2. Không tạo ý tưởng mới nếu không được yêu cầu.
3. Ưu tiên priority_score và evidence_strength_score cao.
4. Xen kẽ nhân vật, vật phẩm, công pháp, sự kiện, lore, hidden detail.
5. Idea có warning chỉ đưa vào lịch khi status là approved.

INPUT:
${JSON.stringify(input).slice(0, 30000)}

Output JSON bắt buộc:
{"posting_strategy_summary":"Tóm tắt chiến lược","calendar_items":[{"content_idea_id":"id","series_id":"id nếu có","publish_date":"YYYY-MM-DD","publish_time":"HH:mm","platform":"tiktok | reels | youtube_shorts | facebook_reels | multi_platform","title":"Tiêu đề video","caption_suggestion":"Caption gợi ý","hashtags":["#tutien","#tienhiep"],"status":"planned","reason_for_slot":"Lý do"}],"warnings":[]}.
Chỉ trả JSON hợp lệ.`;
}
