import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Galaxy 🚀",
  description: "장거리 연애를 위한 감성 모바일 웹 앱",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-cream">{children}</body>
    </html>
  );
}
