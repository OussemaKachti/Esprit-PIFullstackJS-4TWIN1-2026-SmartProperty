import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import CountryMap from "./CountryMap";

export type CitySlice = {
  city: string;
  count: number;
  percent: number;
};

type Props = {
  loading?: boolean;
  topCities?: CitySlice[];
};

export default function DemographicCard({ loading, topCities = [] }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Property locations
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Where your listings are concentrated (by city)
          </p>
        </div>
        <div className="relative inline-block">
          <button type="button" className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      <div className="px-4 py-6 my-6 overflow-hidden border border-gary-200 rounded-2xl dark:border-gray-800 sm:px-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          <CountryMap />
        </div>
      </div>

      <div className="space-y-5">
        {loading &&
          [1, 2, 3].map((k) => (
            <div
              key={k}
              className="flex items-center justify-between animate-pulse"
            >
              <div className="h-10 w-40 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-2 w-24 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          ))}
        {!loading &&
          topCities.slice(0, 5).map((c) => (
            <div key={c.city} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  {c.city.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {c.city}
                  </p>
                  <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                    {c.count} propert{c.count === 1 ? "y" : "ies"}
                  </span>
                </div>
              </div>

              <div className="flex w-full max-w-[140px] items-center gap-3">
                <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                  <div
                    className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                    style={{ width: `${Math.min(100, c.percent)}%` }}
                  />
                </div>
                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  {c.percent}%
                </p>
              </div>
            </div>
          ))}
        {!loading && topCities.length === 0 && (
          <p className="text-center text-theme-sm text-gray-500 dark:text-gray-400 py-4">
            No location data yet.
          </p>
        )}
      </div>
    </div>
  );
}
