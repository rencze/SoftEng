"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaTag, FaTimes, FaSearch, FaFileAlt } from "react-icons/fa";

const API_URL = "http://localhost:3001/api/services";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    serviceName: "",
    description: "",
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

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        serviceName: service.servicesName || service.serviceName,
        description: service.servicesDescription || service.description,
      });
    } else {
      setEditingService(null);
      setServiceForm({ serviceName: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setServiceForm({ serviceName: "", description: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServiceForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveService = async () => {
    const payload = {
      servicesName: serviceForm.serviceName,
      servicesDescription: serviceForm.description,
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Services Management</h1>
          <p className="text-gray-600 flex items-center">
            <FaTag className="mr-2" />
            {filteredServices.length} of {services.length} services
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg font-medium"
        >
          <FaPlus className="mr-2" /> Add Service
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search services by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Name
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
              {filteredServices.length > 0 ? (
                filteredServices.map((s) => (
                  <tr key={s.servicesId || s.serviceId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaTag className="text-blue-500 mr-3" />
                        <span className="font-medium text-gray-800">
                          {s.servicesName || s.serviceName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {s.servicesDescription || s.description || "No description provided"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openModal(s)}
                          className="text-blue-600 hover:text-blue-800 p-2 transition-colors rounded-lg hover:bg-blue-50"
                          title="Edit Service"
                        >
                          <FaEdit size={16} />
                        </button>
                        {false && (
                          <button
                            onClick={() => deleteService(s)}
                            className="text-red-600 hover:text-red-800 p-2 transition-colors rounded-lg hover:bg-red-50"
                            title="Delete Service"
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
                      <FaTag className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                      <p className="text-gray-500">
                        {search ? "Try adjusting your search criteria" : "Get started by adding your first service"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Improved Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingService ? "Edit Service" : "Add New Service"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <p className="text-blue-100 mt-2">
                {editingService 
                  ? "Update service information" 
                  : "Create a new service for your offerings"
                }
              </p>
            </div>

            {/* Form */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Service Name */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <FaTag className="mr-2 text-blue-600" />
                    Service Name *
                  </label>
                  <input
                    type="text"
                    name="serviceName"
                    value={serviceForm.serviceName}
                    onChange={handleChange}
                    placeholder="Enter service name"
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
                    name="description"
                    value={serviceForm.description}
                    onChange={handleChange}
                    placeholder="Describe the service, what it includes, and any important details..."
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide a clear description to help customers understand this service
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
                  onClick={saveService}
                  disabled={!serviceForm.serviceName}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {editingService ? "Update Service" : "Add Service"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}