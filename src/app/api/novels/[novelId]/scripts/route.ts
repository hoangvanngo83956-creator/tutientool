import { NextResponse } from "next/server";
import { listVideoScripts } from "@/lib/module4-data";

export const runtime = "nodejs";
type RouteProps = { params: Promise<{ novelId: string }> };
export async function GET(_request: Request, { params }: RouteProps) {
  const { novelId } = await params;
  return NextResponse.json({ scripts: await listVideoScripts(novelId) });
}
