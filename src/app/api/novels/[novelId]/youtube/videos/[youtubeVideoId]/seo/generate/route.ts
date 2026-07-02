import { NextResponse } from "next/server"; import { generateSeo } from "@/lib/module6-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string;youtubeVideoId:string}>}; export async function POST(r:Request,{params}:P){const{novelId,youtubeVideoId}=await params;return NextResponse.json(await generateSeo(novelId,youtubeVideoId,await r.json().catch(()=>({}))));}
