-- supabase/migrations/XXXXXXXXXX_fix_room_members_conflict.sql

-- 0) 기존 부분 인덱스 제거(있으면 스킵)
DROP INDEX IF EXISTS uq_room_members_room_user;
DROP INDEX IF EXISTS uq_room_members_room_guest;

-- 1) XOR 보강: user_id 또는 guest_id 중 정확히 하나만 존재
ALTER TABLE public.room_members
  DROP CONSTRAINT IF EXISTS room_members_identity_xor;

ALTER TABLE public.room_members
  ADD CONSTRAINT room_members_identity_xor
  CHECK (
    ((user_id IS NOT NULL)::int + (guest_id IS NOT NULL)::int) = 1
  );

-- 2) 생성 컬럼: identity_key (회원 타입 prefix + uuid)
--    충돌 처리용 고유 키: 예) u:xxxxxxxx / g:yyyyyyyy
ALTER TABLE public.room_members
  ADD COLUMN IF NOT EXISTS identity_key text
  GENERATED ALWAYS AS (
    CASE
      WHEN user_id  IS NOT NULL THEN 'u:' || user_id::text
      WHEN guest_id IS NOT NULL THEN 'g:' || guest_id::text
      ELSE NULL
    END
  ) STORED;

-- 3) 고유 제약: 한 방에서 같은 identity_key는 1개만
ALTER TABLE public.room_members
  DROP CONSTRAINT IF EXISTS uq_room_members_room_identity;

ALTER TABLE public.room_members
  ADD CONSTRAINT uq_room_members_room_identity
  UNIQUE (room_id, identity_key);

-- (선택) 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_room_members_room ON public.room_members(room_id);
