import CreateCircuit from "./CreateCircuit";
import { getFetcher } from "@/services/fetcher";
import { TrashIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import { useState } from "react";
import useSWR from "swr";

export default function ContributorsTable({
  ceremonyId,
}: {
  ceremonyId: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: contributors } = useSWR(
    `/api/v1/ceremonies/${ceremonyId}/contributors`,
    getFetcher
  );

  if (!contributors) return;

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
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
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Contributed At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {contributors.map((contributor) => (
                    <tr key={contributor.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                        {contributor.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {contributor.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {moment(contributor.createdAt).format("MMMM DD, YYYY")}
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
