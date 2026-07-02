import { NextResponse } from "next/server";
import { createIdea, listIdeas } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string}>};
export async function GET(_r:Request,{params}:P){const{novelId}=await params;return NextResponse.json({ideas:await listIdeas(novelId)});} 
export async function POST(r:Request,{params}:P){const{novelId}=await params;return NextResponse.json(await createIdea(novelId,await r.json().catch(()=>({}))));}
