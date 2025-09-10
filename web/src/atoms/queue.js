// src/atoms/queue.js
"use client";

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { currentVideoIdAtom } from "@/atoms/player";

export const myQueueAtom = atomWithStorage("my-queue-v1", []);

// 재생 중이면 큐에 push, 재생 중이 아니면 즉시 재생
export const enqueueOrPlayAtom = atom(null, (get, set, track) => {
  const cur = get(myQueueAtom) ?? [];
  const now = get(currentVideoIdAtom);
  if (!now) {
    set(currentVideoIdAtom, track.video_id);
    // 첫 곡은 바로 재생, 큐에는 넣지 않음
    set(myQueueAtom, cur);
  } else {
    set(myQueueAtom, [...cur, track]);
  }
});

// 현재 곡 끝났을 때 다음 곡 재생
export const advanceQueueAtom = atom(null, (get, set) => {
  const cur = get(myQueueAtom) ?? [];
  if (cur.length === 0) {
    set(currentVideoIdAtom, null);
    return;
  }
  const [next, ...rest] = cur;
  set(currentVideoIdAtom, next.video_id);
  set(myQueueAtom, rest);
});
