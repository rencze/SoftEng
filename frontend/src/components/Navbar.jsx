// src/components/Navbar.jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Phone, User, UserPlus, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { name: "Home", section: "home" },
    { name: "About", section: "about" },
    { name: "Services", section: "services" },
    { name: "Reviews", section: "testimonials" },
    { name: "FAQ", section: "faq" },
  ];

  // Smooth scroll helper
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  };

  // Handle navigation and scroll
  const handleNavClick = (section) => {
    if (window.location.pathname === "/") {
      // Already on landing page → scroll directly
      scrollToSection(section);
    } else {
      // Navigate back to landing page, then scroll to section
      router.push(`/#${section}`);

      // Retry scrolling after page transition
      setTimeout(() => {
        const tryScroll = () => {
          const element = document.getElementById(section);
          if (element) {
            scrollToSection(section);
          } else {
            setTimeout(tryScroll, 100);
          }
        };
        tryScroll();
      }, 300);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100 z-50 transition-all duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center space-x-4 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-16 h-16 relative">
            <img src="/system-logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.section)}
              className="relative px-3 py-2 text-gray-700 font-medium hover:text-blue-600 transition-all duration-300 group"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </nav>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <button
            className="hidden sm:flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
            onClick={() => router.push("/booking")}
          >
            <Phone className="w-4 h-4 mr-2" />
            Book Service
          </button>

          <Link href="/auth/login">
            <button className="hidden sm:flex items-center px-6 py-3 bg-white text-blue-600 font-semibold border border-blue-600 rounded-lg hover:bg-blue-50 transition-all">
              <User className="w-4 h-4 mr-2" />
              Login
            </button>
          </Link>

          <Link href="/auth/register">
            <button className="hidden sm:flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all">
              <UserPlus className="w-4 h-4 mr-2" />
              Register
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden flex items-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 p-4 bg-white rounded-xl shadow-xl border border-gray-100">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  handleNavClick(item.section);
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-3 text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
              >
                {item.name}
              </button>
            ))}
            <button
              className="mt-3 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                setMobileMenuOpen(false);
                router.push("/booking");
              }}
            >
              Book Service
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
