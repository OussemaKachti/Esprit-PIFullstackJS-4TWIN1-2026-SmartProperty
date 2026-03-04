import { useEffect, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type Property = {
  _id: string;
  reference: string;
  title: string;
  type: string;
  listingType: string;
  address: string;
  city: string;
  region: string;
  country: string;
  surface: number;
  rooms: number;
  bathrooms: number;
  price: number;
  status: string;
  images: { url: string; publicId: string }[] | string[];
  createdBy: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
    phone?: string;
  };
  createdAt: string;
};

export default function AdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    type: "all",
    listingType: "all",
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch properties");

      const data = await response.json();
      
      // Handle different API response formats
      let propertiesList: Property[] = [];
      
      if (Array.isArray(data)) {
        propertiesList = data;
      } else if (data.properties && Array.isArray(data.properties)) {
        propertiesList = data.properties;
      } else if (data.data && Array.isArray(data.data.properties)) {
        propertiesList = data.data.properties;
      } else if (data.data && Array.isArray(data.data)) {
        propertiesList = data.data;
      }
      
      setProperties(propertiesList);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
      setProperties([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete property");

      toast.success("Property deleted successfully");
      fetchProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update property");

      toast.success("Property status updated");
      fetchProperties();
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Failed to update property");
    }
  };

  const filteredProperties = (Array.isArray(properties) ? properties : []).filter((property) => {
    const matchesSearch = 
      property.address?.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.city?.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.reference?.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.createdBy?.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === "all" || property.status?.toLowerCase() === filters.status.toLowerCase();
    const matchesType = filters.type === "all" || property.type?.toLowerCase() === filters.type.toLowerCase();
    const matchesListingType = filters.listingType === "all" || property.listingType === filters.listingType;

    return matchesSearch && matchesStatus && matchesType && matchesListingType;
  });

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "available";
    const badges: Record<string, string> = {
      available: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      sold: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      rented: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      archived: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return badges[statusLower] || badges.available;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <>
      <PageMeta title="Properties Management | Admin" description="Manage all properties across the platform" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Properties Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all properties across the platform
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">🏠</div>
              <span className="text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">TOTAL</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{Array.isArray(properties) ? properties.length : 0}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Total Properties</div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">✅</div>
              <span className="text-xs font-medium bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded">ACTIVE</span>
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {(Array.isArray(properties) ? properties : []).filter((p) => p.status?.toLowerCase() === "available").length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Available Now</div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">💰</div>
              <span className="text-xs font-medium bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">SALE</span>
            </div>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {(Array.isArray(properties) ? properties : []).filter((p) => p.listingType === "FOR_SALE").length}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">For Sale</div>
          </div>

          <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">🔑</div>
              <span className="text-xs font-medium bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300 px-2 py-1 rounded">RENT</span>
            </div>
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
              {(Array.isArray(properties) ? properties : []).filter((p) => p.listingType === "FOR_RENT").length}
            </div>
            <div className="text-xs text-teal-600 dark:text-teal-400">For Rent</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by address, city, reference, or owner..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Listing Type
              </label>
              <select
                value={filters.listingType}
                onChange={(e) => setFilters({ ...filters, listingType: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Listing Types</option>
                <option value="FOR_SALE">For Sale</option>
                <option value="FOR_RENT">For Rent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="SOLD">Sold</option>
                <option value="RENTED">Rented</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="VILLA">Villa</option>
                <option value="STUDIO">Studio</option>
                <option value="LAND">Land</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="OFFICE">Office</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">
                    Reference
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Property Details
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-48">
                    Owner
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">
                    Type
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">
                    Price
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">
                    Listed Date
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentProperties.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-12 text-center text-gray-500 dark:text-gray-400">
                        No properties found
                      </td>
                    </tr>
                  ) : (
                    currentProperties.map((property) => (
                      <tr
                        key={property._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-3 py-3">
                          <div 
                            className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 truncate"
                            title={property.reference || "N/A"}
                          >
                            {property.reference || "N/A"}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div>
                            <div 
                              className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1"
                              title={property.title || property.address}
                            >
                              {property.title || property.address}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              <span className="truncate">{property.city}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div>
                            <div 
                              className="text-sm font-medium text-gray-900 dark:text-white truncate"
                              title={property.createdBy?.firstName || property.createdBy?.lastName
                                ? `${property.createdBy.firstName || ""} ${property.createdBy.lastName || ""}`.trim()
                                : "N/A"}
                            >
                              {property.createdBy?.firstName || property.createdBy?.lastName
                                ? `${property.createdBy.firstName || ""} ${property.createdBy.lastName || ""}`.trim()
                                : "N/A"}
                            </div>
                            <div 
                              className="text-xs text-gray-500 dark:text-gray-400 truncate"
                              title={property.createdBy?.email || "N/A"}
                            >
                              {property.createdBy?.email || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 capitalize">
                            {property.type?.replace("_", " ") || "N/A"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {property.price?.toLocaleString()} TND
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={property.status}
                            onChange={(e) => handleStatusChange(property._id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-xs font-medium cursor-pointer ${getStatusBadge(property.status)}`}
                          >
                            <option value="AVAILABLE">Available</option>
                            <option value="SOLD">Sold</option>
                            <option value="RENTED">Rented</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(property.createdAt)}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === property._id ? null : property._id)}
                              onBlur={() => setTimeout(() => setOpenDropdown(null), 200)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                            {openDropdown === property._id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                                <Link
                                  to={`/my-properties/${property._id}`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Details
                                </Link>
                                <button
                                  onClick={() => handleDelete(property._id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          )}
        </div>

        {/* Pagination */}
        {filteredProperties.length > 0 && (
          <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(indexOfLastItem, filteredProperties.length)}</span> of{" "}
                <span className="font-semibold">{filteredProperties.length}</span> properties
                {totalPages > 1 && (
                  <span className="ml-2 text-gray-500">
                    (Page {currentPage} of {totalPages})
                  </span>
                )}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                      let page;
                      if (totalPages <= 10) {
                        page = i + 1;
                      } else if (currentPage <= 5) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 4) {
                        page = totalPages - 9 + i;
                      } else {
                        page = currentPage - 4 + i;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {totalPages > 10 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
