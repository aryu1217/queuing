// src/dummy-queue-songs.js

/** UI 목업용 더미 트랙 데이터 */
export const DUMMY_QUEUE_SONGS = [
  {
    id: "t1",
    title: "밤하늘의 별처럼 (Live ver.)",
    thumbnailUrl: "https://picsum.photos/seed/track1/320/180",
    durationSec: 213, // 3:33
  },
  {
    id: "t2",
    title: "City Drive — Chill Mix",
    thumbnailUrl: "https://picsum.photos/seed/track2/320/180",
    durationSec: 254, // 4:14
  },
  {
    id: "t3",
    title: "EDM Festival Drop 2025",
    thumbnailUrl: "https://picsum.photos/seed/track3/320/180",
    durationSec: 189, // 3:09
  },
  {
    id: "t4",
    title: "Lo-Fi Beats to Study To",
    thumbnailUrl: "https://picsum.photos/seed/track4/320/180",
    durationSec: 276, // 4:36
  },
  {
    id: "t5",
    title: "Morning Acoustic Guitar",
    thumbnailUrl: "https://picsum.photos/seed/track5/320/180",
    durationSec: 201, // 3:21
  },
  {
    id: "t6",
    title: "K-Pop Dance Hit 2025",
    thumbnailUrl: "https://picsum.photos/seed/track6/320/180",
    durationSec: 233, // 3:53
  },
  {
    id: "t7",
    title: "Relaxing Jazz in Paris",
    thumbnailUrl: "https://picsum.photos/seed/track7/320/180",
    durationSec: 315, // 5:15
  },
  {
    id: "t8",
    title: "Night Drive Synthwave",
    thumbnailUrl: "https://picsum.photos/seed/track8/320/180",
    durationSec: 248, // 4:08
  },
  {
    id: "t9",
    title: "Chillhop Study Beats",
    thumbnailUrl: "https://picsum.photos/seed/track9/320/180",
    durationSec: 198, // 3:18
  },
];

/** 125 -> "2:05" 형식으로 표시 */
export const fmtDuration = (sec = 0) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};
