import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  GridIcon,
  ChevronDownIcon,
  HorizontaLDots,
  ListIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FRONTEND_SIGNIN_URL =
  import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const adminNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Overview", path: "/admin", pro: false }],
  },
  {
    icon: <ListIcon />,
    name: "Properties",
    path: "/admin/properties",
  },
  {
    icon: <UserCircleIcon />,
    name: "Users",
    path: "/admin/users",
  },
];

const AdminSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        await fetch(`${API_URL}/users/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // ignore network errors
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = `${FRONTEND_SIGNIN_URL}/login`;
    }
  }, []);

  useEffect(() => {
    const newHeights: Record<string, number> = {};
    Object.keys(subMenuRefs.current).forEach((key) => {
      const el = subMenuRefs.current[key];
      if (el) {
        newHeights[key] = el.scrollHeight;
      }
    });
    setSubMenuHeight(newHeights);
  }, [adminNavItems]);

  const toggleSubmenu = (type: "main", index: number) => {
    setOpenSubmenu((prev) =>
      prev?.type === type && prev.index === index ? null : { type, index }
    );
  };

  const sidebarClasses = `
    bg-white dark:bg-gray-dark border-r border-gray-200 dark:border-gray-800 
    fixed left-0 top-0 z-40 h-screen pt-5 pb-4 flex flex-col justify-between
    transition-all duration-300 ease-in-out
    ${isExpanded || isHovered ? "w-64" : "w-20"}
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
  `;

  return (
    <aside
      className={sidebarClasses}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => !isExpanded && setIsHovered(false)}
    >
      <div className="no-scrollbar flex flex-col overflow-y-auto">
        {/* Logo */}
        <div
          className={`flex items-center justify-center px-6 mb-10 transition-all duration-300 ${
            isExpanded || isHovered ? "justify-start" : "justify-center"
          }`}
        >
          <Link to="/admin" className="block w-full">
            <img 
              src="/img/logo-removebg-preview.png" 
              alt="Smart Property" 
              className={`object-contain ${
                isExpanded || isHovered
                  ? "w-full max-w-[280px] h-auto"
                  : "mx-auto w-[90px] h-auto max-h-14"
              }`}
              width={isExpanded || isHovered ? 280 : 90}
              height={isExpanded || isHovered ? 110 : 36}
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-2">
          {adminNavItems.map((item, index) => {
            const hasSubmenu = item.subItems && item.subItems.length > 0;
            const isSubmenuOpen =
              openSubmenu?.type === "main" && openSubmenu.index === index;

            if (hasSubmenu) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleSubmenu("main", index)}
                    className={`
                      flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${
                        isSubmenuOpen
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      }
                      ${!(isExpanded || isHovered) && "justify-center"}
                    `}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {(isExpanded || isHovered) && (
                      <>
                        <span className="ml-3 flex-1 text-left">
                          {item.name}
                        </span>
                        <ChevronDownIcon
                          className={`transition-transform duration-200 ${
                            isSubmenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>
                  <div
                    ref={(el) => {
                      subMenuRefs.current[`main-${index}`] = el;
                    }}
                    style={{
                      maxHeight: isSubmenuOpen
                        ? `${subMenuHeight[`main-${index}`] || 500}px`
                        : "0",
                    }}
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                  >
                    <div className="pl-4 mt-1 space-y-1">
                      {item.subItems?.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`
                            flex items-center px-4 py-2 rounded-lg text-sm
                            transition-colors duration-200
                            ${
                              isActive(subItem.path)
                                ? "bg-indigo-50 text-indigo-600 font-medium dark:bg-indigo-900/20 dark:text-indigo-400"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            }
                          `}
                        >
                          <span className="flex-1">{subItem.name}</span>
                          {subItem.pro && (
                            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
                              Pro
                            </span>
                          )}
                          {subItem.new && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-400">
                              New
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path!}
                className={`
                  flex items-center px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive(item.path!)
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }
                  ${!(isExpanded || isHovered) && "justify-center"}
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {(isExpanded || isHovered) && (
                  <span className="ml-3">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="px-3 mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className={`
            flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium
            text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20
            transition-all duration-200
            ${!(isExpanded || isHovered) && "justify-center"}
          `}
        >
          <HorizontaLDots />
          {(isExpanded || isHovered) && (
            <span className="ml-3">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
