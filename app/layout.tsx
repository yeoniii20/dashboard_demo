import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../public/style/custom.css";
import "../public/style/tabulator_semanticui.min.css";
import LayoutShell from "./components/layout/layoutShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dashboard_ooi.vercel.app"),

  title: {
    default: "Dashboard",
    template: "%s | Queue Monitoring Dashboard",
  },
  description:
    "서버·Queue·Topic 상태를 한눈에 모니터링할 수 있는 관제용 대시보드입니다.",

  icons: {
    icon: "/icons96.png",
  },

  openGraph: {
    title: "Queue / Topic / Server Monitoring Dashboard",
    description:
      "빌드, 큐, 토픽, 서버 리소스를 통합해서 모니터링하는 대시보드 UI입니다.",
    url: "https://dashboard_ooi.vercel.app",
    siteName: "Queue Monitoring Dashboard",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Queue / Topic / Server 모니터링 대시보드 대표 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Queue / Topic / Server Monitoring Dashboard",
    description:
      "서버와 메시지 인프라 상태를 한눈에 보는 다크 테마 관제 대시보드.",
    images: ["/thumbnail.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
