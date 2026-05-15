import { Target } from "@/types";
import { MOCK_TARGETS, PUBLIC_DEMO_USER_ID } from "@/lib/mockData";
import { supabase } from "@/lib/supabase/client";

type TargetRow = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
};

function toTarget(row: TargetRow): Target {
  const fallback = MOCK_TARGETS.find((target) => target.id === row.id);

  return {
    id: row.id,
    slug: fallback?.slug,
    name: row.name || fallback?.name || "새 대상",
    description: row.description || fallback?.description || "새로 추가한 대상",
    color: row.color || fallback?.color || "bg-emerald-500",
  };
}

export async function fetchDemoTargets() {
  const { data, error } = await supabase
    .from("targets")
    .select("id,name,description,color")
    .eq("user_id", PUBLIC_DEMO_USER_ID)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fetch targets error:", error);
    return MOCK_TARGETS;
  }

  return data?.length ? data.map(toTarget) : MOCK_TARGETS;
}

export async function createDemoTarget(name: string) {
  const target = {
    id: crypto.randomUUID(),
    user_id: PUBLIC_DEMO_USER_ID,
    name: name.trim(),
    description: "새로 추가한 대상",
    color: "bg-emerald-500",
  };

  const { data, error } = await supabase
    .from("targets")
    .insert(target)
    .select("id,name,description,color")
    .single();

  if (error) throw error;
  return toTarget(data);
}

export async function updateDemoTargetName(targetId: string, name: string) {
  const { data, error } = await supabase
    .from("targets")
    .update({ name: name.trim() })
    .eq("id", targetId)
    .eq("user_id", PUBLIC_DEMO_USER_ID)
    .select("id,name,description,color")
    .single();

  if (error) throw error;
  return toTarget(data);
}
