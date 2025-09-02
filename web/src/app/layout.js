import { Jua } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const jua = Jua({
  weight: "400",
  subsets: ["latin"], // 현재 설정 그대로 OK
  variable: "--font-jua",
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={jua.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
