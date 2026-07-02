import { NextResponse } from "next/server";
import { deleteRow, getIdea, patchRow } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string;ideaId:string}>};
export async function GET(_r:Request,{params}:P){const{novelId,ideaId}=await params;return NextResponse.json({idea:await getIdea(novelId,ideaId)});} 
export async function PATCH(r:Request,{params}:P){const{novelId,ideaId}=await params;await patchRow("content_ideas",novelId,ideaId,await r.json());return NextResponse.json({ok:true});}
export async function DELETE(_r:Request,{params}:P){const{novelId,ideaId}=await params;await deleteRow("content_ideas",novelId,ideaId);return NextResponse.json({ok:true});}
