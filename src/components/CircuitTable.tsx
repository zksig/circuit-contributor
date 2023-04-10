import CreateCircuit from "./CreateCircuit";
import { getFetcher } from "@/services/fetcher";
import { useState } from "react";
import useSWR from "swr";

export default function CircuitTable({
  ceremonyId,
  readOnly = false,
}: {
  ceremonyId: string;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { data: circuits } = useSWR(
    `/api/v1/ceremonies/${ceremonyId}/circuits`,
    getFetcher
  );

  if (!circuits) return;

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        {!readOnly ? (
          <div className="sm:flex justify-end">
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <button
                type="button"
                className="block rounded-md bg-gray-800 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
                onClick={() => setOpen(true)}
              >
                Add Circuit
              </button>
            </div>{" "}
          </div>
        ) : null}
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Max Constraints
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {circuits.map((circuit) => (
                    <tr key={circuit.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                        {circuit.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {circuit.status}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {circuit.maxConstraints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <CreateCircuit
        ceremonyId={ceremonyId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
