"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BASE_PATH, loadMeta } from "@/lib/game/data";
import AdSlot, { AD_SLOTS } from "@/components/AdSlot";
import ModelTeaser from "@/components/ModelTeaser";
import MarketMoverPromo from "@/components/MarketMoverPromo";
import {
  Badge, badges, dailyNumber, GameRecord, readProfile, summary, todayMelbourne, todaysDaily,
} from "@/lib/game/profile";
import { BoardEntry, fetchBoard, LEADERBOARD_URL } from "@/lib/game/leaderboard";
import { Meta, Mode } from "@/lib/game/types";

const MODES: { id: Mode; name: string; tag: string; desc: string }[] = [
  {
    id: "classic5",
    name: "Classic 5",
    tag: "the original",
    desc: "Five spins, five picks — one per line: DEF, MID, RUC, FWD and a Utility. Chase 23-0.",
  },
  {
    id: "full23",
    name: "Full 23",
    tag: "deep squad",
    desc: "Draft a true match-day 23: back six, forward six, wingers and centre, two followers, a ruck — and five on the bench.",
  },
  {
    id: "cap23",
    name: "Salary Cap 23",
    tag: "hard mode",
    desc: "Full 23 under a salary cap. Stars cost a fortune — spend like a list manager.",
  },
  {
    id: "gauntlet",
    name: "The Gauntlet",
    tag: "survival",
    desc: "Pick five, then beat every decade's champion team in a best-of-three — 1890s to now. Lose a series, lose the run.",
  },
  {
    id: "spoon",
    name: "Wooden Spoon",
    tag: "anti-footy",
    desc: "Build the WORST side imaginable and chase a perfect 0-23. Harder than it sounds.",
  },
];

