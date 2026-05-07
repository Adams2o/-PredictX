"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import CryptoPredictionMarket from "../contracts/FootballBets";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type { Bet, LeaderboardEntry } from "../contracts/types";

export function useFootballBetsContract(): CryptoPredictionMarket | null {
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

    return new CryptoPredictionMarket(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);

  return contract;
}

export function useBets() {
  const contract = useFootballBetsContract();

  return useQuery<Bet[], Error>({
    queryKey: ["bets"],
    queryFn: async () => {
      if (!contract) return [];
      try {
        return await contract.getBets();
      } catch (err) {
        console.error("useBets error:", err);
        return [{
          id: "0",
          asset: "BTC",
          target_price: 100000,
          direction: "ABOVE",
          deadline: "2025-12-31",
          has_resolved: false,
          resolution_price: "0",
          outcome: "PENDING",
          owner: "",
        }];
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30000,
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

export function useCreateBet() {
  const contract = useFootballBetsContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      asset,
      targetPrice,
      direction,
      deadline,
    }: {
      asset: string;
      targetPrice: number;
      direction: string;
      deadline: string;
    }) => {
      if (!contract) {
        throw new Error(
          "Contract not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env.local file."
        );
      }
      if (!address) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to create a market."
        );
      }
      setIsCreating(true);
      return contract.createBet(asset, targetPrice, direction, deadline);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      queryClient.invalidateQueries({ queryKey: ["playerPoints"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      setIsCreating(false);
      success("Market resolved successfully!", {
        description: "The outcome has been determined by CoinGecko price data.",
      });
    },
    onError: (err: any) => {
      console.error("Error:", err);
      setIsCreating(false);
      error("Failed to resolve market", {
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

export function useResolveBet() {
  const contract = useFootballBetsContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isResolving, setIsResolving] = useState(false);
  const [resolvingBetId, setResolvingBetId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (betId: string) => {
      if (!contract) {
        throw new Error(
          "Contract not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env.local file."
        );
      }
      if (!address) {
        throw new Error(
          "Wallet not connected. Please connect your wallet to resolve a market."
        );
      }
      setIsResolving(true);
      setResolvingBetId(betId);
      return contract.resolveBet(betId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      queryClient.invalidateQueries({ queryKey: ["playerPoints"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      setIsResolving(false);
      setResolvingBetId(null);
      success("Market resolved successfully!", {
        description: "The outcome has been determined by CoinGecko price data.",
      });
    },
    onError: (err: any) => {
      console.error("Error resolving market:", err);
      setIsResolving(false);
      setResolvingBetId(null);
      error("Failed to resolve market", {
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