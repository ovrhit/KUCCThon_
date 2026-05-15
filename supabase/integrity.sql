SET client_encoding = 'UTF8';

-- 1. 메시지 길이 제한 (1자 이상 300자 이하)
ALTER TABLE gratitude_logs 
ADD CONSTRAINT check_message_length 
CHECK (char_length(message) >= 1 AND char_length(message) <= 300);

-- 2. 영상 경로 형식 검증 (mp4, mov, webm 확장자 허용)
ALTER TABLE gratitude_logs 
ADD CONSTRAINT check_video_url_format 
CHECK (video_url LIKE '%.mp4' OR video_url LIKE '%.mov' OR video_url LIKE '%.webm');

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

-- 4. 비디오 경로 무결성 검사 (user_id/target_id/filename.mp4 형식을 강제)
CREATE OR REPLACE FUNCTION validate_video_path()
RETURNS TRIGGER AS $$
BEGIN
    -- video_url이 '유저ID/타겟ID/'로 시작하는지 확인
    IF NEW.video_url NOT LIKE (NEW.user_id::text || '/' || NEW.target_id::text || '/%') THEN
        RAISE EXCEPTION 'Invalid video path. Must follow {user_id}/{target_id}/filename.mp4 format.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_video_path_integrity
    BEFORE INSERT OR UPDATE ON gratitude_logs
    FOR EACH ROW
    EXECUTE FUNCTION validate_video_path();
