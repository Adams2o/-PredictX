import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { Prediction, LeaderboardEntry, TransactionReceipt, MarketStats } from "./types";

class PredictXContract {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(
    contractAddress: string,
    address?: string | null,
    studioUrl?: string
  ) {
    this.contractAddress = contractAddress as `0x${string}`;
    const config: any = { chain: studionet };
    if (address) config.account = address as `0x${string}`;
    if (studioUrl) config.endpoint = studioUrl;
    this.client = createClient(config);
  }

  updateAccount(address: string): void {
    this.client = createClient({
      chain: studionet,
      account: address as `0x${string}`,
    });
  }

  private parseList(raw: any): any[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (raw instanceof Map) return Array.from(raw.values());
    if (typeof raw === "object") return Object.values(raw);
    return [];
  }

  private parsePrediction(raw: any): Prediction {
    const obj = raw instanceof Map ? Object.fromEntries(raw) : raw;
    return {
      id: String(obj.id ?? ""),
      asset: String(obj.asset ?? ""),
      direction: String(obj.direction ?? ""),
      target_price: Number(obj.target_price ?? 0),
      current_price_at_creation: Number(obj.current_price_at_creation ?? 0),
      deadline: String(obj.deadline ?? ""),
      stake_amount: Number(obj.stake_amount ?? 0),
      multiplier: Number(obj.multiplier ?? 100),
      potential_return: Number(obj.potential_return ?? 0),
      owner: String(obj.owner ?? ""),
      has_resolved: Boolean(obj.has_resolved ?? false),
      is_cancelled: Boolean(obj.is_cancelled ?? false),
      outcome: String(obj.outcome ?? "PENDING"),
      resolution_price: Number(obj.resolution_price ?? 0),
    };
  }

  async getAllPredictions(): Promise<Prediction[]> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_all_predictions",
        args: [],
      });
      return this.parseList(result).map((p) => this.parsePrediction(p));
    } catch (error) {
      console.error("Error fetching predictions:", error);
      return [];
    }
  }

  async getMyPredictions(owner: string): Promise<Prediction[]> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_my_predictions",
        args: [owner],
      });
      return this.parseList(result).map((p) => this.parsePrediction(p));
    } catch (error) {
      console.error("Error fetching my predictions:", error);
      return [];
    }
  }

  async getPlayerPoints(address: string | null): Promise<number> {
    if (!address) return 0;
    try {
      const result = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_player_points",
        args: [address],
      });
      return Number(result) || 0;
    } catch (error) {
      console.error("Error fetching player points:", error);
      return 0;
    }
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_leaderboard",
        args: [],
      });
      return this.parseList(result).map((e: any) => ({
        address: String(e.address ?? ""),
        points: Number(e.points ?? 0),
      }));
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  }

  async getStats(): Promise<MarketStats> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_stats",
        args: [],
      });
      const obj = result instanceof Map ? Object.fromEntries(result) : result;
      return {
        total: Number(obj?.total ?? 0),
        resolved: Number(obj?.resolved ?? 0),
        pending: Number(obj?.pending ?? 0),
        cancelled: Number(obj?.cancelled ?? 0),
        wins: Number(obj?.wins ?? 0),
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return { total: 0, resolved: 0, pending: 0, cancelled: 0, wins: 0 };
    }
  }

  async createPrediction(
    asset: string,
    direction: string,
    targetPrice: number,
    deadline: string,
    stakeAmount: number,
    owner: string
  ): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "create_prediction",
        args: [asset, direction, targetPrice, deadline, stakeAmount, owner],
        value: BigInt(0),
      });
      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });
      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error creating prediction:", error);
      throw new Error("Failed to create prediction");
    }
  }

  async cancelPrediction(
    predictionId: string,
    owner: string
  ): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "cancel_prediction",
        args: [predictionId, owner],
        value: BigInt(0),
      });
      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });
      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error cancelling prediction:", error);
      throw new Error("Failed to cancel prediction");
    }
  }

  async resolvePrediction(predictionId: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "resolve_prediction",
        args: [predictionId],
        value: BigInt(0),
      });
      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });
      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error resolving prediction:", error);
      throw new Error("Failed to resolve prediction");
    }
  }

  async getBets(): Promise<Prediction[]> {
    return this.getAllPredictions();
  }

  async resolveBet(id: string): Promise<TransactionReceipt> {
    return this.resolvePrediction(id);
  }
}

export default PredictXContract;