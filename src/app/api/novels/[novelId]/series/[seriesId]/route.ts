import { NextResponse } from "next/server";
import { deleteRow, getSeries, patchRow } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string;seriesId:string}>};
export async function GET(_r:Request,{params}:P){const{novelId,seriesId}=await params;return NextResponse.json({series:await getSeries(novelId,seriesId)});} 
export async function PATCH(r:Request,{params}:P){const{novelId,seriesId}=await params;await patchRow("content_series",novelId,seriesId,await r.json());return NextResponse.json({ok:true});}
export async function DELETE(_r:Request,{params}:P){const{novelId,seriesId}=await params;await deleteRow("content_series",novelId,seriesId);return NextResponse.json({ok:true});}
