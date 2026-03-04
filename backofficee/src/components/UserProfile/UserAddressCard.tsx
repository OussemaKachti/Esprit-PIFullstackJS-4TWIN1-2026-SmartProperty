export default function UserAddressCard() {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Address
          </h4>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Address information is not stored in your account. This section can be extended later if your account supports it.
          </p>
        </div>
      </div>
    </div>
  );
}
