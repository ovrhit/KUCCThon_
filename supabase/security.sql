SET client_encoding = 'UTF8';

-- ==========================================
-- RLS (Row Level Security) 설정
-- ==========================================

-- 모든 테이블 RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE gratitude_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_reels ENABLE ROW LEVEL SECURITY;

-- 1. Profiles 정책
-- 조회: 누구나 가능
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

-- 수정: 본인만 가능 (auth.uid()는 로그인한 사용자의 ID를 반환)
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Targets 정책: 본인 보관함만 조회/생성/수정/삭제 가능
CREATE POLICY "Users can manage own targets" 
ON targets FOR ALL USING (auth.uid() = user_id);

-- 3. Gratitude Logs 정책: 본인 기록만 관리 가능
CREATE POLICY "Users can manage own logs" 
ON gratitude_logs FOR ALL USING (auth.uid() = user_id);

-- 4. Shared Reels 정책
-- 조회: 공유 활성화 상태라면 비로그인 사용자도 가능
CREATE POLICY "Anyone can view shared reels" 
ON shared_reels FOR SELECT USING (is_active = true);

-- 관리: 본인 것만 가능
CREATE POLICY "Users can manage own shared reels" 
ON shared_reels FOR ALL USING (auth.uid() = creator_id);
