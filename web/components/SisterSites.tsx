/**
 * Cross-site strip linking the 0 Series sites, plus a MarketMover cross-promo.
 * The same bar lives at the top of the sister sites so they point at one another.
 * Self-contained inline styles.
 */
import { BASE_PATH } from "@/lib/game/data";

const SITES = [
  { key: "afl", label: "AFL 23-0", href: "https://afl23-0.com" },
  { key: "nrl", label: "NRL 24-0", href: "https://nrl24-0.com" },
  { key: "football", label: "Football Invincibles", href: "https://footballinvincibles.com" },
  { key: "mlb", label: "MLB 162-0", href: "https://mlb162-0.com" },
  { key: "nba", label: "NBA 82-0", href: "https://nba82-0.com" },
  { key: "nbl", label: "NBL 33-0", href: "https://nbl33-0.com" },
  { key: "f1", label: "F1 Slam", href: "https://f1slam.com" },
  { key: "tennis", label: "Tennis Slam", href: "https://grandtennisslam.com" },
] as const;

const MARKETMOVER_HREF =
  "https://www.marketmover.net?utm_source=afl23-0&utm_medium=sister_bar&utm_campaign=crosspromo";

type SiteKey = (typeof SITES)[number]["key"];

const pill = {
  whiteSpace: "nowrap" as const,
  padding: "3px 9px",
  borderRadius: 999,
  fontWeight: 600,
  flex: "0 0 auto",
};

export default function SisterSites({ active }: { active: SiteKey }) {
  return (
    <div
      role="navigation"
      aria-label="Sister sites"
      style={{
        display: "flex",
        alignItems: "center",
        // "safe center" stays centered when the row fits, and falls back to
        // the start when it overflows so every link can be scrolled into view.
        justifyContent: "safe center",
        gap: 4,
        fontSize: ".74rem",
        padding: "5px 0.6rem",
        paddingTop: "calc(5px + env(safe-area-inset-top))",
        background: "#070c18",
        borderBottom: "1px solid #1e293b",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <span style={{ color: "#94a3b8", marginRight: 2, fontWeight: 700, fontSize: ".7rem", whiteSpace: "nowrap", flex: "0 0 auto" }}>
        THE 0 SERIES ·
      </span>
      {SITES.map((s) =>
        s.key === active ? (
          <span
            key={s.key}
            aria-current="page"
            style={{
              ...pill,
              color: "#e2e8f0",
              background: "#1e293b",
              border: "1px solid #334155",
            }}
          >
            {s.label}
          </span>
        ) : (
          <a
            key={s.key}
            href={s.href}
            style={{ ...pill, color: "#94a3b8", textDecoration: "none" }}
          >
            {s.label}
          </a>
        )
      )}
      <span aria-hidden style={{ width: 1, alignSelf: "stretch", margin: "2px 4px", background: "#334155", flex: "0 0 auto" }} />
      <a
        href={MARKETMOVER_HREF}
        style={{
          ...pill,
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          color: "#94a3b8",
          textDecoration: "none",
        }}
      >
        <img
          src={`${BASE_PATH}/marketmover-mark.png`}
          alt=""
          width={14}
          height={14}
          style={{ width: 14, height: 14, borderRadius: 3, display: "block" }}
        />
        MarketMover
      </a>
    </div>
  );
}
