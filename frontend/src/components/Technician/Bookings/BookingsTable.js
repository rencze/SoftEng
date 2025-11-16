"use client";

import moment from "moment";
import { FaSort, FaCheck, FaTimes, FaUserTimes, FaCalendarPlus } from "react-icons/fa";

const BookingsTable = ({
  bookings,
  sortConfig,
  onSort,
  onAccept,
  onCancel,
  onReschedule,
  onComplete,
  onNoShow
}) => {
  const handleSort = (key) => {
    onSort(key);
  };

  const sortedBookings = [...bookings].sort((a, b) => {
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

    if (sortConfig.key === "serviceReference") {
      return sortConfig.direction === "asc"
        ? a.serviceReference.localeCompare(b.serviceReference)
        : b.serviceReference.localeCompare(a.serviceReference);
    }

    const valA = a[sortConfig.key].toString().toLowerCase();
    const valB = b[sortConfig.key].toString().toLowerCase();

    return sortConfig.direction === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const columns = [
    { label: "Reference", key: "serviceReference" },
    { label: "Customer", key: "customerName" },
    { label: "Technician", key: "technicianName" },
    { label: "Date", key: "date" },
    { label: "Time", key: "time" },
    { label: "Status", key: "statusName" },
    { label: "Actions", key: "actions" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(({ label, key }) => (
              <th
                key={key}
                onClick={key !== "actions" ? () => handleSort(key) : undefined}
                className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                  key !== "actions" ? "cursor-pointer hover:bg-gray-100" : ""
                }`}
              >
                <div className="flex items-center">
                  {label}
                  {key !== "actions" && <FaSort className="ml-1 text-gray-400" />}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {sortedBookings.length > 0 ? (
            sortedBookings.map((booking) => (
              <TableRow
                key={booking.bookingId}
                booking={booking}
                onAccept={onAccept}
                onCancel={onCancel}
                onReschedule={onReschedule}
                onComplete={onComplete}
                onNoShow={onNoShow}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                className="text-center py-12 text-gray-500 text-sm"
              >
                No bookings found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// TableRow Component
const TableRow = ({ booking, onAccept, onCancel, onReschedule, onComplete, onNoShow }) => {
  return (
    <tr className="hover:bg-gray-50 transition-all duration-200">
      <td className="px-6 py-4 font-medium text-gray-800 font-mono">
        {booking.serviceReference}
      </td>
      <td className="px-6 py-4 font-medium text-gray-800">{booking.customerName}</td>
      <td className="px-6 py-4 text-gray-600">{booking.technicianName || "Unassigned"}</td>
      <td className="px-6 py-4 text-gray-600">
        {moment(booking.date).format("MMM D, YYYY")}
      </td>
      <td className="px-6 py-4 text-gray-600">
        {booking.time || `${booking.startTime} - ${booking.endTime}`}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={booking.statusName} />
      </td>
      <td className="px-6 py-4">
        <ActionButtons 
          booking={booking}
          onAccept={onAccept}
          onCancel={onCancel}
          onReschedule={onReschedule}
          onComplete={onComplete}
          onNoShow={onNoShow}
        />
      </td>
    </tr>
  );
};

// ActionButtons Component
const ActionButtons = ({ booking, onAccept, onCancel, onReschedule, onComplete, onNoShow }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {/* Show Accept button only for Incoming and Pending statuses */}
      {["Incoming", "Pending"].includes(booking.statusName) && (
        <button
          onClick={() => onAccept(booking)}
          className="flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm space-x-1"
        >
          <FaCheck className="text-xs" />
          <span>Accept</span>
        </button>
      )}
      
      {/* Show Complete button only for Accepted and Confirmed statuses */}
      {["Accepted", "Confirmed"].includes(booking.statusName) && (
        <button
          onClick={() => onComplete(booking)}
          className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm space-x-1"
        >
          <FaCheck className="text-xs" />
          <span>Complete</span>
        </button>
      )}
      
      {/* Show No-Show button for Accepted and Confirmed statuses */}
      {["Accepted", "Confirmed"].includes(booking.statusName) && (
        <button
          onClick={() => onNoShow(booking)}
          className="flex items-center px-3 py-1 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm space-x-1"
        >
          <FaUserTimes className="text-xs" />
          <span>No-Show</span>
        </button>
      )}
      
      {/* Show Reschedule and Cancel for active statuses except Completed, Cancelled, No-Show */}
      {!["Completed", "Cancel", "Cancelled", "No-Show", "No Show"].includes(booking.statusName) && (
        <>
          <button
            onClick={() => onReschedule(booking)}
            className="flex items-center px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-lg hover:bg-yellow-600 transition-colors shadow-sm space-x-1"
          >
            <FaCalendarPlus className="text-xs" />
            <span>Reschedule</span>
          </button>
          
          <button
            onClick={() => onCancel(booking)}
            className="flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm space-x-1"
          >
            <FaTimes className="text-xs" />
            <span>Cancel</span>
          </button>
        </>
      )}
    </div>
  );
};

// StatusBadge Component
const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Incoming":
        return "bg-indigo-100 text-indigo-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Reschedule":
        return "bg-yellow-100 text-yellow-700";
      case "Accepted":
        return "bg-blue-100 text-blue-700";
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Cancelled":
      case "Cancel":
        return "bg-red-100 text-red-700";
      case "No-Show":
      case "No Show":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
};

export default BookingsTable;