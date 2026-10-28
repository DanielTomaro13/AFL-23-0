"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/game/data";

const HIDE_KEY = "afl230-marketmover-promo-until";
const HIDE_MS = 14 * 24 * 60 * 60 * 1000;
const DELAY_MS = 1500;
const HREF =
  "https://www.marketmover.net?utm_source=afl23-0&utm_medium=popup&utm_campaign=crosspromo";

function hideForTwoWeeks() {
  try {
    localStorage.setItem(HIDE_KEY, String(Date.now() + HIDE_MS));
  } catch {
    /* private mode / blocked storage — still close for this view */
  }
}

function stillHidden(): boolean {
  try {
    return Number(localStorage.getItem(HIDE_KEY) || 0) > Date.now();
  } catch {
    return false;
  }
}

/**
 * Small non-modal promo. It sits in the corner so the primary game CTA
 * (Start the spin / the draft) stays clickable. Dismiss hides it for 14 days.
 */
export default function MarketMoverPromo() {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (stillHidden()) return;
    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const dismiss = () => {
      hideForTwoWeeks();
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    const onClick = (e: MouseEvent) => {
      const el = cardRef.current;
      if (!el || !(e.target instanceof Node) || el.contains(e.target)) return;
      dismiss();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  if (!open) return null;

  const dismiss = () => {
    hideForTwoWeeks();
    setOpen(false);
  };

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="fixed bottom-3 left-3 z-40 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-line bg-pitch-light p-3 shadow-2xl sm:bottom-4 sm:left-auto sm:right-4"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-start gap-2.5">
        <img
          src={`${BASE_PATH}/marketmover-mark.png`}
          alt=""
          width={36}
          height={36}
          className="mt-0.5 h-9 w-9 shrink-0 rounded-lg"
        />
        <p id={titleId} className="min-w-0 flex-1 text-sm leading-snug text-slate-300">
          <span className="font-display font-black text-slate-100">MarketMover</span>
          {" — live prices and model markets in one place. More markets coming."}
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss MarketMover promo"
          className="shrink-0 rounded-lg px-1.5 py-0.5 text-sm leading-none text-slate-400 hover:bg-pitch hover:text-slate-100"
        >
          ×
        </button>
      </div>
      <a
        href={HREF}
        target="_blank"
        rel="noopener noreferrer"
        onClick={dismiss}
        className="mt-2.5 inline-flex w-full items-center justify-center rounded-xl border border-ice/40 px-3 py-2 text-center text-sm font-semibold text-ice hover:bg-ice/10"
      >
        Open MarketMover
      </a>
    </div>
  );
}
