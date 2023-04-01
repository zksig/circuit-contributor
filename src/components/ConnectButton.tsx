import { useState } from "react";
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import { useStytch } from "@stytch/react";

export default function ConnectButton() {
  const stytchClient = useStytch();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    stytchClient.magicLinks.email.loginOrCreate(email, {
      login_magic_link_url: "http://localhost:3000",
      login_expiration_minutes: 60,
      signup_magic_link_url: "http://localhost:3000",
      signup_expiration_minutes: 60,
    });
  };

  return (
    <form className="m-auto w-96" onSubmit={handleSubmit}>
      <div className="my-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Email
        </label>
        <div className="relative mt-2 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <EnvelopeIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="email"
            name="email"
            id="email"
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <button className="rounded bg-emerald-400 px-4 py-2 text-gray-800">
        Connect Wallet
      </button>
    </form>
  );
}
