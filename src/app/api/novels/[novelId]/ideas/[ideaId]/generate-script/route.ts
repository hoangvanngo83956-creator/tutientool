import { NextResponse } from "next/server";
import { getIdea, patchRow } from "@/lib/module5-data";

export const runtime="nodejs";
type P={params:Promise<{novelId:string;ideaId:string}>};
export async function POST(_r:Request,{params}:P){
  const { novelId, ideaId } = await params;
  const idea = await getIdea(novelId, ideaId);
  if (!idea) return NextResponse.json({error:"Không tìm thấy idea."},{status:404});
  if (!idea.source_references_json?.length) return NextResponse.json({error:"Ý tưởng này chưa có source reference, không thể tạo script đúng nguyên tác."},{status:400});
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
  const response = await fetch(`${origin}/api/novels/${novelId}/scripts/generate`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ topic: idea.topic || idea.title, source_type: "custom", entity_ids: idea.related_entity_ids_json || [], research_note_ids: idea.related_research_note_ids_json || [], ai_report_id: (idea.related_report_ids_json || [])[0] || null, custom_query: `${idea.title}\n${idea.content_summary || ""}\nSources: ${JSON.stringify(idea.source_references_json)}`, video_type: idea.video_type === "beginner_guide" ? "custom" : idea.video_type, duration_seconds: idea.suggested_duration_seconds || 60, tone: "mysterious", style: "tiktok_viral", audience_level: "newbie", special_requirements: "Tạo script từ Content Idea. Chỉ dùng source references/evidence đã nêu.", visual_style_preset: "xianxia_cinematic", strict_xianxia_visual_mode: true }) });
  const payload = await response.json();
  if (!response.ok) return NextResponse.json(payload,{status:response.status});
  if (payload.fact_check_status === "passed" || payload.fact_check_status === "needs_review") await patchRow("content_ideas", novelId, ideaId, { status: "script_generated" });
  return NextResponse.json(payload);
}
