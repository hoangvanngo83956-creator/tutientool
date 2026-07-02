import { NextResponse } from "next/server";
import { listEntities } from "@/lib/module3-data";

export const runtime = "nodejs";

type RouteProps = { params: Promise<{ novelId: string }> };

export async function GET(_request: Request, { params }: RouteProps) {
  const { novelId } = await params;
  const entities = await listEntities(novelId);
  return NextResponse.json({ entities });
}