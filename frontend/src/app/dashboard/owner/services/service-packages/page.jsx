"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaBoxOpen, FaTimes, FaSearch } from "react-icons/fa";

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
    packagePrice: ""
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
          packagePrice: 2500
        },
        {
          servicePackageId: 2,
          packageName: "Premium Package",
          packageDescription: "Full diagnostics, cleaning, and freon refill.",
          packagePrice: 4000
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format PHP Currency
  const formatCurrency = (value) => {
    if (!value) return "₱0.00";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Open Modal
  const openModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPackageData({
        packageName: pkg.packageName || "",
        packageDescription: pkg.packageDescription || pkg.description || "",
        packagePrice: pkg.packagePrice || pkg.price || ""
      });
    } else {
      setEditingPackage(null);
      setPackageData({ 
        packageName: "", 
        packageDescription: "", 
        packagePrice: "" 
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
        packagePrice: "" 
      });
    }, 300);
  };

  // Handle Input
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "packagePrice") {
      // Prevent negative numbers
      if (Number(value) < 0) return;
    }

    setPackageData((prev) => ({ ...prev, [name]: value }));
  };

  // Save Package
  const savePackage = async () => {
    if (Number(packageData.packagePrice) < 0) {
      alert("Price cannot be negative");
      return;
    }

    try {
      const payload = {
        packageName: packageData.packageName,
        packageDescription: packageData.packageDescription,
        packagePrice: Number(packageData.packagePrice)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Service Packages</h1>
          <p className="text-gray-600">Manage bundled service packages</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
        >
          <FaPlus className="mr-2" /> Add Package
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-4 shadow-sm">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search packages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg pl-10 pr-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button
          onClick={() => setSearch("")}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
        >
          Clear
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-pulse text-gray-500">Loading packages...</div>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Package Name</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Description</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Price</th>
                <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <tr key={pkg.servicePackageId || pkg.packageId} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 flex items-center gap-2 font-semibold text-gray-800">
                      <FaBoxOpen className="text-purple-500" /> {pkg.packageName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {pkg.packageDescription || pkg.description}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-medium">
                      {formatCurrency(pkg.packagePrice || pkg.price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openModal(pkg)}
                          className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50"
                          title="Edit package"
                        >
                          <FaEdit />
                        </button>
                    {false && (    <button
                          onClick={() => deletePackage(pkg)}
                          className="text-red-600 hover:text-red-800 transition p-1 rounded-full hover:bg-red-50"
                          title="Delete package"
                        >
                          <FaTrash />
                        </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-500">
                    {search ? "No packages match your search" : "No packages found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingPackage ? "Edit Package" : "Add Package"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Name
                </label>
                <input
                  type="text"
                  name="packageName"
                  placeholder="e.g., Premium Maintenance"
                  value={packageData.packageName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="packageDescription"
                  placeholder="Describe what this package includes..."
                  value={packageData.packageDescription}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₱)
                </label>
                  <input
                    type="number"
                    name="packagePrice"
                    placeholder="0.00"
                    value={packageData.packagePrice}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      // Block "-" and "e"
                      if (e.key === "-" || e.key === "e") e.preventDefault();
                    }}
                    onPaste={(e) => {
                      const paste = e.clipboardData.getData("text");
                      // Only allow digits and at most one dot
                      const validPattern = /^\d*\.?\d*$/;
                      if (!validPattern.test(paste)) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                    step="0.01"
                  />



                {/* <input
                  type="number"
                  name="packagePrice"
                  placeholder="0.00"
                  value={packageData.packagePrice}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    // Block "-" and "e"
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                  onPaste={(e) => {
                    const paste = e.clipboardData.getData("text");
                    if (Number(paste) < 0) e.preventDefault();
                  }}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  min="0"
                  step="0.01"
                /> */}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={savePackage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              >
                {editingPackage ? "Update" : "Create"} Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}