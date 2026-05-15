# Supabase Setup

This folder contains the backend schema for video storage, reel playback, and share links.

## Environment Variables

The Next.js API routes call Supabase through server-side REST and Storage APIs.

```bash
SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Do not expose it to client components.

## Storage Strategy

- Bucket: `videos`
- Object path: `{user_id}/{target_id}/{log_id}.mp4`
- Stored DB value: `gratitude_logs.video_url` keeps the object path, not a public URL.

## API Routes

- `POST /api/gratitude-logs`
  - Multipart form fields: `userId`, `targetId`, `message`, `recordedDate`, `video`
  - Uploads the video to Storage, then inserts a `gratitude_logs` row.

- `GET /api/reels/[targetId]?userId=...`
  - Returns logs ordered by `recorded_date`.

- `POST /api/shared-reels`
  - JSON body: `creatorId`, `targetId`, `title`
  - Returns a share path like `/share/{id}`.

- `GET /api/shared-reels/[shareId]`
  - Returns the active shared reel and its ordered logs.

## File Deletion

The app currently removes an uploaded Storage object if the DB insert fails. For DB-driven deletion,
wire a Supabase Database Webhook on `gratitude_logs.delete` to an Edge Function that deletes
`old_record.video_url` from the `videos` bucket.

