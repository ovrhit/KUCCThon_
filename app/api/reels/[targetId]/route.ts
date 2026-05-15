import { NextResponse } from "next/server";
import { getTargetReelLogs } from "@/lib/gratitudeLogs";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { targetId: string } },
) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") ?? undefined;
    const logs = await getTargetReelLogs({ targetId: params.targetId, userId });

    return NextResponse.json({ logs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown reel error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

