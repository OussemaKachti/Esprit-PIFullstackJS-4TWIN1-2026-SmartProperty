import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PageMeta from "../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

type BackendProperty = {
  _id: string;
  title: string;
  city: string;
  country?: string;
  price: number;
  surface?: number;
  rooms?: number;
  bathrooms?: number;
  type: string;
  status?: string;
  listingType?: string;
  description?: string;
};

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
  title: string;
  type: string;
  address: string;
  city: string;
  country: string;
  surface: string;
  rooms: string;
  price: string;
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
    title: "",
    type: "",
    address: "",
    city: "",
    country: "",
    surface: "",
    rooms: "",
    price: "",
    description: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagesCount, setImagesCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number]>([36.8065, 10.1815]); // Default: Tunis
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [myProperties, setMyProperties] = useState<BackendProperty[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState<boolean>(true);

  const formattedPrice = (price: number | undefined | null) => {
    if (price == null) return "—";
    try {
      return `${new Intl.NumberFormat("fr-TN").format(price)} TND`;
    } catch {
      return `${price} TND`;
    }
  };

  // Geocode address when address field changes (debounced)
  useEffect(() => {
    const rawAddress = `${form.address}, ${form.city}, ${form.country}`;
    const cleaned = rawAddress.replace(/,/g, " ").trim();

    // Si l'utilisateur n'a encore rien saisi, ne pas appeler l'API (évite q=", ,")
    if (!cleaned) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleaned)}`
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

  // Load properties of the connected user
  useEffect(() => {
    const loadMyProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoadingProperties(false);
          return;
        }

        const res = await fetch(`${API_URL}/properties/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load my properties:", text);
          setIsLoadingProperties(false);
          return;
        }

        const data = await res.json();
        const payload = data.data || data;
        setMyProperties(payload.properties || []);
      } catch (err) {
        console.error("Error while loading my properties:", err);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    loadMyProperties();
  }, []);

  const handleFieldChange = (
    field: keyof NewPropertyForm,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagesChange = (files: FileList | null) => {
    if (!files) return;

    const allFiles = Array.from(files);
    const imageFilesOnly = allFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    // Si certains fichiers ne sont pas des images, on les ignore et on informe l'utilisateur
    if (imageFilesOnly.length !== allFiles.length) {
      alert("Only image files are allowed (jpeg, jpg, png, webp, heic).");
    }

    if (imageFilesOnly.length === 0) return;

    const incoming = imageFilesOnly;
    setImageFiles((prev) => {
      const remainingSlots = Math.max(0, 20 - prev.length);
      const toAdd = incoming.slice(0, remainingSlots);
      return [...prev, ...toAdd];
    });

    setImagesCount((prev) => {
      const remainingSlots = Math.max(0, 20 - prev);
      const toAddCount = Math.min(remainingSlots, files.length);
      return prev + toAddCount;
    });
  };

  const handleDropFiles = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleImagesChange(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setActiveStep(1);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!form.title || !form.type || !form.city || !form.price) {
        alert("Please fill Title, Type, City and Price before submitting.");
        return;
      }

      const formData = new FormData();
      // Required / core fields
      formData.append("title", form.title);
      formData.append("type", form.type);
      formData.append("city", form.city);
      formData.append("price", form.price);

      // Optional / additional fields
      if (form.address) formData.append("address", form.address);
      if (form.country) formData.append("country", form.country);
      if (form.surface) formData.append("surface", form.surface);
      if (form.rooms) formData.append("rooms", form.rooms);
      if (form.description) formData.append("description", form.description);

      // Tone & AI flag (optional, backend accepte les champs inconnus)
      formData.append("tone", tone);
      formData.append("aiGeneratedDescription", "false");

      // Multiple images
      imageFiles.forEach((file, index) => {
        formData.append(`image${index + 1}`, file);
      });

      const response = await fetch(`${API_URL}/properties`, {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create property:", errorText);
        alert("Failed to create property. Please check your inputs.");
        return;
      }

      // Optionnel: const data = await response.json();
      // console.log("Property created:", data);

      closeForm();
    } catch (err) {
      console.error("Error while creating property:", err);
      alert("An unexpected error occurred while creating the property.");
    }
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
              Showing{" "}
              <span className="font-semibold">
                {myProperties.length}
              </span>{" "}
              properties from your portfolio.
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
            {isLoadingProperties
              ? "Loading your properties..."
              : myProperties.length > 0
              ? `Showing ${myProperties.length} property(ies)`
              : "No properties created yet."}
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
            {myProperties.map((property) => (
              <article
                key={property._id}
                className="flex flex-col overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900 dark:border-gray-800"
              >
                {/* Image block */}
                <div className="relative overflow-hidden">
                  {/* TODO: replace placeholder with real image URL when wired */}
                  <img
                    src="https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1200"
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
                      {property.listingType && (
                        <span className="px-2.5 py-1 text-xs font-semibold text-white rounded-full bg-brand-500">
                          {property.listingType === "FOR_RENT" ? "For Rent" : "For Sale"}
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
                        {formattedPrice(property.price)}
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
                    {property.city}, {property.country || "Tunisia"}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-50 dark:bg-white/5">
                        {property.rooms ?? 0} Rooms
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-50 dark:bg-white/5">
                        {property.bathrooms ?? 0} Bathrooms
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-50 dark:bg-white/5">
                        {property.surface ? `${property.surface} m²` : "Surface N/A"}
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
                    <Link
                      to={`/my-properties/${property._id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-white rounded-full bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {myProperties.map((property) => (
              <article
                key={property._id}
                className="flex flex-col overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-gray-900 dark:border-gray-800 md:flex-row"
              >
                {/* Image */}
                <div className="relative w-full overflow-hidden md:w-64 lg:w-72">
                  {/* TODO: replace placeholder with real image URL when wired */}
                  <img
                    src="https://images.pexels.com/photos/439227/pexels-photo-439227.jpeg?auto=compress&cs=tinysrgb&w=1200"
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
                      {property.listingType && (
                        <span className="px-2.5 py-1 text-xs font-semibold text-white rounded-full bg-brand-500">
                          {property.listingType === "FOR_RENT" ? "For Rent" : "For Sale"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="text-sm font-semibold text-white">
                      {formattedPrice(property.price)}
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
                        {property.city}, {property.country || "Tunisia"}
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
                      {property.rooms ?? 0} Rooms
                    </li>
                    <li className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                      <span className="inline-flex items-center justify-center w-6 h-6 mr-1 text-xs text-emerald-500 bg-white rounded-full dark:bg-gray-900">
                        🛁
                      </span>
                      {property.bathrooms ?? 0} Bathrooms
                    </li>
                    <li className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                      <span className="inline-flex items-center justify-center w-6 h-6 mr-1 text-xs text-emerald-500 bg-white rounded-full dark:bg-gray-900">
                        ▢
                      </span>
                      {property.surface ? `${property.surface} m²` : "Surface N/A"}
                    </li>
                  </ul>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      ★★★★★
                      <span className="ml-1 text-[11px] text-gray-500 dark:text-gray-400">
                        4.9 Excellent
                      </span>
                    </div>
                    <Link
                      to={`/my-properties/${property._id}`}
                      className="px-4 py-1.5 text-xs font-semibold text-white rounded-full bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900"
                    >
                      View details
                    </Link>
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
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        Property Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        placeholder="e.g. Luxury villa with sea view"
                        value={form.title}
                        onChange={(e) =>
                          handleFieldChange("title", e.target.value)
                        }
                      />
                    </div>
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
                        Price
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        placeholder="e.g. 850000"
                        value={form.price}
                        onChange={(e) =>
                          handleFieldChange("price", e.target.value)
                        }
                      />
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
                      onClick={async () => {
                        if (!form.type || !form.city) {
                          alert("Please fill at least Type and City before generating an AI description.");
                          return;
                        }

                        try {
                          setIsGeneratingDescription(true);

                          const token = localStorage.getItem("token");
                          if (!token) {
                            alert("You must be logged in to generate an AI description.");
                            return;
                          }

                          const aiRes = await fetch(
                            `${API_URL.replace(/\/api$/, "")}/api/ai/generate-description-preview`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                tone,
                                length: "medium",
                                property: {
                                  title: form.title,
                                  type: form.type,
                                  surface: form.surface,
                                  rooms: form.rooms,
                                  address: form.address,
                                  city: form.city,
                                  country: form.country,
                                  price: form.price,
                                },
                              }),
                            }
                          );

                          if (!aiRes.ok) {
                            const errText = await aiRes.text();
                            console.error("Failed to generate AI description:", errText);
                            alert("Failed to generate AI description.");
                            return;
                          }

                          const aiData = await aiRes.json();
                          const payload = aiData.data || aiData;

                          // On prend la première variante par défaut
                          const generated =
                            payload.variant1 ||
                            payload.description ||
                            payload.text ||
                            "";

                          if (!generated) {
                            alert("AI did not return a description.");
                            return;
                          }

                          // Mettre la description dans le textarea
                          setForm((prev) => ({
                            ...prev,
                            description: generated,
                          }));
                        } catch (err) {
                          console.error("Error generating AI description:", err);
                          alert("An unexpected error occurred while generating the AI description.");
                        } finally {
                          setIsGeneratingDescription(false);
                        }
                      }}
                      disabled={isGeneratingDescription}
                      className={`inline-flex items-center px-4 py-2 mt-1 text-xs font-semibold rounded-full shadow-sm ${
                        isGeneratingDescription
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-300"
                          : "bg-brand-500 text-white hover:bg-brand-600"
                      }`}
                    >
                      {isGeneratingDescription ? "Generating..." : "✨ Generate AI Description"}
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
                    <label
                      className={`flex flex-col items-center justify-center w-full px-6 py-8 text-center border-2 border-dashed rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-900 ${
                        isDragOver
                          ? "border-brand-500 bg-brand-50/40 dark:border-brand-400"
                          : "border-gray-300 hover:border-brand-500 hover:bg-brand-50/40 dark:border-gray-700"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragOver(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragOver(false);
                      }}
                      onDrop={handleDropFiles}
                    >
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

