import { NextResponse } from "next/server";
import { getResearchJob } from "@/lib/module3-data";

export const runtime = "nodejs";

type RouteProps = { params: Promise<{ jobId: string }> };

export async function GET(_request: Request, { params }: RouteProps) {
  const { jobId } = await params;
  const job = await getResearchJob(jobId);
  return NextResponse.json({ job });
}