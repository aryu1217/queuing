-- 0) enum: 없을 때만 생성 (달러 태그 $do$ + 안쪽은 '문자열')
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_role') THEN
    EXECUTE 'CREATE TYPE public.member_role AS ENUM (''host'',''member'')';
  END IF;
END
$do$ LANGUAGE plpgsql;

-- 1) room_members 테이블 (미니멀)
CREATE TABLE IF NOT EXISTS public.room_members (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id  uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id  uuid NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  role     public.member_role NOT NULL DEFAULT 'member',
  CONSTRAINT room_members_unique UNIQUE (room_id, user_id)
);

-- 2) 인덱스
CREATE INDEX IF NOT EXISTS idx_room_members_room ON public.room_members(room_id);

-- 3) RLS 활성화
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- 4) 정책들 (DROP 후 CREATE)

-- 같은 방 멤버끼리 조회
DROP POLICY IF EXISTS rm_select_same_room ON public.room_members;
CREATE POLICY rm_select_same_room
ON public.room_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_members me
    WHERE me.room_id = room_members.room_id
      AND me.user_id = auth.uid()
  )
);

-- 본인만 가입(행 생성)
DROP POLICY IF EXISTS rm_insert_self ON public.room_members;
CREATE POLICY rm_insert_self
ON public.room_members FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 본인 탈퇴
DROP POLICY IF EXISTS rm_delete_self ON public.room_members;
CREATE POLICY rm_delete_self
ON public.room_members FOR DELETE
USING (user_id = auth.uid());

-- 호스트가 강퇴 가능
DROP POLICY IF EXISTS rm_delete_by_host ON public.room_members;
CREATE POLICY rm_delete_by_host
ON public.room_members FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.rooms r
    WHERE r.id = room_members.room_id
      AND r.host_user_id = auth.uid()
  )
);

-- 5) rooms 조회 정책을 "공개 or 멤버"로 확장 (기존 정책 정리 후 생성)
DROP POLICY IF EXISTS rooms_select_public_or_host   ON public.rooms;
DROP POLICY IF EXISTS rooms_select_public_or_member ON public.rooms;

CREATE POLICY rooms_select_public_or_member
ON public.rooms FOR SELECT
USING (
  is_public
  OR auth.uid() = host_user_id
  OR EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = rooms.id
        AND rm.user_id = auth.uid()
    )
);
