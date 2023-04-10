"use client";

import CircuitTable from "@/components/CircuitTable";
import ContributorsTable from "@/components/ContributorsTable";
import { getFetcher } from "@/services/fetcher";
import { Tab } from "@headlessui/react";
import {
  CalendarIcon,
  CpuChipIcon,
  UserPlusIcon,
  UsersIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/20/solid";
import { usePrivy } from "@privy-io/react-auth";
import moment from "moment";
import { useParams } from "next/navigation";
import { Fragment } from "react";
import { toast } from "react-toastify";
import { zKey } from "snarkjs";
import useSWR from "swr";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function CeremonyDetails() {
  const { id } = useParams();
  const { getAccessToken } = usePrivy();
  const { data } = useSWR(`/api/v1/ceremonies/${id}`, (url) => getFetcher(url));
  const { data: contributions } = useSWR(
    `/api/v1/ceremonies/${id}/contributions`,
    (url) => getFetcher(url)
  );

  const handleEndCeremony = async () => {
    const confirmed = confirm("Are you sure?");
    if (!confirmed) return;
    await toast.promise(
      Promise.all(
        contributions.map(async (contribution) => {
          const out: Record<string, string> = { type: "mem" };
          console.log(contribution.zkeyLocation);
          await zKey.beacon(
            `https://link.storjshare.io/s/jxa45axfvthgxrw3bz24uskxcvzq/circuit-contributor/${contribution.zkeyLocation}?download=1`,
            out,
            "System",
            "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
            10
          );

          const res = await fetch(`/api/v1/ceremonies/${id}/circuits`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${await getAccessToken()}`,
            },
            body: JSON.stringify({
              circuitId: contribution.circuitId,
            }),
          });
          const { uploadLink } = await res.json();
          await fetch(uploadLink, {
            method: "PUT",
            body: new Blob([out.data]),
          });
        })
      ),
      {
        pending: "Finalizing ZKey",
        success: "ZKey finalized",
        error: "Unable to finalize ZKey",
      }
    );
  };

  if (!data) return null;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Ceremony: {data.label}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className="inline-flex items-center rounded-md bg-yellow-100 px-2.5 py-0.5 text-sm font-medium text-yellow-800">
                {data.status}
              </span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <CalendarIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {moment(data.startDate).format("MMMM DD, YYYY")}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <UsersIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {data._count.contributors}
            </div>
          </div>
        </div>
        {data.status !== "COMPLETE" ? (
          <div className="mt-5 flex lg:ml-4 lg:mt-0">
            <span className="ml-3">
              <a
                href={`/public/ceremonies/${id}/contribute`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center rounded-md bg-white border px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
              >
                <UserPlusIcon
                  className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-800"
                  aria-hidden="true"
                />
                Invite
              </a>
            </span>

            <span className="ml-3">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-emerald-400 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-300"
                onClick={handleEndCeremony}
              >
                <PaperAirplaneIcon
                  className="-ml-0.5 mr-1.5 h-5 w-5 text-white"
                  aria-hidden="true"
                />
                End Ceremony
              </button>
            </span>
          </div>
        ) : null}
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
                <span
                  className={classNames(
                    selected
                      ? "bg-emerald-100 text-emerald-400"
                      : "bg-gray-100 text-gray-800",
                    "ml-3 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block"
                  )}
                >
                  {data._count.circuits}
                </span>
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
                <UsersIcon
                  className={classNames(
                    selected
                      ? "text-emerald-400"
                      : "text-gray-400 group-hover:text-gray-500",
                    "-ml-0.5 mr-2 h-5 w-5"
                  )}
                  aria-hidden="true"
                />
                <span>Contributors</span>
                <span
                  className={classNames(
                    selected
                      ? "bg-emerald-100 text-emerald-400"
                      : "bg-gray-100 text-gray-800",
                    "ml-3 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block"
                  )}
                >
                  {data._count.contributors}
                </span>
              </a>
            )}
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <CircuitTable ceremonyId={id} />
          </Tab.Panel>
          <Tab.Panel>
            <ContributorsTable ceremonyId={id} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  );
}
