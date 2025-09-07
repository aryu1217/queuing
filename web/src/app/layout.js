import "./globals.css";
import Providers from "./providers"; // ← React Query Provider
import localFont from "next/font/local";
import { Jua } from "next/font/google";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const jua = Jua({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-jua",
  display: "swap",
});

const hand = localFont({
  src: "./fonts/HandFont.ttf",
  variable: "--font-hand",
  weight: "400",
  style: "normal",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${jua.variable} ${hand.variable}`}>
      <body>
        <Providers>
          {children} <ReactQueryDevtools />
        </Providers>
      </body>
    </html>
  );
}
