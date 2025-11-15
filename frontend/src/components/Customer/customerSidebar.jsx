"use client";
import { FaUser, FaShieldAlt, FaPalette, FaBook, FaWrench, FaCreditCard, FaCar, FaFileInvoice } from "react-icons/fa";

export default function CustomerSideBar({ user, activeTab, setActiveTab }) {
  const tabs = [
    { key: "profile", label: "Profile Information", icon: <FaUser /> },
    { key: "security", label: "Security & Password", icon: <FaShieldAlt /> },
    { key: "myBooking", label: "My Booking", icon: <FaBook /> },
    { key: "myServiceJob", label: "My Service Job", icon: <FaWrench /> },
    { key: "myPayment", label: "My Payment", icon: <FaCreditCard /> },
    { key: "carProfile", label: "Car Profile", icon: <FaCar /> },
    { key: "quotation", label: "Quotation", icon: <FaFileInvoice /> }
  ];

  return (
    <div className="lg:col-span-1">
      {/* User Card */}
      <div className="mt-8 p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
            <span className="font-bold text-lg">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
            <p className="text-blue-100 text-sm">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8 space-y-2 mt-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className={`${activeTab === tab.key ? "text-blue-600" : "text-gray-400"}`}>
              {tab.icon}
            </span>
            <span className="ml-3 font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}