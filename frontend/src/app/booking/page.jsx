"use client";

import { useState, useEffect } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import NavbarAfterLogin from "@/components/NavbarAfterLogin";
import { useAuth } from "@/contexts/AuthContext";

export default function Booking() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [period, setPeriod] = useState("AM");
  const [selectedHour, setSelectedHour] = useState({ id: null, label: null });
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  const [slots, setSlots] = useState({ AM: [], PM: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [technicians, setTechnicians] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(false);

  const [bookedTechIds, setBookedTechIds] = useState([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/auth/login");
      else if (user.roleId === 3 && !user.customerId) {
        alert("Customer ID missing. Please login again.");
        router.push("/auth/login");
      }
    }
  }, [loading, user, router]);

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

    while (days.length < 42)
      days.push({ date: end.add(1, "day").toDate(), outside: true });

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
      const response = await fetch(`http://localhost:3001/api/slot-dates/slots/${formattedDate}`);
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
        `http://localhost:3001/api/bookings/booked-technicians/${slotId}?date=${formattedDate}`,
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
        `http://localhost:3001/api/bookings/availability?date=${formattedDate}&timeSlotId=${selectedHour.id}`,
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
      notes: "",
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/bookings", {
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
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center text-red-500 font-semibold">You must be logged in to access the calendar.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <NavbarAfterLogin user={user} />

      <div className="pt-28 p-4 flex flex-col items-center w-full">
        <div className="w-full text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Book Your Appointment</h1>
          <p className="text-gray-600 text-lg">Choose your preferred date, time, and technician</p>
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

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (!outside && !pastDate) {
                        setSelectedDate(date);
                        fetchSlots(date);
                      }
                    }}
                    disabled={outside || pastDate}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                      ${outside || pastDate ? "text-gray-300 cursor-not-allowed" : ""}
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

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSlotSelection(slot)}
                      disabled={pastSlot}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                        pastSlot
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : selectedHour?.id === slot.timeSlotId
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
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

            <button
              onClick={handleBooking}
              disabled={!selectedDate || !selectedHour?.id || !selectedTechnician?.id}
              className={`mt-2 py-3 rounded-lg font-medium text-sm transition ${
                !selectedDate || !selectedHour?.id || !selectedTechnician?.id
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Book Now
            </button>

            {/* Booking Summary */}
            {(selectedDate || selectedHour?.id || selectedTechnician?.id) && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Booking Summary</h4>
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
      </div>
    </div>
  );
}