"use client";

import { Loader2, Trophy, Clock, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useBets, useResolveBet, useFootballBetsContract } from "@/lib/hooks/useFootballBets";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { AddressDisplay } from "./AddressDisplay";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { Bet } from "@/lib/contracts/types";

export function BetsTable() {
  const contract = useFootballBetsContract();
  const { data: bets, isLoading } = useBets();
  const { address, isConnected, isLoading: isWalletLoading } = useWallet();
  const { resolveBet, isResolving, resolvingBetId } = useResolveBet();

  const handleResolve = (betId: string) => {
    if (!address) {
      error("Please connect your wallet to resolve markets");
      return;
    }
    const confirmed = confirm(
      "Are you sure you want to resolve this market? This will fetch the current price from CoinGecko and determine the outcome."
    );
    if (confirmed) resolveBet(betId);
  };

  if (isLoading) {
    return (
      <div className="brand-card p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading markets...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="brand-card p-12">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-400 opacity-60" />
          <h3 className="text-xl font-bold">Setup Required</h3>
          <p className="text-muted-foreground">Contract address not configured.</p>
          <p className="text-sm text-muted-foreground">
            Please set{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">
              NEXT_PUBLIC_CONTRACT_ADDRESS
            </code>{" "}
            in your .env.local file.
          </p>
        </div>
      </div>
    );
  }

  if (!bets || bets.length === 0) {
    return (
      <div className="brand-card p-12">
        <div className="text-center space-y-3">
          <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground opacity-30" />
          <h3 className="text-xl font-bold">No Markets Yet</h3>
          <p className="text-muted-foreground">
            Be the first to create a crypto price prediction market!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-card p-6 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Asset
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Direction
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Target Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Deadline
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Owner
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bets.map((bet) => (
              <BetRow
                key={bet.id}
                bet={bet}
                currentAddress={address}
                isConnected={isConnected}
                isWalletLoading={isWalletLoading}
                onResolve={handleResolve}
                isResolving={isResolving && resolvingBetId === bet.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface BetRowProps {
  bet: Bet;
  currentAddress: string | null;
  isConnected: boolean;
  isWalletLoading: boolean;
  onResolve: (betId: string) => void;
  isResolving: boolean;
}

function getDirectionColor(direction: string): string {
  if (direction === "ABOVE") return "text-green-400 border-green-500/30";
  if (direction === "BELOW") return "text-red-400 border-red-500/30";
  return "text-accent border-accent/30";
}

function getOutcomeColor(outcome: string): string {
  if (outcome === "YES") return "text-green-400";
  if (outcome === "NO") return "text-red-400";
  return "text-yellow-400";
}

function BetRow({
  bet,
  currentAddress,
  isConnected,
  isWalletLoading,
  onResolve,
  isResolving,
}: BetRowProps) {
  const isOwner = currentAddress?.toLowerCase() === bet.owner?.toLowerCase();
  const canResolve =
    isConnected &&
    currentAddress &&
    isOwner &&
    !bet.has_resolved &&
    !isWalletLoading;

  return (
    <tr className="group hover:bg-white/5 transition-colors animate-fade-in">
      <td className="px-4 py-4">
        <span className="text-sm font-bold text-accent">{bet.asset}</span>
      </td>
      <td className="px-4 py-4">
        <Badge variant="outline" className={getDirectionColor(bet.direction)}>
          {bet.direction === "ABOVE" ? (
            <TrendingUp className="w-3 h-3 mr-1" />
          ) : (
            <TrendingDown className="w-3 h-3 mr-1" />
          )}
          {bet.direction}
        </Badge>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-semibold">
          ${Number(bet.target_price).toLocaleString()}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm">{bet.deadline}</span>
      </td>
      <td className="px-4 py-4">
        {bet.has_resolved ? (
          <div className="flex flex-col gap-1">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 w-fit">
              <Trophy className="w-3 h-3 mr-1" />
              Resolved
            </Badge>
            {bet.outcome && (
              <span className="text-xs text-muted-foreground">
                Outcome:{" "}
                <span className={`font-semibold ${getOutcomeColor(bet.outcome)}`}>
                  {bet.outcome}
                </span>
                {bet.resolution_price && bet.resolution_price !== "0" && (
                  <span className="ml-1">
                    @ ${Number(bet.resolution_price).toLocaleString()}
                  </span>
                )}
              </span>
            )}
          </div>
        ) : (
          <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <AddressDisplay address={bet.owner} maxLength={10} showCopy={true} />
          {isOwner && (
            <Badge variant="secondary" className="text-xs">
              You
            </Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        {canResolve && (
          <Button
            onClick={() => onResolve(bet.id)}
            disabled={isResolving}
            size="sm"
            variant="gradient"
          >
            {isResolving ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Resolving...
              </>
            ) : (
              "Resolve"
            )}
          </Button>
        )}
      </td>
    </tr>
  );
}