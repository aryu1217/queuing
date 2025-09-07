-- rooms 테이블에 최대 인원 컬럼 추가
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS max_listeners integer NOT NULL DEFAULT 25;

-- 2~200 사이만 허용 (원하면 숫자 조정)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rooms_max_listeners_chk'
  ) THEN
    ALTER TABLE public.rooms
      ADD CONSTRAINT rooms_max_listeners_chk
      CHECK (max_listeners BETWEEN 2 AND 200);
  END IF;
END $$;

COMMENT ON COLUMN public.rooms.max_listeners IS '방 최대 인원 (2~200)';
