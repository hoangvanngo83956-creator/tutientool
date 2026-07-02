import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { deleteNovel } from "@/lib/data";
import { isSupabaseConfigError } from "@/lib/supabase/server";

export const runtime = "nodejs";

type DeleteNovelRouteProps = {
  params: Promise<{
    novelId: string;
  }>;
};

export async function DELETE(_request: Request, { params }: DeleteNovelRouteProps) {
  try {
    const { novelId } = await params;

    if (!novelId) {
      return NextResponse.json({ error: "Thiếu id truyện." }, { status: 400 });
    }

    await deleteNovel(novelId);

    revalidatePath("/");
    revalidatePath("/novels");
    revalidatePath(`/novels/${novelId}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error(error);
    return NextResponse.json({ error: "Xóa truyện thất bại." }, { status: 500 });
  }
}