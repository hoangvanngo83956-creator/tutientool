import { NextResponse } from "next/server";
import { getVideoScriptDetail } from "@/lib/module4-data";
import { formatScriptExport } from "@/lib/script-export";

export const runtime = "nodejs";
type RouteProps = { params: Promise<{ novelId: string; scriptId: string }> };
export async function POST(_request: Request, { params }: RouteProps) {
  const { novelId, scriptId } = await params;
  const detail = await getVideoScriptDetail(novelId, scriptId);
  if (!detail.script) return NextResponse.json({ error: "Không tìm thấy script." }, { status: 404 });
  return NextResponse.json({ text: formatScriptExport(detail.script, detail.scenes), json: detail });
}
