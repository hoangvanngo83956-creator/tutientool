import { NextResponse } from "next/server";
import { analyzeEntityWithAI } from "@/lib/ai/entityAnalyzer";
import { factCheckReport } from "@/lib/ai/factChecker";
import { getEntityDetail, saveAIReport } from "@/lib/module3-data";

export const runtime = "nodejs";

type RouteProps = { params: Promise<{ novelId: string; entityId: string }> };

export async function POST(_request: Request, { params }: RouteProps) {
  const { novelId, entityId } = await params;
  const detail = await getEntityDetail(entityId);
  if (!detail.entity) return NextResponse.json({ error: "Không tìm thấy entity." }, { status: 404 });

  const evidenceText = detail.evidence.map((item) => `Chương ${item.chapter_number}, chunk ${item.chunk_id}: ${item.evidence_text}`).join("\n\n").slice(0, 12000);
  if (!evidenceText) return NextResponse.json({ error: "Entity chưa có evidence để phân tích." }, { status: 400 });

  const report = await analyzeEntityWithAI({ entityName: detail.entity.name, entityType: detail.entity.entity_type, evidence: evidenceText });
  const factCheck = await factCheckReport({ report, evidence: evidenceText });
  const saved = await saveAIReport({
    novelId,
    entityId,
    reportType: `${detail.entity.entity_type}_analysis`,
    title: report.title || `Phân tích ${detail.entity.name}`,
    summary: report.summary || "Không đủ dữ kiện trong nguyên tác",
    facts: { facts: report.facts || [], fact_check: factCheck },
    warnings: [...(report.warnings || []), ...(factCheck.warnings || [])],
    sourceReferences: report.source_references || []
  });

  return NextResponse.json({ report_id: saved.id, report, fact_check: factCheck });
}