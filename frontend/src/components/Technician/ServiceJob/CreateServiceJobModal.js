"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaCalendarAlt, FaClock, FaUserPlus, FaExclamationTriangle, FaMapMarkerAlt, FaFileAlt, FaTools, FaStickyNote } from "react-icons/fa";

const CreateServiceJobModal = ({ onClose, onCreate, technicians }) => {
  const [formData, setFormData] = useState({
    quotationId: "",
    scheduledDate: "",
    scheduledTime: "",
    priority: "Medium",
    assignedTechnicians: [],
    specialRequirements: "",
    additionalNotes: ""
  });

  const [quotations, setQuotations] = useState([
    {
      id: "QT-001",
      customerName: "John Smith",
      customerPhone: "+1 (555) 123-4567",
      customerEmail: "john.smith@email.com",
      serviceType: "AC Repair",
      description: "AC not cooling properly, making strange noises",
      estimatedDuration: "2-3 hours",
      address: "123 Main St, Apt 4B, New York, NY 10001",
      totalAmount: "$350.00",
      createdAt: "2024-01-15"
    },
    {
      id: "QT-002",
      customerName: "Sarah Johnson",
      customerPhone: "+1 (555) 987-6543",
      customerEmail: "sarah.j@email.com",
      serviceType: "Heating System",
      description: "Furnace not turning on, pilot light issue suspected",
      estimatedDuration: "1-2 hours",
      address: "456 Oak Avenue, Brooklyn, NY 11201",
      totalAmount: "$275.00",
      createdAt: "2024-01-14"
    },
    {
      id: "QT-003",
      customerName: "Robert Chen",
      customerPhone: "+1 (555) 456-7890",
      customerEmail: "r.chen@email.com",
      serviceType: "Maintenance",
      description: "Regular seasonal maintenance for HVAC system",
      estimatedDuration: "1 hour",
      address: "789 Park Lane, Queens, NY 11355",
      totalAmount: "$150.00",
      createdAt: "2024-01-13"
    }
  ]);

  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ]);

  const priorities = [
    { value: "Low", label: "Low", color: "text-green-600" },
    { value: "Medium", label: "Medium", color: "text-yellow-600" },
    { value: "High", label: "High", color: "text-orange-600" },
    { value: "Urgent", label: "Urgent", color: "text-red-600" }
  ];

  // Update form when quotation is selected
  useEffect(() => {
    if (formData.quotationId) {
      const quotation = quotations.find(q => q.id === formData.quotationId);
      setSelectedQuotation(quotation);
    } else {
      setSelectedQuotation(null);
    }
  }, [formData.quotationId, quotations]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedQuotation) {
      alert("Please select a quotation");
      return;
    }

    if (!formData.scheduledDate || !formData.scheduledTime) {
      alert("Please fill in all required fields");
      return;
    }

    const newJobData = {
      customerName: selectedQuotation.customerName,
      customerPhone: selectedQuotation.customerPhone,
      customerEmail: selectedQuotation.customerEmail,
      serviceType: selectedQuotation.serviceType,
      description: selectedQuotation.description,
      estimatedDuration: selectedQuotation.estimatedDuration,
      address: selectedQuotation.address,
      quotationId: selectedQuotation.id,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      priority: formData.priority,
      assignedTechnicians: formData.assignedTechnicians,
      specialRequirements: formData.specialRequirements,
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
    const inputValue = e.target.value;
    // Basic DD/MM/YYYY format validation
    if (inputValue === "" || /^\d{2}\/\d{2}\/\d{4}$/.test(inputValue)) {
      setFormData(prev => ({
        ...prev,
        scheduledDate: inputValue
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              {/* Quotation Selection */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaFileAlt className="mr-2 text-blue-600" />
                  Quotation ID *
                </label>
                <select
                  value={formData.quotationId}
                  onChange={(e) => setFormData(prev => ({ ...prev, quotationId: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                >
                  <option value="">Select a quotation</option>
                  {quotations.map(quotation => (
                    <option key={quotation.id} value={quotation.id}>
                      {quotation.id} - {quotation.customerName} - {quotation.serviceType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaCalendarAlt className="mr-2 text-blue-600" />
                  Scheduled Date *
                </label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={formData.scheduledDate}
                  onChange={handleDateChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Format: DD/MM/YYYY</p>
              </div>

              {/* Scheduled Time */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaClock className="mr-2 text-blue-600" />
                  Scheduled Time *
                </label>
                <select
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                >
                  <option value="">Select time</option>
                  {availableTimes.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaExclamationTriangle className="mr-2 text-blue-600" />
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column - Quotation Details and Technicians */}
            <div className="space-y-6">
              {/* Quotation Details */}
              {selectedQuotation && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Quotation Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{selectedQuotation.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Type:</span>
                      <span className="font-medium">{selectedQuotation.serviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Duration:</span>
                      <span className="font-medium">{selectedQuotation.estimatedDuration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-green-600">{selectedQuotation.totalAmount}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{selectedQuotation.address}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-start">
                        <FaFileAlt className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{selectedQuotation.description}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Technicians */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaUserPlus className="mr-2 text-blue-600" />
                  Assigned Technicians
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-xl p-3">
                  {technicians.map(technician => (
                    <label key={technician.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assignedTechnicians.includes(technician.id)}
                        onChange={() => handleTechnicianToggle(technician.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">{technician.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({technician.specialty})</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        technician.status === 'Available' ? 'bg-green-100 text-green-800' :
                        technician.status === 'On Job' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {technician.status}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.assignedTechnicians.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Selected technicians:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.assignedTechnicians.map(techId => (
                        <span
                          key={techId}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {getTechnicianName(techId)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Special Requirements */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaTools className="mr-2 text-blue-600" />
                  Special Requirements
                </label>
                <textarea
                  placeholder="Any special tools, access requirements, or safety considerations..."
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaStickyNote className="mr-2 text-blue-600" />
                  Additional Notes
                </label>
                <textarea
                  placeholder="Any additional notes or instructions..."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
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