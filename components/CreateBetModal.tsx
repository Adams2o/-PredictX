"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, TrendingUp, TrendingDown, DollarSign, Coins, Calendar, Zap } from "lucide-react";
import { useCreateBet } from "@/lib/hooks/useFootballBets";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const SUPPORTED_ASSETS = [
  "BTC", "ETH", "SOL", "BNB", "XRP",
  "ADA", "DOGE", "AVAX", "DOT", "MATIC",
];

export function CreateBetModal() {
  const { isConnected, address, isLoading } = useWallet();
  const { createBet, isCreating, isSuccess } = useCreateBet();

  const [isOpen, setIsOpen] = useState(false);
  const [asset, setAsset] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<"ABOVE" | "BELOW" | "">("");
  const [deadline, setDeadline] = useState("");
  const [stakeAmount, setStakeAmount] = useState("10");

  const [errors, setErrors] = useState({
    asset: "",
    targetPrice: "",
    direction: "",
    deadline: "",
    stakeAmount: "",
  });

  useEffect(() => {
    if (!isConnected && isOpen && !isCreating) {
      setIsOpen(false);
    }
  }, [isConnected, isOpen, isCreating]);

  useEffect(() => {
    if (isSuccess) {
      resetForm();
      setIsOpen(false);
    }
  }, [isSuccess]);

  const validateForm = (): boolean => {
    const newErrors = {
      asset: "",
      targetPrice: "",
      direction: "",
      deadline: "",
      stakeAmount: "",
    };

    if (!asset) newErrors.asset = "Please select an asset";
    if (!targetPrice || isNaN(Number(targetPrice)) || Number(targetPrice) <= 0)
      newErrors.targetPrice = "Please enter a valid target price";
    if (!direction) newErrors.direction = "Please select a direction";
    if (!deadline) newErrors.deadline = "Deadline date is required";
    if (!stakeAmount || isNaN(Number(stakeAmount)) || Number(stakeAmount) < 10)
      newErrors.stakeAmount = "Minimum stake is 10 GEN";

    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      error("Please connect your wallet first");
      return;
    }
    if (!validateForm()) return;

    createBet({
      asset,
      direction,
      targetPrice: Number(targetPrice),
      deadline,
      stakeAmount: Number(stakeAmount),
    });
  };

  const resetForm = () => {
    setAsset("");
    setTargetPrice("");
    setDirection("");
    setDeadline("");
    setStakeAmount("10");
    setErrors({ asset: "", targetPrice: "", direction: "", deadline: "", stakeAmount: "" });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isCreating) resetForm();
    setIsOpen(open);
  };

  const stake = Number(stakeAmount) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="gradient" disabled={!isConnected || !address || isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Create Market</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="brand-card border-2 w-full max-w-[95vw] sm:max-w-[520px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            Create Prediction
          </DialogTitle>
          <DialogDescription className="text-sm">
            Predict whether a crypto asset will be above or below your target price by the deadline
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">

          {/* Asset Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Coins className="w-4 h-4" />
              Select Asset
            </Label>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_ASSETS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    setAsset(a);
                    setErrors({ ...errors, asset: "" });
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    border: asset === a ? "2px solid #22c55e" : "2px solid rgba(255,255,255,0.1)",
                    background: asset === a ? "rgba(34,197,94,0.2)" : "transparent",
                    color: asset === a ? "#22c55e" : "#888",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    transform: asset === a ? "scale(1.05)" : "scale(1)",
                    boxShadow: asset === a ? "0 0 12px rgba(34,197,94,0.3)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (asset !== a) {
                      e.currentTarget.style.border = "2px solid #22c55e";
                      e.currentTarget.style.background = "rgba(34,197,94,0.1)";
                      e.currentTarget.style.color = "#22c55e";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (asset !== a) {
                      e.currentTarget.style.border = "2px solid rgba(255,255,255,0.1)";
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#888";
                    }
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
            {errors.asset && (
              <p className="text-xs text-destructive">{errors.asset}</p>
            )}
          </div>

          {/* Direction */}
          <div className="space-y-2">
            <Label className="text-sm">Direction</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDirection("ABOVE");
                  setErrors({ ...errors, direction: "" });
                }}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: direction === "ABOVE" ? "2px solid #22c55e" : "2px solid rgba(255,255,255,0.1)",
                  background: direction === "ABOVE" ? "rgba(34,197,94,0.2)" : "transparent",
                  color: direction === "ABOVE" ? "#22c55e" : "#888",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: direction === "ABOVE" ? "0 0 12px rgba(34,197,94,0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (direction !== "ABOVE") {
                    e.currentTarget.style.border = "2px solid #22c55e";
                    e.currentTarget.style.background = "rgba(34,197,94,0.1)";
                    e.currentTarget.style.color = "#22c55e";
                  }
                }}
                onMouseLeave={(e) => {
                  if (direction !== "ABOVE") {
                    e.currentTarget.style.border = "2px solid rgba(255,255,255,0.1)";
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#888";
                  }
                }}
              >
                <TrendingUp style={{ width: "20px", height: "20px", margin: "0 auto 4px" }} />
                <div style={{ fontWeight: "600", fontSize: "14px" }}>ABOVE</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Price goes higher</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDirection("BELOW");
                  setErrors({ ...errors, direction: "" });
                }}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: direction === "BELOW" ? "2px solid #ef4444" : "2px solid rgba(255,255,255,0.1)",
                  background: direction === "BELOW" ? "rgba(239,68,68,0.2)" : "transparent",
                  color: direction === "BELOW" ? "#ef4444" : "#888",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: direction === "BELOW" ? "0 0 12px rgba(239,68,68,0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (direction !== "BELOW") {
                    e.currentTarget.style.border = "2px solid #ef4444";
                    e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                    e.currentTarget.style.color = "#ef4444";
                  }
                }}
                onMouseLeave={(e) => {
                  if (direction !== "BELOW") {
                    e.currentTarget.style.border = "2px solid rgba(255,255,255,0.1)";
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#888";
                  }
                }}
              >
                <TrendingDown style={{ width: "20px", height: "20px", margin: "0 auto 4px" }} />
                <div style={{ fontWeight: "600", fontSize: "14px" }}>BELOW</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Price goes lower</div>
              </button>
            </div>
            {errors.direction && (
              <p className="text-xs text-destructive">{errors.direction}</p>
            )}
          </div>

          {/* Target Price + Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="targetPrice" className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4" />
                Target Price (USD)
              </Label>
              <Input
                id="targetPrice"
                type="number"
                placeholder="e.g. 90000"
                value={targetPrice}
                min="1"
                onChange={(e) => {
                  setTargetPrice(e.target.value);
                  setErrors({ ...errors, targetPrice: "" });
                }}
                className={errors.targetPrice ? "border-destructive" : ""}
              />
              {errors.targetPrice && (
                <p className="text-xs text-destructive">{errors.targetPrice}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                Deadline
              </Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => {
                  setDeadline(e.target.value);
                  setErrors({ ...errors, deadline: "" });
                }}
                className={errors.deadline ? "border-destructive" : ""}
              />
              {errors.deadline && (
                <p className="text-xs text-destructive">{errors.deadline}</p>
              )}
            </div>
          </div>

          {/* Stake Amount */}
          <div className="space-y-2">
            <Label htmlFor="stakeAmount" className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4" />
              Stake Amount (GEN)
            </Label>
            <div className="flex gap-2">
              <Input
                id="stakeAmount"
                type="number"
                placeholder="Min 10 GEN"
                value={stakeAmount}
                min="10"
                onChange={(e) => {
                  setStakeAmount(e.target.value);
                  setErrors({ ...errors, stakeAmount: "" });
                }}
                className={errors.stakeAmount ? "border-destructive" : ""}
              />
              {[10, 50, 100, 500].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setStakeAmount(String(amount))}
                  style={{
                    padding: "4px 8px",
                    fontSize: "12px",
                    borderRadius: "6px",
                    border: stakeAmount === String(amount) ? "2px solid #22c55e" : "2px solid rgba(255,255,255,0.1)",
                    background: stakeAmount === String(amount) ? "rgba(34,197,94,0.2)" : "transparent",
                    color: stakeAmount === String(amount) ? "#22c55e" : "#888",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap" as const,
                  }}
                  onMouseEnter={(e) => {
                    if (stakeAmount !== String(amount)) {
                      e.currentTarget.style.border = "2px solid #22c55e";
                      e.currentTarget.style.color = "#22c55e";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (stakeAmount !== String(amount)) {
                      e.currentTarget.style.border = "2px solid rgba(255,255,255,0.1)";
                      e.currentTarget.style.color = "#888";
                    }
                  }}
                >
                  {amount}
                </button>
              ))}
            </div>
            {errors.stakeAmount && (
              <p className="text-xs text-destructive">{errors.stakeAmount}</p>
            )}
          </div>

          {/* Multiplier Info */}
          <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Multiplier is calculated live on-chain based on distance from current price
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { range: "< 2%", mult: "1.2x", color: "text-blue-400" },
                { range: "2-5%", mult: "1.5x", color: "text-blue-300" },
                { range: "5-10%", mult: "2x", color: "text-yellow-400" },
                { range: "10-20%", mult: "3x", color: "text-orange-400" },
                { range: "20-35%", mult: "5x", color: "text-orange-500" },
                { range: "35%+", mult: "8-20x", color: "text-red-400" },
              ].map((tier) => (
                <div key={tier.range} className="flex justify-between">
                  <span className="text-muted-foreground">{tier.range}</span>
                  <span className={`font-bold ${tier.color}`}>{tier.mult}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {asset && targetPrice && direction && stake >= 10 && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-muted-foreground mb-2">Your prediction:</p>
              <p className="text-sm font-semibold text-center">
                Will{" "}
                <span className="text-accent">{asset}</span>
                {" "}be{" "}
                <span className={direction === "ABOVE" ? "text-green-400" : "text-red-400"}>
                  {direction}
                </span>
                {" "}
                <span className="text-white">${Number(targetPrice).toLocaleString()}</span>
                {deadline && (
                  <> by <span className="text-white">{deadline}</span>?</>
                )}
              </p>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-muted-foreground">
                  Stake: <span className="text-white font-bold">{stake} GEN</span>
                </span>
                <span className="text-muted-foreground">
                  Multiplier: <span className="text-accent font-bold">Calculated on-chain</span>
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Prediction"
              )}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}