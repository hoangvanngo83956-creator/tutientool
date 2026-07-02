"use client";

import Link from "next/link";
import { Clipboard, ExternalLink, Save } from "lucide-react";
import type { SearchMatchMode, SearchResult } from "@/lib/module2-types";
import { HighlightText } from "@/components/search/highlight-text";

export function SearchResultCard({
  result,
  query,
  matchMode,
  onAddNote
}: {
  result: SearchResult;
  query: string;
  matchMode: SearchMatchMode;
  onAddNote: (result: SearchResult) => void;
}) {
  async function copyChunk() {
    await navigator.clipboard.writeText(result.content);
  }

  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-jade-700">{result.novel_title}</p>
          <h3 className="mt-1 text-base font-semibold text-ink">
            Chương {result.chapter_number}: {result.chapter_title}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Đoạn {result.chunk_index + 1} · {result.match_count} lần khớp · score {result.score}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/novels/${result.novel_id}/chapters/${result.chapter_id}`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:border-jade-700 hover:text-jade-700"
          >
            <ExternalLink className="h-4 w-4" />
            Xem chương
          </Link>
          <button
            type="button"
            onClick={copyChunk}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:border-jade-700 hover:text-jade-700"
          >
            <Clipboard className="h-4 w-4" />
            Copy đoạn này
          </button>
          <button
            type="button"
            onClick={() => onAddNote(result)}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-jade-700 px-3 text-sm font-semibold text-white hover:bg-jade-800"
          >
            <Save className="h-4 w-4" />
            Thêm vào Research Notes
          </button>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-700">
        <HighlightText text={result.content} query={query} exact={matchMode === "exact"} />
      </p>
    </article>
  );
}