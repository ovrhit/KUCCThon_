import { VIDEO_BUCKET } from "./paths";

type RequestOptions = {
  method?: string;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  cache?: RequestCache;
};

export type StoredGratitudeLog = {
  id: string;
  user_id: string;
  target_id: string;
  video_url: string;
  thumbnail_url?: string | null;
  message: string;
  recorded_date: string;
  created_at?: string;
};

export type SharedReel = {
  id: string;
  creator_id: string;
  target_id: string;
  title: string;
  is_active: boolean;
  created_at?: string;
};

function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  return {
    url: url.replace(/\/$/, ""),
    serviceKey,
  };
}

async function supabaseRequest<T>(path: string, options: RequestOptions = {}) {
  const { url, serviceKey } = getSupabaseEnv();
  const response = await fetch(`${url}${path}`, {
    method: options.method ?? "GET",
    body: options.body,
    cache: options.cache ?? "no-store",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      typeof data?.message === "string" ? data.message : response.statusText;
    throw new Error(`Supabase request failed: ${message}`);
  }

  return data as T;
}

function publicVideoUrl(path: string) {
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/${VIDEO_BUCKET}/${path}`;
}

export async function uploadVideoObject(params: {
  path: string;
  file: Blob;
  contentType: string;
}) {
  const { url, serviceKey } = getSupabaseEnv();
  const response = await fetch(
    `${url}/storage/v1/object/${VIDEO_BUCKET}/${params.path}`,
    {
      method: "POST",
      body: params.file,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": params.contentType,
        "x-upsert": "false",
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Video upload failed: ${text || response.statusText}`);
  }
}

export async function deleteVideoObject(path: string) {
  return supabaseRequest(`/storage/v1/object/${VIDEO_BUCKET}`, {
    method: "DELETE",
    body: JSON.stringify({ prefixes: [path] }),
    headers: { "Content-Type": "application/json" },
  });
}

export async function insertGratitudeLog(input: Omit<StoredGratitudeLog, "created_at">) {
  const rows = await supabaseRequest<StoredGratitudeLog[]>("/rest/v1/gratitude_logs", {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
  });

  return withResolvedVideoUrl(rows[0]);
}

export async function listTargetLogs(params: {
  targetId: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const filters = [
    `target_id=eq.${encodeURIComponent(params.targetId)}`,
    "order=recorded_date.asc",
  ];

  if (params.userId) {
    filters.push(`user_id=eq.${encodeURIComponent(params.userId)}`);
  }

  if (params.startDate) {
    filters.push(`recorded_date=gte.${encodeURIComponent(params.startDate)}`);
  }

  if (params.endDate) {
    filters.push(`recorded_date=lte.${encodeURIComponent(params.endDate)}`);
  }

  const rows = await supabaseRequest<StoredGratitudeLog[]>(
    `/rest/v1/gratitude_logs?select=*&${filters.join("&")}`,
  );

  return rows.map(withResolvedVideoUrl);
}

export async function createSharedReel(input: {
  creator_id: string;
  target_id: string;
  title: string;
}) {
  const rows = await supabaseRequest<SharedReel[]>("/rest/v1/shared_reels", {
    method: "POST",
    body: JSON.stringify({ ...input, is_active: true }),
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
  });

  return rows[0];
}

export async function getSharedReel(shareId: string) {
  const rows = await supabaseRequest<SharedReel[]>(
    `/rest/v1/shared_reels?select=*&id=eq.${encodeURIComponent(
      shareId,
    )}&is_active=eq.true&limit=1`,
  );

  return rows[0] ?? null;
}

export function withResolvedVideoUrl(log: StoredGratitudeLog) {
  return {
    ...log,
    video_public_url: publicVideoUrl(log.video_url),
  };
}

