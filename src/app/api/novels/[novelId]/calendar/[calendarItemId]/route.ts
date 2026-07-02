import { NextResponse } from "next/server";
import { deleteRow, patchRow } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string;calendarItemId:string}>};
export async function PATCH(r:Request,{params}:P){const{novelId,calendarItemId}=await params;await patchRow("content_calendar_items",novelId,calendarItemId,await r.json());return NextResponse.json({ok:true});}
export async function DELETE(_r:Request,{params}:P){const{novelId,calendarItemId}=await params;await deleteRow("content_calendar_items",novelId,calendarItemId);return NextResponse.json({ok:true});}
