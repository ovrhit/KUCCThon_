# Architecture

## Stack
- Next.js App Router
- TypeScript
- Tailwind
- Supabase

---

## Routes

/
홈

/record
감사 기록 생성

/replay/[targetId]
reel playback

/calendar
기록 캘린더

/share/[shareId]
공유 페이지

---

## Core Data Model

GratitudeLog
- id
- targetName
- message
- videoUrl
- createdAt

---

## Components

RecordForm
ReplayPlayer
CalendarView
VideoCard
BottomNavigation

---

## Replay Logic

- createdAt 기준 정렬
- autoplay
- vertical reel
- fade transition

---

## MVP Constraints

- 영상 길이 최대 10초
- export 기능 제외
- AI narration 제외
- 모바일 퍼스트 UI
