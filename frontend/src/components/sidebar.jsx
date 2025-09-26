"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  FaCar,
  FaTachometerAlt, 
  FaUsers, 
  FaTools, 
  FaFileInvoiceDollar,
  FaChevronDown,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaClipboardList,
  FaBoxes,
  FaTasks,
  FaBell
} from "react-icons/fa";

// Reusable Logout Button
function LogoutButton({ isOpen, className }) {
          const { logout } = useAuth();
        const router = useRouter();


          const handleLogout = () => {
          logout();            // remove user globally
          router.push("/");    // redirect to landing page
        };


  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("user");
  //   router.push("/auth/login");
  //   // window.location.reload(); // Prevent back-button cache
  // };

  return (
    <button
      onClick={handleLogout}
      className="group w-full flex items-center space-x-4 px-4 py-3 
                 rounded-2xl text-gray-600 bg-white 
                 hover:bg-red-600 hover:text-white 
                 transition-all duration-300 transform hover:scale-[1.02]
                 border border-transparent hover:border-red-500 hover:shadow-md hover:shadow-red-200/50"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center 
                   bg-gray-100 group-hover:bg-red-500 
                   transition-all duration-300 transform group-hover:scale-110"
      >
        <FaSignOutAlt
          className="text-lg text-gray-600 group-hover:text-white 
                     transition-transform duration-300"
        />
      </div>
      {isOpen && <span className="font-medium text-base">Logout</span>}
    </button>
  );
}

