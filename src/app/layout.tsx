import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "반려 도깨비불",
  description: "비 오는 첫 번째 밤 — 반려 도깨비불과의 첫 만남",
};

/** 디자인.md §16.1 — mobile-first, and zoom must stay available. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07080b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      // Dark-only app: the shadcn surface tokens are remapped onto the night
      // palette under `.dark` in globals.css.
      className={`dark ${geistMono.variable} h-full antialiased`}
    >
      <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
      {/*
        Pretendard is the first font in the document's stack (디자인.md §9.1) and is
        not on Google Fonts, so it comes from its own CDN. The dynamic-subset build
        ships Hangul in per-glyph slices, so a Korean screen downloads only the
        syllables it draws. `--font-app` in globals.css carries the full fallback chain.
      */}
      <link
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        rel="stylesheet"
        precedence="default"
      />
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
