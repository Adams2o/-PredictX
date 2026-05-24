import { NextRequest, NextResponse } from "next/server";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!CONTRACT_ADDRESS) {
      return NextResponse.json({ error: "Contract not configured" }, { status: 500 });
    }

    const client = createClient({
      chain: studionet,
      endpoint: RPC_URL,
    });

    const result: any = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_all_predictions",
      args: [],
    });

    const today = new Date().toISOString().split("T")[0];
    const predictions = Array.isArray(result) ? result : [];

    const expired = predictions.filter((p: any) => {
      const obj = p instanceof Map ? Object.fromEntries(p) : p;
      return !obj.has_resolved && !obj.is_cancelled && obj.deadline <= today;
    });

    console.log(`Found ${expired.length} expired predictions to resolve`);

    const resolved = [];
    const failed = [];

    for (const prediction of expired) {
      const obj = prediction instanceof Map ? Object.fromEntries(prediction) : prediction;
      try {
        const txHash = await client.writeContract({
          address: CONTRACT_ADDRESS,
          functionName: "resolve_prediction",
          args: [String(obj.id)],
          value: BigInt(0),
        });

        await client.waitForTransactionReceipt({
          hash: txHash,
          status: "ACCEPTED" as any,
          retries: 24,
          interval: 5000,
        });

        resolved.push(obj.id);
        console.log(`Resolved prediction ${obj.id}`);
      } catch (err: any) {
        console.error(`Failed to resolve ${obj.id}:`, err.message);
        failed.push({ id: obj.id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      total_expired: expired.length,
      resolved,
      failed,
      timestamp: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error("Auto-resolve cron error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}