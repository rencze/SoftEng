"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaTag, FaTimes } from "react-icons/fa";

const API_URL = "http://localhost:3001/api/services";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    serviceName: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get(API_URL);
      setServices(res.data);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "₱0.00";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        serviceName: service.servicesName || service.serviceName,
        description: service.servicesDescription || service.description,
        price: service.price,
      });
    } else {
      setEditingService(null);
      setServiceForm({ serviceName: "", description: "", price: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setServiceForm({ serviceName: "", description: "", price: "" });
  };

  // Block negative numbers and "e" from being typed
  const handlePriceKeyDown = (e) => {
    if (e.key === "-" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  // Prevent pasting negative values
  const handlePricePaste = (e) => {
    const pasteData = e.clipboardData.getData("Text");
    if (pasteData.includes("-") || isNaN(pasteData)) {
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price") {
      const num = Number(value);
      if (num < 0) return; // prevent negative number
    }

    setServiceForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveService = async () => {
    const price = Number(serviceForm.price);
    if (price < 0) {
      alert("Price cannot be negative!");
      return;
    }

    const payload = {
      servicesName: serviceForm.serviceName,
      servicesDescription: serviceForm.description,
      price,
    };

    try {
      if (editingService) {
        const id = editingService.servicesId || editingService.serviceId;
        await axios.put(`${API_URL}/${id}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }

      fetchServices();
      closeModal();
    } catch (err) {
      console.error("Error saving service:", err);
    }
  };

  const deleteService = async (service) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const id = service.servicesId || service.serviceId;
      await axios.delete(`${API_URL}/${id}`);
      fetchServices();
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  const filteredServices = services.filter((s) => {
    const name = s.servicesName || s.serviceName || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

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
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">
                Service Name
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">
                Price
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredServices.length > 0 ? (
              filteredServices.map((s) => (
                <tr
                  key={s.servicesId || s.serviceId}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 flex items-center gap-2 font-semibold text-gray-800">
                    <FaTag className="text-blue-500" />{" "}
                    {s.servicesName || s.serviceName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {s.servicesDescription || s.description}
                  </td>
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

                 {false && (     <button
                        onClick={() => deleteService(s)}
                        className="text-red-600 hover:text-red-800 transition"
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
                <td
                  colSpan="4"
                  className="text-center py-12 text-gray-500"
                >
                  No services found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingService ? "Edit Service" : "Add Service"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                name="serviceName"
                placeholder="Service Name"
                value={serviceForm.serviceName}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={serviceForm.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                rows="3"
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={serviceForm.price}
                onChange={handleChange}
                onKeyDown={handlePriceKeyDown}
                onPaste={handlePricePaste}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
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