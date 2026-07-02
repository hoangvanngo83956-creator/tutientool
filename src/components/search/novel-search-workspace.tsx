"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FileSearch, Loader2, NotebookPen, RefreshCcw } from "lucide-react";
import type { SearchMatchMode, SearchResult } from "@/lib/module2-types";
import { AddToResearchNoteModal } from "@/components/search/add-to-research-note-modal";
import { SearchBar } from "@/components/search/search-bar";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResultCard } from "@/components/search/search-result-card";

export function NovelSearchWorkspace({ novelId }: { novelId: string }) {
  const [query, setQuery] = useState("");
  const [fromChapter, setFromChapter] = useState("");
  const [toChapter, setToChapter] = useState("");
  const [matchMode, setMatchMode] = useState<SearchMatchMode>("fuzzy");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isSearching, startSearchTransition] = useTransition();
  const [isGenerating, startGenerateTransition] = useTransition();

  function search() {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    setMessage(null);
    setSearched(true);
    startSearchTransition(async () => {
      const params = new URLSearchParams({ query: trimmed, matchMode });
      if (fromChapter) params.set("fromChapter", fromChapter);
      if (toChapter) params.set("toChapter", toChapter);

      const response = await fetch(`/api/novels/${novelId}/search?${params.toString()}`);
      const payload = (await response.json()) as { results?: SearchResult[]; error?: string };

      if (!response.ok) {
        setResults([]);
        setMessage(payload.error || "Search thất bại.");
        return;
      }

      setResults(payload.results ?? []);
      setMessage(null);
    });
  }

  function generateChunks() {
    setMessage(null);
    startGenerateTransition(async () => {
      const response = await fetch(`/api/novels/${novelId}/chunks`, { method: "POST" });
      const payload = (await response.json()) as { created?: number; error?: string };

      if (!response.ok) {
        setMessage(payload.error || "Generate chunks thất bại.");
        return;
      }

      setMessage(`Đã kiểm tra/tạo ${payload.created ?? 0} chunks. Bạn có thể search lại.`);
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">Search trong truyện</h2>
            <p className="mt-1 text-sm text-zinc-500">Tìm nhân vật, vật phẩm, công pháp, cảnh giới, địa danh hoặc cụm từ bất kỳ.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={generateChunks}
              disabled={isGenerating}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:border-jade-700 hover:text-jade-700 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Generate chunks
            </button>
            <Link
              href={`/novels/${novelId}/research-notes`}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              <NotebookPen className="h-4 w-4" />
              Research Notes
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          <SearchBar query={query} onQueryChange={setQuery} onSubmit={search} loading={isSearching} />
          <SearchFilters
            fromChapter={fromChapter}
            toChapter={toChapter}
            matchMode={matchMode}
            onFromChapterChange={setFromChapter}
            onToChapterChange={setToChapter}
            onMatchModeChange={setMatchMode}
          />
        </div>
      </section>

      {message ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{message}</div> : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Kết quả</h2>
          <span className="text-sm text-zinc-500">{results.length} / tối đa 50</span>
        </div>

        {isSearching ? (
          <div className="flex min-h-44 items-center justify-center rounded-lg border border-line bg-white text-sm text-zinc-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tìm trong chunks...
          </div>
        ) : results.length > 0 ? (
          results.map((result) => (
            <SearchResultCard
              key={result.id}
              result={result}
              query={query}
              matchMode={matchMode}
              onAddNote={setSelectedResult}
            />
          ))
        ) : searched ? (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-line bg-white text-center text-sm text-zinc-500">
            <FileSearch className="mb-3 h-8 w-8 text-zinc-400" />
            Không tìm thấy kết quả. Thử bật gần đúng hoặc kiểm tra đã Generate chunks chưa.
          </div>
        ) : (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-line bg-white text-center text-sm text-zinc-500">
            <FileSearch className="mb-3 h-8 w-8 text-zinc-400" />
            Nhập từ khóa để bắt đầu research nguyên tác.
          </div>
        )}
      </section>

      <AddToResearchNoteModal
        result={selectedResult}
        onClose={() => setSelectedResult(null)}
        onSaved={() => {
          setSelectedResult(null);
          setMessage("Đã lưu vào Research Notes.");
        }}
      />
    </div>
  );
}