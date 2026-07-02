import { NextResponse } from "next/server";
import { createProductionTask, listProductionTasks } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string}>};
export async function GET(_r:Request,{params}:P){const{novelId}=await params;return NextResponse.json({tasks:await listProductionTasks(novelId)});} 
export async function POST(r:Request,{params}:P){const{novelId}=await params;return NextResponse.json(await createProductionTask(novelId,await r.json().catch(()=>({}))));}
