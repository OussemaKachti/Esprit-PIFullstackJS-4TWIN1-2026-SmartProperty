import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FRONTEND_SIGNIN_URL =
  import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000";

// Globe/Browser Icon component
const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Regular user menu items
const regularNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <ListIcon />,
    name: "My Properties",
    path: "/my-properties",
  },
  {
    icon: <TableIcon />,
    name: "Transactions",
    path: "/transactions",
  },
  {
    icon: <PieChartIcon />,
    name: "Performance",
    path: "/performance",
  },
  {
    icon: <PageIcon />,
    name: "Documents",
    path: "/documents",
  },
 
  
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
  },
];

const buyerTenantNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <ListIcon />,
    name: "Purchases & rentals",
    path: "/my-portfolio",
  },
  {
    icon: <TableIcon />,
    name: "My offers",
    path: "/my-offers",
  },
  {
    icon: <PieChartIcon />,
    name: "Activity",
    path: "/transactions",
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
  },
  {
    icon: <PageIcon />,
    name: "Documents",
    path: "/documents",
  },
];

// Admin menu items
const adminNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/admin",
  },
  {
    icon: <UserCircleIcon />,
    name: "Candidates",
    path: "/admin/candidates",
  },
  {
    icon: <ListIcon />,
    name: "Rentals",
    path: "/admin/rentals",
  },
  {
    icon: <CalenderIcon />,
    name: "Notifications",
    path: "/admin/notifications",
  },
  {
    icon: <UserCircleIcon />,
    name: "Users",
    path: "/admin/users",
  },
  {
    icon: <TableIcon />,
    name: "Transactions",
    path: "/transactions",
  },
];

// No \"Others\" menu for now – we keep the config so the component works,
// but with an empty list.
const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [userRole, setUserRole] = useState<string>("");

  const syncRoleFromStorage = useCallback(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      setUserRole("");
      return;
    }
    try {
      const userData = JSON.parse(user);
      setUserRole(String(userData.role || "").toUpperCase());
    } catch (error) {
      console.error("Error parsing user data:", error);
      setUserRole("");
    }
  }, []);

  useEffect(() => {
    syncRoleFromStorage();
  }, [syncRoleFromStorage, location.pathname]);

  const navItems =
    userRole === "ADMIN"
      ? adminNavItems
      : userRole === "BUYER" || userRole === "TENANT"
        ? buyerTenantNavItems
        : regularNavItems;

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
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
      // ignore network errors; we still clear local session
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = `${FRONTEND_SIGNIN_URL}/login`;
    }
  }, []);

  const handleGoToFrontend = useCallback(() => {
    // Redirect to frontend in the same tab
    window.location.href = FRONTEND_URL;
  }, []);

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`pt-4 pb-2 flex items-start shrink-0 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to={userRole === "ADMIN" ? "/admin" : "/"} className="block w-full">
          <img
            src="/images/logo/Smart.png"
            alt="Smart Property"
            className={`object-contain object-left ${
              isExpanded || isHovered || isMobileOpen
                ? "w-full max-w-[250px] h-auto"
                : "mx-auto w-[72px] h-auto max-h-12"
            }`}
            width={isExpanded || isHovered || isMobileOpen ? 250 : 72}
            height={isExpanded || isHovered || isMobileOpen ? 98 : 28}
          />
        </Link>
      </div>
      <div className="flex flex-col flex-1 min-h-0">
        <nav className="flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar mb-6 pt-1">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-3 flex text-xs uppercase leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  userRole === "ADMIN" ? "Admin Menu" : "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            {othersItems.length > 0 && (
              <div className="">
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Others"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            )}
          </div>
        </nav>
        {/* Bottom: user profile + logout — toujours en bas */}
        {(isExpanded || isHovered || isMobileOpen) && (
          <div className="flex-shrink-0 space-y-2 border-t border-gray-200 pb-6 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={handleGoToFrontend}
              className="menu-item group menu-item-inactive w-full text-left"
            >
              <span className="menu-item-icon-size menu-item-icon-inactive">
                <GlobeIcon />
              </span>
              <span className="menu-item-text">Marketplace</span>
            </button>
            <Link
              to="/profile"
              className={`menu-item group ${isActive("/profile") ? "menu-item-active" : "menu-item-inactive"}`}
            >
              <span
                className={`menu-item-icon-size ${
                  isActive("/profile") ? "menu-item-icon-active" : "menu-item-icon-inactive"
                }`}
              >
                <UserCircleIcon />
              </span>
              <span className="menu-item-text">User Profile</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="menu-item group menu-item-inactive w-full text-left text-error-600 hover:text-error-600"
            >
              <svg
            className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
              fill=""
            />
          </svg>
              <span className="menu-item-text">Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
