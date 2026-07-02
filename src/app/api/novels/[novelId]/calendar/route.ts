import { NextResponse } from "next/server";
import { createCalendarItem, listCalendarItems } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string}>};
export async function GET(_r:Request,{params}:P){const{novelId}=await params;return NextResponse.json({calendar_items:await listCalendarItems(novelId)});} 
export async function POST(r:Request,{params}:P){const{novelId}=await params;return NextResponse.json(await createCalendarItem(novelId,await r.json().catch(()=>({}))));}
