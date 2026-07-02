import { NextResponse } from "next/server";
import { listYouTubeVideos } from "@/lib/module6-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string}>};
export async function GET(_r:Request,{params}:P){const{novelId}=await params;return NextResponse.json({videos:await listYouTubeVideos(novelId)});}
