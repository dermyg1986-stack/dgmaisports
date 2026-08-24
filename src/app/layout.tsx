import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://www.drillpitch.com";
const siteName = "DrillPitch";
const title = "DrillPitch — AI Sports Coaching Assistant | Session Plans, Drills & Match Prep";
const description =
  "DrillPitch is an AI-powered coaching assistant for sports coaches: generate training session plans, match preparation, drill libraries, player analysis, and load management in seconds.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | DrillPitch",
  },
  description,
  keywords: [
    "AI sports coaching assistant",
    "training session planner",
    "football drills",
    "match preparation tool",
    "coaching software",
    "drill library",
    "player performance analysis",
  ],
  authors: [{ name: "DGM AI Sports" }],
  creator: "DGM AI Sports",
  publisher: "DGM AI Sports",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title,
    description,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteName,
  applicationCategory: "SportsApplication",
  operatingSystem: "Any (Web)",
  url: siteUrl,
  description,
  publisher: {
    "@type": "Organization",
    name: "DGM AI Sports",
    url: siteUrl,
  },
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
  },
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
