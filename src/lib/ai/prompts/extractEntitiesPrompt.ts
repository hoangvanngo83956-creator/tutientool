import type { EntityType } from "@/lib/module3-types";

export function buildExtractEntitiesPrompt(input: {
  novelTitle: string;
  entityTypes: EntityType[] | "all";
  chunks: Array<{ id: string; chapter_number: number; chunk_index: number; content: string }>;
}) {
  const entityTypeText = input.entityTypes === "all" ? "Tất cả entity types" : input.entityTypes.join(", ");
  return `Bạn là AI Research Assistant chuyên phân tích truyện tu tiên, tiên hiệp.

Nhiệm vụ:
Đọc các đoạn truyện được cung cấp và trích xuất các yếu tố quan trọng trong nguyên tác.

Luật bắt buộc:
1. Chỉ sử dụng thông tin có trong đoạn truyện được cung cấp.
2. Không tự ý thêm chi tiết.
3. Không suy diễn quá mức.
4. Nếu một thông tin không chắc chắn, đặt confidence_score thấp.
5. Mỗi entity phải có evidence_text trích từ nội dung được cung cấp.
6. Không dùng kiến thức bên ngoài.
7. Không được tạo fan-fiction.
8. Không được kết luận nhân vật/vật phẩm/công pháp là "mạnh nhất", "duy nhất", "bất bại" nếu đoạn truyện không xác nhận rõ.
9. Evidence_text tối đa 500 ký tự.
10. Nếu không đủ dữ kiện, thêm warning: "Không đủ dữ kiện trong nguyên tác".

Novel: ${input.novelTitle}
Entity types cần tìm: ${entityTypeText}

Chunks:
${input.chunks.map((chunk) => `---\nchunk_id: ${chunk.id}\nchapter_number: ${chunk.chapter_number}\nchunk_index: ${chunk.chunk_index}\ncontent:\n${chunk.content.slice(0, 1600)}`).join("\n")}

Output JSON bắt buộc, không markdown:
{
  "entities": [
    {
      "name": "Tên entity",
      "normalized_name": "ten_entity",
      "entity_type": "character | item | technique | realm | sect | location | event | other",
      "description": "Mô tả ngắn dựa trên nguyên tác",
      "first_appearance_chapter": 1,
      "confidence_score": 0.0,
      "evidence": [
        {
          "chapter_number": 1,
          "chunk_id": "chunk id",
          "evidence_text": "Đoạn chứng cứ ngắn",
          "evidence_summary": "Tóm tắt chứng cứ"
        }
      ]
    }
  ],
  "relationships": [
    {
      "source_entity_name": "Tên entity nguồn",
      "target_entity_name": "Tên entity đích",
      "relationship_type": "owns | uses | learns | belongs_to | enemy_of | ally_of | master_of | disciple_of | appears_in | related_to",
      "description": "Mô tả quan hệ dựa trên nguyên tác",
      "evidence_text": "Đoạn chứng cứ ngắn",
      "confidence_score": 0.0
    }
  ],
  "warnings": []
}`;
}