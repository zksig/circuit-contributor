"use client";

import CreateCeremony from "@/components/CreateCeremony";
import { getFetcher } from "@/services/fetcher";
import moment from "moment";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

export default function Home() {
  const [openAddCeremony, setOpenAddCeremony] = useState(false);
  const { data: ceremonies } = useSWR("/api/v1/ceremonies", getFetcher);

  if (!ceremonies) return null;

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Trusted Ceremonies
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all the groth16 phase2 trusted ceremonies in your
              account.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              className="block rounded-md bg-emerald-400 px-3 py-2 text-center text-sm font-semibold text-gray-100 shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              onClick={() => setOpenAddCeremony(true)}
            >
              Add Ceremony
            </button>
          </div>
        </div>
        <div className="mt-4 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-800 sm:pl-6 lg:pl-8"
                    >
                      Label
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-800"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-800"
                    >
                      Total Circuits
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-800"
                    >
                      Contributors
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-800"
                    >
                      Created At
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8"
                    >
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {ceremonies.map((ceremony) => (
                    <tr key={ceremony.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-800 sm:pl-6 lg:pl-8">
                        {ceremony.label}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {ceremony.status}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {ceremony._count.circuits}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {ceremony._count.contributors}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {moment(ceremony.createdAt).format("MMMM DD, YYYY")}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                        <Link
                          href={`/admin/ceremonies/${ceremony.id}`}
                          className="rounded bg-gray-800 p-2 text-gray-100 hover:text-gray-800"
                        >
                          View
                          <span className="sr-only">, {ceremony.label}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <CreateCeremony
        open={openAddCeremony}
        onClose={() => setOpenAddCeremony(false)}
      />
    </>
  );
}
