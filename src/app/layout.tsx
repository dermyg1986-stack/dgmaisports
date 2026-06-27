import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DGM AI Sports Coach",
  description: "AI-powered assistant for sports coaches — session planning, match preparation, and player analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
