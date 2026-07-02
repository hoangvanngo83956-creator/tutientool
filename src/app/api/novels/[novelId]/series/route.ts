import { NextResponse } from "next/server";
import { createSeries, listSeries } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string}>};
export async function GET(_r:Request,{params}:P){const{novelId}=await params;return NextResponse.json({series:await listSeries(novelId)});} 
export async function POST(r:Request,{params}:P){const{novelId}=await params;return NextResponse.json(await createSeries(novelId,await r.json().catch(()=>({}))));}
