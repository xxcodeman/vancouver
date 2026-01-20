import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-cream text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
