# OMEN — V1 Social Belief Protocol

OMEN is a decentralized social belief protocol enabling continuous market formation on high-conviction opinions, AI-extracted structured claims, creator EIP-712 cryptographic attestation, and deterministic Chainlink oracle resolution across dual testnets (Ethereum Sepolia and Robinhood Chain Testnet).

---

## Key Features

- **Social Belief Markets**: Bet AGREE or DISAGREE on social opinions and influencer convictions with real-time ETH liquidity pools.
- **AI Extraction Wizard (`/create`)**: Transform unstructured text and social posts into verified structured belief statements with auto-calculated confidence metrics.
- **Creator Attestation (EIP-712)**: Gasless cryptographic signature enabling creators to verify authentic ownership of detected statements.
- **Chainlink Oracle Price Feeds**: Deterministic price-based resolution (`PRICE_ABOVE`, `PRICE_BELOW`, `RELATIVE_PERFORMANCE`).
- **Dual Testnet Support**: Built for both Ethereum Sepolia (`11155111`) and Robinhood Chain Testnet (`46630`).
- **OpenZeppelin Dark Theme**: High-density glassmorphism UI with emerald, rose, and purple conviction accents.

---

## Directory Architecture

- `app/`: Next.js 15 App router pages (`/`, `/markets`, `/market/[id]`, `/beliefs`, `/creators`, `/creator/[address]`, `/create`, `/activity`)
- `components/`: Modular React components (`BeliefMarketCard`, `PositionPanel`, `BeliefCard`, `CreatorConfirmation`, `DiscoveryFilter`, `ActivityFeed`, `MarketDetailPanels`)
- `hooks/`: Wagmi v2 custom Web3 hooks (`usePosition`, `useClaim`, `useMarket`, `useCreateMarket`, `useCreatorConfirm`)
- `lib/`: Web3 client configuration (`wagmi.ts`, `contracts.ts`, `oracle/chainlink.ts`)
- `tests/`: Comprehensive unit and E2E test suites with Vitest

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and configure your RPC URLs and contract addresses:

```bash
cp .env.example .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Verification & Testing

### Run Vitest Suite

```bash
npx vitest run
```

### Run ESLint

```bash
npx eslint .
```

### Run Build Check

```bash
npm run build
```
