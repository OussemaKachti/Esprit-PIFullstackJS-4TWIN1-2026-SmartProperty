import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type User = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    properties?: number;
  };
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  });

  const stats = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return {
      total: list.length,
      agencies: list.filter((u) => u.role === "AGENCY").length,
      owners: list.filter((u) => u.role === "OWNER").length,
      tenants: list.filter((u) => u.role === "TENANT").length,
      buyers: list.filter((u) => u.role === "BUYER").length,
    };
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.role, filters.status]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      
      // Handle different API response formats
      let usersList: User[] = [];
      
      if (Array.isArray(data)) {
        usersList = data;
      } else if (data.users && Array.isArray(data.users)) {
        usersList = data.users;
      } else if (data.data && Array.isArray(data.data)) {
        usersList = data.data;
      }
      
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete user");

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update user");

      toast.success("User status updated");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to update user role");

      toast.success("User role updated");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      (user.firstName?.toLowerCase() || "").includes(filters.search.toLowerCase()) ||
      (user.lastName?.toLowerCase() || "").includes(filters.search.toLowerCase());

    const matchesRole = filters.role === "all" || user.role === filters.role;
    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "active" && user.isActive) ||
      (filters.status === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination functions
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      AGENCY: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      OWNER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      TENANT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      BUYER: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
    return badges[role] || badges.TENANT;
  };

  return (
    <>
      <PageMeta title="Users Management | Admin" description="Manage all system users and their permissions" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Users Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all system users and their permissions
            </p>
          </div>
         
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard title="Total Users" value={stats.total} helper="Platform accounts" accent="indigo" />
          <StatCard title="Agencies" value={stats.agencies} helper="Agency dashboards" accent="violet" />
          <StatCard title="Owners" value={stats.owners} helper="Property owners" accent="blue" />
          <StatCard title="Tenants" value={stats.tenants} helper="Rental users" accent="emerald" />
          <StatCard title="Buyers" value={stats.buyers} helper="Purchase users" accent="amber" />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="AGENCY">Agency</option>
                <option value="OWNER">Owner</option>
                <option value="TENANT">Tenant</option>
                <option value="BUYER">Buyer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">
                      Phone
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-24">
                      Role
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-24">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">
                      Joined
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-12 text-center text-gray-500 dark:text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                              {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user.firstName || user.lastName
                                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm text-gray-900 dark:text-white truncate">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {user.phone || "N/A"}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            disabled={user.role === "ADMIN"}
                            className={`px-2 py-1 rounded-lg text-xs font-medium cursor-pointer ${getRoleBadge(user.role)} ${user.role === "ADMIN" ? "opacity-70 cursor-not-allowed" : ""}`}
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="AGENCY">Agency</option>
                            <option value="OWNER">Owner</option>
                            <option value="TENANT">Tenant</option>
                            <option value="BUYER">Buyer</option>
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => handleStatusToggle(user._id, user.isActive)}
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              user.isActive
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === user._id ? null : user._id)}
                              onBlur={() => setTimeout(() => setOpenDropdown(null), 200)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                            {openDropdown === user._id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                                <button
                                  onClick={() => alert(`Edit user: ${user.email}`)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                {user.role !== "ADMIN" && (
                                  <button
                                    onClick={() => handleDelete(user._id)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </button>
                                )}
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
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{indexOfFirstItem + 1}</span>-
              <span className="font-semibold text-gray-900 dark:text-white">{Math.min(indexOfLastItem, filteredUsers.length)}</span> of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{filteredUsers.length}</span> users · Page{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of <span className="font-semibold text-gray-900 dark:text-white">{Math.max(totalPages, 1)}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-indigo-600 bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({ title, value, helper, accent }: { title: string; value: number | string; helper: string; accent: "indigo" | "violet" | "blue" | "emerald" | "amber" }) {
  const accentClass: Record<typeof accent, string> = {
    indigo: "from-indigo-500 to-indigo-600",
    violet: "from-violet-500 to-violet-600",
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-sm transition-shadow">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentClass[accent]}`} />
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 tracking-tight">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{helper}</p>
    </div>
  );
}
