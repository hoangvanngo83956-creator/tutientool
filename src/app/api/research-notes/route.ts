import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createResearchNote } from "@/lib/module2-data";
import { NOTE_TYPES, type NoteType } from "@/lib/module2-types";
import { isSupabaseConfigError } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      novelId?: string;
      chapterId?: string;
      chunkId?: string;
      title?: string;
      noteType?: NoteType;
      content?: string;
      userNote?: string;
    };

    if (!body.novelId || !body.chapterId || !body.chunkId || !body.content) {
      return NextResponse.json({ error: "Thiếu dữ liệu research note." }, { status: 400 });
    }

    const note = await createResearchNote({
      novelId: body.novelId,
      chapterId: body.chapterId,
      chunkId: body.chunkId,
      title: body.title?.trim() || "Research note",
      noteType: NOTE_TYPES.includes(body.noteType as NoteType) ? (body.noteType as NoteType) : "other",
      content: body.content,
      userNote: body.userNote?.trim() || ""
    });

    revalidatePath(`/novels/${body.novelId}/research-notes`);

    return NextResponse.json({ note });
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error(error);
    return NextResponse.json({ error: "Lưu research note thất bại." }, { status: 500 });
  }
}