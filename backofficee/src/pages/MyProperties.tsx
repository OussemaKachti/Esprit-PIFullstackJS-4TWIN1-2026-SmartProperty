import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PageMeta from "../components/common/PageMeta";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component to animate map view when position changes
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  const mapRef = useRef(map);

  useEffect(() => {
    mapRef.current.flyTo(center, 15, { duration: 1.5 });
  }, [center]);

  return null;
}

type StaticProperty = {
  id: number;
  title: string;
  city: string;
  country: string;
  price: string;
  priceLabel: string;
  status?: "New" | "Featured" | "Popular" | "Booked";
  bookingLabel?: string;
  type: string;
  beds: number;
  baths: number;
  area: string;
  imageUrl: string;
};

const staticProperties: StaticProperty[] = [
  {
    id: 1,
    title: "Serenity Condo Suite",
    city: "London",
    country: "United Kingdom",
    price: "$2,100",
    priceLabel: "/ month",
    status: "New",
    bookingLabel: "For Rent",
    type: "Loft",
    beds: 3,
    baths: 2,
    area: "1,250 Sq Ft",
    imageUrl:
      "https://images.pexels.com/photos/7606060/pexels-photo-7606060.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 2,
    title: "Getaway Apartment",
    city: "Paris",
    country: "France",
    price: "$1,130",
    priceLabel: "/ night",
    status: "Featured",
    bookingLabel: "For Rent",
    type: "Apartment",
    beds: 2,
    baths: 1,
    area: "850 Sq Ft",
    imageUrl:
      "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 3,
    title: "Cozy Urban Condo",
    city: "New York",
    country: "USA",
    price: "$2,480",
    priceLabel: "/ month",
    status: "Popular",
    bookingLabel: "For Rent",
    type: "Condo",
    beds: 2,
    baths: 2,
    area: "1,050 Sq Ft",
    imageUrl:
      "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 4,
    title: "Coral Bay Cabins",
    city: "Brighton",
    country: "UK",
    price: "$950",
    priceLabel: "/ night",
    status: "New",
    bookingLabel: "Booked",
    type: "Cabin",
    beds: 4,
    baths: 3,
    area: "1,600 Sq Ft",
    imageUrl:
      "https://images.pexels.com/photos/259580/pexels-photo-259580.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 5,
    title: "Majestic Stay",
    city: "Rome",
    country: "Italy",
    price: "$4,500",
    priceLabel: "/ month",
    status: "Featured",
    bookingLabel: "For Rent",
    type: "Villa",
    beds: 5,
    baths: 4,
    area: "2,450 Sq Ft",
    imageUrl:
      "https://images.pexels.com/photos/261187/pexels-photo-261187.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 6,
    title: "Noble Nest",
    city: "Berlin",
    country: "Germany",
    price: "$1,380",
    priceLabel: "/ month",
    bookingLabel: "For Rent",
    type: "Apartment",
    beds: 2,
    baths: 1,
    area: "900 Sq Ft",
    imageUrl:
      "https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

// Simple, clean icons for list / grid view (no material-icons text)
const ListViewIcon = () => (
  <svg
    viewBox="0 0 20 20"
    className="w-4 h-4"
    aria-hidden="true"
  >
    <rect x="2" y="3" width="16" height="3" rx="1.5" />
    <rect x="2" y="8.5" width="16" height="3" rx="1.5" />
    <rect x="2" y="14" width="16" height="3" rx="1.5" />
  </svg>
);

const GridViewIcon = () => (
  <svg
    viewBox="0 0 20 20"
    className="w-4 h-4"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="6" height="6" rx="1.5" />
    <rect x="12" y="2" width="6" height="6" rx="1.5" />
    <rect x="2" y="12" width="6" height="6" rx="1.5" />
    <rect x="12" y="12" width="6" height="6" rx="1.5" />
  </svg>
);

type NewPropertyForm = {
  type: string;
  address: string;
  city: string;
  country: string;
  surface: string;
  rooms: string;
  description: string;
};

export default function MyProperties() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [tone, setTone] = useState<"modern" | "luxury" | "professional">(
    "professional"
  );
  const [form, setForm] = useState<NewPropertyForm>({
    type: "",
    address: "",
    city: "",
    country: "",
    surface: "",
    rooms: "",
    description: "",
  });
  const [imagesCount, setImagesCount] = useState(0);
  const [mapPosition, setMapPosition] = useState<[number, number]>([36.8065, 10.1815]); // Default: Tunis
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Geocode address when address field changes (debounced)
  useEffect(() => {
    const fullAddress = `${form.address}, ${form.city}, ${form.country}`.trim();
    if (!fullAddress || fullAddress === ",") return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setMapPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    }, 700);
  }, [form.address, form.city, form.country]);

  const handleFieldChange = (
    field: keyof NewPropertyForm,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagesChange = (files: FileList | null) => {
    if (!files) return;
    setImagesCount((prev) =>
      Math.min(20, prev + files.length)
    );
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setActiveStep(1);
  };

  const handleSubmit = () => {
    // For now we just close the form; hook into API later
    console.log("Submitting new property:", {
      ...form,
      tone,
      imagesCount,
    });
    closeForm();
  };

  return (
    <>
      <PageMeta
        title="My Properties | SmartProperty Backoffice"
        description="Manage and monitor your property portfolio."
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              My Properties
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Showing {staticProperties.length} selected properties from your
              portfolio.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 sm:inline-flex">
              Filters
            </button>
            <button
              className="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm bg-brand-500 hover:bg-brand-600"
              type="button"
              onClick={() => setIsFormOpen(true)}
            >
              + Add Property
            </button>
            {/* View toggle: list / grid (like frontend) */}
            <div className="inline-flex items-center gap-1 px-1 py-1 bg-white border border-gray-200 rounded-2xl shadow-sm dark:bg-gray-900 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-medium ${
                  viewMode === "list"
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-emerald-500 dark:bg-gray-900 dark:text-emerald-400"
                }`}
                aria-label="List view"
              >
                <ListViewIcon />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-medium ${
                  viewMode === "grid"
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-emerald-500 dark:bg-gray-900 dark:text-emerald-400"
                }`}
                aria-label="Grid view"
              >
                <GridViewIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar / summary */}
        <div className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm dark:bg-gray-900 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing <span className="font-semibold">1 – {staticProperties.length}</span>{" "}
            of <span className="font-semibold">25</span> results
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Sort by:</span>
              <select className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-gray-700 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200">
                <option>Default</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Price range:</span>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 dark:bg-white/5 dark:text-gray-200">
                $500 – $5,000
              </button>
            </div>
          </div>
        </div>

        {/* Properties grid or list */}
        {viewMode === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {staticProperties.map((property) => (
              <article
                key={property.id}
                className="flex flex-col overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900 dark:border-gray-800"
              >
                {/* Image block */}
                <div className="relative overflow-hidden">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="object-cover w-full h-52"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                    <div className="flex flex-wrap gap-2">
                      {property.status && (
                        <span className="px-2.5 py-1 text-xs font-semibold text-white rounded-full bg-emerald-500">
                          {property.status}
                        </span>
                      )}
                      {property.bookingLabel && (
                        <span className="px-2.5 py-1 text-xs font-semibold text-white rounded-full bg-brand-500">
                          {property.bookingLabel}
                        </span>
                      )}
                    </div>
                    <button className="flex items-center justify-center w-8 h-8 text-xs font-semibold text-white rounded-full bg-black/60 backdrop-blur">
                      ♥
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {property.price}
                        <span className="ml-1 text-xs font-normal text-gray-200">
                          {property.priceLabel}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold text-white rounded-full bg-indigo-500/90">
                      {property.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 dark:text-white">
                    {property.title}
                  </h3>
                  <p className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-block w-1.5 h-1.5 mr-2 bg-emerald-500 rounded-full" />
                    {property.city}, {property.country}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-50 dark:bg-white/5">
                        {property.beds} Bed
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-50 dark:bg-white/5">
                        {property.baths} Bath
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-50 dark:bg-white/5">
                        {property.area}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      ★★★★★
                      <span className="ml-1 text-[11px] text-gray-500 dark:text-gray-400">
                        4.9
                      </span>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-semibold text-white rounded-full bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900">
                      View details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {staticProperties.map((property) => (
              <article
                key={property.id}
                className="flex flex-col overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-gray-900 dark:border-gray-800 md:flex-row"
              >
                {/* Image */}
                <div className="relative w-full overflow-hidden md:w-64 lg:w-72">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="object-cover w-full h-52 md:h-full"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                    <div className="flex flex-wrap gap-2">
                      {property.status && (
                        <span className="px-2.5 py-1 text-xs font-semibold text-white rounded-full bg-emerald-500">
                          {property.status}
                        </span>
                      )}
                      {property.bookingLabel && (
                        <span className="px-2.5 py-1 text-xs font-semibold text-white rounded-full bg-brand-500">
                          {property.bookingLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="text-sm font-semibold text-white">
                      {property.price}
                      <span className="ml-1 text-xs font-normal text-gray-200">
                        {property.priceLabel}
                      </span>
                    </div>
                    <button className="flex items-center justify-center w-8 h-8 text-xs font-semibold text-white rounded-full bg-black/60 backdrop-blur">
                      ♥
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 space-y-3 md:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 md:text-base dark:text-white">
                        {property.title}
                      </h3>
                      <p className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="inline-block w-1.5 h-1.5 mr-2 bg-emerald-500 rounded-full" />
                        {property.city}, {property.country}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full dark:bg-indigo-500/10 dark:text-indigo-300">
                      {property.type}
                    </span>
                  </div>

                  <ul className="flex flex-wrap gap-3 px-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-2xl dark:bg-white/5 dark:border-gray-800">
                    <li className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                      <span className="inline-flex items-center justify-center w-6 h-6 mr-1 text-xs text-emerald-500 bg-white rounded-full dark:bg-gray-900">
                        🛏
                      </span>
                      {property.beds} Bedroom
                    </li>
                    <li className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                      <span className="inline-flex items-center justify-center w-6 h-6 mr-1 text-xs text-emerald-500 bg-white rounded-full dark:bg-gray-900">
                        🛁
                      </span>
                      {property.baths} Bath
                    </li>
                    <li className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                      <span className="inline-flex items-center justify-center w-6 h-6 mr-1 text-xs text-emerald-500 bg-white rounded-full dark:bg-gray-900">
                        ▢
                      </span>
                      {property.area}
                    </li>
                  </ul>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      ★★★★★
                      <span className="ml-1 text-[11px] text-gray-500 dark:text-gray-400">
                        4.9 Excellent
                      </span>
                    </div>
                    <button className="px-4 py-1.5 text-xs font-semibold text-white rounded-full bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900">
                      Book now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Load more */}
        <div className="flex justify-center pt-2">
          <button className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700">
            Load more
          </button>
        </div>
      </div>

      {/* Add Property – multi-step form overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 px-2 py-4 sm:px-4 sm:py-6 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh] mt-12 sm:mt-16">
            {/* Header with steps */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add New Property
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Step {activeStep} of 3
                </p>
              </div>
              <div className="flex items-center gap-3">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`flex items-center gap-2 text-xs font-medium ${
                      activeStep === step
                        ? "text-brand-500"
                        : "text-gray-400"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${
                        activeStep === step
                          ? "bg-brand-500 text-white border-brand-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {step}
                    </span>
                    <span className="hidden sm:inline">
                      {step === 1
                        ? "Basic Info"
                        : step === 2
                        ? "Description"
                        : "Review"}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Basic Information
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Start by entering the key details of your property.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Property Type
                      </label>
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        value={form.type}
                        onChange={(e) =>
                          handleFieldChange("type", e.target.value)
                        }
                      >
                        <option value="">Select type</option>
                        <option value="APARTMENT">Apartment</option>
                        <option value="HOUSE">House</option>
                        <option value="VILLA">Villa</option>
                        <option value="STUDIO">Studio</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Total Area (m²)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        placeholder="e.g. 250"
                        value={form.surface}
                        onChange={(e) =>
                          handleFieldChange("surface", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Property Address
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        placeholder="Street and number"
                        value={form.address}
                        onChange={(e) =>
                          handleFieldChange("address", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        City
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        placeholder="e.g. Nice"
                        value={form.city}
                        onChange={(e) =>
                          handleFieldChange("city", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Country
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        placeholder="e.g. France"
                        value={form.country}
                        onChange={(e) =>
                          handleFieldChange("country", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Rooms
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        placeholder="e.g. 4"
                        value={form.rooms}
                        onChange={(e) =>
                          handleFieldChange("rooms", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Map preview
                    </label>
                    <div className="w-full h-64 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <MapContainer
                        center={mapPosition}
                        zoom={15}
                        scrollWheelZoom={true}
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                      >
                        <ChangeMapView center={mapPosition} />
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={mapPosition}>
                          <Popup>
                            {form.address
                              ? `${form.address}, ${form.city || ""}, ${form.country || ""}`.trim()
                              : "Property Location"}
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Map updates automatically when you enter an address
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Description & Media
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Describe your property and upload photos.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wide dark:text-gray-300">
                      Tone
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["modern", "luxury", "professional"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() =>
                            setTone(t as typeof tone)
                          }
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${
                            tone === t
                              ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                              : "bg-white text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      AI Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-2xl resize-none h-28 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                      placeholder="Your AI-generated description will appear here..."
                      value={form.description}
                      onChange={(e) =>
                        handleFieldChange("description", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 mt-1 text-xs font-semibold text-white rounded-full shadow-sm bg-brand-500 hover:bg-brand-600"
                    >
                      ✨ Generate AI Description
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide dark:text-gray-300">
                        Property Media
                      </p>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {imagesCount}/20 photos
                      </span>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full px-6 py-8 text-center border-2 border-dashed rounded-2xl cursor-pointer border-gray-300 bg-gray-50 hover:border-brand-500 hover:bg-brand-50/40 dark:bg-gray-900 dark:border-gray-700">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImagesChange(e.target.files)
                        }
                      />
                      <div className="flex items-center justify-center w-10 h-10 mb-3 text-brand-500 bg-white rounded-full shadow-sm">
                        ⬆
                      </div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        Drag & drop images, or click to browse
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        JPG, PNG up to 10MB each
                      </p>
                    </label>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Review & Submit
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Please confirm all details before submitting your property.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="p-3 text-xs border border-gray-200 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                      <p className="mb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        Location
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {form.city || "—"},{" "}
                        {form.country || ""}
                      </p>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">
                        {form.address || "No address provided"}
                      </p>
                    </div>
                    <div className="p-3 text-xs border border-gray-200 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                      <p className="mb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        Property details
                      </p>
                      <p className="text-gray-700 dark:text-gray-200">
                        Type:{" "}
                        <span className="font-semibold">
                          {form.type || "—"}
                        </span>
                      </p>
                      <p className="text-gray-700 dark:text-gray-200">
                        Area:{" "}
                        <span className="font-semibold">
                          {form.surface || "—"} m²
                        </span>
                      </p>
                      <p className="text-gray-700 dark:text-gray-200">
                        Rooms:{" "}
                        <span className="font-semibold">
                          {form.rooms || "—"}
                        </span>
                      </p>
                    </div>
                    <div className="p-3 text-xs border border-gray-200 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:border-gray-800 md:col-span-2">
                      <p className="mb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        Description
                      </p>
                      <p className="text-gray-700 whitespace-pre-wrap dark:text-gray-200">
                        {form.description || "No description provided yet."}
                      </p>
                    </div>
                    <div className="p-3 text-xs border border-gray-200 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                      <p className="mb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        AI Tone
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {tone.toUpperCase()}
                      </p>
                    </div>
                    <div className="p-3 text-xs border border-gray-200 rounded-2xl bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                      <p className="mb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        Media
                      </p>
                      <p className="text-gray-700 dark:text-gray-200">
                        {imagesCount} photo(s) selected
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 rounded-b-3xl">
              <button
                type="button"
                onClick={activeStep === 1 ? closeForm : () => setActiveStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2 | 3)))}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
              >
                {activeStep === 1 ? "Cancel" : "Back"}
              </button>
              <div className="flex items-center gap-2">
                {activeStep < 3 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep((s) => (s === 3 ? s : ((s + 1) as 1 | 2 | 3)))}
                    className="px-5 py-2 text-xs font-semibold text-white rounded-full shadow-sm bg-brand-500 hover:bg-brand-600"
                  >
                    Continue
                  </button>
                )}
                {activeStep === 3 && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-5 py-2 text-xs font-semibold text-white rounded-full shadow-sm bg-emerald-600 hover:bg-emerald-700"
                  >
                    Submit Property
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

