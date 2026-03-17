"use client";

import "@story-protocol/global-wallet/story";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";

export const storyChain = {
  chainId: 1514,
  blockExplorerUrls: ["https://storyscan.io"],
  iconUrls: ["https://app.dynamic.xyz/assets/networks/sepolia.svg"],
  name: "story",
  nativeCurrency: { name: "Story", symbol: "IP", decimals: 18 },
  networkId: 1514,
  rpcUrls: ["https://mainnet.storyrpc.io/"],
  vanityName: "Story Mainnet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DynamicContextProvider
          settings={{
            environmentId:
              process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ||
              "dbc1d91b-94dc-4762-b011-3a2a3a7357b7",
            // "17a2e296-2776-4d0f-bc8d-daaf5d4e0fde",
            walletConnectors: [
              EthereumWalletConnectors,
              ZeroDevSmartWalletConnectors,
            ],
            overrides: {
              evmNetworks: [storyChain],
            },
          }}
        >
          {children}
        </DynamicContextProvider>
      </body>
    </html>
  );
}
