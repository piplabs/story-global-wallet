"use client";

import "@story-protocol/global-wallet/story";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
// import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";

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
            walletConnectors: [EthereumWalletConnectors],
            overrides: {
              evmNetworks: [
                {
                  blockExplorerUrls: ["https://storyscan.xyz"],
                  chainId: 1514,
                  chainName: "Story",
                  name: "Story",
                  iconUrls: [],
                  nativeCurrency: { decimals: 18, name: "IP", symbol: "IP" },
                  networkId: 1514,
                  rpcUrls: ["https://mainnet.storyrpc.io"],
                  vanityName: "Story",
                },
                {
                  blockExplorerUrls: ["https://testnet.storyscan.xyz"],
                  chainId: 1513,
                  chainName: "Story Testnet",
                  name: "Story Testnet",
                  iconUrls: [],
                  nativeCurrency: { decimals: 18, name: "IP", symbol: "IP" },
                  networkId: 1513,
                  rpcUrls: ["https://testnet.storyrpc.io"],
                  vanityName: "Story Testnet",
                },
              ],
            },
          }}
        >
          {children}
        </DynamicContextProvider>
      </body>
    </html>
  );
}
