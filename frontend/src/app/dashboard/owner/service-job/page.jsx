"use client";

import { useState } from "react";
import moment from "moment";
import NavbarAfterLogin from "@/components/NavbarAfterLogin";
import { useAuth } from "@/contexts/AuthContext";

export default function Booking() {
  const { user, loading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [period, setPeriod] = useState("AM");
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState();
  const [selectedService, setSelectedService] = useState();
  const [slots, setSlots] = useState({ AM: [], PM: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);

  const techniciansList = ["John Doe", "Jane Smith", "Mike Johnson", "Emily Davis", "Alice Brown", "David Wilson", "Sarah Lee"];
  
  const servicesList = [
    "Oil Change",
    "Brake Service",
    "Tire Rotation",
    "Engine Diagnostic",
    "AC Repair",
    "Transmission Service",
    "Battery Replacement",
    "Wheel Alignment",
    "Pre-purchase Inspection",
    "General Maintenance"
  ];

  // =========================
  // Generate Days for Calendar
  // =========================
  const getDaysInMonth = () => {
    const start = moment(currentDate).startOf("month");
    const end = moment(currentDate).endOf("month");
    const days = [];

    const startDay = start.day();
    for (let i = 0; i < startDay; i++) {
      days.push({
        date: start.clone().subtract(startDay - i, "days").toDate(),
        outside: true,
      });
    }

    for (let i = 1; i <= end.date(); i++) {
      days.push({ date: moment(currentDate).date(i).toDate(), outside: false });
    }

    while (days.length < 42) {
      days.push({ date: end.add(1, "day").toDate(), outside: true });
    }

    return days;
  };

  // =========================
  // Month Navigation
  // =========================
  const navigate = (direction) => {
    const newDate = moment(currentDate)
      .add(direction === "NEXT" ? 1 : -1, "month")
      .toDate();
    setCurrentDate(newDate);
  };

  // =========================
  // Fetch Slots for selected date
  // =========================
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

  // =========================
  // 12-hour format helper
  // =========================
  const formatTime12h = (time) => {
    const [hour, minute] = time.split(":").map(Number);
    const h = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour >= 12 ? "PM" : "AM";
    return `${h}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const handleBooking = () => {
    alert(
      `Service Booking Confirmed:\n
Customer: ${user.name || "Unknown"}\n
Date: ${selectedDate ? moment(selectedDate).format("MMMM D, YYYY") : "Not selected"}\n
Time: ${selectedHour || "Not selected"}\n
Service: ${selectedService || "Not selected"}\n
Technician: ${selectedTechnician || "Not selected"}`
    );
  };

  const days = getDaysInMonth();
  const monthYear = moment(currentDate).format("MMMM YYYY");
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user)
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-semibold">You must be logged in to access the booking system.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* NAVBAR */}
      <NavbarAfterLogin user={user} />

      {/* MAIN CONTAINER */}
      <div className="pt-28 p-4 flex flex-col items-center w-full">

        {/* HEADER */}
        <div className="w-full text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Book Your Service</h1>
          <p className="text-gray-600 text-lg">
            Choose your service, date, time, and technician
          </p>
        </div>

        {/* MAIN BOOKING CONTAINER */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-6xl">
          
          {/* SERVICE SELECTION - NEW SECTION */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Service Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {servicesList.map((service, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedService(service)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all border ${
                    selectedService === service 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          {/* CALENDAR + TIME + TECHNICIAN */}
          <div className="flex gap-6">

            {/* LEFT - Calendar */}
            <div className="w-1/3">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Date</h2>
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

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (!outside) {
                          setSelectedDate(date);
                          fetchSlots(date);
                        }
                      }}
                      className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                        ${outside ? "text-gray-300 cursor-default" : ""}
                        ${isSelected ? "bg-indigo-600 text-white shadow-md" :
                          isToday && !outside ? "bg-indigo-100 text-indigo-600 font-semibold" :
                          !outside ? "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600" : ""
                        }`}
                      disabled={outside}
                    >
                      {moment(date).date()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MIDDLE - Time Selector */}
            <div className="w-1/3 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Time</h2>
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-500">Selected Date</p>
                <p className="text-lg font-semibold text-indigo-600">
                  {selectedDate ? moment(selectedDate).format("MMMM D, YYYY") : "No date selected"}
                </p>
              </div>

              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => setPeriod("AM")}
                  className={`px-4 py-2 rounded-lg font-medium ${period === "AM" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  AM
                </button>
                <button
                  onClick={() => setPeriod("PM")}
                  className={`px-4 py-2 rounded-lg font-medium ${period === "PM" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  PM
                </button>
              </div>

              <div className="flex-1 overflow-y-auto border rounded-lg p-3 space-y-2">
                {loadingSlots ? (
                  <p className="text-gray-500 text-center">Loading available times...</p>
                ) : slots[period].length === 0 ? (
                  <p className="text-gray-500 text-center">No slots available.</p>
                ) : (
                  slots[period].map((slot, idx) => {
                    const fullTime = `${formatTime12h(slot.startTime)} - ${formatTime12h(slot.endTime)}`;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedHour(fullTime)}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${selectedHour === fullTime ? "bg-indigo-600 text-white shadow" : "bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
                      >
                        {fullTime}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT - Technician Selector */}
            <div className="w-1/3 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Technician</h2>
              <div className="flex-1 overflow-y-auto border rounded-lg p-3 space-y-2 mb-4">
                {techniciansList.map((tech, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTechnician(tech)}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${selectedTechnician === tech ? "bg-indigo-600 text-white shadow" : "bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
                  >
                    {tech}
                  </button>
                ))}
              </div>

              {/* BOOKING SUMMARY */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-2">Booking Summary</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Service:</span> {selectedService || "Not selected"}</p>
                  <p><span className="font-medium">Date:</span> {selectedDate ? moment(selectedDate).format("MMMM D, YYYY") : "Not selected"}</p>
                  <p><span className="font-medium">Time:</span> {selectedHour || "Not selected"}</p>
                  <p><span className="font-medium">Technician:</span> {selectedTechnician || "Not selected"}</p>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedHour || !selectedTechnician || !selectedService}
                className={`mt-4 py-3 rounded-lg font-medium text-sm transition ${
                  !selectedDate || !selectedHour || !selectedTechnician || !selectedService 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                Book Service Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}