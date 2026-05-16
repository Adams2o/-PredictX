"use client";

import { useState } from "react";
import {
  Loader2, Trophy, Clock, AlertCircle, TrendingUp,
  TrendingDown, XCircle, ChevronDown, ChevronUp
} from "lucide-react";
import {
  useBets, useResolveBet, useFootballBetsContract,
  useMyPredictions, useCancelPrediction
} from "@/lib/hooks/useFootballBets";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { AddressDisplay } from "./AddressDisplay";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { Prediction } from "@/lib/contracts/types";

function getDirectionColor(direction: string): string {
  if (direction === "ABOVE") return "text-green-400 border-green-500/30";
  if (direction === "BELOW") return "text-red-400 border-red-500/30";
  return "text-accent border-accent/30";
}

function getOutcomeColor(outcome: string): string {
  if (outcome === "WIN") return "text-green-400";
  if (outcome === "LOSS") return "text-red-400";
  if (outcome === "CANCELLED") return "text-muted-foreground";
  return "text-yellow-400";
}

function getMultiplierColor(multiplier: number): string {
  const x = multiplier / 100;
  if (x <= 1.5) return "text-blue-400";
  if (x <= 3) return "text-yellow-400";
  if (x <= 8) return "text-orange-400";
  return "text-red-400";
}

function formatMultiplier(multiplier: number): string {
  return `${(multiplier / 100).toFixed(1)}x`;
}

