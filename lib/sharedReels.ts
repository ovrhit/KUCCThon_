import {
  createSharedReel,
  getSharedReel,
  listTargetLogs,
} from "@/lib/supabase/rest";

export async function createShareLink(input: {
  creatorId: string;
  targetId: string;
  title: string;
}) {
  if (!input.creatorId || !input.targetId || !input.title) {
    throw new Error("creatorId, targetId, and title are required.");
  }

  return createSharedReel({
    creator_id: input.creatorId,
    target_id: input.targetId,
    title: input.title,
  });
}

export async function getSharedReelWithLogs(shareId: string) {
  if (!shareId) {
    throw new Error("shareId is required.");
  }

  const reel = await getSharedReel(shareId);
  if (!reel) return null;

  const logs = await listTargetLogs({
    targetId: reel.target_id,
    userId: reel.creator_id,
  });

  return { reel, logs };
}

