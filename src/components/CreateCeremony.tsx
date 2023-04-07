import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ErrorMessage, Formik } from "formik";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function CreateCeremony({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { getAccessToken } = usePrivy();

  const handleSubmit = async ({
    label,
    startDate,
  }: {
    label: string;
    startDate: string;
  }) => {
    const res = await fetch("/api/v1/ceremonies", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify({ label, startDate }),
    });
    const { id } = await res.json();
    router.push(`/ceremonies/${id}`);
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
                    initialValues={{ label: "", startDate: "" }}
                    validate={(values) => {
                      const errors: Record<string, string> = {};
                      if (!values.startDate) errors.startDate = "Required";
                      if (!values.label) errors.label = "Required";
                      return errors;
                    }}
                    onSubmit={async (values) => {
                      await handleSubmit(values);
                    }}
                  >
                    {({ values, handleChange, handleSubmit, isSubmitting }) => (
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
                                  New Ceremony
                                </Dialog.Title>
                                <p className="text-sm text-gray-500">
                                  Get started by filling in the information
                                  below to create a new ceremony.
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
                                  htmlFor="label"
                                  className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
                                >
                                  Ceremony Label
                                </label>
                              </div>
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  name="label"
                                  id="label"
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  value={values.label}
                                  onChange={handleChange}
                                />
                                <ErrorMessage
                                  name="label"
                                  component="div"
                                  className="mt-1 text-sm text-red-500"
                                />
                              </div>
                            </div>

                            <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                              <div>
                                <label
                                  htmlFor="startDate"
                                  className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
                                >
                                  Start Date
                                </label>
                              </div>
                              <div className="sm:col-span-2">
                                <input
                                  type="date"
                                  name="startDate"
                                  id="startDate"
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  value={values.startDate}
                                  onChange={handleChange}
                                />
                                <ErrorMessage
                                  name="startDate"
                                  component="div"
                                  className="mt-1 text-sm text-red-500"
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
                              className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-25"
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
