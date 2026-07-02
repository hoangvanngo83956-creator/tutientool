import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { deleteResearchNote } from "@/lib/module2-data";
import { isSupabaseConfigError } from "@/lib/supabase/server";

export const runtime = "nodejs";

type DeleteNoteRouteProps = {
  params: Promise<{ noteId: string }>;
};

export async function DELETE(request: Request, { params }: DeleteNoteRouteProps) {
  try {
    const { noteId } = await params;
    const url = new URL(request.url);
    const novelId = url.searchParams.get("novelId");

    await deleteResearchNote(noteId);

    if (novelId) {
      revalidatePath(`/novels/${novelId}/research-notes`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error(error);
    return NextResponse.json({ error: "Xóa research note thất bại." }, { status: 500 });
  }
}