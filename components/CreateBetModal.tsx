"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Calendar, TrendingUp, TrendingDown, DollarSign, Coins } from "lucide-react";
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

  const [errors, setErrors] = useState({
    asset: "",
    targetPrice: "",
    direction: "",
    deadline: "",
  });

  // Auto-close modal when wallet disconnects
  useEffect(() => {
    if (!isConnected && isOpen && !isCreating) {
      setIsOpen(false);
    }
  }, [isConnected, isOpen, isCreating]);

  const validateForm = (): boolean => {
    const newErrors = {
      asset: "",
      targetPrice: "",
      direction: "",
      deadline: "",
    };

    if (!asset.trim()) {
      newErrors.asset = "Please select an asset";
    }

    if (!targetPrice.trim() || isNaN(Number(targetPrice)) || Number(targetPrice) <= 0) {
      newErrors.targetPrice = "Please enter a valid target price";
    }

    if (!direction) {
      newErrors.direction = "Please select a direction (ABOVE or BELOW)";
    }

    if (!deadline.trim()) {
      newErrors.deadline = "Deadline date is required";
    }

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
      targetPrice: Number(targetPrice),
      direction,
      deadline,
    });
  };

  const resetForm = () => {
    setAsset("");
    setTargetPrice("");
    setDirection("");
    setDeadline("");
    setErrors({ asset: "", targetPrice: "", direction: "", deadline: "" });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isCreating) {
      resetForm();
    }
    setIsOpen(open);
  };

  // Reset and close on success
  useEffect(() => {
    if (isSuccess) {
      resetForm();
      setIsOpen(false);
    }
  }, [isSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="gradient"
          disabled={!isConnected || !address || isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Market
        </Button>
      </DialogTrigger>

      <DialogContent className="brand-card border-2 sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create Prediction Market
          </DialogTitle>
          <DialogDescription>
            Predict whether a crypto asset will be above or below a target price by a deadline
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">

          {/* Asset Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
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
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                    asset === a
                      ? "border-accent bg-accent/20 text-accent"
                      : "border-white/10 hover:border-white/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            {errors.asset && (
              <p className="text-xs text-destructive">{errors.asset}</p>
            )}
          </div>

          {/* Target Price */}
          <div className="space-y-2">
            <Label htmlFor="targetPrice" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Target Price (USD)
            </Label>
            <Input
              id="targetPrice"
              type="number"
              placeholder="e.g. 100000"
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

          {/* Direction */}
          <div className="space-y-3">
            <Label>Direction</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDirection("ABOVE");
                  setErrors({ ...errors, direction: "" });
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  direction === "ABOVE"
                    ? "border-green-500 bg-green-500/20 text-green-400"
                    : "border-white/10 hover:border-green-500/40"
                }`}
              >
                <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                <div className="font-semibold text-sm">ABOVE</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Price will be higher
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirection("BELOW");
                  setErrors({ ...errors, direction: "" });
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  direction === "BELOW"
                    ? "border-red-500 bg-red-500/20 text-red-400"
                    : "border-white/10 hover:border-red-500/40"
                }`}
              >
                <TrendingDown className="w-5 h-5 mx-auto mb-1" />
                <div className="font-semibold text-sm">BELOW</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Price will be lower
                </div>
              </button>
            </div>
            {errors.direction && (
              <p className="text-xs text-destructive">{errors.direction}</p>
            )}
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Deadline Date
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

          {/* Preview */}
          {asset && targetPrice && direction && (
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
              <p className="text-sm text-center text-muted-foreground">
                Will{" "}
                <span className="font-bold text-accent">{asset}</span>
                {" "}be{" "}
                <span className={`font-bold ${direction === "ABOVE" ? "text-green-400" : "text-red-400"}`}>
                  {direction}
                </span>
                {" "}
                <span className="font-bold text-foreground">
                  ${Number(targetPrice).toLocaleString()}
                </span>
                {deadline && (
                  <> by <span className="font-bold text-foreground">{deadline}</span>?</>
                )}
              </p>
            </div>
          )}

          {/* Submit Buttons */}
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
                "Create Market"
              )}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}