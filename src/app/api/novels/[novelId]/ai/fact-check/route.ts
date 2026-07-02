import { NextResponse } from "next/server";
import { factCheckReport } from "@/lib/ai/factChecker";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { report: unknown; evidence: string };
  const result = await factCheckReport({ report: body.report, evidence: body.evidence || "" });
  return NextResponse.json(result);
}