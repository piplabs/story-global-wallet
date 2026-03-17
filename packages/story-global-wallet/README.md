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

**Next.js (App Router):**

```tsx
// app/layout.tsx or Providers.tsx (or any Client Component)
"use client";

import "@story-protocol/global-wallet/story";
```

**Vite / Create React App:**

```tsx
// main.tsx or index.tsx
import "@story-protocol/global-wallet/story";
```

### 2. Use with your wallet library

The Story Global Wallet is auto-discovered via [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) — no extra configuration needed. It appears alongside MetaMask, Coinbase Wallet, and others in any compatible wallet selector.

**RainbowKit:**

```tsx
import "@story-protocol/global-wallet/story";
import { RainbowKitProvider, ConnectButton } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";

function App() {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        {/* "Story Global Wallet" auto-appears in the wallet list */}
        <ConnectButton />
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
```

**wagmi (standalone):**

```tsx
import "@story-protocol/global-wallet/story";
import { useConnect } from "wagmi";

function ConnectButton() {
  const { connect, connectors } = useConnect();

  return (
    <div>
      {connectors.map((connector) => (
        <button key={connector.id} onClick={() => connect({ connector })}>
          {connector.name}
        </button>
      ))}
      {/* "Story Global Wallet" will appear in the connectors list */}
    </div>
  );
}
```

**ConnectKit:**

```tsx
import "@story-protocol/global-wallet/story";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";

function App() {
  return (
    <ConnectKitProvider>
      <ConnectKitButton />
    </ConnectKitProvider>
  );
}
```

**Dynamic:**

