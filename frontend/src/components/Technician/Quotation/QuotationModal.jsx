"use client";
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaTimes,
  FaSave,
  FaTools,
  FaCogs,
  FaBox,
  FaUser,
  FaCalendarAlt,
  FaDollarSign,
  FaEye
} from "react-icons/fa";

// Use the same base URL as your other pages
const API_BASE = "http://localhost:3001";

export default function QuotationModal({ onClose, onSave }) {
  const [quotation, setQuotation] = useState({
    quotationNumber: `QTN-${Date.now().toString().slice(-4)}`,
    bookingNumber: `BK-${new Date().getFullYear()}-${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    customerName: "",
    email: "",
    phone: "",
    address: "",
    validity: 30,
    notes: "",
    discount: 0,
    laborCost: 0,
    workTimeEstimation: 0,
    services: [],
    servicePackages: [],
    customParts: []
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [availableServicePackages, setAvailableServicePackages] = useState([]);
  const [availableParts, setAvailableParts] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedServicePackage, setSelectedServicePackage] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  const [loading, setLoading] = useState({
    services: false,
    packages: false,
    parts: false
  });
  const [showPreview, setShowPreview] = useState(false);

  // Fetch services, service packages, and parts from backend
  useEffect(() => {
    fetchServices();
    fetchServicePackages();
    fetchParts();
  }, []);

  const fetchServices = async () => {
    setLoading(prev => ({ ...prev, services: true }));
    try {
      const response = await fetch(`${API_BASE}/api/services`);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      console.log('Fetched services:', data);
      setAvailableServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setAvailableServices([]);
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  };

  const fetchServicePackages = async () => {
    setLoading(prev => ({ ...prev, packages: true }));
    try {
      const response = await fetch(`${API_BASE}/api/service-packages`);
      if (!response.ok) throw new Error('Failed to fetch service packages');
      const data = await response.json();
      console.log('Fetched service packages:', data);
      setAvailableServicePackages(data);
    } catch (error) {
      console.error('Error fetching service packages:', error);
      setAvailableServicePackages([]);
    } finally {
      setLoading(prev => ({ ...prev, packages: false }));
    }
  };

  const fetchParts = async () => {
    setLoading(prev => ({ ...prev, parts: true }));
    try {
      const response = await fetch(`${API_BASE}/api/parts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      console.log('Fetched parts data:', data);
      
      if (Array.isArray(data)) {
        setAvailableParts(data);
      } else {
        throw new Error('Invalid parts data format: expected array');
      }
    } catch (error) {
      console.error('Error fetching parts:', error);
      setAvailableParts([]);
    } finally {
      setLoading(prev => ({ ...prev, parts: false }));
    }
  };

  // Calculate totals
  const servicesSubtotal = quotation.services.reduce((sum, service) => {
    return sum + (service.price || 0);
  }, 0);

  const servicePackagesSubtotal = quotation.servicePackages.reduce((sum, pkg) => {
    return sum + (pkg.packagePrice || pkg.price || 0);
  }, 0);

  const customPartsSubtotal = quotation.customParts.reduce((sum, part) => {
    const quantity = part.quantity || 0;
    const unitPrice = part.unitPrice || 0;
    return sum + (quantity * unitPrice);
  }, 0);

  const subtotal = servicesSubtotal + servicePackagesSubtotal + customPartsSubtotal + (quotation.laborCost || 0);
  const discountAmount = subtotal * (quotation.discount / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const taxRate = 0.1;
  const tax = totalAfterDiscount * taxRate;
  const total = totalAfterDiscount + tax;

  // Prepare quotation data for preview
  const getPreviewQuotation = () => {
    return {
      ...quotation,
      services: quotation.services.map(service => ({
        name: service.servicesName,
        description: service.servicesDescription,
        price: service.price
      })),
      packages: quotation.servicePackages.map(pkg => ({
        name: pkg.packageName,
        description: pkg.packageDescription,
        price: pkg.packagePrice
      })),
      parts: quotation.customParts.map(part => ({
        name: part.partName,
        description: part.partDescription,
        unitPrice: part.unitPrice,
        qty: part.quantity
      })),
      servicesTotal: servicesSubtotal,
      packagesTotal: servicePackagesSubtotal,
      partsTotal: customPartsSubtotal,
      subtotal,
      discountValue: discountAmount,
      tax,
      total
    };
  };

  const addService = () => {
    if (!selectedService) {
      alert("Please select a service");
      return;
    }

    const selectedServiceData = availableServices.find(s => 
      s.servicesId?.toString() === selectedService || s.serviceId?.toString() === selectedService
    );
    
    if (!selectedServiceData) {
      console.error('Service not found:', selectedService);
      return;
    }

    const serviceToAdd = {
      id: Date.now(),
      servicesId: selectedServiceData.servicesId || selectedServiceData.serviceId,
      servicesName: selectedServiceData.servicesName || selectedServiceData.serviceName,
      servicesDescription: selectedServiceData.servicesDescription || selectedServiceData.description,
      price: selectedServiceData.price
    };

    setQuotation(prev => ({
      ...prev,
      services: [...prev.services, serviceToAdd]
    }));

    setSelectedService("");
  };

  const addServicePackage = () => {
    if (!selectedServicePackage) {
      alert("Please select a service package");
      return;
    }

    const selectedPackageData = availableServicePackages.find(p => 
      p.servicePackageId?.toString() === selectedServicePackage || p.packageId?.toString() === selectedServicePackage
    );
    
    if (!selectedPackageData) {
      console.error('Package not found:', selectedServicePackage);
      return;
    }

    const packageToAdd = {
      id: Date.now(),
      servicePackageId: selectedPackageData.servicePackageId || selectedPackageData.packageId,
      packageName: selectedPackageData.packageName,
      packageDescription: selectedPackageData.packageDescription || selectedPackageData.description,
      packagePrice: selectedPackageData.packagePrice || selectedPackageData.price
    };

    setQuotation(prev => ({
      ...prev,
      servicePackages: [...prev.servicePackages, packageToAdd]
    }));

    setSelectedServicePackage("");
  };

  const addCustomPart = () => {
    if (!selectedPart) {
      alert("Please select a part");
      return;
    }

    const selectedPartData = availableParts.find(p => p.partId.toString() === selectedPart);
    if (!selectedPartData) {
      alert("Selected part not found in available parts");
      return;
    }

    console.log('Adding part:', selectedPartData);

    const partToAdd = {
      id: Date.now(),
      partId: selectedPartData.partId,
      partName: selectedPartData.partName,
      partDescription: selectedPartData.partDescription || '',
      unitPrice: parseFloat(selectedPartData.unitPrice) || 0,
      quantity: 1,
      inventoryQuantity: selectedPartData.quantity || 0
    };

    setQuotation(prev => ({
      ...prev,
      customParts: [...prev.customParts, partToAdd]
    }));

    setSelectedPart("");
  };

  const removeService = (id) => {
    setQuotation(prev => ({
      ...prev,
      services: prev.services.filter(service => service.id !== id)
    }));
  };

  const removeServicePackage = (id) => {
    setQuotation(prev => ({
      ...prev,
      servicePackages: prev.servicePackages.filter(pkg => pkg.id !== id)
    }));
  };

  const removeCustomPart = (id) => {
    setQuotation(prev => ({
      ...prev,
      customParts: prev.customParts.filter(part => part.id !== id)
    }));
  };

const handleQuotationChange = (e) => {
  const { name, value } = e.target;
  const numericFields = ["discount", "validity", "laborCost", "workTimeEstimation"];
  
  let newValue;
  if (numericFields.includes(name)) {
    // Allow empty string during typing, only convert to number when there's a valid input
    if (value === "" || value === "-") {
      newValue = value; // Keep as string to allow typing
    } else {
      const parsed = parseFloat(value);
      newValue = isNaN(parsed) ? 0 : parsed;
    }
  } else {
    newValue = value;
  }

  setQuotation((prev) => ({
    ...prev,
    [name]: newValue,
  }));
};

  const handleCustomPartChange = (id, field, value) => {
    setQuotation(prev => ({
      ...prev,
      customParts: prev.customParts.map(part => 
        part.id === id ? { 
          ...part, 
          [field]: field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value 
        } : part
      )
    }));
  };

  const handleSave = () => {
    if (!quotation.customerName) {
      alert("Please fill customer details");
      return;
    }

    const newQuotation = {
      ...quotation,
      quotationId: Date.now(),
      subtotal,
      discountAmount,
      tax,
      total,
      status: "Draft",
      createdAt: new Date().toISOString()
    };

    onSave(newQuotation);
  };

  const handlePreview = () => {
    if (!quotation.customerName) {
      alert("Please fill customer details before previewing");
      return;
    }
    setShowPreview(true);
  };

  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value || 0);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Create New Quotation</h2>
                <p className="text-blue-100">Fill in the details below to create a new quotation</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 transition-colors p-2"
              >
                <FaTimes size={24} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaUser className="mr-2 text-blue-600" />
                    Customer Details
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={quotation.customerName}
                        onChange={handleQuotationChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={quotation.email}
                          onChange={handleQuotationChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={quotation.phone}
                          onChange={handleQuotationChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={quotation.address}
                        onChange={handleQuotationChange}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter customer address"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaCalendarAlt className="mr-2 text-green-600" />
                    Quotation & Booking Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quotation Number
                      </label>
                      <input
                        type="text"
                        name="quotationNumber"
                        value={quotation.quotationNumber}
                        onChange={handleQuotationChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Booking Number
                      </label>
                      <input
                        type="text"
                        name="bookingNumber"
                        value={quotation.bookingNumber}
                        onChange={handleQuotationChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={quotation.date}
                        onChange={handleQuotationChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Validity (Days)
                      </label>
                      <input
                        type="number"
                        name="validity"
                        value={quotation.validity}
                        onChange={handleQuotationChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Labor Cost
                      </label>
<input
  type="number"
  name="laborCost"
  value={quotation.laborCost}
  onChange={handleQuotationChange}
  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  min="0"
  step="0.01"
/>

                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Labor Time (hours)
                      </label>
<input
  type="number"
  name="workTimeEstimation"
  value={quotation.workTimeEstimation}
  onChange={handleQuotationChange}
  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  min="0"
  step="0.5"
/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quotation Discount (%)
                    </label>
{/* Discount Input */}
<div className="flex">
  <input
    type="number"
    name="discount"
    value={quotation.discount}
    onChange={handleQuotationChange}
    min="0"
    max="100"
    className="w-full border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
  <span className="bg-gray-200 px-3 py-2 rounded-r-lg text-sm flex items-center">%</span>
</div>
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FaTools className="mr-2 text-blue-600" />
                  Services
                  {loading.services && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
                </h3>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Service
                      </label>
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading.services || availableServices.length === 0}
                      >
                        <option value="">Choose a service...</option>
                        {availableServices.map(service => (
                          <option 
                            key={service.servicesId || service.serviceId} 
                            value={service.servicesId || service.serviceId}
                          >
                            {service.servicesName || service.serviceName} - {formatCurrency(service.price)}
                          </option>
                        ))}
                      </select>
                      {availableServices.length === 0 && !loading.services && (
                        <p className="text-red-500 text-sm mt-1">No services available.</p>
                      )}
                    </div>
                    <div className="col-span-4">
                      <button
                        onClick={addService}
                        disabled={!selectedService || loading.services}
                        className="w-full bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <FaPlus className="mr-2" />
                        Add Service
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quotation.services.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{service.servicesName}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{service.servicesDescription}</td>
                          <td className="px-4 py-3 text-sm font-medium">{formatCurrency(service.price)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeService(service.id)}
                              className="text-red-600 hover:text-red-800 p-2 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {quotation.services.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-blue-50 rounded-lg">
                      <FaTools className="mx-auto text-3xl text-blue-300 mb-3" />
                      <p>No services added yet</p>
                      <p className="text-sm text-gray-400">Add services using the form above</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Packages Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FaBox className="mr-2 text-green-600" />
                  Service Packages
                  {loading.packages && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
                </h3>

                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Service Package
                      </label>
                      <select
                        value={selectedServicePackage}
                        onChange={(e) => setSelectedServicePackage(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={loading.packages || availableServicePackages.length === 0}
                      >
                        <option value="">Choose a service package...</option>
                        {availableServicePackages.map(pkg => (
                          <option 
                            key={pkg.servicePackageId || pkg.packageId} 
                            value={pkg.servicePackageId || pkg.packageId}
                          >
                            {pkg.packageName} - {formatCurrency(pkg.packagePrice || pkg.price)}
                          </option>
                        ))}
                      </select>
                      {availableServicePackages.length === 0 && !loading.packages && (
                        <p className="text-red-500 text-sm mt-1">No service packages available.</p>
                      )}
                    </div>
                    <div className="col-span-4">
                      <button
                        onClick={addServicePackage}
                        disabled={!selectedServicePackage || loading.packages}
                        className="w-full bg-green-600 text-white rounded-lg px-3 py-2 hover:bg-green-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <FaPlus className="mr-2" />
                        Add Package
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quotation.servicePackages.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{pkg.packageName}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{pkg.packageDescription}</td>
                          <td className="px-4 py-3 text-sm font-medium">{formatCurrency(pkg.packagePrice)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeServicePackage(pkg.id)}
                              className="text-red-600 hover:text-red-800 p-2 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {quotation.servicePackages.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-green-50 rounded-lg">
                      <FaBox className="mx-auto text-3xl text-green-300 mb-3" />
                      <p>No service packages added yet</p>
                      <p className="text-sm text-gray-400">Add service packages using the form above</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Parts Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FaCogs className="mr-2 text-purple-600" />
                  Custom Parts
                  {loading.parts && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
                </h3>

                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Part
                      </label>
                      <select
                        value={selectedPart}
                        onChange={(e) => setSelectedPart(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={loading.parts || availableParts.length === 0}
                      >
                        <option value="">Choose a part...</option>
                        {availableParts.map(part => (
                          <option key={part.partId} value={part.partId}>
                            {part.partName} - {formatCurrency(part.unitPrice)} (Stock: {part.quantity || 0})
                          </option>
                        ))}
                      </select>
                      {availableParts.length === 0 && !loading.parts && (
                        <p className="text-red-500 text-sm mt-1">No parts available.</p>
                      )}
                    </div>
                    <div className="col-span-4">
                      <button
                        onClick={addCustomPart}
                        disabled={!selectedPart || loading.parts}
                        className="w-full bg-purple-600 text-white rounded-lg px-3 py-2 hover:bg-purple-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <FaPlus className="mr-2" />
                        Add Part
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quotation.customParts.map((part) => {
                        const partTotal = (part.quantity || 0) * (part.unitPrice || 0);
                        return (
                          <tr key={part.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">{part.partName}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{part.partDescription}</td>
                            <td className="px-4 py-3 text-sm">{formatCurrency(part.unitPrice)}</td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={part.quantity || 1}
                                onChange={(e) => handleCustomPartChange(part.id, 'quantity', e.target.value)}
                                min="1"
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">{formatCurrency(partTotal)}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeCustomPart(part.id)}
                                className="text-red-600 hover:text-red-800 p-2 transition-colors"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {quotation.customParts.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-purple-50 rounded-lg">
                      <FaCogs className="mx-auto text-3xl text-purple-300 mb-3" />
                      <p>No custom parts added yet</p>
                      <p className="text-sm text-gray-400">Add custom parts using the form above</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary and Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
                    <textarea
                      name="notes"
                      value={quotation.notes}
                      onChange={handleQuotationChange}
                      rows={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter any additional notes, terms, or conditions for this quotation..."
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-0">
                  <h3 className="text-lg font-semibold mb-4">Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Services:</span>
                      <span className="font-medium">{formatCurrency(servicesSubtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Packages:</span>
                      <span className="font-medium">{formatCurrency(servicePackagesSubtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Custom Parts:</span>
                      <span className="font-medium">{formatCurrency(customPartsSubtotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Labor Cost:</span>
                      <span className="font-medium">{formatCurrency(quotation.laborCost)}</span>
                    </div>
                    
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-700 font-medium">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount ({quotation.discount}%):</span>
                      <span className="font-medium text-red-600">-{formatCurrency(discountAmount)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (10%):</span>
                      <span className="font-medium">{formatCurrency(tax)}</span>
                    </div>
                    
                    <div className="flex justify-between border-t pt-3 text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleSave}
                      className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                    >
                      <FaSave className="mr-2" />
                      Save Quotation
                    </button>

                    <button
                      onClick={handlePreview}
                      className="w-full bg-green-600 text-white rounded-lg px-4 py-3 hover:bg-green-700 transition-colors font-semibold flex items-center justify-center"
                    >
                      <FaEye className="mr-2" />
                      Preview Quotation
                    </button>
                    
                    <button
                      onClick={onClose}
                      className="w-full bg-gray-500 text-white rounded-lg px-4 py-3 hover:bg-gray-600 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <QuotationPreviewModal 
          isOpen={showPreview} 
          onClose={() => setShowPreview(false)} 
          quotation={getPreviewQuotation()} 
        />
      )}
    </>
  );
}

// QuotationPreviewModal Component (keep your existing code, just ensure it's in the same file)
function QuotationPreviewModal({ isOpen, onClose, quotation }) {
  if (!isOpen) return null;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-y-auto max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none print:overflow-visible">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">Quotation Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl print:hidden"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 print:p-4 text-sm text-gray-800">
          {/* Company Header */}
          <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold">Car Aircon Services</h1>
              <p className="text-gray-600 text-sm">123 Main Street, City, Country</p>
              <p className="text-gray-600 text-sm">
                Email: info@caraircon.com | Phone: +63 900 123 4567
              </p>
            </div>
            <div className="text-right text-sm">
              <h2 className="text-xl font-semibold">QUOTATION</h2>
              <p>Quotation #: {quotation?.quotationNumber || "QTN-2502"}</p>
              <p>Booking #: {quotation?.bookingNumber || "BK-2025-558"}</p>
              <p>Date: {quotation?.date || "28/10/2025"}</p>
              <p>Validity: {quotation?.validity || "30"} Days</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Customer Details</h3>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-medium w-1/3">Name:</td>
                  <td>{quotation?.customerName || "John Doe"}</td>
                </tr>
                <tr>
                  <td className="font-medium">Email:</td>
                  <td>{quotation?.email || "john@example.com"}</td>
                </tr>
                <tr>
                  <td className="font-medium">Phone:</td>
                  <td>{quotation?.phone || "+1 (555) 123-4567"}</td>
                </tr>
                <tr>
                  <td className="font-medium">Address:</td>
                  <td>{quotation?.address || "Enter customer address"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Services */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Services</h3>
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Service Name</th>
                  <th className="border px-2 py-1 text-left">Description</th>
                  <th className="border px-2 py-1 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {quotation?.services?.length ? (
                  quotation.services.map((s, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{s.name}</td>
                      <td className="border px-2 py-1">{s.description}</td>
                      <td className="border px-2 py-1 text-right">₱{s.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-2">
                      No services added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Service Packages */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Service Packages</h3>
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Package Name</th>
                  <th className="border px-2 py-1 text-left">Description</th>
                  <th className="border px-2 py-1 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {quotation?.packages?.length ? (
                  quotation.packages.map((p, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{p.name}</td>
                      <td className="border px-2 py-1">{p.description}</td>
                      <td className="border px-2 py-1 text-right">₱{p.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-2">
                      No service packages added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Parts */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Custom Parts</h3>
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Part Name</th>
                  <th className="border px-2 py-1 text-left">Description</th>
                  <th className="border px-2 py-1 text-right">Unit Price</th>
                  <th className="border px-2 py-1 text-right">Qty</th>
                  <th className="border px-2 py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation?.parts?.length ? (
                  quotation.parts.map((p, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{p.name}</td>
                      <td className="border px-2 py-1">{p.description}</td>
                      <td className="border px-2 py-1 text-right">₱{p.unitPrice}</td>
                      <td className="border px-2 py-1 text-right">{p.qty}</td>
                      <td className="border px-2 py-1 text-right">
                        ₱{(p.unitPrice * p.qty).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-2">
                      No custom parts added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Additional Notes</h3>
            <p className="italic text-gray-700">
              {quotation?.notes || "Enter any additional notes, terms, or conditions for this quotation..."}
            </p>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <table className="w-1/2 text-sm">
                <tbody>
                  <tr>
                    <td>Services:</td>
                    <td className="text-right">₱{quotation?.servicesTotal || 0}</td>
                  </tr>
                  <tr>
                    <td>Service Packages:</td>
                    <td className="text-right">₱{quotation?.packagesTotal || 0}</td>
                  </tr>
                  <tr>
                    <td>Custom Parts:</td>
                    <td className="text-right">₱{quotation?.partsTotal || 0}</td>
                  </tr>
                  <tr>
                    <td>Labor Cost:</td>
                    <td className="text-right">₱{quotation?.laborCost || 0}</td>
                  </tr>
                  <tr>
                    <td>Subtotal:</td>
                    <td className="text-right">₱{quotation?.subtotal || 0}</td>
                  </tr>
                  <tr>
                    <td>Discount ({quotation?.discount || 0}%):</td>
                    <td className="text-right text-red-500">
                      -₱{quotation?.discountValue || 0}
                    </td>
                  </tr>
                  <tr>
                    <td>Tax (10%):</td>
                    <td className="text-right">₱{quotation?.tax || 0}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-base">Total:</td>
                    <td className="text-right font-bold text-lg">
                      ₱{quotation?.total || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-600 text-xs mt-10 border-t pt-3">
            <p>Thank you for choosing Car Aircon Services!</p>
            <p>This is a system-generated quotation. No signature required.</p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 border-t p-4 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}



// "use client";
// import { useState, useEffect } from "react";
// import {
//   FaPlus,
//   FaTrash,
//   FaTimes,
//   FaSave,
//   FaTools,
//   FaCogs,
//   FaBox,
//   FaUser,
//   FaCalendarAlt,
//   FaDollarSign
// } from "react-icons/fa";

// // Use the same base URL as your other pages
// const API_BASE = "http://localhost:3001";

// export default function QuotationModal({ onClose, onSave }) {
//   const [quotation, setQuotation] = useState({
//     quotationNumber: `QTN-${Date.now().toString().slice(-4)}`,
//     bookingNumber: `BK-${new Date().getFullYear()}-${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
//     date: new Date().toISOString().split('T')[0],
//     customerName: "",
//     email: "",
//     phone: "",
//     address: "",
//     validity: 30,
//     notes: "",
//     discount: 0,
//     laborCost: 0,
//     workTimeEstimation: 0,
//     services: [],
//     servicePackages: [],
//     customParts: []
//   });

//   const [availableServices, setAvailableServices] = useState([]);
//   const [availableServicePackages, setAvailableServicePackages] = useState([]);
//   const [availableParts, setAvailableParts] = useState([]);
//   const [selectedService, setSelectedService] = useState("");
//   const [selectedServicePackage, setSelectedServicePackage] = useState("");
//   const [selectedPart, setSelectedPart] = useState("");
//   const [loading, setLoading] = useState({
//     services: false,
//     packages: false,
//     parts: false
//   });

//   // Fetch services, service packages, and parts from backend
//   useEffect(() => {
//     fetchServices();
//     fetchServicePackages();
//     fetchParts();
//   }, []);

//   const fetchServices = async () => {
//     setLoading(prev => ({ ...prev, services: true }));
//     try {
//       const response = await fetch(`${API_BASE}/api/services`);
//       if (!response.ok) throw new Error('Failed to fetch services');
//       const data = await response.json();
//       console.log('Fetched services:', data);
//       setAvailableServices(data);
//     } catch (error) {
//       console.error('Error fetching services:', error);
//       setAvailableServices([]);
//     } finally {
//       setLoading(prev => ({ ...prev, services: false }));
//     }
//   };

//   const fetchServicePackages = async () => {
//     setLoading(prev => ({ ...prev, packages: true }));
//     try {
//       const response = await fetch(`${API_BASE}/api/service-packages`);
//       if (!response.ok) throw new Error('Failed to fetch service packages');
//       const data = await response.json();
//       console.log('Fetched service packages:', data);
//       setAvailableServicePackages(data);
//     } catch (error) {
//       console.error('Error fetching service packages:', error);
//       setAvailableServicePackages([]);
//     } finally {
//       setLoading(prev => ({ ...prev, packages: false }));
//     }
//   };

//   const fetchParts = async () => {
//     setLoading(prev => ({ ...prev, parts: true }));
//     try {
//       const response = await fetch(`${API_BASE}/api/parts`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
      
//       console.log('Fetched parts data:', data);
      
//       if (Array.isArray(data)) {
//         setAvailableParts(data);
//       } else {
//         throw new Error('Invalid parts data format: expected array');
//       }
//     } catch (error) {
//       console.error('Error fetching parts:', error);
//       setAvailableParts([]);
//     } finally {
//       setLoading(prev => ({ ...prev, parts: false }));
//     }
//   };

//   // Calculate totals
//   const servicesSubtotal = quotation.services.reduce((sum, service) => {
//     return sum + (service.price || 0);
//   }, 0);

//   const servicePackagesSubtotal = quotation.servicePackages.reduce((sum, pkg) => {
//     return sum + (pkg.packagePrice || pkg.price || 0);
//   }, 0);

//   const customPartsSubtotal = quotation.customParts.reduce((sum, part) => {
//     const quantity = part.quantity || 0;
//     const unitPrice = part.unitPrice || 0;
//     return sum + (quantity * unitPrice);
//   }, 0);

//   const subtotal = servicesSubtotal + servicePackagesSubtotal + customPartsSubtotal + (quotation.laborCost || 0);
//   const discountAmount = subtotal * (quotation.discount / 100);
//   const totalAfterDiscount = subtotal - discountAmount;
//   const taxRate = 0.1;
//   const tax = totalAfterDiscount * taxRate;
//   const total = totalAfterDiscount + tax;

//   const addService = () => {
//     if (!selectedService) {
//       alert("Please select a service");
//       return;
//     }

//     const selectedServiceData = availableServices.find(s => 
//       s.servicesId?.toString() === selectedService || s.serviceId?.toString() === selectedService
//     );
    
//     if (!selectedServiceData) {
//       console.error('Service not found:', selectedService);
//       return;
//     }

//     const serviceToAdd = {
//       id: Date.now(),
//       servicesId: selectedServiceData.servicesId || selectedServiceData.serviceId,
//       servicesName: selectedServiceData.servicesName || selectedServiceData.serviceName,
//       servicesDescription: selectedServiceData.servicesDescription || selectedServiceData.description,
//       price: selectedServiceData.price
//     };

//     setQuotation(prev => ({
//       ...prev,
//       services: [...prev.services, serviceToAdd]
//     }));

//     setSelectedService("");
//   };

//   const addServicePackage = () => {
//     if (!selectedServicePackage) {
//       alert("Please select a service package");
//       return;
//     }

//     const selectedPackageData = availableServicePackages.find(p => 
//       p.servicePackageId?.toString() === selectedServicePackage || p.packageId?.toString() === selectedServicePackage
//     );
    
//     if (!selectedPackageData) {
//       console.error('Package not found:', selectedServicePackage);
//       return;
//     }

//     const packageToAdd = {
//       id: Date.now(),
//       servicePackageId: selectedPackageData.servicePackageId || selectedPackageData.packageId,
//       packageName: selectedPackageData.packageName,
//       packageDescription: selectedPackageData.packageDescription || selectedPackageData.description,
//       packagePrice: selectedPackageData.packagePrice || selectedPackageData.price
//     };

//     setQuotation(prev => ({
//       ...prev,
//       servicePackages: [...prev.servicePackages, packageToAdd]
//     }));

//     setSelectedServicePackage("");
//   };

//   const addCustomPart = () => {
//     if (!selectedPart) {
//       alert("Please select a part");
//       return;
//     }

//     const selectedPartData = availableParts.find(p => p.partId.toString() === selectedPart);
//     if (!selectedPartData) {
//       alert("Selected part not found in available parts");
//       return;
//     }

//     console.log('Adding part:', selectedPartData);

//     const partToAdd = {
//       id: Date.now(),
//       partId: selectedPartData.partId,
//       partName: selectedPartData.partName,
//       partDescription: selectedPartData.partDescription || '',
//       unitPrice: parseFloat(selectedPartData.unitPrice) || 0,
//       quantity: 1,
//       inventoryQuantity: selectedPartData.quantity || 0
//     };

//     setQuotation(prev => ({
//       ...prev,
//       customParts: [...prev.customParts, partToAdd]
//     }));

//     setSelectedPart("");
//   };

//   const removeService = (id) => {
//     setQuotation(prev => ({
//       ...prev,
//       services: prev.services.filter(service => service.id !== id)
//     }));
//   };

//   const removeServicePackage = (id) => {
//     setQuotation(prev => ({
//       ...prev,
//       servicePackages: prev.servicePackages.filter(pkg => pkg.id !== id)
//     }));
//   };

//   const removeCustomPart = (id) => {
//     setQuotation(prev => ({
//       ...prev,
//       customParts: prev.customParts.filter(part => part.id !== id)
//     }));
//   };

//   const handleQuotationChange = (e) => {
//     const { name, value } = e.target;
//     const numericFields = ["discount", "validity", "laborCost", "workTimeEstimation"];
//     const newValue = numericFields.includes(name) ? parseFloat(value) || 0 : value;

//     setQuotation((prev) => ({
//       ...prev,
//       [name]: newValue,
//     }));
//   };

//   const handleCustomPartChange = (id, field, value) => {
//     setQuotation(prev => ({
//       ...prev,
//       customParts: prev.customParts.map(part => 
//         part.id === id ? { 
//           ...part, 
//           [field]: field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value 
//         } : part
//       )
//     }));
//   };

//   const handleSave = () => {
//     if (!quotation.customerName) {
//       alert("Please fill customer details");
//       return;
//     }

//     const newQuotation = {
//       ...quotation,
//       quotationId: Date.now(),
//       subtotal,
//       discountAmount,
//       tax,
//       total,
//       status: "Draft",
//       createdAt: new Date().toISOString()
//     };

//     onSave(newQuotation);
//   };

//   // Format currency for display
//   const formatCurrency = (value) => {
//     return new Intl.NumberFormat('en-PH', {
//       style: 'currency',
//       currency: 'PHP'
//     }).format(value || 0);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold">Create New Quotation</h2>
//               <p className="text-blue-100">Fill in the details below to create a new quotation</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-white hover:text-blue-200 transition-colors p-2"
//             >
//               <FaTimes size={24} />
//             </button>
//           </div>
//         </div>

//         <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
//           <div className="p-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold flex items-center">
//                   <FaUser className="mr-2 text-blue-600" />
//                   Customer Details
//                 </h3>
                
//                 <div className="grid grid-cols-1 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Customer Name *
//                     </label>
//                     <input
//                       type="text"
//                       name="customerName"
//                       value={quotation.customerName}
//                       onChange={handleQuotationChange}
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="John Doe"
//                       required
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Email
//                       </label>
//                       <input
//                         type="email"
//                         name="email"
//                         value={quotation.email}
//                         onChange={handleQuotationChange}
//                         className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="john@example.com"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Phone
//                       </label>
//                       <input
//                         type="tel"
//                         name="phone"
//                         value={quotation.phone}
//                         onChange={handleQuotationChange}
//                         className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="+1 (555) 123-4567"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Address
//                     </label>
//                     <textarea
//                       name="address"
//                       value={quotation.address}
//                       onChange={handleQuotationChange}
//                       rows={2}
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter customer address"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold flex items-center">
//                   <FaCalendarAlt className="mr-2 text-green-600" />
//                   Quotation & Booking Details
//                 </h3>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Quotation Number
//                     </label>
//                     <input
//                       type="text"
//                       name="quotationNumber"
//                       value={quotation.quotationNumber}
//                       onChange={handleQuotationChange}
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono"
//                       readOnly
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Booking Number
//                     </label>
//                     <input
//                       type="text"
//                       name="bookingNumber"
//                       value={quotation.bookingNumber}
//                       onChange={handleQuotationChange}
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono"
//                       readOnly
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Date
//                     </label>
//                     <input
//                       type="date"
//                       name="date"
//                       value={quotation.date}
//                       onChange={handleQuotationChange}
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Validity (Days)
//                     </label>
//                     <input
//                       type="number"
//                       name="validity"
//                       value={quotation.validity}
//                       onChange={handleQuotationChange}
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       min="1"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Labor Cost
//                     </label>
//                     <input
//                       type="number"
//                       name="laborCost"
//                       value={quotation.laborCost}
//                       onChange={handleQuotationChange}
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       min="0"
//                       step="0.01"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Estimated Labor Time (hours)
//                     </label>
//                     <input
//                       type="number"
//                       name="workTimeEstimation"
//                       value={quotation.workTimeEstimation}
//                       onChange={handleQuotationChange}
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       min="0"
//                       step="0.5"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Quotation Discount (%)
//                   </label>
//                   <div className="flex">
//                     <input
//                       type="number"
//                       name="discount"
//                       value={quotation.discount}
//                       onChange={handleQuotationChange}
//                       min="0"
//                       max="100"
//                       className="w-full border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                     <span className="bg-gray-200 px-3 py-2 rounded-r-lg text-sm flex items-center">%</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Services Section */}
//             <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
//               <h3 className="text-lg font-semibold mb-4 flex items-center">
//                 <FaTools className="mr-2 text-blue-600" />
//                 Services
//                 {loading.services && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
//               </h3>

//               <div className="bg-blue-50 rounded-lg p-4 mb-6">
//                 <div className="grid grid-cols-12 gap-3 items-end">
//                   <div className="col-span-8">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Select Service
//                     </label>
//                     <select
//                       value={selectedService}
//                       onChange={(e) => setSelectedService(e.target.value)}
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       disabled={loading.services || availableServices.length === 0}
//                     >
//                       <option value="">Choose a service...</option>
//                       {availableServices.map(service => (
//                         <option 
//                           key={service.servicesId || service.serviceId} 
//                           value={service.servicesId || service.serviceId}
//                         >
//                           {service.servicesName || service.serviceName} - {formatCurrency(service.price)}
//                         </option>
//                       ))}
//                     </select>
//                     {availableServices.length === 0 && !loading.services && (
//                       <p className="text-red-500 text-sm mt-1">No services available.</p>
//                     )}
//                   </div>
//                   <div className="col-span-4">
//                     <button
//                       onClick={addService}
//                       disabled={!selectedService || loading.services}
//                       className="w-full bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
//                     >
//                       <FaPlus className="mr-2" />
//                       Add Service
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Name</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {quotation.services.map((service) => (
//                       <tr key={service.id} className="hover:bg-gray-50">
//                         <td className="px-4 py-3 text-sm font-medium">{service.servicesName}</td>
//                         <td className="px-4 py-3 text-sm text-gray-500">{service.servicesDescription}</td>
//                         <td className="px-4 py-3 text-sm font-medium">{formatCurrency(service.price)}</td>
//                         <td className="px-4 py-3">
//                           <button
//                             onClick={() => removeService(service.id)}
//                             className="text-red-600 hover:text-red-800 p-2 transition-colors"
//                           >
//                             <FaTrash />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>

//                 {quotation.services.length === 0 && (
//                   <div className="text-center py-8 text-gray-500 bg-blue-50 rounded-lg">
//                     <FaTools className="mx-auto text-3xl text-blue-300 mb-3" />
//                     <p>No services added yet</p>
//                     <p className="text-sm text-gray-400">Add services using the form above</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Service Packages Section */}
//             <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
//               <h3 className="text-lg font-semibold mb-4 flex items-center">
//                 <FaBox className="mr-2 text-green-600" />
//                 Service Packages
//                 {loading.packages && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
//               </h3>

//               <div className="bg-green-50 rounded-lg p-4 mb-6">
//                 <div className="grid grid-cols-12 gap-3 items-end">
//                   <div className="col-span-8">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Select Service Package
//                     </label>
//                     <select
//                       value={selectedServicePackage}
//                       onChange={(e) => setSelectedServicePackage(e.target.value)}
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       disabled={loading.packages || availableServicePackages.length === 0}
//                     >
//                       <option value="">Choose a service package...</option>
//                       {availableServicePackages.map(pkg => (
//                         <option 
//                           key={pkg.servicePackageId || pkg.packageId} 
//                           value={pkg.servicePackageId || pkg.packageId}
//                         >
//                           {pkg.packageName} - {formatCurrency(pkg.packagePrice || pkg.price)}
//                         </option>
//                       ))}
//                     </select>
//                     {availableServicePackages.length === 0 && !loading.packages && (
//                       <p className="text-red-500 text-sm mt-1">No service packages available.</p>
//                     )}
//                   </div>
//                   <div className="col-span-4">
//                     <button
//                       onClick={addServicePackage}
//                       disabled={!selectedServicePackage || loading.packages}
//                       className="w-full bg-green-600 text-white rounded-lg px-3 py-2 hover:bg-green-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
//                     >
//                       <FaPlus className="mr-2" />
//                       Add Package
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package Name</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {quotation.servicePackages.map((pkg) => (
//                       <tr key={pkg.id} className="hover:bg-gray-50">
//                         <td className="px-4 py-3 text-sm font-medium">{pkg.packageName}</td>
//                         <td className="px-4 py-3 text-sm text-gray-500">{pkg.packageDescription}</td>
//                         <td className="px-4 py-3 text-sm font-medium">{formatCurrency(pkg.packagePrice)}</td>
//                         <td className="px-4 py-3">
//                           <button
//                             onClick={() => removeServicePackage(pkg.id)}
//                             className="text-red-600 hover:text-red-800 p-2 transition-colors"
//                           >
//                             <FaTrash />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>

//                 {quotation.servicePackages.length === 0 && (
//                   <div className="text-center py-8 text-gray-500 bg-green-50 rounded-lg">
//                     <FaBox className="mx-auto text-3xl text-green-300 mb-3" />
//                     <p>No service packages added yet</p>
//                     <p className="text-sm text-gray-400">Add service packages using the form above</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Custom Parts Section */}
//             <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
//               <h3 className="text-lg font-semibold mb-4 flex items-center">
//                 <FaCogs className="mr-2 text-purple-600" />
//                 Custom Parts
//                 {loading.parts && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
//               </h3>

//               <div className="bg-purple-50 rounded-lg p-4 mb-6">
//                 <div className="grid grid-cols-12 gap-3 items-end">
//                   <div className="col-span-8">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Select Part
//                     </label>
//                     <select
//                       value={selectedPart}
//                       onChange={(e) => setSelectedPart(e.target.value)}
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                       disabled={loading.parts || availableParts.length === 0}
//                     >
//                       <option value="">Choose a part...</option>
//                       {availableParts.map(part => (
//                         <option key={part.partId} value={part.partId}>
//                           {part.partName} - {formatCurrency(part.unitPrice)} (Stock: {part.quantity || 0})
//                         </option>
//                       ))}
//                     </select>
//                     {availableParts.length === 0 && !loading.parts && (
//                       <p className="text-red-500 text-sm mt-1">No parts available.</p>
//                     )}
//                   </div>
//                   <div className="col-span-4">
//                     <button
//                       onClick={addCustomPart}
//                       disabled={!selectedPart || loading.parts}
//                       className="w-full bg-purple-600 text-white rounded-lg px-3 py-2 hover:bg-purple-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
//                     >
//                       <FaPlus className="mr-2" />
//                       Add Part
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {quotation.customParts.map((part) => {
//                       const partTotal = (part.quantity || 0) * (part.unitPrice || 0);
//                       return (
//                         <tr key={part.id} className="hover:bg-gray-50">
//                           <td className="px-4 py-3 text-sm font-medium">{part.partName}</td>
//                           <td className="px-4 py-3 text-sm text-gray-500">{part.partDescription}</td>
//                           <td className="px-4 py-3 text-sm">{formatCurrency(part.unitPrice)}</td>
//                           <td className="px-4 py-3">
//                             <input
//                               type="number"
//                               value={part.quantity || 1}
//                               onChange={(e) => handleCustomPartChange(part.id, 'quantity', e.target.value)}
//                               min="1"
//                               className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
//                             />
//                           </td>
//                           <td className="px-4 py-3 text-sm font-medium">{formatCurrency(partTotal)}</td>
//                           <td className="px-4 py-3">
//                             <button
//                               onClick={() => removeCustomPart(part.id)}
//                               className="text-red-600 hover:text-red-800 p-2 transition-colors"
//                             >
//                               <FaTrash />
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>

//                 {quotation.customParts.length === 0 && (
//                   <div className="text-center py-8 text-gray-500 bg-purple-50 rounded-lg">
//                     <FaCogs className="mx-auto text-3xl text-purple-300 mb-3" />
//                     <p>No custom parts added yet</p>
//                     <p className="text-sm text-gray-400">Add custom parts using the form above</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Summary and Notes */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="lg:col-span-2">
//                 <div className="bg-white rounded-xl border border-gray-200 p-6">
//                   <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
//                   <textarea
//                     name="notes"
//                     value={quotation.notes}
//                     onChange={handleQuotationChange}
//                     rows={6}
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter any additional notes, terms, or conditions for this quotation..."
//                   />
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-0">
//                 <h3 className="text-lg font-semibold mb-4">Summary</h3>
                
//                 <div className="space-y-3">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Services:</span>
//                     <span className="font-medium">{formatCurrency(servicesSubtotal)}</span>
//                   </div>
                  
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Service Packages:</span>
//                     <span className="font-medium">{formatCurrency(servicePackagesSubtotal)}</span>
//                   </div>
                  
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Custom Parts:</span>
//                     <span className="font-medium">{formatCurrency(customPartsSubtotal)}</span>
//                   </div>

//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Labor Cost:</span>
//                     <span className="font-medium">{formatCurrency(quotation.laborCost)}</span>
//                   </div>
                  
//                   <div className="flex justify-between border-t pt-2">
//                     <span className="text-gray-700 font-medium">Subtotal:</span>
//                     <span className="font-medium">{formatCurrency(subtotal)}</span>
//                   </div>

//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Discount ({quotation.discount}%):</span>
//                     <span className="font-medium text-red-600">-{formatCurrency(discountAmount)}</span>
//                   </div>
                  
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Tax (10%):</span>
//                     <span className="font-medium">{formatCurrency(tax)}</span>
//                   </div>
                  
//                   <div className="flex justify-between border-t pt-3 text-lg font-bold">
//                     <span>Total:</span>
//                     <span className="text-blue-600">{formatCurrency(total)}</span>
//                   </div>
//                 </div>

//                 <div className="mt-6 space-y-3">
//                   <button
//                     onClick={handleSave}
//                     className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
//                   >
//                     <FaSave className="mr-2" />
//                     Save Quotation
//                   </button>
                  
//                   <button
//                     onClick={onClose}
//                     className="w-full bg-gray-500 text-white rounded-lg px-4 py-3 hover:bg-gray-600 transition-colors font-semibold"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }