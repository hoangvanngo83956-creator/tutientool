import { NextResponse } from "next/server"; import { generateThumbnails } from "@/lib/module6-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string;youtubeVideoId:string}>}; export async function POST(r:Request,{params}:P){const{novelId,youtubeVideoId}=await params;return NextResponse.json(await generateThumbnails(novelId,youtubeVideoId,await r.json().catch(()=>({}))));}
