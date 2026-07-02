import { NextResponse } from "next/server";
import { extractEntitiesWithAI } from "@/lib/ai/entityExtractor";
import { createResearchJob, completeResearchJob, failResearchJob, fetchChunksForAI, fetchResearchNotesForAI, saveExtractedEntities } from "@/lib/module3-data";
import { ENTITY_TYPES, type EntityType } from "@/lib/module3-types";
import { isSupabaseConfigError } from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteProps = { params: Promise<{ novelId: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  let jobId: string | null = null;
  try {
    const { novelId } = await params;
    const body = (await request.json()) as { scope_type?: string; chapter_start?: number | null; chapter_end?: number | null; entity_types?: EntityType[] | "all"; source_type?: "chunks" | "research_notes" };
    const job = await createResearchJob({ novelId, jobType: body.source_type === "research_notes" ? "extract_entities_from_chunks" : "extract_entities_from_chunks", inputData: body });
    jobId = job.id;

    const entityTypes = normalizeEntityTypes(body.entity_types);
    const sourceType = body.source_type || "chunks";
    const rawSource = sourceType === "research_notes"
      ? await fetchResearchNotesForAI(novelId, 300)
      : await fetchChunksForAI({ novelId, chapterStart: body.chapter_start, chapterEnd: body.chapter_end, limit: 2000 });

    const chunks = rawSource.map((item: any, index: number) => ({
      id: item.chunk_id || item.id,
      chapter_id: item.chapter_id,
      chapter_number: item.chapter_number || item.chapters?.chapter_number || 0,
      chunk_index: item.chunk_index ?? index,
      content: item.content
    })).filter((item: any) => item.id && item.content);

    if (chunks.length === 0) {
      throw new Error("Không có chunk hoặc research note để phân tích. Hãy Generate chunks trước.");
    }

    const novelTitle = (rawSource[0] as any)?.novels?.title || "Truyện đã upload";
    const aiResult = await extractEntitiesWithAI({ novelTitle, chunks, entityTypes });
    const saved = await saveExtractedEntities({ novelId, result: aiResult, chunks });
    const summary = { extracted_entities_count: saved.savedEntities.length, warnings: saved.warnings };
    await completeResearchJob(job.id, summary);

    return NextResponse.json({ research_job_id: job.id, ...summary });
  } catch (error) {
    if (jobId) await failResearchJob(jobId, error instanceof Error ? error.message : "AI Research thất bại.").catch(() => undefined);
    if (isSupabaseConfigError(error)) return NextResponse.json({ error: error.message }, { status: 500 });
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI Research thất bại." }, { status: 500 });
  }
}

function normalizeEntityTypes(value: EntityType[] | "all" | undefined) {
  if (value === "all" || !value || value.length === 0) return "all" as const;
  return value.filter((item) => ENTITY_TYPES.includes(item));
}

function chunkArray<T>(items: T[], size: number) {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}
