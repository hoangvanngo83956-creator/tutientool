"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Brain, Loader2, Search } from "lucide-react";
import { ENTITY_TYPES, type EntityType } from "@/lib/module3-types";

const LABELS: Record<string, string> = { all: "Tất cả", character: "Nhân vật", item: "Vật phẩm", technique: "Công pháp", realm: "Cảnh giới", sect: "Tông môn", location: "Địa danh", event: "Sự kiện", other: "Khác" };

export function AIResearchPage({ novelId }: { novelId: string }) {
  const [chapterStart, setChapterStart] = useState("");
  const [chapterEnd, setChapterEnd] = useState("");
  const [sourceType, setSourceType] = useState<"chunks" | "research_notes">("chunks");
  const [entityType, setEntityType] = useState<EntityType | "all">("all");
  const [status, setStatus] = useState<string>("Sẵn sàng chạy AI Research.");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function runResearch() {
    setStatus("Đang lấy dữ liệu và gửi AI...");
    setWarnings([]);
    startTransition(async () => {
      const response = await fetch(`/api/novels/${novelId}/ai/extract-entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope_type: chapterStart || chapterEnd ? "chapter_range" : "all",
          chapter_start: chapterStart ? Number(chapterStart) : null,
          chapter_end: chapterEnd ? Number(chapterEnd) : null,
          entity_types: entityType === "all" ? "all" : [entityType],
          source_type: sourceType
        })
      });
      const payload = (await response.json()) as { extracted_entities_count?: number; research_job_id?: string; warnings?: string[]; error?: string };
      if (!response.ok) {
        setStatus(payload.error || "AI Research thất bại.");
        return;
      }
      setStatus(`Hoàn thành. Tạo/cập nhật ${payload.extracted_entities_count ?? 0} entities. Job: ${payload.research_job_id}`);
      setWarnings(payload.warnings ?? []);
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
        <h2 className="text-base font-semibold text-ink">Cấu hình AI Research</h2>
        <div className="mt-5 space-y-4">
          <ResearchScopeSelector chapterStart={chapterStart} chapterEnd={chapterEnd} onChapterStartChange={setChapterStart} onChapterEndChange={setChapterEnd} sourceType={sourceType} onSourceTypeChange={setSourceType} />
          <EntityTypeSelector value={entityType} onChange={setEntityType} />
          <RunResearchButton loading={isPending} onClick={runResearch} />
        </div>
      </section>
      <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">Trạng thái job</h2>
          <Link href={`/novels/${novelId}/entities`} className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-white hover:bg-zinc-800">
            <Search className="h-4 w-4" />
            View Entity Explorer
          </Link>
        </div>
        <ResearchJobStatus status={status} loading={isPending} warnings={warnings} />
      </section>
    </div>
  );
}

export function ResearchScopeSelector(props: { chapterStart: string; chapterEnd: string; sourceType: "chunks" | "research_notes"; onChapterStartChange: (v: string) => void; onChapterEndChange: (v: string) => void; onSourceTypeChange: (v: "chunks" | "research_notes") => void }) {
  return <div className="space-y-3"><div className="grid grid-cols-2 gap-3"><input className="h-10 rounded-md border border-line px-3 text-sm" placeholder="Từ chương" value={props.chapterStart} onChange={(e) => props.onChapterStartChange(e.target.value)} /><input className="h-10 rounded-md border border-line px-3 text-sm" placeholder="Đến chương" value={props.chapterEnd} onChange={(e) => props.onChapterEndChange(e.target.value)} /></div><select className="h-10 w-full rounded-md border border-line px-3 text-sm" value={props.sourceType} onChange={(e) => props.onSourceTypeChange(e.target.value as any)}><option value="chunks">chapter_chunks</option><option value="research_notes">Research Notes đã lưu</option></select></div>;
}
export function EntityTypeSelector({ value, onChange }: { value: EntityType | "all"; onChange: (v: EntityType | "all") => void }) { return <select className="h-10 w-full rounded-md border border-line px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value as any)}>{["all", ...ENTITY_TYPES].map((type) => <option key={type} value={type}>{LABELS[type]}</option>)}</select>; }
export function RunResearchButton({ loading, onClick }: { loading: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} disabled={loading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-jade-700 px-4 text-sm font-semibold text-white hover:bg-jade-800 disabled:bg-zinc-300">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}Run AI Research</button>; }
export function ResearchJobStatus({ status, loading, warnings }: { status: string; loading: boolean; warnings: string[] }) { return <div className="mt-5 space-y-4"><div className="rounded-lg border border-line bg-zinc-50 p-4 text-sm text-zinc-700">{loading ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : null}{status}</div>{warnings.length > 0 ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">Warnings</p><ul className="mt-2 list-disc pl-5">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div> : null}</div>; }
export function ExtractedEntityCard() { return null; }