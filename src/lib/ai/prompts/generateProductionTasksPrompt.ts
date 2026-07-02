export function buildGenerateProductionTasksPrompt(input: any) {
  return `Bạn là AI Production Manager cho kênh TikTok/Reels.

Nhiệm vụ: Tạo danh sách công việc sản xuất video dựa trên content idea, script và lịch đăng.
Luật: Không thêm nội dung truyện mới. Chỉ tạo task sản xuất rõ ràng, ưu tiên kiểm tra đúng nguyên tác trước khi đăng.

INPUT:
${JSON.stringify(input).slice(0, 16000)}

Output JSON: {"tasks":[{"task_title":"Kiểm tra lại evidence nguyên tác","task_type":"research","status":"todo","notes":"Đảm bảo script không có chi tiết bịa"}]}.
Chỉ trả JSON hợp lệ.`;
}
