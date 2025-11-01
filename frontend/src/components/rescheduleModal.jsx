  //component/rescheduleModal.jsx
  
  "use client";

  import { useState, useEffect } from "react";
  import moment from "moment";
  import { useRouter } from "next/navigation";
  import { useAuth } from "@/contexts/AuthContext";

  export default function RescheduleModal({ isOpen, onClose, bookingId }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [period, setPeriod] = useState("AM");
    const [selectedHour, setSelectedHour] = useState({ id: null, label: null });
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);

    const [slots, setSlots] = useState({ AM: [], PM: [] });
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [technicians, setTechnicians] = useState([]);
    const [loadingTechs, setLoadingTechs] = useState(false);

    const [bookedTechIds, setBookedTechIds] = useState([]);
    const [blockedDates, setBlockedDates] = useState({});

    // Fetch booking details when modal opens
    useEffect(() => {
      const fetchBookingDetails = async () => {
        if (!isOpen || !bookingId) return;
        
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.ok) {
            const data = await response.json();
            setBookingDetails(data);
          } else {
            console.error("Failed to fetch booking details");
          }
        } catch (err) {
          console.error("Error fetching booking details:", err);
        }
      };

      fetchBookingDetails();
    }, [isOpen, bookingId]);

    useEffect(() => {
      const loadBlockedDates = async () => {
        try {
          const monthStart = moment(currentDate).startOf("month").format("YYYY-MM-DD");
          const monthEnd = moment(currentDate).endOf("month").format("YYYY-MM-DD");

          const res = await fetch(`http://localhost:3001/api/slot-dates?start=${monthStart}&end=${monthEnd}`);
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

      loadBlockedDates();
    }, [currentDate]);

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

    // Reset form when modal closes
    useEffect(() => {
      if (!isOpen) {
        setSelectedDate(null);
        setSelectedHour({ id: null, label: null });
        setSelectedTechnician(null);
        setBookedTechIds([]);
        setSlots({ AM: [], PM: [] });
        setTechnicians([]);
        setBookingDetails(null);
      }
    }, [isOpen]);

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
      
      if (!isBooked) {
        setSelectedTechnician({ 
          id: tech.technicianId, 
          name: tech.technicianName 
        });
      }
    };

    const handleReschedule = async () => {
      if (!selectedDate || !selectedHour?.id || !selectedTechnician?.id) {
        alert("Please select a date, time, and technician.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized. Please log in again.");
        return;
      }

      const payload = {
        timeSlotId: selectedHour.id,
        technicianId: selectedTechnician.id,
        rescheduledDate: moment(selectedDate).format("YYYY-MM-DD"),
      };

      try {
        const res = await fetch(`http://localhost:3001/api/bookings/reschedule/${bookingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          alert("Booking successfully rescheduled!");
          onClose();
          router.refresh();
        } else {
          alert(data.message || "Failed to reschedule booking.");
        }
      } catch (err) {
        console.error(err);
        alert("Error rescheduling booking.");
      }
    };

    const days = getDaysInMonth();
    const monthYear = moment(currentDate).format("MMMM YYYY");
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!user) return <div className="p-8 text-center text-red-500 font-semibold">You must be logged in to access the calendar.</div>;

    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Reschedule Booking</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-auto p-6">
                <div className="flex gap-6">
                  
                  {/* Calendar */}
                  <div className="w-1/4">
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
                  <div className="w-1/4 flex flex-col">
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
                  <div className="w-1/4 flex flex-col">
                    <div className="mb-2">
                      <h3 className="text-gray-700 font-medium text-sm">Select Technician</h3>
                      {selectedHour?.id && (
                        <p className="text-xs text-gray-500 mt-1">
                          Available technicians for {selectedHour.label}
                        </p>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto border rounded-lg p-3 space-y-2">
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

                  {/* Booking Summary Column with Reschedule Button */}
                  <div className="w-1/4 flex flex-col">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex-1">
                      <h4 className="font-medium text-gray-700 mb-3 text-lg">Booking Summary</h4>
                      <div className="text-sm text-gray-600 space-y-3">
                        {/* Customer Information */}
                        {bookingDetails && (
                          <div className="mb-3 pb-3 border-b border-gray-200">
                            <p className="font-semibold text-gray-700 mb-2">Customer Information</p>
                            <p className="mb-1"><span className="font-medium">Name:</span> {bookingDetails.customerName}</p>
                            {bookingDetails.customerEmail && (
                              <p className="mb-1"><span className="font-medium">Email:</span> {bookingDetails.customerEmail}</p>
                            )}
                            {bookingDetails.customerPhone && (
                              <p><span className="font-medium">Phone:</span> {bookingDetails.customerPhone}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Current Booking Details */}
                        {bookingDetails && (
                          <div className="mb-3 pb-3 border-b border-gray-200">
                            <p className="font-semibold text-gray-700 mb-2">Current Booking</p>
                            <p className="mb-1"><span className="font-medium">Date:</span> {moment(bookingDetails.date).format("MMMM D, YYYY")}</p>
                            <p className="mb-1"><span className="font-medium">Time:</span> {bookingDetails.time || `${bookingDetails.startTime} - ${bookingDetails.endTime}`}</p>
                            {bookingDetails.technicianName && (
                              <p><span className="font-medium">Technician:</span> {bookingDetails.technicianName}</p>
                            )}
                          </div>
                        )}

                        {/* New Booking Details */}
                        <div className="mb-4">
                          <p className="font-semibold text-gray-700 mb-2">New Schedule</p>
                          {selectedDate ? (
                            <p className="mb-1"><span className="font-medium">Date:</span> {moment(selectedDate).format("MMMM D, YYYY")}</p>
                          ) : (
                            <p className="mb-1 text-gray-400">Date: Not selected</p>
                          )}
                          {selectedHour?.label ? (
                            <p className="mb-1"><span className="font-medium">Time:</span> {selectedHour.label}</p>
                          ) : (
                            <p className="mb-1 text-gray-400">Time: Not selected</p>
                          )}
                          {selectedTechnician?.name ? (
                            <p><span className="font-medium">Technician:</span> {selectedTechnician.name}</p>
                          ) : (
                            <p className="text-gray-400">Technician: Not selected</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reschedule Button - Now below the Booking Summary */}
                    <button
                      onClick={handleReschedule}
                      disabled={!selectedDate || !selectedHour?.id || !selectedTechnician?.id}
                      className={`w-full mt-4 py-3 rounded-lg font-medium text-sm transition ${
                        !selectedDate || !selectedHour?.id || !selectedTechnician?.id
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                      }`}
                    >
                      Reschedule Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }