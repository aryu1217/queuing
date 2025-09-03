// src/constants/tags.js
export const TAG_META = {
  "k-pop": { label: "K-POP", bg: "bg-pink-100 dark:bg-pink-900/30" },
  chill: { label: "Chill", bg: "bg-sky-100 dark:bg-sky-900/30" },
  edm: { label: "EDM", bg: "bg-violet-100 dark:bg-violet-900/30" },
  pump: { label: "Pump", bg: "bg-orange-100 dark:bg-orange-900/30" },
  "lo-fi": { label: "Lo-Fi", bg: "bg-amber-100 dark:bg-amber-900/30" },
  study: { label: "Study", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
};

const PALETTE = [
  "bg-rose-100 dark:bg-rose-900/30",
  "bg-cyan-100 dark:bg-cyan-900/30",
  "bg-lime-100 dark:bg-lime-900/30",
  "bg-indigo-100 dark:bg-indigo-900/30",
  "bg-fuchsia-100 dark:bg-fuchsia-900/30",
  "bg-teal-100 dark:bg-teal-900/30",
];

export function normalizeTag(t) {
  return t?.toString().trim().toLowerCase();
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function tagLabel(tag) {
  const key = normalizeTag(tag);
  return TAG_META[key]?.label ?? tag;
}

export function tagClasses(tag) {
  const key = normalizeTag(tag);
  const bg = TAG_META[key]?.bg ?? PALETTE[hash(key) % PALETTE.length];
  return [
    bg,
    "text-[#17171B] dark:text-white",
    "border border-black/10 dark:border-white/10",
  ].join(" ");
}
