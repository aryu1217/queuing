"use client";

import { useAtom } from "jotai";
import { myQueueAtom } from "@/atoms/queue";
import Modal from "@/components/ui/modal";
import { X, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { fmtDuration } from "@/dummy-queue-songs";

export default function MyQueueManageModal({ open, onClose }) {
  const [items, setItems] = useAtom(myQueueAtom);

  const handleRemove = (id) => {
    setItems((prev) => (prev ?? []).filter((t) => t.id !== id));
  };

  // TODO: 위/아래 이동 로직 직접 연결(예: setItems로 스왑)
  const handleMoveUp = (index) => {
    // e.g., swap index-1 <-> index
    // setItems((prev) => { ... });
  };
  const handleMoveDown = (index) => {
    // e.g., swap index <-> index+1
    // setItems((prev) => { ... });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#17171B]">나의 큐 관리</h3>
          <button
            type="button"
            className="p-1 rounded hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!items?.length ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
            아직 추가한 곡이 없어요.
          </div>
        ) : (
          <ul className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {items.map((t, i) => {
              const isFirst = i === 0;
              const isLast = i === items.length - 1;

              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 shrink-0 text-xs tabular-nums text-gray-500">
                      {i + 1}
                    </span>
                    <img
                      src={t.thumbnailUrl}
                      alt=""
                      width={64}
                      height={36}
                      className="h-9 w-16 rounded object-cover"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[#17171B]">
                        {t.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {fmtDuration(t.durationSec)}
                      </div>
                    </div>
                  </div>

                  {/* 컨트롤 영역 */}
                  <div className="ml-2 flex items-center gap-2">
                    {/* 위/아래 세그먼트 버튼 */}
                    <div
                      role="group"
                      className="inline-flex overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        aria-label="위로"
                        title="위로"
                        disabled={isFirst}
                        onClick={() => !isFirst && handleMoveUp(i)}
                        className={[
                          "h-8 w-8 grid place-items-center text-gray-700 transition",
                          isFirst
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-gray-50 active:scale-[.98]",
                        ].join(" ")}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>

                      <div className="h-8 w-px bg-gray-200" aria-hidden />

                      <button
                        type="button"
                        aria-label="아래로"
                        title="아래로"
                        disabled={isLast}
                        onClick={() => !isLast && handleMoveDown(i)}
                        className={[
                          "h-8 w-8 grid place-items-center text-gray-700 transition",
                          isLast
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-gray-50 active:scale-[.98]",
                        ].join(" ")}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    {/* 삭제 버튼 (아이콘 라운드) */}
                    <button
                      type="button"
                      onClick={() => handleRemove(t.id)}
                      aria-label="삭제"
                      title="삭제"
                      className="h-8 w-8 grid place-items-center rounded-full border border-gray-200 text-red-600 hover:bg-red-50 active:scale-[.98] transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
