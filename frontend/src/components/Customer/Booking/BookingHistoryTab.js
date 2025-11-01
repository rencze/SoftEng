"use client";
import { FaBook, FaArrowLeft, FaCheckCircle, FaTimes, FaClock, FaHourglassHalf, FaUserSlash } from "react-icons/fa";

export default function BookingHistoryTab({ 
  bookings, 
  loadingBookings, 
  onBackToCurrent,
  getStatusBadge 
}) {
  // Filter for all bookings except Pending and Confirmed
  const historyBookings = bookings.filter(booking => 
    !['Pending', 'Confirmed'].includes(booking.statusName)
  );

  const getStatusIcon = (statusName) => {
    switch (statusName) {
      case 'Completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'Cancelled':
        return <FaTimes className="text-red-500" />;
      case 'Rescheduled':
        return <FaClock className="text-purple-500" />;
      case 'No-Show':
        return <FaUserSlash className="text-orange-500" />;
      default:
        return <FaHourglassHalf className="text-gray-500" />;
    }
  };

  const getStatusDescription = (statusName) => {
    switch (statusName) {
      case 'Completed':
        return 'Service completed successfully';
      case 'Cancelled':
        return 'Booking was cancelled';
      case 'Rescheduled':
        return 'Booking was moved to another date/time';
      case 'No-Show':
        return 'Customer did not attend the appointment';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToCurrent}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Active Bookings
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Booking History</h2>
        </div>
        <div className="text-sm text-gray-500">
          Showing: Completed, Cancelled, Rescheduled, No-Show
        </div>
      </div>

      {loadingBookings ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : historyBookings.length === 0 ? (
        <div className="text-center py-12">
          <FaBook className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg font-medium mb-2">No booking history</p>
          <p className="text-gray-500">Your completed, cancelled, and rescheduled bookings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyBookings.map((booking) => (
            <div
              key={booking.bookingId}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Booking #{booking.bookingId}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Technician: <span className="font-medium">{booking.technicianName || "Not assigned"}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(booking.statusName)}
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(booking.statusName)}`}>
                      {booking.statusName}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {getStatusDescription(booking.statusName)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Service Date</p>
                  <p className="font-medium text-gray-900">{booking.formattedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Slot</p>
                  <p className="font-medium text-gray-900">{booking.formattedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="font-medium text-gray-900">Air Conditioning Service</p>
                </div>
              </div>

              {booking.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Service Notes</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{booking.notes}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                <p>
                  Created on: {new Date(booking.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                  <p className="mt-1">
                    Last updated: {new Date(booking.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}