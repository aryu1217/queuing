-- 확장(해시용)
create extension if not exists pgcrypto;

-- rooms 테이블
create table if not exists public.rooms (
  id             uuid primary key default gen_random_uuid(),
  title          text        not null,
  code           text        not null unique,
  host_user_id   uuid        not null,
  is_public      boolean     not null default true,
  is_locked      boolean     not null default false,
  password_hash  text,                  -- 잠금 아닐 때 NULL
  password_hint  text,                  -- (옵션)
  created_at     timestamptz not null default now(),

  constraint rooms_host_user_fk
    foreign key (host_user_id) references auth.users(id)
      on delete no action on update no action,

  -- 잠금이면 해시 필수, 잠금 해제면 해시 없어야 함
  constraint rooms_lock_requires_hash
    check (
      (is_locked = false and password_hash is null)
      or (is_locked = true  and password_hash is not null)
    )
);

-- RLS 켜기
alter table public.rooms enable row level security;

-- Policies
-- 공개 방은 누구나(로그인 사용자) 조회, 비공개는 호스트만
create policy rooms_select_public_or_host
  on public.rooms for select
  using ( is_public or auth.uid() = host_user_id );

-- 호스트만 생성
create policy rooms_insert_host_only
  on public.rooms for insert
  with check ( auth.uid() = host_user_id );

-- 호스트만 수정/삭제
create policy rooms_update_host_only
  on public.rooms for update
  using ( auth.uid() = host_user_id )
  with check ( auth.uid() = host_user_id );

create policy rooms_delete_host_only
  on public.rooms for delete
  using ( auth.uid() = host_user_id );
