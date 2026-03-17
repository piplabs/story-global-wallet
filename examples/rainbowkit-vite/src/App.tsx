import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useWalletClient } from "wagmi";
import { formatEther, Hash } from "viem";
import GlobalWallet from "@story-protocol/global-wallet";
import { createKernelClient } from "@story-protocol/global-wallet/zerodev";
import { useMemo, useState } from "react";

const ZERODEV_RPC =
  "YOUR_ZERODEV_PAYMASTER_RPC";

function App() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: walletClient } = useWalletClient();

  const [txHash, setTxHash] = useState<string | null>(null);
  const [userOpHash, setUserOpHash] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build a txHashResolver using the kernel client (only for waitForUserOperationReceipt)
  const txHashResolver = useMemo(() => {
    const smartWallet = GlobalWallet.wallets?.[0];
    if (!smartWallet) return undefined;

    try {
      const kernelClientPromise = createKernelClient({
        wallet: smartWallet,
        chainId: 1514,
        paymaster: "SPONSOR",
        paymasterRpc: ZERODEV_RPC,
      });

      return async (opHash: Hash): Promise<Hash> => {
        const kernelClient = await kernelClientPromise;
        const receipt = await kernelClient.waitForUserOperationReceipt({
          hash: opHash,
        });
        return receipt.receipt.transactionHash;
      };
    } catch (error) {
      console.warn("Could not create kernel client:", error);
      return undefined;
    }
  }, [walletClient]);

  const sendTestTransaction = async () => {
    if (!address || !walletClient) return;

    setIsSending(true);
    setError(null);
    setTxHash(null);
    setUserOpHash(null);

    try {
      // Send transaction through wagmi's wallet client (goes through the Global Wallet popup)
      const hash = await walletClient.sendTransaction({
        account: address,
        to: address,
        value: BigInt(0),
        data: "0x",
        chain: walletClient.chain,
      });

      // If we have a txHashResolver, the hash is a UserOp hash — resolve it
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
      <h1>Story Global Wallet - RainbowKit Test</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        The "Story Protocol" wallet should appear in the wallet selector below
        via EIP-6963 auto-discovery.
      </p>

      <ConnectButton />

      {isConnected && address && (
        <div style={{ marginTop: "1.5rem" }}>
          <p>Connected: {address}</p>

          {balance && (
            <p>
              Balance: {formatEther(balance.value)} {balance.symbol}
            </p>
          )}

          <hr style={{ margin: "1.5rem 0" }} />

          <h2>Test Sponsored Transaction</h2>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Sends a 0-value transaction to yourself using ZeroDev gas
            sponsorship. Verifies that <code>waitForUserOperationReceipt</code>{" "}
            resolves the UserOp hash to a real transaction hash.
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

export default App;
