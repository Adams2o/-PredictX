"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import PredictXContract from "../contracts/FootballBets";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type { Prediction, LeaderboardEntry, MarketStats } from "../contracts/types";

export function useFootballBetsContract(): PredictXContract | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  const contract = useMemo(() => {
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env.local file.",
        {
          label: "Setup Guide",
          onClick: () => window.open("/docs/setup", "_blank"),
        }
      );
      return null;
    }
    return new PredictXContract(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);

  return contract;
}

export function useBets() {
  const contract = useFootballBetsContract();

  return useQuery<Prediction[], Error>({
    queryKey: ["predictions"],
    queryFn: async () => {
      if (!contract) return [];
      try {
        return await contract.getAllPredictions();
      } catch (err) {
        console.error("useBets error:", err);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30000,
  });
}

export function useMyPredictions() {
  const contract = useFootballBetsContract();
  const { address } = useWallet();

  return useQuery<Prediction[], Error>({
    queryKey: ["myPredictions", address],
    queryFn: async () => {
      if (!address) return [];

      // Always try localStorage first for instant display
      const cacheKey = `predictions_${address.toLowerCase()}`;
      const cached = localStorage.getItem(cacheKey);
      const cachedData: Prediction[] = cached ? JSON.parse(cached) : [];

      if (!contract) return cachedData;

      try {
        const result = await contract.getMyPredictions(address);
        if (result && result.length > 0) {
          // Update cache with fresh data
          localStorage.setItem(cacheKey, JSON.stringify(result));
          return result;
        }
        return cachedData;
      } catch (err) {
        console.error("useMyPredictions error:", err);
        return cachedData;
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!address,
    staleTime: 15000,
  });
}

export function usePlayerPoints(address: string | null) {
  const contract = useFootballBetsContract();

  return useQuery<number, Error>({
    queryKey: ["playerPoints", address],
    queryFn: async () => {
      if (!contract || !address) return 0;
      try {
        return await contract.getPlayerPoints(address);
      } catch (err) {
        return 0;
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!address && !!contract,
    staleTime: 30000,
  });
}

export function useLeaderboard() {
  const contract = useFootballBetsContract();

  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!contract) return [];
      try {
        return await contract.getLeaderboard();
      } catch (err) {
        return [];
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30000,
  });
}

export function useMarketStats() {
  const contract = useFootballBetsContract();

  return useQuery<MarketStats, Error>({
    queryKey: ["marketStats"],
    queryFn: async () => {
      if (!contract) return { total: 0, resolved: 0, pending: 0, cancelled: 0, wins: 0 };
      try {
        return await contract.getStats();
      } catch (err) {
        return { total: 0, resolved: 0, pending: 0, cancelled: 0, wins: 0 };
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30000,
  });
}

export function useCreateBet() {
  const contract = useFootballBetsContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      asset,
      direction,
      targetPrice,
      deadline,
      stakeAmount,
    }: {
      asset: string;
      direction: string;
      targetPrice: number;
      deadline: string;
      stakeAmount: number;
    }) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsCreating(true);
      return contract.createPrediction(
        asset,
        direction,
        targetPrice,
        deadline,
        stakeAmount,
        address
      );
    },
    onSuccess: (data, variables) => {
      // Save to localStorage immediately for instant display
      if (address) {
        const cacheKey = `predictions_${address.toLowerCase()}`;
        const newPrediction: Prediction = {
          id: String(Date.now()),
          asset: variables.asset,
          direction: variables.direction,
          target_price: variables.targetPrice,
          current_price_at_creation: 0,
          deadline: variables.deadline,
          stake_amount: variables.stakeAmount,
          multiplier: 200,
          potential_return: variables.stakeAmount * 2,
          owner: address,
          has_resolved: false,
          is_cancelled: false,
          outcome: "PENDING",
          resolution_price: 0,
        };

        const cached = localStorage.getItem(cacheKey);
        const existing: Prediction[] = cached ? JSON.parse(cached) : [];
        existing.unshift(newPrediction);
        localStorage.setItem(cacheKey, JSON.stringify(existing));
      }

      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      queryClient.invalidateQueries({ queryKey: ["myPredictions"] });
      queryClient.invalidateQueries({ queryKey: ["playerPoints"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["marketStats"] });
      setIsCreating(false);
      success("Prediction created!", {
        description: "Your prediction has been recorded on-chain.",
      });
    },
    onError: (err: any) => {
      console.error("Error creating prediction:", err);
      setIsCreating(false);
      error("Failed to create prediction", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isCreating,
    createBet: mutation.mutate,
    createBetAsync: mutation.mutateAsync,
  };
}

export function useCancelPrediction() {
  const contract = useFootballBetsContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (predictionId: string) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsCancelling(true);
      setCancellingId(predictionId);
      return contract.cancelPrediction(predictionId, address);
    },
    onSuccess: (data, predictionId) => {
      // Update localStorage
      if (address) {
        const cacheKey = `predictions_${address.toLowerCase()}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const existing: Prediction[] = JSON.parse(cached);
          const updated = existing.map(p =>
            p.id === predictionId
              ? { ...p, is_cancelled: true, outcome: "CANCELLED" }
              : p
          );
          localStorage.setItem(cacheKey, JSON.stringify(updated));
        }
      }

      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      queryClient.invalidateQueries({ queryKey: ["myPredictions"] });
      queryClient.invalidateQueries({ queryKey: ["marketStats"] });
      setIsCancelling(false);
      setCancellingId(null);
      success("Order cancelled!", {
        description: "Your stake has been refunded minus a 2 GEN cancellation fee.",
      });
    },
    onError: (err: any) => {
      console.error("Error cancelling prediction:", err);
      setIsCancelling(false);
      setCancellingId(null);
      error("Failed to cancel prediction", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isCancelling,
    cancellingId,
    cancelPrediction: mutation.mutate,
  };
}

export function useResolveBet() {
  const contract = useFootballBetsContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isResolving, setIsResolving] = useState(false);
  const [resolvingBetId, setResolvingBetId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (predictionId: string) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsResolving(true);
      setResolvingBetId(predictionId);
      return contract.resolvePrediction(predictionId);
    },
    onSuccess: (data, predictionId) => {
      // Update localStorage
      if (address) {
        const cacheKey = `predictions_${address.toLowerCase()}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const existing: Prediction[] = JSON.parse(cached);
          const updated = existing.map(p =>
            p.id === predictionId
              ? {
                  ...p,
                  has_resolved: true,
                  outcome: (data as any)?.outcome || "PENDING",
                  resolution_price: (data as any)?.resolution_price || 0,
                }
              : p
          );
          localStorage.setItem(cacheKey, JSON.stringify(updated));
        }
      }

      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      queryClient.invalidateQueries({ queryKey: ["myPredictions"] });
      queryClient.invalidateQueries({ queryKey: ["playerPoints"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["marketStats"] });
      setIsResolving(false);
      setResolvingBetId(null);
      success("Prediction resolved!", {
        description: "The outcome has been determined by CoinGecko price data.",
      });
    },
    onError: (err: any) => {
      console.error("Error resolving prediction:", err);
      setIsResolving(false);
      setResolvingBetId(null);
      error("Failed to resolve prediction", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isResolving,
    resolvingBetId,
    resolveBet: mutation.mutate,
    resolveBetAsync: mutation.mutateAsync,
  };
}