If your app already uses the [Dynamic SDK](https://www.dynamic.xyz/), the Story Global Wallet will also appear in the Dynamic wallet list. Add the import to your existing Client Component providers:

```tsx
// components/Providers.tsx
"use client";
import "@story-protocol/global-wallet/story";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "YOUR_DYNAMIC_ENVIRONMENT_ID",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
```

> **Note:** If your Dynamic environment has ZeroDev (Account Abstraction) enabled, you also need to add `ZeroDevSmartWalletConnectors`:
>
> ```bash
> npm install @dynamic-labs/ethereum-aa
> ```
>
> ```tsx
> import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
>
> // Add to walletConnectors array:
> walletConnectors: [EthereumWalletConnectors, ZeroDevSmartWalletConnectors],
> ```

### 3. That's it

The user gets the same wallet address across every app that integrates this package.

## Gas Sponsorship with ZeroDev

The Story Global Wallet uses [ZeroDev](https://zerodev.app/) for Account Abstraction, enabling gasless (sponsored) transactions. You can create a kernel client to sponsor gas for your users.

### Creating a Kernel Client

```tsx
import GlobalWallet from "@story-protocol/global-wallet";
import { createKernelClient } from "@story-protocol/global-wallet/zerodev";

const smartWallet = GlobalWallet.wallets[0];

const kernelClient = await createKernelClient({
  wallet: smartWallet,
  chainId: 1514, // Story Mainnet
  paymaster: "SPONSOR",
  paymasterRpc: "https://rpc.zerodev.app/api/v2/paymaster/02d8a620-8842-475c-ab23-576a7dd1a5be",
});
```

### Sending Sponsored Transactions

Once you have a kernel client, you can batch and send gasless user operations:

```tsx
import { encodeFunctionData } from "viem";

const { account } = kernelClient;

const hash = await kernelClient.sendUserOperation({
  account,
  callData: await account.encodeCalls([
    {
      to: contractAddress,
      value: BigInt(0),
      data: encodeFunctionData({
        abi: contractABI,
        functionName: "mint",
        args: [walletAddress],
      }),
    },
  ]),
});
```

### Using with the Story SDK

When using the Story Global Wallet with `@story-protocol/core-sdk`, ZeroDev returns **UserOperation hashes** instead of regular transaction hashes. The Story SDK needs a `txHashResolver` to convert these into real transaction hashes so it can track on-chain events.

Use `waitForUserOperationReceipt` on the kernel client to resolve UserOp hashes:

```tsx
import {
  StoryClient,
  SupportedChainIds,
} from "@story-protocol/core-sdk";
import GlobalWallet from "@story-protocol/global-wallet";
import { createKernelClient } from "@story-protocol/global-wallet/zerodev";
import { Hash, http } from "viem";

// 1. Create the kernel client from the Global Wallet
const smartWallet = GlobalWallet.wallets[0];
const kernelClient = await createKernelClient({
  wallet: smartWallet,
  chainId: 1514,
  paymaster: "SPONSOR",
  paymasterRpc: "https://rpc.zerodev.app/api/v2/paymaster/02d8a620-8842-475c-ab23-576a7dd1a5be",
});

// 2. Build a txHashResolver that converts UserOp hashes to tx hashes
const txHashResolver = async (userOpHash: Hash): Promise<Hash> => {
  const receipt = await kernelClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });
  return receipt.receipt.transactionHash;
};

// 3. Pass the resolver when creating the StoryClient
const storyClient = StoryClient.newClientUseWallet({
  transport: http(),
  wallet: walletClient, // from wagmi useWalletClient() or similar
  chainId: "1514" as SupportedChainIds,
  txHashResolver,
});

// 4. Now SDK write operations work with sponsored transactions
const response = await storyClient.license.mintLicenseTokens({
  licenseTermsId: "1",
  licensorIpId: "0x...",
  receiver: "0x...",
  amount: 1,
});
```

#### React Example (wagmi)

Here's a full React provider pattern for integrating gas sponsorship with the Story SDK:

```tsx
"use client";

import {
  StoryClient,
  SupportedChainIds,
} from "@story-protocol/core-sdk";
import GlobalWallet from "@story-protocol/global-wallet";
import { createKernelClient } from "@story-protocol/global-wallet/zerodev";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Hash, http } from "viem";
import { useWalletClient } from "wagmi";

interface StorySDKContextValue {
  storyClient: StoryClient | null;
  isLoading: boolean;
}

const StorySDKContext = createContext<StorySDKContextValue | null>(null);

export function useStorySDK() {
  const context = useContext(StorySDKContext);
  if (!context) {
    throw new Error("useStorySDK must be used within a StorySdkProvider");
  }
  return context;
}

export function StorySdkProvider({ children }: { children: ReactNode }) {
  const { data: walletClient } = useWalletClient();
  const [storyClient, setStoryClient] = useState<StoryClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const txHashResolver = useMemo(() => {
    const smartWallet = GlobalWallet.wallets?.[0];
    if (!smartWallet) return undefined;

    try {
      const kernelClient = createKernelClient({
        wallet: smartWallet,
        chainId: 1514,
        paymaster: "SPONSOR",
        paymasterRpc: "https://rpc.zerodev.app/api/v2/paymaster/02d8a620-8842-475c-ab23-576a7dd1a5be",
      });

      return async (userOpHash: Hash): Promise<Hash> => {
        const receipt = await (
          await kernelClient
        ).waitForUserOperationReceipt({
          hash: userOpHash,
        });
        return receipt.receipt.transactionHash;
      };
    } catch (error) {
      console.warn(
        "[StorySdkProvider] Could not create kernel client:",
        error,
      );
      return undefined;
    }
  }, [walletClient]);

  useEffect(() => {
    if (!walletClient) {
      setStoryClient(null);
      setIsLoading(false);
      return;
    }

    try {
      const client = StoryClient.newClientUseWallet({
        transport: http(),
        wallet: walletClient,
        chainId: `${walletClient.chain.id}` as SupportedChainIds,
        txHashResolver,
      });

      setStoryClient(client);
    } catch (error) {
      console.error("[StorySdkProvider] Error creating StoryClient:", error);
      setStoryClient(null);
    }
    setIsLoading(false);
  }, [walletClient, txHashResolver]);

  return (
    <StorySDKContext.Provider value={{ storyClient, isLoading }}>
      {children}
    </StorySDKContext.Provider>
  );
}
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