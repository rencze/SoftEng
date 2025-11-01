"use client";

import { useState, useEffect } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import NavbarAfterLogin from "@/components/NavbarAfterLogin";
import { useAuth } from "@/contexts/AuthContext";
import { FaPlus, FaTrash, FaTools, FaBox, FaCogs } from "react-icons/fa";

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
  const [availableParts, setAvailableParts] = useState([]);
  
  const [selectedService, setSelectedService] = useState("");
  const [selectedServicePackage, setSelectedServicePackage] = useState("");
  const [selectedPart, setSelectedPart] = useState("");

  const [quotation, setQuotation] = useState({
    services: [],
    servicePackages: [],
    customParts: [],
    notes: ""
  });

  const [loading, setLoading] = useState({
    services: false,
    packages: false,
    parts: false
  });

  // Format currency helper function
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value || 0);
  };

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
      fetchParts();
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

  // Fetch Parts
  const fetchParts = async () => {
    setLoading(prev => ({ ...prev, parts: true }));
    try {
      const response = await fetch(`${API_BASE}/api/parts`);
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
        servicesDescription: service.servicesDescription || service.serviceDescription,
        price: service.price
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
        packageDescription: servicePackage.packageDescription,
        packagePrice: servicePackage.packagePrice || servicePackage.price
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

  const addCustomPart = () => {
    if (!selectedPart) return;
    
    const part = availableParts.find(p => p.partId == selectedPart);
    
    if (part) {
      const newPart = {
        id: Date.now(),
        partId: part.partId,
        partName: part.partName,
        partDescription: part.partDescription,
        unitPrice: part.unitPrice,
        quantity: 1
      };
      
      setQuotation(prev => ({
        ...prev,
        customParts: [...prev.customParts, newPart]
      }));
      setSelectedPart("");
    }
  };

  const removeCustomPart = (id) => {
    setQuotation(prev => ({
      ...prev,
      customParts: prev.customParts.filter(part => part.id !== id)
    }));
  };

  const handleCustomPartChange = (id, field, value) => {
    setQuotation(prev => ({
      ...prev,
      customParts: prev.customParts.map(part => 
        part.id === id ? { ...part, [field]: parseInt(value) || 0 } : part
      )
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

  const handleBooking = async () => {
    if (!selectedDate || !selectedHour?.id || !selectedTechnician?.id) {
      alert("Please select a date, time, and technician.");
      return;
    }

    if (!user?.customerId) {
      alert("Customer ID not found. Please login again.");
      return;
    }

    // Double-check if technician is still available
    const isCurrentlyBooked = bookedTechIds.includes(selectedTechnician.id);
    if (isCurrentlyBooked) {
      alert("This technician is no longer available for the selected time slot. Please choose another technician.");
      setSelectedTechnician(null);
      return;
    }

    const payload = {
      customerId: user.customerId,
      technicianId: selectedTechnician.id,
      timeSlotId: selectedHour.id,
      notes: quotation.notes,
      services: quotation.services.map(service => ({
        serviceId: service.servicesId,
        quantity: 1
      })),
      servicePackages: quotation.servicePackages.map(pkg => ({
        servicePackageId: pkg.servicePackageId,
        quantity: 1
      })),
      customParts: quotation.customParts.map(part => ({
        partId: part.partId,
        quantity: part.quantity
      }))
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Booking successful!");
        // Refresh the booked technicians list
        const updatedBookedIds = await fetchBookedTechnicians(selectedHour.id);
        setBookedTechIds(updatedBookedIds);
        
        // Clear selections
        setSelectedHour({ id: null, label: null });
        setSelectedTechnician(null);
        setQuotation({
          services: [],
          servicePackages: [],
          customParts: [],
          notes: ""
        });
      } else {
        alert(data.message || "Booking failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Booking failed due to server error.");
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

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-6xl flex gap-6">
          {/* Calendar */}
          <div className="w-1/3">
            <div className="flex items-center justify-between mb-6">
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

            <div className="grid grid-cols-7 gap-2 mb-3">
              {weekDays.map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-gray-500">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
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
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-500">Selected Date</p>
              <p className="text-lg font-semibold text-indigo-600">
                {selectedDate ? moment(selectedDate).format("MMMM D, YYYY") : "No date selected"}
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-4">
              <button 
                onClick={() => setPeriod("AM")} 
                className={`px-4 py-2 rounded-lg font-medium ${
                  period === "AM" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                AM
              </button>
              <button 
                onClick={() => setPeriod("PM")} 
                className={`px-4 py-2 rounded-lg font-medium ${
                  period === "PM" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                PM
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border rounded-lg p-3 space-y-2">
              {loadingSlots ? (
                <p className="text-gray-500 text-center">Loading...</p>
              ) : slots[period].length === 0 ? (
                <p className="text-gray-500 text-center">No slots available.</p>
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
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                        disabled
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : selectedHour?.id === slot.timeSlotId
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      {fullTime} {blocked && "(Blocked)"}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Technicians */}
          <div className="w-1/3 flex flex-col justify-between">
            <div className="mb-2">
              <h3 className="text-gray-700 font-medium text-sm">Select Technician</h3>
              {selectedHour?.id && (
                <p className="text-xs text-gray-500 mt-1">
                  Available technicians for {selectedHour.label}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto border rounded-lg p-3 space-y-2 mb-4">
              {loadingTechs ? (
                <p className="text-gray-500 text-center">Loading technicians...</p>
              ) : technicians.length === 0 ? (
                <p className="text-gray-500 text-center">No technicians available.</p>
              ) : (
                technicians.map((tech) => {
                  const isBooked = !tech.isAvailable;
                  const isSelected = selectedTechnician?.id === tech.technicianId;

                  return (
                    <button
                      key={tech.technicianId}
                      onClick={() => handleTechnicianSelection(tech)}
                      disabled={isBooked}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                        isBooked
                          ? "bg-red-100 text-red-700 cursor-not-allowed border border-red-200"
                          : isSelected
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      {tech.technicianName} 
                      {isBooked && " (Booked)"}
                    </button>
                  );
                })
              )}
            </div>


          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-6xl mt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaTools className="mr-2 text-blue-600" />
            Services
            {loading.services && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
          </h3>

          {/* Add Service Form */}
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

          {/* Services Table */}
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-6xl mt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaBox className="mr-2 text-green-600" />
            Service Packages
            {loading.packages && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
          </h3>

          {/* Add Service Package Form */}
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

          {/* Service Packages Table */}
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-6xl mt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaCogs className="mr-2 text-purple-600" />
            Custom Parts
            {loading.parts && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
          </h3>

          {/* Add Custom Part Form */}
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

          {/* Custom Parts Table */}
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

        {/* Notes Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-6xl mt-6">
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
                          <button
              onClick={handleBooking}
              disabled={!selectedDate || !selectedHour?.id || !selectedTechnician?.id}
              className={`mt-2 py-3 rounded-lg font-medium text-sm transition ${
                !selectedDate || !selectedHour?.id || !selectedTechnician?.id
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Request Service Now
            </button>

            {/* Booking Summary */}
            {(selectedDate || selectedHour?.id || selectedTechnician?.id) && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Service Request Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {selectedDate && (
                    <p>Date: {moment(selectedDate).format("MMMM D, YYYY")}</p>
                  )}
                  {selectedHour?.label && (
                    <p>Time: {selectedHour.label}</p>
                  )}
                  {selectedTechnician?.name && (
                    <p>Technician: {selectedTechnician.name}</p>
                  )}
                </div>
              </div>
            )}

      </div>
            
            
    </div>
  );
}