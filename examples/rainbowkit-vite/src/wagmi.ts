import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, type Chain } from "wagmi";

const story = {
  id: 1514,
  name: "Story",
  nativeCurrency: {
    name: "IP",
    symbol: "IP",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://mainnet.storyrpc.io"] },
  },
  blockExplorers: {
    default: { name: "StoryScan", url: "https://storyscan.xyz" },
  },
} as const satisfies Chain;

const storyTestnet = {
  id: 1513,
  name: "Story Testnet",
  nativeCurrency: {
    name: "IP",
    symbol: "IP",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://testnet.storyrpc.io"] },
  },
  blockExplorers: {
    default: {
      name: "StoryScan",
      url: "https://testnet.storyscan.xyz",
    },
  },
  testnet: true,
} as const satisfies Chain;

export const config = getDefaultConfig({
  appName: "Story Global Wallet Test",
  // Get a free project ID at https://cloud.walletconnect.com
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [story, storyTestnet],
  transports: {
    [story.id]: http(),
    [storyTestnet.id]: http(),
  },
});
