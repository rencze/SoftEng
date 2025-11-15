"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaBoxOpen, FaTimes, FaSearch, FaFileAlt, FaCube } from "react-icons/fa";

const API_URL = "http://localhost:3001/api/service-packages";

export default function ServicesPackagePage() {
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
  const [editingPackage, setEditingPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [packageData, setPackageData] = useState({
    packageName: "",
    packageDescription: "",
  });

  // Load packages on mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(API_URL);
      setPackages(res.data);
    } catch (err) {
      console.error("Error fetching packages:", err);
      // Fallback sample data
      setPackages([
        {
          servicePackageId: 1,
          packageName: "Basic Package",
          packageDescription: "Includes aircon cleaning and freon refill.",
        },
        {
          servicePackageId: 2,
          packageName: "Premium Package",
          packageDescription: "Full diagnostics, cleaning, and freon refill.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Modal
  const openModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPackageData({
        packageName: pkg.packageName || "",
        packageDescription: pkg.packageDescription || pkg.description || "",
      });
    } else {
      setEditingPackage(null);
      setPackageData({ 
        packageName: "", 
        packageDescription: "", 
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingPackage(null);
      setPackageData({ 
        packageName: "", 
        packageDescription: "", 
      });
    }, 300);
  };

  // Handle Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPackageData((prev) => ({ ...prev, [name]: value }));
  };

  // Save Package
  const savePackage = async () => {
    try {
      const payload = {
        packageName: packageData.packageName,
        packageDescription: packageData.packageDescription,
      };

      if (editingPackage) {
        const id = editingPackage.servicePackageId || editingPackage.packageId;
        await axios.put(`${API_URL}/${id}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }

      fetchPackages();
      closeModal();
    } catch (err) {
      console.error("Error saving package:", err);
      alert("Error saving package. Please check the console for details.");
    }
  };

  // Delete Package
  const deletePackage = async (pkg) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const id = pkg.servicePackageId || pkg.packageId;
      await axios.delete(`${API_URL}/${id}`);
      fetchPackages();
    } catch (err) {
      console.error("Error deleting package:", err);
      alert("Error deleting package. Please check the console for details.");
    }
  };

  // Filter Packages
  const filteredPackages = packages.filter((pkg) => {
    const name = pkg.packageName || "";
    const description = pkg.packageDescription || pkg.description || "";
    const searchTerm = search.toLowerCase();
    return name.toLowerCase().includes(searchTerm) || description.toLowerCase().includes(searchTerm);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Service Packages</h1>
          <p className="text-gray-600 flex items-center">
            <FaBoxOpen className="mr-2" />
            {filteredPackages.length} of {packages.length} packages
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg font-medium"
        >
          <FaPlus className="mr-2" /> Add Package
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search packages by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-pulse text-gray-500">Loading packages...</div>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPackages.length > 0 ? (
                  filteredPackages.map((pkg) => (
                    <tr key={pkg.servicePackageId || pkg.packageId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FaBoxOpen className="text-blue-500 mr-3" />
                          <span className="font-medium text-gray-800">
                            {pkg.packageName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {pkg.packageDescription || pkg.description || "No description provided"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openModal(pkg)}
                            className="text-blue-600 hover:text-blue-800 p-2 transition-colors rounded-lg hover:bg-blue-50"
                            title="Edit Package"
                          >
                            <FaEdit size={16} />
                          </button>
                          {false && (
                            <button
                              onClick={() => deletePackage(pkg)}
                              className="text-red-600 hover:text-red-800 p-2 transition-colors rounded-lg hover:bg-red-50"
                              title="Delete Package"
                            >
                              <FaTrash size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <FaBoxOpen className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
                        <p className="text-gray-500">
                          {search ? "Try adjusting your search criteria" : "Get started by adding your first package"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Improved Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingPackage ? "Edit Package" : "Create New Package"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <p className="text-blue-100 mt-2">
                {editingPackage 
                  ? "Update package information" 
                  : "Bundle services together for special offers"
                }
              </p>
            </div>

            {/* Form */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Package Name */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <FaCube className="mr-2 text-blue-600" />
                    Package Name *
                  </label>
                  <input
                    type="text"
                    name="packageName"
                    value={packageData.packageName}
                    onChange={handleChange}
                    placeholder="Enter package name"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <FaFileAlt className="mr-2 text-blue-600" />
                    Description
                  </label>
                  <textarea
                    name="packageDescription"
                    value={packageData.packageDescription}
                    onChange={handleChange}
                    placeholder="Describe what services are included in this package, pricing, and any special features..."
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Clear descriptions help customers understand the value of your package
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={savePackage}
                  disabled={!packageData.packageName}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {editingPackage ? "Update Package" : "Create Package"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}