"use client";

import CircuitTable from "@/components/CircuitTable";
import ContributorsTable from "@/components/ContributorsTable";
import { getFetcher } from "@/services/fetcher";
import { Tab } from "@headlessui/react";
import {
  CpuChipIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";
import { usePrivy } from "@privy-io/react-auth";
import { useParams } from "next/navigation";
import { Fragment, useCallback, useState } from "react";
import { toast } from "react-toastify";
import { zKey } from "snarkjs";
import useSWR from "swr";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Contribute() {
  const { id } = useParams();
  const { data: ceremony } = useSWR(`/api/v1/ceremonies/${id}`, getFetcher);
  const { data: circuits } = useSWR(
    `/api/v1/ceremonies/${id}/circuits`,
    getFetcher
  );
  const { data: contributors } = useSWR(
    `/api/v1/ceremonies/${id}/contributors`,
    getFetcher
  );
  const { user, getAccessToken } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);

  const name = user.email?.address || user.google?.email;
  const hasContributed = !!contributors?.find(
    (contributor) => contributor.email === name
  );

  const handleContribute = useCallback(async () => {
    try {
      setIsLoading(true);
      const random = Buffer.from(
        crypto.getRandomValues(new Uint8Array(32))
      ).toString("hex");

      await toast.promise(
        Promise.all(
          circuits.map(async (circuit) => {
            const out: Record<string, string> = { type: "mem" };

            const res = await fetch(
              `/api/v1/ceremonies/${id}/contributions?circuitId=${circuit.id}`,
              {
                headers: {
                  Authorization: `Bearer ${await getAccessToken()}`,
                },
              }
            );
            const contributors = await res.json();
            const latestContributor = contributors[0];

            const hash = await zKey.contribute(
              `https://link.storjshare.io/s/jxa45axfvthgxrw3bz24uskxcvzq/circuit-contributor/${
                latestContributor?.zkeyLocation ?? circuit.initialZKeyLocation
              }?download=1`,
              out,
              name,
              random
            );

            const contributeRes = await fetch(
              `/api/v1/ceremonies/${id}/contributions`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${await getAccessToken()}`,
                },
                body: JSON.stringify({
                  circuitId: circuit.id,
                  name,
                  hash: Buffer.from(hash).toString("hex"),
                  sequenceNumber: (latestContributor?.sequenceNumber ?? 0) + 1,
                }),
              }
            );
            const { uploadLink } = await contributeRes.json();

            await fetch(uploadLink, {
              method: "PUT",
              body: new Blob([out.data]),
            });

            return formatHash(hash, circuit.name);
          })
        ),
        {
          pending: "Contributing...",
          success: "Thanks for your contribution",
          error: "Unable to contribute",
        }
      );

      await fetch(`/api/v1/ceremonies/${id}/contributors`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({
          name,
        }),
      });
    } finally {
      setIsLoading(false);
    }
  }, [circuits, user, getAccessToken, id]);

  if (!circuits || !ceremony) return null;

  return (
    <>
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Ceremony: {ceremony.label}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <CpuChipIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {ceremony._count.circuits}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <UsersIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {ceremony._count.contributors}
            </div>
          </div>
        </div>
        <div className="mt-5 flex lg:ml-4 lg:mt-0">
          {!hasContributed ? (
            <span className="sm:ml-3">
              <button
                type="button"
                disabled={isLoading}
                className="inline-flex gap-2 items-center rounded-md bg-emerald-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:opacity-25"
                onClick={handleContribute}
              >
                <UserPlusIcon
                  className="-ml-0.5 mr-1.5 h-5 w-5"
                  aria-hidden="true"
                />
                Contribute
              </button>
            </span>
          ) : null}
        </div>
      </div>

      <Tab.Group>
        <Tab.List className="my-4 gap-4 flex">
          <Tab as={Fragment}>
            {({ selected }) => (
              <a
                href="#"
                className={classNames(
                  selected
                    ? "border-emerald-400 text-emerald-500 font-bold"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium"
                )}
                aria-current={selected ? "page" : undefined}
              >
                <UsersIcon
                  className={classNames(
                    selected
                      ? "text-emerald-400"
                      : "text-gray-400 group-hover:text-gray-500",
                    "-ml-0.5 mr-2 h-5 w-5"
                  )}
                  aria-hidden="true"
                />
                <span>Contributions</span>
              </a>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ selected }) => (
              <a
                href="#"
                className={classNames(
                  selected
                    ? "border-emerald-400 text-emerald-500 font-bold"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium"
                )}
                aria-current={selected ? "page" : undefined}
              >
                <CpuChipIcon
                  className={classNames(
                    selected
                      ? "text-emerald-400"
                      : "text-gray-400 group-hover:text-gray-500",
                    "-ml-0.5 mr-2 h-5 w-5"
                  )}
                  aria-hidden="true"
                />
                <span>Circuits</span>
              </a>
            )}
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <ContributorsTable ceremonyId={id} />
          </Tab.Panel>
          <Tab.Panel>
            <CircuitTable ceremonyId={id} readOnly />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
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
