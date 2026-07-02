import { NextResponse } from "next/server";
import { listCalendarItems, listIdeas, listProductionTasks } from "@/lib/module5-data";
export const runtime="nodejs"; type P={params:Promise<{novelId:string}>};
export async function GET(_r:Request,{params}:P){const{novelId}=await params;const[ideas,tasks,calendar]=await Promise.all([listIdeas(novelId),listProductionTasks(novelId),listCalendarItems(novelId)]);return NextResponse.json({ideas,tasks,calendar});}
