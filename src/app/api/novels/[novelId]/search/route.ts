import { NextResponse } from "next/server";
import { searchNovelChunks } from "@/lib/module2-data";
import { isSupabaseConfigError } from "@/lib/supabase/server";
import type { SearchMatchMode } from "@/lib/module2-types";

export const runtime = "nodejs";

type SearchRouteProps = {
  params: Promise<{ novelId: string }>;
};

export async function GET(request: Request, { params }: SearchRouteProps) {
  try {
    const { novelId } = await params;
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";
    const matchMode = normalizeMatchMode(url.searchParams.get("matchMode"));
    const fromChapter = parseOptionalNumber(url.searchParams.get("fromChapter"));
    const toChapter = parseOptionalNumber(url.searchParams.get("toChapter"));

    const results = await searchNovelChunks({
      novelId,
      query,
      fromChapter,
      toChapter,
      matchMode
    });

    return NextResponse.json({ results });
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error(error);
    return NextResponse.json({ error: "Search thất bại." }, { status: 500 });
  }
}

function normalizeMatchMode(value: string | null): SearchMatchMode {
  return value === "exact" ? "exact" : "fuzzy";
}

function parseOptionalNumber(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}