import type { DataURIImage } from "@dynamic-labs/global-wallet-client";

type Config = {
  walletName: string;
  walletIcon: DataURIImage;
  walletUrl: string;
  environmentId: string;
  eip6963: {
    rdns: string;
  };
};

export const config: Config = {
  // Display name shown in wallet selectors (RainbowKit, WalletConnect, etc.)
  walletName: "Story Global Wallet",

  // Story Protocol logo (base64 data URI)
  walletIcon:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJibGFjayIgLz4KPHBhdGggZD0iTTM3OSAzMTAuMDAyQzM3OSAzNzguMjM3IDMyNC4xODYgNDE5IDI1Ni41NTMgNDE5QzE4OC45MTkgNDE5IDE0MS44NDEgMzc4LjY4IDEzMyAzMjcuMjgySDE5NS4zMjlDMjAyLjE4MSAzNDYuNzc4IDIyNC41MDQgMzYwLjk1NiAyNTYuNTUzIDM2MC45NTZDMjkyLjEzNyAzNjAuOTU2IDMxNy43NzYgMzQzLjAxMiAzMTcuNzc2IDMxMS4xMUMzMTcuNzc2IDI3OS4yMDggMjkyLjgwMSAyNjIuODE0IDI1Ni4zMzIgMjYyLjgxNFYzMDcuNzg3QzE4Ny41OTMgMzA3Ljc4NyAxMzQuOTg5IDI2OC43OTYgMTM0Ljk4OSAyMDMuNjYzQzEzNC45ODkgMTM4LjUzIDE4NS42MDQgOTQgMjU2Ljc3NCA5NEMzMjQuMTg2IDk0IDM3MC42MDEgMTM0LjA5OSAzNzUuMjQzIDE4My41MDJIMzE1LjEyNEMzMTAuMjYxIDE2NS43NzkgMjkwLjU5IDE1Mi4yNjUgMjU4LjEgMTUyLjI2NUMyMTguNTM2IDE1Mi4yNjUgMTk2LjY1NSAxNzAuNjUzIDE5Ni42NTUgMjAxLjg5QzE5Ni42NTUgMjMzLjEyNyAyMjEuODUyIDI0OC4xOTIgMjU2LjMzMiAyNDguMTkyVjIwMS4wMDRDMzMxLjAzOCAyMDEuMDA0IDM3OSAyNDUuNzU1IDM3OSAzMTAuMDAyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==",

  // URL of your wallet domain configured in the Dynamic dashboard
  walletUrl: "https://dynamic.story.foundation",

  // Environment ID from your Dynamic dashboard
  environmentId: "17a2e296-2776-4d0f-bc8d-daaf5d4e0fde",

  // EIP-6963 configuration
  eip6963: {
    // Reverse DNS identifier for EIP-6963 provider discovery
    rdns: "foundation.story.wallet",
  },
};
