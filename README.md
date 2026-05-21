# JJK Sorcerer — 2D (Discord Activity client)

Top-down **Phaser 3** client for the [jjkbot](https://github.com/js91tech/jjkbot) game.  
All rules and saves live in **jjkbot** (`@jjk/game-core` + SQLite). This repo is **UI only**.

## Architecture

```text
jjk-game-2d (this repo)  →  HTTP  →  jjkbot apps/api  →  game-core  →  jjk.db
jjkbot discord-bot     ─────────────────────────────────────────────→  same DB
```

Use the **same Discord user ID** and **same `DATABASE_PATH`** on Railway as the bot.

## Local dev

**Terminal 1 — API (jjkbot repo):**

```bash
cd ../jjk-bot
npm install
npm run db:init
ALLOW_DEV_AUTH=true npm run start:api
```

**Terminal 2 — 2D client (this repo):**

```bash
npm install
cp .env.example .env
# Set VITE_DEV_DISCORD_ID to your Discord user ID (same as bot account)
npm run dev
```

Open http://localhost:5173 — move with **WASD**, use HUD buttons or walk to purple zones and press **E**.

## Discord Activity setup

1. Discord Developer Portal → your **same app** as the bot → **Activities** → enable Embedded App.
2. URL Mapping → root points to hosted `dist/` (e.g. Railway static or `npm run build` + CDN).
3. Set `VITE_DISCORD_CLIENT_ID` and `VITE_API_URL` to production API.
4. On API service: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `ACTIVITY_ORIGINS=https://your-activity-url`, `ALLOW_DEV_AUTH=false`.

## Build

```bash
npm run build
# Serve dist/ as static site (Railway, Cloudflare Pages, etc.)
```

## Env

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | jjkbot `@jjk/api` base URL |
| `VITE_DISCORD_CLIENT_ID` | Same Application ID as bot |
| `VITE_DEV_DISCORD_ID` | Local testing without Discord iframe |
