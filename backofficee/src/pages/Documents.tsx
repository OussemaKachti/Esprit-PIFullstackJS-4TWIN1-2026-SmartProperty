import PageMeta from "../components/common/PageMeta";

export default function Documents() {
  return (
    <>
      <PageMeta
        title="Documents | SmartProperty Backoffice"
        description="Store and manage your property-related documents."
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Documents
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Centralized space for all contracts, reports, and legal files.
            </p>
          </div>
        </div>
        {/* TODO: hook up real document management UI here */}
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          Document management coming soon.
        </div>
      </div>
    </>
  );
}

