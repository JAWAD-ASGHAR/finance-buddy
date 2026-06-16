import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4, Geist } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  organizationJsonLd,
  rootMetadata,
  webSiteJsonLd,
} from "@/lib/seo";
import { themeInitScript } from "@/lib/theme-config";
import "./globals.css";
import { cn } from "@/lib/utils";

import "@/bones/registry";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  ...rootMetadata,
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-AU"
      className={cn("h-full", "scroll-smooth", "antialiased", inter.variable, sourceSerif.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className="min-h-full flex flex-col font-sans text-foreground bg-background"
        suppressHydrationWarning
      >
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        {children}
      </body>
    </html>
  );
}
