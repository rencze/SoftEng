"use client";
import { FaSave } from "react-icons/fa";

export default function CarTab() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Car Profile</h2>
      <p className="text-gray-600 mb-4">Manage your car details here.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Car Make</label>
          <input
            type="text"
            className="px-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., Toyota"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Car Model</label>
          <input
            type="text"
            className="px-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., Corolla"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <input
            type="number"
            className="px-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., 2020"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
          <input
            type="text"
            className="px-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., ABC-1234"
          />
        </div>
      </div>

      <button className="mt-6 flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
        <FaSave className="mr-2" />
        Save Car Profile
      </button>
    </div>
  );
}