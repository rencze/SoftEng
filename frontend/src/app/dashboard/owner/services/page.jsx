// src/app/dashboard/owner/services/page.jsx
"use client";

import { useState } from "react";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTag
} from "react-icons/fa";

export default function ServicesPage() {
  const [services, setServices] = useState([
    {
      serviceId: 1,
      serviceName: "Aircon Cleaning",
      description: "Deep cleaning of car air conditioning system.",
      price: 1500,
    },
    {
      serviceId: 2,
      serviceName: "Freon Refill",
      description: "Refill freon for optimal cooling performance.",
      price: 1200,
    },
    {
      serviceId: 3,
      serviceName: "Full Diagnostics",
      description: "Comprehensive system check for leaks and issues.",
      price: 2000,
    },
  ]);

  const [search, setSearch] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [serviceData, setServiceData] = useState({
    serviceName: "",
    description: "",
    price: ""
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

  // Modal Open
  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceData({
        serviceName: service.serviceName,
        description: service.description,
        price: service.price
      });
    } else {
      setEditingService(null);
      setServiceData({ serviceName: "", description: "", price: "" });
    }
  };

  // Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setServiceData((prev) => ({ ...prev, [name]: value }));
  };

  // Save Service
  const saveService = () => {
    if (editingService) {
      setServices(services.map((s) =>
        s.serviceId === editingService.serviceId ? { ...s, ...serviceData, price: Number(serviceData.price) } : s
      ));
      setEditingService(null);
    } else {
      const newService = {
        serviceId: Date.now(),
        ...serviceData,
        price: Number(serviceData.price),
      };
      setServices([...services, newService]);
    }
    setServiceData({ serviceName: "", description: "", price: "" });
  };

  // Delete Service
  const deleteService = (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    setServices(services.filter((s) => s.serviceId !== id));
  };

  // Filter services
  const filteredServices = services.filter((s) =>
    s.serviceName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Services</h1>
          <p className="text-gray-600">Manage all offered services</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
        >
          <FaPlus className="mr-2" /> Add Service
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-4 shadow-sm">
        <input
          type="text"
          placeholder="🔍 Search service..."
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
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Service Name</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Description</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Price</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredServices.map((s) => (
              <tr key={s.serviceId} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 flex items-center gap-2 font-semibold text-gray-800">
                  <FaTag className="text-blue-500" /> {s.serviceName}
                </td>
                <td className="px-6 py-4 text-gray-600">{s.description}</td>
                <td className="px-6 py-4 text-green-600 font-medium">
                  {formatCurrency(s.price)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => openModal(s)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteService(s.serviceId)}
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

        {filteredServices.length === 0 && (
          <div className="text-center py-12 text-gray-500">No services found</div>
        )}
      </div>

      {/* Modal */}
      {(editingService || serviceData.serviceName !== "") && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingService ? "Edit Service" : "Add Service"}
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                name="serviceName"
                placeholder="Service Name"
                value={serviceData.serviceName}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={serviceData.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={serviceData.price}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingService(null);
                  setServiceData({ serviceName: "", description: "", price: "" });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveService}
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
