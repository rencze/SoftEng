// src/components/Navbar.jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Phone, User, UserPlus, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Reviews", href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100 z-50 transition-all duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 relative">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="relative px-3 py-2 text-gray-700 font-medium hover:text-blue-600 transition-all duration-300 group"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <button className="hidden sm:flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105">
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
              <a
                key={item.name}
                href={item.href}
                className="px-4 py-3 text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <button className="mt-3 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Book Service
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}



// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import {
//   ChevronDown,
//   Phone,
//   Menu,
//   X,
//   User,
//   UserPlus,
//   LogOut,
//   Settings,
//   Calendar,
//   FileText,
// } from "lucide-react";

// const Navbar = ({ user = null, onLogout = () => {} }) => {
//   const pathname = usePathname();
//   const router = useRouter();

//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
//   const [currentUser, setCurrentUser] = useState(user);

//   // Check if on auth page
//   const isAuthPage = pathname.startsWith("/auth");

//   // Update currentUser when user prop changes
//   useEffect(() => {
//     setCurrentUser(user);
//   }, [user]);

//   // Load user from localStorage
//   useEffect(() => {
//     const savedUser = localStorage.getItem("user");
//     if (savedUser && !currentUser) {
//       setCurrentUser(JSON.parse(savedUser));
//     }
//   }, [currentUser]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (profileDropdownOpen && !event.target.closest(".profile-dropdown")) {
//         setProfileDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [profileDropdownOpen]);

//   const handleLogoutClick = () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     setCurrentUser(null);
//     setProfileDropdownOpen(false);
//     onLogout();
//     router.push("/"); // back to landing page
//   };

//   return (
//     <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100 z-50 transition-all duration-300">
//       <div className="container mx-auto px-6 py-4 flex justify-between items-center">
//         {/* Logo */}
//         <div className="relative w-16 h-16">
//           <img
//             src="/logo.png"
//             alt="Logo"
//             className="w-full h-full object-contain"
//           />
//         </div>

//         {/* Navigation (hidden on auth pages) */}
//         {!isAuthPage && (
//           <>
//             {/* Desktop menu */}
//             <nav className="hidden lg:flex items-center space-x-8">
//               {[
//                 { name: "Home", href: "#home" },
//                 { name: "About", href: "#about" },
//                 { name: "Services", href: "#services" },
//                 { name: "Reviews", href: "#testimonials" },
//                 { name: "FAQ", href: "#faq" },
//               ].map((item) => (
//                 <a
//                   key={item.name}
//                   href={item.href}
//                   className="relative px-3 py-2 text-gray-700 font-medium hover:text-blue-600 transition-all duration-300 group"
//                 >
//                   {item.name}
//                   <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
//                 </a>
//               ))}
//             </nav>

//             {/* Auth / Profile */}
//             <div className="flex items-center space-x-4">
//               {currentUser ? (
//                 /* ✅ Logged in */
//                 <div className="relative profile-dropdown">
//                   <button
//                     className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
//                     onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
//                   >
//                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                       <User className="w-5 h-5 text-blue-600" />
//                     </div>
//                     <div className="hidden md:block text-left">
//                       <p className="text-sm font-medium text-gray-900">
//                         {currentUser.name}
//                       </p>
//                       <p className="text-xs text-gray-500 capitalize">
//                         {currentUser.role}
//                       </p>
//                     </div>
//                     <ChevronDown
//                       className={`w-4 h-4 text-gray-500 transition-transform ${
//                         profileDropdownOpen ? "rotate-180" : ""
//                       }`}
//                     />
//                   </button>

//                   {profileDropdownOpen && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
//                       <Link
//                         href="/profile"
//                         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                         onClick={() => setProfileDropdownOpen(false)}
//                       >
//                         <User className="w-4 h-4 mr-2" />
//                         Profile
//                       </Link>

//                       {currentUser.role === "customer" && (
//                         <>
//                           <Link
//                             href="/bookings"
//                             className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                             onClick={() => setProfileDropdownOpen(false)}
//                           >
//                             <Calendar className="w-4 h-4 mr-2" />
//                             My Bookings
//                           </Link>
//                           <Link
//                             href="/quotations"
//                             className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                             onClick={() => setProfileDropdownOpen(false)}
//                           >
//                             <FileText className="w-4 h-4 mr-2" />
//                             Quotations
//                           </Link>
//                         </>
//                       )}

//                       {currentUser.role === "technician" && (
//                         <Link
//                           href="/dashboard"
//                           className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                           onClick={() => setProfileDropdownOpen(false)}
//                         >
//                           <Settings className="w-4 h-4 mr-2" />
//                           Dashboard
//                         </Link>
//                       )}

//                       <div className="border-t border-gray-100 my-1"></div>

//                       <button
//                         className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
//                         onClick={handleLogoutClick}
//                       >
//                         <LogOut className="w-4 h-4 mr-2" />
//                         Sign Out
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 /* ❌ Not logged in */
//                 <>
//                   <Link href="/auth/login">
//                     <button className="hidden sm:flex items-center px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg shadow hover:bg-blue-50">
//                       <User className="w-4 h-4 mr-2" />
//                       Login
//                     </button>
//                   </Link>
//                   <Link href="/auth/register">
//                     <button className="hidden sm:flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
//                       <UserPlus className="w-4 h-4 mr-2" />
//                       Register
//                     </button>
//                   </Link>
//                 </>
//               )}

//               {/* Mobile menu button */}
//               <button
//                 className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               >
//                 {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Navbar;
