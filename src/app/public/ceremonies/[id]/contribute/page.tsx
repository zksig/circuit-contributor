"use client";

import CircuitTable from "@/components/CircuitTable";
import { getFetcher } from "@/services/fetcher";
import {
  CpuChipIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";
import { Contributor } from "@prisma/client";
import { usePrivy } from "@privy-io/react-auth";
import { MD5 } from "crypto-js";
import moment from "moment";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { zKey } from "snarkjs";
import useSWR from "swr";

const ContributorTimeline = ({
  contributors,
  onSelectContributor,
}: {
  contributors: Contributor[];
  onSelectContributor: (contributor: Contributor) => void;
}) => (
  <div className="mt-6 flow-root w-full">
    <ul role="list" className="-mb-8">
      {contributors.map((contributor, i) => (
        <li
          key={contributor.id}
          onClick={() => onSelectContributor(contributor)}
        >
          <div className="relative pb-8">
            {i !== contributors.length - 1 ? (
              <span
                className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                aria-hidden="true"
              />
            ) : null}
            <div className="relative flex space-x-3 items-center">
              <div>
                <img
                  src={`https://www.gravatar.com/avatar/${MD5(
                    contributor.email
                  )}?d=robohash`}
                  className="h-8 w-8 rounded-full bg-gray-50"
                  aria-hidden="true"
                />
              </div>
              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                <div>
                  <p className="text-sm text-gray-500">
                    Contribution by {contributor.name}
                  </p>
                </div>
                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                  <time dateTime={contributor.createdAt.toString()}>
                    {moment(contributor.createdAt).format("MMM DD")}
                  </time>
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default function Contribute() {
  const { id } = useParams();
  const { data: ceremony } = useSWR(`/api/v1/ceremonies/${id}`, getFetcher);
  const { data: contributions } = useSWR(
    `/api/v1/ceremonies/${id}/contributions`,
    getFetcher
  );
  const { data: circuits } = useSWR(
    `/api/v1/ceremonies/${id}/circuits`,
    getFetcher
  );
  const { data: contributors, mutate } = useSWR(
    `/api/v1/ceremonies/${id}/contributors`,
    getFetcher
  );
  const { user, getAccessToken } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState<Contributor>();

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

      const contributorRes = await fetch(
        `/api/v1/ceremonies/${id}/contributors`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
          },
          body: JSON.stringify({
            name,
          }),
        }
      );
      setSelectedContributor(await contributorRes.json());
      await mutate();
    } finally {
      setIsLoading(false);
    }
  }, [circuits, user, getAccessToken, id]);

  if (!circuits || !ceremony || !contributions || !contributors) return null;

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

      <div className="border-b border-gray-200 pb-5 mt-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Contributions
        </h3>
      </div>
      <div className="flex gap-1 grid-cols-2 mt-4">
        <pre className="w-full">
          {contributions
            .filter(
              (contribution) =>
                contribution.email ===
                (selectedContributor?.email ?? contributions[0]?.email)
            )
            .map((contribution) =>
              formatHash(
                Buffer.from(contribution.hash, "hex"),
                contribution.circuit.name
              )
            )
            .join("\n\n")}
        </pre>
        <ContributorTimeline
          contributors={contributors}
          onSelectContributor={setSelectedContributor}
        />
      </div>
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
