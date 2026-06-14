import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE_NAME} | Premium WhatsApp Gateway`,
  description:
    "WhatsApp Gateway profesional: multi-session, auto-reply, scheduler, dan REST API. Mulai gratis.",
  openGraph: {
    title: `${SITE_NAME} | Premium WhatsApp Gateway`,
    description:
      "Self-hosted WhatsApp Gateway dengan multi-device, auto-replies, dan integrasi API.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
