import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { Bet, LeaderboardEntry, TransactionReceipt } from "./types";

class CryptoPredictionMarket {
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

  async getBets(): Promise<Bet[]> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_market_info",
        args: [],
      });

      if (!result) return [];

      const obj: any = result instanceof Map
        ? Object.fromEntries(result)
        : result;

      return [{
        id: "0",
        asset: String(obj.asset ?? ""),
        target_price: Number(obj.target_price ?? 0),
        direction: String(obj.direction ?? ""),
        deadline: String(obj.deadline ?? ""),
        has_resolved: Boolean(obj.has_resolved ?? false),
        resolution_price: String(obj.resolution_price ?? "0"),
        outcome: String(obj.outcome ?? "PENDING"),
        owner: "",
      }];

    } catch (error) {
      console.error("Error fetching market:", error);
      return [];
    }
  }

  async getPlayerPoints(address: string | null): Promise<number> {
    return 0;
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return [];
  }

  async createBet(
    asset: string,
    targetPrice: number,
    direction: string,
    deadline: string
  ): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "resolve",
        args: [],
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
      console.error("Error:", error);
      throw new Error("Failed to interact with market");
    }
  }

  async resolveBet(betId: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "resolve",
        args: [],
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
      console.error("Error resolving market:", error);
      throw new Error("Failed to resolve market");
    }
  }
}

export default CryptoPredictionMarket;