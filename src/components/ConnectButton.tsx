import { EnvelopeIcon } from "@heroicons/react/20/solid";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

export default function ConnectButton() {
  const { createWallet, linkWallet } = usePrivy();

  return (
    <div className="flex h-96 items-center justify-center gap-8">
      <button
        className="rounded border border-gray-800 bg-gray-100 px-4 py-2 text-gray-800"
        onClick={createWallet}
      >
        Connect App Wallet
      </button>
      <button
        className="rounded bg-gray-800 px-4 py-2 text-gray-100"
        onClick={linkWallet}
      >
        Link Existing Wallet
      </button>
    </div>
  );
}
