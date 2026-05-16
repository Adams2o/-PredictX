"use client";

import { Navbar } from "@/components/Navbar";
import { BetsTable } from "@/components/BetsTable";
import { Leaderboard } from "@/components/Leaderboard";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-16 sm:pt-20 pb-12 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Hero Section */}
          <div className="text-center mb-6 sm:mb-8 animate-fade-in px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
              Crypto Price Prediction Market
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Predict crypto prices on GenLayer blockchain.
              Stake GEN tokens and earn multiplied returns.
            </p>
          </div>

          {/* Main Grid */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            <div className="w-full lg:col-span-8 animate-slide-up order-2 lg:order-1">
              <BetsTable />
            </div>
            <div className="w-full lg:col-span-4 animate-slide-up order-1 lg:order-2" style={{ animationDelay: "100ms" }}>
              <Leaderboard />
            </div>
          </div>

          {/* How it Works */}
          <div className="mt-6 sm:mt-8 brand-card p-4 sm:p-6 md:p-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">How it Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="text-accent font-bold text-base sm:text-lg">1. Create a Prediction</div>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet, pick a crypto asset, set your target price,
                  choose ABOVE or BELOW, set a deadline and stake GEN tokens.
                  The further your prediction from current price, the higher the multiplier.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-accent font-bold text-base sm:text-lg">2. Earn Multiplied Returns</div>
                <p className="text-sm text-muted-foreground">
                  Multipliers range from 1.2x for safe predictions to 20x for bold ones.
                  The riskier your prediction, the bigger your potential return.
                  Cancel anytime before resolution to get your stake back.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-accent font-bold text-base sm:text-lg">3. Resolve and Win</div>
                <p className="text-sm text-muted-foreground">
                  After the deadline, resolve your prediction. GenLayer AI fetches
                  the live price from CoinGecko and verifies the outcome on-chain.
                  Winners receive their stake multiplied by their odds.
                </p>
              </div>
            </div>
          </div>

          {/* Multiplier Table */}
          <div className="mt-4 sm:mt-6 brand-card p-4 sm:p-6 animate-fade-in" style={{ animationDelay: "250ms" }}>
            <h2 className="text-xl font-bold mb-4">Multiplier Table</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
              {[
                { range: "< 2%", multiplier: "1.2x", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
                { range: "2-5%", multiplier: "1.5x", color: "text-blue-300", bg: "bg-blue-300/10 border-blue-300/20" },
                { range: "5-10%", multiplier: "2x", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
                { range: "10-20%", multiplier: "3x", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
                { range: "20-35%", multiplier: "5x", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
                { range: "35-50%", multiplier: "8x", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
                { range: "50-75%", multiplier: "12x", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
                { range: "75%+", multiplier: "20x", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
              ].map((tier) => (
                <div key={tier.range} className={`flex flex-col items-center p-2 sm:p-3 rounded-lg border ${tier.bg}`}>
                  <span className={`text-lg sm:text-xl font-bold ${tier.color}`}>{tier.multiplier}</span>
                  <span className="text-xs text-muted-foreground mt-1 text-center">{tier.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Assets */}
          <div className="mt-4 sm:mt-6 brand-card p-4 sm:p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h2 className="text-xl font-bold mb-4">Supported Assets</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {[
                { ticker: "BTC", name: "Bitcoin" },
                { ticker: "ETH", name: "Ethereum" },
                { ticker: "SOL", name: "Solana" },
                { ticker: "BNB", name: "BNB" },
                { ticker: "XRP", name: "XRP" },
                { ticker: "ADA", name: "Cardano" },
                { ticker: "DOGE", name: "Dogecoin" },
                { ticker: "AVAX", name: "Avalanche" },
                { ticker: "DOT", name: "Polkadot" },
                { ticker: "MATIC", name: "Polygon" },
              ].map((asset) => (
                <div key={asset.ticker} className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bet-button-unselected">
                  <span className="font-bold text-xs sm:text-sm text-accent">{asset.ticker}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">{asset.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-white/10 py-3 sm:py-2">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
            <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Powered by GenLayer</a>
            <a href="https://studio.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Studio</a>
            <a href="https://docs.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Docs</a>
            <a href="https://github.com/Adams2o/PredictX" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}