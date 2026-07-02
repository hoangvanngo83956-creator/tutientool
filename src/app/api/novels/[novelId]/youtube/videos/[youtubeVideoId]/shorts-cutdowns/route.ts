import { NextResponse } from "next/server"; import { listShortsCutdowns } from "@/lib/module6-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string;youtubeVideoId:string}>}; export async function GET(_r:Request,{params}:P){const{novelId,youtubeVideoId}=await params;return NextResponse.json({shorts:await listShortsCutdowns(novelId,youtubeVideoId)});}
