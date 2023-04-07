"use client";

import { useEffect } from "react";
import ConnectButton from "./ConnectButton";
import { usePrivy } from "@privy-io/react-auth";

export default function Main({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login, user } = usePrivy();

  useEffect(() => {
    if (!ready || authenticated) return;

    (async () => {
      await login();
    })();
  }, [ready, authenticated]);

  if (!user) return null;

  if (user?.wallet) {
    return <>{children}</>;
  }

  return (
    <div>
      <ConnectButton />
    </div>
  );
}
