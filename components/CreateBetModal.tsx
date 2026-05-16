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

function estimateMultiplier(targetPrice: number, direction: string): { multiplier: number; label: string; color: string } {
  // We estimate multiplier since we don't have live price here
  // Real multiplier is calculated on-chain with live price
  if (!targetPrice || targetPrice <= 0) return { multiplier: 1, label: "", color: "" };

  // Return estimated based on direction and round numbers
  // This is just a UI hint — actual multiplier comes from contract
  return { multiplier: 0, label: "Calculated on-chain", color: "text-accent" };
}

function getMultiplierDisplay(multiplier: number): { label: string; color: string } {
  const x = multiplier / 100;
  if (x <= 1.5) return { label: "Low Risk", color: "text-blue-400" };
  if (x <= 3) return { label: "Medium Risk", color: "text-yellow-400" };
  if (x <= 8) return { label: "High Risk", color: "text-orange-400" };
  return { label: "Very High Risk", color: "text-red-400" };
}

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
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border-2 transition-all ${
                    asset === a
                      ? "border-accent bg-accent/20 text-accent"
                      : "border-white/10 hover:border-white/30 text-muted-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            {errors.asset && <p className="text-xs text-destructive">{errors.asset}</p>}
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
                className={`p-3 rounded-lg border-2 transition-all ${
                  direction === "ABOVE"
                    ? "border-green-500 bg-green-500/20 text-green-400"
                    : "border-white/10 hover:border-green-500/40"
                }`}
              >
                <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                <div className="font-semibold text-sm">ABOVE</div>
                <div className="text-xs text-muted-foreground">Price goes higher</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirection("BELOW");
                  setErrors({ ...errors, direction: "" });
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  direction === "BELOW"
                    ? "border-red-500 bg-red-500/20 text-red-400"
                    : "border-white/10 hover:border-red-500/40"
                }`}
              >
                <TrendingDown className="w-5 h-5 mx-auto mb-1" />
                <div className="font-semibold text-sm">BELOW</div>
                <div className="text-xs text-muted-foreground">Price goes lower</div>
              </button>
            </div>
            {errors.direction && <p className="text-xs text-destructive">{errors.direction}</p>}
          </div>

          {/* Target Price + Deadline side by side on desktop */}
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
              {errors.targetPrice && <p className="text-xs text-destructive">{errors.targetPrice}</p>}
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
              {errors.deadline && <p className="text-xs text-destructive">{errors.deadline}</p>}
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
              {/* Quick stake buttons */}
              {[10, 50, 100, 500].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setStakeAmount(String(amount))}
                  className="px-2 py-1 text-xs rounded border border-white/10 hover:border-accent/50 text-muted-foreground hover:text-accent transition-all whitespace-nowrap"
                >
                  {amount}
                </button>
              ))}
            </div>
            {errors.stakeAmount && <p className="text-xs text-destructive">{errors.stakeAmount}</p>}
          </div>

          {/* Multiplier Info */}
          <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Multiplier is calculated live on-chain based on distance from current price
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance &lt;2%</span>
                <span className="text-blue-400 font-bold">1.2x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance 5-10%</span>
                <span className="text-yellow-400 font-bold">2x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance 10-20%</span>
                <span className="text-orange-400 font-bold">3x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance 20-35%</span>
                <span className="text-red-400 font-bold">5x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance 35-50%</span>
                <span className="text-red-500 font-bold">8x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance 75%+</span>
                <span className="text-purple-400 font-bold">20x</span>
              </div>
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
                <span className="text-muted-foreground">Stake: <span className="text-white font-bold">{stake} GEN</span></span>
                <span className="text-muted-foreground">Multiplier: <span className="text-accent font-bold">Calculated on-chain</span></span>
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