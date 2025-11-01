"use client";
import { FaBook, FaSync, FaTimes, FaCalendarAlt, FaHistory } from "react-icons/fa";
import { useState } from "react";
import BookingHistoryTab from "./BookingHistoryTab";

export default function BookingTab({ 
  bookings, 
  loadingBookings, 
  fetchUserBookings, 
  cancelBooking, 
  openRescheduleModal, 
  actionLoading, 
  getStatusBadge, 
  canModifyBooking 
}) {
  const [showHistory, setShowHistory] = useState(false);

  // Filter for active bookings (Pending and Confirmed only)
  const activeBookings = bookings
    .filter(booking => ['Pending', 'Confirmed'].includes(booking.statusName))
    // Sort: Confirmed first, then Pending, then by nearest time
    .sort((a, b) => {
      // First sort by status: Confirmed (2) comes before Pending (1)
      const statusOrder = { 'Confirmed': 1, 'Pending': 2 };
      const statusComparison = statusOrder[a.statusName] - statusOrder[b.statusName];
      
      if (statusComparison !== 0) {
        return statusComparison;
      }
      
      // If same status, sort by nearest time (booking date and time slot)
      // Convert booking dates to timestamps for comparison
      const dateA = new Date(a.bookingDate || a.createdAt).getTime();
      const dateB = new Date(b.bookingDate || b.createdAt).getTime();
      
      return dateA - dateB; // Nearest date first
    });

  // Filter for historical bookings (everything else - Completed, Cancelled, No Show, etc.)
  const historyBookings = bookings.filter(booking => 
    !['Pending', 'Confirmed'].includes(booking.statusName)
  );

  // Function to format the booking date and time for display
  const formatBookingDateTime = (booking) => {
    if (booking.bookingDate && booking.formattedTime) {
      return `${booking.formattedDate} • ${booking.formattedTime}`;
    }
    // Fallback to creation date if booking date not available
    return new Date(booking.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      {showHistory ? (
        <BookingHistoryTab
          bookings={historyBookings} // Pass only historical bookings
          loadingBookings={loadingBookings}
          onBackToCurrent={() => setShowHistory(false)}
          getStatusBadge={getStatusBadge}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
              <p className="text-gray-600 mt-1">
                Active bookings: {activeBookings.length} | 
                History: {historyBookings.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Sorted by: Confirmed first, then nearest time
              </p>
            </div>
            <div className="flex space-x-3">
              {historyBookings.length > 0 && (
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors shadow-sm"
                >
                  <FaHistory className="mr-2" />
                  View History ({historyBookings.length})
                </button>
              )}
              <button
                onClick={fetchUserBookings}
                disabled={loadingBookings}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                <FaSync className={`mr-2 ${loadingBookings ? 'animate-spin' : ''}`} />
                {loadingBookings ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {loadingBookings ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activeBookings.length === 0 ? (
            <div className="text-center py-12">
              <FaBook className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">No active bookings</p>
              <p className="text-gray-500 mb-4">You don't have any pending or confirmed bookings.</p>
              {historyBookings.length > 0 ? (
                <button
                  onClick={() => setShowHistory(true)}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <FaHistory className="mr-2" />
                  View Booking History
                </button>
              ) : (
                <p className="text-gray-500">You don't have any booking history yet.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => (
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
                      <p className="text-sm text-blue-600 mt-1 font-medium">
                        {formatBookingDateTime(booking)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(booking.statusName)}`}>
                      {booking.statusName}
                    </span>
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
                      <p className="text-sm text-gray-600">Additional Notes</p>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{booking.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons - Only show for Pending and Confirmed */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => cancelBooking(booking.bookingId)}
                      disabled={actionLoading === booking.bookingId}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <FaTimes className="mr-2" />
                      {actionLoading === booking.bookingId ? "Cancelling..." : "Cancel Booking"}
                    </button>
                    
                    {/* Only show Reschedule for Confirmed bookings, not Pending */}
                    {booking.statusName === 'Confirmed' && (
                      <button
                        onClick={() => openRescheduleModal(booking)}
                        disabled={actionLoading === booking.bookingId}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <FaCalendarAlt className="mr-2" />
                        {actionLoading === booking.bookingId ? "Loading..." : "Reschedule"}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Show history link at the bottom if there are historical bookings */}
              {historyBookings.length > 0 && (
                <div className="text-center pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowHistory(true)}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <FaHistory className="mr-2" />
                    View {historyBookings.length} bookings in history
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}