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
  FaEye,
  FaSearch,
  FaBook
} from "react-icons/fa";
import QuotationPreviewModal from './QuotationPreviewModal'; 

const API_BASE = "http://localhost:3001";

export default function QuotationModal({ onClose, onSave }) {
  const [quotation, setQuotation] = useState({
    customerId: "",
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
    customParts: [],
    bookingId: "",
    status: "Pending" 
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [availableServicePackages, setAvailableServicePackages] = useState([]);
  const [availableParts, setAvailableParts] = useState([]);
  const [availableCustomers, setAvailableCustomers] = useState([]);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedServicePackage, setSelectedServicePackage] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showBookingDropdown, setShowBookingDropdown] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [isFromBooking, setIsFromBooking] = useState(false);
  const [loading, setLoading] = useState({
    services: false,
    packages: false,
    parts: false,
    customers: false,
    bookings: false,
    saving: false
  });
  const [showPreview, setShowPreview] = useState(false);

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch services, service packages, parts, customers, and bookings from backend
  useEffect(() => {
    fetchServices();
    fetchServicePackages();
    fetchParts();
    fetchCustomers();
    fetchBookings();
  }, []);

  // Filter customers based on search
  const filteredCustomers = availableCustomers.filter(customer =>
    customer.firstName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.lastName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.contactNumber?.includes(customerSearch)
  );

  // Filter bookings based on search
  const filteredBookings = availableBookings.filter(booking =>
    booking.bookingId?.toString().includes(bookingSearch) ||
    booking.customerName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    booking.technicianName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    booking.statusName?.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  const fetchCustomers = async () => {
    setLoading(prev => ({ ...prev, customers: true }));
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status}`);
      }
      
      const data = await response.json();
      setAvailableCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setAvailableCustomers([]);
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  const fetchBookings = async () => {
    setLoading(prev => ({ ...prev, bookings: true }));
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }
      
      const data = await response.json();
      setAvailableBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setAvailableBookings([]);
    } finally {
      setLoading(prev => ({ ...prev, bookings: false }));
    }
  };

  const fetchServices = async () => {
    setLoading(prev => ({ ...prev, services: true }));
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
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
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/service-packages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch service packages');
      const data = await response.json();
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
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/parts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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

  // Calculate totals
  const servicesSubtotal = quotation.services.reduce((sum, service) => {
    const quantity = service.quantity || 1;
    const price = service.price || 0;
    return sum + ((service.price || 0) * quantity);
  }, 0);

  const servicePackagesSubtotal = quotation.servicePackages.reduce((sum, pkg) => {
    const quantity = pkg.quantity || 1;
     const price = pkg.price || 0;
    return sum + ((pkg.price || 0) * quantity);
  }, 0);

  const customPartsSubtotal = quotation.customParts.reduce((sum, part) => {
    const quantity = part.quantity || 0;
    const unitPrice = part.unitPrice || 0;
    return sum + (quantity * unitPrice);
  }, 0);

  const subtotal = servicesSubtotal + servicePackagesSubtotal + customPartsSubtotal + (quotation.laborCost || 0);
  const discountAmount = subtotal * (quotation.discount / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const total = totalAfterDiscount;

  // Prepare quotation data for backend - FIXED: Remove customerName duplication
  const prepareQuotationData = () => {
    // Transform services to match backend field names
    const transformedServices = quotation.services.map(service => ({
      serviceId: service.servicesId,
      serviceName: service.serviceName,
      serviceDescription: service.serviceDescription,
      price: service.price,
      quantity: service.quantity || 1,
      status: quotation.status || 'Pending'
    }));

    // Transform service packages to match backend field names
    const transformedPackages = quotation.servicePackages.map(pkg => ({
      servicePackageId: pkg.servicePackageId,
      packageName: pkg.packageName,
      packageDescription: pkg.packageDescription,
      price: pkg.price,
      quantity: pkg.quantity || 1
    }));

    const quotationData = {
      customerId: quotation.customerId || null,
      laborCost: parseFloat(quotation.laborCost) || 0,
      discount: parseFloat(quotation.discount) || 0,
      workTimeEstimation: parseFloat(quotation.workTimeEstimation) || 0,
      quote: quotation.notes,
      validity: parseInt(quotation.validity) || 30,
      services: transformedServices,
      servicePackages: transformedPackages,
      customParts: quotation.customParts,
      bookingId: quotation.bookingId || null,
      status: 'Pending'
    };

    // Add guest information only if no customerId (guest customer)
    if (!quotation.customerId) {
      quotationData.guestName = quotation.customerName || '';
      quotationData.guestContact = quotation.phone || '';
      quotationData.guestEmail = quotation.email || '';
    }

    return quotationData;
  };

  // Handle customer selection from dropdown
  const handleCustomerSelect = (customer) => {
    setQuotation(prev => ({
      ...prev,
      customerId: customer.customerId || customer.userId,
      customerName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email || "",
      phone: customer.contactNumber || "",
      address: customer.address || ""
    }));
    setCustomerSearch(`${customer.firstName} ${customer.lastName}`);
    setShowCustomerDropdown(false);
    setIsExistingCustomer(true);
  };

  // Handle booking selection
  const handleBookingSelect = (booking) => {
    // Find the full customer details from available customers
    const customerFromBooking = availableCustomers.find(c => 
      c.customerId === booking.customerId || c.userId === booking.customerId
    );

    setQuotation(prev => ({
      ...prev,
      bookingId: booking.bookingId,
      customerId: booking.customerId,
      customerName: booking.customerName || "",
      email: customerFromBooking?.email || "",
      phone: customerFromBooking?.contactNumber || "",
      address: customerFromBooking?.address || ""
    }));
    setBookingSearch(`Booking #${booking.bookingId} - ${booking.customerName}`);
    setShowBookingDropdown(false);
    
    // If booking has customer info, auto-fill it
    if (booking.customerName) {
      setIsExistingCustomer(true);
      setIsFromBooking(true);
    }
  };

  // Handle manual customer info change
  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setQuotation(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If user starts typing manually, treat as guest customer
    if (name === "customerName" && value && (isExistingCustomer || isFromBooking)) {
      setIsExistingCustomer(false);
      setIsFromBooking(false);
      setQuotation(prev => ({
        ...prev,
        customerId: "",
        bookingId: ""
      }));
    }
  };

  // Clear customer selection
  const handleClearCustomer = () => {
    setQuotation(prev => ({
      ...prev,
      customerId: "",
      customerName: "",
      email: "",
      phone: "",
      address: "",
      bookingId: ""
    }));
    setCustomerSearch("");
    setBookingSearch("");
    setIsExistingCustomer(false);
    setIsFromBooking(false);
    setShowCustomerDropdown(false);
    setShowBookingDropdown(false);
  };

  // Clear booking selection
  const handleClearBooking = () => {
    setQuotation(prev => ({
      ...prev,
      bookingId: ""
    }));
    setBookingSearch("");
    setShowBookingDropdown(false);
    setIsFromBooking(false);
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

    // Use consistent field names that match your backend
    const serviceToAdd = {
      servicesId: selectedServiceData.servicesId || selectedServiceData.serviceId,
      serviceName: selectedServiceData.servicesName || selectedServiceData.serviceName,
      serviceDescription: selectedServiceData.servicesDescription || selectedServiceData.description,
      price: parseFloat(selectedServiceData.price) || null,
      quantity: 1
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

    // Use consistent field names
    const packageToAdd = {
      servicePackageId: selectedPackageData.servicePackageId || selectedPackageData.packageId,
      packageName: selectedPackageData.packageName,
      packageDescription: selectedPackageData.packageDescription || selectedPackageData.description,
      price: parseFloat(selectedPackageData.packagePrice || selectedPackageData.price) || null,
      quantity: 1
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

    const partToAdd = {
      partId: selectedPartData.partId,
      partName: selectedPartData.partName,
      partDescription: selectedPartData.partDescription || '',
      unitPrice: parseFloat(selectedPartData.unitPrice) || 0,
      quantity: 1
    };

    setQuotation(prev => ({
      ...prev,
      customParts: [...prev.customParts, partToAdd]
    }));

    setSelectedPart("");
  };

  const removeService = (index) => {
    setQuotation(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const removeServicePackage = (index) => {
    setQuotation(prev => ({
      ...prev,
      servicePackages: prev.servicePackages.filter((_, i) => i !== index)
    }));
  };

  const removeCustomPart = (index) => {
    setQuotation(prev => ({
      ...prev,
      customParts: prev.customParts.filter((_, i) => i !== index)
    }));
  };

  // Handle service price change
  const handleServicePriceChange = (index, newPrice) => {
    const parsedPrice = parseFloat(newPrice) || 0;
    setQuotation(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, price: parsedPrice } : service
      )
    }));
  };

  // Handle service quantity change
  const handleServiceQuantityChange = (index, newQuantity) => {
    const parsedQuantity = Math.max(1, parseInt(newQuantity) || 1);
    setQuotation(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, quantity: parsedQuantity } : service
      )
    }));
  };

  // Handle service package price change
  const handlePackagePriceChange = (index, newPrice) => {
    const parsedPrice = parseFloat(newPrice) || 0;
    setQuotation(prev => ({
      ...prev,
      servicePackages: prev.servicePackages.map((pkg, i) => 
        i === index ? { ...pkg, price: parsedPrice } : pkg
      )
    }));
  };

  // Handle service package quantity change
  const handlePackageQuantityChange = (index, newQuantity) => {
    const parsedQuantity = Math.max(1, parseInt(newQuantity) || 1);
    setQuotation(prev => ({
      ...prev,
      servicePackages: prev.servicePackages.map((pkg, i) => 
        i === index ? { ...pkg, quantity: parsedQuantity } : pkg
      )
    }));
  };

  const handleQuotationChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["discount", "validity", "laborCost", "workTimeEstimation"];
    
    let newValue;
    if (numericFields.includes(name)) {
      if (value === "" || value === "-") {
        newValue = value;
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

  const handleCustomPartChange = (index, field, value) => {
    setQuotation(prev => ({
      ...prev,
      customParts: prev.customParts.map((part, i) => 
        i === index ? { 
          ...part, 
          [field]: field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value 
        } : part
      )
    }));
  };

  const handleSave = async () => {
    // FIXED: Check if customerName is actually filled
    if (!quotation.customerName || quotation.customerName.trim() === '') {
      alert("Please fill customer details");
      return;
    }

    setLoading(prev => ({ ...prev, saving: true }));

    try {
      const quotationData = prepareQuotationData();
      const token = getAuthToken();
      
      console.log('Sending quotation data:', quotationData);
      
      const response = await fetch(`${API_BASE}/api/quotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quotationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(errorData.error || 'Failed to create quotation');
      }

      const savedQuotation = await response.json();
      
      // Call the onSave callback with the saved quotation
      onSave(savedQuotation);
      
    } catch (error) {
      console.error('Error saving quotation:', error);
      alert(`Failed to save quotation: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const handlePreview = () => {
    // FIXED: Check if customerName is actually filled
    if (!quotation.customerName || quotation.customerName.trim() === '') {
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PH');
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
                disabled={loading.saving}
              >
                <FaTimes size={24} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Customer Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaUser className="mr-2 text-blue-600" />
                    Customer Details
                    {isExistingCustomer && (
                      <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Existing Customer
                      </span>
                    )}
                    {isFromBooking && (
                      <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        From Booking
                      </span>
                    )}
                    {loading.customers && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Loading...
                      </span>
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* Booking Search */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search by Booking ID
                        <span className="ml-2 text-xs text-gray-500">
                          ({availableBookings.length} bookings available)
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={bookingSearch}
                          onChange={(e) => {
                            setBookingSearch(e.target.value);
                            setShowBookingDropdown(true);
                          }}
                          onFocus={() => setShowBookingDropdown(true)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Search by booking ID, customer name, or status..."
                          disabled={loading.saving || loading.bookings}
                        />
                        <FaBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        {bookingSearch && (
                          <button
                            onClick={handleClearBooking}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            disabled={loading.saving}
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>

                      {/* Booking Dropdown */}
                      {showBookingDropdown && bookingSearch && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {loading.bookings ? (
                            <div className="p-3 text-center text-gray-500">Loading bookings...</div>
                          ) : filteredBookings.length > 0 ? (
                            filteredBookings.map(booking => (
                              <div
                                key={booking.bookingId}
                                className="p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => handleBookingSelect(booking)}
                              >
                                <div className="font-medium flex justify-between items-start">
                                  <span>Booking #{booking.bookingId}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    booking.statusName === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                    booking.statusName === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    booking.statusName === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {booking.statusName}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <div className="font-medium">Customer: {booking.customerName}</div>
                                  {booking.technicianName && (
                                    <div>Technician: {booking.technicianName}</div>
                                  )}
                                  {booking.createdAt && (
                                    <div>Booking Date: {formatDate(booking.createdAt)}</div>
                                  )}
                                  {booking.notes && (
                                    <div className="text-xs text-gray-500 truncate" title={booking.notes}>
                                      Notes: {booking.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-gray-500">
                              {availableBookings.length === 0 
                                ? "No bookings available in the system." 
                                : "No bookings found. Try a different search term."}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Customer Search */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Existing Customer
                        <span className="ml-2 text-xs text-gray-500">
                          ({availableCustomers.length} customers available)
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            setShowCustomerDropdown(true);
                          }}
                          onFocus={() => setShowCustomerDropdown(true)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Search by name, email, or phone..."
                          disabled={loading.saving || loading.customers}
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        {customerSearch && (
                          <button
                            onClick={handleClearCustomer}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            disabled={loading.saving}
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>

                      {/* Customer Dropdown */}
                      {showCustomerDropdown && customerSearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {loading.customers ? (
                            <div className="p-3 text-center text-gray-500">Loading customers...</div>
                          ) : filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                              <div
                                key={customer.userId || customer.customerId}
                                className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => handleCustomerSelect(customer)}
                              >
                                <div className="font-medium">
                                  {customer.firstName} {customer.lastName}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {customer.email} • {customer.contactNumber}
                                </div>
                                {customer.address && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {customer.address}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-gray-500">
                              {availableCustomers.length === 0 
                                ? "No customers available in the system." 
                                : "No customers found. Continue typing to create a guest customer."}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Customer Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={quotation.customerName}
                        onChange={handleCustomerInfoChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                        required
                        disabled={loading.saving}
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
                          onChange={handleCustomerInfoChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="john@example.com"
                          disabled={loading.saving}
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
                          onChange={handleCustomerInfoChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                          disabled={loading.saving}
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
                        onChange={handleCustomerInfoChange}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter customer address"
                        disabled={loading.saving}
                      />
                    </div>

                    {/* Booking ID Display */}
                    {quotation.bookingId && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-purple-800">
                              Linked to Booking #{quotation.bookingId}
                            </span>
                            <button
                              onClick={handleClearBooking}
                              className="ml-2 text-xs text-purple-600 hover:text-purple-800"
                            >
                              Remove Link
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Empty column for layout balance - Quotation Details moved below */}
                <div></div>
              </div>

              {/* Services Section with Quantity and Price Editing */}
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
                        disabled={loading.services || availableServices.length === 0 || loading.saving}
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
                        disabled={!selectedService || loading.services || loading.saving}
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quotation.services.map((service, index) => {
                        const serviceTotal = (service.price || 0) * (service.quantity || 1);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">{service.serviceName}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{service.serviceDescription}</td>
                            <td className="px-4 py-3 text-sm">
                              <input
                                type="number"
                                value={service.quantity || 1}
                                onChange={(e) => handleServiceQuantityChange(index, e.target.value)}
                                min="1"
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                disabled={loading.saving}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <input
                                type="number"
                                value={service.price}
                                onChange={(e) => handleServicePriceChange(index, e.target.value)}
                                className="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                                min="0"
                                step="0.01"
                                disabled={loading.saving}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-green-700">
                              {formatCurrency(serviceTotal)}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeService(index)}
                                className="text-red-600 hover:text-red-800 p-2 transition-colors"
                                disabled={loading.saving}
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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

              {/* Service Packages Section with Quantity and Price Editing */}
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
                        disabled={loading.packages || availableServicePackages.length === 0 || loading.saving}
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
                        disabled={!selectedServicePackage || loading.packages || loading.saving}
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quotation.servicePackages.map((pkg, index) => {
                        const packageTotal = (pkg.price || 0) * (pkg.quantity || 1);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">{pkg.packageName}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{pkg.packageDescription}</td>
                            <td className="px-4 py-3 text-sm">
                              <input
                                type="number"
                                value={pkg.quantity || 1}
                                onChange={(e) => handlePackageQuantityChange(index, e.target.value)}
                                min="1"
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                disabled={loading.saving}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <input
                                type="number"
                                value={pkg.price}
                                onChange={(e) => handlePackagePriceChange(index, e.target.value)}
                                className="w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                                min="0"
                                step="0.01"
                                disabled={loading.saving}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-green-700">
                              {formatCurrency(packageTotal)}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeServicePackage(index)}
                                className="text-red-600 hover:text-red-800 p-2 transition-colors"
                                disabled={loading.saving}
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
                        disabled={loading.parts || availableParts.length === 0 || loading.saving}
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
                        disabled={!selectedPart || loading.parts || loading.saving}
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
                      {quotation.customParts.map((part, index) => {
                        const partTotal = (part.quantity || 0) * (part.unitPrice || 0);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">{part.partName}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{part.partDescription}</td>
                            <td className="px-4 py-3 text-sm">{formatCurrency(part.unitPrice)}</td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={part.quantity || 1}
                                onChange={(e) => handleCustomPartChange(index, 'quantity', e.target.value)}
                                min="1"
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                disabled={loading.saving}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">{formatCurrency(partTotal)}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeCustomPart(index)}
                                className="text-red-600 hover:text-red-800 p-2 transition-colors"
                                disabled={loading.saving}
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FaCalendarAlt className="mr-2 text-green-600" />
                      Quotation Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Labor Cost
                          </label>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2 text-lg">₱</span>
                            <input
                              type="number"
                              name="laborCost"
                              value={quotation.laborCost}
                              onChange={handleQuotationChange}
                              step="0.01"
                              min="0"
                              placeholder="Enter labor cost"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={loading.saving}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Fixed labor cost for the service</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            name="discount"
                            value={quotation.discount}
                            onChange={handleQuotationChange}
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading.saving}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Validity Period (Days)
                          </label>
                          <input
                            type="number"
                            name="validity"
                            value={quotation.validity}
                            onChange={handleQuotationChange}
                            min="1"
                            max="365"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading.saving}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quotation Notes
                        </label>
                        <textarea
                          name="notes"
                          value={quotation.notes}
                          onChange={handleQuotationChange}
                          placeholder="Enter quotation details, terms, conditions, scope of work, and any other relevant information..."
                          rows="5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={loading.saving}
                        />
                        <p className="text-xs text-gray-500 mt-1">This will be included in the quotation document</p>
                      </div>
                    </div>
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
                    
                    <div className="flex justify-between border-t pt-3 text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleSave}
                      disabled={loading.saving || !quotation.customerName || quotation.customerName.trim() === ''}
                      className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading.saving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Save Quotation
                        </>
                      )}
                    </button>

                    <button
                      onClick={handlePreview}
                      disabled={!quotation.customerName || quotation.customerName.trim() === '' || loading.saving}
                      className="w-full bg-green-600 text-white rounded-lg px-4 py-3 hover:bg-green-700 transition-colors font-semibold flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <FaEye className="mr-2" />
                      Preview Quotation
                    </button>
                    
                    <button
                      onClick={onClose}
                      disabled={loading.saving}
                      className="w-full bg-gray-500 text-white rounded-lg px-4 py-3 hover:bg-gray-600 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
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

      {showPreview && (
        <QuotationPreviewModal
          quotation={quotation}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
