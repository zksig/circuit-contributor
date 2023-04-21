import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { usePrivy } from "@privy-io/react-auth";
import { Formik } from "formik";
import { Fragment } from "react";
import { toast } from "react-toastify";
import { zKey } from "snarkjs";

type FormValues = {
  name: string;
  maxConstraints: string;
  r1cs: File;
  wasm: File;
};

const maxConstraintMap = {
  "1M": 1000000,
};

export default function CreateCircuit({
  ceremonyId,
  open,
  onClose,
}: {
  ceremonyId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { getAccessToken } = usePrivy();

  const handleSubmit = async (
    { name, maxConstraints, r1cs, wasm }: FormValues,
    { setSubmitting }
  ) => {
    try {
      const res = await fetch(`/api/v1/ceremonies/${ceremonyId}/circuits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({
          name,
          maxConstraints: maxConstraintMap[maxConstraints],
        }),
      });

      const ptauRes = await fetch(
        "https://link.storjshare.io/s/juxgo6upkdurxue42li5qsezmpha/circuit-contributor/powersOfTau28_hez_final_20.ptau?download=1"
      );

      const ptauBuf = await toast.promise(ptauRes.arrayBuffer(), {
        pending: "Fetching ptau...",
        success: "Successfully fetched ptau",
        error: "Unable to fetch ptau",
      });

      const zkey: Record<string, any> = { type: "mem" };
      await toast.promise(
        zKey.newZKey(
          { type: "mem", data: Buffer.from(await r1cs.arrayBuffer()) },
          { type: "mem", data: Buffer.from(ptauBuf) },
          zkey
        ),
        {
          pending: "Creating ZKey...",
          success: "Successfully created ZKey",
          error: "Unable to create ZKey",
        }
      );

      const { circuit, r1csUploadLink, wasmUploadLink, zkeyUploadLink } =
        await res.json();
      await toast.promise(
        Promise.all([
          fetch(r1csUploadLink, {
            method: "PUT",
            body: r1cs,
          }),
          fetch(wasmUploadLink, {
            method: "PUT",
            body: wasm,
          }),
          fetch(zkeyUploadLink, {
            method: "PUT",
            body: new Blob([zkey.data]),
          }),
        ]),
        {
          pending: "Uploading ZKey",
          success: "Successfully uploaded ZKey",
          error: "Unable to upload ZKey",
        }
      );

      await fetch(`/api/v1/ceremonies/${ceremonyId}/circuits`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({
          id: circuit.id,
          status: "COMPLETE",
        }),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 top-16 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <Formik
                    initialValues={{
                      name: "",
                      maxConstraints: "1M",
                      r1cs: null,
                      wasm: null,
                    }}
                    onSubmit={handleSubmit}
                  >
                    {({
                      values,
                      handleChange,
                      handleSubmit,
                      setFieldValue,
                      isSubmitting,
                    }) => (
                      <form
                        className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl"
                        onSubmit={handleSubmit}
                      >
                        <div className="flex-1">
                          {/* Header */}
                          <div className="bg-gray-50 px-4 py-6 sm:px-6">
                            <div className="flex items-start justify-between space-x-3">
                              <div className="space-y-1">
                                <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                                  Add Circuit
                                </Dialog.Title>
                                <p className="text-sm text-gray-500">
                                  Get started by filling in the information
                                  below to add your circuit.
                                </p>
                              </div>
                              <div className="flex h-7 items-center">
                                <button
                                  type="button"
                                  className="text-gray-400 hover:text-gray-500"
                                  onClick={onClose}
                                >
                                  <span className="sr-only">Close panel</span>
                                  <XMarkIcon
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Divider container */}
                          <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
                            <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                              <div>
                                <label
                                  htmlFor="name"
                                  className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
                                >
                                  Circuit name
                                </label>
                              </div>
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  name="name"
                                  id="name"
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-400 sm:text-sm sm:leading-6"
                                  value={values.name}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>

                            <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                              <div>
                                <label
                                  htmlFor="maxConstraints"
                                  className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
                                >
                                  Max Constraints
                                </label>
                              </div>
                              <div className="sm:col-span-2">
                                <select
                                  disabled
                                  id="maxConstraints"
                                  name="maxConstraints"
                                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-400 sm:py-1.5 sm:text-sm sm:leading-6"
                                  value={values.maxConstraints}
                                  onChange={handleChange}
                                >
                                  <option value="1M">1M</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                              <div>
                                <label
                                  htmlFor="r1cs"
                                  className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
                                >
                                  R1CS
                                </label>
                              </div>
                              <div className="sm:col-span-2">
                                <input
                                  type="file"
                                  id="r1cs"
                                  name="r1cs"
                                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-400 sm:py-1.5 sm:text-sm sm:leading-6"
                                  // @ts-ignore
                                  onChange={({ target }) => {
                                    setFieldValue("r1cs", target.files[0]);
                                  }}
                                />
                              </div>
                            </div>

                            <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                              <div>
                                <label
                                  htmlFor="wasm"
                                  className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
                                >
                                  WASM
                                </label>
                              </div>
                              <div className="sm:col-span-2">
                                <input
                                  type="file"
                                  id="wasm"
                                  name="wasm"
                                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-400 sm:py-1.5 sm:text-sm sm:leading-6"
                                  // @ts-ignore
                                  onChange={({ target }) => {
                                    setFieldValue("wasm", target.files[0]);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
                          <div className="flex justify-end space-x-3">
                            <button
                              type="button"
                              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                              onClick={onClose}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="inline-flex justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 disabled:opacity-25"
                              disabled={isSubmitting}
                            >
                              Create
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </Formik>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
