SET client_encoding = 'UTF8';

-- 1. 메시지 길이 제한 (1자 이상 300자 이하)
ALTER TABLE gratitude_logs 
ADD CONSTRAINT check_message_length 
CHECK (char_length(message) >= 1 AND char_length(message) <= 300);

-- 2. 영상 경로 형식 검증 (mp4, mov 확장자만 허용)
ALTER TABLE gratitude_logs 
ADD CONSTRAINT check_video_url_format 
CHECK (video_url LIKE '%.mp4' OR video_url LIKE '%.mov');

-- 3. profiles 테이블의 updated_at 자동 업데이트 기능
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
