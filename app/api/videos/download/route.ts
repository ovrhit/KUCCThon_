import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { VIDEO_BUCKET } from "@/lib/supabase/paths";

const VIDEO_PATH_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp4|mov|webm)$/i;

function fallbackContentType(path: string) {
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}

function sanitizeFilename(name: string | null, path: string) {
  const fallbackName = path.split("/").pop() ?? "hanpyeon-video.mp4";
  const rawName = (name?.trim() || fallbackName).replace(/[\r\n\\/]/g, "-");
  return rawName || fallbackName;
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path")?.trim();

  if (!path || !VIDEO_PATH_PATTERN.test(path)) {
    return NextResponse.json({ error: "Invalid video path." }, { status: 400 });
  }

  const filename = sanitizeFilename(request.nextUrl.searchParams.get("name"), path);
  const publicUrl = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path).data.publicUrl;
  const videoResponse = await fetch(publicUrl);

  if (!videoResponse.ok || !videoResponse.body) {
    return NextResponse.json({ error: "Video file not found." }, { status: 404 });
  }

  const headers = new Headers();
  const asciiFilename = filename.replace(/[^\x20-\x7e]/g, "_").replace(/[";]/g, "_");
  headers.set("Content-Type", videoResponse.headers.get("content-type") ?? fallbackContentType(path));
  headers.set(
    "Content-Disposition",
    `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
  );
  headers.set("Cache-Control", "private, max-age=300");

  const contentLength = videoResponse.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(videoResponse.body, { headers });
}
