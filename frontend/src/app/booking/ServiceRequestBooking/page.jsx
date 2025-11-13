"use client";

import { useState, useEffect } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import NavbarAfterLogin from "@/components/NavbarAfterLogin";
import { useAuth } from "@/contexts/AuthContext";
import { FaPlus, FaTrash, FaTools, FaBox, FaCalendarAlt, FaClock, FaUserCog } from "react-icons/fa";

const API_BASE = "http://localhost:3001";

export default function ServiceRequestBooking() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [period, setPeriod] = useState("AM");
  const [selectedHour, setSelectedHour] = useState({ id: null, label: null });
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  // Slot and technician states
  const [slots, setSlots] = useState({ AM: [], PM: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [bookedTechIds, setBookedTechIds] = useState([]);
  const [blockedDates, setBlockedDates] = useState({});

  // Quotation states
  const [availableServices, setAvailableServices] = useState([]);
  const [availableServicePackages, setAvailableServicePackages] = useState([]);
  
  const [selectedService, setSelectedService] = useState("");
  const [selectedServicePackage, setSelectedServicePackage] = useState("");

  const [quotation, setQuotation] = useState({
    services: [],
    servicePackages: [],
    notes: ""
  });

  const [loading, setLoading] = useState({
    services: false,
    packages: false
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/auth/login");
      else if (user.roleId === 3 && !user.customerId) {
        alert("Customer ID missing. Please login again.");
        router.push("/auth/login");
      }
    }
  }, [authLoading, user, router]);

  // Fetch initial data
  useEffect(() => {
    if (user) {
      fetchServices();
      fetchServicePackages();
      loadBlockedDates();
    }
  }, [user, currentDate]);

  const loadBlockedDates = async () => {
    try {
      const monthStart = moment(currentDate).startOf("month").format("YYYY-MM-DD");
      const monthEnd = moment(currentDate).endOf("month").format("YYYY-MM-DD");

      const res = await fetch(`${API_BASE}/api/slot-dates?start=${monthStart}&end=${monthEnd}`);
      if (!res.ok) throw new Error("Failed to fetch slot dates");
      const data = await res.json();

      const blockedMap = {};
      data.forEach((sd) => {
        blockedMap[moment(sd.slotDate).format("YYYY-MM-DD")] = !sd.isOpen;
      });

      setBlockedDates(blockedMap);
    } catch (err) {
      console.error(err);
      setBlockedDates({});
    }
  };

  // Fetch Services
  const fetchServices = async () => {
    setLoading(prev => ({ ...prev, services: true }));
    try {
      const response = await fetch(`${API_BASE}/api/services`);
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

  // Fetch Service Packages
  const fetchServicePackages = async () => {
    setLoading(prev => ({ ...prev, packages: true }));
    try {
      const response = await fetch(`${API_BASE}/api/service-packages`);
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

  // Quotation management functions
  const addService = () => {
    if (!selectedService) return;
    
    const service = availableServices.find(s => 
      (s.servicesId || s.serviceId) == selectedService
    );
    
    if (service) {
      const newService = {
        id: Date.now(),
        servicesId: service.servicesId || service.serviceId,
        servicesName: service.servicesName || service.serviceName,
        servicesDescription: service.servicesDescription || service.serviceDescription
      };
      
      setQuotation(prev => ({
        ...prev,
        services: [...prev.services, newService]
      }));
      setSelectedService("");
    }
  };

  const removeService = (id) => {
    setQuotation(prev => ({
      ...prev,
      services: prev.services.filter(service => service.id !== id)
    }));
  };

  const addServicePackage = () => {
    if (!selectedServicePackage) return;
    
    const servicePackage = availableServicePackages.find(sp => 
      (sp.servicePackageId || sp.packageId) == selectedServicePackage
    );
    
    if (servicePackage) {
      const newPackage = {
        id: Date.now(),
        servicePackageId: servicePackage.servicePackageId || servicePackage.packageId,
        packageName: servicePackage.packageName,
        packageDescription: servicePackage.packageDescription
      };
      
      setQuotation(prev => ({
        ...prev,
        servicePackages: [...prev.servicePackages, newPackage]
      }));
      setSelectedServicePackage("");
    }
  };

  const removeServicePackage = (id) => {
    setQuotation(prev => ({
      ...prev,
      servicePackages: prev.servicePackages.filter(pkg => pkg.id !== id)
    }));
  };

  const handleQuotationChange = (e) => {
    const { name, value } = e.target;
    setQuotation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calendar logic
  const getDaysInMonth = () => {
    const start = moment(currentDate).startOf("month");
    const end = moment(currentDate).endOf("month");
    const days = [];

    const startDay = start.day();
    for (let i = 0; i < startDay; i++)
      days.push({ date: start.clone().subtract(startDay - i, "days").toDate(), outside: true });

    for (let i = 1; i <= end.date(); i++)
      days.push({ date: moment(currentDate).date(i).toDate(), outside: false });

    const remainingDays = 42 - days.length;
    let lastDate = end.clone();
    for (let i = 1; i <= remainingDays; i++)
      days.push({ date: lastDate.add(1, "day").toDate(), outside: true });

    return days;
  };

  const navigate = (direction) => {
    const newDate = moment(currentDate).add(direction === "NEXT" ? 1 : -1, "month").toDate();
    setCurrentDate(newDate);
  };

  // Fetch slots for selected date
  const fetchSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      const response = await fetch(`${API_BASE}/api/slot-dates/slots/${formattedDate}`);
      if (!response.ok) throw new Error("Failed to fetch slots");
      const data = await response.json();

      const AM = data.filter((slot) => parseInt(slot.startTime.split(":")[0]) < 12);
      const PM = data.filter((slot) => parseInt(slot.startTime.split(":")[0]) >= 12);

      setSlots({ AM, PM });
      setSelectedHour({ id: null, label: null });
      setSelectedTechnician(null);
      setBookedTechIds([]);
    } catch (err) {
      console.error(err);
      setSlots({ AM: [], PM: [] });
    } finally {
      setLoadingSlots(false);
    }
  };

  // Fetch booked technicians for selected slot
  const fetchBookedTechnicians = async (slotId) => {
    if (!selectedDate || !slotId) return [];
    try {
      const token = localStorage.getItem("token");
      const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
      const res = await fetch(
        `${API_BASE}/api/bookings/booked-technicians/${slotId}?date=${formattedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch booked technicians");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // Fetch technicians when date and slot are selected
  const fetchTechnicians = async () => {
    if (!selectedDate || !selectedHour?.id) return;
    
    setLoadingTechs(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
      
      const response = await fetch(
        `${API_BASE}/api/bookings/availability?date=${formattedDate}&timeSlotId=${selectedHour.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch technicians");
      const data = await response.json();
      setTechnicians(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTechnicians([]);
    } finally {
      setLoadingTechs(false);
    }
  };

  // Fetch technicians when slot is selected
  useEffect(() => {
    if (selectedDate && selectedHour?.id) {
      fetchTechnicians();
    } else {
      setTechnicians([]);
    }
  }, [selectedDate, selectedHour]);

  // Update booked technicians whenever a slot is selected
  useEffect(() => {
    if (!selectedHour?.id || !selectedDate) {
      setBookedTechIds([]);
      setSelectedTechnician(null);
      return;
    }
    
    const updateBookedTechs = async () => {
      const bookedIds = await fetchBookedTechnicians(selectedHour.id);
      setBookedTechIds(bookedIds);
      
      // Clear selected technician if it's now booked
      if (selectedTechnician && bookedIds.includes(selectedTechnician.id)) {
        setSelectedTechnician(null);
      }
    };
    updateBookedTechs();
  }, [selectedHour, selectedDate]);

  // Clear selections when period changes
  useEffect(() => {
    setSelectedHour({ id: null, label: null });
    setSelectedTechnician(null);
    setBookedTechIds([]);
  }, [period]);

  const formatTime12h = (time) => {
    const [hour, minute] = time.split(":").map(Number);
    const h = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour >= 12 ? "PM" : "AM";
    return `${h}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const isPastDate = (date) => moment(date).isBefore(moment(), "day");
  const isPastSlot = (date, time) => {
    if (!moment(date).isSame(moment(), "day")) return false;
    const now = moment();
    const slotTime = moment(`${moment(date).format("YYYY-MM-DD")} ${time}`, "YYYY-MM-DD HH:mm:ss");
    return slotTime.isBefore(now);
  };

  const handleSlotSelection = async (slot) => {
    const fullTime = `${formatTime12h(slot.startTime)} - ${formatTime12h(slot.endTime)}`;
    const pastSlot = isPastSlot(selectedDate, slot.startTime);
    
    if (pastSlot) return;
    
    setSelectedHour({ id: slot.timeSlotId, label: fullTime });
  };

  const handleTechnicianSelection = (tech) => {
    const isBooked = !tech.isAvailable;
    
    // Only allow selection if technician is available
    if (!isBooked) {
      setSelectedTechnician({ 
        id: tech.technicianId, 
        name: tech.technicianName 
      });
    }
  };

const handleServiceRequest = async () => {
  // Enhanced validation
  if (!selectedDate || !selectedHour?.id || !selectedTechnician?.id) {
    alert("Please select a date, time, and technician.");
    return;
  }

  // Check if at least one service or package is selected
  if (quotation.services.length === 0 && quotation.servicePackages.length === 0) {
    alert("Please select at least one service or service package.");
    return;
  }

  if (!user?.customerId) {
    alert("Customer ID not found. Please login again.");
    return;
  }

  // Debug logging
  console.log("Submitting with:", {
    customerId: user.customerId,
    timeSlotId: selectedHour.id,
    servicesCount: quotation.services.length,
    packagesCount: quotation.servicePackages.length
  });

  const payload = {
    customerId: user.customerId,
    technicianId: selectedTechnician.id,
    timeSlotId: selectedHour.id,
    services: quotation.services.map(service => ({
      serviceId: service.servicesId,
      quantity: 1
    })),
    servicePackages: quotation.servicePackages.map(pkg => ({
      servicePackageId: pkg.servicePackageId,
      quantity: 1
    })),
    notes: quotation.notes
  };

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/service-request-bookings", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Service request submitted successfully!");
      // Clear selections
      setSelectedHour({ id: null, label: null });
      setSelectedTechnician(null);
      setSelectedDate(null);
      setQuotation({
        services: [],
        servicePackages: [],
        notes: ""
      });
    } else {
      alert(data.message || "Service request failed.");
    }
  } catch (err) {
    console.error(err);
    alert("Service request failed due to server error.");
  }
};

  const days = getDaysInMonth();
  const monthYear = moment(currentDate).format("MMMM YYYY");
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

  if (authLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center text-red-500 font-semibold">You must be logged in to access the calendar.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <NavbarAfterLogin user={user} />

      <div className="pt-28 p-4 flex flex-col items-center w-full">
        <div className="w-full text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Request Service</h1>
          <p className="text-gray-600 text-lg">We repair for your convenience</p>
        </div>

        {/* Main Booking Section */}
        <div className="w-full max-w-6xl space-y-6">
          {/* Calendar, Time & Technician Selection */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-600" />
              Schedule Your Service
            </h2>
            
            <div className="flex gap-6">
              {/* Calendar */}
              <div className="w-1/3">
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={() => navigate("PREV")} 
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    &lt;
                  </button>
                  <span className="text-lg font-semibold text-gray-800">{monthYear}</span>
                  <button 
                    onClick={() => navigate("NEXT")} 
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    &gt;
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map(({ date, outside }, index) => {
                    const isToday = moment(date).isSame(new Date(), "day");
                    const isSelected = selectedDate && moment(date).isSame(selectedDate, "day");
                    const pastDate = isPastDate(date);
                    const dateStr = moment(date).format("YYYY-MM-DD");
                    const isBlocked = blockedDates[dateStr] || false;

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (!outside && !pastDate && !isBlocked) {
                            setSelectedDate(date);
                            fetchSlots(date);
                          }
                        }}
                        disabled={outside || pastDate || isBlocked}
                        className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                          ${outside || pastDate ? "text-gray-300 cursor-not-allowed" : ""}
                          ${isBlocked ? "bg-red-100 text-red-700 cursor-not-allowed" : ""}
                          ${isSelected ? "bg-indigo-600 text-white shadow-md" :
                            isToday && !outside ? "bg-indigo-100 text-indigo-600 font-semibold" :
                            !outside && !pastDate ? "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600" : ""
                          }`}
                      >
                        {moment(date).date()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="w-1/3 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaClock className="mr-2 text-green-600" />
                    Available Time Slots
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedDate ? moment(selectedDate).format("MMMM D, YYYY") : "Select a date first"}
                  </p>
                </div>

                <div className="flex justify-center gap-2 mb-4">
                  <button 
                    onClick={() => setPeriod("AM")} 
                    className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm ${
                      period === "AM" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Morning
                  </button>
                  <button 
                    onClick={() => setPeriod("PM")} 
                    className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm ${
                      period === "PM" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Afternoon
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto border rounded-lg p-3 space-y-2 max-h-60">
                  {loadingSlots ? (
                    <p className="text-gray-500 text-center py-4">Loading time slots...</p>
                  ) : slots[period].length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No slots available</p>
                  ) : (
                    slots[period].map((slot, idx) => {
                      const fullTime = `${formatTime12h(slot.startTime)} - ${formatTime12h(slot.endTime)}`;
                      const pastSlot = isPastSlot(selectedDate, slot.startTime);
                      const blocked = !slot.isAvailable;
                      const disabled = pastSlot || blocked;

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSlotSelection(slot)}
                          disabled={disabled}
                          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            disabled
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : selectedHour?.id === slot.timeSlotId
                              ? "bg-green-600 text-white shadow"
                              : "bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-600"
                          }`}
                        >
                          {fullTime}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Technicians */}
              <div className="w-1/3 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaUserCog className="mr-2 text-purple-600" />
                    Available Technicians
                  </h3>
                  {selectedHour?.id && (
                    <p className="text-xs text-gray-500">
                      For {selectedHour.label}
                    </p>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto border rounded-lg p-3 space-y-2 max-h-60">
                  {loadingTechs ? (
                    <p className="text-gray-500 text-center py-4">Loading technicians...</p>
                  ) : technicians.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      {selectedHour?.id ? "No technicians available" : "Select a time slot first"}
                    </p>
                  ) : (
                    technicians.map((tech) => {
                      const isBooked = !tech.isAvailable;
                      const isSelected = selectedTechnician?.id === tech.technicianId;

                      return (
                        <button
                          key={tech.technicianId}
                          onClick={() => handleTechnicianSelection(tech)}
                          disabled={isBooked}
                          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            isBooked
                              ? "bg-red-100 text-red-700 cursor-not-allowed border border-red-200"
                              : isSelected
                              ? "bg-purple-600 text-white shadow"
                              : "bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                          }`}
                        >
                          {tech.technicianName}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaTools className="mr-2 text-blue-600" />
              Select Services
              {loading.services && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
            </h3>

            {/* Add Service Form */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Service
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading.services || availableServices.length === 0}
                  >
                    <option value="">Select a service...</option>
                    {availableServices.map(service => (
                      <option 
                        key={service.servicesId || service.serviceId} 
                        value={service.servicesId || service.serviceId}
                      >
                        {service.servicesName || service.serviceName}
                      </option>
                    ))}
                  </select>
                  {availableServices.length === 0 && !loading.services && (
                    <p className="text-red-500 text-sm mt-1">No services available</p>
                  )}
                </div>
                <div className="col-span-4">
                  <button
                    onClick={addService}
                    disabled={!selectedService || loading.services}
                    className="w-full bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    <FaPlus className="mr-2" />
                    Add Service
                  </button>
                </div>
              </div>
            </div>

            {/* Services List */}
            <div className="space-y-3">
              {quotation.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800">{service.servicesName}</p>
                    <p className="text-sm text-gray-600">{service.servicesDescription}</p>
                  </div>
                  <button
                    onClick={() => removeService(service.id)}
                    className="text-red-600 hover:text-red-800 p-2 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}

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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaBox className="mr-2 text-green-600" />
              Select Service Packages
              {loading.packages && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
            </h3>

            {/* Add Service Package Form */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Package
                  </label>
                  <select
                    value={selectedServicePackage}
                    onChange={(e) => setSelectedServicePackage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading.packages || availableServicePackages.length === 0}
                  >
                    <option value="">Select a package...</option>
                    {availableServicePackages.map(pkg => (
                      <option 
                        key={pkg.servicePackageId || pkg.packageId} 
                        value={pkg.servicePackageId || pkg.packageId}
                      >
                        {pkg.packageName}
                      </option>
                    ))}
                  </select>
                  {availableServicePackages.length === 0 && !loading.packages && (
                    <p className="text-red-500 text-sm mt-1">No service packages available</p>
                  )}
                </div>
                <div className="col-span-4">
                  <button
                    onClick={addServicePackage}
                    disabled={!selectedServicePackage || loading.packages}
                    className="w-full bg-green-600 text-white rounded-lg px-3 py-2 hover:bg-green-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    <FaPlus className="mr-2" />
                    Add Package
                  </button>
                </div>
              </div>
            </div>

            {/* Packages List */}
            <div className="space-y-3">
              {quotation.servicePackages.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800">{pkg.packageName}</p>
                    <p className="text-sm text-gray-600">{pkg.packageDescription}</p>
                  </div>
                  <button
                    onClick={() => removeServicePackage(pkg.id)}
                    className="text-red-600 hover:text-red-800 p-2 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}

              {quotation.servicePackages.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-green-50 rounded-lg">
                  <FaBox className="mx-auto text-3xl text-green-300 mb-3" />
                  <p>No service packages added yet</p>
                  <p className="text-sm text-gray-400">Add service packages using the form above</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
            <textarea
              name="notes"
              value={quotation.notes}
              onChange={handleQuotationChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter any additional notes, special requirements, or details about your service request..."
            />
          </div>

          {/* Request Service Button with Summary - Stacked Layout */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Service Request Summary - Now above the button */}
              {(selectedDate || selectedHour?.id || selectedTechnician?.id || quotation.services.length > 0 || quotation.servicePackages.length > 0) && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">Service Request Summary</h4>
                  
                  {/* Date, Time, Technician Summary */}
                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    {selectedDate && (
                      <div>
                        <p className="text-blue-600 font-medium">Date</p>
                        <p className="text-gray-700">{moment(selectedDate).format("MMMM D, YYYY")}</p>
                      </div>
                    )}
                    {selectedHour?.label && (
                      <div>
                        <p className="text-blue-600 font-medium">Time</p>
                        <p className="text-gray-700">{selectedHour.label}</p>
                      </div>
                    )}
                    {selectedTechnician?.name && (
                      <div>
                        <p className="text-blue-600 font-medium">Technician</p>
                        <p className="text-gray-700">{selectedTechnician.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Services Summary */}
                  {quotation.services.length > 0 && (
                    <div className="mb-3">
                      <p className="text-blue-600 font-medium text-sm mb-1">Selected Services:</p>
                      <div className="space-y-1">
                        {quotation.services.map(service => (
                          <p key={service.id} className="text-gray-700 text-sm">• {service.servicesName}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Packages Summary */}
                  {quotation.servicePackages.length > 0 && (
                    <div>
                      <p className="text-blue-600 font-medium text-sm mb-1">Selected Packages:</p>
                      <div className="space-y-1">
                        {quotation.servicePackages.map(pkg => (
                          <p key={pkg.id} className="text-gray-700 text-sm">• {pkg.packageName}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Request Service Button - Now below the summary */}
              <div className="text-center">
                <button
                  onClick={handleServiceRequest}
                  disabled={!selectedDate || !selectedHour?.id || !selectedTechnician?.id}
                  className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                    !selectedDate || !selectedHour?.id || !selectedTechnician?.id
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
                >
                  Request Service Now
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  Please ensure you have selected a date, time, and technician before submitting your request
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}