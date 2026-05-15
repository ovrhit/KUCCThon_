SET client_encoding = 'UTF8';

-- ==========================================
-- 한편 (Hanpyeon) PostgreSQL Schema
-- Local Testing Version (Part A)
-- ==========================================

-- 1. Profiles Table (사용자 정보)
-- Supabase 연동 전 로컬 테스트용이므로 UUID 확장 모듈을 활성화합니다.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nickname VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Targets Table (대상/보관함 정보)
CREATE TABLE targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,          -- 예: '나 자신', '부모님'
    description TEXT,
    color VARCHAR(20) DEFAULT 'bg-black', -- 프론트엔드 UI용 컬러 코드
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)               -- 한 사용자는 동일한 이름의 타겟을 여러 개 만들 수 없음
);

-- 3. Gratitude Logs Table (감사 기록 핵심 테이블)
CREATE TABLE gratitude_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    video_url TEXT NOT NULL,            -- Storage 경로
    thumbnail_url TEXT,                 -- 썸네일 이미지 경로 (추가)
    recorded_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Shared Reels Table (공유 링크 정보)
CREATE TABLE shared_reels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
    title VARCHAR(100),                 -- 예: '엄마께 드리는 감사 한편'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 로컬 테스트용 MOCK DATA INSERT 스크립트
-- ==========================================

-- 테스트를 위한 임시 사용자 생성 (ID를 변수로 저장하듯 직접 할당하여 관계 테스트)
-- 주의: 로컬 psql 등에서 실행할 때는 아래 UUID를 그대로 사용하면 관계 매핑이 편합니다.

/* 
INSERT INTO profiles (id, nickname) 
VALUES ('11111111-1111-1111-1111-111111111111', '테스트유저');

INSERT INTO targets (id, user_id, name, description, color)
VALUES 
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '나 자신', '오늘의 나에게', 'bg-black'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '부모님', '사랑하는 부모님께', 'bg-orange-400');

INSERT INTO gratitude_logs (user_id, target_id, message, video_url, recorded_date)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '오늘 저녁 감사합니다.', 'test/parents/video1.mp4', '2024-05-10'),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '항상 건강하세요!', 'test/parents/video2.mp4', '2024-05-11');
*/
