import type { Metadata } from "next";
import MarketMoverPromo from "@/components/MarketMoverPromo";

export const metadata: Metadata = {
  title: "Play — spin a club and era, draft your side",
  description:
    "Spin a random club and decade from 130 years of VFL/AFL footy, pick your players, place them on the oval and simulate a 23-game season plus finals against the real teams of those eras.",
  alternates: { canonical: "/play" },
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MarketMoverPromo />
    </>
  );
}
