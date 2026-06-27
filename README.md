# After Six — aftersixco

A weeknight recipe membership website, built with Next.js and powered by Claude Opus 4.8.

## Features

- **Recipe collection** — 74+ chef-tested recipes across breakfast, lunch, dinner, healthy, smoothies, and desserts & snacks
- **Weekly meal plans** — Ready-made 7-day plans (Balanced, High-Protein, Veggie) with per-day calories
- **Kitchen Assistant** — A Claude-powered chat that recommends real recipes from the collection
- **Help & Support assistant** — A Claude-powered chat for membership, billing, and account questions
- **Membership & pricing** — Monthly / annual tiers with £ / $ / € region switching (Stripe-ready)

### Assistant safety

Both assistants are strictly scoped: no medical, weight-loss, or unsafe advice; mandatory allergy caution (always check the full ingredient list and cross-contamination); polite, on-topic responses only. They present as recipe/meal-planning helpers, not health experts.

## Setup

```bash
cp .env.local.example .env.local
# Add your Anthropic API key to .env.local

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- **Next.js 15** (App Router) — site served from `public/index.html`
- **Anthropic SDK** (`@anthropic-ai/sdk`) with **Claude Opus 4.8**
- API routes: `/api/recipe-assistant` (Kitchen Assistant), `/api/help-assistant` (Support)
