# 한편

> 작은 감사들이 쌓여, 하나의 메시지가 됩니다.

**한편**은 특정 사람에게 전하고 싶은 짧은 감사 기록을 영상과 메시지로 남기고,  
그 기록들을 시간순으로 모아 하나의 가로형 한편처럼 보여주는 웹 서비스입니다.

부모님에게, 친구에게, 연인에게, 혹은 미래의 나 자신에게  
매일의 작은 감사를 한 편의 메시지로 전달하는 것을 목표로 합니다.

---

## 핵심 아이디어

감사는 보통 순간적으로 지나갑니다.

- “오늘 데리러 와줘서 고마웠어”
- “오늘 같이 있어줘서 고마워”
- “별거 아니었지만 힘이 됐어”

한편은 이런 짧은 감사들을 하루씩 기록하고,  
시간이 지난 뒤 한 사람만을 위한 하나의 영상 메시지로 이어줍니다.

---

## 주요 기능 (MVP)

### 1. 보관함 기반 홈 화면 (Setlog Style)
- 대상별(나, 부모님, 친구 등) 미니멀 리스트 UI
- 가로형 영상 기록 포맷 최적화

### 2. 대상별 기록 및 캘린더
- 특정 대상에게 남긴 기록을 **비주얼 캘린더(썸네일 기반)** 형태로 시각화
- 캘린더 날짜 클릭 시 해당 날짜의 영상 즉시 재생 (모달 플레이어)
- 보관함 내부에서 즉시 기록(가로형 영상) 가능

### 3. 실제 미디어 업로드 및 저장
- 브라우저 기반 **영상 촬영(최대 10초) 및 자동 썸네일 추출**
- Supabase Storage를 통한 영상(.mp4/webm) 및 이미지(.jpg) 저장
- 가로형(16:9) 시네마틱 포맷 최적화

### 4. 시연 및 테스트 편의 기능
- **과거 날짜 기록 (Backdating)**: 촬영 시 원하는 날짜를 선택하여 기록 가능
- **데이터 전체 초기화**: 마이페이지에서 클릭 한 번으로 모든 테스트 데이터 삭제 가능

### 3. Replay Reel (가로형 한편)
- 시간순 자동 연결 및 재생
- Fade transition 및 Vertical scroll UI

### 4. My Page
- 사용자 기록 현황 및 환경 설정

### 5. Share
- 완성된 한편을 링크로 공유

---

## Tech Stack

### Frontend
- Next.js 14.2.15 (Stable)
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend / Infra
- **Supabase** (PostgreSQL, Storage, Auth)
- Local DB: PostgreSQL 16
- Security: Row Level Security (RLS)
- API: Next.js API Routes (Route Handlers)

---

# Integrated Backend Features

## 1. Data Integrity & Security (Part A)
- **Schema**: Profiles, Targets, GratitudeLogs, SharedReels 간의 엄격한 관계 형성
- **Constraints**: 메시지 길이(300자), 영상 확장자(.mp4, .mov) 자동 검증
- **Triggers**: 데이터 수정 시 `updated_at` 자동 갱신 및 비디오 스토리지 경로(`{user_id}/{target_id}/...`) 무결성 강제
- **RLS Policies**: 사용자별 데이터 격리 및 공유 링크 기반 외부 접근 허용

## 2. Media & Share Logic (Part B)
- **API Routes**: 
  - `GET /api/reels/[targetId]`: 특정 대상의 영상을 시간순으로 정렬하여 반환
  - `POST /api/shared-reels`: 외부 공유를 위한 유니크한 한편 링크 생성
  - `GET /api/shared-reels/[shareId]`: 공유받은 사람이 보는 한편 데이터 조회
- **Storage Strategy**: 사용자 및 대상별 폴더 구조를 통한 체계적인 파일 관리
- **Supabase Utils**: 서버사이드에서 안전하게 DB/Storage에 접근하기 위한 유틸리티 함수 구현

---

# 로컬 개발 및 테스트 가이드

이 프로젝트는 별도의 백엔드 연동 없이 UI와 컴포넌트를 바로 테스트할 수 있도록 초기 Mock 데이터가 포함되어 있습니다.

## 1. 프로젝트 실행 방법

저장소를 클론하거나 코드를 다운로드 받은 후, 아래 명령어를 순서대로 실행하세요.

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

서버가 실행되면 브라우저에서 `http://localhost:3000`으로 접속하여 앱을 확인할 수 있습니다.

## 2. 화면별 테스트 가이드

현재 목업(Mock) 데이터가 적용되어 있어 주요 흐름을 확인할 수 있습니다. 모바일 환경에 최적화되어 있으므로 브라우저의 **개발자 도구(F12)에서 모바일 뷰로 전환**하여 테스트하는 것을 권장합니다.

- **홈 (`/`)**: 셋로그 스타일의 미니멀 리스트에서 보관함을 선택하거나 즉석 기록 버튼을 테스트합니다.
- **대상 상세 (`/target/[id]`)**: 특정 대상의 캘린더를 확인하고 하단 버튼으로 기록 화면으로 이동합니다.
- **마이페이지 (`/profile`)**: 사용자 프로필 및 설정 메뉴 UI를 확인합니다.
- **한편 리플레이 (`/replay/[id]`)**: 해당 대상에게 남긴 기록들을 가로형 영상 플레이어로 감상합니다.
- **기록 페이지 (`/record?target=[id]`)**: 선택한 대상에게 영상과 메시지를 남깁니다.

## 3. Mock 데이터 수정

UI에 표시되는 초기 데이터는 `lib/mockData.ts` 파일에서 관리하고 있습니다. 다른 케이스를 테스트하고 싶다면 해당 파일의 배열 데이터를 수정하면 즉시 화면에 반영(HMR)됩니다.
