/**
 * TypeScript types for GenLayer Crypto Prediction Market contract
 */

export interface Bet {
  id: string;
  asset: string;
  target_price: string | number;
  direction: string;
  deadline: string;
  has_resolved: boolean;
  resolution_price?: string | number;
  outcome?: string;
  owner: string;
}

export interface LeaderboardEntry {
  address: string;
  points: number;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  blockNumber?: number;
  [key: string]: any;
}

export interface BetFilters {
  resolved?: boolean;
  owner?: string;
}

export interface MarketResolutionData {
  has_resolved: boolean;
  outcome: string;
  resolution_price: number;
}

export interface MarketInfo {
  asset: string;
  target_price: number;
  direction: string;
  deadline: string;
  has_resolved: boolean;
  resolution_price: number;
  outcome: string;
}