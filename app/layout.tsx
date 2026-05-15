import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import AppFrame from "@/components/shared/AppFrame";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "한편 - 감사 기록",
  description: "매일의 작은 감사가 모여 하나의 메시지가 됩니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen bg-white text-black`}>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
