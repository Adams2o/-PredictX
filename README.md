# PredictX

> Predict crypto prices. Verify on-chain. Win on GenLayer.

PredictX is a decentralized crypto price prediction market built on GenLayer blockchain. Users create price prediction markets for top crypto assets like BTC, ETH, and SOL. When a market reaches its deadline, GenLayer's AI validators fetch live price data from CoinGecko and resolve the outcome on-chain — trustlessly and transparently.

## Features

- 🔮 Create crypto price prediction markets
- 📈 Predict ABOVE or BELOW a target price
- 🤖 AI-powered resolution via CoinGecko
- ⛓️ On-chain verification via GenLayer
- 🦊 MetaMask wallet integration
- 🏆 Leaderboard and points system

## Supported Assets

BTC, ETH, SOL, BNB, XRP, ADA, DOGE, AVAX, DOT, MATIC

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS
- **Blockchain:** GenLayer (AI-native blockchain)
- **Smart Contract:** Python (GenLayer)
- **Price Data:** CoinGecko API
- **Wallet:** MetaMask

## Getting Started

### Prerequisites
- Node.js LTS
- MetaMask browser extension
- GenLayer Studio account

### Installation

Clone the repo:
```bash
git clone https://github.com/Adams2o/PredictX.git
cd PredictX
```

Install dependencies:
```bash
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_CHAIN_NAME=GenLayer Studio
NEXT_PUBLIC_GENLAYER_SYMBOL=GEN
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
```

Run the app:
```bash
.\node_modules\.bin\next dev
```

Open [http://localhost:3000](http://localhost:3000)

## Smart Contract

The smart contract is written in Python for GenLayer and deployed on GenLayer Studio. It:

1. Accepts a crypto asset, target price, direction and deadline
2. On resolution, fetches live price from CoinGecko
3. Uses AI to parse the price and determine the outcome
4. Records YES or NO outcome on-chain

## License

MIT