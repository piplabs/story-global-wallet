import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

function App() {
  const { address, isConnected } = useAccount();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Story Global Wallet - RainbowKit Test</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        The "Story Protocol" wallet should appear in the wallet selector below
        via EIP-6963 auto-discovery.
      </p>

      <ConnectButton />

      {isConnected && (
        <div style={{ marginTop: "1.5rem" }}>
          <p>Connected: {address}</p>
        </div>
      )}
    </div>
  );
}

export default App;
