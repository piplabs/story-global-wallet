"use client";

import "@story-protocol/global-wallet";

import {
  DynamicContextProvider,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";

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
            // Replace with your Dynamic environment ID
            environmentId:
              process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ||
              "17a2e296-2776-4d0f-bc8d-daaf5d4e0fde",
            walletConnectors: [EthereumWalletConnectors, ZeroDevSmartWalletConnectors],
          }}
        >
          {children}
        </DynamicContextProvider>
      </body>
    </html>
  );
}
