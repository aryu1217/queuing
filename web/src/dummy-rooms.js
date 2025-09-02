export const DummyRooms = [
  {
    id: "r1",
    title: "카페 BGM",
    hostNickname: "aryu_1217",
    isPrivate: false,
    tags: ["Chill", "K-POP"],
    listenersCount: 8, // 현재 인원
    capacity: 8, // 기본 무료 플랜: 8명
    isUnlimited: false, // 유료 플랜이면 true
    nowPlaying: {
      title: "Love Dive",
      artist: "IVE",
      durationSec: 210,
      positionMs: 45_000,
    },
  },
  {
    id: "r2",
    title: "헬스장 근손실방지",
    hostNickname: "큐돌이",
    isPrivate: true,
    tags: ["EDM", "Pump"],
    listenersCount: 5,
    capacity: 8,
    isUnlimited: false,
    nowPlaying: {
      title: "The Nights",
      artist: "Avicii",
      durationSec: 240,
      positionMs: 120_000,
    },
  },
  {
    id: "r3",
    title: "잔잔한 공부방",
    hostNickname: "Dj1212",
    isPrivate: false,
    tags: ["Lo-Fi", "Study"],
    listenersCount: 52,
    capacity: null, // null이거나 값 없음 → 무제한 처리
    isUnlimited: true, // 유료 플랜
    nowPlaying: {
      title: "lofi hip hop beats",
      artist: "Nujabes",
      durationSec: 180,
      positionMs: 10_000,
    },
  },
];
