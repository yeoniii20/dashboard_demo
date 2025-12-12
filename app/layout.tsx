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
  title: "Monitoring",
  description: "monitoring",
  icons: {
    icon: "/logo48.png",
  },
  openGraph: {
    title: "Monitoring",
    description: "monitoring",
    url: "https://monitoring.vercel.app",
    siteName: "monitoring",
    images: [
      {
        url: "https://monitoring.vercel.app/sumnail.png",

        width: 1200,
        height: 630,
        alt: "monitoring 대표 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
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