export default function Home() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [mode, setMode] = useState<Mode>("classic5");
  const [eras, setEras] = useState<Set<number>>(new Set());
  const [daily, setDaily] = useState<GameRecord | null>(null);
  const [prof, setProf] = useState<{ s: ReturnType<typeof summary>; b: Badge[] } | null>(null);
  const [oneClub, setOneClub] = useState("");
  const [board, setBoard] = useState<{ daily: BoardEntry[]; club: BoardEntry[] } | null>(null);
  const [otd, setOtd] = useState<{ y: number; r: string; t1: string; s1: number; t2: string; s2: number } | null>(null);
  const [season, setSeason] = useState<{
    year: number; round: number;
    ladder: { team: string; w: number; l: number; d: number; pts: number; pct: number }[];
    results: { t1: string; s1: number; t2: string; s2: number; v: string }[];
  } | null>(null);

  useEffect(() => {
    loadMeta().then((m) => {
      setMeta(m);
      // default to the modern game; the full 130 years is one tap away
      setEras(new Set(m.decades.filter((d) => d >= 1980)));
    });
    setDaily(todaysDaily() ?? null);
    const p = readProfile();
    setProf({ s: summary(p), b: badges(p) });
    // today's slice of footy history (Melbourne time)
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Australia/Melbourne", month: "2-digit", day: "2-digit",
    }).format(new Date()).replace("/", "-");
    fetch(`${BASE_PATH}/data/onthisday.json`)
      .then((r) => r.json())
      .then((d) => setOtd(d[key] ?? null))
      .catch(() => {});
    fetchBoard(todayMelbourne()).then(setBoard).catch(() => {});
    fetch(`${BASE_PATH}/data/season-current.json`)
      .then((r) => r.json())
      .then(setSeason)
      .catch(() => {});
  }, []);

  const toggleEra = (d: number) => {
    setEras((prev) => {
      const next = new Set(prev);
      if (next.has(d)) {
        if (next.size > 1) next.delete(d);
      } else {
        next.add(d);
      }
      return next;
    });
  };

  const allEras = meta ? eras.size === meta.decades.length : true;
  const eraParam = meta ? `&eras=${[...eras].sort((a, b) => a - b).join(",")}` : "";

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <MarketMoverPromo />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "How are AFL players rated in 23-0?", acceptedAnswer: { "@type": "Answer", text: "Every player is rated within their own decade against their peers, using era-relative per-game statistics from afltables.com plus real honours from footywire.com — Brownlow votes, All-Australian selections, premierships from actual Grand Final lineups and leading-goalkicker titles. Each decade is calibrated to the same scale so eras compete fairly." } },
            { "@type": "Question", name: "Is it possible to go 23-0?", acceptedAnswer: { "@type": "Answer", text: "Barely. Seasons are simulated against all-star teams drawn from history's best, the fixture leans toward quality, and no side escapes the chance of an upset. Even the greatest team ever assembled almost never gets through untouched — that's the chase." } },
            { "@type": "Question", name: "Is AFL 23-0 free?", acceptedAnswer: { "@type": "Answer", text: "Yes — every mode, the daily challenges and the trivia games are free to play in any browser, with no account needed." } },
            { "@type": "Question", name: "What data is AFL 23-0 built on?", acceptedAnswer: { "@type": "Answer", text: "130 years of real VFL/AFL data: per-season player stats since 1897, every match result, Grand Final lineups, Brownlow tallies, All-Australian teams and Coleman Medals — refreshed weekly." } },
          ],
        }) }}
      />

      {/* competition toggle — AFL is the main game; AFLW mode is one tap away */}
      <div className="flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-line bg-pitch-light p-1">
          <span className="rounded-full bg-grass px-4 py-1.5 font-display text-xs font-black uppercase tracking-wide text-pitch">AFL</span>
          <Link
            href="/aflw"
            className="rounded-full px-4 py-1.5 font-display text-xs font-black uppercase tracking-wide text-slate-400 transition hover:bg-[#ff5e44] hover:text-white"
          >
            AFLW →
          </Link>
        </span>
      </div>

      <header className="mt-5 text-center">
        <div className="relative inline-block">
          <div className="hero-glow" aria-hidden />
          <div className="font-display relative text-6xl font-black tracking-tight text-grass sm:text-7xl">
            23<span className="text-slate-500">–</span>0
          </div>
        </div>
        <p className="mt-1 text-sm uppercase tracking-[0.3em] text-slate-400">
          AFL all-era edition
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
          Spin a club and era from 130 years of footy, draft your side, and chase a
          perfect 23-0 season.
        </p>

        {/* primary CTAs — reachable without scrolling */}
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/play?mode=${mode}${eraParam}`}
            className="font-display w-full max-w-xs rounded-xl bg-grass px-10 py-4 text-2xl font-black text-pitch transition hover:scale-105 hover:bg-lime-300 sm:w-auto"
          >
            START THE SPIN ▸
          </Link>
          <Link
            href="/play?daily=1"
            className={`font-display w-full max-w-xs rounded-xl px-8 py-4 text-lg font-black transition sm:w-auto ${
              daily
                ? "border border-gold/50 text-gold hover:bg-gold/10"
                : "border-2 border-gold bg-gold/10 text-gold hover:bg-gold/20"
            }`}
          >
            {daily ? `DAILY #${dailyNumber()} ✓` : `🏆 DAILY #${dailyNumber()}`}
          </Link>
        </div>
        <p className="mt-2 text-xs text-slate-600">
          mode &amp; eras configurable below · {meta?.decades.length ?? 14} decades
        </p>
      </header>

      {/* model section — surfaced high so it's one of the first things people see */}
      <ModelTeaser />

      {/* how it works */}
      <section className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["🎰", "Spin", "a random club and decade"],
          ["🧠", "Pick", "any player from that pool"],
          ["🏉", "Place", "them on the oval — position matters"],
          ["🏆", "Simulate", "a real season. Chase 23-0."],
        ].map(([emoji, title, desc]) => (
          <div key={title as string} className="rounded-xl border border-line bg-pitch-light p-3 text-center">
            <div className="text-xl">{emoji}</div>
            <div className="font-display text-sm font-black text-slate-100">{title}</div>
            <div className="mt-0.5 text-[11px] leading-tight text-slate-500">{desc}</div>
          </div>
        ))}
      </section>

      {daily && (
        <p className="mt-6 text-center text-sm text-slate-400">
          Today&apos;s daily: <b className="text-grass">{daily.wins}-{daily.losses}</b>
          {daily.flag ? " 🏆" : ""} — back tomorrow for #{dailyNumber() + 1}.
        </p>
      )}

      {/* current season — real ladder + latest results (stats-site centrepiece) */}
      {season && season.ladder?.length > 0 && (
        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-black">
              {season.year} Season <span className="text-sm text-slate-500">· Round {season.round}</span>
            </h2>
            <Link href="/ladder" className="text-xs font-semibold text-ice hover:underline">full ladder →</Link>
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {/* ladder top 8 */}
            <div className="overflow-hidden rounded-2xl border border-line bg-pitch-light">
              <div className="flex items-center justify-between border-b border-line/60 px-4 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Ladder · top 8</span>
                <Link href="/ladder" className="text-[11px] text-ice hover:underline">all 18 →</Link>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {season.ladder.slice(0, 8).map((r, i) => (
                    <tr key={r.team} className="border-t border-line/40">
                      <td className="py-1.5 pl-3 pr-1 font-display font-black text-grass">{i + 1}</td>
                      <td className="py-1.5 font-display font-black text-slate-100">{r.team}</td>
                      <td className="py-1.5 text-right text-xs text-slate-500">{r.w}-{r.l}{r.d ? `-${r.d}` : ""}</td>
                      <td className="py-1.5 pr-1 text-right text-xs text-slate-500">{r.pct.toFixed(1)}%</td>
                      <td className="py-1.5 pr-3 text-right font-display font-black text-gold">{r.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* latest round results */}
            <div className="overflow-hidden rounded-2xl border border-line bg-pitch-light">
              <div className="flex items-center justify-between border-b border-line/60 px-4 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ice">Round {season.round} results</span>
                <Link href="/results" className="text-[11px] text-ice hover:underline">all results →</Link>
              </div>
              <div className="grid gap-1 p-2">
                {season.results.slice(0, 9).map((m, i) => {
                  const w1 = m.s1 > m.s2, w2 = m.s2 > m.s1;
                  return (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-pitch px-3 py-1.5 text-sm">
                      <span className={`min-w-0 flex-1 truncate text-right font-display font-black ${w1 ? "text-slate-100" : "text-slate-500"}`}>{m.t1}</span>
                      <span className={`w-7 shrink-0 text-right font-display font-black tabular-nums ${w1 ? "text-grass" : "text-slate-500"}`}>{m.s1}</span>
                      <span className="shrink-0 text-[10px] text-slate-600">v</span>
                      <span className={`w-7 shrink-0 font-display font-black tabular-nums ${w2 ? "text-grass" : "text-slate-500"}`}>{m.s2}</span>
                      <span className={`min-w-0 flex-1 truncate font-display font-black ${w2 ? "text-slate-100" : "text-slate-500"}`}>{m.t2}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* choose your mode (drives the START button above) */}
      <h2 className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-slate-500">
        choose a mode, then hit start
      </h2>
      <section className="mt-3 grid gap-4 sm:grid-cols-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-2xl border p-5 text-left transition ${
              mode === m.id
                ? "border-grass bg-card shadow-[0_0_24px_-6px] shadow-grass/40"
                : "border-line bg-pitch-light hover:bg-card"
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-gold">{m.tag}</div>
            <div className="font-display mt-1 text-2xl font-black">{m.name}</div>
            <p className="mt-2 text-sm text-slate-400">{m.desc}</p>
          </button>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-pitch-light p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-black">Eras in play</h2>
          {meta && (
            <button
              className="text-xs font-semibold uppercase tracking-wider text-ice hover:underline"
              onClick={() =>
                setEras(allEras ? new Set([meta.decades[meta.decades.length - 1]]) : new Set(meta.decades))
              }
            >
              {allEras ? "pick one era" : "select all"}
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Your spins only land on these decades — and your season is simulated against the real
          teams of these decades.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {meta?.decades.map((d) => (
            <button
              key={d}
              onClick={() => toggleEra(d)}
              className={`rounded-full border px-4 py-1.5 font-display text-sm font-bold transition ${
                eras.has(d)
                  ? "border-grass bg-grass/15 text-grass"
                  : "border-line text-slate-500 hover:text-slate-300"
              }`}
            >
              {d}s
            </button>
          ))}
        </div>
      </section>

      {/* global ladder — appears once the worker is live */}
      {LEADERBOARD_URL && board && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-pitch-light p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-black text-gold">Daily #{dailyNumber()} — world top 5</h2>
              <Link href="/leaderboard" className="text-xs text-ice hover:underline">full board →</Link>
            </div>
            <div className="mt-2 grid gap-1">
              {board.daily.length === 0 && (
                <p className="py-2 text-center text-xs text-slate-500">no entries yet — be first</p>
              )}
              {board.daily.slice(0, 5).map((e, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-pitch px-3 py-1 text-sm">
                  <span className={`w-5 shrink-0 text-right font-display font-black ${i < 3 ? "text-gold" : "text-slate-500"}`}>
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-display font-black text-slate-100">
                    {e.n}
                  </span>
                  {e.fin && (
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${e.fin === "P" ? "bg-gold/20 text-gold" : "bg-ice/10 text-ice"}`}>
                      {e.fin === "P" ? "🏆" : e.fin}
                    </span>
                  )}
                  <span className="shrink-0 font-display font-black text-grass">{e.w}-{e.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-grass/50 bg-pitch-light p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-black text-grass">The 23-0 Club</h2>
              <Link href="/leaderboard" className="text-xs text-ice hover:underline">full board →</Link>
            </div>
            <div className="mt-2 grid gap-1">
              {board.club.length === 0 && (
                <p className="py-2 text-center text-xs text-slate-500">
                  nobody has run the table yet — immortality awaits
                </p>
              )}
              {board.club.slice(0, 5).map((e, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-pitch px-3 py-1 text-sm">
                  <span className="shrink-0 font-display font-black text-grass">23-0</span>
                  <span className="min-w-0 flex-1 truncate font-display font-black text-slate-100">
                    {e.n} {e.f && "🏆"}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {new Date(e.t).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* one-club legends */}
      <section className="mt-8 rounded-2xl border border-line bg-pitch-light p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-black">One-Club Legends</h2>
            <p className="mt-1 text-xs text-slate-500">
              Build the best 23 in your club&apos;s history — spins roll only the decades your club existed.
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={oneClub}
              onChange={(e) => setOneClub(e.target.value)}
              className="rounded-xl border border-line bg-card px-3 py-2 font-display text-sm font-black text-slate-200 outline-none focus:border-grass/60"
            >
              <option value="">Pick your club…</option>
              {meta &&
                [...new Set(Object.values(meta.clubsByDecade).flat())].sort().map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
            </select>
            <Link
              href={oneClub ? `/play?mode=full23&club=${encodeURIComponent(oneClub)}` : "#"}
              aria-disabled={!oneClub}
              className={`rounded-xl px-5 py-2 font-display text-sm font-black ${
                oneClub
                  ? "bg-grass text-pitch hover:bg-lime-300"
                  : "pointer-events-none border border-line text-slate-600"
              }`}
            >
              DRAFT →
            </Link>
          </div>
        </div>
      </section>

      {/* on this day */}
      {otd && (
        <section className="mt-8 rounded-2xl border border-line bg-pitch-light px-5 py-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ice">
            on this day in {otd.y}
          </span>
          <p className="mt-1 text-sm text-slate-300">
            <b className={otd.s1 > otd.s2 ? "text-grass" : ""}>{otd.t1} {otd.s1}</b>
            {" "}{otd.s1 > otd.s2 ? "defeated" : otd.s1 === otd.s2 ? "drew with" : "fell to"}{" "}
            <b className={otd.s2 > otd.s1 ? "text-grass" : ""}>{otd.t2} {otd.s2}</b>
            {otd.r === "GF" ? " in the Grand Final" : /^(PF|SF|QF|EF)$/.test(otd.r) ? " in a final" : ` in round ${otd.r.slice(1)}`}.
          </p>
        </section>
      )}

      {/* sponsor slot — between the games grid and the modes above it */}
      <AdSlot slot={AD_SLOTS.home} className="mt-8" />

      {/* more games */}
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/legend"
          className="lift rounded-2xl border border-line bg-pitch-light p-5 hover:border-ice/50 hover:bg-card"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-ice">
            daily mystery · 6 guesses
          </div>
          <div className="font-display mt-1 text-2xl font-black">
            Guess the Legend <span className="text-ice">#{dailyNumber()}</span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            One mystery great per day. Every miss unlocks a clue — era, stats, honours, clubs.
          </p>
        </Link>
        <Link
          href="/battler"
          className="lift rounded-2xl border border-line bg-pitch-light p-5 hover:border-ice/50 hover:bg-card"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-ice">
            daily cult hero · 6 guesses
          </div>
          <div className="font-display mt-1 text-2xl font-black">
            Guess the Battler <span className="text-ice">#{dailyNumber()}</span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            No superstars — name the honest toiler. Only real fans survive this one.
          </p>
        </Link>
        <Link
          href="/higher"
          className="lift rounded-2xl border border-line bg-pitch-light p-5 hover:border-ice/50 hover:bg-card"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-ice">
            endless streak
          </div>
          <div className="font-display mt-1 text-2xl font-black">Higher or Lower</div>
          <p className="mt-2 text-sm text-slate-400">
            Two players, one stat — who averaged more? Real numbers, brutal streaks.
          </p>
        </Link>
        <Link
          href="/awarded"
          className="lift rounded-2xl border border-line bg-pitch-light p-5 hover:border-ice/50 hover:bg-card"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-ice">
            award trivia streak
          </div>
          <div className="font-display mt-1 text-2xl font-black">Who Won It?</div>
          <p className="mt-2 text-sm text-slate-400">
            Near-identical seasons, one Brownlow. Pick the winner from the stat lines.
          </p>
        </Link>
        <Link
          href="/tips"
          className="lift rounded-2xl border border-line bg-pitch-light p-5 hover:border-ice/50 hover:bg-card"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-ice">
            tip real history
          </div>
          <div className="font-display mt-1 text-2xl font-black">The Tipping Run</div>
          <p className="mt-2 text-sm text-slate-400">
            Real matches since 1920. Pick winners, ride the streak — call an upset for double points.
          </p>
        </Link>
        <Link
          href="/greats"
          className="lift rounded-2xl border border-line bg-pitch-light p-5 hover:border-ice/50 hover:bg-card"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-ice">
            the hall of fame
          </div>
          <div className="font-display mt-1 text-2xl font-black">The Greats</div>
          <p className="mt-2 text-sm text-slate-400">
            Every decade&apos;s top 25, by position and club. Settle the pub argument.
          </p>
        </Link>
        <Link
          href="/dynasty"
          className="lift rounded-2xl border border-line bg-pitch-light p-5 hover:border-ice/50 hover:bg-card"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-ice">
            coach an era
          </div>
          <div className="font-display mt-1 text-2xl font-black">Dynasty</div>
          <p className="mt-2 text-sm text-slate-400">
            Your legends age, decline and retire. How many flags before the era ends?
          </p>
        </Link>
        <Link
          href="/duel"
          className="lift rounded-2xl border border-line bg-pitch-light p-5 hover:border-ice/50 hover:bg-card"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-ice">
            pass and play
          </div>
          <div className="font-display mt-1 text-2xl font-black">Draft Duel</div>
          <p className="mt-2 text-sm text-slate-400">
            Two coaches, one phone, alternating spins — settle it with a best-of-5.
          </p>
        </Link>
        <Link
          href="/rebuild"
          className="lift rounded-2xl border border-line bg-pitch-light p-5 hover:border-ice/50 hover:bg-card"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-ice">
            one trade per season
          </div>
          <div className="font-display mt-1 text-2xl font-black">The Rebuild</div>
          <p className="mt-2 text-sm text-slate-400">
            Inherit a shocker and climb from basket case to premiers. Speedrun it.
          </p>
        </Link>
      </section>

      {/* coach's record */}
      {prof?.s && (
        <section className="mt-8 rounded-2xl border border-line bg-pitch-light p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-black">Your coaching record</h2>
            <Link href="/me" className="text-xs text-ice hover:underline">full career →</Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-300">
            <span>Seasons <b className="font-display text-lg text-slate-100">{prof.s.played}</b></span>
            <span>Premierships <b className="font-display text-lg text-gold">{prof.s.flags}</b></span>
            <span>Best <b className="font-display text-lg text-grass">{prof.s.best}</b></span>
            {prof.s.perfects > 0 && (
              <span>Perfect seasons <b className="font-display text-lg text-grass">{prof.s.perfects}</b></span>
            )}
          </div>
          {prof.b.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {prof.b.map((b) => (
                <span
                  key={b.label}
                  className="rounded-full bg-gold/10 px-2.5 py-1 text-[11px] font-semibold text-gold"
                >
                  {b.emoji} {b.label}
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-[10px] text-slate-600">Stored on this device only.</p>
        </section>
      )}

      <div className="mt-8 text-center">
        <Link
          href={`/play?mode=${mode}${eraParam}`}
          className="font-display inline-block rounded-xl bg-grass px-12 py-4 text-2xl font-black text-pitch transition hover:scale-105 hover:bg-lime-300"
        >
          START THE SPIN
        </Link>
        {meta && (
          <p className="mt-4 text-xs text-slate-600">
            {meta.decades.length} decades · data generated{" "}
            {new Date(meta.generatedAt).toLocaleDateString()} from{" "}
            {meta.sources.join(", ")} ·{" "}
            <Link href="/greats" className="text-slate-400 underline hover:text-ice">
              the greats
            </Link>{" "}
            ·{" "}
            <Link href="/premierships" className="text-slate-400 underline hover:text-ice">premierships</Link>
          </p>
        )}
      </div>

      {/* genuine publisher content — what the site is, how the ratings work, FAQ */}
      <section className="mt-12 border-t border-line pt-8 text-sm leading-relaxed text-slate-300">
        <h2 className="font-display text-2xl font-black text-slate-100">What is 23-0?</h2>
        <p className="mt-3">
          23-0 is a free, fan-made Australian rules football game and statistics site. You spin a
          random VFL/AFL club and decade, draft a side from the players who actually played in that
          era, then simulate a perfect 23-game, undefeated &ldquo;23&ndash;0&rdquo; season. Alongside
          the game, the site is a complete reference to 130 years of league history: a page for every
          club, every season from 1897 to today, and thousands of players — all built from real,
          publicly available records rather than invented numbers.
        </p>

        <h2 className="font-display mt-7 text-2xl font-black text-slate-100">How players are rated</h2>
        <p className="mt-3">
          Every player carries an <b>era-fair rating</b> out of 100. The key idea is that a player is
          measured only against the contemporaries they actually played with and against — the same
          decade, the same conditions — using standardised statistical output, honours such as
          Brownlow Medals, All-Australian selections and leading-goalkicker awards, and finals impact.
          Because each era is scored within itself, a champion from the 1920s can be compared fairly
          with one from the 2020s, even though the game they played looked very different. Ratings are
          recomputed when a player is moved to a new position, reflecting how their output translates
          to that role.
        </p>

        <h2 className="font-display mt-7 text-2xl font-black text-slate-100">Where the data comes from</h2>
        <p className="mt-3">
          All statistics are drawn from public records — primarily afltables.com, footywire.com and
          Wikidata — and refreshed regularly through the season. Nothing on the site is a hand-tuned
          or hardcoded rating; every number you see is derived from that underlying data. 23-0 is an
          independent fan project and is not affiliated with, endorsed by, or associated with the AFL,
          AFLW or any club.
        </p>

        <h2 className="font-display mt-7 text-2xl font-black text-slate-100">Frequently asked questions</h2>
        <dl className="mt-3 space-y-4">
          <div>
            <dt className="font-display font-black text-slate-100">Is 23-0 free to play?</dt>
            <dd className="mt-1">
              Yes. Every game mode and every stats page is free, and you don&apos;t need an account.
              The site is supported by advertising and voluntary donations.
            </dd>
          </div>
          <div>
            <dt className="font-display font-black text-slate-100">What does &ldquo;23&ndash;0&rdquo; mean?</dt>
            <dd className="mt-1">
              A home-and-away AFL season is 23 rounds. Going &ldquo;23&ndash;0&rdquo; means winning
              every single game — the perfect, undefeated season the game challenges you to build.
            </dd>
          </div>
          <div>
            <dt className="font-display font-black text-slate-100">Which game mode should I start with?</dt>
            <dd className="mt-1">
              Classic 5 is the quickest way in — five spins, five picks. Full 23 builds a complete
              23-player squad with re-rolls, and Salary Cap 23 adds a budget constraint for players
              who want a tougher optimisation puzzle.
            </dd>
          </div>
          <div>
            <dt className="font-display font-black text-slate-100">How often is the data updated?</dt>
            <dd className="mt-1">
              Player and result data refresh regularly during the season, so ladders, results and
              ratings stay current as rounds are played.
            </dd>
          </div>
        </dl>

        <p className="mt-7 text-center text-xs text-slate-600">
          Explore <Link href="/clubs" className="underline hover:text-ice">every club</Link> ·{" "}
          <Link href="/seasons" className="underline hover:text-ice">every season</Link> ·{" "}
          <Link href="/greats" className="underline hover:text-ice">the greats</Link> ·{" "}
          <Link href="/about" className="underline hover:text-ice">about &amp; contact</Link>
        </p>
      </section>
    </main>
  );
}
