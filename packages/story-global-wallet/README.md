# @story-protocol/global-wallet

Cross-app embedded wallet for Story Protocol, enabling seamless wallet portability across applications in the IP ecosystem.

Powered by [Dynamic](https://www.dynamic.xyz/) Global Wallets.

## Installation

```bash
npm install @story-protocol/global-wallet
```

## Quick Start

### 1. Import the wallet

Add a single import to your app's entry point. That's it — no API keys, no configuration, no Dynamic account needed.

> **Important:** This package is client-side only. In Next.js App Router, the import must be in a Client Component (a file with `"use client"`). It cannot be imported in a Server Component.

```tsx
// Next.js: app/layout.tsx or Providers.tsx (must be a Client Component)
// Vite/CRA: main.tsx or index.tsx
"use client";

import "@story-protocol/global-wallet/story";
```

### 2. Use with your wallet library

The Story Global Wallet is auto-discovered via [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) — no extra configuration needed. It appears alongside MetaMask, Coinbase Wallet, and others in any compatible wallet selector (RainbowKit, ConnectKit, wagmi, Dynamic, etc.).

### 3. That's it

The user gets the same wallet address across every app that integrates this package.

## Gas Sponsorship with ZeroDev

The Story Global Wallet uses [ZeroDev](https://zerodev.app/) for Account Abstraction, enabling gasless (sponsored) transactions. The setup differs depending on whether your app uses RainbowKit/wagmi or the Dynamic SDK directly.

### RainbowKit / wagmi

For apps using RainbowKit or wagmi (without Dynamic's SDK), use `createKernelClient` from the global wallet package to create a ZeroDev kernel client.

#### Additional dependencies

```bash
npm install @zerodev/sdk @dynamic-labs/ethereum-aa
```

#### Creating a Kernel Client

```tsx
import GlobalWallet from "@story-protocol/global-wallet";
import { createKernelClient } from "@story-protocol/global-wallet/zerodev";

const smartWallet = GlobalWallet.wallets[0];

const kernelClient = await createKernelClient({
  wallet: smartWallet,
  chainId: 1514, // Story Mainnet
  paymaster: "SPONSOR",
  paymasterRpc: "YOUR_ZERODEV_PAYMASTER_RPC",
});
```

#### Sending Transactions & Resolving UserOp Hashes

Transactions are sent through wagmi's wallet client (which routes through the Global Wallet popup for signing). The kernel client is used **only** to resolve the UserOperation hash into a real transaction hash via `waitForUserOperationReceipt`:

```tsx
import { useWalletClient } from "wagmi";
import { Hash } from "viem";

// Send through wagmi (handles signing via the Global Wallet popup)
const { data: walletClient } = useWalletClient();
const hash = await walletClient.sendTransaction({
  account: address,
  to: "0x...",
  value: BigInt(0),
  data: "0x",
});

// Resolve the UserOp hash to a real transaction hash
const receipt = await kernelClient.waitForUserOperationReceipt({
  hash: hash as Hash,
});
console.log("Tx hash:", receipt.receipt.transactionHash);
```

> **Important:** Do not use `kernelClient.sendUserOperation()` to send transactions — this will hang in the popup. Always send through wagmi's wallet client and use the kernel client only for receipt resolution.

#### Using with the Story SDK

When using `@story-protocol/core-sdk`, ZeroDev returns UserOperation hashes instead of regular transaction hashes. The Story SDK needs a `txHashResolver` to convert these so it can track on-chain events.

Build a `txHashResolver` from the kernel client and pass it to `StoryClient.newClientUseWallet()`:

```tsx
import { StoryClient, SupportedChainIds } from "@story-protocol/core-sdk";
import GlobalWallet from "@story-protocol/global-wallet";
import { createKernelClient } from "@story-protocol/global-wallet/zerodev";
import { Hash, http } from "viem";

// Build txHashResolver from kernel client
const kernelClientPromise = createKernelClient({
  wallet: GlobalWallet.wallets[0],
  chainId: 1514,
  paymaster: "SPONSOR",
  paymasterRpc: "YOUR_ZERODEV_PAYMASTER_RPC",
});

const txHashResolver = async (userOpHash: Hash): Promise<Hash> => {
  const kernelClient = await kernelClientPromise;
  const receipt = await kernelClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });
  return receipt.receipt.transactionHash;
};

// Pass the resolver when creating the StoryClient
const storyClient = StoryClient.newClientUseWallet({
  transport: http(),
  wallet: walletClient, // from wagmi useWalletClient()
  chainId: "1514" as SupportedChainIds,
  txHashResolver,
});
```

### Dynamic SDK

For apps using the [Dynamic SDK](https://www.dynamic.xyz/) directly, the ZeroDev kernel client is already available on Dynamic's wallet connector — you don't need to call `createKernelClient` from the global wallet package.

#### Prerequisites

1. Enable ZeroDev in your Dynamic dashboard with gas sponsorship configured for Story (chain 1514)
2. Install the required packages:

```bash
npm install @dynamic-labs/ethereum-aa viem
```

3. Add `ZeroDevSmartWalletConnectors` to your Dynamic provider:

```tsx
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";

<DynamicContextProvider
  settings={{
    environmentId: "YOUR_DYNAMIC_ENVIRONMENT_ID",
    walletConnectors: [EthereumWalletConnectors, ZeroDevSmartWalletConnectors],
  }}
>
  {children}
</DynamicContextProvider>
```

#### Sending Transactions

With Dynamic, transactions are sent through the wallet client on the connector. Dynamic's ZeroDev integration handles gas sponsorship automatically:

```tsx
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

const { primaryWallet } = useDynamicContext();

// Get the viem wallet client from Dynamic's connector
const walletClient = (primaryWallet.connector as any).getWalletClient();

const hash = await walletClient.sendTransaction({
  account: primaryWallet.address,
  to: "0x...",
  value: BigInt(0),
  data: "0x",
});
```

#### Using with the Story SDK

With Dynamic, the ZeroDev kernel client is already available on the connector. Use `isZeroDevConnector` to detect AA wallets and build a `txHashResolver`:

```tsx
import { isZeroDevConnector } from "@dynamic-labs/ethereum-aa";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { StoryClient, SupportedChainIds } from "@story-protocol/core-sdk";
import { Hash, http } from "viem";

const { primaryWallet } = useDynamicContext();

// Build txHashResolver from the connector's built-in kernel client
let txHashResolver: ((hash: Hash) => Promise<Hash>) | undefined;

if (primaryWallet && isZeroDevConnector(primaryWallet.connector)) {
  const connector = primaryWallet.connector as {
    kernelClient?: {
      waitForUserOperationReceipt: (args: {
        hash: Hash;
      }) => Promise<{ receipt: { transactionHash: Hash } }>;
    };
  };

  txHashResolver = async (userOpHash: Hash): Promise<Hash> => {
    if (!connector.kernelClient) {
      throw new Error("ZeroDev kernel client not available");
    }
    const receipt = await connector.kernelClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });
    return receipt.receipt.transactionHash;
  };
}

// Pass the resolver when creating the StoryClient
const walletClient = (primaryWallet.connector as any).getWalletClient();

const storyClient = StoryClient.newClientUseWallet({
  transport: http(),
  wallet: walletClient,
  chainId: "1514" as SupportedChainIds,
  txHashResolver,
});
```

## How It Works

1. You install this package and import it — the EIP-6963 provider is announced automatically
2. "Story Global Wallet" appears in your wallet selector UI
3. User clicks it — a popup opens to `dynamic.story.foundation`
4. User authenticates or creates a wallet via Dynamic
5. Wallet address is returned to your app via encrypted messaging
6. All signing requests use the same secure popup flow

## Requirements

- Node.js 18+
- A web framework that supports ES modules (Next.js, Vite, CRA, etc.)

## Support

- Documentation: [https://docs.story.foundation](https://docs.story.foundation)
- Discord: [https://discord.gg/storyprotocol](https://discord.gg/storyprotocol)
- GitHub Issues: [https://github.com/story-protocol/global-wallet/issues](https://github.com/story-protocol/global-wallet/issues)

## License

MIT
