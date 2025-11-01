"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../../../components/sidebar";
import { FaUserCircle, FaBell } from "react-icons/fa";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";


export default function OwnerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const { user } = useAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(e.target)) {
        setNotificationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user's full name
  const getUserName = () => {
    if (!user) return "Owner Name";
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.name) {
      return user.name;
    } else if (user.username) {
      return user.username;
    }
    
    return "Owner Name";
  };

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col">
        <nav className="flex items-center justify-between bg-white p-4 shadow">
          {/* Hamburger */}
          <button
            className="text-2xl font-bold"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          {/* Right side items */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => {
                  setNotificationDropdownOpen(!notificationDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
              >
                <FaBell className="text-xl" />
                {/* Notification badge - optional */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Notification Dropdown */}
              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-20 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  
                  {/* Notification items */}
                  <div className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <p className="text-sm text-gray-700">New booking request received</p>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  
                  <div className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                    <p className="text-sm text-gray-700">Payment received for service #123</p>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                  
                  <div className="p-2 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-700">New review for your service</p>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>

                  {/* View all notifications link */}
                  <div className="p-3 border-t border-gray-100">
                    <Link 
                      href="/dashboard/owner/notifications" 
                      className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View All Notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationDropdownOpen(false);
                }}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
              >
                <FaUserCircle className="text-2xl text-gray-700" />
                <span className="font-medium text-gray-800">
                  {getUserName()}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{getUserName()}</p>
                    <p className="text-xs text-gray-500">{user?.email || "Owner"}</p>
                  </div>
                  
                  <Link
                    href="/dashboard/owner/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/owner/bookings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    My Booking
                  </Link>
                  <Link
                    href="/dashboard/owner/service-job"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    My Service Job
                  </Link>
                  <Link
                    href="/dashboard/owner/payment"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Payment
                  </Link>
                  
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => {
                        // Add logout logic here
                        setProfileDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-1 p-6 bg-gray-50 overflow-auto">{children}</main>
      </div>
    </div>
  );
}