/**
 * TypeScript types for PredictX Market contract
 */

export interface Prediction {
  id: string;
  asset: string;
  direction: string;
  target_price: number;
  current_price_at_creation: number;
  deadline: string;
  stake_amount: number;
  multiplier: number;
  potential_return: number;
  owner: string;
  has_resolved: boolean;
  is_cancelled: boolean;
  outcome: string;
  resolution_price: number;
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

export interface MarketStats {
  total: number;
  resolved: number;
  pending: number;
  cancelled: number;
  wins: number;
}

// Keep Bet as alias for backward compatibility
export type Bet = Prediction;