import { NextResponse } from "next/server";
import { generateCalendar } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string}>};
export async function POST(r:Request,{params}:P){try{const{novelId}=await params;return NextResponse.json(await generateCalendar(novelId,await r.json()));}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Generate calendar failed"},{status:500});}}
