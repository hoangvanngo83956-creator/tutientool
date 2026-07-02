"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, UploadCloud } from "lucide-react";

type UploadState = {
  error: string | null;
  selectedFileName: string | null;
};

export function UploadNovelForm({ disabledReason }: { disabledReason?: string | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ error: null, selectedFileName: null });
  const [isPending, startTransition] = useTransition();
  const disabled = Boolean(disabledReason) || isPending;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setState((current) => ({ ...current, error: null }));

    startTransition(async () => {
      const response = await fetch("/api/novels/upload", {
        method: "POST",
        body: data
      });

      const payload = (await response.json()) as { novelId?: string; error?: string };

      if (!response.ok || !payload.novelId) {
        setState((current) => ({
          ...current,
          error: payload.error || "Upload thất bại."
        }));
        return;
      }

      router.push(`/novels/${payload.novelId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <button
        type="button"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        className="flex min-h-44 w-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50/70 px-4 text-center transition hover:border-jade-600 hover:bg-jade-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <input
          ref={fileInputRef}
          className="sr-only"
          name="file"
          type="file"
          accept=".txt,text/plain"
          disabled={disabled}
          required
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            setState((current) => ({ ...current, selectedFileName: file?.name ?? null }));
          }}
        />
        <FileText className="h-10 w-10 text-zinc-500" />
        <span className="mt-3 text-sm font-semibold text-ink">
          {state.selectedFileName || "Kéo & thả file TXT vào đây"}
        </span>
        <span className="mt-1 text-xs text-zinc-500">hoặc chọn file từ máy</span>
      </button>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Tên truyện" required>
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-jade-700 focus:ring-2 focus:ring-jade-100"
            name="title"
            placeholder="Nhập tên truyện"
            disabled={disabled}
          />
        </Field>
        <Field label="Tác giả">
          <input
            className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-jade-700 focus:ring-2 focus:ring-jade-100"
            name="author"
            placeholder="Nhập tác giả"
            disabled={disabled}
          />
        </Field>
      </div>

      <Field label="Mô tả">
        <textarea
          className="min-h-24 w-full resize-y rounded-md border border-line px-3 py-2 text-sm outline-none transition focus:border-jade-700 focus:ring-2 focus:ring-jade-100"
          name="description"
          maxLength={500}
          placeholder="Nhập mô tả ngắn"
          disabled={disabled}
        />
      </Field>

      {disabledReason ? <p className="text-sm text-amber-700">{disabledReason}</p> : null}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <button
        type="submit"
        disabled={disabled}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-jade-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-jade-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
        Nhập & tách chương
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