export default function Sidebar({ isOpen }) {
  
  const [openMenu, setOpenMenu] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);


  useEffect(() => {
  const userData = localStorage.getItem("user");
  if (userData) {
    setCurrentUser(JSON.parse(userData));
  }
}, []);

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const isActiveLink = (path) => pathname === path;
  const hasActiveSublink = (subLinks) => 
    subLinks?.some(sublink => pathname === sublink.path);

      const links = [
        { 
          name: "Dashboard", 
          path: "/dashboard/owner", 
          icon: <FaTachometerAlt />,
          color: "blue"
        },

        {
          name: "User Management",
          icon: <FaUsers />,
          color: "green",
          subLinks: [
            { name: "Technicians", path: "/dashboard/owner/technicians" },
            { name: "Users", path: "/dashboard/owner/users" },
          ],
        },

        {
          name: "Services Management",
          icon: <FaTools />,
          color: "purple",
          subLinks: [
            { name: "Services", path: "/dashboard/owner/services" },
            { name: "Service Packages", path: "/dashboard/owner/services/service-packages" },
          ],
        },

          {
            name: "Vehicles Management",
            icon: <FaCar  />,
            color: "yellow",
            subLinks: [
              { name: "Vehicles", path: "/dashboard/owner/vehicles" },
              { name: "Register Vehicle", path: "/dashboard/owner/vehicles/register" },
            ],
          },
 
        // 🔹 Booking Section
        {
          name: "Booking",
          icon: <FaClipboardList />,
          color: "yellow",
          subLinks: [
            { name: "Bookings", path: "/dashboard/owner/bookings" },
            { name: "Quotations", path: "/dashboard/owner/quotations" },
            { name: "Contracts", path: "/dashboard/owner/contracts" },
            { name: "Schedules", path: "/dashboard/owner/technician-schedules" }, // ✅ added schedule
          ],
        },

        // 🔹 Jobs Section
        {
          name: "Jobs",
          icon: <FaTasks />,
          color: "red",
          subLinks: [
            { name: "Service Jobs", path: "/dashboard/owner/service-jobs" },
            { name: "Task / Workflow", path: "/dashboard/owner/tasks" },
          ],
        },

        {
          name: "Finance",
          icon: <FaFileInvoiceDollar />,
          color: "orange",
          subLinks: [
            { name: "Payments / Billing", path: "/dashboard/owner/payments" },
          ],
        },

        {
          name: "Inventory",
          icon: <FaBoxes />,
          color: "teal",
          subLinks: [
            { name: "Parts", path: "/dashboard/owner/inventory" },
            { name: "Stock In/Out", path: "/dashboard/owner/stock" },
          ],
        },
      ];

  const getColorClasses = (color, isActive = false, isHovered = false) => {
    const colors = {
      blue: {
        bg: isActive ? "bg-blue-100" : isHovered ? "bg-blue-50" : "",
        text: isActive ? "text-blue-700" : isHovered ? "text-blue-600" : "text-gray-700",
        icon: isActive ? "text-blue-600" : isHovered ? "text-blue-500" : "text-gray-500",
        border: isActive ? "border-r-3 border-blue-600" : ""
      },
      green: {
        bg: isActive ? "bg-emerald-100" : isHovered ? "bg-emerald-50" : "",
        text: isActive ? "text-emerald-700" : isHovered ? "text-emerald-600" : "text-gray-700",
        icon: isActive ? "text-emerald-600" : isHovered ? "text-emerald-500" : "text-gray-500",
        border: isActive ? "border-r-3 border-emerald-600" : ""
      },
      purple: {
        bg: isActive ? "bg-purple-100" : isHovered ? "bg-purple-50" : "",
        text: isActive ? "text-purple-700" : isHovered ? "text-purple-600" : "text-gray-700",
        icon: isActive ? "text-purple-600" : isHovered ? "text-purple-500" : "text-gray-500",
        border: isActive ? "border-r-3 border-purple-600" : ""
      },
      orange: {
        bg: isActive ? "bg-orange-100" : isHovered ? "bg-orange-50" : "",
        text: isActive ? "text-orange-700" : isHovered ? "text-orange-600" : "text-gray-700",
        icon: isActive ? "text-orange-600" : isHovered ? "text-orange-500" : "text-gray-500",
        border: isActive ? "border-r-3 border-orange-600" : ""
      }
    };
    return colors[color] || colors.blue;
  };

  useEffect(() => {
    const currentPath = pathname;
    links.forEach(link => {
      if (link.subLinks) {
        const hasActiveSublink = link.subLinks.some(sublink => 
          currentPath === sublink.path
        );
        if (hasActiveSublink && openMenu !== link.name) {
          setOpenMenu(link.name);
        }
      }
    });
  }, [pathname]);

  return (
    <aside
      className={`${isOpen ? "w-72" : "w-16"} h-screen bg-gradient-to-b from-white to-gray-50 shadow-xl transition-all duration-300 overflow-hidden flex flex-col border-r border-gray-200`}
    >
      {/* Header */}
      <div className="px-4 py-6 flex items-center justify-center border-b border-gray-200 bg-white">
        {isOpen ? (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <span className="text-white font-bold text-xl tracking-tight relative z-10">2L</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                2LOY
              </h2>
              <p className="text-xs text-gray-500">Admin Management Portal</p>
            </div>
          </div>
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <span className="text-white font-bold text-xl tracking-tight relative z-10">2L</span>
          </div>
        )}
      </div>

{/* User Profile Section */}
{isOpen && (
  <div className="px-4 py-4 bg-white border-b border-gray-100">
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
      <FaUserCircle className="text-2xl text-gray-400" />
      <div className="flex-1 min-w-0">
        {currentUser && (
          <p className="font-medium text-gray-900 text-sm truncate">
            {currentUser.firstName && currentUser.lastName
              ? `${currentUser.firstName} ${currentUser.lastName}`
              : currentUser.username || "User"}
          </p>
        )}
        <p className="text-xs text-gray-500 truncate">
          Owner System Administrator
        </p>
      </div>

      {/* 🔔 Notification button */}
      <button className="ml-auto p-2 hover:bg-slate-700/50 rounded-xl transition-colors">
        <FaBell className="text-slate-400 hover:text-white transition-colors" />
      </button>
    </div>
  </div>
)}
      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link, idx) => {
          const isActive = link.path ? isActiveLink(link.path) : hasActiveSublink(link.subLinks);
          const isHovered = hoveredItem === link.name;
          const colorClasses = getColorClasses(link.color, isActive, isHovered);

          return (
            <div key={idx} className="relative">
              {link.subLinks ? (
                <>
                  <button
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${colorClasses.bg} ${colorClasses.border}`}
                    onClick={() => toggleMenu(link.name)}
                    onMouseEnter={() => setHoveredItem(link.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`text-lg transition-colors ${colorClasses.icon}`}>
                        {link.icon}
                      </span>
                      {isOpen && (
                        <span className={`font-medium transition-colors ${colorClasses.text}`}>
                          {link.name}
                        </span>
                      )}
                    </div>
                    {isOpen && (
                      <span className={`transition-transform duration-200 ${colorClasses.text} ${openMenu === link.name ? 'rotate-180' : ''}`}>
                        <FaChevronDown className="text-sm" />
                      </span>
                    )}
                  </button>

                  {/* Submenu */}
                  <div className={`overflow-hidden transition-all duration-300 ${openMenu === link.name && isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="ml-6 mt-2 space-y-1 border-l-2 border-gray-100 pl-4">
                      {link.subLinks.map((sublink, sidx) => (
                        <Link
                          key={sidx}
                          href={sublink.path}
                          className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isActiveLink(sublink.path)
                              ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600 -ml-6 pl-8'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {sublink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={link.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${colorClasses.bg} ${colorClasses.border}`}
                  onMouseEnter={() => setHoveredItem(link.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className={`text-lg transition-colors ${colorClasses.icon}`}>
                    {link.icon}
                  </span>
                  {isOpen && <span className={`font-medium transition-colors ${colorClasses.text}`}>{link.name}</span>}
                </Link>
              )}

              {/* Tooltip for collapsed sidebar */}
              {!isOpen && isHovered && (
                <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-50 opacity-95">
                  {link.name}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-gray-200 bg-white space-y-2">
        {/* Settings */}
        <button className="group w-full flex items-center space-x-4 px-4 py-3 rounded-2xl text-gray-600 bg-white hover:bg-blue-600 hover:text-white transition-all duration-300 border border-transparent hover:border-blue-500">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 group-hover:bg-blue-500 transition-all duration-300">
            <FaCog className="text-lg transition-transform duration-300 group-hover:rotate-90 group-hover:text-white" />
          </div>
          {isOpen && <span className="font-medium text-base">Settings</span>}
        </button>


            
            {/* Logout */}
        <LogoutButton isOpen={isOpen} className="w-full" />

        {/* <Link href="/landing-page">
          <button className="group w-full flex items-center space-x-4 px-4 py-3 
                            rounded-2xl text-gray-600 bg-white 
                            hover:bg-red-600 hover:text-white 
                            transition-all duration-300 transform hover:scale-[1.02]
                            border border-transparent hover:border-red-500 hover:shadow-md hover:shadow-red-200/50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center 
                            bg-gray-100 group-hover:bg-red-500 
                            transition-all duration-300 transform group-hover:scale-110">
              <FaSignOutAlt className="text-lg text-gray-600 group-hover:text-white 
                                      transition-transform duration-300" />
            </div>
            {isOpen && <span className="font-medium text-base">Logout</span>}
          </button>
        </Link> */}
        {/* <LogoutButton isOpen={isOpen} /> */}

        {/* Copyright */}
        {isOpen && (
          <div className="px-3 pt-4 text-center">
            <p className="text-xs text-gray-400">© 2025 Lawrence Gonzaga</p>
            <p className="text-xs text-gray-400">All rights reserved</p>
          </div>
        )}
      </div>
    </aside>
  );
}














