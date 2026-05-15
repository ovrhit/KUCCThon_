import {
  deleteVideoObject,
  insertGratitudeLog,
  listTargetLogs,
  uploadVideoObject,
} from "@/lib/supabase/rest";
import { buildVideoPath, getVideoExtension } from "@/lib/supabase/paths";

const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

export async function createGratitudeLog(input: {
  userId: string;
  targetId: string;
  message: string;
  recordedDate: string;
  video: File;
}) {
  if (!input.userId || !input.targetId || !input.recordedDate) {
    throw new Error("userId, targetId, and recordedDate are required.");
  }

  if (!input.video.type.startsWith("video/")) {
    throw new Error("Only video files can be uploaded.");
  }

  if (input.video.size > MAX_VIDEO_BYTES) {
    throw new Error("Video file is too large. Keep clips short, up to 10 seconds.");
  }

  const logId = crypto.randomUUID();
  const videoPath = buildVideoPath({
    userId: input.userId,
    targetId: input.targetId,
    logId,
    extension: getVideoExtension(input.video.type),
  });

  await uploadVideoObject({
    path: videoPath,
    file: input.video,
    contentType: input.video.type,
  });

  try {
    return await insertGratitudeLog({
      id: logId,
      user_id: input.userId,
      target_id: input.targetId,
      video_url: videoPath,
      message: input.message,
      recorded_date: input.recordedDate,
    });
  } catch (error) {
    await deleteVideoObject(videoPath).catch(() => undefined);
    throw error;
  }
}

export async function getTargetReelLogs(input: {
  targetId: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}) {
  if (!input.targetId) {
    throw new Error("targetId is required.");
  }

  return listTargetLogs(input);
}

