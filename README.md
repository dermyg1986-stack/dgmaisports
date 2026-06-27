# DGM AI Sports Coach Assistant

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

## Stack

- **Next.js 15** (App Router)
- **Anthropic SDK** (`@anthropic-ai/sdk`)
- **Claude Opus 4.8** with adaptive thinking and streaming