function PredictionCard({
  prediction,
  currentAddress,
  isConnected,
  isWalletLoading,
  onResolve,
  onCancel,
  isResolving,
  isCancelling,
  showCancel = false,
}: {
  prediction: Prediction;
  currentAddress: string | null;
  isConnected: boolean;
  isWalletLoading: boolean;
  onResolve: (id: string) => void;
  onCancel: (id: string) => void;
  isResolving: boolean;
  isCancelling: boolean;
  showCancel?: boolean;
}) {
  const isOwner = currentAddress?.toLowerCase() === prediction.owner?.toLowerCase();
  const canResolve = isConnected && currentAddress && isOwner &&
    !prediction.has_resolved && !prediction.is_cancelled && !isWalletLoading;
  const canCancel = isConnected && currentAddress && isOwner &&
    !prediction.has_resolved && !prediction.is_cancelled && !isWalletLoading;

  return (
    <div className="brand-card p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-accent">{prediction.asset}</span>
          <Badge variant="outline" className={getDirectionColor(prediction.direction)}>
            {prediction.direction === "ABOVE" ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {prediction.direction}
          </Badge>
        </div>
        {prediction.has_resolved ? (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Trophy className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        ) : prediction.is_cancelled ? (
          <Badge variant="outline" className="text-muted-foreground border-muted/30">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        ) : (
          <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Target Price</p>
          <p className="font-semibold">${Number(prediction.target_price).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Deadline</p>
          <p className="font-semibold">{prediction.deadline}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Stake</p>
          <p className="font-semibold">{prediction.stake_amount} GEN</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Multiplier</p>
          <p className={`font-bold ${getMultiplierColor(prediction.multiplier)}`}>
            {formatMultiplier(prediction.multiplier)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Potential Return</p>
          <p className="font-semibold text-accent">{prediction.potential_return} GEN</p>
        </div>
        {prediction.has_resolved && (
          <div>
            <p className="text-muted-foreground text-xs">Outcome</p>
            <p className={`font-bold ${getOutcomeColor(prediction.outcome)}`}>
              {prediction.outcome}
              {prediction.resolution_price !== 0 && (
                <span className="text-muted-foreground font-normal ml-1">
                  @ ${Number(prediction.resolution_price).toLocaleString()}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">By:</span>
          <AddressDisplay address={prediction.owner} maxLength={10} showCopy={true} />
          {isOwner && (
            <Badge variant="secondary" className="text-xs">You</Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        {canResolve && (
          <Button
            onClick={() => onResolve(prediction.id)}
            disabled={isResolving}
            size="sm"
            variant="gradient"
            className="flex-1"
          >
            {isResolving ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Resolving...</>
            ) : "Resolve"}
          </Button>
        )}
        {canCancel && showCancel && (
          <Button
            onClick={() => onCancel(prediction.id)}
            disabled={isCancelling}
            size="sm"
            variant="outline"
            className="flex-1 text-destructive hover:text-destructive"
          >
            {isCancelling ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Cancelling...</>
            ) : (
              <><XCircle className="w-3 h-3 mr-1" />Cancel Order</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function MyOrders() {
  const { data: myPredictions, isLoading } = useMyPredictions();
  const { address, isConnected, isLoading: isWalletLoading } = useWallet();
  const { resolveBet, isResolving, resolvingBetId } = useResolveBet();
  const { cancelPrediction, isCancelling, cancellingId } = useCancelPrediction();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleResolve = (id: string) => {
    const confirmed = confirm("Resolve this prediction? This will fetch the live price from CoinGecko.");
    if (confirmed) resolveBet(id);
  };

  const handleCancel = (id: string) => {
    const confirmed = confirm("Cancel this prediction? Your stake will be refunded.");
    if (confirmed) cancelPrediction(id);
  };

  if (!isConnected) return null;

  return (
    <div className="brand-card p-4 sm:p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          My Orders
          {myPredictions && myPredictions.filter(p => !p.has_resolved && !p.is_cancelled).length > 0 && (
            <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
              {myPredictions.filter(p => !p.has_resolved && !p.is_cancelled).length} active
            </Badge>
          )}
        </h2>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : !myPredictions || myPredictions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                You have no predictions yet. Create one above!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myPredictions.map((prediction) => (
                <PredictionCard
                  key={prediction.id}
                  prediction={prediction}
                  currentAddress={address}
                  isConnected={isConnected}
                  isWalletLoading={isWalletLoading}
                  onResolve={handleResolve}
                  onCancel={handleCancel}
                  isResolving={isResolving && resolvingBetId === prediction.id}
                  isCancelling={isCancelling && cancellingId === prediction.id}
                  showCancel={true}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function BetsTable() {
  const contract = useFootballBetsContract();
  const { data: bets, isLoading } = useBets();
  const { address, isConnected, isLoading: isWalletLoading } = useWallet();
  const { resolveBet, isResolving, resolvingBetId } = useResolveBet();
  const { cancelPrediction, isCancelling, cancellingId } = useCancelPrediction();

  const handleResolve = (id: string) => {
    if (!address) {
      error("Please connect your wallet to resolve markets");
      return;
    }
    const confirmed = confirm(
      "Resolve this prediction? This will fetch the live price from CoinGecko and determine the outcome."
    );
    if (confirmed) resolveBet(id);
  };

  const handleCancel = (id: string) => {
    if (!address) {
      error("Please connect your wallet to cancel predictions");
      return;
    }
    const confirmed = confirm("Cancel this prediction? Your stake will be refunded.");
    if (confirmed) cancelPrediction(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="brand-card p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Loading markets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="brand-card p-8 sm:p-12">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-400 opacity-60" />
          <h3 className="text-xl font-bold">Setup Required</h3>
          <p className="text-muted-foreground">Contract address not configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MyOrders />

      <div className="brand-card p-4 sm:p-6">
        <h2 className="text-lg font-bold mb-4">All Markets</h2>

        {!bets || bets.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground opacity-30" />
            <h3 className="text-lg font-bold">No Markets Yet</h3>
            <p className="text-muted-foreground text-sm">
              Be the first to create a crypto price prediction!
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: Card view */}
            <div className="flex flex-col gap-3 sm:hidden">
              {bets.map((prediction) => (
                <PredictionCard
                  key={prediction.id}
                  prediction={prediction}
                  currentAddress={address}
                  isConnected={isConnected}
                  isWalletLoading={isWalletLoading}
                  onResolve={handleResolve}
                  onCancel={handleCancel}
                  isResolving={isResolving && resolvingBetId === prediction.id}
                  isCancelling={isCancelling && cancellingId === prediction.id}
                  showCancel={true}
                />
              ))}
            </div>

            {/* Desktop: Table view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Asset", "Direction", "Target", "Entry Price", "Multiplier", "Stake", "Return", "Deadline", "Status", "Owner", "Actions"].map((h) => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bets.map((prediction) => {
                    const isOwner = address?.toLowerCase() === prediction.owner?.toLowerCase();
                    const canResolve = isConnected && address && isOwner &&
                      !prediction.has_resolved && !prediction.is_cancelled && !isWalletLoading;
                    const canCancel = isConnected && address && isOwner &&
                      !prediction.has_resolved && !prediction.is_cancelled && !isWalletLoading;

                    return (
                      <tr key={prediction.id} className="group hover:bg-white/5 transition-colors">
                        <td className="px-3 py-3">
                          <span className="font-bold text-accent text-sm">{prediction.asset}</span>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant="outline" className={`text-xs ${getDirectionColor(prediction.direction)}`}>
                            {prediction.direction === "ABOVE" ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {prediction.direction}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm font-semibold">
                            ${Number(prediction.target_price).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm text-muted-foreground">
                            ${Number(prediction.current_price_at_creation).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-sm font-bold ${getMultiplierColor(prediction.multiplier)}`}>
                            {formatMultiplier(prediction.multiplier)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm">{prediction.stake_amount} GEN</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm font-semibold text-accent">
                            {prediction.potential_return} GEN
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm">{prediction.deadline}</span>
                        </td>
                        <td className="px-3 py-3">
                          {prediction.has_resolved ? (
                            <div className="flex flex-col gap-1">
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 w-fit text-xs">
                                <Trophy className="w-3 h-3 mr-1" />
                                Resolved
                              </Badge>
                              <span className={`text-xs font-bold ${getOutcomeColor(prediction.outcome)}`}>
                                {prediction.outcome}
                                {prediction.resolution_price !== 0 && (
                                  <span className="text-muted-foreground font-normal ml-1">
                                    @ ${Number(prediction.resolution_price).toLocaleString()}
                                  </span>
                                )}
                              </span>
                            </div>
                          ) : prediction.is_cancelled ? (
                            <Badge variant="outline" className="text-muted-foreground border-muted/30 text-xs">
                              <XCircle className="w-3 h-3 mr-1" />
                              Cancelled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-400 border-yellow-500/30 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <AddressDisplay address={prediction.owner} maxLength={8} showCopy={true} />
                            {isOwner && (
                              <Badge variant="secondary" className="text-xs">You</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1">
                            {canResolve && (
                              <Button
                                onClick={() => handleResolve(prediction.id)}
                                disabled={isResolving && resolvingBetId === prediction.id}
                                size="sm"
                                variant="gradient"
                                className="text-xs px-2"
                              >
                                {isResolving && resolvingBetId === prediction.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : "Resolve"}
                              </Button>
                            )}
                            {canCancel && (
                              <Button
                                onClick={() => handleCancel(prediction.id)}
                                disabled={isCancelling && cancellingId === prediction.id}
                                size="sm"
                                variant="outline"
                                className="text-xs px-2 text-destructive hover:text-destructive"
                              >
                                {isCancelling && cancellingId === prediction.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : <XCircle className="w-3 h-3" />}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}