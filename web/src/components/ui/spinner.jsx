// components/ui/Spinner.jsx
"use client";

export default function Spinner({
  size = 28, // px
  thickness = 3, // border width(px)
  label = "로딩 중…",
  fullscreen = false, // true면 화면 정중앙
  className = "",
}) {
  return (
    <div
      className={`${
        fullscreen ? "min-h-screen" : "min-h-[120px]"
      } w-full flex items-center justify-center ${className}`}
    >
      <div
        role="status"
        aria-label={label}
        className="animate-spin rounded-full border-[#17171B]/20 border-t-[#17171B]"
        style={{ width: size, height: size, borderWidth: thickness }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
