export function buildAnalyzeCharacterPrompt(input: { entityName: string; evidence: string }) {
  return buildAnalyzePrompt("character", input.entityName, input.evidence);
}

export function buildAnalyzePrompt(kind: string, entityName: string, evidence: string) {
  return `Bạn là AI Research Assistant chuyên phân tích truyện tu tiên, tiên hiệp.
Chỉ phân tích dựa trên evidence được cung cấp. Không bịa. Nếu thiếu dữ kiện, ghi rõ "Không đủ dữ kiện trong nguyên tác".

Entity type: ${kind}
Entity name: ${entityName}
Evidence gốc:
${evidence}

Trả JSON không markdown:
{
  "title": "Phân tích entity",
  "entity_name": "${entityName}",
  "summary": "Tóm tắt dựa trên nguyên tác",
  "facts": [{ "fact": "Dữ kiện cụ thể", "source": "Chương/chunk", "confidence_score": 0.0 }],
  "profile": {},
  "content_angles": [],
  "warnings": [],
  "source_references": [{ "chapter_number": 1, "chunk_id": "id", "summary": "Nguồn tham chiếu" }]
}`;
}