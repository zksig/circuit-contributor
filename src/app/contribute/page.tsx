"use client";

import {
  LockClosedIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { zKey } from "snarkjs";

export default function Home() {
  const { user } = usePrivy();
  const [name, setName] = useState(user.email?.address);
  const [random, setRandom] = useState(
    Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("hex")
  );
  const [hash, setHash] = useState("");

  const handleContribute = useCallback(async () => {
    const out: Record<string, string> = { type: "mem" };

    const hashes = [];
    const promises = Array(10)
      .fill(null)
      .reduce((acc) => {
        return acc.then((hash) => {
          hashes.push(hash);
          return zKey.contribute(
            "/circuit_00.zkey",
            { type: "mem" },
            name,
            random
          );
        });
      }, zKey.contribute("/circuit_00.zkey", { type: "mem" }, name, random));
    hashes.push(
      await toast.promise(promises, {
        pending: "Contributing...",
        success: "Contributed!",
        error: "Failed to contribute",
      })
    );
    setHash(
      hashes.map((hash) => formatHash(hash, "Contribution Hash: ")).join("\n\n")
    );
    // console.log(await zKey.exportVerificationKey(out), out.data);
  }, [name, random]);

  return (
    <>
      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="w-80">
          <label
            htmlFor="email"
            className="block text-sm font-medium leading-6 text-gray-800"
          >
            Contributor Name
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="name"
              id="name"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-800 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-400 sm:text-sm sm:leading-6"
              placeholder="Ryan Mehta"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full md:w-[600px]">
          <label
            htmlFor="email"
            className="block text-sm font-medium leading-6 text-gray-800"
          >
            Random Entropy
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LockClosedIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              name="random"
              id="random"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-800 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-400 sm:text-sm sm:leading-6"
              value={random}
              onChange={(e) => setRandom(e.target.value)}
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        className="my-4 inline-flex items-center gap-x-2 rounded-md bg-emerald-400 px-3.5 py-2.5 text-center text-sm font-semibold text-gray-800 shadow-sm hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:opacity-50"
        onClick={handleContribute}
        disabled={!name || !random}
      >
        <UserPlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Contribute
      </button>

      <pre className="my-4">{hash}</pre>
    </>
  );
}

function formatHash(b, title) {
  const a = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let S = "";
  for (let i = 0; i < 4; i++) {
    if (i > 0) S += "\n";
    S += "\t\t";
    for (let j = 0; j < 4; j++) {
      if (j > 0) S += " ";
      S += a
        .getUint32(i * 16 + j * 4)
        .toString(16)
        .padStart(8, "0");
    }
  }
  if (title) S = title + "\n" + S;
  return S;
}
