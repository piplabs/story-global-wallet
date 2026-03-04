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

**Next.js (App Router):**

```tsx
// app/layout.tsx
import "@story-protocol/global-wallet";

export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}
```

**Next.js (Pages Router):**

```tsx
// pages/_app.tsx
import "@story-protocol/global-wallet";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

**Vite / Create React App:**

```tsx
// main.tsx or index.tsx
import "@story-protocol/global-wallet";
```

### 2. Use with your wallet library

The Story Global Wallet is auto-discovered via [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) — no extra configuration needed. It appears alongside MetaMask, Coinbase Wallet, and others in any compatible wallet selector.

**RainbowKit:**

```tsx
import "@story-protocol/global-wallet";
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
import "@story-protocol/global-wallet";
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
import "@story-protocol/global-wallet";
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

If your app already uses the [Dynamic SDK](https://www.dynamic.xyz/), the Story Global Wallet will also appear in the Dynamic wallet list. Install the global wallet package alongside your existing Dynamic setup:

```tsx
// app/layout.tsx
import "@story-protocol/global-wallet";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

export default function RootLayout({ children }) {
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

## Verification

After integrating, verify everything works:

```tsx
// Quick check: listen for the EIP-6963 provider announcement
window.addEventListener("eip6963:announceProvider", (event) => {
  console.log("Providers:", event.detail);
});
window.dispatchEvent(new Event("eip6963:requestProvider"));
```

You should see the Story Global Wallet in the announced providers list.

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

- Documentation: https://docs.story.foundation
- Discord: https://discord.gg/storyprotocol
- GitHub Issues: https://github.com/story-protocol/global-wallet/issues

## License

MIT
