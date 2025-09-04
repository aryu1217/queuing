// components/ui/Spinner.jsx
"use client";

export default function Spinner({
  size = 28, // px
  thickness = 3, // border width(px)
  label = "로딩 중…",
  className = "",
}) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-live="polite"
      aria-busy="true"
      className={`inline-block ${className}`}
    >
      <div
        className="animate-spin rounded-full border-[#17171B]/20 border-t-[#17171B]"
        style={{ width: size, height: size, borderWidth: thickness }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
