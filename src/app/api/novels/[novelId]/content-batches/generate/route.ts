import { NextResponse } from "next/server";
import { generateIdeas, generateSeries } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string}>};
export async function POST(r:Request,{params}:P){const{novelId}=await params;const body=await r.json().catch(()=>({})); if(body.batch_type==="generate_series") return NextResponse.json(await generateSeries(novelId,body)); return NextResponse.json(await generateIdeas(novelId,{series_id:body.series_id??null,number_of_ideas:Number(body.number_of_ideas||10),video_type:body.video_type||"all",duration_seconds:Number(body.duration_seconds||60),target_audience:body.target_audience||"newbie",tone:body.tone||"mysterious",style:body.style||"tiktok_viral",source_scope:body.source_scope||"all_entities"}));}
