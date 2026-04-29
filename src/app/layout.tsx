import type { Metadata } from "next";
import { Caveat, DM_Serif_Display, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

const display = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const script = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cherry Booth",
  description: "A pastel photobooth-inspired Next.js interface clone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${script.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
