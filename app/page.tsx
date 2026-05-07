"use client";

import { Navbar } from "@/components/Navbar";
import { BetsTable } from "@/components/BetsTable";
import { Leaderboard } from "@/components/Leaderboard";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Crypto Price Prediction Market
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered crypto price predictions on GenLayer blockchain.
              <br />
              Create markets, make predictions, and compete for points.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-8 animate-slide-up">
              <BetsTable />
            </div>
            <div className="lg:col-span-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <Leaderboard />
            </div>
          </div>

          <div className="mt-8 brand-card p-6 md:p-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-2xl font-bold mb-4">How it Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-accent font-bold text-lg">1. Create a Market</div>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet and create a crypto price prediction.
                  Choose an asset (BTC, ETH, SOL...), a target price, direction
                  (ABOVE or BELOW), and a deadline date.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-accent font-bold text-lg">2. Wait for Resolution</div>
                <p className="text-sm text-muted-foreground">
                  After the deadline, the market creator resolves the prediction.
                  GenLayer AI fetches the live price from CoinGecko and
                  verifies the result on-chain.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-accent font-bold text-lg">3. Earn Points</div>
                <p className="text-sm text-muted-foreground">
                  Correct predictions earn you points. Climb the leaderboard
                  and prove your crypto market knowledge!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 brand-card p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h2 className="text-xl font-bold mb-4">Supported Assets</h2>
            <div className="flex flex-wrap gap-3">
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
                <div
                  key={asset.ticker}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bet-button-unselected"
                >
                  <span className="font-bold text-sm text-accent">{asset.ticker}</span>
                  <span className="text-xs text-muted-foreground">{asset.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-white/10 py-2">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              Powered by GenLayer
            </a>
            <a href="https://studio.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              Studio
            </a>
            <a href="https://docs.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              Docs
            </a>
            <a href="https://github.com/genlayerlabs/genlayer-project-boilerplate" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}