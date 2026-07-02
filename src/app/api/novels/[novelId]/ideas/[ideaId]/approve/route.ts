import { NextResponse } from "next/server";
import { patchRow } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string;ideaId:string}>};
export async function POST(_r:Request,{params}:P){const{novelId,ideaId}=await params;await patchRow("content_ideas",novelId,ideaId,{status:"approved"});return NextResponse.json({ok:true});}
