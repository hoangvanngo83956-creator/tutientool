import { NextResponse } from "next/server";
import { deleteEntity, getEntityDetail, updateEntity } from "@/lib/module3-data";
import { ENTITY_STATUSES, type EntityStatus } from "@/lib/module3-types";

export const runtime = "nodejs";

type RouteProps = { params: Promise<{ entityId: string }> };

export async function GET(_request: Request, { params }: RouteProps) {
  const { entityId } = await params;
  const detail = await getEntityDetail(entityId);
  return NextResponse.json(detail);
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const { entityId } = await params;
  const body = (await request.json()) as { name?: string; description?: string; status?: EntityStatus };
  const status = body.status && ENTITY_STATUSES.includes(body.status) ? body.status : undefined;
  const entity = await updateEntity(entityId, { name: body.name, description: body.description, status });
  return NextResponse.json({ entity });
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { entityId } = await params;
  await deleteEntity(entityId);
  return NextResponse.json({ ok: true });
}