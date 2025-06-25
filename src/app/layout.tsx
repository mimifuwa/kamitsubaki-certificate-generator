import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_JP } from "next/font/google";

import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const appName = "神椿市市民票ジェネレーター";
const description = "神椿市の市民票を生成できます";

export const metadata: Metadata = {
  title: appName,
  description,

  openGraph: {
    title: appName,
    description,
    url: process.env.BASE_URL,
    siteName: appName,
    images: [
      {
        url: "https://kamitsubaki-cert.mimifuwa.cc/ogp.png",
        width: 1200,
        height: 630,
        alt: appName,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description,
    images: ["https://kamitsubaki-cert.mimifuwa.cc/ogp.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-gray-50">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerifJP.variable} antialiased min-h-screen flex flex-col`}
      >
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
