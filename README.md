# AFL 23-0 — All-Era Team Builder

> **Status, September 2026:** GitHub Actions are currently paused on this repo, so automated data refreshes and deploys are not running. The data and any live site reflect the last build.

**▶ Play it: [afl23-0.com](https://afl23-0.com/)**

Inspired by [23-0.com](https://23-0.com), rebuilt for Aussie rules. Spin a random
**club + decade** from 130 years of VFL/AFL history, pick a player from that pool,
place him on the oval — then run a 23-game season simulated against the real teams
of those eras and chase a perfect **23-0**.

Every rating, salary and simulation input is derived from **real scraped data** —
no hardcoded players, no invented numbers. Data access patterns follow the
open-source [fitzRoy](https://github.com/jimmyday12/fitzRoy) project (the package
itself is not used).

## Game modes

| Mode | Squad | Twist |
|---|---|---|
| **Classic 5** | DEF · MID · RUC · FWD · UTL | 2 re-rolls |
| **Full 23** | back six · forward six · 2 wingers + centre · 2 followers · 1 ruck · 5 bench | 5 re-rolls |
| **Salary Cap 23** | as Full 23 | $21.2M cap, pools listed by price, **3 lifelines** to swap a picked player (from his original spin pool) |

Every mode has an **era multi-select** — play all 14 decades (1890s–2020s) or any
subset; selecting one decade plays a pure single-era game judged against that
decade's real teams. Picks show the **top 20** of the rolled club+era (by rating,
or by salary in cap mode) with **search across the entire pool**. Players can be
**moved around the field between turns** — scores recompute for their new role
(off-position players are graded against the era's real specialists in that role).

## Data sources

- **afltables.com** — per-season player stats grouped by club (1897→now),
  every match result, Grand Final lineups, Brownlow tallies 1924–1964
- **footywire.com** — Brownlow tallies + winners 1965→now, All-Australian teams
  1991→now, Rising Star, player profiles/positions (requires browser User-Agent)
- **wikidata.org** — playing positions for pre-1965 players

How the rating engine, salaries and simulation work: see `/about` in the app.

## Running it

```bash
npm install

# 1. scrape everything (cached & resumable; first run ~15 min)
npm run scrape

# 2. crawl footywire profiles for positions (long; resumable; prioritised by career games)
npm run positions

# 3. compute ratings/salaries/strengths and export JSON for the web app
npm run export

# 4. play
npm run dev          # http://localhost:3000
```

### Keeping the 2020s fresh

```bash
npm run refresh
```

Re-scrapes only current-decade stats, results and awards, recomputes and
re-exports. Ratings use per-game averages, so established players stay stable
mid-season — refreshes mainly add new players, new games and end-of-season honours.

## Layout

```
pipeline/   TypeScript ETL: scrapers (cheerio) -> SQLite -> JSON artifacts
web/        Next.js app; reads web/public/data/*.json; sim runs client-side
```
