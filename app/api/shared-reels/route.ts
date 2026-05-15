import { NextResponse } from "next/server";
import { createShareLink } from "@/lib/sharedReels";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reel = await createShareLink({
      creatorId: String(body.creatorId ?? ""),
      targetId: String(body.targetId ?? ""),
      title: String(body.title ?? ""),
    });

    return NextResponse.json(
      {
        reel,
        sharePath: `/share/${reel.id}`,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown share error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

