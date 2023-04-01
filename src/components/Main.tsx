import { useEffect } from "react";
import ConnectButton from "./ConnectButton";
import { useStytch, useStytchUser } from "@stytch/react";

export default function Main({ children }: { children: React.ReactNode }) {
  const stytchClient = useStytch();
  const { user, fromCache } = useStytchUser();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  console.log(user, fromCache);

  useEffect(() => {
    if (!token) return;
    (async () => {
      await stytchClient.magicLinks.authenticate(token, {
        session_duration_minutes: 60,
      });
      location.replace("/");
    })();
  }, [token]);

  if (user) {
    return <>{children}</>;
  }

  return (
    <div>
      <ConnectButton />
    </div>
  );
}
