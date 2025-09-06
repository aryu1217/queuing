-- supabase/migrations/XXXXXXXXXX_fix_rooms_recursive_policy.sql

-- 0) 기존 문제 정책 제거
DROP POLICY IF EXISTS rm_select_same_room        ON public.room_members;
DROP POLICY IF EXISTS rm_select_room_members     ON public.room_members;
DROP POLICY IF EXISTS rm_delete_by_host          ON public.room_members;
DROP POLICY IF EXISTS rooms_select_public_or_host   ON public.rooms;
DROP POLICY IF EXISTS rooms_select_public_or_member ON public.rooms;

-- 1) 헬퍼 함수들 (RLS 우회용, 순환 방지)
CREATE OR REPLACE FUNCTION public.is_room_member(_room_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_members m
    WHERE m.room_id = _room_id
      AND m.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.room_is_public_or_host(_room_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(r.is_public,false) OR (r.host_user_id = auth.uid())
  FROM public.rooms r
  WHERE r.id = _room_id;
$$;

CREATE OR REPLACE FUNCTION public.is_room_host(_room_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT (r.host_user_id = auth.uid())
  FROM public.rooms r
  WHERE r.id = _room_id;
$$;

GRANT EXECUTE ON FUNCTION public.is_room_member(uuid)        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.room_is_public_or_host(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_room_host(uuid)           TO anon, authenticated;

-- 2) 재작성된 RLS 정책 (함수만 호출)

-- room_members: 같은 방 멤버거나, 공개방/호스트면 조회 가능
CREATE POLICY rm_select_room_members
ON public.room_members FOR SELECT
USING ( public.is_room_member(room_id) OR public.room_is_public_or_host(room_id) );

-- 본인 탈퇴/가입 등 기존 정책은 그대로 두세요.
-- 호스트가 멤버 강퇴 가능
CREATE POLICY rm_delete_by_host
ON public.room_members FOR DELETE
USING ( public.is_room_host(room_id) );

-- rooms: 공개 or 호스트 or (멤버) → 조회 가능
CREATE POLICY rooms_select_public_or_member
ON public.rooms FOR SELECT
USING ( is_public OR auth.uid() = host_user_id OR public.is_room_member(id) );
