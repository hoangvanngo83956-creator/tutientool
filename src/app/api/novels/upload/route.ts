import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { parseChaptersFromText } from "@/lib/chapter-parser";
import { createNovelWithChapters } from "@/lib/data";
import { generateChunksForNovel } from "@/lib/module2-data";
import { isSupabaseConfigError } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return errorResponse("Vui lòng chọn file .txt.", 400);
    }

    if (!file.name.toLowerCase().endsWith(".txt")) {
      return errorResponse("Giai đoạn 1 chỉ hỗ trợ file .txt.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse("File vượt quá giới hạn 50MB.", 400);
    }

    const rawText = await file.text();
    const chapters = parseChaptersFromText(rawText);

    if (chapters.length === 0) {
      return errorResponse(
        "Không tìm thấy chương. Hãy kiểm tra file có dòng tiêu đề như: Chương 1, Chương 01: Tên chương, Chương I hoặc Chapter 1.",
        400
      );
    }

    const title = readTextField(formData, "title") || file.name.replace(/\.txt$/i, "");
    const author = readTextField(formData, "author");
    const description = readTextField(formData, "description");

    const novel = await createNovelWithChapters({
      title,
      author,
      description,
      chapters
    });
    const chunkSummary = await generateChunksForNovel(novel.id);

    revalidatePath("/");
    revalidatePath("/novels");
    revalidatePath(`/novels/${novel.id}`);
    revalidatePath(`/novels/${novel.id}/search`);

    return NextResponse.json({
      novelId: novel.id,
      chapterCount: chapters.length,
      chunkCount: chunkSummary.created
    });
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return errorResponse(error.message, 500);
    }

    console.error(error);
    return errorResponse("Upload thất bại. Vui lòng kiểm tra lại file hoặc cấu hình database.", 500);
  }
}

function readTextField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}