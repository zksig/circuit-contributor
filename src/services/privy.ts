import { PrivyClient } from "@privy-io/server-auth";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  process.env.PRIVY_APP_SECRET
);

export const checkSession = async (request: Request) => {
  const token = request.headers.get("authorization")?.replace(/bearer /i, "");
  if (!token) {
    throw new Error("Missing authorization token");
  }

  const { userId } = await privy.verifyAuthToken(token);
  const { email, google } = await privy.getUser(userId);

  return {
    email: email?.address || google?.email,
    id: userId,
  };
};
