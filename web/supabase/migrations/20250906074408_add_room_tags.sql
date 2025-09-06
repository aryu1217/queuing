-- supabase/migrations/XXXXXXXXXX_fix_room_tags_unique_check.sql
-- rooms.tags(text[]) + 제약(허용 목록/중복 금지/최대 5개) + 인덱스

-- 0) 컬럼 보강(없으면 추가)
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[];

-- 1) 배열 중복 검사 함수 (CHECK에서 사용)
--    서브쿼리를 함수 안에서 처리하면 CHECK 제약에서 사용 가능
CREATE OR REPLACE FUNCTION public.array_has_duplicates(arr anyarray)
RETURNS boolean
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM unnest(arr) AS x
    GROUP BY x
    HAVING COUNT(*) > 1
  );
$$;

-- 2) 허용 태그 집합(앱 TAG_META 키들과 반드시 일치시켜 주세요)
ALTER TABLE public.rooms
  DROP CONSTRAINT IF EXISTS rooms_tags_allowed_chk;

ALTER TABLE public.rooms
  ADD CONSTRAINT rooms_tags_allowed_chk
  CHECK (
    tags <@ ARRAY[
      'kpop','jpop','pop',
      'indie','indie_band',
      'rock','metal','ballad',
      'rnb','hiphop',
      'edm','house','techno',
      'lofi','jazz','blues','classical',
      'ost','anime','acoustic',
      'chill','study','workout','driving','party',
      'citypop','trot','folk','soul','trap'
    ]::text[]
  );

-- 3) 배열 내 중복 금지 (함수 사용)
ALTER TABLE public.rooms
  DROP CONSTRAINT IF EXISTS rooms_tags_unique_chk;

ALTER TABLE public.rooms
  ADD CONSTRAINT rooms_tags_unique_chk
  CHECK (NOT public.array_has_duplicates(tags));

-- 4) 최대 5개 제한
ALTER TABLE public.rooms
  DROP CONSTRAINT IF EXISTS rooms_tags_max5_chk;

ALTER TABLE public.rooms
  ADD CONSTRAINT rooms_tags_max5_chk
  CHECK (COALESCE(array_length(tags, 1), 0) <= 5);

-- 5) 태그 검색용 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_rooms_tags_gin
  ON public.rooms USING gin (tags);
