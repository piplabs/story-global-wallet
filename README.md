# Story Protocol Global Wallet

Monorepo for the Story Protocol Global Wallet package and example integrations.

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

## Setup

```bash
# Install all dependencies
pnpm install

# Build the wallet package
pnpm build-story-global-wallet
```

## Running Examples

```bash
# RainbowKit + Vite (http://localhost:5173)
pnpm rainbowkit-vite

# Dynamic + Next.js (http://localhost:3000)
pnpm dynamic-nextjs
```

## Package Structure

```
packages/story-global-wallet/
├── src/
│   ├── index.ts          # Default export + features
│   ├── ethereum.ts       # EIP-6963 entry point
│   ├── solana.ts         # Solana Wallet Standard entry point
│   ├── zerodev.ts        # ZeroDev gas sponsorship
│   └── lib/
│       ├── config.ts     # Wallet configuration
│       ├── wallet.ts     # GlobalWalletClient factory
│       ├── EIP6963Emitter.ts
│       └── registerSolanaStandard.ts
```

## Publishing

```bash
cd packages/story-global-wallet
npm run build
npm publish --access public
```
