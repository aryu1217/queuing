//src/components/room/queue/add-song-modal.jsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import { useSetAtom } from "jotai";
import { currentVideoIdAtom } from "@/atoms/player";
import { Link2, Loader2, X } from "lucide-react";

export default function AddSongModal({ open, onClose }) {
  const setVideoId = useSetAtom(currentVideoIdAtom);
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    const value = url.trim();
    if (!value) {
      setErr("유튜브 링크를 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/yt/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "링크를 확인해 주세요.");

      setVideoId(data.videoId);
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
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-[#17171B]">
            유튜브 링크 추가
          </h3>
          <button
            type="button"
            className="p-1 rounded hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
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
                placeholder="https://youtu.be/… 또는 https://www.youtube.com/watch?v=…"
                className="w-full outline-none text-sm placeholder:text-gray-300 text-[#17171B]"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-[#17171B] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "추가"}
            </button>
          </div>

          {err && <p className="text-xs text-red-500">{err}</p>}

          <p className="text-[11px] text-gray-500">
            watch / youtu.be / shorts / embed 링크 모두 인식합니다.
          </p>
        </form>
      </div>
    </Modal>
  );
}
