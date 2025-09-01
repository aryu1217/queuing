import { Jua } from "next/font/google";
import "./globals.css";

const jua = Jua({
  weight: "400", // 단일 굵기
  subsets: ["latin"], // korean 쓰면 에러
  variable: "--font-jua",
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={jua.variable}>
      <body>{children}</body>
    </html>
  );
}
