import { NextResponse } from "next/server"; import { generatePlaylist } from "@/lib/module6-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string}>}; export async function POST(r:Request,{params}:P){const{novelId}=await params;return NextResponse.json(await generatePlaylist(novelId,await r.json().catch(()=>({}))));}
