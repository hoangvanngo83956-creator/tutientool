import { NextResponse } from "next/server";
import { generateProductionTasks } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string}>};
export async function POST(r:Request,{params}:P){const{novelId}=await params;return NextResponse.json(await generateProductionTasks(novelId,await r.json().catch(()=>({}))));}
