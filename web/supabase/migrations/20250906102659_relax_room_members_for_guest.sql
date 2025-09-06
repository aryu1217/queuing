-- supabase/migrations/XXXXXXXXXX_relax_room_members_for_guest.sql

-- 1) user_id 를 NULL 허용으로 변경 (게스트 삽입 가능하게)
ALTER TABLE public.room_members
  ALTER COLUMN user_id DROP NOT NULL;

-- 2) user_id 또는 guest_id 중 정확히 하나만 존재(XOR)
ALTER TABLE public.room_members
  DROP CONSTRAINT IF EXISTS room_members_identity_xor;

ALTER TABLE public.room_members
  ADD CONSTRAINT room_members_identity_xor
  CHECK ( ((user_id IS NOT NULL)::int + (guest_id IS NOT NULL)::int) = 1 );

-- 3) 생성 컬럼: identity_key (u:<uuid> / g:<uuid>)
ALTER TABLE public.room_members
  ADD COLUMN IF NOT EXISTS identity_key text
  GENERATED ALWAYS AS (
    CASE
      WHEN user_id  IS NOT NULL THEN 'u:' || user_id::text
      WHEN guest_id IS NOT NULL THEN 'g:' || guest_id::text
      ELSE NULL
    END
  ) STORED;

-- 4) 방 내 고유 멤버 보장: UNIQUE(room_id, identity_key)
ALTER TABLE public.room_members
  DROP CONSTRAINT IF EXISTS uq_room_members_room_identity;

ALTER TABLE public.room_members
  ADD CONSTRAINT uq_room_members_room_identity
  UNIQUE (room_id, identity_key);

-- 5) 조회용 인덱스(있으면 스킵)
CREATE INDEX IF NOT EXISTS idx_room_members_room ON public.room_members(room_id);
