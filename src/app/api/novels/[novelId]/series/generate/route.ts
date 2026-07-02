import { NextResponse } from "next/server";
import { generateSeries } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string}>};
export async function POST(r:Request,{params}:P){try{const{novelId}=await params;return NextResponse.json(await generateSeries(novelId,await r.json()));}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Generate series failed"},{status:500});}}
