"use client";

import { useState, useEffect } from "react";
import { AccountPanel } from "./AccountPanel";
import { CreateBetModal } from "./CreateBetModal";
import { useMarketStats } from "@/lib/hooks/useFootballBets";
import { Logo } from "./Logo";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { data: stats } = useMarketStats();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 80;
      setIsScrolled(scrollY > 20);
      const progress = Math.min(Math.max((scrollY - 10) / threshold, 0), 1);
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const paddingTop = Math.round(scrollProgress * 16);
  const headerHeight = 64 - Math.round(scrollProgress * 8);

  const getBorderRadius = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      return Math.round(scrollProgress * 9999);
    }
    return 0;
  };
  const borderRadius = getBorderRadius();

  const totalMarkets = stats?.total || 0;
  const pendingMarkets = stats?.pending || 0;
  const resolvedMarkets = stats?.resolved || 0;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out"
      style={{ paddingTop: `${paddingTop}px` }}
    >
      <div
        className="transition-all duration-500 ease-out"
        style={{
          width: "100%",
          maxWidth: isScrolled ? "80rem" : "100%",
          margin: "0 auto",
          borderRadius: `${borderRadius}px`,
        }}
      >
        <div
          className="backdrop-blur-xl border transition-all duration-500 ease-out"
          style={{
            borderColor: `oklch(0.3 0.02 0 / ${0.4 + scrollProgress * 0.4})`,
            background: `linear-gradient(135deg, oklch(0.18 0.01 0 / ${0.1 + scrollProgress * 0.3}) 0%, oklch(0.15 0.01 0 / ${0.05 + scrollProgress * 0.25}) 50%, oklch(0.16 0.01 0 / ${0.08 + scrollProgress * 0.27}) 100%)`,
            borderRadius: `${borderRadius}px`,
            borderWidth: "1px",
            borderLeftWidth: isScrolled ? "1px" : "0px",
            borderRightWidth: isScrolled ? "1px" : "0px",
            borderTopWidth: isScrolled ? "1px" : "0px",
            boxShadow: isScrolled
              ? "0 32px 64px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 oklch(0.3 0.02 0 / 0.3)"
              : "none",
            backdropFilter: "blur(16px) saturate(180%)",
            WebkitBackdropFilter: "blur(16px) saturate(180%)",
          }}
        >
          <div
            className="px-3 sm:px-6 transition-all duration-500 mx-auto"
            style={{ maxWidth: isScrolled ? "80rem" : "112rem" }}
          >
            <div
              className="flex items-center justify-between transition-all duration-500"
              style={{ height: `${headerHeight}px` }}
            >
              {/* Left: Single Logo + Title */}
              <div className="flex items-center gap-2 min-w-0">
                <Logo size="sm" className="flex-shrink-0" />
                <span className="text-base sm:text-lg md:text-xl font-bold truncate">
                  PredictX
                </span>
              </div>

              {/* Center: Stats desktop */}
              <div className="hidden md:flex items-center gap-4 lg:gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Markets:</span>
                  <span className="font-bold text-accent">{totalMarkets}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Pending:</span>
                  <span className="font-bold text-yellow-400">{pendingMarkets}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Resolved:</span>
                  <span className="font-bold text-green-400">{resolvedMarkets}</span>
                </div>
              </div>

              {/* Center: Stats mobile */}
              <div className="flex md:hidden items-center gap-2 text-xs">
                <span className="text-accent font-bold">{totalMarkets}</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-yellow-400 font-bold">{pendingMarkets}</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-green-400 font-bold">{resolvedMarkets}</span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                <CreateBetModal />
                <AccountPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}