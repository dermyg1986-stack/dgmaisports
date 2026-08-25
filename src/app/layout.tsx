import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.drillpitch.com";
const siteName = "DGM AI Sports";
const title = "DGM AI Sports Coach | AI Coaching Assistant for Session Planning & Match Prep";
const description =
  "DGM AI Sports Coach is a free AI-powered coaching assistant for football coaches — generate training session plans, match-day tactics, drills, player analysis, and recovery programmes in seconds.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | DGM AI Sports",
  },
  description,
  keywords: [
    "AI sports coach",
    "football coaching assistant",
    "training session planner",
    "match preparation tool",
    "coaching drills generator",
    "player performance analysis",
    "sports analysis UK",
    "AI coach assistant",
  ],
  applicationName: siteName,
  authors: [{ name: "DGM AI Sports" }],
  creator: "DGM AI Sports",
  publisher: "DGM AI Sports",
  category: "Sports",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0f1117",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "DGM AI Sports",
      url: siteUrl,
      description: "UK sports analysis and education platform.",
    },
    {
      "@type": "WebApplication",
      name: "DGM AI Sports Coach",
      url: siteUrl,
      description,
      applicationCategory: "SportsApplication",
      operatingSystem: "Any (web-based)",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "GBP",
      },
      publisher: { "@id": `${siteUrl}/#organization` },
      featureList: [
        "Session planning",
        "Match preparation",
        "Drill library",
        "Player analysis",
        "Load management",
        "Set piece design",
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
