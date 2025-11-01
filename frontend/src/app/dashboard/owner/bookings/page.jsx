"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaSearch, 
  FaUsers, 
  FaCalendarAlt, 
  FaTimes,
  FaHistory,
  FaEye,
  FaArrowLeft
} from "react-icons/fa";
import RescheduleModal from "@/components/rescheduleModal";
import BookingsTable from "@/components/Technician/Bookings/BookingsTable";
import BookingHistoryTable from "@/components/Technician/Bookings/BookingHistoryTable";

const API_URL = "http://localhost:3001/api/bookings";

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState([]);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeSortConfig, setActiveSortConfig] = useState({ key: "date", direction: "asc" });
  const [historySortConfig, setHistorySortConfig] = useState({ key: "date", direction: "desc" });
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const res = await axios.get(API_URL);
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Separate bookings into active and history
  const activeBookings = bookings.filter(b => 
    ["Incoming", "Reschedule", "Accepted", "Pending", "Confirmed"].includes(b.statusName)
  );

  const historyBookings = bookings.filter(b => 
    ["Completed", "Cancel", "Cancelled", "No-Show", "No Show"].includes(b.statusName)
  );

  // Booking summary counts
  const incomingCount = bookings.filter((b) => b.statusName === "Incoming").length;
  const rescheduleCount = bookings.filter((b) => b.statusName === "Reschedule").length;
  const historyCount = historyBookings.length;

  // Sort handlers
  const handleActiveSort = (key) => {
    let direction = "asc";
    if (activeSortConfig.key === key && activeSortConfig.direction === "asc") {
      direction = "desc";
    }
    setActiveSortConfig({ key, direction });
  };

  const handleHistorySort = (key) => {
    let direction = "asc";
    if (historySortConfig.key === key && historySortConfig.direction === "asc") {
      direction = "desc";
    }
    setHistorySortConfig({ key, direction });
  };

  // Filter bookings based on search
  const filteredActiveBookings = activeBookings.filter((b) => {
    const s = search.toLowerCase();
    return (
      b.customerName?.toLowerCase().includes(s) ||
      b.technicianName?.toLowerCase().includes(s) ||
      b.statusName?.toLowerCase().includes(s) ||
      b.date?.toLowerCase().includes(s) ||
      b.time?.toLowerCase().includes(s)
    );
  });

  const filteredHistoryBookings = historyBookings.filter((b) => {
    const s = search.toLowerCase();
    return (
      b.customerName?.toLowerCase().includes(s) ||
      b.technicianName?.toLowerCase().includes(s) ||
      b.statusName?.toLowerCase().includes(s) ||
      b.date?.toLowerCase().includes(s) ||
      b.time?.toLowerCase().includes(s) ||
      b.remarks?.toLowerCase().includes(s)
    );
  });

  // Action handlers
  const handleAccept = async (booking) => {
    try {
      await axios.patch(`${API_URL}/${booking.bookingId}/status`, {
        statusId: 2, // Confirmed status
        remarks: "Accepted by technician",
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (booking) => {
    try {
      await axios.patch(`${API_URL}/${booking.bookingId}/status`, {
        statusId: 3, // Completed status
        remarks: "Service completed successfully",
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (booking) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await axios.patch(`${API_URL}/${booking.bookingId}/status`, {
        statusId: 5, // Cancelled status
        remarks: "Cancelled by technician",
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNoShow = async (booking) => {
    if (!confirm("Mark this booking as No-Show?")) return;
    try {
      await axios.patch(`${API_URL}/${booking.bookingId}/status`, {
        statusId: 6, // No-Show status
        remarks: "Customer was not available",
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const openRescheduleModal = (booking) => {
    setSelectedBooking(booking);
    setIsRescheduleModalOpen(true);
  };

  const closeRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setSelectedBooking(null);
  };

  const handleRescheduleSuccess = () => {
    fetchBookings();
    closeRescheduleModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Booking Management</h1>
        
        {/* History Toggle Button */}
        {!showHistory ? (
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
          >
            <FaHistory className="mr-3 text-lg" />
            View Booking History ({historyBookings.length})
          </button>
        ) : (
          <button
            onClick={() => setShowHistory(false)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FaArrowLeft className="mr-3 text-lg" />
            Back to Active Bookings
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Active Bookings */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
            <FaUsers className="text-indigo-600 text-7xl" />
          </div>
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaUsers className="text-white text-2xl" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">Active Bookings</p>
            <p className="text-3xl font-bold text-gray-800">{activeBookings.length}</p>
            <p className="text-xs text-gray-400 mt-1">Awaiting action</p>
          </div>
        </div>

        {/* Incoming */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
            <FaEye className="text-purple-600 text-7xl" />
          </div>
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaEye className="text-white text-2xl" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">Incoming</p>
            <p className="text-3xl font-bold text-gray-800">{incomingCount}</p>
            <p className="text-xs text-gray-400 mt-1">New requests</p>
          </div>
        </div>

        {/* Reschedules */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
            <FaCalendarAlt className="text-yellow-500 text-7xl" />
          </div>
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaCalendarAlt className="text-white text-2xl" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">Reschedules</p>
            <p className="text-3xl font-bold text-gray-800">{rescheduleCount}</p>
            <p className="text-xs text-gray-400 mt-1">Adjusted schedules</p>
          </div>
        </div>

        {/* History */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
            <FaHistory className="text-green-500 text-7xl" />
          </div>
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaHistory className="text-white text-2xl" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">History</p>
            <p className="text-3xl font-bold text-gray-800">{historyCount}</p>
            <p className="text-xs text-gray-400 mt-1">Completed & cancelled</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center relative max-w-md">
        <FaSearch className="absolute left-4 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${showHistory ? "history" : "active"} bookings...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      </div>

      {/* Active Bookings Table */}
      {!showHistory && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Active Bookings</h2>
            <span className="text-sm text-gray-500">
              Showing {filteredActiveBookings.length} of {activeBookings.length} bookings
            </span>
          </div>
          <BookingsTable
            bookings={filteredActiveBookings}
            sortConfig={activeSortConfig}
            onSort={handleActiveSort}
            onAccept={handleAccept}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onReschedule={openRescheduleModal}
            onNoShow={handleNoShow}
          />
        </div>
      )}

      {/* History Table */}
      {showHistory && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FaHistory className="mr-3 text-green-600" />
              Booking History
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredHistoryBookings.length} of {historyBookings.length} historical bookings
            </span>
          </div>
          <BookingHistoryTable
            bookings={filteredHistoryBookings}
            sortConfig={historySortConfig}
            onSort={handleHistorySort}
          />
        </div>
      )}

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={closeRescheduleModal}
        bookingId={selectedBooking?.bookingId}
        onSuccess={handleRescheduleSuccess}
      />
    </div>
  );
}