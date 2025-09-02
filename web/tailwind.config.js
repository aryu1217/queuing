// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-noto-sans-kr)", "sans-serif"], // 구글 폰트
        hand: ["var(--font-hand)", "sans-serif"], // 로컬 폰트
      },
    },
  },
  plugins: [],
};
