import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import ConnectButton from "./ConnectButton";
import { useStytchUser } from "@stytch/react";

export default function ProfileMenu() {
  const { user } = useStytchUser();

  if (!user) {
    return null;
  }

  return (
    <Menu.Button className="-m-1.5 flex items-center p-1.5">
      <span className="sr-only">Open user menu</span>
      <img
        className="h-8 w-8 rounded-full bg-gray-50"
        src={`https://robohash.org/${user.emails[0].email}.png`}
        alt=""
      />
      <span className="hidden lg:flex lg:items-center">
        <span
          className="ml-4 text-sm font-semibold leading-6 text-gray-900"
          aria-hidden="true"
        >
          {`${user.name.first_name} ${user.name.last_name}` ||
            user.emails[0].email}
        </span>
        <ChevronDownIcon
          className="ml-2 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </span>
    </Menu.Button>
  );
}
