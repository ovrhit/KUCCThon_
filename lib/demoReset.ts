import { MOCK_TARGETS, PUBLIC_DEMO_USER_ID } from "@/lib/mockData";
import { supabase } from "@/lib/supabase/client";
import { VIDEO_BUCKET } from "@/lib/supabase/paths";

const DEFAULT_TARGET_IDS = MOCK_TARGETS.map((target) => target.id);

type ResetLogRow = {
  video_url: string | null;
  thumbnail_url: string | null;
};

function compactStoragePaths(logs: ResetLogRow[] | null) {
  return Array.from(
    new Set(
      (logs ?? [])
        .flatMap((log) => [log.video_url, log.thumbnail_url])
        .filter((path): path is string => typeof path === "string" && path.length > 0 && !path.startsWith("http")),
    ),
  );
}

export async function resetDemoData() {
  const { data: logs, error: logsFetchError } = await supabase
    .from("gratitude_logs")
    .select("video_url,thumbnail_url")
    .eq("user_id", PUBLIC_DEMO_USER_ID);

  if (logsFetchError) throw logsFetchError;

  const storagePaths = compactStoragePaths(logs);
  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(VIDEO_BUCKET)
      .remove(storagePaths);

    if (storageError) {
      console.warn("Storage cleanup skipped:", storageError);
    }
  }

  const { error: logsDeleteError } = await supabase
    .from("gratitude_logs")
    .delete()
    .eq("user_id", PUBLIC_DEMO_USER_ID);

  if (logsDeleteError) throw logsDeleteError;

  const { error: customTargetsDeleteError } = await supabase
    .from("targets")
    .delete()
    .eq("user_id", PUBLIC_DEMO_USER_ID)
    .not("id", "in", `(${DEFAULT_TARGET_IDS.join(",")})`);

  if (customTargetsDeleteError) throw customTargetsDeleteError;

  const temporaryNameResults = await Promise.all(
    DEFAULT_TARGET_IDS.map((targetId) =>
      supabase
        .from("targets")
        .update({ name: `__reset_${targetId}` })
        .eq("id", targetId)
        .eq("user_id", PUBLIC_DEMO_USER_ID),
    ),
  );

  const temporaryNameError = temporaryNameResults.find((result) => result.error)?.error;
  if (temporaryNameError) throw temporaryNameError;

  const defaultTargets = MOCK_TARGETS.map((target) => ({
    id: target.id,
    user_id: PUBLIC_DEMO_USER_ID,
    name: target.name,
    description: target.description,
    color: target.color,
  }));

  const { error: defaultTargetsError } = await supabase
    .from("targets")
    .upsert(defaultTargets, { onConflict: "id" });

  if (defaultTargetsError) throw defaultTargetsError;
}
