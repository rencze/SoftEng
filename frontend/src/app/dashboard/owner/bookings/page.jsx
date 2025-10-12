"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { FaTimes } from "react-icons/fa";

const API_URL = "http://localhost:3001/api/bookings";

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // Fetch bookings from backend
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

  // Booking counts for cards
  const incomingCount = bookings.filter(b => b.status === "incoming").length;
  const rescheduleCount = bookings.filter(b => b.status === "reschedule").length;
  const cancelCount = bookings.filter(b => b.status === "cancel").length;

  // Booking actions
  const handleAccept = async (booking) => {
    try {
      await axios.put(`${API_URL}/${booking.id}`, { status: "accepted" });
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (booking) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await axios.put(`${API_URL}/${booking.id}`, { status: "cancel" });
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const openRescheduleModal = (booking) => {
    setSelectedBooking(booking);
    setNewDate(moment(booking.date).format("YYYY-MM-DD"));
    setNewTime(booking.time);
    setIsModalOpen(true);
  };

  const handleReschedule = async () => {
    try {
      await axios.put(`${API_URL}/${selectedBooking.id}`, { date: newDate, time: newTime, status: "reschedule" });
      fetchBookings();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setNewDate("");
    setNewTime("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Booking Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-gray-500">Incoming Booking</p>
          <p className="text-2xl font-bold text-indigo-600">{incomingCount}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-gray-500">Reschedules</p>
          <p className="text-2xl font-bold text-yellow-600">{rescheduleCount}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-gray-500">Cancels</p>
          <p className="text-2xl font-bold text-red-600">{cancelCount}</p>
        </div>
      </div>

      {/* Booking Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Customer</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Date</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Time</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.length > 0 ? (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-800">{b.customer}</td>
                  <td className="px-6 py-4 text-gray-600">{moment(b.date).format("MMM D, YYYY")}</td>
                  <td className="px-6 py-4 text-gray-600">{b.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      b.status === "incoming" ? "bg-indigo-100 text-indigo-700" :
                      b.status === "reschedule" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {b.status !== "accepted" && (
                      <button
                        onClick={() => handleAccept(b)}
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                      >
                        Accept
                      </button>
                    )}
                    <button
                      onClick={() => openRescheduleModal(b)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-sm"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancel(b)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-12 text-gray-500">No bookings found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reschedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Reschedule Booking</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">New Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button
                onClick={handleReschedule}
                className="w-full py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
