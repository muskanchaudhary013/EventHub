import { NextResponse } from "next/server";
import { fetchStitchSyncStatus } from "@/lib/stitch-mcp";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await fetchStitchSyncStatus();
  return NextResponse.json(payload, { status: payload.connected ? 200 : 503 });
}
