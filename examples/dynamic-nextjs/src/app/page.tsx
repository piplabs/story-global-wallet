"use client";

import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";

export default function Home() {
  const { user, primaryWallet } = useDynamicContext();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Story Global Wallet - Dynamic + Next.js Test</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Test the Story Protocol global wallet with Dynamic SDK integration.
      </p>

      <DynamicWidget />

      {user && primaryWallet && (
        <div style={{ marginTop: "1.5rem" }}>
          <p>Connected: {primaryWallet.address}</p>
          <p>User ID: {user.userId}</p>
        </div>
      )}
    </div>
  );
}
