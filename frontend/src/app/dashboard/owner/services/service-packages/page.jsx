// src/app/dashboard/owner/services-package/page.jsx
"use client";

import { useState } from "react";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaBoxOpen 
} from "react-icons/fa";

export default function ServicesPackagePage() {
  const [packages, setPackages] = useState([
    {
      packageId: 1,
      packageName: "Basic Package",
      description: "Includes aircon cleaning and freon refill.",
      price: 2500,
      includedServices: ["Aircon Cleaning", "Freon Refill"]
    },
    {
      packageId: 2,
      packageName: "Premium Package",
      description: "Full diagnostics, cleaning, and freon refill.",
      price: 4000,
      includedServices: ["Full Diagnostics", "Aircon Cleaning", "Freon Refill"]
    },
  ]);

  const [search, setSearch] = useState("");
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageData, setPackageData] = useState({
    packageName: "",
    description: "",
    price: "",
    includedServices: ""
  });

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
        packageName: pkg.packageName,
        description: pkg.description,
        price: pkg.price,
        includedServices: pkg.includedServices.join(", ")
      });
    } else {
      setEditingPackage(null);
      setPackageData({ packageName: "", description: "", price: "", includedServices: "" });
    }
  };

  // Handle Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPackageData((prev) => ({ ...prev, [name]: value }));
  };

  // Save Package
  const savePackage = () => {
    const servicesArray = packageData.includedServices
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    if (editingPackage) {
      setPackages(packages.map((p) =>
        p.packageId === editingPackage.packageId 
          ? { ...p, ...packageData, price: Number(packageData.price), includedServices: servicesArray }
          : p
      ));
      setEditingPackage(null);
    } else {
      const newPackage = {
        packageId: Date.now(),
        ...packageData,
        price: Number(packageData.price),
        includedServices: servicesArray
      };
      setPackages([...packages, newPackage]);
    }
    setPackageData({ packageName: "", description: "", price: "", includedServices: "" });
  };

  // Delete Package
  const deletePackage = (id) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    setPackages(packages.filter((p) => p.packageId !== id));
  };

  // Filter Packages
  const filteredPackages = packages.filter((p) =>
    p.packageName.toLowerCase().includes(search.toLowerCase())
  );

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
        <input
          type="text"
          placeholder="🔍 Search package..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={() => setSearch("")}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Package Name</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Description</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Included Services</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Price</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPackages.map((pkg) => (
              <tr key={pkg.packageId} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 flex items-center gap-2 font-semibold text-gray-800">
                  <FaBoxOpen className="text-purple-500" /> {pkg.packageName}
                </td>
                <td className="px-6 py-4 text-gray-600">{pkg.description}</td>
                <td className="px-6 py-4 text-gray-600">{pkg.includedServices.join(", ")}</td>
                <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(pkg.price)}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => openModal(pkg)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deletePackage(pkg.packageId)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPackages.length === 0 && (
          <div className="text-center py-12 text-gray-500">No packages found</div>
        )}
      </div>

      {/* Modal */}
      {(editingPackage || packageData.packageName !== "") && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingPackage ? "Edit Package" : "Add Package"}
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                name="packageName"
                placeholder="Package Name"
                value={packageData.packageName}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={packageData.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                name="includedServices"
                placeholder="Included Services (comma-separated)"
                value={packageData.includedServices}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={packageData.price}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingPackage(null);
                  setPackageData({ packageName: "", description: "", price: "", includedServices: "" });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={savePackage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
