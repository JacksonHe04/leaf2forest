import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Serif_SC } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import "./globals.css";

/**
 * Display font — Cormorant Garamond.
 * Used for: hero titles, page titles, large numerals (CLAUDE.md §6.4).
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

/**
 * Body font — Noto Serif SC (思源宋体).
 * Used for: Chinese body text, captions, form labels (CLAUDE.md §6.4).
 */
const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Leaf2Forest · 青阳中学 2019 级 2 班 数字档案馆",
    template: "%s · Leaf2Forest",
  },
  description:
    "Leaf2Forest 是安徽省青阳中学 2019 级 2 班的数字档案馆 —— 记录每一位同学现在在哪里、正在做什么，以及那段共同的高中岁月里留下的声音。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${cormorant.variable} ${notoSerifSC.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <Providers>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
