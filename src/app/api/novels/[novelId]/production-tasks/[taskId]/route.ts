import { NextResponse } from "next/server";
import { deleteRow, patchRow } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string;taskId:string}>};
export async function PATCH(r:Request,{params}:P){const{novelId,taskId}=await params;await patchRow("production_tasks",novelId,taskId,await r.json());return NextResponse.json({ok:true});}
export async function DELETE(_r:Request,{params}:P){const{novelId,taskId}=await params;await deleteRow("production_tasks",novelId,taskId);return NextResponse.json({ok:true});}
