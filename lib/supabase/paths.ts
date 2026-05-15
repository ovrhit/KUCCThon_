export const VIDEO_BUCKET = "videos";

const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export function getVideoExtension(contentType: string | null) {
  if (!contentType) return "mp4";
  return VIDEO_EXTENSIONS[contentType] ?? "mp4";
}

export function buildVideoPath(params: {
  userId: string;
  targetId: string;
  logId: string;
  extension?: string;
}) {
  const extension = params.extension ?? "mp4";
  return `${params.userId}/${params.targetId}/${params.logId}.${extension}`;
}

