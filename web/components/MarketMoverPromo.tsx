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
 * Large promo sheet. Narrow screens get a nearly full-width bottom sheet
 * with safe-area insets; desktop gets a wide centered card. Dismiss (button,
 * Escape, or tap outside) hides it for 14 days. Type inside the card is
 * sized in em off a 16px base so it stays readable when the site root is
 * scaled down on phones.
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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    cardRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-pitch/80 backdrop-blur-sm sm:items-center"
      style={{
        paddingTop: "max(12px, env(safe-area-inset-top))",
        paddingRight: "max(12px, env(safe-area-inset-right))",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        paddingLeft: "max(12px, env(safe-area-inset-left))",
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-[560px] rounded-3xl border border-line bg-pitch-light p-[24px] shadow-2xl outline-none sm:p-8"
        style={{ fontSize: "16px" }}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss MarketMover promo"
          className="absolute flex items-center justify-center rounded-xl leading-none text-slate-300 hover:bg-pitch hover:text-slate-100"
          style={{ top: 10, right: 10, width: 48, height: 48, fontSize: "1.75em" }}
        >
          ×
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5" style={{ paddingRight: 40 }}>
          <img
            src={`${BASE_PATH}/marketmover-mark.png`}
            alt=""
            width={64}
            height={64}
            className="shrink-0 rounded-2xl"
            style={{ width: 64, height: 64 }}
          />
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="font-display text-[1.7em] font-black leading-none text-slate-50 sm:text-[2em]"
            >
              MarketMover
            </h2>
            <p className="text-slate-200" style={{ marginTop: "0.65em", fontSize: "1.125em", lineHeight: 1.45 }}>
              Live prices and model markets in one place. More markets coming.
            </p>
          </div>
        </div>

        <a
          href={HREF}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-grass px-5 font-display font-black text-pitch hover:bg-lime-300 sm:mt-7"
          style={{ minHeight: 52, fontSize: "1.125em" }}
        >
          Open MarketMover
        </a>
      </div>
    </div>
  );
}
