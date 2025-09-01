# 🧰 Tech Stack

## 🎨 Frontend

- **Framework**: Next.js (App Router, React 19)
- **언어**: JavaScript (필요 시 점진적 TypeScript 도입 가능)
- **상태관리(전역 UI 상태)**: Jotai (모달/토글/로컬 UI 상태, 현재 방 코드, 내 닉네임 등)
- **서버 상태 & 캐싱**: TanStack Query (React Query) – 큐 목록, 방 메타, 비동기 요청 캐시/재시도
- **스타일**: Tailwind CSS (유틸리티 퍼스트), lucide-react (아이콘)
- **애니메이션**: Framer Motion (말풍선/리액션/토스트)
- **폼/검증 (선택)**: react-hook-form + zod
- **QR 생성**: qrcode.react

## 🎵 Playback / Search

- **재생**: YouTube IFrame Player API (광고 포함, Premium 로그인 시 무광고)
- **검색(옵션)**: YouTube Data API v3
  - `search.list` + `videos.list`로 길이/메타 보강
  - API Key는 서버 라우트(Next.js API Route / Supabase Edge Function)에서 보호

## ⚡ Realtime & Backend (Serverless)

- **BaaS**: Supabase
  - **DB**: Postgres
  - **보안**: RLS(Row-Level Security) – 방 단위 접근 제한
  - **실시간**: Supabase Realtime
    - Presence: 접속 중인 유저/닉네임 카드 표시
    - Broadcast: 말풍선 채팅/이모지(휘발성, DB 비저장) 전파
  - **Edge Functions**:
    - 호스트 컨트롤 (재생/시크/다음곡)
    - 스킵 과반 처리
    - 레이트리밋
- **배포**:
  - Web → Vercel
  - DB/Functions → Supabase Hosted

## 🛠️ 퀄리티/개발 효율

- **린트/포맷**: ESLint + Prettier
- **테스트 (선택)**: Vitest + React Testing Library
- **커밋 규칙**: Conventional Commits (`feat:`, `fix:`, `chore:` …)

---

# 🧩 기능별 기술 매핑

## 방 생성 / 입장 (QR/코드)

- **UI/라우팅**: Next.js App Router (`/create`, `/r/[code]`)
- **QR**: qrcode.react
- **상태**: Jotai(현재 방 코드/닉네임), React Query(방 메타 fetch)
- **DB**: `rooms`, `room_members` (+ RLS)

## 신청곡 큐 (추가/보기)

- **UI**: Tailwind
- **상태**: React Query(큐 목록 캐싱), Jotai(내 로컬 선택 상태)
- **DB**: `tracks` (videoId, title, duration, status, order)
- **실시간**: Realtime (Broadcast `QUEUE_ADD`, `QUEUE_ADVANCE`)

## 동기 재생 (호스트 컨트롤 → 전원 보정)

- **플레이어**: YouTube IFrame Player
- **권위 타임라인**: `playback_state` (서버/호스트 기준 위치)
- **실시간**: Realtime (Broadcast `PLAYBACK_UPDATE`), 하트비트 3~5초
- **보정 로직**: 클라에서 RTT 보정 → 드리프트 > 300~500ms 시 `seekTo`
- **Edge Function**: `control` (play/pause/seek/next) + 권한 검증

## 스킵 투표 / 리액션

- **투표**: DB(`votes`) 집계 or Edge Function에서 과반 판단 후 `QUEUE_ADVANCE`
- **리액션/말풍선**: Realtime Broadcast(휘발) + TTL 3~5초 표시, 레이트리밋

## 채팅 (닉네임 카드 위 말풍선)

- **접속자 표시**: Presence (닉네임/색/카드 인덱스)
- **말풍선**: Broadcast `CHAT_BUBBLE` (DB 비저장), 클라 TTL 제거
- **필터/리밋**: 클라 선필터 + (필요 시) Edge Function 게이트

## 검색 (옵션)

- **서버 라우트**: Next.js Route Handler (`/api/search`) → YouTube Data API v3 호출
- **결과**: `search.list` → 선택된 id 묶어서 `videos.list`로 duration/embeddable 확인
- **캐시/리밋**: React Query 캐시 + IP/room rate limit

## 권한 / 보안

- **호스트 토큰**: 방 생성 시 발급(해시 저장), Edge Function에서 검증
- **RLS**: room_id 스코프 제한, write는 최소화/Function 경유
- **환경변수**: API Keys는 서버(함수/Route)에서만 사용

## 배포

- **Vercel**: Root Directory = `web`, 환경변수 등록
- **Supabase**: `supabase db push`, `supabase functions deploy`

---

# 📦 핵심 의존성 (요약)

---

# 🗄️ DB 테이블 (요약)

- **rooms** (id, code, title, is_active, created_at)
- **room_members** (id, room_id, nickname, role, joined_at)
- **tracks** (id, room_id, source, video_id, title, duration_sec, status, order_index, created_at)
- **playback_state** (room_id PK, track_id, is_playing, server_position_ms, server_updated_at)
- **votes** (id, room_id, track_id, member_id, type[skip|like], created_at)

> 모든 테이블 **RLS 활성화**, 방 스코프 정책 적용.

---

# 🧪 동기화 전략 (한 줄)

- **호스트 권위 타임라인 + 하트비트 브로드캐스트**
- 클라에서 RTT 보정 후 **드리프트 임계치 초과 시 자동 `seekTo`**
- 광고/버퍼링으로 10~20초 밀려도 **광고 종료 직후 즉시 보정**해서 합류
