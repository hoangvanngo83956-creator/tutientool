import { NextResponse } from "next/server";
export const runtime="nodejs"; type P={params:Promise<{batchId:string}>};
export async function GET(_r:Request,{params}:P){const{batchId}=await params;return NextResponse.json({id:batchId,status:"completed"});}
