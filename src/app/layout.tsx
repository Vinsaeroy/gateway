import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { TopLoader } from "@/components/ui/top-loader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || process.env.NEXTAUTH_URL || "https://rifalos.shop"),
  title: "RifalosID | Premium WhatsApp Management",
  description: "Next-generation WhatsApp Gateway & Management Dashboard",
  robots: {
    index: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
    follow: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover" as const,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no" suppressHydrationWarning className="scroll-smooth notranslate">
      <head>
        {/* Disable browser translators (Google Translate, Edge Translate, etc.).
            App content includes dynamic data (WhatsApp JIDs, session names,
            message content) that must NOT be translated. Translators also
            mutate the DOM, breaking React reconciliation. */}
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-foreground bg-background selection:bg-primary/30 selection:text-primary-foreground min-h-screen flex flex-col notranslate`}
        suppressHydrationWarning
      >
        {/* Belt-and-suspenders DOM patch: even if a translator bypasses
            the meta tags above (some extensions ignore them), we make
            DOM mutations fail-soft so React keeps rendering. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(typeof Node==='undefined')return;var p=Node.prototype;if(p.__translateFixApplied)return;p.__translateFixApplied=true;var origRemove=p.removeChild;p.removeChild=function(child){if(child.parentNode!==this)return child;return origRemove.apply(this,arguments);};var origInsert=p.insertBefore;p.insertBefore=function(newNode,refNode){if(refNode&&refNode.parentNode!==this)return origInsert.call(this,newNode,null);return origInsert.apply(this,arguments);};})();`,
          }}
        />
        {/* Global ambient background glow for premium feel */}
        <div className="fixed inset-0 -z-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background dark:from-primary/10 dark:via-background dark:to-background pointer-events-none" />
        <Providers>
          <TopLoader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
