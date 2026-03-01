import { useEffect, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type Stats = {
  totalUsers: number;
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
  soldProperties: number;
  activeUsers: number;
  recentUsers: Array<{
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    createdAt: string;
  }>;
  recentProperties: Array<{
    _id: string;
    address: string;
    city: string;
    price: number;
    status: string;
    type: string;
    createdAt: string;
  }>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProperties: 0,
    availableProperties: 0,
    rentedProperties: 0,
    soldProperties: 0,
    activeUsers: 0,
    recentUsers: [],
    recentProperties: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch users
      const usersRes = await fetch(`${API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = usersRes.ok ? await usersRes.json() : { users: [] };

      // Fetch properties
      const propsRes = await fetch(`${API_URL}/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const properties = propsRes.ok ? await propsRes.json() : { properties: [] };

      const usersList = users.users || users || [];
      const propsList = properties.properties || properties.data?.properties || [];

      setStats({
        totalUsers: usersList.length,
        totalProperties: propsList.length,
        availableProperties: propsList.filter((p: any) => 
          p.status?.toLowerCase() === "available"
        ).length,
        rentedProperties: propsList.filter((p: any) => 
          p.status?.toLowerCase() === "rented"
        ).length,
        soldProperties: propsList.filter((p: any) => 
          p.status?.toLowerCase() === "sold"
        ).length,
        activeUsers: usersList.filter((u: any) => u.isActive !== false).length,
        recentUsers: usersList.slice(0, 5),
        recentProperties: propsList.slice(0, 5),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    trend,
  }: {
    title: string;
    value: number;
    icon: string;
    color: string;
    trend?: string;
  }) => (
    <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {trend && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              {trend}
            </p>
          )}
        </div>
        <div
          className={`h-14 w-14 rounded-2xl flex items-center justify-center ${color}`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageMeta
        title="Admin Dashboard | Smart Property"
        description="Overview of platform statistics and recent activity"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome to the admin panel. Here's an overview of your platform.
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="👥"
                color="bg-blue-100 dark:bg-blue-900/30"
              />
              <StatCard
                title="Total Properties"
                value={stats.totalProperties}
                icon="🏠"
                color="bg-purple-100 dark:bg-purple-900/30"
              />
              <StatCard
                title="Available Properties"
                value={stats.availableProperties}
                icon="✅"
                color="bg-green-100 dark:bg-green-900/30"
              />
              <StatCard
                title="Active Users"
                value={stats.activeUsers}
                icon="⚡"
                color="bg-orange-100 dark:bg-orange-900/30"
              />
            </div>

            {/* Property Status Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Available
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {stats.availableProperties}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-xl">🟢</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Rented
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {stats.rentedProperties}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-xl">🔵</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sold
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                      {stats.soldProperties}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="text-xl">🔴</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Users
                  </h2>
                  <Link
                    to="/admin/users"
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {stats.recentUsers.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No users yet
                    </p>
                  ) : (
                    stats.recentUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.firstName || user.lastName
                                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                : user.email}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.role}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Properties */}
              <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Properties
                  </h2>
                  <Link
                    to="/admin/properties"
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {stats.recentProperties.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No properties yet
                    </p>
                  ) : (
                    stats.recentProperties.map((property) => (
                      <div
                        key={property._id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {property.address}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {property.city} • {property.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {property.price.toLocaleString()} TND
                          </p>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              property.status === "available"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : property.status === "rented"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {property.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/admin/users"
                  className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:shadow-md transition-all group"
                >
                  <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <span className="text-xl">👥</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Manage Users
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View and edit users
                    </p>
                  </div>
                </Link>
                <Link
                  to="/admin/properties"
                  className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-md transition-all group"
                >
                  <div className="h-12 w-12 rounded-xl bg-green-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <span className="text-xl">🏠</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Manage Properties
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View all listings
                    </p>
                  </div>
                </Link>
                <button
                  onClick={fetchStats}
                  className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 hover:shadow-md transition-all group"
                >
                  <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <span className="text-xl">🔄</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Refresh Data
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Update statistics
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
