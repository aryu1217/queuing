-- supabase/migrations/XXXXXXXXXX_enable_guest_rooms.sql

-- rooms: host_user_id를 nullable로, 게스트 호스트 컬럼 추가
ALTER TABLE public.rooms
  ALTER COLUMN host_user_id DROP NOT NULL;

ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS host_guest_id uuid,
  ADD COLUMN IF NOT EXISTS host_nickname text;

-- 호스트 식별자 XOR 제약(유저 또는 게스트 중 하나만)
ALTER TABLE public.rooms
  DROP CONSTRAINT IF EXISTS rooms_host_xor_chk;
ALTER TABLE public.rooms
  ADD CONSTRAINT rooms_host_xor_chk
  CHECK (
    (host_user_id IS NOT NULL AND host_guest_id IS NULL)
    OR (host_user_id IS NULL AND host_guest_id IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_rooms_host_guest ON public.rooms(host_guest_id);

-- room_members: 게스트 회원 컬럼 추가 + 고유성
ALTER TABLE public.room_members
  ADD COLUMN IF NOT EXISTS guest_id uuid,
  ADD COLUMN IF NOT EXISTS guest_nickname text;

-- 기존 unique(room_id,user_id) 제약 제거(있으면)
ALTER TABLE public.room_members
  DROP CONSTRAINT IF EXISTS room_members_unique;

-- 부분 고유 인덱스 두 개(유저/게스트 각각 중복 방지)
CREATE UNIQUE INDEX IF NOT EXISTS uq_room_members_room_user
  ON public.room_members(room_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_room_members_room_guest
  ON public.room_members(room_id, guest_id)
  WHERE guest_id IS NOT NULL;

-- 공개 방은 누구나 멤버 목록 SELECT 허용 (게스트 조회 지원)
DROP POLICY IF EXISTS rm_select_public_room ON public.room_members;
CREATE POLICY rm_select_public_room
ON public.room_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE r.id = room_members.room_id
      AND r.is_public = true
  )
);
