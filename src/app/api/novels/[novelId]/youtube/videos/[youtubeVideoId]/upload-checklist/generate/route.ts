import { NextResponse } from "next/server"; import { generateChecklist } from "@/lib/module6-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string;youtubeVideoId:string}>}; export async function POST(_r:Request,{params}:P){const{novelId,youtubeVideoId}=await params;return NextResponse.json(await generateChecklist(novelId,youtubeVideoId));}
