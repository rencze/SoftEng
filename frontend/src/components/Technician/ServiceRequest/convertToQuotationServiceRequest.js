// "use client";

import { useState, useEffect } from "react";
import { FaTimes, FaCalculator, FaFileInvoice, FaExclamationTriangle, FaTrash, FaPlus, FaUser, FaCogs } from "react-icons/fa";

export default function ConvertToQuotationServiceRequest({ 
  isOpen, 
  onClose, 
  serviceRequest,
  onConvert,
  actionLoading 
}) {
  const [formData, setFormData] = useState({
    priorityLevel: "Medium",
    quotationDetails: "",
    laborCost: "",
    discount: 0,
    validityPeriod: 30, // days
  });

  const [editableServices, setEditableServices] = useState([]);
  const [editablePackages, setEditablePackages] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);

  // --- State for parts ---
  const [availableParts, setAvailableParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState("");
  const [loading, setLoading] = useState({ parts: false });
  const [quotation, setQuotation] = useState({
    customParts: [],
    // ...other fields
  });

  // Reset form when modal opens/closes or service request changes
  useEffect(() => {
    if (isOpen && serviceRequest) {
      setFormData({
        priorityLevel: "Medium",
        quotationDetails: serviceRequest.notes || "", // Pre-fill with service request notes
        laborCost: "",
        discount: 0,
        validityPeriod: 30,
      });

      // Initialize editable services and packages with prices
      const servicesWithPrices = (serviceRequest.services || []).map(service => ({
        ...service,
        estimatedPrice: service.price || "",
        customPrice: !service.price,
        originalPrice: service.price || ""
      }));

      const packagesWithPrices = (serviceRequest.servicePackages || []).map(pkg => ({
        ...pkg,
        estimatedPrice: pkg.price || "",
        customPrice: !pkg.price,
        originalPrice: pkg.price || ""
      }));

      setEditableServices(servicesWithPrices);
      setEditablePackages(packagesWithPrices);
      fetchAvailableServicesAndPackages();
      fetchParts(); // Fetch parts when modal opens
    }
  }, [isOpen, serviceRequest]);

  // --- Fetch parts from backend ---
  const fetchParts = async () => {
    setLoading(prev => ({ ...prev, parts: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/parts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
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

  const fetchAvailableServicesAndPackages = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch available services
      const servicesResponse = await fetch('http://localhost:3001/api/services', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setAvailableServices(servicesData);
      }

      // Fetch available service packages
      const packagesResponse = await fetch('http://localhost:3001/api/service-packages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        setAvailablePackages(packagesData);
      }
    } catch (error) {
      console.error('Error fetching available services and packages:', error);
    }
  };

  // --- Add custom part ---
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

  // --- Remove custom part ---
  const removeCustomPart = (id) => {
    setQuotation(prev => ({
      ...prev,
      customParts: prev.customParts.filter(part => part.id !== id)
    }));
  };

  // --- Handle quantity change for custom parts ---
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServicePriceChange = (index, newPrice) => {
    const updatedServices = [...editableServices];
    updatedServices[index] = {
      ...updatedServices[index],
      estimatedPrice: newPrice,
      customPrice: true
    };
    setEditableServices(updatedServices);
  };

  const handlePackagePriceChange = (index, newPrice) => {
    const updatedPackages = [...editablePackages];
    updatedPackages[index] = {
      ...updatedPackages[index],
      estimatedPrice: newPrice,
      customPrice: true
    };
    setEditablePackages(updatedPackages);
  };

  const handleServiceQuantityChange = (index, newQuantity) => {
    const updatedServices = [...editableServices];
    updatedServices[index] = {
      ...updatedServices[index],
      quantity: parseInt(newQuantity) || 1
    };
    setEditableServices(updatedServices);
  };

  const handlePackageQuantityChange = (index, newQuantity) => {
    const updatedPackages = [...editablePackages];
    updatedPackages[index] = {
      ...updatedPackages[index],
      quantity: parseInt(newQuantity) || 1
    };
    setEditablePackages(updatedPackages);
  };

  const removeService = (index) => {
    const updatedServices = editableServices.filter((_, i) => i !== index);
    setEditableServices(updatedServices);
  };

  const removePackage = (index) => {
    const updatedPackages = editablePackages.filter((_, i) => i !== index);
    setEditablePackages(updatedPackages);
  };

  // Add new service from available services
  const addAvailableService = (service) => {
    const newServiceItem = {
      id: Date.now(),
      servicesId: service.servicesId || service.serviceId,
      serviceName: service.servicesName || service.serviceName,
      serviceDescription: service.servicesDescription || service.serviceDescription,
      estimatedPrice: service.price || "",
      quantity: 1,
      customPrice: false,
      originalPrice: service.price || ""
    };
    
    setEditableServices(prev => [...prev, newServiceItem]);
    setShowAddServiceModal(false);
  };

  // Add new package from available packages
  const addAvailablePackage = (pkg) => {
    const newPackageItem = {
      id: Date.now(),
      servicePackageId: pkg.servicePackageId || pkg.packageId,
      packageName: pkg.packageName,
      packageDescription: pkg.packageDescription,
      estimatedPrice: pkg.price || "",
      quantity: 1,
      customPrice: false,
      originalPrice: pkg.price || ""
    };
    
    setEditablePackages(prev => [...prev, newPackageItem]);
    setShowAddPackageModal(false);
  };

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0);
  };

  const calculateTotals = () => {
    // Calculate services total - convert empty strings to 0
    const servicesTotal = editableServices.reduce((total, service) => {
      const price = service.estimatedPrice === "" ? 0 : parseFloat(service.estimatedPrice) || 0;
      return total + (price * (service.quantity || 1));
    }, 0);

    // Calculate packages total - convert empty strings to 0
    const packagesTotal = editablePackages.reduce((total, pkg) => {
      const price = pkg.estimatedPrice === "" ? 0 : parseFloat(pkg.estimatedPrice) || 0;
      return total + (price * (pkg.quantity || 1));
    }, 0);

    // Calculate custom parts total
    const customPartsTotal = quotation.customParts.reduce((total, part) => {
      const price = part.unitPrice || 0;
      const quantity = part.quantity || 1;
      return total + (price * quantity);
    }, 0);

    // Fixed labor cost - convert empty string to 0
    const laborCost = formData.laborCost === "" ? 0 : parseFloat(formData.laborCost) || 0;

    // Calculate subtotal
    const subtotal = servicesTotal + packagesTotal + customPartsTotal + laborCost;

    // Calculate discount
    const discountAmount = subtotal * (parseFloat(formData.discount) / 100);

    // Calculate grand total
    const grandTotal = subtotal - discountAmount;

    return {
      servicesTotal,
      packagesTotal,
      customPartsTotal,
      laborCost,
      subtotal,
      discountAmount,
      grandTotal
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that all services and packages have prices
    const servicesWithoutPrice = editableServices.filter(service => 
      service.estimatedPrice === "" || service.estimatedPrice === "0"
    );
    const packagesWithoutPrice = editablePackages.filter(pkg => 
      pkg.estimatedPrice === "" || pkg.estimatedPrice === "0"
    );

    if (servicesWithoutPrice.length > 0 || packagesWithoutPrice.length > 0) {
      alert("Please enter prices for all services and packages before creating the quotation.");
      return;
    }

    const totals = calculateTotals();

    const quotationData = {
      ...formData,
      serviceRequestId: serviceRequest.serviceRequestId,
      laborCost: formData.laborCost === "" ? 0 : parseFloat(formData.laborCost),
      discount: parseFloat(formData.discount),
      validityPeriod: parseInt(formData.validityPeriod),
      services: editableServices.map(service => ({
        serviceId: service.servicesId || service.serviceId,
        serviceName: service.serviceName || service.servicesName,
        quantity: service.quantity || 1,
        estimatedPrice: service.estimatedPrice === "" ? 0 : parseFloat(service.estimatedPrice),
        customPrice: service.customPrice
      })),
      servicePackages: editablePackages.map(pkg => ({
        packageId: pkg.servicePackageId || pkg.packageId,
        packageName: pkg.packageName,
        quantity: pkg.quantity || 1,
        estimatedPrice: pkg.estimatedPrice === "" ? 0 : parseFloat(pkg.estimatedPrice),
        customPrice: pkg.customPrice
      })),
      customParts: quotation.customParts.map(part => ({
        partId: part.partId,
        partName: part.partName,
        partDescription: part.partDescription,
        unitPrice: part.unitPrice,
        quantity: part.quantity || 1
      })),
      totals,
      // Include customer information for quotation
      customerInfo: {
        customerId: serviceRequest.customerId,
        customerName: serviceRequest.customerName,
        customerEmail: serviceRequest.customerEmail,
        customerPhone: serviceRequest.customerPhone,
        address: serviceRequest.address
      }
    };

    onConvert(quotationData);
  };

  if (!isOpen || !serviceRequest) return null;

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaFileInvoice className="mr-2 text-green-600" />
            Convert to Quotation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <FaUser className="mr-2" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Customer Name:</span>
                    <p className="font-medium">{serviceRequest.customerName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="font-medium">{serviceRequest.customerEmail}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phone:</span>
                    <p className="font-medium">{serviceRequest.customerPhone}</p>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <span className="text-sm text-gray-600">Address:</span>
                    <p className="font-medium">{serviceRequest.address}</p>
                  </div>
                </div>
              </div>

              {/* Service Request Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Service Request Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Service Type:</span>
                    <p className="font-medium">{serviceRequest.serviceType}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Requested Date:</span>
                    <p className="font-medium">
                      {serviceRequest.requestedDate ? 
                        new Date(serviceRequest.requestedDate).toLocaleDateString() : 'Not set'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Assigned Technician:</span>
                    <p className="font-medium">{serviceRequest.assignedTechnician || 'Not assigned'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      serviceRequest.status === 'Reviewed' ? 'bg-purple-100 text-purple-800' : ''
                    }`}>
                      {serviceRequest.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Original Customer Notes */}
              {serviceRequest.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-yellow-600" />
                    Original Service Request Notes
                  </h4>
                  <p className="text-yellow-700 text-sm">{serviceRequest.notes}</p>
                </div>
              )}

              {/* Editable Services Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Services</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-normal text-gray-600">
                      Total: {formatCurrency(totals.servicesTotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddServiceModal(true)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                    >
                      <FaPlus className="mr-1" />
                      Add Service
                    </button>
                  </div>
                </div>
                
                {editableServices.length > 0 ? (
                  <div className="space-y-4">
                    {editableServices.map((service, index) => (
                      <div key={service.id || index} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {service.serviceName || service.servicesName}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {service.serviceDescription || service.servicesDescription}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Quantity */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={service.quantity || 1}
                              onChange={(e) => handleServiceQuantityChange(index, e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          
                          {/* Price */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Price</label>
                            <div className="flex items-center">
                              <span className="text-gray-500 mr-1">₱</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={service.estimatedPrice}
                                onChange={(e) => handleServicePriceChange(index, e.target.value)}
                                placeholder="Enter price"
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            {service.originalPrice && service.originalPrice !== "" && (
                              <p className="text-xs text-gray-500 mt-1">
                                Original: {formatCurrency(service.originalPrice)}
                              </p>
                            )}
                          </div>
                          
                          {/* Total */}
                          <div className="text-right">
                            <label className="text-xs text-gray-500 mb-1 block">Total</label>
                            <p className="font-semibold text-green-700">
                              {formatCurrency((service.estimatedPrice === "" ? 0 : parseFloat(service.estimatedPrice) || 0) * (service.quantity || 1))}
                            </p>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeService(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <p>No services added yet</p>
                    <button
                      type="button"
                      onClick={() => setShowAddServiceModal(true)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                    >
                      <FaPlus className="mr-2" />
                      Add Your First Service
                    </button>
                  </div>
                )}
              </div>

              {/* Editable Service Packages Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Service Packages</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-normal text-gray-600">
                      Total: {formatCurrency(totals.packagesTotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddPackageModal(true)}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
                    >
                      <FaPlus className="mr-1" />
                      Add Package
                    </button>
                  </div>
                </div>
                
                {editablePackages.length > 0 ? (
                  <div className="space-y-4">
                    {editablePackages.map((pkg, index) => (
                      <div key={pkg.id || index} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {pkg.packageName}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {pkg.packageDescription}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Quantity */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={pkg.quantity || 1}
                              onChange={(e) => handlePackageQuantityChange(index, e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          
                          {/* Price */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Price</label>
                            <div className="flex items-center">
                              <span className="text-gray-500 mr-1">₱</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={pkg.estimatedPrice}
                                onChange={(e) => handlePackagePriceChange(index, e.target.value)}
                                placeholder="Enter price"
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            {pkg.originalPrice && pkg.originalPrice !== "" && (
                              <p className="text-xs text-gray-500 mt-1">
                                Original: {formatCurrency(pkg.originalPrice)}
                              </p>
                            )}
                          </div>
                          
                          {/* Total */}
                          <div className="text-right">
                            <label className="text-xs text-gray-500 mb-1 block">Total</label>
                            <p className="font-semibold text-green-700">
                              {formatCurrency((pkg.estimatedPrice === "" ? 0 : parseFloat(pkg.estimatedPrice) || 0) * (pkg.quantity || 1))}
                            </p>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removePackage(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <p>No service packages added yet</p>
                    <button
                      type="button"
                      onClick={() => setShowAddPackageModal(true)}
                      className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto"
                    >
                      <FaPlus className="mr-2" />
                      Add Your First Package
                    </button>
                  </div>
                )}
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
                        type="button"
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
                                type="button"
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

              {/* Quotation Details Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Quotation Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Labor Cost
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2 text-lg">₱</span>
                      <input
                        type="number"
                        name="laborCost"
                        value={formData.laborCost}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        placeholder="Enter labor cost"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Fixed labor cost for the service</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority Level
                    </label>
                    <select 
                      name="priorityLevel"
                      value={formData.priorityLevel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Validity Period (Days)
                    </label>
                    <input
                      type="number"
                      name="validityPeriod"
                      value={formData.validityPeriod}
                      onChange={handleInputChange}
                      min="1"
                      max="365"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quotation Notes
                  </label>
                  <textarea
                    name="quotationDetails"
                    value={formData.quotationDetails}
                    onChange={handleInputChange}
                    placeholder="Enter quotation details, terms, conditions, scope of work, and any other relevant information..."
                    rows="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be included in the quotation document</p>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                  <FaCalculator className="mr-2" />
                  Quotation Summary
                </h4>
                <div className="space-y-2 text-sm">
                  {editableServices.length > 0 && (
                    <div className="flex justify-between">
                      <span>Services:</span>
                      <span>{formatCurrency(totals.servicesTotal)}</span>
                    </div>
                  )}
                  {editablePackages.length > 0 && (
                    <div className="flex justify-between">
                      <span>Service Packages:</span>
                      <span>{formatCurrency(totals.packagesTotal)}</span>
                    </div>
                  )}
                  {quotation.customParts.length > 0 && (
                    <div className="flex justify-between">
                      <span>Custom Parts:</span>
                      <span>{formatCurrency(totals.customPartsTotal)}</span>
                    </div>
                  )}
                  {formData.laborCost !== "" && formData.laborCost !== "0" && (
                    <div className="flex justify-between">
                      <span>Labor Cost:</span>
                      <span>{formatCurrency(totals.laborCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-green-200 pt-2">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {formData.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount ({formData.discount}%):</span>
                      <span>-{formatCurrency(totals.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-green-200 pt-2 font-semibold text-lg">
                    <span>Grand Total:</span>
                    <span className="text-green-700">{formatCurrency(totals.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Quotation Valid For:</span>
                    <span>{formData.validityPeriod} days</span>
                  </div>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Confirmation Required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Converting this service request to a quotation will create a formal quote for the customer. 
                        The quotation will be valid for {formData.validityPeriod} days and include all the specified services, packages, and terms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="flex justify-between p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={actionLoading === serviceRequest?.serviceRequestId}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {actionLoading === serviceRequest?.serviceRequestId ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Quotation...
                </>
              ) : (
                <>
                  <FaFileInvoice className="mr-2" />
                  Create Quotation ({formatCurrency(totals.grandTotal)})
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Add Service</h3>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <h4 className="font-semibold text-gray-800 mb-3">Available Services</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableServices.map(service => (
                  <button
                    key={service.servicesId || service.serviceId}
                    onClick={() => addAvailableService(service)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-800">
                      {service.servicesName || service.serviceName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {service.servicesDescription || service.serviceDescription}
                    </div>
                    {service.price && service.price !== "" && (
                      <div className="text-sm font-semibold text-green-700 mt-1">
                        {formatCurrency(service.price)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Package Modal */}
      {showAddPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Add Service Package</h3>
              <button
                onClick={() => setShowAddPackageModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <h4 className="font-semibold text-gray-800 mb-3">Available Packages</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availablePackages.map(pkg => (
                  <button
                    key={pkg.servicePackageId || pkg.packageId}
                    onClick={() => addAvailablePackage(pkg)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-800">
                      {pkg.packageName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {pkg.packageDescription}
                    </div>
                    {pkg.price && pkg.price !== "" && (
                      <div className="text-sm font-semibold text-green-700 mt-1">
                        {formatCurrency(pkg.price)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// // "use client";

// import { useState, useEffect } from "react";
// import { FaTimes, FaCalculator, FaFileInvoice, FaExclamationTriangle, FaTrash, FaPlus, FaUser } from "react-icons/fa";

// export default function ConvertToQuotationServiceRequest({ 
//   isOpen, 
//   onClose, 
//   serviceRequest,
//   onConvert,
//   actionLoading 
// }) {
//   const [formData, setFormData] = useState({
//     priorityLevel: "Medium",
//     quotationDetails: "",
//     laborCost: "",
//     discount: 0,
//     validityPeriod: 30, // days
//   });

//   const [editableServices, setEditableServices] = useState([]);
//   const [editablePackages, setEditablePackages] = useState([]);
//   const [availableServices, setAvailableServices] = useState([]);
//   const [availablePackages, setAvailablePackages] = useState([]);
//   const [showAddServiceModal, setShowAddServiceModal] = useState(false);
//   const [showAddPackageModal, setShowAddPackageModal] = useState(false);

//   // Reset form when modal opens/closes or service request changes
//   useEffect(() => {
//     if (isOpen && serviceRequest) {
//       setFormData({
//         priorityLevel: "Medium",
//         quotationDetails: serviceRequest.notes || "", // Pre-fill with service request notes
//         laborCost: "",
//         discount: 0,
//         validityPeriod: 30,
//       });

//       // Initialize editable services and packages with prices
//       const servicesWithPrices = (serviceRequest.services || []).map(service => ({
//         ...service,
//         estimatedPrice: service.price || "",
//         customPrice: !service.price,
//         originalPrice: service.price || ""
//       }));

//       const packagesWithPrices = (serviceRequest.servicePackages || []).map(pkg => ({
//         ...pkg,
//         estimatedPrice: pkg.price || "",
//         customPrice: !pkg.price,
//         originalPrice: pkg.price || ""
//       }));

//       setEditableServices(servicesWithPrices);
//       setEditablePackages(packagesWithPrices);
//       fetchAvailableServicesAndPackages();
//     }
//   }, [isOpen, serviceRequest]);

//   const fetchAvailableServicesAndPackages = async () => {
//     try {
//       const token = localStorage.getItem("token");
      
//       // Fetch available services
//       const servicesResponse = await fetch('http://localhost:3001/api/services', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (servicesResponse.ok) {
//         const servicesData = await servicesResponse.json();
//         setAvailableServices(servicesData);
//       }

//       // Fetch available service packages
//       const packagesResponse = await fetch('http://localhost:3001/api/service-packages', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (packagesResponse.ok) {
//         const packagesData = await packagesResponse.json();
//         setAvailablePackages(packagesData);
//       }
//     } catch (error) {
//       console.error('Error fetching available services and packages:', error);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleServicePriceChange = (index, newPrice) => {
//     const updatedServices = [...editableServices];
//     updatedServices[index] = {
//       ...updatedServices[index],
//       estimatedPrice: newPrice,
//       customPrice: true
//     };
//     setEditableServices(updatedServices);
//   };

//   const handlePackagePriceChange = (index, newPrice) => {
//     const updatedPackages = [...editablePackages];
//     updatedPackages[index] = {
//       ...updatedPackages[index],
//       estimatedPrice: newPrice,
//       customPrice: true
//     };
//     setEditablePackages(updatedPackages);
//   };

//   const handleServiceQuantityChange = (index, newQuantity) => {
//     const updatedServices = [...editableServices];
//     updatedServices[index] = {
//       ...updatedServices[index],
//       quantity: parseInt(newQuantity) || 1
//     };
//     setEditableServices(updatedServices);
//   };

//   const handlePackageQuantityChange = (index, newQuantity) => {
//     const updatedPackages = [...editablePackages];
//     updatedPackages[index] = {
//       ...updatedPackages[index],
//       quantity: parseInt(newQuantity) || 1
//     };
//     setEditablePackages(updatedPackages);
//   };

//   const removeService = (index) => {
//     const updatedServices = editableServices.filter((_, i) => i !== index);
//     setEditableServices(updatedServices);
//   };

//   const removePackage = (index) => {
//     const updatedPackages = editablePackages.filter((_, i) => i !== index);
//     setEditablePackages(updatedPackages);
//   };

//   // Add new service from available services
//   const addAvailableService = (service) => {
//     const newServiceItem = {
//       id: Date.now(),
//       servicesId: service.servicesId || service.serviceId,
//       serviceName: service.servicesName || service.serviceName,
//       serviceDescription: service.servicesDescription || service.serviceDescription,
//       estimatedPrice: service.price || "",
//       quantity: 1,
//       customPrice: false,
//       originalPrice: service.price || ""
//     };
    
//     setEditableServices(prev => [...prev, newServiceItem]);
//     setShowAddServiceModal(false);
//   };

//   // Add new package from available packages
//   const addAvailablePackage = (pkg) => {
//     const newPackageItem = {
//       id: Date.now(),
//       servicePackageId: pkg.servicePackageId || pkg.packageId,
//       packageName: pkg.packageName,
//       packageDescription: pkg.packageDescription,
//       estimatedPrice: pkg.price || "",
//       quantity: 1,
//       customPrice: false,
//       originalPrice: pkg.price || ""
//     };
    
//     setEditablePackages(prev => [...prev, newPackageItem]);
//     setShowAddPackageModal(false);
//   };

//   const calculateTotals = () => {
//     // Calculate services total - convert empty strings to 0
//     const servicesTotal = editableServices.reduce((total, service) => {
//       const price = service.estimatedPrice === "" ? 0 : parseFloat(service.estimatedPrice) || 0;
//       return total + (price * (service.quantity || 1));
//     }, 0);

//     // Calculate packages total - convert empty strings to 0
//     const packagesTotal = editablePackages.reduce((total, pkg) => {
//       const price = pkg.estimatedPrice === "" ? 0 : parseFloat(pkg.estimatedPrice) || 0;
//       return total + (price * (pkg.quantity || 1));
//     }, 0);

//     // Fixed labor cost - convert empty string to 0
//     const laborCost = formData.laborCost === "" ? 0 : parseFloat(formData.laborCost) || 0;

//     // Calculate subtotal
//     const subtotal = servicesTotal + packagesTotal + laborCost;

//     // Calculate discount
//     const discountAmount = subtotal * (parseFloat(formData.discount) / 100);

//     // Calculate grand total
//     const grandTotal = subtotal - discountAmount;

//     return {
//       servicesTotal,
//       packagesTotal,
//       laborCost,
//       subtotal,
//       discountAmount,
//       grandTotal
//     };
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Validate that all services and packages have prices
//     const servicesWithoutPrice = editableServices.filter(service => 
//       service.estimatedPrice === "" || service.estimatedPrice === "0"
//     );
//     const packagesWithoutPrice = editablePackages.filter(pkg => 
//       pkg.estimatedPrice === "" || pkg.estimatedPrice === "0"
//     );

//     if (servicesWithoutPrice.length > 0 || packagesWithoutPrice.length > 0) {
//       alert("Please enter prices for all services and packages before creating the quotation.");
//       return;
//     }

//     const totals = calculateTotals();

//     const quotationData = {
//       ...formData,
//       serviceRequestId: serviceRequest.serviceRequestId,
//       laborCost: formData.laborCost === "" ? 0 : parseFloat(formData.laborCost),
//       discount: parseFloat(formData.discount),
//       validityPeriod: parseInt(formData.validityPeriod),
//       services: editableServices.map(service => ({
//         serviceId: service.servicesId || service.serviceId,
//         serviceName: service.serviceName || service.servicesName,
//         quantity: service.quantity || 1,
//         estimatedPrice: service.estimatedPrice === "" ? 0 : parseFloat(service.estimatedPrice),
//         customPrice: service.customPrice
//       })),
//       servicePackages: editablePackages.map(pkg => ({
//         packageId: pkg.servicePackageId || pkg.packageId,
//         packageName: pkg.packageName,
//         quantity: pkg.quantity || 1,
//         estimatedPrice: pkg.estimatedPrice === "" ? 0 : parseFloat(pkg.estimatedPrice),
//         customPrice: pkg.customPrice
//       })),
//       totals,
//       // Include customer information for quotation
//       customerInfo: {
//         customerId: serviceRequest.customerId,
//         customerName: serviceRequest.customerName,
//         customerEmail: serviceRequest.customerEmail,
//         customerPhone: serviceRequest.customerPhone,
//         address: serviceRequest.address
//       }
//     };

//     onConvert(quotationData);
//   };

//   if (!isOpen || !serviceRequest) return null;

//   const totals = calculateTotals();

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <h2 className="text-xl font-bold text-gray-800 flex items-center">
//             <FaFileInvoice className="mr-2 text-green-600" />
//             Convert to Quotation
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors"
//           >
//             <FaTimes className="w-6 h-6" />
//           </button>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           <div className="p-6">
//             <div className="space-y-6">
//               {/* Customer Information */}
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
//                   <FaUser className="mr-2" />
//                   Customer Information
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   <div>
//                     <span className="text-sm text-gray-600">Customer Name:</span>
//                     <p className="font-medium">{serviceRequest.customerName}</p>
//                   </div>
//                   <div>
//                     <span className="text-sm text-gray-600">Email:</span>
//                     <p className="font-medium">{serviceRequest.customerEmail}</p>
//                   </div>
//                   <div>
//                     <span className="text-sm text-gray-600">Phone:</span>
//                     <p className="font-medium">{serviceRequest.customerPhone}</p>
//                   </div>
//                   <div className="md:col-span-2 lg:col-span-3">
//                     <span className="text-sm text-gray-600">Address:</span>
//                     <p className="font-medium">{serviceRequest.address}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Service Request Summary */}
//               <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//                 <h3 className="font-semibold text-gray-800 mb-3">Service Request Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <span className="text-sm text-gray-600">Service Type:</span>
//                     <p className="font-medium">{serviceRequest.serviceType}</p>
//                   </div>
//                   <div>
//                     <span className="text-sm text-gray-600">Requested Date:</span>
//                     <p className="font-medium">
//                       {serviceRequest.requestedDate ? 
//                         new Date(serviceRequest.requestedDate).toLocaleDateString() : 'Not set'
//                       }
//                     </p>
//                   </div>
//                   <div>
//                     <span className="text-sm text-gray-600">Assigned Technician:</span>
//                     <p className="font-medium">{serviceRequest.assignedTechnician || 'Not assigned'}</p>
//                   </div>
//                   <div>
//                     <span className="text-sm text-gray-600">Status:</span>
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                       serviceRequest.status === 'Reviewed' ? 'bg-purple-100 text-purple-800' : ''
//                     }`}>
//                       {serviceRequest.status}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Original Customer Notes */}
//               {serviceRequest.notes && (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                   <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
//                     <FaExclamationTriangle className="mr-2 text-yellow-600" />
//                     Original Service Request Notes
//                   </h4>
//                   <p className="text-yellow-700 text-sm">{serviceRequest.notes}</p>
//                 </div>
//               )}

//               {/* Editable Services Section */}
//               <div className="bg-white border border-gray-200 rounded-lg p-4">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="font-semibold text-gray-800">Services</h3>
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm font-normal text-gray-600">
//                       Total: ₱{totals.servicesTotal.toFixed(2)}
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() => setShowAddServiceModal(true)}
//                       className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
//                     >
//                       <FaPlus className="mr-1" />
//                       Add Service
//                     </button>
//                   </div>
//                 </div>
                
//                 {editableServices.length > 0 ? (
//                   <div className="space-y-4">
//                     {editableServices.map((service, index) => (
//                       <div key={service.id || index} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50">
//                         <div className="flex-1">
//                           <div className="flex items-start justify-between">
//                             <div>
//                               <h4 className="font-medium text-gray-800">
//                                 {service.serviceName || service.servicesName}
//                               </h4>
//                               <p className="text-sm text-gray-600 mt-1">
//                                 {service.serviceDescription || service.servicesDescription}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
                        
//                         <div className="flex items-center gap-3">
//                           {/* Quantity */}
//                           <div>
//                             <label className="text-xs text-gray-500 mb-1 block">Qty</label>
//                             <input
//                               type="number"
//                               min="1"
//                               value={service.quantity || 1}
//                               onChange={(e) => handleServiceQuantityChange(index, e.target.value)}
//                               className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
//                             />
//                           </div>
                          
//                           {/* Price */}
//                           <div>
//                             <label className="text-xs text-gray-500 mb-1 block">Price</label>
//                             <div className="flex items-center">
//                               <span className="text-gray-500 mr-1">₱</span>
//                               <input
//                                 type="number"
//                                 step="0.01"
//                                 min="0"
//                                 value={service.estimatedPrice}
//                                 onChange={(e) => handleServicePriceChange(index, e.target.value)}
//                                 placeholder="Enter price"
//                                 className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
//                               />
//                             </div>
//                             {service.originalPrice && service.originalPrice !== "" && (
//                               <p className="text-xs text-gray-500 mt-1">
//                                 Original: ₱{service.originalPrice}
//                               </p>
//                             )}
//                           </div>
                          
//                           {/* Total */}
//                           <div className="text-right">
//                             <label className="text-xs text-gray-500 mb-1 block">Total</label>
//                             <p className="font-semibold text-green-700">
//                               ₱{((service.estimatedPrice === "" ? 0 : parseFloat(service.estimatedPrice) || 0) * (service.quantity || 1)).toFixed(2)}
//                             </p>
//                           </div>
                          
//                           {/* Remove Button */}
//                           <button
//                             type="button"
//                             onClick={() => removeService(index)}
//                             className="text-red-600 hover:text-red-800 p-2"
//                           >
//                             <FaTrash className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
//                     <p>No services added yet</p>
//                     <button
//                       type="button"
//                       onClick={() => setShowAddServiceModal(true)}
//                       className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
//                     >
//                       <FaPlus className="mr-2" />
//                       Add Your First Service
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Editable Service Packages Section */}
//               <div className="bg-white border border-gray-200 rounded-lg p-4">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="font-semibold text-gray-800">Service Packages</h3>
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm font-normal text-gray-600">
//                       Total: ₱{totals.packagesTotal.toFixed(2)}
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() => setShowAddPackageModal(true)}
//                       className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
//                     >
//                       <FaPlus className="mr-1" />
//                       Add Package
//                     </button>
//                   </div>
//                 </div>
                
//                 {editablePackages.length > 0 ? (
//                   <div className="space-y-4">
//                     {editablePackages.map((pkg, index) => (
//                       <div key={pkg.id || index} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50">
//                         <div className="flex-1">
//                           <div className="flex items-start justify-between">
//                             <div>
//                               <h4 className="font-medium text-gray-800">
//                                 {pkg.packageName}
//                               </h4>
//                               <p className="text-sm text-gray-600 mt-1">
//                                 {pkg.packageDescription}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
                        
//                         <div className="flex items-center gap-3">
//                           {/* Quantity */}
//                           <div>
//                             <label className="text-xs text-gray-500 mb-1 block">Qty</label>
//                             <input
//                               type="number"
//                               min="1"
//                               value={pkg.quantity || 1}
//                               onChange={(e) => handlePackageQuantityChange(index, e.target.value)}
//                               className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
//                             />
//                           </div>
                          
//                           {/* Price */}
//                           <div>
//                             <label className="text-xs text-gray-500 mb-1 block">Price</label>
//                             <div className="flex items-center">
//                               <span className="text-gray-500 mr-1">₱</span>
//                               <input
//                                 type="number"
//                                 step="0.01"
//                                 min="0"
//                                 value={pkg.estimatedPrice}
//                                 onChange={(e) => handlePackagePriceChange(index, e.target.value)}
//                                 placeholder="Enter price"
//                                 className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
//                               />
//                             </div>
//                             {pkg.originalPrice && pkg.originalPrice !== "" && (
//                               <p className="text-xs text-gray-500 mt-1">
//                                 Original: ₱{pkg.originalPrice}
//                               </p>
//                             )}
//                           </div>
                          
//                           {/* Total */}
//                           <div className="text-right">
//                             <label className="text-xs text-gray-500 mb-1 block">Total</label>
//                             <p className="font-semibold text-green-700">
//                               ₱{((pkg.estimatedPrice === "" ? 0 : parseFloat(pkg.estimatedPrice) || 0) * (pkg.quantity || 1)).toFixed(2)}
//                             </p>
//                           </div>
                          
//                           {/* Remove Button */}
//                           <button
//                             type="button"
//                             onClick={() => removePackage(index)}
//                             className="text-red-600 hover:text-red-800 p-2"
//                           >
//                             <FaTrash className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
//                     <p>No service packages added yet</p>
//                     <button
//                       type="button"
//                       onClick={() => setShowAddPackageModal(true)}
//                       className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto"
//                     >
//                       <FaPlus className="mr-2" />
//                       Add Your First Package
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Quotation Details Section */}
//               <div className="space-y-4">
//                 <h3 className="font-semibold text-gray-800">Quotation Details</h3>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Labor Cost (₱)
//                     </label>
//                     <div className="flex items-center">
//                       <span className="text-gray-500 mr-2 text-lg">₱</span>
//                       <input
//                         type="number"
//                         name="laborCost"
//                         value={formData.laborCost}
//                         onChange={handleInputChange}
//                         step="0.01"
//                         min="0"
//                         placeholder="Enter labor cost"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>
//                     <p className="text-xs text-gray-500 mt-1">Fixed labor cost for the service</p>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Discount (%)
//                     </label>
//                     <input
//                       type="number"
//                       name="discount"
//                       value={formData.discount}
//                       onChange={handleInputChange}
//                       placeholder="0"
//                       min="0"
//                       max="100"
//                       step="0.01"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Priority Level
//                     </label>
//                     <select 
//                       name="priorityLevel"
//                       value={formData.priorityLevel}
//                       onChange={handleInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="Low">Low</option>
//                       <option value="Medium">Medium</option>
//                       <option value="High">High</option>
//                       <option value="Urgent">Urgent</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Validity Period (Days)
//                     </label>
//                     <input
//                       type="number"
//                       name="validityPeriod"
//                       value={formData.validityPeriod}
//                       onChange={handleInputChange}
//                       min="1"
//                       max="365"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Quotation Notes
//                   </label>
//                   <textarea
//                     name="quotationDetails"
//                     value={formData.quotationDetails}
//                     onChange={handleInputChange}
//                     placeholder="Enter quotation details, terms, conditions, scope of work, and any other relevant information..."
//                     rows="5"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                   <p className="text-xs text-gray-500 mt-1">This will be included in the quotation document</p>
//                 </div>
//               </div>

//               {/* Cost Summary */}
//               <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                 <h4 className="font-semibold text-green-800 mb-4 flex items-center">
//                   <FaCalculator className="mr-2" />
//                   Quotation Summary
//                 </h4>
//                 <div className="space-y-2 text-sm">
//                   {editableServices.length > 0 && (
//                     <div className="flex justify-between">
//                       <span>Services:</span>
//                       <span>₱{totals.servicesTotal.toFixed(2)}</span>
//                     </div>
//                   )}
//                   {editablePackages.length > 0 && (
//                     <div className="flex justify-between">
//                       <span>Service Packages:</span>
//                       <span>₱{totals.packagesTotal.toFixed(2)}</span>
//                     </div>
//                   )}
//                   {formData.laborCost !== "" && formData.laborCost !== "0" && (
//                     <div className="flex justify-between">
//                       <span>Labor Cost:</span>
//                       <span>₱{totals.laborCost.toFixed(2)}</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between border-t border-green-200 pt-2">
//                     <span>Subtotal:</span>
//                     <span>₱{totals.subtotal.toFixed(2)}</span>
//                   </div>
//                   {formData.discount > 0 && (
//                     <div className="flex justify-between text-red-600">
//                       <span>Discount ({formData.discount}%):</span>
//                       <span>-₱{totals.discountAmount.toFixed(2)}</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between border-t border-green-200 pt-2 font-semibold text-lg">
//                     <span>Grand Total:</span>
//                     <span className="text-green-700">₱{totals.grandTotal.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between text-xs text-gray-500 mt-2">
//                     <span>Quotation Valid For:</span>
//                     <span>{formData.validityPeriod} days</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Warning Notice */}
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                 <div className="flex">
//                   <div className="flex-shrink-0">
//                     <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
//                   </div>
//                   <div className="ml-3">
//                     <h3 className="text-sm font-medium text-yellow-800">
//                       Confirmation Required
//                     </h3>
//                     <div className="mt-2 text-sm text-yellow-700">
//                       <p>
//                         Converting this service request to a quotation will create a formal quote for the customer. 
//                         The quotation will be valid for {formData.validityPeriod} days and include all the specified services, packages, and terms.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Footer Actions */}
//           <div className="flex justify-between p-6 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//             >
//               Cancel
//             </button>
            
//             <button
//               type="submit"
//               disabled={actionLoading === serviceRequest?.serviceRequestId}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
//             >
//               {actionLoading === serviceRequest?.serviceRequestId ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Creating Quotation...
//                 </>
//               ) : (
//                 <>
//                   <FaFileInvoice className="mr-2" />
//                   Create Quotation (₱{totals.grandTotal.toFixed(2)})
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Add Service Modal */}
//       {showAddServiceModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
//           <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <h3 className="text-lg font-bold text-gray-800">Add Service</h3>
//               <button
//                 onClick={() => setShowAddServiceModal(false)}
//                 className="text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 <FaTimes className="w-5 h-5" />
//               </button>
//             </div>
            
//             <div className="p-6">
//               <h4 className="font-semibold text-gray-800 mb-3">Available Services</h4>
//               <div className="space-y-2 max-h-60 overflow-y-auto">
//                 {availableServices.map(service => (
//                   <button
//                     key={service.servicesId || service.serviceId}
//                     onClick={() => addAvailableService(service)}
//                     className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//                   >
//                     <div className="font-medium text-gray-800">
//                       {service.servicesName || service.serviceName}
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       {service.servicesDescription || service.serviceDescription}
//                     </div>
//                     {service.price && service.price !== "" && (
//                       <div className="text-sm font-semibold text-green-700 mt-1">
//                         ₱{service.price}
//                       </div>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add Package Modal */}
//       {showAddPackageModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
//           <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <h3 className="text-lg font-bold text-gray-800">Add Service Package</h3>
//               <button
//                 onClick={() => setShowAddPackageModal(false)}
//                 className="text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 <FaTimes className="w-5 h-5" />
//               </button>
//             </div>
            
//             <div className="p-6">
//               <h4 className="font-semibold text-gray-800 mb-3">Available Packages</h4>
//               <div className="space-y-2 max-h-60 overflow-y-auto">
//                 {availablePackages.map(pkg => (
//                   <button
//                     key={pkg.servicePackageId || pkg.packageId}
//                     onClick={() => addAvailablePackage(pkg)}
//                     className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//                   >
//                     <div className="font-medium text-gray-800">
//                       {pkg.packageName}
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       {pkg.packageDescription}
//                     </div>
//                     {pkg.price && pkg.price !== "" && (
//                       <div className="text-sm font-semibold text-green-700 mt-1">
//                         ₱{pkg.price}
//                       </div>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }