# DrillPitch

An AI-powered coaching assistant for sports coaches, built with Next.js and Claude Opus 4.8.

## Features

- **Session Planning** — Generate structured training sessions tailored to your squad
- **Match Preparation** — Tactical plans, set pieces, and opponent analysis
- **Drill Library** — Specific drills with setup, coaching points, and progressions
- **Player Analysis** — Performance insights and development recommendations
- **Load Management** — Periodisation and recovery planning
- **Streaming responses** — Real-time AI output via Claude Opus 4.8 with adaptive thinking

## Setup

```bash
cp .env.local.example .env.local
# Add your Anthropic API key to .env.local

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## SEO configuration

- `NEXT_PUBLIC_SITE_URL` — the canonical production URL (`https://www.drillpitch.com`), used for metadata, `sitemap.xml`, and `robots.txt`.
- `GOOGLE_SITE_VERIFICATION` — the content value from Google Search Console's "HTML tag" verification method (Settings → Ownership verification). Once set, redeploy and click "Verify" in Search Console.
- `BING_SITE_VERIFICATION` — the equivalent verification code from Bing Webmaster Tools, if used.

## Stack

- **Next.js 15** (App Router)
- **Anthropic SDK** (`@anthropic-ai/sdk`)
- **Claude Opus 4.8** with adaptive thinking and streaming
