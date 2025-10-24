"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { 
  FaSearch, 
  FaSort, 
  FaUsers, 
  FaCalendarAlt, 
  FaTimes 
} from "react-icons/fa";
import RescheduleModal from "@/components/rescheduleModal";

const API_URL = "http://localhost:3001/api/bookings";

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState([]);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "asc" });
  const [search, setSearch] = useState("");
  

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

  // Booking summary counts
  const incomingCount = bookings.filter((b) => b.statusName === "Incoming").length;
  const rescheduleCount = bookings.filter((b) => b.statusName === "Reschedule").length;
  const cancelCount = bookings.filter((b) => b.statusName === "Cancel").length;

  // Sort handler
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter + Sort bookings
  const filteredAndSortedBookings = [...bookings]
    .filter((b) => {
      const s = search.toLowerCase();
      return (
        b.customerName?.toLowerCase().includes(s) ||
        b.technicianName?.toLowerCase().includes(s) ||
        b.statusName?.toLowerCase().includes(s) ||
        b.date?.toLowerCase().includes(s) ||
        b.time?.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;

      if (sortConfig.key === "date") {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (sortConfig.key === "time") {
        const timeA = a.time || a.startTime || "";
        const timeB = b.time || b.startTime || "";
        return sortConfig.direction === "asc"
          ? timeA.localeCompare(timeB)
          : timeB.localeCompare(timeA);
      }

      if (sortConfig.key === "statusName") {
        return sortConfig.direction === "asc"
          ? a.statusName.localeCompare(b.statusName)
          : b.statusName.localeCompare(a.statusName);
      }

      const valA = a[sortConfig.key].toString().toLowerCase();
      const valB = b[sortConfig.key].toString().toLowerCase();

      return sortConfig.direction === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

  // Action handlers
  const handleAccept = async (booking) => {
    try {
      await axios.patch(`${API_URL}/${booking.bookingId}/status`, {
        statusId: 2,
        remarks: "Accepted",
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
        statusId: 3,
        remarks: "Cancelled",
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
    fetchBookings(); // Refresh the bookings list after successful reschedule
    closeRescheduleModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Booking Management</h1>

      {/* Summary Cards — Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Incoming */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
          {/* background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
            <FaUsers className="text-indigo-600 text-7xl" />
          </div>

          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaUsers className="text-white text-2xl" />
            </div>
          </div>

          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">Incoming Bookings</p>
            <p className="text-3xl font-bold text-gray-800">{incomingCount}</p>
            <p className="text-xs text-gray-400 mt-1">Active and awaiting confirmation</p>
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
            <p className="text-xs text-gray-400 mt-1">Bookings with adjusted schedules</p>
          </div>
        </div>

        {/* Cancelled */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
            <FaTimes className="text-red-500 text-7xl" />
          </div>

          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-red-500 to-rose-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaTimes className="text-white text-2xl" />
            </div>
          </div>

          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">Cancelled Bookings</p>
            <p className="text-3xl font-bold text-gray-800">{cancelCount}</p>
            <p className="text-xs text-gray-400 mt-1">Declined or withdrawn requests</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center relative max-w-md">
        <FaSearch className="absolute left-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search bookings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                { label: "Customer", key: "customerName" },
                { label: "Technician", key: "technicianName" },
                { label: "Date", key: "date" },
                { label: "Time", key: "time" },
                { label: "Status", key: "statusName" },
              ].map(({ label, key }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    {label}
                    <FaSort className="ml-1 text-gray-400" />
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedBookings.length > 0 ? (
              filteredAndSortedBookings.map((b) => (
                <tr
                  key={b.bookingId}
                  className="hover:bg-gray-50 transition-all duration-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">{b.customerName}</td>
                  <td className="px-6 py-4 text-gray-600">{b.technicianName || "Unassigned"}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {moment(b.date).format("MMM D, YYYY")}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {b.time || `${b.startTime} - ${b.endTime}`}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        b.statusName === "Incoming"
                          ? "bg-indigo-100 text-indigo-700"
                          : b.statusName === "Reschedule"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {b.statusName}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {b.statusName !== "Accepted" && (
                      <button
                        onClick={() => handleAccept(b)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs transition"
                      >
                        Accept
                      </button>
                    )}
                    <button
                      onClick={() => openRescheduleModal(b)}
                      className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-xs transition"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancel(b)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs transition"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-12 text-gray-500 text-sm"
                >
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={closeRescheduleModal}
        bookingId={selectedBooking?.bookingId}
      />
    </div>
  );
}


// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import moment from "moment";
// import { 
//   FaSearch, 
//   FaSort, 
//   FaUsers, 
//   FaCalendarAlt, 
//   FaTimes 
// } from "react-icons/fa";
// import RescheduleModal from "@/components/reschedule";

// const API_URL = "http://localhost:3001/api/bookings";

// export default function BookingManagementPage() {
//   const [bookings, setBookings] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [newDate, setNewDate] = useState("");
//   const [newTime, setNewTime] = useState("");
//   const [sortConfig, setSortConfig] = useState({ key: "date", direction: "asc" });
//   const [search, setSearch] = useState("");

//   // Fetch bookings
//   const fetchBookings = async () => {
//     try {
//       const res = await axios.get(API_URL);
//       setBookings(res.data);
//     } catch (err) {
//       console.error("Error fetching bookings:", err);
//     }
//   };

//   useEffect(() => {
//     fetchBookings();
//   }, []);

//   // Booking summary counts
//   const incomingCount = bookings.filter((b) => b.statusName === "Incoming").length;
//   const rescheduleCount = bookings.filter((b) => b.statusName === "Reschedule").length;
//   const cancelCount = bookings.filter((b) => b.statusName === "Cancel").length;

//   // Sort handler
//   const handleSort = (key) => {
//     let direction = "asc";
//     if (sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc";
//     }
//     setSortConfig({ key, direction });
//   };

//   // Filter + Sort bookings
//   const filteredAndSortedBookings = [...bookings]
//     .filter((b) => {
//       const s = search.toLowerCase();
//       return (
//         b.customerName?.toLowerCase().includes(s) ||
//         b.technicianName?.toLowerCase().includes(s) ||
//         b.statusName?.toLowerCase().includes(s) ||
//         b.date?.toLowerCase().includes(s) ||
//         b.time?.toLowerCase().includes(s)
//       );
//     })
//     .sort((a, b) => {
//       if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;

//       if (sortConfig.key === "date") {
//         const dateA = new Date(a.date);
//         const dateB = new Date(b.date);
//         return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
//       }

//       if (sortConfig.key === "time") {
//         const timeA = a.time || a.startTime || "";
//         const timeB = b.time || b.startTime || "";
//         return sortConfig.direction === "asc"
//           ? timeA.localeCompare(timeB)
//           : timeB.localeCompare(timeA);
//       }

//       if (sortConfig.key === "statusName") {
//         return sortConfig.direction === "asc"
//           ? a.statusName.localeCompare(b.statusName)
//           : b.statusName.localeCompare(a.statusName);
//       }

//       const valA = a[sortConfig.key].toString().toLowerCase();
//       const valB = b[sortConfig.key].toString().toLowerCase();

//       return sortConfig.direction === "asc"
//         ? valA.localeCompare(valB)
//         : valB.localeCompare(valA);
//     });

//   // Action handlers
//   const handleAccept = async (booking) => {
//     try {
//       await axios.patch(`${API_URL}/${booking.bookingId}/status`, {
//         statusId: 2,
//         remarks: "Accepted",
//       });
//       fetchBookings();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleCancel = async (booking) => {
//     if (!confirm("Are you sure you want to cancel this booking?")) return;
//     try {
//       await axios.patch(`${API_URL}/${booking.bookingId}/status`, {
//         statusId: 3,
//         remarks: "Cancelled",
//       });
//       fetchBookings();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const openRescheduleModal = (booking) => {
//     setSelectedBooking(booking);
//     setNewDate(moment(booking.date).format("YYYY-MM-DD"));
//     setNewTime(booking.time);
//     setIsModalOpen(true);
//   };

//   const handleReschedule = async () => {
//     try {
//       await axios.put(`${API_URL}/${selectedBooking.bookingId}`, {
//         date: newDate,
//         time: newTime,
//       });
//       fetchBookings();
//       closeModal();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedBooking(null);
//     setNewDate("");
//     setNewTime("");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Header */}
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Booking Management</h1>

// {/* Summary Cards — Dashboard Style */}
// <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//   {/* Incoming */}
//   <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
//     {/* background decoration */}
//     <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
//       <FaUsers className="text-indigo-600 text-7xl" />
//     </div>

//     <div className="flex items-start justify-between mb-4">
//       <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
//         <FaUsers className="text-white text-2xl" />
//       </div>
//     </div>

//     <div>
//       <p className="text-gray-500 font-medium text-sm mb-1">Incoming Bookings</p>
//       <p className="text-3xl font-bold text-gray-800">{incomingCount}</p>
//       <p className="text-xs text-gray-400 mt-1">Active and awaiting confirmation</p>
//     </div>
//   </div>

//   {/* Reschedules */}
//   <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
//     <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
//       <FaCalendarAlt className="text-yellow-500 text-7xl" />
//     </div>

//     <div className="flex items-start justify-between mb-4">
//       <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
//         <FaCalendarAlt className="text-white text-2xl" />
//       </div>
//     </div>

//     <div>
//       <p className="text-gray-500 font-medium text-sm mb-1">Reschedules</p>
//       <p className="text-3xl font-bold text-gray-800">{rescheduleCount}</p>
//       <p className="text-xs text-gray-400 mt-1">Bookings with adjusted schedules</p>
//     </div>
//   </div>

//   {/* Cancelled */}
//   <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
//     <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
//       <FaTimes className="text-red-500 text-7xl" />
//     </div>

//     <div className="flex items-start justify-between mb-4">
//       <div className="bg-gradient-to-br from-red-500 to-rose-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
//         <FaTimes className="text-white text-2xl" />
//       </div>
//     </div>

//     <div>
//       <p className="text-gray-500 font-medium text-sm mb-1">Cancelled Bookings</p>
//       <p className="text-3xl font-bold text-gray-800">{cancelCount}</p>
//       <p className="text-xs text-gray-400 mt-1">Declined or withdrawn requests</p>
//     </div>
//   </div>
// </div>


//       {/* Search Bar */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center relative max-w-md">
//         <FaSearch className="absolute left-4 text-gray-400" />
//         <input
//           type="text"
//           placeholder="Search bookings..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//         />
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200 text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               {[
//                 { label: "Customer", key: "customerName" },
//                 { label: "Technician", key: "technicianName" },
//                 { label: "Date", key: "date" },
//                 { label: "Time", key: "time" },
//                 { label: "Status", key: "statusName" },
//               ].map(({ label, key }) => (
//                 <th
//                   key={key}
//                   onClick={() => handleSort(key)}
//                   className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
//                 >
//                   <div className="flex items-center">
//                     {label}
//                     <FaSort className="ml-1 text-gray-400" />
//                   </div>
//                 </th>
//               ))}
//               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-gray-200">
//             {filteredAndSortedBookings.length > 0 ? (
//               filteredAndSortedBookings.map((b) => (
//                 <tr
//                   key={b.bookingId}
//                   className="hover:bg-gray-50 transition-all duration-200"
//                 >
//                   <td className="px-6 py-4 font-medium text-gray-800">{b.customerName}</td>
//                   <td className="px-6 py-4 text-gray-600">{b.technicianName || "Unassigned"}</td>
//                   <td className="px-6 py-4 text-gray-600">
//                     {moment(b.date).format("MMM D, YYYY")}
//                   </td>
//                   <td className="px-6 py-4 text-gray-600">
//                     {b.time || `${b.startTime} - ${b.endTime}`}
//                   </td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
//                         b.statusName === "Incoming"
//                           ? "bg-indigo-100 text-indigo-700"
//                           : b.statusName === "Reschedule"
//                           ? "bg-yellow-100 text-yellow-700"
//                           : "bg-red-100 text-red-700"
//                       }`}
//                     >
//                       {b.statusName}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 flex gap-2">
//                     {b.statusName !== "Accepted" && (
//                       <button
//                         onClick={() => handleAccept(b)}
//                         className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs transition"
//                       >
//                         Accept
//                       </button>
//                     )}
//                     <button
//                       onClick={() => openRescheduleModal(b)}
//                       className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-xs transition"
//                     >
//                       Reschedule
//                     </button>
//                     <button
//                       onClick={() => handleCancel(b)}
//                       className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs transition"
//                     >
//                       Cancel
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td
//                   colSpan="6"
//                   className="text-center py-12 text-gray-500 text-sm"
//                 >
//                   No bookings found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Reschedule Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold text-gray-800">Reschedule Booking</h2>
//               <button
//                 onClick={closeModal}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <FaTimes />
//               </button>
//             </div>

//             <div className="flex flex-col gap-4">
//               <div>
//                 <label className="block text-gray-700 text-sm mb-1">New Date</label>
//                 <input
//                   type="date"
//                   value={newDate}
//                   onChange={(e) => setNewDate(e.target.value)}
//                   className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
//                 />
//               </div>
//               <div>
//                 <label className="block text-gray-700 text-sm mb-1">New Time</label>
//                 <input
//                   type="time"
//                   value={newTime}
//                   onChange={(e) => setNewTime(e.target.value)}
//                   className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
//                 />
//               </div>
//               <button
//                 onClick={handleReschedule}
//                 className="w-full py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all duration-200"
//               >
//                 Confirm Reschedule
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
