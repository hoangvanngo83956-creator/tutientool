import { NextResponse } from "next/server";
import { deleteVideoScript, getVideoScriptDetail, updateVideoScript } from "@/lib/module4-data";

export const runtime = "nodejs";
type RouteProps = { params: Promise<{ novelId: string; scriptId: string }> };
export async function GET(_request: Request, { params }: RouteProps) {
  const { novelId, scriptId } = await params;
  return NextResponse.json(await getVideoScriptDetail(novelId, scriptId));
}
export async function PATCH(request: Request, { params }: RouteProps) {
  const { novelId, scriptId } = await params;
  const body = await request.json().catch(() => ({}));
  await updateVideoScript(novelId, scriptId, body);
  return NextResponse.json({ ok: true });
}
export async function DELETE(_request: Request, { params }: RouteProps) {
  const { novelId, scriptId } = await params;
  await deleteVideoScript(novelId, scriptId);
  return NextResponse.json({ ok: true });
}
