// src/constants/tags.js  (전체 교체)
export const TAG_META = {
  kpop: {
    label: "K-POP",
    className: "border bg-rose-50 text-rose-700 border-rose-200",
  },
  jpop: {
    label: "J-POP",
    className: "border bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  },
  pop: {
    label: "POP",
    className: "border bg-amber-50 text-amber-700 border-amber-200",
  },

  indie: {
    label: "인디",
    className: "border bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  indie_band: {
    label: "인디밴드",
    className: "border bg-green-50 text-green-700 border-green-200",
  },

  rock: {
    label: "록/락",
    className: "border bg-stone-100 text-stone-800 border-stone-300",
  },
  metal: {
    label: "메탈",
    className: "border bg-neutral-100 text-neutral-800 border-neutral-300",
  },
  ballad: {
    label: "발라드",
    className: "border bg-blue-50 text-blue-700 border-blue-200",
  },

  rnb: {
    label: "R&B",
    className: "border bg-violet-50 text-violet-700 border-violet-200",
  },
  hiphop: {
    label: "힙합",
    className: "border bg-slate-100 text-slate-800 border-slate-300",
  },

  edm: {
    label: "EDM",
    className: "border bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  house: {
    label: "하우스",
    className: "border bg-teal-50 text-teal-700 border-teal-200",
  },
  techno: {
    label: "테크노",
    className: "border bg-indigo-50 text-indigo-700 border-indigo-200",
  },

  lofi: {
    label: "Lo-fi",
    className: "border bg-lime-50 text-lime-700 border-lime-200",
  },
  jazz: {
    label: "재즈",
    className: "border bg-purple-50 text-purple-700 border-purple-200",
  },
  blues: {
    label: "블루스",
    className: "border bg-sky-50 text-sky-700 border-sky-200",
  },
  classical: {
    label: "클래식",
    className: "border bg-yellow-50 text-yellow-800 border-yellow-200",
  },

  ost: {
    label: "OST",
    className: "border bg-orange-50 text-orange-700 border-orange-200",
  },
  anime: {
    label: "애니",
    className: "border bg-pink-50 text-pink-700 border-pink-200",
  },
  acoustic: {
    label: "어쿠스틱",
    className: "border bg-emerald-50 text-emerald-800 border-emerald-200",
  },

  chill: {
    label: "Chill",
    className: "border bg-cyan-50 text-cyan-800 border-cyan-200",
  },
  study: {
    label: "공부/집중",
    className: "border bg-gray-100 text-gray-800 border-gray-300",
  },
  workout: {
    label: "운동",
    className: "border bg-red-50 text-red-700 border-red-200",
  },
  driving: {
    label: "드라이브",
    className: "border bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  party: {
    label: "파티",
    className: "border bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  },
};

export function tagLabel(key) {
  return TAG_META[key]?.label ?? key;
}

export function tagClasses(key) {
  return (
    TAG_META[key]?.className ?? "border bg-white text-gray-700 border-gray-200"
  );
}
