"use client";

import { Trophy, Medal, Award, Loader2, AlertCircle } from "lucide-react";
import { useLeaderboard, useFootballBetsContract } from "@/lib/hooks/useFootballBets";
import { useWallet } from "@/lib/genlayer/wallet";
import { AddressDisplay } from "./AddressDisplay";

export function Leaderboard() {
  const contract = useFootballBetsContract();
  const { data: leaderboard, isLoading, isError } = useLeaderboard();
  const { address } = useWallet();

  const Header = () => (
    <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
      <Trophy className="w-5 h-5 text-accent" />
      Top Predictors
    </h2>
  );

  if (isLoading) {
    return (
      <div className="brand-card p-4 sm:p-6">
        <Header />
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="brand-card p-4 sm:p-6">
        <Header />
        <div className="text-center py-8 space-y-3">
          <AlertCircle className="w-12 h-12 mx-auto text-yellow-400 opacity-60" />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Setup Required</p>
            <p className="text-xs text-muted-foreground">Contract address not configured</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !leaderboard) {
    return (
      <div className="brand-card p-4 sm:p-6">
        <Header />
        <div className="text-center py-8">
          <p className="text-sm text-destructive">Failed to load leaderboard</p>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="brand-card p-4 sm:p-6">
        <Header />
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-3" />
          <p className="text-sm text-muted-foreground">No winners yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Make a prediction and win to appear here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-card p-4 sm:p-6">
      <Header />

      <div className="space-y-2">
        {leaderboard.slice(0, 10).map((entry, index) => {
          const isCurrentUser = address?.toLowerCase() === entry.address?.toLowerCase();
          const rank = index + 1;

          return (
            <div
              key={entry.address}
              className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg transition-all ${
                isCurrentUser
                  ? "bg-accent/20 border-2 border-accent/50"
                  : "hover:bg-white/5"
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-6 sm:w-8 flex items-center justify-center">
                {rank === 1 && <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />}
                {rank === 2 && <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                {rank === 3 && <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />}
                {rank > 3 && (
                  <span className="text-xs sm:text-sm font-bold text-muted-foreground">
                    #{rank}
                  </span>
                )}
              </div>

              {/* Address */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <AddressDisplay
                    address={entry.address}
                    maxLength={8}
                    className="text-xs sm:text-sm"
                    showCopy={true}
                  />
                  {isCurrentUser && (
                    <span className="text-xs bg-accent/30 text-accent px-1.5 py-0.5 rounded-full font-semibold">
                      You
                    </span>
                  )}
                </div>
              </div>

              {/* Winnings */}
              <div className="flex-shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-base sm:text-lg font-bold text-accent">
                    {entry.points}
                  </span>
                  <span className="text-xs text-muted-foreground">GEN</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {leaderboard.length > 10 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-center text-muted-foreground">
            Showing top 10 of {leaderboard.length} players
          </p>
        </div>
      )}
    </div>
  );
}