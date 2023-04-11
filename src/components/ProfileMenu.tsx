import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { usePrivy } from "@privy-io/react-auth";
import { MD5 } from "crypto-js";

export default function ProfileMenu() {
  const { user } = usePrivy();

  if (!user) {
    return null;
  }

  return (
    <Menu.Button className="-m-1.5 flex items-center p-1.5">
      <span className="sr-only">Open user menu</span>
      <img
        className="h-8 w-8 rounded-full bg-gray-50"
        src={`https://www.gravatar.com/avatar/${MD5(
          user.email?.address || user.google?.email
        )}?d=robohash`}
        alt=""
      />
      <span className="hidden lg:flex lg:items-center">
        <span
          className="ml-4 text-sm font-semibold leading-6 text-gray-900"
          aria-hidden="true"
        >
          {user.email?.address}
        </span>
        <ChevronDownIcon
          className="ml-2 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </span>
    </Menu.Button>
  );
}
