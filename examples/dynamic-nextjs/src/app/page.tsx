"use client";

import { isZeroDevConnector } from "@dynamic-labs/ethereum-aa";
import {
  DynamicWidget,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { useEffect, useMemo, useState } from "react";
import { createPublicClient, formatEther, Hash, http } from "viem";
import { storyChain } from "./layout";

const _storyChain = {
  id: storyChain.chainId,
  name: storyChain.name,
  nativeCurrency: storyChain.nativeCurrency,
  rpcUrls: { default: { http: [storyChain.rpcUrls[0]] } },
} as const;

const publicClient = createPublicClient({
  chain: _storyChain,
  transport: http(),
});

export default function Home() {
  const { user, primaryWallet } = useDynamicContext();
  const [balance, setBalance] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [userOpHash, setUserOpHash] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address = primaryWallet?.address as `0x${string}` | undefined;

  // Check if wallet is using ZeroDev AA connector
  const isAA = primaryWallet?.connector
    ? isZeroDevConnector(primaryWallet.connector)
    : false;

  // Build txHashResolver from the connector's kernel client (for Story SDK integration)
  const txHashResolver = useMemo(() => {
    if (!primaryWallet || !isAA) return undefined;

    const connector = primaryWallet.connector as {
      kernelClient?: {
        waitForUserOperationReceipt: (args: {
          hash: Hash;
        }) => Promise<{ receipt: { transactionHash: Hash } }>;
      };
    };

    return async (opHash: Hash): Promise<Hash> => {
      if (!connector.kernelClient) {
        throw new Error("ZeroDev kernel client not available");
      }
      const receipt = await connector.kernelClient.waitForUserOperationReceipt({
        hash: opHash,
      });
      return receipt.receipt.transactionHash;
    };
  }, [primaryWallet, isAA]);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const bal = await publicClient.getBalance({ address });
        setBalance(formatEther(bal));
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      }
    };

    fetchBalance();
  }, [address]);

  const sendTestTransaction = async () => {
    if (!address || !primaryWallet) return;

    setIsSending(true);
    setError(null);
    setTxHash(null);
    setUserOpHash(null);

    try {
      // Get the viem wallet client from Dynamic's connector
      const walletClient = (primaryWallet.connector as any).getWalletClient();

      // Send a 0-value transaction to self
      const hash = await walletClient.sendTransaction({
        account: address,
        to: address,
        value: BigInt(0),
        data: "0x",
        chain: _storyChain,
      });

      // If using ZeroDev AA, the hash is a UserOp hash — resolve it
      if (txHashResolver) {
        setUserOpHash(hash);
        const resolvedTxHash = await txHashResolver(hash);
        setTxHash(resolvedTxHash);
      } else {
        setTxHash(hash);
      }
    } catch (err: any) {
      console.error("Test transaction failed:", err);
      setError(err.message || "Transaction failed");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Story Global Wallet - Dynamic + Next.js Test</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Test the Story Protocol global wallet with Dynamic SDK integration.
      </p>

      <DynamicWidget />

      {user && primaryWallet && address && (
        <div style={{ marginTop: "1.5rem" }}>
          <p>Connected: {address}</p>
          <p>User ID: {user.userId}</p>
          <p>Wallet Type: {isAA ? "ZeroDev Smart Account" : "EOA"}</p>

          {balance !== null && <p>Balance: {balance} IP</p>}

          <hr style={{ margin: "1.5rem 0" }} />

          <h2>Test Sponsored Transaction</h2>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Sends a 0-value transaction to yourself.
            {isAA
              ? " Uses ZeroDev gas sponsorship. The UserOp hash is resolved to a real transaction hash via waitForUserOperationReceipt."
              : " Sent as a regular transaction (no AA detected)."}
          </p>

          <button
            onClick={sendTestTransaction}
            disabled={isSending}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              cursor: isSending ? "not-allowed" : "pointer",
            }}
          >
            {isSending ? "Sending..." : "Send Test Transaction"}
          </button>

          {error && (
            <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>
          )}

          {userOpHash && (
            <p style={{ marginTop: "0.5rem" }}>
              UserOp Hash: <code>{userOpHash}</code>
            </p>
          )}

          {txHash && (
            <div style={{ marginTop: "0.5rem" }}>
              <p style={{ color: "green" }}>Transaction confirmed!</p>
              <p>
                Tx Hash:{" "}
                <a
                  href={`https://storyscan.xyz/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {txHash}
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
