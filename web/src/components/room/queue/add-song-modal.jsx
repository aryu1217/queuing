// src/components/room/queue/add-song-modal.jsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { useSetAtom } from "jotai";
import { enqueueOrPlayAtom } from "@/atoms/queue";
import { Link2, Loader2, X } from "lucide-react";

const DEFAULT_DURATION_SEC = 180;
const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

async function getOEmbed(videoId) {
  const urls = [
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`,
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u);
      if (!r.ok) continue;
      const j = await r.json();
      return {
        title: j?.title || null,
        thumbnailUrl: j?.thumbnail_url || null,
      };
    } catch {}
  }
  return { title: null, thumbnailUrl: null };
}

export default function AddSongModal({ open, onClose }) {
  const enqueueOrPlay = useSetAtom(enqueueOrPlayAtom);
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    const value = url.trim();
    if (!value) return setErr("유튜브 링크를 입력해 주세요.");

    try {
      setLoading(true);
      // 1) URL → videoId
      const res = await fetch("/api/yt/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "링크를 확인해 주세요.");

      const videoId = data.videoId;
      // 2) oEmbed 보강
      const meta = await getOEmbed(videoId);

      const track = {
        id: crypto.randomUUID(),
        source: "youtube",
        video_id: videoId,
        title: meta.title || "(제목 불러오는 중)",
        durationSec: DEFAULT_DURATION_SEC,
        thumbnailUrl: meta.thumbnailUrl || thumb(videoId),
        status: "queued",
        created_at: new Date().toISOString(),
      };

      // ✅ 핵심: 여기서만 큐/재생 분기 처리
      enqueueOrPlay(track);

      onClose?.();
      setUrl("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#17171B]">
            유튜브 링크 추가
          </h3>
          <button
            type="button"
            className="p-1 rounded hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-xs text-gray-600">YouTube URL</label>
          <div className="flex gap-2">
            <div className="flex-1 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
              <Link2 className="h-4 w-4 text-gray-500" />
              <input
                type="url"
                placeholder="https://youtu.be/... 또는 https://www.youtube.com/watch?v=..."
                className="w-full outline-none text-sm placeholder:text-gray-300 text-[#17171B]"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-[#17171B] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "추가"}
            </button>
          </div>

          {err && <p className="text-xs text-red-500">{err}</p>}
          <p className="text-[11px] text-gray-500">
            길이는 임시값으로 표시됩니다.
          </p>
        </form>
      </div>
    </Modal>
  );
}
