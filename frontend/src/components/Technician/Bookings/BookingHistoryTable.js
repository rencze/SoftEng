"use client";

import moment from "moment";
import { FaSort } from "react-icons/fa";

const BookingHistoryTable = ({
  bookings,
  sortConfig,
  onSort,
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

    const valA = a[sortConfig.key].toString().toLowerCase();
    const valB = b[sortConfig.key].toString().toLowerCase();

    return sortConfig.direction === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const columns = [
    { label: "Customer", key: "customerName" },
    { label: "Technician", key: "technicianName" },
    { label: "Date", key: "date" },
    { label: "Time", key: "time" },
    { label: "Status", key: "statusName" },
    { label: "Remarks", key: "remarks" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(({ label, key }) => (
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
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {sortedBookings.length > 0 ? (
            sortedBookings.map((booking) => (
              <HistoryTableRow
                key={booking.bookingId}
                booking={booking}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="text-center py-12 text-gray-500 text-sm"
              >
                No history found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// HistoryTableRow Component
const HistoryTableRow = ({ booking }) => {
  return (
    <tr className="hover:bg-gray-50 transition-all duration-200">
      <td className="px-6 py-4 font-medium text-gray-800">{booking.customerName}</td>
      <td className="px-6 py-4 text-gray-600">{booking.technicianName || "Unassigned"}</td>
      <td className="px-6 py-4 text-gray-600">
        {moment(booking.date).format("MMM D, YYYY")}
      </td>
      <td className="px-6 py-4 text-gray-600">
        {booking.time || `${booking.startTime} - ${booking.endTime}`}
      </td>
      <td className="px-6 py-4">
        <HistoryStatusBadge status={booking.statusName} />
      </td>
      <td className="px-6 py-4 text-gray-600 text-sm">
        {booking.remarks || "No remarks"}
      </td>
    </tr>
  );
};

// HistoryStatusBadge Component
const HistoryStatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Cancel":
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "No-Show":
      case "No Show":
        return "bg-orange-100 text-orange-700";
      case "Accepted":
        return "bg-blue-100 text-blue-700";
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

export default BookingHistoryTable;