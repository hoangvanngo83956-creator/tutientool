import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { generateChunksForNovel } from "@/lib/module2-data";
import { isSupabaseConfigError } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ChunkRouteProps = {
  params: Promise<{ novelId: string }>;
};

export async function POST(_request: Request, { params }: ChunkRouteProps) {
  try {
    const { novelId } = await params;
    const summary = await generateChunksForNovel(novelId);

    revalidatePath(`/novels/${novelId}/search`);
    revalidatePath(`/novels/${novelId}/research-notes`);

    return NextResponse.json(summary);
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error(error);
    return NextResponse.json({ error: "Generate chunks thất bại." }, { status: 500 });
  }
}