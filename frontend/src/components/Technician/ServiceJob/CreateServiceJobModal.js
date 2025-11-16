"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaCalendarAlt, FaUserPlus, FaMapMarkerAlt, FaFileAlt, FaCar, FaStickyNote, FaSearch, FaBriefcase } from "react-icons/fa";

const CreateServiceJobModal = ({ onClose, onCreate, technicians }) => {
  const [formData, setFormData] = useState({
    quotationId: "",
    scheduledDate: "",
    assignedTechnicians: [],
    vehiclePlateNumber: "",
    guestPlateNumber: "",
    guestBrand: "",
    guestModel: "",
    guestYear: "",
    additionalNotes: ""
  });

  const [quotations, setQuotations] = useState([
    {
      id: "QT-001",
      customerName: "John Smith",
      customerPhone: "+1 (555) 123-4567",
      customerEmail: "john.smith@email.com",
      serviceType: "AC Repair",
      quotationNotes: "AC not cooling properly, making strange noises",
      estimatedDuration: "2-3 hours",
      address: "123 Main St, Apt 4B, New York, NY 10001",
      totalAmount: "₱18,500.00",
      createdAt: "2024-01-15",
      customerVehicles: [
        { plateNumber: "ABC123", brand: "Toyota", model: "Camry", year: 2020 },
        { plateNumber: "XYZ789", brand: "Honda", model: "CR-V", year: 2022 }
      ]
    },
    {
      id: "QT-002",
      customerName: "Sarah Johnson",
      customerPhone: "+1 (555) 987-6543",
      customerEmail: "sarah.j@email.com",
      serviceType: "Heating System",
      quotationNotes: "Furnace not turning on, pilot light issue suspected",
      estimatedDuration: "1-2 hours",
      address: "456 Oak Avenue, Brooklyn, NY 11201",
      totalAmount: "₱14,500.00",
      createdAt: "2024-01-14",
      customerVehicles: [
        { plateNumber: "DEF456", brand: "Ford", model: "F-150", year: 2021 }
      ]
    },
    {
      id: "QT-003",
      customerName: "Robert Chen",
      customerPhone: "+1 (555) 456-7890",
      customerEmail: "r.chen@email.com",
      serviceType: "Maintenance",
      quotationNotes: "Regular seasonal maintenance for HVAC system",
      estimatedDuration: "1 hour",
      address: "789 Park Lane, Queens, NY 11355",
      totalAmount: "₱7,900.00",
      createdAt: "2024-01-13",
      customerVehicles: []
    }
  ]);

  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");

  useEffect(() => {
    if (formData.quotationId) {
      const quotation = quotations.find(q => q.id === formData.quotationId);
      setSelectedQuotation(quotation);
      setFormData(prev => ({
        ...prev,
        vehiclePlateNumber: "",
        guestPlateNumber: "",
        guestBrand: "",
        guestModel: "",
        guestYear: ""
      }));
    } else {
      setSelectedQuotation(null);
    }
  }, [formData.quotationId, quotations]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredQuotations(quotations);
    } else {
      const filtered = quotations.filter(quotation =>
        quotation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredQuotations(filtered);
    }
  }, [searchQuery, quotations]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedQuotation) {
      alert("Please select a quotation");
      return;
    }

    if (!formData.scheduledDate) {
      alert("Please select a scheduled date");
      return;
    }

    if (!formData.vehiclePlateNumber && !formData.guestPlateNumber) {
      alert("Please provide vehicle information - either select a registered vehicle or fill in guest vehicle details");
      return;
    }

    if (formData.guestPlateNumber && (!formData.guestBrand || !formData.guestModel || !formData.guestYear)) {
      alert("Please fill in all guest vehicle information (Brand, Model, and Year)");
      return;
    }

    const newJobData = {
      customerName: selectedQuotation.customerName,
      customerPhone: selectedQuotation.customerPhone,
      customerEmail: selectedQuotation.customerEmail,
      serviceType: selectedQuotation.serviceType,
      quotationNotes: selectedQuotation.quotationNotes,
      estimatedDuration: selectedQuotation.estimatedDuration,
      address: selectedQuotation.address,
      quotationId: selectedQuotation.id,
      scheduledDate: formData.scheduledDate,
      assignedTechnicians: formData.assignedTechnicians,
      vehiclePlateNumber: formData.vehiclePlateNumber,
      guestPlateNumber: formData.guestPlateNumber,
      guestBrand: formData.guestBrand,
      guestModel: formData.guestModel,
      guestYear: formData.guestYear,
      notes: formData.additionalNotes
    };

    onCreate(newJobData);
  };

  const handleTechnicianToggle = (technicianId) => {
    setFormData(prev => {
      const isSelected = prev.assignedTechnicians.includes(technicianId);
      if (isSelected) {
        return {
          ...prev,
          assignedTechnicians: prev.assignedTechnicians.filter(id => id !== technicianId)
        };
      } else {
        return {
          ...prev,
          assignedTechnicians: [...prev.assignedTechnicians, technicianId]
        };
      }
    });
  };

  const getTechnicianName = (technicianId) => {
    const tech = technicians.find(t => t.id === technicianId);
    return tech ? tech.name : "Unknown";
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({
      ...prev,
      scheduledDate: e.target.value
    }));
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handleGuestVehicleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vehiclePlateNumber: "",
      [field]: value
    }));
  };

  const handleQuotationSelect = (quotation) => {
    setFormData(prev => ({ ...prev, quotationId: quotation.id }));
    setSelectedQuotation(quotation);
    setSearchQuery("");
  };

  const getJobCountBadge = (currentJobs) => {
    if (currentJobs === 0) {
      return "bg-green-100 text-green-800";
    } else if (currentJobs <= 2) {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  const getJobCountText = (currentJobs) => {
    if (currentJobs === 0) {
      return "No current jobs";
    } else if (currentJobs === 1) {
      return "1 current job";
    } else {
      return `${currentJobs} current jobs`;
    }
  };

  // Get today's date in YYYY-MM-DD format for the calendar min attribute
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Create New Service Job</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            Create a new service job from existing quotation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Vehicle Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                  <FaCar className="mr-3 text-blue-600" />
                  Vehicle Information *
                </h3>
                
                {/* Search Vehicle Plate Number */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Search Vehicle Plate Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search existing vehicles by plate number..."
                      value={vehicleSearchQuery}
                      onChange={(e) => setVehicleSearchQuery(e.target.value)}
                      className="w-full p-4 pl-12 border border-gray-300 rounded-xl transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Search for existing vehicles in the system</p>
                </div>

                {/* Actual Plate Number Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Vehicle Plate Number *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter actual plate number (e.g., ABC123, XYZ789)"
                    value={formData.guestPlateNumber}
                    onChange={(e) => handleGuestVehicleChange('guestPlateNumber', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <p className="text-xs text-gray-500 mt-2">This will be the plate number used for the service job</p>
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Toyota, Honda"
                      value={formData.guestBrand}
                      onChange={(e) => handleGuestVehicleChange('guestBrand', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Camry, Civic"
                      value={formData.guestModel}
                      onChange={(e) => handleGuestVehicleChange('guestModel', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <select
                      value={formData.guestYear}
                      onChange={(e) => handleGuestVehicleChange('guestYear', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Select year</option>
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vehicle Info Status */}
                {(formData.guestPlateNumber) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <p className="text-green-800 font-medium text-sm">
                      <FaCar className="inline mr-2" />
                      Guest vehicle registered: {formData.guestPlateNumber} - {formData.guestBrand} {formData.guestModel} ({formData.guestYear})
                    </p>
                  </div>
                )}
              </div>

              {/* Scheduling Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Scheduling</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Scheduled Date */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                      <FaCalendarAlt className="mr-2 text-blue-600" />
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={handleDateChange}
                      min={getTodayDate()}
                      className="w-full p-4 border border-gray-300 rounded-xl transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">Select the date for the service job</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Searchable Quotation Selection */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                  <FaFileAlt className="mr-3 text-blue-600" />
                  Search Quotation *
                </h3>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search by quotation ID, customer name, or service type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-4 pl-12 border border-gray-300 rounded-xl transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
                {/* Quotation Results */}
                <div className="border border-gray-300 rounded-xl overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    {filteredQuotations.length > 0 ? (
                      filteredQuotations.map(quotation => (
                        <div
                          key={quotation.id}
                          onClick={() => handleQuotationSelect(quotation)}
                          className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors ${
                            selectedQuotation?.id === quotation.id ? 'bg-blue-100 border-blue-300' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-semibold text-gray-800 text-lg">{quotation.id}</span>
                              <span className="text-gray-600 ml-2">- {quotation.customerName}</span>
                            </div>
                            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                              {quotation.serviceType}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{quotation.quotationNotes}</p>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-green-600">{quotation.totalAmount}</span>
                            <span className="text-gray-500">{quotation.estimatedDuration}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        No quotations found matching your search.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quotation Details */}
              {selectedQuotation && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 text-lg mb-4">Selected Quotation Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Customer:</span>
                        <span className="font-medium text-gray-800">{selectedQuotation.customerName}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Phone:</span>
                        <span className="font-medium text-gray-800">{selectedQuotation.customerPhone}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Email:</span>
                        <span className="font-medium text-gray-800">{selectedQuotation.customerEmail}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Service Type:</span>
                        <span className="font-medium text-gray-800">{selectedQuotation.serviceType}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Estimated Duration:</span>
                        <span className="font-medium text-gray-800">{selectedQuotation.estimatedDuration}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Total Amount:</span>
                        <span className="font-medium text-green-600 text-lg">{selectedQuotation.totalAmount}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-start mb-3">
                        <FaMapMarkerAlt className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-gray-600 block mb-1">Address:</span>
                          <span className="text-gray-800">{selectedQuotation.address}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FaFileAlt className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-gray-600 block mb-1">Quotation Notes:</span>
                          <span className="text-gray-800">{selectedQuotation.quotationNotes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Technicians */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                  <FaUserPlus className="mr-3 text-blue-600" />
                  Assigned Technicians
                </h3>
                
                {/* Selected Technicians Preview */}
                {formData.assignedTechnicians.length > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected technicians:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.assignedTechnicians.map(techId => (
                        <span
                          key={techId}
                          className="bg-blue-100 text-blue-800 text-sm px-3 py-2 rounded-full font-medium flex items-center"
                        >
                          {getTechnicianName(techId)}
                          <button
                            type="button"
                            onClick={() => handleTechnicianToggle(techId)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technicians List */}
                <div className="border border-gray-300 rounded-xl overflow-hidden">
                  <div className="max-h-80 overflow-y-auto">
                    {technicians.map(technician => (
                      <label 
                        key={technician.id} 
                        className={`flex items-center p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                          formData.assignedTechnicians.includes(technician.id) ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedTechnicians.includes(technician.id)}
                          onChange={() => handleTechnicianToggle(technician.id)}
                          className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800 text-lg">{technician.name}</span>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 ${getJobCountBadge(technician.currentJobs)}`}>
                              <FaBriefcase className="text-xs" />
                              {getJobCountText(technician.currentJobs)}
                            </span>
                          </div>
                          {technician.currentJobs > 0 && (
                            <p className="text-xs text-gray-600 mt-2">
                              Currently assigned to {technician.currentJobs} job{technician.currentJobs !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                {technicians.length === 0 && (
                  <div className="text-center p-6 text-gray-500">
                    No technicians available.
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                  <FaStickyNote className="mr-3 text-blue-600" />
                  Additional Notes
                </h3>
                <textarea
                  placeholder="Any additional notes or instructions for the technicians..."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  rows="4"
                  className="w-full p-4 border border-gray-300 rounded-xl transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-8 mt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg shadow-sm hover:shadow-md"
            >
              Create Service Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateServiceJobModal;