import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap", axes: ["opsz"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: "Maven · AI CMO for local service businesses", template: "%s · Maven" },
  description:
    "Enter your website. Maven reads your site, Google profile, reviews and competitors, then gives you the fixes that matter, a 90-day plan and drafts ready to approve.",
  openGraph: {
    title: "Maven · AI CMO for local service businesses",
    description: "Find out why customers call your competitor instead. A full marketing diagnosis in about three minutes.",
    type: "website",
    siteName: "Maven",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Resolve the theme before paint so there is no flash.
const themeScript = `(function(){try{var t=localStorage.getItem('maven-theme-v2')||'dark';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
