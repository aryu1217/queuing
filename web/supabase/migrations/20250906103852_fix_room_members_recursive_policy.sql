-- supabase/migrations/XXXXXXXXXX_fix_room_members_recursive_policy.sql

-- 1) 현재 정책 제거(있다면)
DROP POLICY IF EXISTS rm_select_same_room  ON public.room_members;
DROP POLICY IF EXISTS rm_select_public_room ON public.room_members;

-- 2) "현재 사용자(auth.uid())가 해당 room의 멤버인가?" 함수
--    SECURITY DEFINER로 오너 권한에서 조회 → RLS 재귀 없음
CREATE OR REPLACE FUNCTION public.is_room_member(_room_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.room_members m
    WHERE m.room_id = _room_id
      AND m.user_id = auth.uid()
  );
$$;

-- 공개 실행 권한(클라이언트에서 정책 평가 시 호출 가능해야 함)
REVOKE ALL ON FUNCTION public.is_room_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_room_member(uuid) TO authenticated, anon;

-- 3) 재귀 없는 SELECT 정책 재작성
--  - 로그인 멤버는 같은 방 멤버 목록 조회 가능: public.is_room_member(room_id)
--  - 공개 방은 누구나 조회 가능(게스트 포함)
--  - (안전) 방 호스트도 조회 가능
CREATE POLICY rm_select_room_members
ON public.room_members FOR SELECT
USING (
  public.is_room_member(room_id)
  OR EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = room_members.room_id
        AND (r.is_public = true OR r.host_user_id = auth.uid())
    )
);

-- 나머지 정책(INSERT/DELETE 등)은 변경 없음
-- INSERT: WITH CHECK (user_id = auth.uid())
-- DELETE(본인/호스트) 등 기존 그대로 유지
