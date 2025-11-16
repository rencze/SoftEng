"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaCalendarAlt, FaUserPlus, FaMapMarkerAlt, FaFileAlt, FaCar, FaStickyNote, FaSearch, FaBriefcase } from "react-icons/fa";

const CreateServiceJobModal = ({ onClose, onCreate }) => {
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

  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isVehicleFound, setIsVehicleFound] = useState(false);
  const [isLoadingQuotations, setIsLoadingQuotations] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);

  // Load only approved quotations and technicians on component mount
  useEffect(() => {
    loadApprovedQuotations();
    loadTechnicians();
  }, []);

  // Load only approved quotations
  const loadApprovedQuotations = async () => {
    setIsLoadingQuotations(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/quotations", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch quotations");
      }

      const allQuotations = await response.json();
      
      // Filter only approved quotations
      const approvedQuotations = allQuotations.filter(
        quotation => quotation.displayStatus === 'Approved' || quotation.status === 'Approved'
      );
      
      setQuotations(approvedQuotations);
      setFilteredQuotations(approvedQuotations);
    } catch (error) {
      console.error("Error loading quotations:", error);
      setSearchError("Failed to load approved quotations");
    } finally {
      setIsLoadingQuotations(false);
    }
  };

  // Load technicians with job counts
  const loadTechnicians = async () => {
    setIsLoadingTechnicians(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/technicians", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch technicians");
      }

      const techniciansData = await response.json();
      
      // Also fetch current job counts for each technician
      const techniciansWithJobCounts = await Promise.all(
        techniciansData.map(async (technician) => {
          try {
            const jobCountResponse = await fetch(`http://localhost:3001/api/service-jobs/technician/${technician.technicianId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            let currentJobCount = 0;
            if (jobCountResponse.ok) {
              const jobs = await jobCountResponse.json();
              currentJobCount = jobs.length;
            }

            return {
              ...technician,
              currentJobCount,
              technicianName: `${technician.firstName} ${technician.lastName}`,
              email: technician.email,
              contactNumber: technician.contactNumber
            };
          } catch (error) {
            console.error(`Error fetching jobs for technician ${technician.technicianId}:`, error);
            return {
              ...technician,
              currentJobCount: 0,
              technicianName: `${technician.firstName} ${technician.lastName}`,
              email: technician.email,
              contactNumber: technician.contactNumber
            };
          }
        })
      );

      setTechnicians(techniciansWithJobCounts);
    } catch (error) {
      console.error("Error loading technicians:", error);
      setTechnicians([]);
    } finally {
      setIsLoadingTechnicians(false);
    }
  };

  // Filter approved quotations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredQuotations(quotations);
      return;
    }

    const filtered = quotations.filter(quotation => {
      const searchLower = searchQuery.toLowerCase();
      return (
        quotation.quotationNumber?.toLowerCase().includes(searchLower) ||
        quotation.customerName?.toLowerCase().includes(searchLower) ||
        quotation.serviceRequestNumber?.toLowerCase().includes(searchLower) ||
        quotation.email?.toLowerCase().includes(searchLower) ||
        quotation.phone?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredQuotations(filtered);
  }, [searchQuery, quotations]);

  // Auto-search when vehicle search query changes (with debounce)
  useEffect(() => {
    const searchVehicles = async () => {
      if (!vehicleSearchQuery.trim()) {
        setSearchResults([]);
        setSearchError("");
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setSearchError("");

      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3001/api/vehicles", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch vehicles");
        }

        const allVehicles = await response.json();
        
        // Filter vehicles by plate number (case insensitive)
        const filtered = allVehicles.filter(vehicle =>
          vehicle.plateNumber?.toLowerCase().includes(vehicleSearchQuery.toLowerCase())
        );

        setSearchResults(filtered);
        
        if (filtered.length === 0) {
          setSearchError("No vehicles found with this plate number");
        }
      } catch (error) {
        console.error("Error searching vehicles:", error);
        setSearchError("Failed to search vehicles. Please try again.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      searchVehicles();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [vehicleSearchQuery]);

  // Handle quotation selection
  const handleQuotationSelect = (quotation) => {
    setSelectedQuotation(quotation);
    setFormData(prev => ({
      ...prev,
      quotationId: quotation.quotationId
    }));
    setSearchQuery(quotation.quotationNumber || `QTN-${quotation.quotationId}`);
  };

  // Handle technician selection
  const handleTechnicianSelect = (technicianId) => {
    setFormData(prev => {
      const isCurrentlySelected = prev.assignedTechnicians.includes(technicianId);
      
      if (isCurrentlySelected) {
        // Remove technician
        return {
          ...prev,
          assignedTechnicians: prev.assignedTechnicians.filter(id => id !== technicianId)
        };
      } else {
        // Add technician
        return {
          ...prev,
          assignedTechnicians: [...prev.assignedTechnicians, technicianId]
        };
      }
    });
  };

  // Auto-fill form when a vehicle is selected from search results
  const handleVehicleSelect = (vehicle) => {
    setFormData(prev => ({
      ...prev,
      vehiclePlateNumber: vehicle.plateNumber,
      guestPlateNumber: vehicle.plateNumber,
      guestBrand: vehicle.brand,
      guestModel: vehicle.model,
      guestYear: vehicle.year.toString()
    }));
    
    setVehicleSearchQuery(vehicle.plateNumber);
    setSearchResults([]);
    setIsVehicleFound(true);
    setSearchError("");
  };

  // Handle manual vehicle details change
  const handleManualVehicleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If user starts typing manually, clear the found vehicle status
    if (field === 'guestPlateNumber' && value !== vehicleSearchQuery) {
      setIsVehicleFound(false);
    }
  };

  // Clear vehicle search and reset vehicle status
  const clearVehicleSearch = () => {
    setVehicleSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    setIsVehicleFound(false);
    setFormData(prev => ({
      ...prev,
      guestPlateNumber: "",
      guestBrand: "",
      guestModel: "",
      guestYear: ""
    }));
  };

  // Clear quotation selection
  const clearQuotationSelection = () => {
    setSelectedQuotation(null);
    setSearchQuery("");
    setFormData(prev => ({
      ...prev,
      quotationId: ""
    }));
  };

  // Get technician name by ID
  const getTechnicianName = (technicianId) => {
    const technician = technicians.find(t => t.technicianId === technicianId);
    return technician ? technician.technicianName : 'Unknown Technician';
  };

  // Get technician job count
  const getTechnicianJobCount = (technicianId) => {
    const technician = technicians.find(t => t.technicianId === technicianId);
    return technician ? technician.currentJobCount : 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.quotationId) {
      alert("Please select an approved quotation");
      return;
    }

    if (!formData.guestPlateNumber || !formData.guestBrand || !formData.guestModel || !formData.guestYear) {
      alert("Please fill in all required vehicle information");
      return;
    }

    if (!formData.scheduledDate) {
      alert("Please select a scheduled date");
      return;
    }

    try {
      // Check if vehicle exists in the system
      const token = localStorage.getItem("token");
      const vehiclesResponse = await fetch("http://localhost:3001/api/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (vehiclesResponse.ok) {
        const allVehicles = await vehiclesResponse.json();
        const existingVehicle = allVehicles.find(
          v => v.plateNumber === formData.guestPlateNumber
        );

        if (!existingVehicle) {
          // Create new vehicle if it doesn't exist
          const createResponse = await fetch("http://localhost:3001/api/vehicles", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              plateNumber: formData.guestPlateNumber,
              brand: formData.guestBrand,
              model: formData.guestModel,
              year: parseInt(formData.guestYear)
            }),
          });

          if (!createResponse.ok) {
            throw new Error("Failed to create vehicle");
          }
        }
      }

      // Proceed with service job creation
      onCreate(formData);
    } catch (error) {
      console.error("Error creating service job:", error);
      alert("Failed to create service job. Please try again.");
    }
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
            Create a new service job from approved quotation
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
                    Search Existing Vehicle by Plate Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter plate number to search existing vehicles..."
                      value={vehicleSearchQuery}
                      onChange={(e) => setVehicleSearchQuery(e.target.value)}
                      className="w-full p-4 pl-12 pr-12 border border-gray-300 rounded-xl transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    
                    {/* Clear button */}
                    {vehicleSearchQuery && (
                      <button
                        type="button"
                        onClick={clearVehicleSearch}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes />
                      </button>
                    )}
                    
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Search for existing vehicles in the system. Click on a result to auto-fill the form.
                  </p>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                      {searchResults.map((vehicle) => (
                        <div
                          key={vehicle.vehicleId}
                          onClick={() => handleVehicleSelect(vehicle)}
                          className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-800">{vehicle.plateNumber}</p>
                              <p className="text-sm text-gray-600">
                                {vehicle.brand} {vehicle.model} ({vehicle.year})
                              </p>
                            </div>
                            <span className="text-blue-600 text-sm font-medium">Click to select</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search Error */}
                  {searchError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{searchError}</p>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or enter vehicle details manually</span>
                  </div>
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
                    onChange={(e) => handleManualVehicleChange('guestPlateNumber', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
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
                      onChange={(e) => handleManualVehicleChange('guestBrand', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
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
                      onChange={(e) => handleManualVehicleChange('guestModel', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <select
                      value={formData.guestYear}
                      onChange={(e) => handleManualVehicleChange('guestYear', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    >
                      <option value="">Select year</option>
                      {Array.from({ length: 30 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Vehicle Info Status */}
                {formData.guestPlateNumber && (
                  <div className={`border rounded-lg p-4 mt-4 ${
                    isVehicleFound 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <p className={`font-medium text-sm ${
                      isVehicleFound ? 'text-green-800' : 'text-blue-800'
                    }`}>
                      <FaCar className="inline mr-2" />
                      {isVehicleFound ? "Registered vehicle found: " : "Guest vehicle registered: "} 
                      {formData.guestPlateNumber} - {formData.guestBrand} {formData.guestModel} ({formData.guestYear})
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
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
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
                  Select Approved Quotation *
                </h3>
                
                {/* Selected Quotation Preview */}
                {selectedQuotation && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-green-800 text-lg">
                          {selectedQuotation.quotationNumber}
                        </p>
                        <p className="text-sm text-green-700">
                          Customer: {selectedQuotation.customerName}
                        </p>
                        <p className="text-sm text-green-600">
                          Total: ${selectedQuotation.totalCost}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearQuotationSelection}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search approved quotations by ID, customer name, or service request..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-4 pl-12 border border-gray-300 rounded-xl transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* Approved Quotations Counter */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    Showing {filteredQuotations.length} approved quotation{filteredQuotations.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                {/* Quotation Results */}
                <div className="border border-gray-300 rounded-xl overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    {isLoadingQuotations ? (
                      <div className="p-6 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        Loading approved quotations...
                      </div>
                    ) : filteredQuotations.length > 0 ? (
                      filteredQuotations.map(quotation => (
                        <div
                          key={quotation.quotationId}
                          onClick={() => handleQuotationSelect(quotation)}
                          className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                            selectedQuotation?.quotationId === quotation.quotationId 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-semibold text-gray-800 text-lg">
                                {quotation.quotationNumber}
                              </span>
                              <span className="text-gray-600 ml-2">- {quotation.customerName}</span>
                            </div>
                            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                              Approved
                            </span>
                          </div>
                          {quotation.serviceRequestNumber && (
                            <p className="text-sm text-gray-600 mb-1">
                              Service Request: {quotation.serviceRequestNumber}
                            </p>
                          )}
                          <p className="text-gray-600 mb-3 text-sm">{quotation.quote || 'No description'}</p>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-green-600">${quotation.totalCost}</span>
                            <span className="text-gray-500">
                              {quotation.workTimeEstimation || 'No time estimate'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        {searchQuery 
                          ? 'No approved quotations found matching your search.' 
                          : 'No approved quotations available. Please approve quotations first.'
                        }
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
                        <span className="font-medium text-gray-800">{selectedQuotation.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Email:</span>
                        <span className="font-medium text-gray-800">{selectedQuotation.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Status:</span>
                        <span className="font-medium text-green-600">Approved</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Work Estimation:</span>
                        <span className="font-medium text-gray-800">{selectedQuotation.workTimeEstimation || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Total Amount:</span>
                        <span className="font-medium text-green-600 text-lg">${selectedQuotation.totalCost}</span>
                      </div>
                    </div>
                    {selectedQuotation.address && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-start mb-3">
                          <FaMapMarkerAlt className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                          <div>
                            <span className="text-sm text-gray-600 block mb-1">Address:</span>
                            <span className="text-gray-800">{selectedQuotation.address}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedQuotation.quote && (
                      <div className="flex items-start">
                        <FaFileAlt className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-gray-600 block mb-1">Quotation Notes:</span>
                          <span className="text-gray-800">{selectedQuotation.quote}</span>
                        </div>
                      </div>
                    )}
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
                            onClick={() => handleTechnicianSelect(techId)}
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
                    {isLoadingTechnicians ? (
                      <div className="p-6 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        Loading technicians...
                      </div>
                    ) : technicians.length > 0 ? (
                      technicians.map(technician => (
                        <label 
                          key={technician.technicianId} 
                          className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignedTechnicians.includes(technician.technicianId)}
                            onChange={() => handleTechnicianSelect(technician.technicianId)}
                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-800 text-lg">{technician.technicianName}</span>
                              <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 ${
                                technician.currentJobCount === 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : technician.currentJobCount <= 2
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                <FaBriefcase className="text-xs" />
                                {technician.currentJobCount} current job{technician.currentJobCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-600">
                              {technician.email} • {technician.contactNumber}
                            </div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="text-center p-6 text-gray-500">
                        No technicians available.
                      </div>
                    )}
                  </div>
                </div>

                {/* Technicians Summary */}
                {technicians.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{technicians.filter(t => t.currentJobCount === 0).length}</span> available technicians • 
                      <span className="font-medium"> {technicians.filter(t => t.currentJobCount <= 2).length}</span> with light workload • 
                      <span className="font-medium"> {technicians.filter(t => t.currentJobCount > 2).length}</span> with heavy workload
                    </p>
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