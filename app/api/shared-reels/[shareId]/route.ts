import { NextResponse } from "next/server";
import { getSharedReelWithLogs } from "@/lib/sharedReels";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { shareId: string } },
) {
  try {
    const sharedReel = await getSharedReelWithLogs(params.shareId);

    if (!sharedReel) {
      return NextResponse.json({ error: "Shared reel not found." }, { status: 404 });
    }

    return NextResponse.json(sharedReel);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown share error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

