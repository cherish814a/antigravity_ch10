import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InsightEngine - Precision Review Analysis",
  description: "쇼핑 리뷰 분석을 위한 인공지능 챗봇 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
