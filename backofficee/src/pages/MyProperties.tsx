import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import PageMeta from "../components/common/PageMeta";
import PanoramaManager from "../components/PanoramaManager";

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

// Preview thumbnail for a selected file (creates/revokes object URL properly)
function ImagePreviewThumb({ file, alt }: { file: File; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  if (!url) return <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />;
  return <img src={url} alt={alt} className="w-full h-full object-cover" />;
}

type BackendProperty = {
  _id: string;
  title: string;
  address?: string;
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
  images?: { url: string }[];
  panoramas?: { id: string; name: string; url: string; linkHotspots?: any[] }[];
};

const resolveImageUrl = (relativeUrl?: string) => {
  if (!relativeUrl) {
    return "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1200";
  }

  // Normalize Windows backslashes -> slashes
  const normalized = relativeUrl.replace(/\\/g, "/");

  // Already absolute URL
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  // Point to backend (API_URL is .../api)
  const baseApi = API_URL.replace(/\/api$/, "");
  if (normalized.startsWith("/uploads/")) {
    return `${baseApi}${normalized}`;
  }
  if (normalized.startsWith("uploads/")) {
    return `${baseApi}/${normalized}`;
  }

  return `${baseApi}/${normalized}`;
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
  listingType: "FOR_SALE" | "FOR_RENT" | "";
  address: string;
  city: string;
  country: string;
  surface: string;
  rooms: string;
  bathrooms: string;
  price: string;
  description: string;
};

type FormFieldErrors = Partial<Record<keyof NewPropertyForm, string>>;

type PropertyFeedbackSummary = {
  totalReviews: number;
  averageRating: string;
};

function PropertyRatingSnippet({
  propertyId,
  map,
}: {
  propertyId: string;
  map: Record<string, PropertyFeedbackSummary>;
}) {
  const fb = map[propertyId];
  if (!fb || !fb.totalReviews) {
    return (
      <span className="text-[11px] text-gray-500 dark:text-gray-400">
        No reviews yet
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1 text-xs text-amber-500">
      <span aria-hidden>★</span>
      <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
        {fb.averageRating} · {fb.totalReviews}{" "}
        {fb.totalReviews === 1 ? "review" : "reviews"}
      </span>
    </div>
  );
}

export default function MyProperties() {
  const FASTAPI_URL = (import.meta as any).env?.VITE_FASTAPI_URL || "http://127.0.0.1:8000";
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [tone, setTone] = useState<"modern" | "luxury" | "professional">(
    "professional"
  );
  const [form, setForm] = useState<NewPropertyForm>({
    title: "",
    type: "",
    listingType: "FOR_SALE",
    address: "",
    city: "",
    country: "",
    surface: "",
    rooms: "",
    bathrooms: "",
    price: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<FormFieldErrors>({});
  const [formAlert, setFormAlert] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagesCount, setImagesCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number]>([36.8065, 10.1815]); // Default: Tunis
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [myProperties, setMyProperties] = useState<BackendProperty[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState<boolean>(true);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [isPanoramaEditOpen, setIsPanoramaEditOpen] = useState(false);
  const [panoProperty, setPanoProperty] = useState<BackendProperty | null>(null);
  const [existingPropertyImages, setExistingPropertyImages] = useState<{ url: string; publicId?: string; _id?: string }[]>([]);
  const [removingImageId, setRemovingImageId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; propertyId: string | null; propertyTitle: string }>({
    isOpen: false,
    propertyId: null,
    propertyTitle: "",
  });
  const [feedbackByProperty, setFeedbackByProperty] = useState<
    Record<string, PropertyFeedbackSummary>
  >({});

  // Per-user email notifications toggle (FastAPI)
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emailNotifEnabled, setEmailNotifEnabled] = useState<boolean | null>(null);
  const [emailNotifLoading, setEmailNotifLoading] = useState(false);

  const loadEmailNotifStatus = async () => {
    if (!userEmail) {
      setEmailNotifEnabled(null);
      return;
    }
    try {
      const res = await fetch(`${FASTAPI_URL}/email-notifications?email=${encodeURIComponent(userEmail)}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.detail || json?.message || "Failed to load email status");
      setEmailNotifEnabled(Boolean(json?.enabled));
    } catch (e: unknown) {
      console.error(e);
      setEmailNotifEnabled(null);
    }
  };

  const toggleEmailNotifications = async () => {
    if (emailNotifEnabled === null || !userEmail) return;
    const next = !emailNotifEnabled;
    setEmailNotifLoading(true);
    try {
      const res = await fetch(`${FASTAPI_URL}/email-notifications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, enabled: next }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.detail || json?.message || "Failed to update email status");
      setEmailNotifEnabled(Boolean(json?.enabled));
      toast.success(next ? "Matching emails enabled for your account" : "Matching emails disabled for your account");
    } catch (e: unknown) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to update email status");
    } finally {
      setEmailNotifLoading(false);
    }
  };

  // Advanced search filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    searchText: "",
    type: "",
    status: "",
    listingType: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    minSurface: "",
    maxSurface: "",
    minRooms: "",
    maxRooms: "",
  });

  const formattedPrice = (price: number | undefined | null) => {
    if (price == null) return "—";
    try {
      const formatted = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(price);
      return `${formatted.replace(/,/g, " ")} TND`;
    } catch {
      return `${String(price).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} TND`;
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
      const propsList: BackendProperty[] = payload.properties || [];
      setMyProperties(propsList);

      if (propsList.length > 0) {
        const ids = propsList.map((p) => p._id).filter(Boolean);
        const idParam = ids.join(",");
        try {
          const sr = await fetch(
            `${API_URL}/feedbacks/summary?propertyIds=${encodeURIComponent(idParam)}`
          );
          const j = await sr.json();
          if (j.success && j.data?.byProperty) {
            setFeedbackByProperty(j.data.byProperty as Record<string, PropertyFeedbackSummary>);
          } else {
            setFeedbackByProperty({});
          }
        } catch {
          setFeedbackByProperty({});
        }
      } else {
        setFeedbackByProperty({});
      }
    } catch (err) {
      console.error("Error while loading my properties:", err);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  useEffect(() => {
    loadMyProperties();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const email = parsed?.email || parsed?.user?.email || null;
        setUserEmail(email ? String(email) : null);
      } else {
        setUserEmail(null);
      }
    } catch {
      setUserEmail(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadEmailNotifStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  const handleFieldChange = (
    field: keyof NewPropertyForm,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (formAlert) {
      setFormAlert("");
    }
  };

  const validateStepOne = () => {
    const errors: FormFieldErrors = {};

    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      errors.title = "Property title is required.";
    } else if (trimmedTitle.length < 5 || trimmedTitle.length > 100) {
      errors.title = "Title must contain between 5 and 100 characters.";
    }

    if (!form.type) errors.type = "Property type is required.";
    if (!form.listingType) errors.listingType = "Listing type is required.";
    if (!form.address.trim()) errors.address = "Property address is required.";
    if (!form.city.trim()) errors.city = "City is required.";
    if (!form.country.trim()) errors.country = "Country is required.";

    const priceNum = Number(form.price);
    if (!form.price.trim()) {
      errors.price = "Price is required.";
    } else if (!Number.isFinite(priceNum) || priceNum <= 0) {
      errors.price = "Price must be a positive number.";
    }

    const surfaceNum = Number(form.surface);
    if (!form.surface.trim()) {
      errors.surface = "Total area is required.";
    } else if (!Number.isFinite(surfaceNum) || surfaceNum <= 0) {
      errors.surface = "Total area must be a positive number.";
    }

    const hasErrors = Object.keys(errors).length > 0;
    setFormErrors(errors);
    setFormAlert(
      hasErrors
        ? "Please complete all required fields correctly before continuing."
        : ""
    );

    return !hasErrors;
  };

  const handleContinueStep = () => {
    if (activeStep === 1) {
      const isValid = validateStepOne();
      if (!isValid) {
        toast.error("Please fix the highlighted fields to continue.");
        return;
      }
    }

    setActiveStep((s) => (s === 3 ? s : ((s + 1) as 1 | 2 | 3)));
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

  const initialFormState: NewPropertyForm = {
    title: "",
    type: "",
    listingType: "FOR_SALE",
    address: "",
    city: "",
    country: "",
    surface: "",
    rooms: "",
    bathrooms: "",
    price: "",
    description: "",
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setActiveStep(1);
    setEditingPropertyId(null);
    setForm(initialFormState);
    setFormErrors({});
    setFormAlert("");
    setImageFiles([]);
    setImagesCount(0);
    setExistingPropertyImages([]);
    setRemovingImageId(null);
  };

  const handleDeleteClick = (property: BackendProperty) => {
    setDeleteConfirm({
      isOpen: true,
      propertyId: property._id,
      propertyTitle: property.title,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.propertyId) return;

    const deleteToast = toast.loading("Deleting property...");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/properties/${deleteConfirm.propertyId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.message || "Deletion failed. You may not have permission to do this.", {
          id: deleteToast,
        });
        setDeleteConfirm({ isOpen: false, propertyId: null, propertyTitle: "" });
        return;
      }

      toast.success("Property deleted successfully", {
        id: deleteToast,
      });
      setDeleteConfirm({ isOpen: false, propertyId: null, propertyTitle: "" });
      await loadMyProperties();
    } catch (err) {
      console.error("Error deleting property:", err);
      toast.error("An unexpected error occurred while deleting the property.", {
        id: deleteToast,
      });
      setDeleteConfirm({ isOpen: false, propertyId: null, propertyTitle: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, propertyId: null, propertyTitle: "" });
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    if (!editingPropertyId) return;
    setRemovingImageId(imageId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/properties/${editingPropertyId}/images/${imageId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.message || "Failed to remove image.");
        return;
      }
      setExistingPropertyImages((prev) => prev.filter((img) => String(img._id) !== imageId));
      toast.success("Image removed");
    } catch (err) {
      console.error("Error removing image:", err);
      toast.error("Failed to remove image.");
    } finally {
      setRemovingImageId(null);
    }
  };

  const handleEdit = async (property: BackendProperty) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/properties/${property._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        toast.error("Couldn't load property details for editing.");
        return;
      }
      const data = await res.json();
      const p = data.data || data.property || data;
      setForm({
        title: p.title ?? "",
        type: p.type ?? "",
        listingType: p.listingType ?? "FOR_SALE",
        address: (p as { address?: string }).address ?? "",
        city: p.city ?? "",
        country: p.country ?? "",
        surface: p.surface != null ? String(p.surface) : "",
        rooms: p.rooms != null ? String(p.rooms) : "",
        bathrooms: p.bathrooms != null ? String(p.bathrooms) : "",
        price: p.price != null ? String(p.price) : "",
        description: p.description ?? "",
      });
      if (p.location?.coordinates && Array.isArray(p.location.coordinates) && p.location.coordinates.length >= 2) {
        const [lon, lat] = p.location.coordinates;
        setMapPosition([lat, lon]);
      }
      setEditingPropertyId(property._id);
      setImageFiles([]);
      setImagesCount(0);
      setFormErrors({});
      setFormAlert("");
      setExistingPropertyImages(
        Array.isArray(p.images)
          ? p.images.map((img: { url: string; publicId?: string; _id?: unknown }) => ({
            url: img.url,
            publicId: img.publicId,
            _id: img._id != null ? String(img._id) : undefined,
          }))
          : []
      );
      setActiveStep(1);
      toast.success("Property loaded for editing");
      setIsFormOpen(true);
    } catch (err) {
      console.error("Error loading property for edit:", err);
      toast.error("An unexpected error occurred while loading the property.");
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const isStepOneValid = validateStepOne();
      if (!isStepOneValid) {
        setActiveStep(1);
        toast.error("Please fix required fields before submitting.");
        return;
      }

      const priceNum = Number(form.price);
      const surfaceNum = form.surface ? Number(form.surface) : null;
      const roomsNum = form.rooms ? Number(form.rooms) : null;
      const bathroomsNum = form.bathrooms ? Number(form.bathrooms) : null;

      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        toast.error("Price must be a positive number.");
        return;
      }
      if (surfaceNum !== null && (surfaceNum <= 0 || Number.isNaN(surfaceNum))) {
        toast.error("Surface must be a positive number when provided.");
        return;
      }
      if (roomsNum !== null && (roomsNum < 0 || Number.isNaN(roomsNum))) {
        toast.error("Rooms must be zero or a positive number.");
        return;
      }
      if (bathroomsNum !== null && (bathroomsNum < 0 || Number.isNaN(bathroomsNum))) {
        toast.error("Bathrooms must be zero or a positive number.");
        return;
      }

      const formData = new FormData();
      // Required / core fields
      formData.append("title", form.title);
      formData.append("type", form.type);
      formData.append("listingType", form.listingType);
      formData.append("city", form.city);
      formData.append("price", form.price);

      // Optional / additional fields
      if (form.address) formData.append("address", form.address);
      if (form.country) formData.append("country", form.country);
      if (form.surface) formData.append("surface", form.surface);
      if (form.rooms) formData.append("rooms", form.rooms);
      if (form.bathrooms) formData.append("bathrooms", form.bathrooms);
      if (form.description) formData.append("description", form.description);

      // Tone & AI flag (optional, backend accepte les champs inconnus)
      formData.append("tone", tone);
      formData.append("aiGeneratedDescription", "false");

      // Multiple images
      imageFiles.forEach((file, index) => {
        formData.append(`image${index + 1}`, file);
      });

      const url = editingPropertyId
        ? `${API_URL}/properties/${editingPropertyId}`
        : `${API_URL}/properties`;
      const method = editingPropertyId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: token
          ? {
            Authorization: `Bearer ${token}`,
          }
          : undefined,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(editingPropertyId ? "Failed to update property:" : "Failed to create property:", errorText);
        toast.error(editingPropertyId ? "Update failed. Please check your inputs." : "Creation failed. Please check your inputs.");
        return;
      }

      toast.success(editingPropertyId ? "Property updated successfully" : "Property created successfully");
      closeForm();
      await loadMyProperties();
    } catch (err) {
      console.error(editingPropertyId ? "Error while updating property:" : "Error while creating property:", err);
      toast.error("An unexpected error occurred.");
    }
  };

  // Apply advanced filters to properties list
  const filteredProperties = myProperties.filter((property) => {
    // Text search (title, address, city)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const matchesText =
        property.title?.toLowerCase().includes(searchLower) ||
        property.address?.toLowerCase().includes(searchLower) ||
        property.city?.toLowerCase().includes(searchLower);
      if (!matchesText) return false;
    }

    // Type filter
    if (filters.type && property.type !== filters.type) {
      return false;
    }

    // Status filter
    if (filters.status && property.status !== filters.status) {
      return false;
    }

    // Listing type filter
    if (filters.listingType && property.listingType !== filters.listingType) {
      return false;
    }

    // City filter
    if (filters.city && property.city !== filters.city) {
      return false;
    }

    // Price range
    if (filters.minPrice && property.price < parseFloat(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && property.price > parseFloat(filters.maxPrice)) {
      return false;
    }

    // Surface range
    if (filters.minSurface && property.surface && property.surface < parseFloat(filters.minSurface)) {
      return false;
    }
    if (filters.maxSurface && property.surface && property.surface > parseFloat(filters.maxSurface)) {
      return false;
    }

    // Rooms range
    if (filters.minRooms && property.rooms && property.rooms < parseInt(filters.minRooms)) {
      return false;
    }
    if (filters.maxRooms && property.rooms && property.rooms > parseInt(filters.maxRooms)) {
      return false;
    }

    return true;
  });

  // Get unique cities for filter dropdown
  const uniqueCities = Array.from(new Set(myProperties.map(p => p.city).filter(Boolean)));

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      searchText: "",
      type: "",
      status: "",
      listingType: "",
      city: "",
      minPrice: "",
      maxPrice: "",
      minSurface: "",
      maxSurface: "",
      minRooms: "",
      maxRooms: "",
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

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
                {filteredProperties.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold">
                {myProperties.length}
              </span>{" "}
              properties from your portfolio.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-xl shadow-sm transition-colors ${hasActiveFilters
                ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800"
                : "text-gray-600 border-gray-200 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700"
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Advanced Filters
              {hasActiveFilters && (
                <span className="px-1.5 py-0.5 text-xs font-bold text-white bg-indigo-600 rounded-full">
                  {Object.values(filters).filter(v => v !== "").length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={toggleEmailNotifications}
              disabled={emailNotifLoading || emailNotifEnabled === null || !userEmail}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl shadow-sm border transition-colors ${
                emailNotifEnabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/40"
                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-900/40"
              } ${emailNotifLoading || emailNotifEnabled === null ? "opacity-70 cursor-not-allowed" : ""}`}
              title={
                !userEmail
                  ? "No user email found in session"
                  : emailNotifEnabled === null
                    ? "FastAPI not reachable"
                    : "Toggle your matching emails"
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8l-9 6-9-6" />
              </svg>
              {emailNotifLoading
                ? "Updating..."
                : emailNotifEnabled === null
                  ? "Emails: Offline"
                  : emailNotifEnabled
                    ? "Emails: ON"
                    : "Emails: OFF"}
            </button>
            <button
              className="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm bg-brand-500 hover:bg-brand-600"
              type="button"
              onClick={() => {
                setForm(initialFormState);
                setEditingPropertyId(null);
                setImageFiles([]);
                setImagesCount(0);
                setExistingPropertyImages([]);
                setFormErrors({});
                setFormAlert("");
                setActiveStep(1);
                setIsFormOpen(true);
              }}
            >
              + Add Property
            </button>
            {/* View toggle: list / grid (like frontend) */}
            <div className="inline-flex items-center gap-1 px-1 py-1 bg-white border border-gray-200 rounded-2xl shadow-sm dark:bg-gray-900 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-medium ${viewMode === "list"
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
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-medium ${viewMode === "grid"
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

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Advanced Search Filters
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Refine your property search with multiple criteria
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset All
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {/* Text Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.searchText}
                      onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                      placeholder="Search by title, address or city..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="">All Types</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="VILLA">Villa</option>
                    <option value="STUDIO">Studio</option>
                    <option value="LAND">Land</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="OFFICE">Office</option>
                  </select>
                </div>

                {/* Listing Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Listing Type
                  </label>
                  <select
                    value={filters.listingType}
                    onChange={(e) => setFilters({ ...filters, listingType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="">All Listings</option>
                    <option value="FOR_SALE">For Sale</option>
                    <option value="FOR_RENT">For Rent</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="">All Status</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="SOLD">Sold</option>
                    <option value="RENTED">Rented</option>
                    <option value="PENDING">Pending</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="">All Cities</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Price (TND)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    placeholder="Min"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Price (TND)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    placeholder="Max"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Surface Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Surface (m²)
                  </label>
                  <input
                    type="number"
                    value={filters.minSurface}
                    onChange={(e) => setFilters({ ...filters, minSurface: e.target.value })}
                    placeholder="Min"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Surface (m²)
                  </label>
                  <input
                    type="number"
                    value={filters.maxSurface}
                    onChange={(e) => setFilters({ ...filters, maxSurface: e.target.value })}
                    placeholder="Max"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Rooms Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Rooms
                  </label>
                  <input
                    type="number"
                    value={filters.minRooms}
                    onChange={(e) => setFilters({ ...filters, minRooms: e.target.value })}
                    placeholder="Min"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Rooms
                  </label>
                  <input
                    type="number"
                    value={filters.maxRooms}
                    onChange={(e) => setFilters({ ...filters, maxRooms: e.target.value })}
                    placeholder="Max"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
                    {Object.entries(filters).map(([key, value]) => {
                      if (!value) return null;
                      const labels: Record<string, string> = {
                        searchText: 'Search',
                        type: 'Type',
                        status: 'Status',
                        listingType: 'Listing',
                        city: 'City',
                        minPrice: 'Min Price',
                        maxPrice: 'Max Price',
                        minSurface: 'Min Surface',
                        maxSurface: 'Max Surface',
                        minRooms: 'Min Rooms',
                        maxRooms: 'Max Rooms',
                      };
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full dark:bg-indigo-900/30 dark:text-indigo-300"
                        >
                          <span>{labels[key]}:</span>
                          <span className="font-semibold">{value}</span>
                          <button
                            onClick={() => setFilters({ ...filters, [key]: "" })}
                            className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toolbar / summary */}
        <div className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm dark:bg-gray-900 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isLoadingProperties
              ? "Loading your properties..."
              : filteredProperties.length > 0
                ? `Showing ${filteredProperties.length} property(ies)${hasActiveFilters ? ` (filtered from ${myProperties.length})` : ''}`
                : hasActiveFilters
                  ? "No properties match your filters."
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
            {filteredProperties.map((property) => (
              <article
                key={property._id}
                className="flex flex-col overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900 dark:border-gray-800"
              >
                {/* Image block */}
                <div className="relative overflow-hidden">
                  <img
                    src={resolveImageUrl(property.images?.[0]?.url)}
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

                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                    <PropertyRatingSnippet
                      propertyId={property._id}
                      map={feedbackByProperty}
                    />
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/my-properties/${property._id}`}
                        className="px-3 py-1.5 text-xs font-semibold text-white rounded-full bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors"
                      >
                        View details
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleEdit(property); }}
                        className="px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 rounded-full hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-400 dark:border-brand-500/30 dark:hover:bg-brand-500/25 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPanoProperty(property);
                          setIsPanoramaEditOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30 dark:hover:bg-indigo-500/25 transition-colors"
                      >
                        360 Tour
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(property); }}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-error-600 rounded-full hover:bg-error-700 dark:bg-error-600 dark:hover:bg-error-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <article
                key={property._id}
                className="flex flex-col overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-gray-900 dark:border-gray-800 md:flex-row"
              >
                {/* Image - fixed height so all list cards have the same size */}
                <div className="relative w-full overflow-hidden md:w-64 lg:w-72 h-52 md:h-52 shrink-0">
                  <img
                    src={resolveImageUrl(property.images?.[0]?.url)}
                    alt={property.title}
                    className="object-cover w-full h-full"
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
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 space-y-3 md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 md:text-base dark:text-white mb-1">
                        {property.title}
                      </h3>
                      <p className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span className="inline-block w-1.5 h-1.5 mr-2 bg-emerald-500 rounded-full" />
                        {property.city}, {property.country || "Tunisia"}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full dark:bg-indigo-500/10 dark:text-indigo-300 shrink-0">
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

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 gap-2 flex-wrap">
                    <PropertyRatingSnippet
                      propertyId={property._id}
                      map={feedbackByProperty}
                    />
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/my-properties/${property._id}`}
                        className="px-4 py-1.5 text-xs font-semibold text-white rounded-full bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors"
                      >
                        View details
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleEdit(property); }}
                        className="px-4 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 rounded-full hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-400 dark:border-brand-500/30 dark:hover:bg-brand-500/25 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPanoProperty(property);
                          setIsPanoramaEditOpen(true);
                        }}
                        className="px-4 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30 dark:hover:bg-indigo-500/25 transition-colors"
                      >
                        360 Virtual Tour
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(property); }}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-error-600 rounded-full hover:bg-error-700 dark:bg-error-600 dark:hover:bg-error-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
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
      </div >

      {/* Add Property – multi-step form overlay */}
      {
        isFormOpen && (
          <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 px-2 py-4 sm:px-4 sm:py-6 overflow-y-auto">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh] mt-12 sm:mt-16">
              {/* Header with steps */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingPropertyId ? "Edit Property" : "Add New Property"}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Step {activeStep} of 3
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`flex items-center gap-2 text-xs font-medium ${activeStep === step
                        ? "text-brand-500"
                        : "text-gray-400"
                        }`}
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${activeStep === step
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
                    {formAlert && (
                      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-900/20">
                        <div className="mt-0.5 text-red-600 dark:text-red-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M10.29 3.86l-8.59 14.87A2 2 0 003.41 22h17.18a2 2 0 001.71-3.27L13.71 3.86a2 2 0 00-3.42 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-700 dark:text-red-300">Required information missing</p>
                          <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{formAlert}</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Property Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 ${formErrors.title ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-700" : "border-gray-200 dark:border-gray-700"}`}
                          placeholder="e.g. Luxury villa with sea view"
                          value={form.title}
                          onChange={(e) =>
                            handleFieldChange("title", e.target.value)
                          }
                        />
                        {formErrors.title && (
                          <p className="text-[11px] font-medium text-red-600 dark:text-red-400">{formErrors.title}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Property Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 ${formErrors.type ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-700" : "border-gray-200 dark:border-gray-700"}`}
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
                        {formErrors.type && (
                          <p className="text-[11px] font-medium text-red-600 dark:text-red-400">{formErrors.type}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Listing Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 ${formErrors.listingType ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-700" : "border-gray-200 dark:border-gray-700"}`}
                          value={form.listingType}
                          onChange={(e) =>
                            handleFieldChange("listingType", e.target.value as "FOR_SALE" | "FOR_RENT" | "")
                          }
                        >
                          <option value="">Select listing type</option>
                          <option value="FOR_SALE">For Sale</option>
                          <option value="FOR_RENT">For Rent</option>
                        </select>
                        {formErrors.listingType && (
                          <p className="text-[11px] font-medium text-red-600 dark:text-red-400">{formErrors.listingType}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Price <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 ${formErrors.price ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-700" : "border-gray-200 dark:border-gray-700"}`}
                          placeholder="e.g. 850000"
                          value={form.price}
                          onChange={(e) =>
                            handleFieldChange("price", e.target.value)
                          }
                        />
                        {formErrors.price && (
                          <p className="text-[11px] font-medium text-red-600 dark:text-red-400">{formErrors.price}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Total Area (m²) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 ${formErrors.surface ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-700" : "border-gray-200 dark:border-gray-700"}`}
                          placeholder="e.g. 250"
                          value={form.surface}
                          onChange={(e) =>
                            handleFieldChange("surface", e.target.value)
                          }
                        />
                        {formErrors.surface && (
                          <p className="text-[11px] font-medium text-red-600 dark:text-red-400">{formErrors.surface}</p>
                        )}
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Property Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 ${formErrors.address ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-700" : "border-gray-200 dark:border-gray-700"}`}
                          placeholder="Street and number"
                          value={form.address}
                          onChange={(e) =>
                            handleFieldChange("address", e.target.value)
                          }
                        />
                        {formErrors.address && (
                          <p className="text-[11px] font-medium text-red-600 dark:text-red-400">{formErrors.address}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 ${formErrors.city ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-700" : "border-gray-200 dark:border-gray-700"}`}
                          placeholder="e.g. Nice"
                          value={form.city}
                          onChange={(e) =>
                            handleFieldChange("city", e.target.value)
                          }
                        />
                        {formErrors.city && (
                          <p className="text-[11px] font-medium text-red-600 dark:text-red-400">{formErrors.city}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 ${formErrors.country ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-700" : "border-gray-200 dark:border-gray-700"}`}
                          placeholder="e.g. France"
                          value={form.country}
                          onChange={(e) =>
                            handleFieldChange("country", e.target.value)
                          }
                        />
                        {formErrors.country && (
                          <p className="text-[11px] font-medium text-red-600 dark:text-red-400">{formErrors.country}</p>
                        )}
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
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                          Bathrooms
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                          placeholder="e.g. 2"
                          value={form.bathrooms}
                          onChange={(e) =>
                            handleFieldChange("bathrooms", e.target.value)
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
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${tone === t
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
                        className={`inline-flex items-center px-4 py-2 mt-1 text-xs font-semibold rounded-full shadow-sm ${isGeneratingDescription
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
                        className={`flex flex-col items-center justify-center w-full px-6 py-8 text-center border-2 border-dashed rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-900 ${isDragOver
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

                      {/* Existing property images (when editing) */}
                      {existingPropertyImages.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                            Current property images ({existingPropertyImages.length})
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {existingPropertyImages.map((img, index) => (
                              <div
                                key={img._id ?? img.publicId ?? img.url ?? index}
                                className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-square"
                              >
                                <img
                                  src={resolveImageUrl(img.url)}
                                  alt={`Current ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-600 text-white">
                                  {index + 1}
                                </span>
                                {img._id && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRemoveExistingImage(img._id!);
                                    }}
                                    disabled={removingImageId === img._id}
                                    className="absolute top-1 right-1 flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                                    title="Remove image"
                                    aria-label="Remove image"
                                  >
                                    {removingImageId === img._id ? (
                                      <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    )}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preview of newly selected images */}
                      {imageFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                            {existingPropertyImages.length > 0 ? "New images" : "Selected images"} ({imageFiles.length})
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {imageFiles.map((file, index) => (
                              <div
                                key={`${file.name}-${index}`}
                                className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-square"
                              >
                                <ImagePreviewThumb file={file} alt={`Preview ${index + 1}`} />
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white">
                                  {index + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setImageFiles((prev) => prev.filter((_, i) => i !== index));
                                    setImagesCount((prev) => Math.max(0, prev - 1));
                                  }}
                                  className="absolute top-1 right-1 flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                  title="Remove image"
                                  aria-label="Remove image"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                      onClick={handleContinueStep}
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
        )
      }

      {/* Delete Confirmation Modal - z-index above AppHeader so it covers the whole screen */}
      {
        deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30">
                    <svg
                      className="w-6 h-6 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Confirm deletion
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      This action can't be undone
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Are you sure you want to delete this property?
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  "{deleteConfirm.propertyTitle}"
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  All associated data will be permanently removed and cannot be recovered.
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80">
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                  Delete permanently
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Panorama Manager Overlay */}
      {isPanoramaEditOpen && panoProperty && (
        <PanoramaManager
          key={panoProperty._id}
          propertyId={panoProperty._id}
          initialPanoramas={panoProperty.panoramas || []}
          apiUrl={API_URL}
          onClose={() => {
            setIsPanoramaEditOpen(false);
            setPanoProperty(null);
          }}
          onSave={async (panoramas) => {
            try {
              const response = await fetch(`${API_URL}/properties/${panoProperty._id}/panoramas`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ panoramas }),
              });
              if (response.ok) {
                toast.success("Virtual tour saved successfully");
                // Update local list
                setMyProperties(prev => prev.map(p =>
                  p._id === panoProperty._id ? { ...p, panoramas } : p
                ));
              } else {
                toast.error("Failed to save virtual tour");
              }
            } catch (err) {
              console.error(err);
              toast.error("Error saving virtual tour");
            }
          }}
        />
      )}
    </>
  );
}

