-- 1) room_members.identity_key: generated column으로 재정의
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'room_members'
      AND column_name  = 'identity_key'
  ) THEN
    -- 기존 컬럼을 제거(일반 컬럼일 수 있으니)
    EXECUTE 'ALTER TABLE public.room_members DROP COLUMN identity_key';
  END IF;
END $$;

ALTER TABLE public.room_members
  ADD COLUMN identity_key text
  GENERATED ALWAYS AS (coalesce(user_id::text, guest_id::text)) STORED;

-- 2) 유니크 인덱스 (room_id + identity_key)
CREATE UNIQUE INDEX IF NOT EXISTS room_members_room_id_identity_key_key
  ON public.room_members (room_id, identity_key);

-- 3) 과거 NULL host_nickname 보정
UPDATE public.rooms r
SET host_nickname = p.nickname
FROM public.profiles p
WHERE r.host_user_id = p.id
  AND (r.host_nickname IS NULL OR btrim(r.host_nickname) = '');

-- (선택) FK들이 없다면 만들어두기 — 안정성 향상
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'room_members_room_id_fkey'
  ) THEN
    ALTER TABLE public.room_members
      ADD CONSTRAINT room_members_room_id_fkey
      FOREIGN KEY (room_id) REFERENCES public.rooms(id)
      ON DELETE CASCADE;
  END IF;
END $$;
