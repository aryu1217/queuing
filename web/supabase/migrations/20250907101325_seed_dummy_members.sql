create extension if not exists "pgcrypto";
insert into public.room_members (room_id, guest_id, guest_nickname, role)
select 
  'da91391d-b4f2-46b5-9c46-11c2328726ed'::uuid,
  gen_random_uuid(),
  'dummy-user' || lpad(g::text, 2, '0'),
  'member'::member_role
from generate_series(1, 10) as g;
