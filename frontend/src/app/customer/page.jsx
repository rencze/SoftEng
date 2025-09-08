// src/app/customer/page.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  FiHome, 
  FiCalendar, 
  FiSettings, 
  FiUser, 
  FiLogOut, 
  FiArrowRight,
  FiMenu,
  FiX,
  FiClock,
  FiStar,
  FiShield
} from "react-icons/fi";

export default function CustomerLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation Bar */}
      <nav className="w-full flex items-center justify-between px-4 sm:px-8 py-4 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {/* Logo */}
          <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            L
          </div>
          <span className="font-bold text-xl text-gray-900 hidden sm:block">LuxeService</span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <Link href="/" className="flex items-center hover:text-blue-700 transition-colors">
            <FiHome className="mr-1" /> Home
          </Link>
          <Link href="/booking" className="flex items-center hover:text-blue-700 transition-colors">
            <FiCalendar className="mr-1" /> Booking
          </Link>
          <Link href="/services" className="flex items-center hover:text-blue-700 transition-colors">
            <FiSettings className="mr-1" /> Services
          </Link>
          <Link href="/profile" className="flex items-center hover:text-blue-700 transition-colors">
            <FiUser className="mr-1" /> Profile
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-4 px-6 absolute w-full z-10">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="flex items-center text-gray-700 py-2 hover:text-blue-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiHome className="mr-3" /> Home
            </Link>
            <Link 
              href="/booking" 
              className="flex items-center text-gray-700 py-2 hover:text-blue-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiCalendar className="mr-3" /> Booking
            </Link>
            <Link 
              href="/services" 
              className="flex items-center text-gray-700 py-2 hover:text-blue-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiSettings className="mr-3" /> Services
            </Link>
            <Link 
              href="/profile" 
              className="flex items-center text-gray-700 py-2 hover:text-blue-700 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiUser className="mr-3" /> Profile
            </Link>
            <div className="border-t border-gray-200 pt-4 mt-2">
              <Link 
                href="/auth/login" 
                className="flex items-center text-red-600 py-2 hover:text-red-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiLogOut className="mr-3" /> Log Out
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-16 lg:py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Welcome to Your <span className="text-blue-700">Customer Portal</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Manage your bookings, explore our services, and update your profile—all in one convenient place designed for your needs.
            </p>
          </div>
          
          {/* Stats/Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 mb-4 mx-auto">
                <FiCalendar size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Booking</h3>
              <p className="text-gray-600 text-sm">Schedule appointments in just a few clicks</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 mb-4 mx-auto">
                <FiSettings size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Services Catalog</h3>
              <p className="text-gray-600 text-sm">Explore our wide range of offerings</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 mb-4 mx-auto">
                <FiUser size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Profile Management</h3>
              <p className="text-gray-600 text-sm">Update your preferences and details</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link
              href="/dashboard/login"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg shadow-sm transition-all duration-300 flex items-center justify-center group"
            >
              Go to Booking
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-all duration-300"
            >
              Log Out
            </Link>
          </div>
        </div>
      </main>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar key={star} className="text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">"The booking process was incredibly smooth and the service was exceptional."</p>
              <p className="text-gray-900 font-medium">- Sarah Johnson</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar key={star} className="text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">"I love how easy it is to manage all my appointments in one place."</p>
              <p className="text-gray-900 font-medium">- Michael Chen</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar key={star} className="text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">"Professional service with attention to detail. Highly recommended!"</p>
              <p className="text-gray-900 font-medium">- Emily Rodriguez</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-4 mx-auto">
                <FiClock size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Availability</h3>
              <p className="text-gray-600">Book services anytime, from anywhere with our online platform</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-4 mx-auto">
                <FiStar size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">We maintain the highest standards for all our services</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-4 mx-auto">
                <FiShield size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">Your transactions are protected with industry-leading security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">LuxeService</h3>
            <p className="text-gray-400 text-sm">
              Providing premium services with excellence and care for all our valued customers.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Services</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Appointment Booking</li>
              <li>Service Management</li>
              <li>Account Settings</li>
              <li>Payment History</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>support@luxeservice.com</li>
              <li>+1 (555) 123-4567</li>
              <li>9AM - 5PM, Mon to Fri</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} LuxeService. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


// // src/app/customer/page.jsx
// "use client";

// import React from "react";
// import Link from "next/link"; // for navigation

// export default function CustomerLanding() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col">
      
//       {/* Navbar / Logo */}
//       <nav className="w-full flex items-center justify-between px-8 py-4 bg-white shadow-md">
//         <div className="flex items-center space-x-3">
//           {/* Logo */}
//           <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
//             L
//           </div>
//           <span className="font-bold text-xl text-blue-900">MyService</span>
//         </div>
//         <div className="flex space-x-6 text-blue-700 font-semibold">
//           <Link href="/">Home</Link>
//           <Link href="/booking">Booking</Link>
//           <Link href="/services">Services</Link>
//           <Link href="/profile">Profile</Link>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center space-y-6">
//         <h1 className="text-5xl font-bold text-blue-900">
//           Welcome, Customer!
//         </h1>
//         <p className="text-lg text-blue-800 max-w-xl">
//           Manage your bookings, view services, and keep track of your profile all in one place.
//         </p>
        
//         {/* Go to Booking Button */}
//         <Link
//           href="/dashboard/login"
//           className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition transform hover:scale-105"
//         >
//           Go to Booking
//         </Link>

//         {/* Logout Button */}
//         <Link
//           href="/auth/login"
//           className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition transform hover:scale-105"
//         >
//           Log Out
//         </Link>
//       </div>
//     </div>
//   );
// }

