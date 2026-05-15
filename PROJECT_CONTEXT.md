# Project Context: 한편 (Hanpyeon)

This document serves as a comprehensive context for AI assistants to continue the development of the "한편" project.

## 1. Project Overview
- **Name:** 한편 (Hanpyeon)
- **Concept:** A "Daily Gratitude Reels" service. Users record short videos (max 10s) and messages of gratitude every day, which are then compiled into a vertical reel-style playback for a specific recipient.
- **Core Value:** Transforming fleeting moments of gratitude into a lasting, chronological message.

## 2. Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend (Planned):** Supabase (Auth, Database, Storage)
- **Deployment:** Vercel

## 3. Project Structure
```txt
/app
  /calendar         # Monthly log overview
  /record           # Video/Message recording & upload
  /replay/[targetId] # Vertical reel playback (dynamic route)
  /share/[shareId]  # Public share page for recipients
  layout.tsx        # Root layout with BottomNavigation
  page.tsx          # Home page (Recent logs)
/components
  /shared           # BottomNavigation, etc.
  /record           # (Planned) RecordForm, VideoUploader
  /replay           # (Planned) ReplayPlayer, VideoCard
/lib
  mockData.ts       # Initial mock data for development
/types
  index.ts          # Core interfaces (GratitudeLog, TargetType)
/styles
  globals.css       # Tailwind & Global styles
```

## 4. Core Data Model
```typescript
export type TargetType = '부모님' | '친구' | '연인' | '나 자신';

export interface GratitudeLog {
  id: string;
  targetName: TargetType;
  message: string;
  videoUrl: string;
  createdAt: string;
}
```

## 5. Current Implementation State
- [x] Initial project scaffolding (Next.js, TS, Tailwind).
- [x] Global layout with fixed `BottomNavigation`.
- [x] Mock data for `GratitudeLog`.
- [x] **Home Page:** Simple list of recent logs.
- [x] **Record Page:** Basic form UI (Target selection, message).
- [x] **Replay Page:** Placeholder for vertical video player.
- [x] **Calendar Page:** Basic grid UI showing recorded days.
- [x] **Share Page:** Landing page for shared reels.

## 6. Next Steps & Development Focus
1. **Vertical Reel UI:** Implement the `ReplayPlayer` using Framer Motion for smooth fade transitions and vertical scroll/snap.
2. **Video Handling:** Setup video recording (MediaRecorder API) or file upload logic for the 10s constraint.
3. **Supabase Integration:** 
   - Configure Database (Tables for logs).
   - Configure Storage (Buckets for video files).
   - Connect frontend to Supabase client.
4. **Auth (Optional):** Add simple authentication if needed.
5. **UI/UX Polishing:** Mobile-first design, interactive feedback, and "alive" feel.

## 7. Instructions for AI
- **Strictly adhere to the established architecture.**
- **Prioritize Mobile-First UI** (Vertical reels, fullscreen experience).
- **Use surgical updates** when modifying files.
- **Maintain type safety** using the defined `types/index.ts`.
- **Follow the design philosophy:** Minimalist, warm, and emotional.
