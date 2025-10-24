"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { FaTrash, FaTimes, FaSearch, FaCalendarAlt, FaClock, FaBan, FaCheckCircle } from "react-icons/fa";

const API_URL = "http://localhost:3001/api/slot-dates";
const SLOT_API_BASE = "http://localhost:3001/api/slot-dates";
const BOOKING_API_BASE = "http://localhost:3001/api/bookings";

export default function ScheduleManagementPage() {
  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "day" or "technician"
  const [loading, setLoading] = useState(false);

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [multipleDay, setMultipleDay] = useState(false);

  // Time slot states
  const [period, setPeriod] = useState("AM");
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [multipleTime, setMultipleTime] = useState(false);

  const [slots, setSlots] = useState({ AM: [], PM: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [blockedDays, setBlockedDays] = useState([]);

  // Technician states
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  // Initialize data
  useEffect(() => {
    fetchSchedules();
    loadTechnicians();
  }, []);

  // Load blocked days when month changes and modal is open
  useEffect(() => {
    if (isModalOpen) {
      fetchBlockedDaysForMonth();
    }
  }, [currentDate, isModalOpen]);

  // Load technicians
  const loadTechnicians = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/technicians", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (Array.isArray(data)) setTechnicians(data);
      else setTechnicians([]);
    } catch (err) {
      console.error("Error loading technicians:", err);
      setTechnicians([]);
    }
  };

  // Fetch blocked days for the current month
  const fetchBlockedDaysForMonth = async () => {
    try {
      const monthStart = moment(currentDate).startOf("month").format("YYYY-MM-DD");
      const monthEnd = moment(currentDate).endOf("month").format("YYYY-MM-DD");

      const res = await fetch(`${SLOT_API_BASE}?start=${monthStart}&end=${monthEnd}`);
      if (!res.ok) throw new Error("Failed to fetch slot dates");
      const data = await res.json();

      const blockedDates = data
        .filter(sd => !sd.isOpen)
        .map(sd => new Date(sd.slotDate));

      setBlockedDays(blockedDates);
    } catch (err) {
      console.error(err);
      setBlockedDays([]);
    }
  };

  // Fetch technician availability when technician or date changes
  useEffect(() => {
    if (selectedTechnician && selectedDate && modalType === "technician") {
      fetchTechnicianAvailability(selectedTechnician.technicianId, selectedDate);
    }
  }, [selectedTechnician, selectedDate, modalType]);

  // Data fetching functions
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setSchedules(res.data);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      alert("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date) => {
    if (!date) return;
    
    setLoadingSlots(true);
    const formattedDate = moment(date).format("YYYY-MM-DD");
    
    try {
      const response = await fetch(`${SLOT_API_BASE}/slots/${formattedDate}`);
      if (!response.ok) throw new Error("Failed to fetch slots");
      
      const data = await response.json();
      const AM = data.filter(slot => parseInt(slot.startTime.split(":")[0]) < 12);
      const PM = data.filter(slot => parseInt(slot.startTime.split(":")[0]) >= 12);

      setSlots({ AM, PM });
      setSelectedHour(null);
      setSelectedTimes([]);

      // Check if the entire day is blocked
      const dayStatusResponse = await axios.get(`${SLOT_API_BASE}/date/${formattedDate}`).catch(() => null);
      if (dayStatusResponse?.data) {
        setBlockedDays(prev => {
          const filtered = prev.filter(d => !moment(d).isSame(date, 'day'));
          return dayStatusResponse.data.isOpen === false 
            ? [...filtered, date] 
            : filtered;
        });
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
      setSlots({ AM: [], PM: [] });
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchTechnicianAvailability = async (technicianId, date) => {
    if (!date || !technicianId) return;
    
    setLoadingSlots(true);
    const formattedDate = moment(date).format("YYYY-MM-DD");
    
    try {
      const response = await axios.get(`${BOOKING_API_BASE}/availability/by-technician`, {
        params: { technicianId, date: formattedDate }
      });

      // Convert availability data to time slots format
      const availabilityData = response.data;
      
      // Group by AM/PM
      const AM = availabilityData.filter(slot => {
        const hour = parseInt(slot.startTime.split(":")[0]);
        return hour < 12;
      }).map(slot => ({
        ...slot,
        isAvailable: slot.isAvailable,
        timeSlotId: slot.timeSlotId,
        startTime: slot.startTime,
        endTime: slot.endTime
      }));

      const PM = availabilityData.filter(slot => {
        const hour = parseInt(slot.startTime.split(":")[0]);
        return hour >= 12;
      }).map(slot => ({
        ...slot,
        isAvailable: slot.isAvailable,
        timeSlotId: slot.timeSlotId,
        startTime: slot.startTime,
        endTime: slot.endTime
      }));

      setSlots({ AM, PM });
      setSelectedHour(null);
      setSelectedTimes([]);

    } catch (err) {
      console.error("Error fetching technician availability:", err);
      setSlots({ AM: [], PM: [] });
    } finally {
      setLoadingSlots(false);
    }
  };

  // Modal management
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
    resetSelection();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("");
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedDate(null);
    setSelectedDates([]);
    setSelectedHour(null);
    setSelectedTimes([]);
    setSlots({ AM: [], PM: [] });
    setMultipleDay(false);
    setMultipleTime(false);
    setBlockedDays([]);
    setSelectedTechnician(null);
  };

  // Schedule operations
  const deleteSchedule = async (schedule) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    
    try {
      await axios.delete(`${API_URL}/${schedule.id}`);
      fetchSchedules();
    } catch (err) {
      console.error("Error deleting schedule:", err);
      alert("Failed to delete schedule");
    }
  };

  
  // Add this function to refresh blocked days
const refreshBlockedDays = async () => {
  const monthStart = moment(currentDate).startOf("month").format("YYYY-MM-DD");
  const monthEnd = moment(currentDate).endOf("month").format("YYYY-MM-DD");

  try {
    const res = await fetch(`${SLOT_API_BASE}?start=${monthStart}&end=${monthEnd}`);
    if (!res.ok) throw new Error("Failed to fetch slot dates");
    const data = await res.json();

    const blockedDates = data
      .filter(sd => !sd.isOpen)
      .map(sd => new Date(sd.slotDate));

    setBlockedDays(blockedDates);
  } catch (err) {
    console.error("Error refreshing blocked days:", err);
  }
};

  // Block/Unblock operations for general schedule
const handleDayOperation = async (isBlock) => {
  try {
    const targetDates = multipleDay ? selectedDates : [selectedDate];
     await refreshBlockedDays();
    if (!targetDates.length) {
      alert("Please select at least one date.");
      return;
    }

    for (const date of targetDates) {
      const formatted = moment(date).format("YYYY-MM-DD");
      const slotRes = await axios.get(`${SLOT_API_BASE}/date/${formatted}`).catch(() => null);

      if (slotRes?.data?.slotDateId) {
        await axios.patch(`${SLOT_API_BASE}/cascade/${slotRes.data.slotDateId}`, { isOpen: !isBlock });
      } else {
        await axios.post(SLOT_API_BASE, { slotDate: formatted, isOpen: !isBlock });
      }
    }

    // Update blocked days state more reliably
    setBlockedDays(prev => {
      let updated = [...prev];
      
      targetDates.forEach(date => {
        const existsIndex = updated.findIndex(d => moment(d).isSame(date, 'day'));
        
        if (isBlock) {
          // Blocking: add to blockedDays if not already there
          if (existsIndex === -1) {
            updated.push(date);
          }
        } else {
          // Unblocking: remove from blockedDays if exists
          if (existsIndex !== -1) {
            updated.splice(existsIndex, 1);
          }
        }
      });
      
      return updated;
    });

    alert(`Day(s) successfully ${isBlock ? 'blocked' : 'unblocked'}.`);
    if (selectedDate) fetchSlots(selectedDate);
  } catch (err) {
    console.error(err);
    alert(`Failed to ${isBlock ? 'block' : 'unblock'} day(s).`);
  }
};

  const handleTimeOperation = async (isBlock) => {
    try {
      if (!selectedDate) {
        alert("Select a date first.");
        return;
      }

      const times = multipleTime ? selectedTimes : [selectedHour];
      if (!times.length) {
        alert("Please select at least one time.");
        return;
      }

      const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
      
      // Find or create slot date
      let slotRes = await axios.get(`${SLOT_API_BASE}/date/${formattedDate}`).catch(() => null);
      if (!slotRes?.data?.slotDateId) {
        const createRes = await axios.post(SLOT_API_BASE, { slotDate: formattedDate, isOpen: true });
        slotRes = { data: { slotDateId: createRes.data.slotDateId } };
      }

      const slotDateId = slotRes.data.slotDateId;
      const response = await axios.get(`${SLOT_API_BASE}/${slotDateId}/time-slots`);
      const timeSlots = response.data;

      for (const time of times) {
        const [start] = time.split(" - ");
        const slot = timeSlots.find(t => 
          formatTime12h(t.startTime) === start.trim()
        );
        
        if (slot) {
          await axios.patch(`${SLOT_API_BASE}/time-slot/${slot.timeSlotId}`, { 
            isAvailable: !isBlock 
          });
        }
      }

      alert(`Time slot(s) successfully ${isBlock ? 'blocked' : 'unblocked'}.`);
      fetchSlots(selectedDate);
    } catch (err) {
      console.error(err);
      alert(`Failed to ${isBlock ? 'block' : 'unblock'} time(s).`);
    }
  };

  // Technician operations
  const handleBlockTechnician = async (technicianId, timeSlotId) => {
    try {
      await axios.post(`${BOOKING_API_BASE}/technicians/block`, {
        technicianId,
        timeSlotId,
      });
      alert("Technician blocked successfully!");
      // Refresh availability
      if (selectedDate) {
        fetchTechnicianAvailability(technicianId, selectedDate);
      }
    } catch (err) {
      console.error("Error blocking technician:", err);
      alert("Failed to block technician");
    }
  };

  const handleUnblockTechnician = async (technicianId, timeSlotId) => {
    try {
      await axios.post(`${BOOKING_API_BASE}/technicians/unblock`, {
        technicianId,
        timeSlotId,
      });
      alert("Technician unblocked successfully!");
      // Refresh availability
      if (selectedDate) {
        fetchTechnicianAvailability(technicianId, selectedDate);
      }
    } catch (err) {
      console.error("Error unblocking technician:", err);
      alert("Failed to unblock technician");
    }
  };

  // Bulk operations for technicians
  const handleBulkBlockTimesWithDays = async () => {
    if (!selectedTechnician || selectedTimes.length === 0) {
      alert("Please select a technician and at least one time slot");
      return;
    }

    const daysToBlock = multipleDay ? selectedDates : (selectedDate ? [selectedDate] : []);
    
    if (daysToBlock.length === 0) {
      alert("Please select at least one day");
      return;
    }

    try {
      let totalBlocked = 0;
      
      for (const date of daysToBlock) {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        
        for (const timeSlotId of selectedTimes) {
          await axios.post(`${BOOKING_API_BASE}/technicians/block`, {
            technicianId: selectedTechnician.technicianId,
            timeSlotId,
          });
          totalBlocked++;
        }
      }
      
      alert(`Successfully blocked ${totalBlocked} time slot(s) across ${daysToBlock.length} day(s)!`);
      setSelectedTimes([]);
      
      if (selectedDate) {
        fetchTechnicianAvailability(selectedTechnician.technicianId, selectedDate);
      }
    } catch (err) {
      console.error("Error bulk blocking time slots with days:", err);
      alert("Failed to block time slots");
    }
  };

  const handleBulkUnblockTimesWithDays = async () => {
    if (!selectedTechnician || selectedTimes.length === 0) {
      alert("Please select a technician and at least one time slot");
      return;
    }

    const daysToUnblock = multipleDay ? selectedDates : (selectedDate ? [selectedDate] : []);
    
    if (daysToUnblock.length === 0) {
      alert("Please select at least one day");
      return;
    }

    try {
      let totalUnblocked = 0;
      
      for (const date of daysToUnblock) {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        
        for (const timeSlotId of selectedTimes) {
          await axios.post(`${BOOKING_API_BASE}/technicians/unblock`, {
            technicianId: selectedTechnician.technicianId,
            timeSlotId,
          });
          totalUnblocked++;
        }
      }
      
      alert(`Successfully unblocked ${totalUnblocked} time slot(s) across ${daysToUnblock.length} day(s)!`);
      setSelectedTimes([]);
      
      if (selectedDate) {
        fetchTechnicianAvailability(selectedTechnician.technicianId, selectedDate);
      }
    } catch (err) {
      console.error("Error bulk unblocking time slots with days:", err);
      alert("Failed to unblock time slots");
    }
  };

  const handleBulkBlockDays = async () => {
    const daysToBlock = multipleDay ? selectedDates : (selectedDate ? [selectedDate] : []);
    
    if (!selectedTechnician || daysToBlock.length === 0) {
      alert("Please select a technician and at least one day");
      return;
    }

    try {
      for (const date of daysToBlock) {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        
        const availabilityResponse = await axios.get(`${BOOKING_API_BASE}/availability/by-technician`, {
          params: { 
            technicianId: selectedTechnician.technicianId, 
            date: formattedDate 
          }
        });

        for (const slot of availabilityResponse.data) {
          await axios.post(`${BOOKING_API_BASE}/technicians/block`, {
            technicianId: selectedTechnician.technicianId,
            timeSlotId: slot.timeSlotId,
          });
        }
      }
      
      const dayCount = daysToBlock.length;
      alert(`Successfully blocked all time slots for ${dayCount} day(s)!`);
      
      if (multipleDay) {
        setSelectedDates([]);
      } else {
        setSelectedDate(null);
      }
      
      if (selectedDate) {
        fetchTechnicianAvailability(selectedTechnician.technicianId, selectedDate);
      }
    } catch (err) {
      console.error("Error bulk blocking days:", err);
      alert("Failed to block days");
    }
  };

  const handleBulkUnblockDays = async () => {
    const daysToUnblock = multipleDay ? selectedDates : (selectedDate ? [selectedDate] : []);
    
    if (!selectedTechnician || daysToUnblock.length === 0) {
      alert("Please select a technician and at least one day");
      return;
    }

    try {
      for (const date of daysToUnblock) {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        
        const availabilityResponse = await axios.get(`${BOOKING_API_BASE}/availability/by-technician`, {
          params: { 
            technicianId: selectedTechnician.technicianId, 
            date: formattedDate 
          }
        });

        for (const slot of availabilityResponse.data) {
          await axios.post(`${BOOKING_API_BASE}/technicians/unblock`, {
            technicianId: selectedTechnician.technicianId,
            timeSlotId: slot.timeSlotId,
          });
        }
      }
      
      const dayCount = daysToUnblock.length;
      alert(`Successfully unblocked all time slots for ${dayCount} day(s)!`);
      
      if (multipleDay) {
        setSelectedDates([]);
      } else {
        setSelectedDate(null);
      }
      
      if (selectedDate) {
        fetchTechnicianAvailability(selectedTechnician.technicianId, selectedDate);
      }
    } catch (err) {
      console.error("Error bulk unblocking days:", err);
      alert("Failed to unblock days");
    }
  };

  // Calendar helpers
  const getDaysInMonth = () => {
    const start = moment(currentDate).startOf("month");
    const end = moment(currentDate).endOf("month");
    const days = [];

    // Previous month days
    const startDay = start.day();
    for (let i = 0; i < startDay; i++) {
      days.push({
        date: start.clone().subtract(startDay - i, "days").toDate(),
        outside: true,
      });
    }

    // Current month days
    for (let i = 1; i <= end.date(); i++) {
      days.push({ date: moment(currentDate).date(i).toDate(), outside: false });
    }

    // Next month days
    while (days.length < 42) {
      days.push({ date: end.add(1, "day").toDate(), outside: true });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = moment(currentDate)
      .add(direction === "next" ? 1 : -1, "month")
      .toDate();
    setCurrentDate(newDate);
  };

  const formatTime12h = (time) => {
    const [hour, minute] = time.split(":").map(Number);
    const h = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour >= 12 ? "PM" : "AM";
    return `${h}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  // Check if a day is blocked
  const isDayBlocked = (date) => {
    return blockedDays.some(blockedDate => moment(blockedDate).isSame(date, 'day'));
  };

  // Selection handlers
  const handleDateSelect = (date) => {
    if (multipleDay) {
      setSelectedDates(prev => {
        const exists = prev.some(d => moment(d).isSame(date, "day"));
        return exists
          ? prev.filter(d => !moment(d).isSame(date, "day"))
          : [...prev, date];
      });
    } else {
      setSelectedDate(date);
      setSelectedDates([]);
    }
    
    if (modalType === "day") {
      fetchSlots(date);
    } else if (modalType === "technician" && selectedTechnician) {
      fetchTechnicianAvailability(selectedTechnician.technicianId, date);
    }
  };

  const handleTimeSelect = (time, isBlocked) => {
    if (modalType === "day") {
      if (multipleTime) {
        setSelectedTimes(prev =>
          prev.includes(time)
            ? prev.filter(t => t !== time)
            : [...prev, time]
        );
      } else {
        setSelectedHour(time);
      }
    } else if (modalType === "technician") {
      if (multipleTime) {
        setSelectedTimes(prev =>
          prev.includes(time)
            ? prev.filter(t => t !== time)
            : [...prev, time]
        );
      } else {
        // For single selection, just block/unblock immediately for the current date
        if (selectedTechnician && selectedDate) {
          if (isBlocked) {
            handleUnblockTechnician(selectedTechnician.technicianId, time);
          } else {
            handleBlockTechnician(selectedTechnician.technicianId, time);
          }
        }
      }
    }
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedDates([]);
    setSelectedTimes([]);
  };

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule =>
    schedule.reason?.toLowerCase().includes(search.toLowerCase())
  );

  // Calendar data
  const days = getDaysInMonth();
  const monthYear = moment(currentDate).format("MMMM YYYY");
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Schedule Management</h1>
          <p className="text-gray-600 mt-1">Manage blocked schedules and availability</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => openModal("day")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <FaCalendarAlt className="text-sm" />
            Update Schedule
          </button>
          <button
            onClick={() => openModal("technician")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
          >
            <FaClock className="text-sm" />
            Update Technician Schedule
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border p-4 mb-6 shadow-sm">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {schedule.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {schedule.startTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {schedule.endTime}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {schedule.reason || "No reason provided"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FaBan className="mr-1" />
                        Blocked
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => deleteSchedule(schedule)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                      >
                        <FaTrash className="text-xs" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No schedules found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalType === "day" ? "Update Schedule Availability" : "Manage Technician Schedule"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            {modalType === "day" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Select Date(s)</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth("prev")}
                      className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      &lt;
                    </button>
                    <span className="text-lg font-semibold text-gray-800">
                      {monthYear}
                    </span>
                    <button
                      onClick={() => navigateMonth("next")}
                      className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      &gt;
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* FIXED CALENDAR - This is the key fix */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map(({ date, outside }, index) => {
                      const isToday = moment(date).isSame(new Date(), "day");
                      const isSelected = multipleDay
                        ? selectedDates.some(d => moment(d).isSame(date, "day"))
                        : selectedDate && moment(date).isSame(selectedDate, "day");
                      const isBlocked = isDayBlocked(date);

                      return (
                        <button
                          key={index}
                          onClick={() => !outside && handleDateSelect(date)}
                          disabled={outside}
                          className={`
                            aspect-square rounded-lg text-sm font-medium transition-all relative
                            border-2 ${isBlocked ? 'border-red-500' : 'border-transparent'}
                            ${outside ? "text-gray-300 cursor-default" : ""}
                            ${
                              isBlocked 
                                ? isSelected 
                                  ? "bg-red-600 text-white shadow-md"  // Blocked + Selected
                                  : "bg-red-100 text-red-700"          // Blocked + Not Selected (ALWAYS RED)
                                : isSelected
                                ? "bg-blue-600 text-white shadow-md"   // Not Blocked + Selected
                                : isToday && !outside
                                ? "bg-blue-100 text-blue-600 font-semibold"  // Today
                                : !outside
                                ? "text-gray-700 hover:bg-gray-100"    // Normal day
                                : ""
                            }
                          `}
                        >
                          {moment(date).date()}
                          {isBlocked && !isSelected && (
                            <FaBan className="absolute top-1 right-1 text-red-500 text-xs" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="multipleDay"
                      checked={multipleDay}
                      onChange={(e) => setMultipleDay(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="multipleDay" className="text-sm text-gray-700">
                      Select multiple days
                    </label>
                  </div>

                  {/* Legend */}
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Legend:</h4>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-600 rounded"></div>
                        <span>Selected</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-red-500 bg-red-100 rounded"></div>
                        <span>Blocked Day</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-100 rounded"></div>
                        <span>Today</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Selection Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Select Time(s)</h3>
                  
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setPeriod("AM")}
                      className={`flex-1 py-2 rounded-lg font-medium transition ${
                        period === "AM"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Morning (AM)
                    </button>
                    <button
                      onClick={() => setPeriod("PM")}
                      className={`flex-1 py-2 rounded-lg font-medium transition ${
                        period === "PM"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Afternoon (PM)
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                    {loadingSlots ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : slots[period].length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No time slots available for selected period
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {slots[period].map((slot, index) => {
                          const fullTime = `${formatTime12h(slot.startTime)} - ${formatTime12h(slot.endTime)}`;
                          const isSelected = multipleTime
                            ? selectedTimes.includes(fullTime)
                            : selectedHour === fullTime;
                          const isBlocked = !slot.isAvailable;

                          return (
                            <button
                              key={index}
                              onClick={() => handleTimeSelect(fullTime, isBlocked)}
                              className={`
                                p-3 rounded-lg text-sm font-medium transition-all relative
                                ${isBlocked 
                                  ? isSelected
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                                  : isSelected
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border'
                                }
                              `}
                            >
                              {fullTime}
                              {isBlocked && !isSelected && (
                                <FaBan className="absolute top-2 right-2 text-red-500 text-xs" />
                              )}
                              {!isBlocked && isSelected && (
                                <FaCheckCircle className="absolute top-2 right-2 text-white text-xs" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="multipleTime"
                      checked={multipleTime}
                      onChange={(e) => setMultipleTime(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="multipleTime" className="text-sm text-gray-700">
                      Select multiple time slots
                    </label>
                  </div>

                  {/* Time Legend */}
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Time Status:</h4>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                        <span>Blocked Time</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-50 border rounded"></div>
                        <span>Available Time</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-6">
                    <button
                      onClick={() => handleDayOperation(true)}
                      disabled={multipleDay ? !selectedDates.length : !selectedDate}
                      className="flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      <FaBan />
                      Block Day
                    </button>
                    
                    <button
                      onClick={() => handleDayOperation(false)}
                      disabled={multipleDay ? !selectedDates.length : !selectedDate}
                      className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      <FaCheckCircle />
                      Unblock Day
                    </button>
                    
                    <button
                      onClick={() => handleTimeOperation(true)}
                      disabled={multipleTime ? !selectedTimes.length : !selectedHour}
                      className="flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      <FaBan />
                      Block Time
                    </button>
                    
                    <button
                      onClick={() => handleTimeOperation(false)}
                      disabled={multipleTime ? !selectedTimes.length : !selectedHour}
                      className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      <FaCheckCircle />
                      Unblock Time
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modalType === "technician" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Technician Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Select Technician</h3>
                  <div className="border rounded-lg p-4 max-h-80 overflow-y-auto">
                    {technicians.length > 0 ? (
                      technicians.map((tech) => (
                        <button
                          key={tech.technicianId}
                          onClick={() => {
                            setSelectedTechnician(
                              selectedTechnician?.technicianId === tech.technicianId ? null : tech
                            );
                            // Clear previous selections when changing technician
                            setSelectedDate(null);
                            setSelectedDates([]);
                            setSelectedTimes([]);
                            setSlots({ AM: [], PM: [] });
                          }}
                          className={`
                            w-full text-left px-4 py-2 mb-2 rounded-lg font-medium transition
                            ${
                              selectedTechnician?.technicianId === tech.technicianId
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }
                          `}
                        >
                          {tech.firstName} {tech.lastName}
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">No technicians available.</p>
                    )}
                  </div>

                  {selectedTechnician && (
                    <div className="mt-2 text-sm text-green-700 font-medium flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      Selected: {selectedTechnician.firstName} {selectedTechnician.lastName}
                    </div>
                  )}
                </div>

                {/* Calendar Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-700">Select Date(s)</h3>
                    {selectedDates.length > 0 && (
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {selectedDates.length} selected
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="multipleDay"
                      checked={multipleDay}
                      onChange={(e) => {
                        setMultipleDay(e.target.checked);
                        if (!e.target.checked) {
                          setSelectedDates([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="multipleDay" className="text-sm text-gray-700">
                      Select multiple days
                    </label>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth("prev")}
                      className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      &lt;
                    </button>
                    <span className="text-lg font-semibold text-gray-800">
                      {monthYear}
                    </span>
                    <button
                      onClick={() => navigateMonth("next")}
                      className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      &gt;
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {days.map(({ date, outside }, index) => {
                      const isToday = moment(date).isSame(new Date(), "day");
                      const isSelected = multipleDay
                        ? selectedDates.some(d => moment(d).isSame(date, "day"))
                        : selectedDate && moment(date).isSame(selectedDate, "day");
                      const isBlocked = isDayBlocked(date);

                      return (
                        <button
                          key={index}
                          onClick={() => !outside && handleDateSelect(date)}
                          disabled={outside || !selectedTechnician}
                          className={`
                            aspect-square rounded-lg text-sm font-medium transition-all relative
                            border-2 ${isBlocked ? 'border-red-500' : 'border-transparent'}
                            ${outside ? "text-gray-300 cursor-default" : ""}
                            ${!selectedTechnician ? "cursor-not-allowed opacity-50" : ""}
                            ${
                              isBlocked 
                                ? isSelected 
                                  ? "bg-red-600 text-white shadow-md"  // Blocked + Selected
                                  : "bg-red-100 text-red-700"          // Blocked + Not Selected (ALWAYS RED)
                                : isSelected
                                ? "bg-blue-600 text-white shadow-md"   // Not Blocked + Selected
                                : isToday && !outside
                                ? "bg-blue-100 text-blue-600 font-semibold"  // Today
                                : !outside
                                ? "text-gray-700 hover:bg-gray-100"    // Normal day
                                : ""
                            }
                          `}
                        >
                          {moment(date).date()}
                          {isBlocked && !isSelected && (
                            <FaBan className="absolute top-1 right-1 text-red-500 text-xs" />
                          )}
                          {multipleDay && isSelected && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Multiple Day Selection Actions */}
                  {multipleDay && selectedDates.length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Selected Days: {selectedDates.length}
                        </span>
                        <button
                          onClick={clearAllSelections}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleBulkBlockDays}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          <FaBan />
                          Block All Days
                        </button>
                        <button
                          onClick={handleBulkUnblockDays}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                        >
                          <FaCheckCircle />
                          Unblock All Days
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Single Day Selection Actions */}
                  {!multipleDay && selectedDate && (
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Selected Day: {moment(selectedDate).format('MMM D, YYYY')}
                        </span>
                        <button
                          onClick={() => setSelectedDate(null)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleBulkBlockDays}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          <FaBan />
                          Block This Day
                        </button>
                        <button
                          onClick={handleBulkUnblockDays}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                        >
                          <FaCheckCircle />
                          Unblock This Day
                        </button>
                      </div>
                    </div>
                  )}

                  {!selectedTechnician && (
                    <div className="text-sm text-orange-600 mt-2">
                      Please select a technician first
                    </div>
                  )}
                </div>

                {/* Time Selection Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Manage Time Slots {selectedDate && `- ${moment(selectedDate).format('MMM D, YYYY')}`}
                    </h3>
                    {selectedTimes.length > 0 && (
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {selectedTimes.length} selected
                      </span>
                    )}
                  </div>
                  
                  {selectedTechnician && selectedDate ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id="multipleTime"
                          checked={multipleTime}
                          onChange={(e) => {
                            setMultipleTime(e.target.checked);
                            if (!e.target.checked) {
                              setSelectedTimes([]);
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="multipleTime" className="text-sm text-gray-700">
                          Select multiple time slots
                        </label>
                      </div>

                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => setPeriod("AM")}
                          className={`flex-1 py-2 rounded-lg font-medium transition ${
                            period === "AM"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Morning (AM)
                        </button>
                        <button
                          onClick={() => setPeriod("PM")}
                          className={`flex-1 py-2 rounded-lg font-medium transition ${
                            period === "PM"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Afternoon (PM)
                        </button>
                      </div>

                      <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                        {loadingSlots ? (
                          <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                        ) : slots[period].length === 0 ? (
                          <p className="text-gray-500 text-center py-8">
                            No time slots available for selected period
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {slots[period].map((slot, index) => {
                              const fullTime = `${formatTime12h(slot.startTime)} - ${formatTime12h(slot.endTime)}`;
                              const isBlocked = !slot.isAvailable;
                              const isSelected = selectedTimes.includes(slot.timeSlotId);

                              return (
                                <button
                                  key={slot.timeSlotId}
                                  onClick={() => handleTimeSelect(slot.timeSlotId, isBlocked)}
                                  className={`
                                    w-full flex justify-between items-center border p-3 rounded-lg transition-all
                                    ${multipleTime
                                      ? isSelected
                                        ? 'bg-blue-100 border-blue-300'
                                        : 'bg-white hover:bg-gray-50'
                                      : ''
                                    }
                                    ${isBlocked ? 'border-red-200 bg-red-50' : 'border-gray-200'}
                                  `}
                                >
                                  <span className={`font-medium ${isBlocked ? 'text-red-700' : 'text-gray-700'}`}>
                                    {fullTime}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {multipleTime && isSelected && (
                                      <FaCheckCircle className="text-blue-600 text-sm" />
                                    )}
                                    {!multipleTime && (
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                      }`}>
                                        {isBlocked ? 'Blocked' : 'Available'}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {multipleTime && selectedTimes.length > 0 && (
                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Selected Time Slots: {selectedTimes.length}
                            </span>
                            <button
                              onClick={() => setSelectedTimes([])}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Clear all
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleBulkBlockTimesWithDays}
                              className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                            >
                              <FaBan />
                              Block Selected Times
                            </button>
                            <button
                              onClick={handleBulkUnblockTimesWithDays}
                              className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                            >
                              <FaCheckCircle />
                              Unblock Selected Times
                            </button>
                          </div>
                          <div className="mt-2 text-xs text-gray-600 text-center">
                            {multipleDay 
                              ? `Will apply to ${selectedDates.length} selected day(s)` 
                              : `Will apply to ${moment(selectedDate).format('MMM D, YYYY')}`
                            }
                          </div>
                        </div>
                      )}

                      {/* Time Legend */}
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Time Status:</h4>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>Blocked</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Available</span>
                          </div>
                          {multipleTime && (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-blue-500 rounded"></div>
                              <span>Selected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {!selectedTechnician 
                        ? "Please select a technician" 
                        : "Please select a date to view time slots"}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6 mt-6 border-t">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import moment from "moment";
// import { FaTrash, FaTimes, FaSearch, FaCalendarAlt, FaClock, FaBan, FaCheckCircle } from "react-icons/fa";

// const API_URL = "http://localhost:3001/api/slot-dates";
// const SLOT_API_BASE = "http://localhost:3001/api/slot-dates";
// const BOOKING_API_BASE = "http://localhost:3001/api/bookings";

// export default function ScheduleManagementPage() {
//   const [schedules, setSchedules] = useState([]);
//   const [search, setSearch] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalType, setModalType] = useState(""); // "day" or "technician"
//   const [loading, setLoading] = useState(false);

//   // Calendar states
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedDates, setSelectedDates] = useState([]);
//   const [multipleDay, setMultipleDay] = useState(false);

//   // Time slot states
//   const [period, setPeriod] = useState("AM");
//   const [selectedHour, setSelectedHour] = useState(null);
//   const [selectedTimes, setSelectedTimes] = useState([]);
//   const [multipleTime, setMultipleTime] = useState(false);

//   const [slots, setSlots] = useState({ AM: [], PM: [] });
//   const [loadingSlots, setLoadingSlots] = useState(false);
//   const [blockedDays, setBlockedDays] = useState([]);

//   // Technician states
//   const [technicians, setTechnicians] = useState([]);
//   const [selectedTechnician, setSelectedTechnician] = useState(null);

//   // Initialize data
//   useEffect(() => {
//     fetchSchedules();
//     loadTechnicians();
//   }, []);

//   // Load technicians
//   const loadTechnicians = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch("http://localhost:3001/api/technicians", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json();
//       if (Array.isArray(data)) setTechnicians(data);
//       else setTechnicians([]);
//     } catch (err) {
//       console.error("Error loading technicians:", err);
//       setTechnicians([]);
//     }
//   };

//   // Fetch technician availability when technician or date changes
//   useEffect(() => {
//     if (selectedTechnician && selectedDate && modalType === "technician") {
//       fetchTechnicianAvailability(selectedTechnician.technicianId, selectedDate);
//     }
//   }, [selectedTechnician, selectedDate, modalType]);

//   // Data fetching functions
//   const fetchSchedules = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(API_URL);
//       setSchedules(res.data);
//     } catch (err) {
//       console.error("Error fetching schedules:", err);
//       alert("Failed to load schedules");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchSlots = async (date) => {
//     if (!date) return;
    
//     setLoadingSlots(true);
//     const formattedDate = moment(date).format("YYYY-MM-DD");
    
//     try {
//       const response = await fetch(`${SLOT_API_BASE}/slots/${formattedDate}`);
//       if (!response.ok) throw new Error("Failed to fetch slots");
      
//       const data = await response.json();
//       const AM = data.filter(slot => parseInt(slot.startTime.split(":")[0]) < 12);
//       const PM = data.filter(slot => parseInt(slot.startTime.split(":")[0]) >= 12);

//       setSlots({ AM, PM });
//       setSelectedHour(null);
//       setSelectedTimes([]);

//       // Check if the entire day is blocked
//       const dayStatusResponse = await axios.get(`${SLOT_API_BASE}/date/${formattedDate}`).catch(() => null);
//       if (dayStatusResponse?.data) {
//         setBlockedDays(prev => {
//           const filtered = prev.filter(d => !moment(d).isSame(date, 'day'));
//           return dayStatusResponse.data.isOpen === false 
//             ? [...filtered, date] 
//             : filtered;
//         });
//       }
//     } catch (err) {
//       console.error("Error fetching slots:", err);
//       setSlots({ AM: [], PM: [] });
//     } finally {
//       setLoadingSlots(false);
//     }
//   };

//   const fetchTechnicianAvailability = async (technicianId, date) => {
//     if (!date || !technicianId) return;
    
//     setLoadingSlots(true);
//     const formattedDate = moment(date).format("YYYY-MM-DD");
    
//     try {
//       const response = await axios.get(`${BOOKING_API_BASE}/availability/by-technician`, {
//         params: { technicianId, date: formattedDate }
//       });

//       // Convert availability data to time slots format
//       const availabilityData = response.data;
      
//       // Group by AM/PM
//       const AM = availabilityData.filter(slot => {
//         const hour = parseInt(slot.startTime.split(":")[0]);
//         return hour < 12;
//       }).map(slot => ({
//         ...slot,
//         isAvailable: slot.isAvailable,
//         timeSlotId: slot.timeSlotId,
//         startTime: slot.startTime,
//         endTime: slot.endTime
//       }));

//       const PM = availabilityData.filter(slot => {
//         const hour = parseInt(slot.startTime.split(":")[0]);
//         return hour >= 12;
//       }).map(slot => ({
//         ...slot,
//         isAvailable: slot.isAvailable,
//         timeSlotId: slot.timeSlotId,
//         startTime: slot.startTime,
//         endTime: slot.endTime
//       }));

//       setSlots({ AM, PM });
//       setSelectedHour(null);
//       setSelectedTimes([]);

//     } catch (err) {
//       console.error("Error fetching technician availability:", err);
//       setSlots({ AM: [], PM: [] });
//     } finally {
//       setLoadingSlots(false);
//     }
//   };

//   // Modal management
//   const openModal = (type) => {
//     setModalType(type);
//     setIsModalOpen(true);
//     resetSelection();
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setModalType("");
//     resetSelection();
//   };

//   const resetSelection = () => {
//     setSelectedDate(null);
//     setSelectedDates([]);
//     setSelectedHour(null);
//     setSelectedTimes([]);
//     setSlots({ AM: [], PM: [] });
//     setMultipleDay(false);
//     setMultipleTime(false);
//     setBlockedDays([]);
//     setSelectedTechnician(null);
//   };

//   // Schedule operations
//   const deleteSchedule = async (schedule) => {
//     if (!confirm("Are you sure you want to delete this schedule?")) return;
    
//     try {
//       await axios.delete(`${API_URL}/${schedule.id}`);
//       fetchSchedules();
//     } catch (err) {
//       console.error("Error deleting schedule:", err);
//       alert("Failed to delete schedule");
//     }
//   };

//   // Block/Unblock operations for general schedule
//   const handleDayOperation = async (isBlock) => {
//     try {
//       const targetDates = multipleDay ? selectedDates : [selectedDate];
//       if (!targetDates.length) {
//         alert("Please select at least one date.");
//         return;
//       }

//       for (const date of targetDates) {
//         const formatted = moment(date).format("YYYY-MM-DD");
//         const slotRes = await axios.get(`${SLOT_API_BASE}/date/${formatted}`).catch(() => null);

//         if (slotRes?.data?.slotDateId) {
//           await axios.patch(`${SLOT_API_BASE}/cascade/${slotRes.data.slotDateId}`, { isOpen: !isBlock });
//         } else {
//           await axios.post(SLOT_API_BASE, { slotDate: formatted, isOpen: !isBlock });
//         }

//         // Update blocked days state
//         setBlockedDays(prev => {
//           const filtered = prev.filter(d => !moment(d).isSame(date, 'day'));
//           return isBlock ? [...filtered, date] : filtered;
//         });
//       }

//       alert(`Day(s) successfully ${isBlock ? 'blocked' : 'unblocked'}.`);
//       if (selectedDate) fetchSlots(selectedDate);
//     } catch (err) {
//       console.error(err);
//       alert(`Failed to ${isBlock ? 'block' : 'unblock'} day(s).`);
//     }
//   };

//   const handleTimeOperation = async (isBlock) => {
//     try {
//       if (!selectedDate) {
//         alert("Select a date first.");
//         return;
//       }

//       const times = multipleTime ? selectedTimes : [selectedHour];
//       if (!times.length) {
//         alert("Please select at least one time.");
//         return;
//       }

//       const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
      
//       // Find or create slot date
//       let slotRes = await axios.get(`${SLOT_API_BASE}/date/${formattedDate}`).catch(() => null);
//       if (!slotRes?.data?.slotDateId) {
//         const createRes = await axios.post(SLOT_API_BASE, { slotDate: formattedDate, isOpen: true });
//         slotRes = { data: { slotDateId: createRes.data.slotDateId } };
//       }

//       const slotDateId = slotRes.data.slotDateId;
//       const response = await axios.get(`${SLOT_API_BASE}/${slotDateId}/time-slots`);
//       const timeSlots = response.data;

//       for (const time of times) {
//         const [start] = time.split(" - ");
//         const slot = timeSlots.find(t => 
//           formatTime12h(t.startTime) === start.trim()
//         );
        
//         if (slot) {
//           await axios.patch(`${SLOT_API_BASE}/time-slot/${slot.timeSlotId}`, { 
//             isAvailable: !isBlock 
//           });
//         }
//       }

//       alert(`Time slot(s) successfully ${isBlock ? 'blocked' : 'unblocked'}.`);
//       fetchSlots(selectedDate);
//     } catch (err) {
//       console.error(err);
//       alert(`Failed to ${isBlock ? 'block' : 'unblock'} time(s).`);
//     }
//   };

//   // Technician operations
//   const handleBlockTechnician = async (technicianId, timeSlotId) => {
//     try {
//       await axios.post(`${BOOKING_API_BASE}/technicians/block`, {
//         technicianId,
//         timeSlotId,
//       });
//       alert("Technician blocked successfully!");
//       // Refresh availability
//       if (selectedDate) {
//         fetchTechnicianAvailability(technicianId, selectedDate);
//       }
//     } catch (err) {
//       console.error("Error blocking technician:", err);
//       alert("Failed to block technician");
//     }
//   };

//   const handleUnblockTechnician = async (technicianId, timeSlotId) => {
//     try {
//       await axios.post(`${BOOKING_API_BASE}/technicians/unblock`, {
//         technicianId,
//         timeSlotId,
//       });
//       alert("Technician unblocked successfully!");
//       // Refresh availability
//       if (selectedDate) {
//         fetchTechnicianAvailability(technicianId, selectedDate);
//       }
//     } catch (err) {
//       console.error("Error unblocking technician:", err);
//       alert("Failed to unblock technician");
//     }
//   };

//   // Bulk operations for technicians
//   const handleBulkBlockTimesWithDays = async () => {
//     if (!selectedTechnician || selectedTimes.length === 0) {
//       alert("Please select a technician and at least one time slot");
//       return;
//     }

//     const daysToBlock = multipleDay ? selectedDates : (selectedDate ? [selectedDate] : []);
    
//     if (daysToBlock.length === 0) {
//       alert("Please select at least one day");
//       return;
//     }

//     try {
//       let totalBlocked = 0;
      
//       for (const date of daysToBlock) {
//         const formattedDate = moment(date).format("YYYY-MM-DD");
        
//         for (const timeSlotId of selectedTimes) {
//           await axios.post(`${BOOKING_API_BASE}/technicians/block`, {
//             technicianId: selectedTechnician.technicianId,
//             timeSlotId,
//           });
//           totalBlocked++;
//         }
//       }
      
//       alert(`Successfully blocked ${totalBlocked} time slot(s) across ${daysToBlock.length} day(s)!`);
//       setSelectedTimes([]);
      
//       if (selectedDate) {
//         fetchTechnicianAvailability(selectedTechnician.technicianId, selectedDate);
//       }
//     } catch (err) {
//       console.error("Error bulk blocking time slots with days:", err);
//       alert("Failed to block time slots");
//     }
//   };

//   const handleBulkUnblockTimesWithDays = async () => {
//     if (!selectedTechnician || selectedTimes.length === 0) {
//       alert("Please select a technician and at least one time slot");
//       return;
//     }

//     const daysToUnblock = multipleDay ? selectedDates : (selectedDate ? [selectedDate] : []);
    
//     if (daysToUnblock.length === 0) {
//       alert("Please select at least one day");
//       return;
//     }

//     try {
//       let totalUnblocked = 0;
      
//       for (const date of daysToUnblock) {
//         const formattedDate = moment(date).format("YYYY-MM-DD");
        
//         for (const timeSlotId of selectedTimes) {
//           await axios.post(`${BOOKING_API_BASE}/technicians/unblock`, {
//             technicianId: selectedTechnician.technicianId,
//             timeSlotId,
//           });
//           totalUnblocked++;
//         }
//       }
      
//       alert(`Successfully unblocked ${totalUnblocked} time slot(s) across ${daysToUnblock.length} day(s)!`);
//       setSelectedTimes([]);
      
//       if (selectedDate) {
//         fetchTechnicianAvailability(selectedTechnician.technicianId, selectedDate);
//       }
//     } catch (err) {
//       console.error("Error bulk unblocking time slots with days:", err);
//       alert("Failed to unblock time slots");
//     }
//   };

//   const handleBulkBlockDays = async () => {
//     const daysToBlock = multipleDay ? selectedDates : (selectedDate ? [selectedDate] : []);
    
//     if (!selectedTechnician || daysToBlock.length === 0) {
//       alert("Please select a technician and at least one day");
//       return;
//     }

//     try {
//       for (const date of daysToBlock) {
//         const formattedDate = moment(date).format("YYYY-MM-DD");
        
//         const availabilityResponse = await axios.get(`${BOOKING_API_BASE}/availability/by-technician`, {
//           params: { 
//             technicianId: selectedTechnician.technicianId, 
//             date: formattedDate 
//           }
//         });

//         for (const slot of availabilityResponse.data) {
//           await axios.post(`${BOOKING_API_BASE}/technicians/block`, {
//             technicianId: selectedTechnician.technicianId,
//             timeSlotId: slot.timeSlotId,
//           });
//         }
//       }
      
//       const dayCount = daysToBlock.length;
//       alert(`Successfully blocked all time slots for ${dayCount} day(s)!`);
      
//       if (multipleDay) {
//         setSelectedDates([]);
//       } else {
//         setSelectedDate(null);
//       }
      
//       if (selectedDate) {
//         fetchTechnicianAvailability(selectedTechnician.technicianId, selectedDate);
//       }
//     } catch (err) {
//       console.error("Error bulk blocking days:", err);
//       alert("Failed to block days");
//     }
//   };

//   const handleBulkUnblockDays = async () => {
//     const daysToUnblock = multipleDay ? selectedDates : (selectedDate ? [selectedDate] : []);
    
//     if (!selectedTechnician || daysToUnblock.length === 0) {
//       alert("Please select a technician and at least one day");
//       return;
//     }

//     try {
//       for (const date of daysToUnblock) {
//         const formattedDate = moment(date).format("YYYY-MM-DD");
        
//         const availabilityResponse = await axios.get(`${BOOKING_API_BASE}/availability/by-technician`, {
//           params: { 
//             technicianId: selectedTechnician.technicianId, 
//             date: formattedDate 
//           }
//         });

//         for (const slot of availabilityResponse.data) {
//           await axios.post(`${BOOKING_API_BASE}/technicians/unblock`, {
//             technicianId: selectedTechnician.technicianId,
//             timeSlotId: slot.timeSlotId,
//           });
//         }
//       }
      
//       const dayCount = daysToUnblock.length;
//       alert(`Successfully unblocked all time slots for ${dayCount} day(s)!`);
      
//       if (multipleDay) {
//         setSelectedDates([]);
//       } else {
//         setSelectedDate(null);
//       }
      
//       if (selectedDate) {
//         fetchTechnicianAvailability(selectedTechnician.technicianId, selectedDate);
//       }
//     } catch (err) {
//       console.error("Error bulk unblocking days:", err);
//       alert("Failed to unblock days");
//     }
//   };

//   // Calendar helpers
//   const getDaysInMonth = () => {
//     const start = moment(currentDate).startOf("month");
//     const end = moment(currentDate).endOf("month");
//     const days = [];

//     // Previous month days
//     const startDay = start.day();
//     for (let i = 0; i < startDay; i++) {
//       days.push({
//         date: start.clone().subtract(startDay - i, "days").toDate(),
//         outside: true,
//       });
//     }

//     // Current month days
//     for (let i = 1; i <= end.date(); i++) {
//       days.push({ date: moment(currentDate).date(i).toDate(), outside: false });
//     }

//     // Next month days
//     while (days.length < 42) {
//       days.push({ date: end.add(1, "day").toDate(), outside: true });
//     }

//     return days;
//   };

//   const navigateMonth = (direction) => {
//     const newDate = moment(currentDate)
//       .add(direction === "next" ? 1 : -1, "month")
//       .toDate();
//     setCurrentDate(newDate);
//   };

//   const formatTime12h = (time) => {
//     const [hour, minute] = time.split(":").map(Number);
//     const h = hour % 12 === 0 ? 12 : hour % 12;
//     const period = hour >= 12 ? "PM" : "AM";
//     return `${h}:${minute.toString().padStart(2, "0")} ${period}`;
//   };

//   // Check if a day is blocked
//   const isDayBlocked = (date) => {
//     return blockedDays.some(blockedDate => moment(blockedDate).isSame(date, 'day'));
//   };

//   // Selection handlers
//   const handleDateSelect = (date) => {
//     if (multipleDay) {
//       setSelectedDates(prev => {
//         const exists = prev.some(d => moment(d).isSame(date, "day"));
//         return exists
//           ? prev.filter(d => !moment(d).isSame(date, "day"))
//           : [...prev, date];
//       });
//     } else {
//       setSelectedDate(date);
//       setSelectedDates([]);
//     }
    
//     if (modalType === "day") {
//       fetchSlots(date);
//     } else if (modalType === "technician" && selectedTechnician) {
//       fetchTechnicianAvailability(selectedTechnician.technicianId, date);
//     }
//   };

//   const handleTimeSelect = (time, isBlocked) => {
//     if (modalType === "day") {
//       if (multipleTime) {
//         setSelectedTimes(prev =>
//           prev.includes(time)
//             ? prev.filter(t => t !== time)
//             : [...prev, time]
//         );
//       } else {
//         setSelectedHour(time);
//       }
//     } else if (modalType === "technician") {
//       if (multipleTime) {
//         setSelectedTimes(prev =>
//           prev.includes(time)
//             ? prev.filter(t => t !== time)
//             : [...prev, time]
//         );
//       } else {
//         // For single selection, just block/unblock immediately for the current date
//         if (selectedTechnician && selectedDate) {
//           if (isBlocked) {
//             handleUnblockTechnician(selectedTechnician.technicianId, time);
//           } else {
//             handleBlockTechnician(selectedTechnician.technicianId, time);
//           }
//         }
//       }
//     }
//   };

//   // Clear all selections
//   const clearAllSelections = () => {
//     setSelectedDates([]);
//     setSelectedTimes([]);
//   };

//   // Filter schedules
//   const filteredSchedules = schedules.filter(schedule =>
//     schedule.reason?.toLowerCase().includes(search.toLowerCase())
//   );

//   // Calendar data
//   const days = getDaysInMonth();
//   const monthYear = moment(currentDate).format("MMMM YYYY");
//   const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Schedule Management</h1>
//           <p className="text-gray-600 mt-1">Manage blocked schedules and availability</p>
//         </div>

//         <div className="flex flex-wrap gap-3">
//           <button
//             onClick={() => openModal("day")}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
//           >
//             <FaCalendarAlt className="text-sm" />
//             Update Schedule
//           </button>
//           <button
//             onClick={() => openModal("technician")}
//             className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
//           >
//             <FaClock className="text-sm" />
//             Update Technician Schedule
//           </button>
//         </div>
//       </div>

//       {/* Search */}
//       <div className="bg-white rounded-xl border p-4 mb-6 shadow-sm">
//         <div className="relative">
//           <FaSearch className="absolute left-3 top-3 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by reason..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
//           />
//         </div>
//       </div>

//       {/* Schedule Table */}
//       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center items-center py-12">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           </div>
//         ) : (
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Date
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Start Time
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   End Time
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Reason
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredSchedules.length > 0 ? (
//                 filteredSchedules.map((schedule) => (
//                   <tr key={schedule.id} className="hover:bg-gray-50 transition">
//                     <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
//                       {schedule.date}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-gray-600">
//                       {schedule.startTime}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-gray-600">
//                       {schedule.endTime}
//                     </td>
//                     <td className="px-6 py-4 text-gray-600">
//                       {schedule.reason || "No reason provided"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                         <FaBan className="mr-1" />
//                         Blocked
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <button
//                         onClick={() => deleteSchedule(schedule)}
//                         className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
//                       >
//                         <FaTrash className="text-xs" />
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
//                     No schedules found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Schedule Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl">
//             <div className="flex justify-between items-center mb-6 pb-4 border-b">
//               <h2 className="text-2xl font-bold text-gray-800">
//                 {modalType === "day" ? "Update Schedule Availability" : "Manage Technician Schedule"}
//               </h2>
//               <button
//                 onClick={closeModal}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition"
//               >
//                 <FaTimes className="text-gray-500" />
//               </button>
//             </div>

//             {modalType === "day" && (
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Calendar Section */}
//                 <div className="space-y-4">
//                   <h3 className="text-lg font-semibold text-gray-700">Select Date(s)</h3>
                  
//                   <div className="flex items-center justify-between mb-4">
//                     <button
//                       onClick={() => navigateMonth("prev")}
//                       className="p-2 rounded-lg hover:bg-gray-100 transition"
//                     >
//                       &lt;
//                     </button>
//                     <span className="text-lg font-semibold text-gray-800">
//                       {monthYear}
//                     </span>
//                     <button
//                       onClick={() => navigateMonth("next")}
//                       className="p-2 rounded-lg hover:bg-gray-100 transition"
//                     >
//                       &gt;
//                     </button>
//                   </div>

//                   <div className="grid grid-cols-7 gap-1 mb-2">
//                     {weekDays.map((day) => (
//                       <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
//                         {day}
//                       </div>
//                     ))}
//                   </div>

//                   <div className="grid grid-cols-7 gap-1">
//                     {days.map(({ date, outside }, index) => {
//                       const isToday = moment(date).isSame(new Date(), "day");
//                       const isSelected = multipleDay
//                         ? selectedDates.some(d => moment(d).isSame(date, "day"))
//                         : selectedDate && moment(date).isSame(selectedDate, "day");
//                       const isBlocked = isDayBlocked(date);

//                       return (
//                         <button
//                           key={index}
//                           onClick={() => !outside && handleDateSelect(date)}
//                           disabled={outside}
//                           className={`
//                             aspect-square rounded-lg text-sm font-medium transition-all relative
//                             ${outside ? "text-gray-300 cursor-default" : ""}
//                             ${isBlocked ? 'bg-red-100 border border-red-300 text-red-700' : ''}
//                             ${isSelected
//                               ? isBlocked 
//                                 ? "bg-red-600 text-white shadow-md"
//                                 : "bg-blue-600 text-white shadow-md"
//                               : isToday && !outside
//                               ? "bg-blue-100 text-blue-600 font-semibold"
//                               : !outside
//                               ? "text-gray-700 hover:bg-gray-100"
//                               : ""
//                             }
//                           `}
//                         >
//                           {moment(date).date()}
//                           {isBlocked && !isSelected && (
//                             <FaBan className="absolute top-1 right-1 text-red-500 text-xs" />
//                           )}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <div className="flex items-center gap-2 pt-4">
//                     <input
//                       type="checkbox"
//                       id="multipleDay"
//                       checked={multipleDay}
//                       onChange={(e) => setMultipleDay(e.target.checked)}
//                       className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                     />
//                     <label htmlFor="multipleDay" className="text-sm text-gray-700">
//                       Select multiple days
//                     </label>
//                   </div>

//                   {/* Legend */}
//                   <div className="pt-4 border-t">
//                     <h4 className="text-sm font-medium text-gray-700 mb-2">Legend:</h4>
//                     <div className="flex flex-wrap gap-4 text-xs">
//                       <div className="flex items-center gap-1">
//                         <div className="w-3 h-3 bg-blue-600 rounded"></div>
//                         <span>Selected</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
//                         <span>Blocked Day</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <div className="w-3 h-3 bg-blue-100 rounded"></div>
//                         <span>Today</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Time Selection Section */}
//                 <div className="space-y-4">
//                   <h3 className="text-lg font-semibold text-gray-700">Select Time(s)</h3>
                  
//                   <div className="flex gap-2 mb-4">
//                     <button
//                       onClick={() => setPeriod("AM")}
//                       className={`flex-1 py-2 rounded-lg font-medium transition ${
//                         period === "AM"
//                           ? "bg-blue-600 text-white"
//                           : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                       }`}
//                     >
//                       Morning (AM)
//                     </button>
//                     <button
//                       onClick={() => setPeriod("PM")}
//                       className={`flex-1 py-2 rounded-lg font-medium transition ${
//                         period === "PM"
//                           ? "bg-blue-600 text-white"
//                           : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                       }`}
//                     >
//                       Afternoon (PM)
//                     </button>
//                   </div>

//                   <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
//                     {loadingSlots ? (
//                       <div className="flex justify-center items-center py-8">
//                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//                       </div>
//                     ) : slots[period].length === 0 ? (
//                       <p className="text-gray-500 text-center py-8">
//                         No time slots available for selected period
//                       </p>
//                     ) : (
//                       <div className="grid grid-cols-2 gap-2">
//                         {slots[period].map((slot, index) => {
//                           const fullTime = `${formatTime12h(slot.startTime)} - ${formatTime12h(slot.endTime)}`;
//                           const isSelected = multipleTime
//                             ? selectedTimes.includes(fullTime)
//                             : selectedHour === fullTime;
//                           const isBlocked = !slot.isAvailable;

//                           return (
//                             <button
//                               key={index}
//                               onClick={() => handleTimeSelect(fullTime, isBlocked)}
//                               className={`
//                                 p-3 rounded-lg text-sm font-medium transition-all relative
//                                 ${isBlocked 
//                                   ? isSelected
//                                     ? 'bg-red-600 text-white shadow-md'
//                                     : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
//                                   : isSelected
//                                     ? 'bg-blue-600 text-white shadow'
//                                     : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border'
//                                 }
//                               `}
//                             >
//                               {fullTime}
//                               {isBlocked && !isSelected && (
//                                 <FaBan className="absolute top-2 right-2 text-red-500 text-xs" />
//                               )}
//                               {!isBlocked && isSelected && (
//                                 <FaCheckCircle className="absolute top-2 right-2 text-white text-xs" />
//                               )}
//                             </button>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex items-center gap-2 pt-2">
//                     <input
//                       type="checkbox"
//                       id="multipleTime"
//                       checked={multipleTime}
//                       onChange={(e) => setMultipleTime(e.target.checked)}
//                       className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                     />
//                     <label htmlFor="multipleTime" className="text-sm text-gray-700">
//                       Select multiple time slots
//                     </label>
//                   </div>

//                   {/* Time Legend */}
//                   <div className="pt-4 border-t">
//                     <h4 className="text-sm font-medium text-gray-700 mb-2">Time Status:</h4>
//                     <div className="flex flex-wrap gap-4 text-xs">
//                       <div className="flex items-center gap-1">
//                         <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
//                         <span>Blocked Time</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <div className="w-3 h-3 bg-gray-50 border rounded"></div>
//                         <span>Available Time</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="grid grid-cols-2 gap-3 pt-6">
//                     <button
//                       onClick={() => handleDayOperation(true)}
//                       disabled={multipleDay ? !selectedDates.length : !selectedDate}
//                       className="flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
//                     >
//                       <FaBan />
//                       Block Day
//                     </button>
                    
//                     <button
//                       onClick={() => handleDayOperation(false)}
//                       disabled={multipleDay ? !selectedDates.length : !selectedDate}
//                       className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
//                     >
//                       <FaCheckCircle />
//                       Unblock Day
//                     </button>
                    
//                     <button
//                       onClick={() => handleTimeOperation(true)}
//                       disabled={multipleTime ? !selectedTimes.length : !selectedHour}
//                       className="flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
//                     >
//                       <FaBan />
//                       Block Time
//                     </button>
                    
//                     <button
//                       onClick={() => handleTimeOperation(false)}
//                       disabled={multipleTime ? !selectedTimes.length : !selectedHour}
//                       className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
//                     >
//                       <FaCheckCircle />
//                       Unblock Time
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {modalType === "technician" && (
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 {/* Technician Selection */}
//                 <div className="space-y-4">
//                   <h3 className="text-lg font-semibold text-gray-700">Select Technician</h3>
//                   <div className="border rounded-lg p-4 max-h-80 overflow-y-auto">
//                     {technicians.length > 0 ? (
//                       technicians.map((tech) => (
//                         <button
//                           key={tech.technicianId}
//                           onClick={() => {
//                             setSelectedTechnician(
//                               selectedTechnician?.technicianId === tech.technicianId ? null : tech
//                             );
//                             // Clear previous selections when changing technician
//                             setSelectedDate(null);
//                             setSelectedDates([]);
//                             setSelectedTimes([]);
//                             setSlots({ AM: [], PM: [] });
//                           }}
//                           className={`
//                             w-full text-left px-4 py-2 mb-2 rounded-lg font-medium transition
//                             ${
//                               selectedTechnician?.technicianId === tech.technicianId
//                                 ? "bg-blue-600 text-white shadow-md"
//                                 : "bg-gray-100 hover:bg-gray-200 text-gray-700"
//                             }
//                           `}
//                         >
//                           {tech.firstName} {tech.lastName}
//                         </button>
//                       ))
//                     ) : (
//                       <p className="text-gray-500 text-sm italic">No technicians available.</p>
//                     )}
//                   </div>

//                   {selectedTechnician && (
//                     <div className="mt-2 text-sm text-green-700 font-medium flex items-center gap-2">
//                       <FaCheckCircle className="text-green-500" />
//                       Selected: {selectedTechnician.firstName} {selectedTechnician.lastName}
//                     </div>
//                   )}
//                 </div>

//                 {/* Calendar Section */}
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <h3 className="text-lg font-semibold text-gray-700">Select Date(s)</h3>
//                     {selectedDates.length > 0 && (
//                       <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                         {selectedDates.length} selected
//                       </span>
//                     )}
//                   </div>
                  
//                   <div className="flex items-center gap-2 mb-2">
//                     <input
//                       type="checkbox"
//                       id="multipleDay"
//                       checked={multipleDay}
//                       onChange={(e) => {
//                         setMultipleDay(e.target.checked);
//                         if (!e.target.checked) {
//                           setSelectedDates([]);
//                         }
//                       }}
//                       className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                     />
//                     <label htmlFor="multipleDay" className="text-sm text-gray-700">
//                       Select multiple days
//                     </label>
//                   </div>

//                   <div className="flex items-center justify-between mb-4">
//                     <button
//                       onClick={() => navigateMonth("prev")}
//                       className="p-2 rounded-lg hover:bg-gray-100 transition"
//                     >
//                       &lt;
//                     </button>
//                     <span className="text-lg font-semibold text-gray-800">
//                       {monthYear}
//                     </span>
//                     <button
//                       onClick={() => navigateMonth("next")}
//                       className="p-2 rounded-lg hover:bg-gray-100 transition"
//                     >
//                       &gt;
//                     </button>
//                   </div>

//                   <div className="grid grid-cols-7 gap-1 mb-2">
//                     {weekDays.map((day) => (
//                       <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
//                         {day}
//                       </div>
//                     ))}
//                   </div>

//                   <div className="grid grid-cols-7 gap-1">
//                     {days.map(({ date, outside }, index) => {
//                       const isToday = moment(date).isSame(new Date(), "day");
//                       const isSelected = multipleDay
//                         ? selectedDates.some(d => moment(d).isSame(date, "day"))
//                         : selectedDate && moment(date).isSame(selectedDate, "day");

//                       return (
//                         <button
//                           key={index}
//                           onClick={() => !outside && handleDateSelect(date)}
//                           disabled={outside || !selectedTechnician}
//                           className={`
//                             aspect-square rounded-lg text-sm font-medium transition-all relative
//                             ${outside ? "text-gray-300 cursor-default" : ""}
//                             ${!selectedTechnician ? "cursor-not-allowed opacity-50" : ""}
//                             ${isSelected
//                               ? "bg-blue-600 text-white shadow-md"
//                               : isToday && !outside
//                               ? "bg-blue-100 text-blue-600 font-semibold"
//                               : !outside
//                               ? "text-gray-700 hover:bg-gray-100"
//                               : ""
//                             }
//                           `}
//                         >
//                           {moment(date).date()}
//                           {multipleDay && isSelected && (
//                             <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
//                           )}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   {/* Multiple Day Selection Actions */}
//                   {multipleDay && selectedDates.length > 0 && (
//                     <div className="pt-4 border-t">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="text-sm font-medium text-gray-700">
//                           Selected Days: {selectedDates.length}
//                         </span>
//                         <button
//                           onClick={clearAllSelections}
//                           className="text-xs text-red-600 hover:text-red-800"
//                         >
//                           Clear all
//                         </button>
//                       </div>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={handleBulkBlockDays}
//                           className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
//                         >
//                           <FaBan />
//                           Block All Days
//                         </button>
//                         <button
//                           onClick={handleBulkUnblockDays}
//                           className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
//                         >
//                           <FaCheckCircle />
//                           Unblock All Days
//                         </button>
//                       </div>
//                     </div>
//                   )}

//                   {/* Single Day Selection Actions */}
//                   {!multipleDay && selectedDate && (
//                     <div className="pt-4 border-t">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="text-sm font-medium text-gray-700">
//                           Selected Day: {moment(selectedDate).format('MMM D, YYYY')}
//                         </span>
//                         <button
//                           onClick={() => setSelectedDate(null)}
//                           className="text-xs text-red-600 hover:text-red-800"
//                         >
//                           Clear
//                         </button>
//                       </div>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={handleBulkBlockDays}
//                           className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
//                         >
//                           <FaBan />
//                           Block This Day
//                         </button>
//                         <button
//                           onClick={handleBulkUnblockDays}
//                           className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
//                         >
//                           <FaCheckCircle />
//                           Unblock This Day
//                         </button>
//                       </div>
//                     </div>
//                   )}

//                   {!selectedTechnician && (
//                     <div className="text-sm text-orange-600 mt-2">
//                       Please select a technician first
//                     </div>
//                   )}
//                 </div>

//                 {/* Time Selection Section */}
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <h3 className="text-lg font-semibold text-gray-700">
//                       Manage Time Slots {selectedDate && `- ${moment(selectedDate).format('MMM D, YYYY')}`}
//                     </h3>
//                     {selectedTimes.length > 0 && (
//                       <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                         {selectedTimes.length} selected
//                       </span>
//                     )}
//                   </div>
                  
//                   {selectedTechnician && selectedDate ? (
//                     <>
//                       <div className="flex items-center gap-2 mb-2">
//                         <input
//                           type="checkbox"
//                           id="multipleTime"
//                           checked={multipleTime}
//                           onChange={(e) => {
//                             setMultipleTime(e.target.checked);
//                             if (!e.target.checked) {
//                               setSelectedTimes([]);
//                             }
//                           }}
//                           className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                         />
//                         <label htmlFor="multipleTime" className="text-sm text-gray-700">
//                           Select multiple time slots
//                         </label>
//                       </div>

//                       <div className="flex gap-2 mb-4">
//                         <button
//                           onClick={() => setPeriod("AM")}
//                           className={`flex-1 py-2 rounded-lg font-medium transition ${
//                             period === "AM"
//                               ? "bg-blue-600 text-white"
//                               : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                           }`}
//                         >
//                           Morning (AM)
//                         </button>
//                         <button
//                           onClick={() => setPeriod("PM")}
//                           className={`flex-1 py-2 rounded-lg font-medium transition ${
//                             period === "PM"
//                               ? "bg-blue-600 text-white"
//                               : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                           }`}
//                         >
//                           Afternoon (PM)
//                         </button>
//                       </div>

//                       <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
//                         {loadingSlots ? (
//                           <div className="flex justify-center items-center py-8">
//                             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//                           </div>
//                         ) : slots[period].length === 0 ? (
//                           <p className="text-gray-500 text-center py-8">
//                             No time slots available for selected period
//                           </p>
//                         ) : (
//                           <div className="space-y-2">
//                             {slots[period].map((slot, index) => {
//                               const fullTime = `${formatTime12h(slot.startTime)} - ${formatTime12h(slot.endTime)}`;
//                               const isBlocked = !slot.isAvailable;
//                               const isSelected = selectedTimes.includes(slot.timeSlotId);

//                               return (
//                                 <button
//                                   key={slot.timeSlotId}
//                                   onClick={() => handleTimeSelect(slot.timeSlotId, isBlocked)}
//                                   className={`
//                                     w-full flex justify-between items-center border p-3 rounded-lg transition-all
//                                     ${multipleTime
//                                       ? isSelected
//                                         ? 'bg-blue-100 border-blue-300'
//                                         : 'bg-white hover:bg-gray-50'
//                                       : ''
//                                     }
//                                     ${isBlocked ? 'border-red-200 bg-red-50' : 'border-gray-200'}
//                                   `}
//                                 >
//                                   <span className={`font-medium ${isBlocked ? 'text-red-700' : 'text-gray-700'}`}>
//                                     {fullTime}
//                                   </span>
//                                   <div className="flex items-center gap-2">
//                                     {multipleTime && isSelected && (
//                                       <FaCheckCircle className="text-blue-600 text-sm" />
//                                     )}
//                                     {!multipleTime && (
//                                       <span className={`text-xs px-2 py-1 rounded ${
//                                         isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
//                                       }`}>
//                                         {isBlocked ? 'Blocked' : 'Available'}
//                                       </span>
//                                     )}
//                                   </div>
//                                 </button>
//                               );
//                             })}
//                           </div>
//                         )}
//                       </div>

//                       {multipleTime && selectedTimes.length > 0 && (
//                         <div className="pt-4 border-t">
//                           <div className="flex justify-between items-center mb-2">
//                             <span className="text-sm font-medium text-gray-700">
//                               Selected Time Slots: {selectedTimes.length}
//                             </span>
//                             <button
//                               onClick={() => setSelectedTimes([])}
//                               className="text-xs text-red-600 hover:text-red-800"
//                             >
//                               Clear all
//                             </button>
//                           </div>
//                           <div className="flex gap-2">
//                             <button
//                               onClick={handleBulkBlockTimesWithDays}
//                               className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
//                             >
//                               <FaBan />
//                               Block Selected Times
//                             </button>
//                             <button
//                               onClick={handleBulkUnblockTimesWithDays}
//                               className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
//                             >
//                               <FaCheckCircle />
//                               Unblock Selected Times
//                             </button>
//                           </div>
//                           <div className="mt-2 text-xs text-gray-600 text-center">
//                             {multipleDay 
//                               ? `Will apply to ${selectedDates.length} selected day(s)` 
//                               : `Will apply to ${moment(selectedDate).format('MMM D, YYYY')}`
//                             }
//                           </div>
//                         </div>
//                       )}

//                       {/* Time Legend */}
//                       <div className="pt-4 border-t">
//                         <h4 className="text-sm font-medium text-gray-700 mb-2">Time Status:</h4>
//                         <div className="flex flex-wrap gap-4 text-xs">
//                           <div className="flex items-center gap-1">
//                             <div className="w-3 h-3 bg-red-500 rounded"></div>
//                             <span>Blocked</span>
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <div className="w-3 h-3 bg-green-500 rounded"></div>
//                             <span>Available</span>
//                           </div>
//                           {multipleTime && (
//                             <div className="flex items-center gap-1">
//                               <div className="w-3 h-3 bg-blue-500 rounded"></div>
//                               <span>Selected</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </>
//                   ) : (
//                     <div className="text-center py-8 text-gray-500">
//                       {!selectedTechnician 
//                         ? "Please select a technician" 
//                         : "Please select a date to view time slots"}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             <div className="flex justify-end pt-6 mt-6 border-t">
//               <button
//                 onClick={closeModal}
//                 className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }