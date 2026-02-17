import PageMeta from "../components/common/PageMeta";

export default function Performance() {
  return (
    <>
      <PageMeta
        title="Performance | SmartProperty Backoffice"
        description="Track key performance indicators for your portfolio."
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Performance
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              KPIs and analytics for your properties.
            </p>
          </div>
        </div>
        {/* TODO: hook up real performance dashboards here */}
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          Performance analytics coming soon.
        </div>
      </div>
    </>
  );
}

