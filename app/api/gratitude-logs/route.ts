import { NextResponse } from "next/server";
import { createGratitudeLog } from "@/lib/gratitudeLogs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = String(formData.get("userId") ?? "");
    const targetId = String(formData.get("targetId") ?? "");
    const message = String(formData.get("message") ?? "");
    const recordedDate =
      String(formData.get("recordedDate") ?? "") ||
      new Date().toISOString().slice(0, 10);
    const video = formData.get("video");

    if (!(video instanceof File)) {
      return NextResponse.json({ error: "video file is required." }, { status: 400 });
    }

    const log = await createGratitudeLog({
      userId,
      targetId,
      message,
      recordedDate,
      video,
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

