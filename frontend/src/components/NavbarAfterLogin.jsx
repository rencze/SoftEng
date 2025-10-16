"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function NavbarAfterLogin({ user }) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/"); // back to landing page
  };

  // Display name: first + last name, fallback to username
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user.username;

  // 🟢 FIXED: Handle navigation for Home, About, Services, etc.
  const handleNavClick = (section) => {
    if (window.location.pathname === "/") {
      // Already on landing page → smooth scroll
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Navigate to landing page and then scroll to section
      router.push(`/#${section}`);
      
      // Wait for navigation to complete, then scroll to section
      setTimeout(() => {
        const scrollToSection = () => {
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          } else {
            // If element not found yet, try again
            setTimeout(scrollToSection, 100);
          }
        };
        
        // Start trying to scroll after a short delay
        setTimeout(scrollToSection, 300);
      }, 100);
    }
  };

  // Alternative approach: Use a more reliable scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 100; // Adjust for header height
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      });
    }
  };

  // Updated handleNavClick with better approach
  const handleNavClickImproved = (section) => {
    if (window.location.pathname === "/") {
      scrollToSection(section);
    } else {
      router.push(`/#${section}`);
      // The landing page should handle the hash scroll on load
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          className="relative w-16 h-16 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <img
            src="/system-logo.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center space-x-8">
          {["home", "about", "services", "testimonials", "faq"].map((item) => (
            <button
              key={item}
              onClick={() => handleNavClickImproved(item)}
              className="relative px-3 py-2 text-gray-700 font-medium hover:text-blue-600 transition-all duration-300 group"
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {displayName}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  profileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="w-4 h-4 mr-2" /> Profile
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-md">
          <nav className="flex flex-col px-6 py-4 space-y-4">
            {["home", "about", "services", "testimonials", "faq"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  handleNavClickImproved(item);
                  setMobileMenuOpen(false);
                }}
                className="text-gray-700 text-left font-medium hover:text-blue-600 transition-all"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}

            <div className="border-t border-gray-100 my-2"></div>

            <Link
              href="/profile"
              className="text-gray-700 font-medium hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="text-red-600 font-medium text-left hover:text-red-700"
            >
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
