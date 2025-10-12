


"use client";

import { useState, useEffect } from "react";
import moment from "moment";
import { useRouter } from "next/navigation"; 
import NavbarAfterLogin from "@/components/NavbarAfterLogin";
import { useAuth } from "@/contexts/AuthContext";

export default function Booking() {
  const { user, loading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [period, setPeriod] = useState("AM");
  const [selectedHour, setSelectedHour] = useState({ id: null, label: null });
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [slots, setSlots] = useState({ AM: [], PM: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
   const router = useRouter(); 

  
useEffect(() => {
  // Only run the check after AuthContext finishes loading
  if (!loading) {
    if (!user) {
      router.push("/auth/login"); // not logged in
    } else if (user.roleId === 3 && !user.customerId) {
      alert("Customer ID missing. Please login again.");
      router.push("/auth/login");
    }
  }
}, [loading, user, router]);


  // =========================
  // Fetch Technicians
  // =========================
 useEffect(() => {
  const fetchTechnicians = async () => {
    setLoadingTechs(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found. User might not be logged in.");
        setTechnicians([]);
        setLoadingTechs(false);
        return;
      }

      const response = await fetch("http://localhost:3001/api/technicians", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetch status:", response.status);

      if (response.status === 401) {
        console.error("Unauthorized! Token might be invalid or expired.");
        alert("Session expired. Please log in again.");
        router.push("/auth/login");
        return;
      }

      if (!response.ok) {
        console.error("Failed to fetch technicians:", response.status, response.statusText);
        throw new Error("Failed to fetch technicians");
      }

      const data = await response.json();
      console.log("Technicians fetched:", data);

      // Make sure data is an array
      if (!Array.isArray(data)) {
        console.warn("Unexpected data format, expected array:", data);
        setTechnicians([]);
      } else {
        setTechnicians(data);
      }

    } catch (err) {
      console.error("Error fetching technicians:", err);
      setTechnicians([]);
    } finally {
      setLoadingTechs(false);
    }
  };

  fetchTechnicians();
}, [router]);

  // =========================
  // Calendar logic
  // =========================
  const getDaysInMonth = () => {
    const start = moment(currentDate).startOf("month");
    const end = moment(currentDate).endOf("month");
    const days = [];

    const startDay = start.day();
    for (let i = 0; i < startDay; i++) {
      days.push({ date: start.clone().subtract(startDay - i, "days").toDate(), outside: true });
    }

    for (let i = 1; i <= end.date(); i++) {
      days.push({ date: moment(currentDate).date(i).toDate(), outside: false });
    }

    while (days.length < 42) {
      days.push({ date: end.add(1, "day").toDate(), outside: true });
    }

    return days;
  };

  const navigate = (direction) => {
    const newDate = moment(currentDate).add(direction === "NEXT" ? 1 : -1, "month").toDate();
    setCurrentDate(newDate);
  };

  const fetchSlots = async (date) => {
    setLoadingSlots(true);
    const formattedDate = moment(date).format("YYYY-MM-DD");
    try {
      const response = await fetch(`http://localhost:3001/api/slot-dates/slots/${formattedDate}`);
      if (!response.ok) throw new Error("Failed to fetch slots");
      const data = await response.json();

      const AM = data.filter((slot) => parseInt(slot.startTime.split(":")[0]) < 12);
      const PM = data.filter((slot) => parseInt(slot.startTime.split(":")[0]) >= 12);

      setSlots({ AM, PM });
      setSelectedHour(null);
    } catch (err) {
      console.error(err);
      setSlots({ AM: [], PM: [] });
      setSelectedHour(null);
    } finally {
      setLoadingSlots(false);
    }
  };

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

  const days = getDaysInMonth();
  const monthYear = moment(currentDate).format("MMMM YYYY");
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user)
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-semibold">
          You must be logged in to access the calendar.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <NavbarAfterLogin user={user} />

      <div className="pt-28 p-4 flex flex-col items-center w-full">
        {/* HEADER */}
        <div className="w-full text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Book Your Appointment
          </h1>
          <p className="text-gray-600 text-lg">
            Choose your preferred date, time, and technician
          </p>
        </div>

        {/* MAIN CONTENT */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-6xl flex gap-6">

          {/* LEFT - Calendar */}
          <div className="w-1/3">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => navigate("PREV")} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors">&lt;</button>
              <span className="text-lg font-semibold text-gray-800">{monthYear}</span>
              <button onClick={() => navigate("NEXT")} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors">&gt;</button>
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

          {/* MIDDLE - Time Selector */}
          <div className="w-1/3 flex flex-col">
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-500">Selected Date</p>
              <p className="text-lg font-semibold text-indigo-600">
                {selectedDate ? moment(selectedDate).format("MMMM D, YYYY") : "No date selected"}
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-4">
              <button onClick={() => setPeriod("AM")} className={`px-4 py-2 rounded-lg font-medium ${period === "AM" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>AM</button>
              <button onClick={() => setPeriod("PM")} className={`px-4 py-2 rounded-lg font-medium ${period === "PM" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>PM</button>
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
                  const unavailable = !slot.isAvailable; // 🟡 Mark slot as booked/unavailable
                  return (
                    <button
                      key={idx}
                      onClick={() => !pastSlot && setSelectedHour({ id: slot.timeSlotId, label: fullTime })}
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

          {/* RIGHT - Technician Selector */}
          <div className="w-1/3 flex flex-col justify-between">
            <div className="mb-2">
              <h3 className="text-gray-700 font-medium text-sm">Select Technician</h3>
            </div>

            <div className="flex-1 overflow-y-auto border rounded-lg p-3 space-y-2 mb-4">
              {loadingTechs ? (
                <p className="text-gray-500 text-center">Loading technicians...</p>
              ) : technicians.length === 0 ? (
                <p className="text-gray-500 text-center">No technicians available.</p>
              ) : (
                technicians.map((tech) => (
                  <button
                    key={tech.technicianId}
                    onClick={() => setSelectedTechnician({ id: tech.technicianId, name: `${tech.firstName} ${tech.lastName}` })}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTechnician?.id === tech.technicianId
                        ? "bg-indigo-600 text-white shadow"
                        : "bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {tech.firstName} {tech.lastName}
                  </button>
                ))
              )}
            </div>

                    <button
            onClick={async () => {
              // Validate selections
              if (!selectedDate || !selectedHour?.id || !selectedTechnician?.id) {
                alert("Please select a date, time, and technician.");
                return;
              }

              // Make sure user has a customerId
              if (!user?.customerId) {
                alert("Customer ID not found. Please login again.");
                return;
              }

              // Prepare payload
              const payload = {
                customerId: user.customerId,
                technicianId: selectedTechnician.id,
                timeSlotId: selectedHour.id,
                notes: "",
              };

              console.log("Booking payload:", payload); // debug

              try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:3001/api/bookings", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (response.ok) {
                  alert("Booking successful!");
                  // Reset selections
                  setSelectedDate(null);
                  setSelectedHour({ id: null, label: null });
                  setSelectedTechnician({ id: null, name: null });
                  setSlots({ AM: [], PM: [] });
                } else {
                  console.error("Booking failed:", data);
                  alert(data.message || "Booking failed. Check console for details.");
                }
              } catch (err) {
                console.error("Booking error:", err);
                alert("Booking failed due to server error.");
              }
            }}
            className={`mt-2 py-3 rounded-lg font-medium text-sm transition ${
              !selectedDate || !selectedHour?.id || !selectedTechnician?.id
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            Book Now
          </button>

          </div>
        </div>
      </div>
    </div>
  );
}