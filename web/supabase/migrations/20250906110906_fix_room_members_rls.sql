-- supabase/migrations/XXXXXXXXXX_fix_room_members_rls.sql

-- 필수: 테이블에 RLS가 켜져 있어야 함
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- 이미 만든 SELECT/호스트 삭제 정책은 유지. (있으면 스킵)
-- 여기선 자기 자신 삽입/수정/삭제 정책만 추가

-- 1) INSERT: 로그인 사용자는 자기 user_id로만 삽입 가능
DROP POLICY IF EXISTS rm_insert_self ON public.room_members;
CREATE POLICY rm_insert_self
ON public.room_members FOR INSERT TO authenticated
WITH CHECK ( user_id = auth.uid() );

-- 2) UPDATE: upsert 충돌 시 UPDATE 허용(자기 행만)
DROP POLICY IF EXISTS rm_update_self ON public.room_members;
CREATE POLICY rm_update_self
ON public.room_members FOR UPDATE TO authenticated
USING     ( user_id = auth.uid() )
WITH CHECK( user_id = auth.uid() );

-- 3) DELETE: 본인 탈퇴 허용(호스트 강퇴 정책과 별개)
DROP POLICY IF EXISTS rm_delete_self ON public.room_members;
CREATE POLICY rm_delete_self
ON public.room_members FOR DELETE TO authenticated
USING ( user_id = auth.uid() );
