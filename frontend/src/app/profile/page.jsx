"use client";
import { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSave,
  FaCamera,
  FaShieldAlt,
  FaBell,
  FaPalette,
  FaGlobe,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaCar,
  FaCreditCard,
  FaBook,
  FaWrench,
  FaTimes,
  FaCalendarAlt,
  FaSync,
} from "react-icons/fa";
import NavbarAfterLogin from "@/components/NavbarAfterLogin";

export default function ProfileSettingsPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    address: "",
    username: ""
  });

  // Security form state
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: "en",
    theme: "light",
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true
  });

  // My Bookings state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch current user data
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setProfileData({
        firstName: userObj.firstName || "",
        lastName: userObj.lastName || "",
        email: userObj.email || "",
        contactNumber: userObj.contactNumber || "",
        address: userObj.address || "",
        username: userObj.username || ""
      });
    }
    setLoading(false);
  }, []);

  // Fetch bookings when My Booking tab is active
  useEffect(() => {
    if (activeTab === "myBooking" && user) {
      fetchUserBookings();
    }
  }, [activeTab, user]);

  // Fetch user's bookings
  const fetchUserBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await fetch("http://localhost:3001/api/bookings");
      if (response.ok) {
        const allBookings = await response.json();
        
        // Filter bookings for current user
        // In a real app, you should have a customerId in the user object
        const userBookings = allBookings.filter(booking => 
          // Check if booking belongs to current user
          // This assumes your user object has customerId or you can match by name/email
          booking.customerName === `${user.firstName} ${user.lastName}` ||
          booking.email === user.email ||
          // If you have customerId in user object, use that:
          // booking.customerId === user.customerId
          true // Remove this line and use proper filtering above
        ).map(booking => ({
          ...booking,
          formattedDate: new Date(booking.createdAt).toLocaleDateString(),
          formattedTime: `${booking.startTime} - ${booking.endTime}`,
          // Ensure statusName is properly set
          statusName: booking.statusName || 'Pending'
        }));
        
        console.log("User bookings:", userBookings);
        setBookings(userBookings);
      } else {
        throw new Error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setMessage("Error loading bookings");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handle security form changes
  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };

  // Handle preferences changes
  const handlePreferenceChange = (name, value) => {
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Save profile changes
  const saveProfile = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const changePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      setMessage("New passwords don't match");
      return;
    }
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage("Password changed successfully!");
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error changing password");
    } finally {
      setSaving(false);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setMessage("Preferences saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error saving preferences");
    } finally {
      setSaving(false);
    }
  };

  // Cancel booking
  const cancelBooking = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statusId: 3, // Assuming 3 is cancelled status
          changedBy: user?.userId,
          remarks: "Cancelled by user"
        })
      });

      if (response.ok) {
        setMessage("Booking cancelled successfully!");
        // Refresh bookings
        fetchUserBookings();
      } else {
        throw new Error("Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setMessage("Error cancelling booking");
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Reschedule booking
  const rescheduleBooking = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      // For demo purposes - in real app, you'd open a modal to select new date/time
      const newTimeSlotId = 2; // This should come from user selection
      
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeSlotId: newTimeSlotId,
          remarks: "Rescheduled by user"
        })
      });

      if (response.ok) {
        setMessage("Booking rescheduled successfully!");
        // Refresh bookings
        fetchUserBookings();
      } else {
        throw new Error("Failed to reschedule booking");
      }
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      setMessage("Error rescheduling booking");
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Get status badge color
  const getStatusBadge = (statusName) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      'Incoming': 'bg-indigo-100 text-indigo-800',
      'Accepted': 'bg-green-100 text-green-800'
    };
    
    return statusColors[statusName] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <NavbarAfterLogin user={user} />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Account Settings
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your profile, security, and preferences
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center">
              <FaCheckCircle className="text-green-600 mr-2" />
              <span className="text-green-800 font-medium">{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              {/* User Card */}
              <div className="mt-8 p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="font-bold text-lg">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                    <p className="text-blue-100 text-sm">@{user?.username}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8 space-y-2">
                {[
                  { key: "profile", label: "Profile Information", icon: <FaUser /> },
                  { key: "security", label: "Security & Password", icon: <FaShieldAlt /> },
                  { key: "preferences", label: "Preferences", icon: <FaPalette /> },
                  { key: "myBooking", label: "My Booking", icon: <FaBook /> },
                  { key: "myServiceJob", label: "My Service Job", icon: <FaWrench /> },
                  { key: "myPayment", label: "My Payment", icon: <FaCreditCard /> },
                  { key: "carProfile", label: "Car Profile", icon: <FaCar /> }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.key
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-3">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                          className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your first name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        className="px-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={profileData.username}
                        onChange={handleProfileChange}
                        className="px-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="contactNumber"
                          value={profileData.contactNumber}
                          onChange={handleProfileChange}
                          className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                        <textarea
                          name="address"
                          value={profileData.address}
                          onChange={handleProfileChange}
                          rows="3"
                          className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your complete address"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="mt-6 flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <FaSave className="mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 max-w-2xl">
                  <h2 className="text-2xl font-bold mb-4">Security Settings</h2>

                  {["current", "new", "confirm"].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field === "current"
                          ? "Current Password"
                          : field === "new"
                          ? "New Password"
                          : "Confirm New Password"}
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPasswords[field] ? "text" : "password"}
                          name={field === "current" ? "currentPassword" : field === "new" ? "newPassword" : "confirmPassword"}
                          value={
                            field === "current"
                              ? securityData.currentPassword
                              : field === "new"
                              ? securityData.newPassword
                              : securityData.confirmPassword
                          }
                          onChange={handleSecurityChange}
                          className="pl-10 pr-12 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter password"
                        />
                        <button
                          onClick={() => togglePasswordVisibility(field)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords[field] ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={changePassword}
                    disabled={saving}
                    className="mt-6 flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <FaLock className="mr-2" />
                    {saving ? "Updating..." : "Update Password"}
                  </button>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Password Requirements</h3>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Minimum 8 characters</li>
                      <li>• At least one uppercase letter</li>
                      <li>• At least one number</li>
                      <li>• At least one special character</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8 max-w-2xl">
                  <h2 className="text-2xl font-bold mb-4">Preferences</h2>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <FaGlobe className="inline mr-2" />
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => handlePreferenceChange("language", e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <FaPalette className="inline mr-2" />
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "light", label: "Light", color: "bg-white border-gray-300" },
                        { value: "dark", label: "Dark", color: "bg-gray-800 border-gray-700" },
                        { value: "auto", label: "Auto", color: "bg-gradient-to-r from-gray-100 to-gray-300 border-gray-400" }
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => handlePreferenceChange("theme", theme.value)}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            preferences.theme === theme.value
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-gray-300"
                          } ${theme.color}`}
                        >
                          <span className={`font-medium ${theme.value === "dark" ? "text-white" : "text-gray-900"}`}>
                            {theme.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <FaBell className="inline mr-2" />
                      Notifications
                    </label>
                    <div className="space-y-3">
                      {[
                        { key: "emailNotifications", label: "Email Notifications" },
                        { key: "pushNotifications", label: "Push Notifications" },
                        { key: "smsNotifications", label: "SMS Notifications" }
                      ].map((notif) => (
                        <div key={notif.key} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={preferences[notif.key]}
                            onChange={(e) => handlePreferenceChange(notif.key, e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{notif.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={savePreferences}
                    disabled={saving}
                    className="mt-6 flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <FaSave className="mr-2" />
                    {saving ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              )}

              {/* My Booking Tab */}
              {activeTab === "myBooking" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">My Bookings</h2>
                    <button
                      onClick={fetchUserBookings}
                      disabled={loadingBookings}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <FaSync className={`mr-2 ${loadingBookings ? 'animate-spin' : ''}`} />
                      {loadingBookings ? "Refreshing..." : "Refresh"}
                    </button>
                  </div>

                  {loadingBookings ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <FaBook className="mx-auto text-4xl text-gray-400 mb-4" />
                      <p className="text-gray-600 text-lg">No bookings found</p>
                      <p className="text-gray-500">You haven't made any bookings yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div
                          key={booking.bookingId}
                          className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Booking #{booking.bookingId}
                              </h3>
                              <p className="text-gray-600">
                                Technician: {booking.technicianName || "Not assigned"}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(booking.statusName)}`}>
                              {booking.statusName}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Date</p>
                              <p className="font-medium">{booking.formattedDate}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Time Slot</p>
                              <p className="font-medium">{booking.formattedTime}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Service Type</p>
                              <p className="font-medium">Aircon Service</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Customer</p>
                              <p className="font-medium">{booking.customerName}</p>
                            </div>
                          </div>

                          {booking.notes && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600">Notes</p>
                              <p className="text-gray-800">{booking.notes}</p>
                            </div>
                          )}

                          <div className="flex space-x-3">
                            <button
                              onClick={() => cancelBooking(booking.bookingId)}
                              disabled={actionLoading === booking.bookingId || booking.statusName === "Cancelled" || booking.statusName === "Completed"}
                              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FaTimes className="mr-2" />
                              {actionLoading === booking.bookingId ? "Cancelling..." : "Cancel"}
                            </button>
                            <button
                              onClick={() => rescheduleBooking(booking.bookingId)}
                              disabled={actionLoading === booking.bookingId || booking.statusName === "Cancelled" || booking.statusName === "Completed"}
                              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FaCalendarAlt className="mr-2" />
                              {actionLoading === booking.bookingId ? "Rescheduling..." : "Reschedule"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Other tabs remain the same */}
              {activeTab === "myServiceJob" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold mb-4">My Service Job</h2>
                  <p className="text-gray-600 mb-4">Here you can see all your service jobs.</p>
                  {/* ... existing service job content ... */}
                </div>
              )}

              {activeTab === "myPayment" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold mb-4">My Payment</h2>
                  <p className="text-gray-600 mb-4">Here you can view your payment history.</p>
                  {/* ... existing payment content ... */}
                </div>
              )}

              {activeTab === "carProfile" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl">
                  <h2 className="text-2xl font-bold mb-4">Car Profile</h2>
                  <p className="text-gray-600 mb-4">Manage your car details here.</p>
                  {/* ... existing car profile content ... */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// "use client";
// import { useState, useEffect } from "react";
// import {
//   FaUser,
//   FaEnvelope,
//   FaPhone,
//   FaMapMarkerAlt,
//   FaSave,
//   FaCamera,
//   FaShieldAlt,
//   FaBell,
//   FaPalette,
//   FaGlobe,
//   FaLock,
//   FaEye,
//   FaEyeSlash,
//   FaCheckCircle,
//   FaCar,
//   FaCreditCard,
//   FaBook,
//   FaWrench,
// } from "react-icons/fa";
// import NavbarAfterLogin  from "@/components/NavbarAfterLogin";

// export default function ProfileSettingsPage() {
//   const [user, setUser] = useState(null);
//   const [activeTab, setActiveTab] = useState("profile");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState("");

//   // Profile form state
//   const [profileData, setProfileData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     contactNumber: "",
//     address: "",
//     username: ""
//   });

//   // Security form state
//   const [securityData, setSecurityData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: ""
//   });
//   const [showPasswords, setShowPasswords] = useState({
//     current: false,
//     new: false,
//     confirm: false
//   });

//   // Preferences state
//   const [preferences, setPreferences] = useState({
//     language: "en",
//     theme: "light",
//     emailNotifications: true,
//     pushNotifications: false,
//     smsNotifications: true
//   });

//   // Fetch current user data
//   useEffect(() => {
//     const userData = localStorage.getItem("user");
//     if (userData) {
//       const userObj = JSON.parse(userData);
//       setUser(userObj);
//       setProfileData({
//         firstName: userObj.firstName || "",
//         lastName: userObj.lastName || "",
//         email: userObj.email || "",
//         contactNumber: userObj.contactNumber || "",
//         address: userObj.address || "",
//         username: userObj.username || ""
//       });
//     }
//     setLoading(false);
//   }, []);

//   // Handle profile form changes
//   const handleProfileChange = (e) => {
//     const { name, value } = e.target;
//     setProfileData(prev => ({ ...prev, [name]: value }));
//   };

//   // Handle security form changes
//   const handleSecurityChange = (e) => {
//     const { name, value } = e.target;
//     setSecurityData(prev => ({ ...prev, [name]: value }));
//   };

//   // Handle preferences changes
//   const handlePreferenceChange = (name, value) => {
//     setPreferences(prev => ({ ...prev, [name]: value }));
//   };

//   // Toggle password visibility
//   const togglePasswordVisibility = (field) => {
//     setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
//   };

//   // Save profile changes
//   const saveProfile = async () => {
//     setSaving(true);
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       const updatedUser = { ...user, ...profileData };
//       localStorage.setItem("user", JSON.stringify(updatedUser));
//       setUser(updatedUser);
//       setMessage("Profile updated successfully!");
//       setTimeout(() => setMessage(""), 3000);
//     } catch (error) {
//       setMessage("Error updating profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Change password
//   const changePassword = async () => {
//     if (securityData.newPassword !== securityData.confirmPassword) {
//       setMessage("New passwords don't match");
//       return;
//     }
//     setSaving(true);
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       setMessage("Password changed successfully!");
//       setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
//       setTimeout(() => setMessage(""), 3000);
//     } catch (error) {
//       setMessage("Error changing password");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Save preferences
//   const savePreferences = async () => {
//     setSaving(true);
//     try {
//       await new Promise(resolve => setTimeout(resolve, 800));
//       setMessage("Preferences saved successfully!");
//       setTimeout(() => setMessage(""), 3000);
//     } catch (error) {
//       setMessage("Error saving preferences");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <>
//        <NavbarAfterLogin user={user} />

//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
//             Account Settings
//           </h1>
//           <p className="text-gray-600 text-lg">
//             Manage your profile, security, and preferences
//           </p>
//         </div>

//         {message && (
//           <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center">
//             <FaCheckCircle className="text-green-600 mr-2" />
//             <span className="text-green-800 font-medium">{message}</span>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
// {/* Sidebar Navigation */}
// <div className="lg:col-span-1">
//             {/* User Card */}
//     <div className="mt-8 p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
//       <div className="flex items-center space-x-3">
//         <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//           <span className="font-bold text-lg">
//             {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
//           </span>
//         </div>
//         <div>
//           <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
//           <p className="text-blue-100 text-sm">@{user?.username}</p>
//         </div>
//       </div>
//     </div>

//   <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8 space-y-2">
//     {[
//       { key: "profile", label: "Profile Information", icon: <FaUser /> },
//       { key: "security", label: "Security & Password", icon: <FaShieldAlt /> },
//       { key: "preferences", label: "Preferences", icon: <FaPalette /> },
//       { key: "myBooking", label: "My Booking", icon: <FaBook /> },
//       { key: "myServiceJob", label: "My Service Job", icon: <FaWrench /> },
//       { key: "myPayment", label: "My Payment", icon: <FaCreditCard /> },
//       { key: "carProfile", label: "Car Profile", icon: <FaCar /> }
    
//     ].map(tab => (
//       <button
//         key={tab.key}
//         onClick={() => setActiveTab(tab.key)}
//         className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
//           activeTab === tab.key
//             ? "bg-blue-50 text-blue-700 border border-blue-200"
//             : "text-gray-600 hover:bg-gray-50"
//         }`}
//       >
//         {tab.icon}
//         <span className="ml-3">{tab.label}</span>
//       </button>
//     ))}


//   </div>
// </div>


//           {/* Main Content */}
//           <div className="lg:col-span-3 space-y-6">
//             {/* Profile Tab */}
//             {activeTab === "profile" && (
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
//                 <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       First Name
//                     </label>
//                     <div className="relative">
//                       <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                       <input
//                         type="text"
//                         name="firstName"
//                         value={profileData.firstName}
//                         onChange={handleProfileChange}
//                         className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                         placeholder="Enter your first name"
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Last Name
//                     </label>
//                     <input
//                       type="text"
//                       name="lastName"
//                       value={profileData.lastName}
//                       onChange={handleProfileChange}
//                       className="px-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                       placeholder="Enter your last name"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Email Address
//                     </label>
//                     <div className="relative">
//                       <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                       <input
//                         type="email"
//                         name="email"
//                         value={profileData.email}
//                         onChange={handleProfileChange}
//                         className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                         placeholder="Enter your email"
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Username
//                     </label>
//                     <input
//                       type="text"
//                       name="username"
//                       value={profileData.username}
//                       onChange={handleProfileChange}
//                       className="px-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                       placeholder="Enter your username"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Contact Number
//                     </label>
//                     <div className="relative">
//                       <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                       <input
//                         type="tel"
//                         name="contactNumber"
//                         value={profileData.contactNumber}
//                         onChange={handleProfileChange}
//                         className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                         placeholder="Enter your phone number"
//                       />
//                     </div>
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Address
//                     </label>
//                     <div className="relative">
//                       <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
//                       <textarea
//                         name="address"
//                         value={profileData.address}
//                         onChange={handleProfileChange}
//                         rows="3"
//                         className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                         placeholder="Enter your complete address"
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 <button
//                   onClick={saveProfile}
//                   disabled={saving}
//                   className="mt-6 flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
//                 >
//                   <FaSave className="mr-2" />
//                   {saving ? "Saving..." : "Save Changes"}
//                 </button>
//               </div>
//             )}
            

//             {/* Security Tab */}
//             {activeTab === "security" && (
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 max-w-2xl">
//                 <h2 className="text-2xl font-bold mb-4">Security Settings</h2>

//                 {["current", "new", "confirm"].map((field) => (
//                   <div key={field}>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       {field === "current"
//                         ? "Current Password"
//                         : field === "new"
//                         ? "New Password"
//                         : "Confirm New Password"}
//                     </label>
//                     <div className="relative">
//                       <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                       <input
//                         type={showPasswords[field] ? "text" : "password"}
//                         name={field === "current" ? "currentPassword" : field === "new" ? "newPassword" : "confirmPassword"}
//                         value={
//                           field === "current"
//                             ? securityData.currentPassword
//                             : field === "new"
//                             ? securityData.newPassword
//                             : securityData.confirmPassword
//                         }
//                         onChange={handleSecurityChange}
//                         className="pl-10 pr-12 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                         placeholder="Enter password"
//                       />
//                       <button
//                         onClick={() => togglePasswordVisibility(field)}
//                         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                       >
//                         {showPasswords[field] ? <FaEyeSlash /> : <FaEye />}
//                       </button>
//                     </div>
//                   </div>
//                 ))}

//                 <button
//                   onClick={changePassword}
//                   disabled={saving}
//                   className="mt-6 flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
//                 >
//                   <FaLock className="mr-2" />
//                   {saving ? "Updating..." : "Update Password"}
//                 </button>

//                 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
//                   <h3 className="font-semibold text-blue-900 mb-2">Password Requirements</h3>
//                   <ul className="text-blue-800 text-sm space-y-1">
//                     <li>• Minimum 8 characters</li>
//                     <li>• At least one uppercase letter</li>
//                     <li>• At least one number</li>
//                     <li>• At least one special character</li>
//                   </ul>
//                 </div>
//               </div>
//             )}

//             {/* Preferences Tab */}
//             {activeTab === "preferences" && (
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8 max-w-2xl">
//                 <h2 className="text-2xl font-bold mb-4">Preferences</h2>

//                 {/* Language */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-3">
//                     <FaGlobe className="inline mr-2" />
//                     Language
//                   </label>
//                   <select
//                     value={preferences.language}
//                     onChange={(e) => handlePreferenceChange("language", e.target.value)}
//                     className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   >
//                     <option value="en">English</option>
//                     <option value="es">Spanish</option>
//                     <option value="fr">French</option>
//                     <option value="de">German</option>
//                   </select>
//                 </div>

//                 {/* Theme */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-3">
//                     <FaPalette className="inline mr-2" />
//                     Theme
//                   </label>
//                   <div className="grid grid-cols-3 gap-4">
//                     {[
//                       { value: "light", label: "Light", color: "bg-white border-gray-300" },
//                       { value: "dark", label: "Dark", color: "bg-gray-800 border-gray-700" },
//                       { value: "auto", label: "Auto", color: "bg-gradient-to-r from-gray-100 to-gray-300 border-gray-400" }
//                     ].map((theme) => (
//                       <button
//                         key={theme.value}
//                         onClick={() => handlePreferenceChange("theme", theme.value)}
//                         className={`p-4 border-2 rounded-xl transition-all ${
//                           preferences.theme === theme.value
//                             ? "border-blue-500 ring-2 ring-blue-200"
//                             : "border-gray-200 hover:border-gray-300"
//                         } ${theme.color}`}
//                       >
//                         <span className={`font-medium ${theme.value === "dark" ? "text-white" : "text-gray-900"}`}>
//                           {theme.label}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Notifications */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-3">
//                     <FaBell className="inline mr-2" />
//                     Notifications
//                   </label>
//                   <div className="space-y-3">
//                     {[
//                       { key: "emailNotifications", label: "Email Notifications" },
//                       { key: "pushNotifications", label: "Push Notifications" },
//                       { key: "smsNotifications", label: "SMS Notifications" }
//                     ].map((notif) => (
//                       <div key={notif.key} className="flex items-center space-x-3">
//                         <input
//                           type="checkbox"
//                           checked={preferences[notif.key]}
//                           onChange={(e) => handlePreferenceChange(notif.key, e.target.checked)}
//                           className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                         />
//                         <span className="text-gray-700">{notif.label}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <button
//                   onClick={savePreferences}
//                   disabled={saving}
//                   className="mt-6 flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
//                 >
//                   <FaSave className="mr-2" />
//                   {saving ? "Saving..." : "Save Preferences"}
//                 </button>
//               </div>
//             )}
          

//             {/* My Booking Tab */}
//             {activeTab === "myBooking" && (
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
//                 <h2 className="text-2xl font-bold mb-4">My Booking</h2>
//                 <p className="text-gray-600 mb-4">Here you can see all your bookings.</p>
//                 {/* Placeholder table */}
//                 <table className="w-full text-left border-collapse">
//                   <thead>
//                     <tr className="bg-gray-100">
//                       <th className="px-4 py-2 border">Booking ID</th>
//                       <th className="px-4 py-2 border">Date</th>
//                       <th className="px-4 py-2 border">Technician</th>
//                       <th className="px-4 py-2 border">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr className="hover:bg-gray-50">
//                       <td className="px-4 py-2 border">101</td>
//                       <td className="px-4 py-2 border">2025-10-15</td>
//                       <td className="px-4 py-2 border">John Doe</td>
//                       <td className="px-4 py-2 border">Pending</td>
//                     </tr>
//                     <tr className="hover:bg-gray-50">
//                       <td className="px-4 py-2 border">102</td>
//                       <td className="px-4 py-2 border">2025-10-18</td>
//                       <td className="px-4 py-2 border">Jane Smith</td>
//                       <td className="px-4 py-2 border">Completed</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             )}


//             {/* My Service Job Tab */}
// {activeTab === "myServiceJob" && (
//   <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
//     <h2 className="text-2xl font-bold mb-4">My Service Job</h2>
//     <p className="text-gray-600 mb-4">Here you can see all your service jobs.</p>
//     {/* Placeholder table */}
//     <table className="w-full text-left border-collapse">
//       <thead>
//         <tr className="bg-gray-100">
//           <th className="px-4 py-2 border">Job ID</th>
//           <th className="px-4 py-2 border">Service Type</th>
//           <th className="px-4 py-2 border">Date</th>
//           <th className="px-4 py-2 border">Technician</th>
//           <th className="px-4 py-2 border">Status</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr className="hover:bg-gray-50">
//           <td className="px-4 py-2 border">201</td>
//           <td className="px-4 py-2 border">Aircon Cleaning</td>
//           <td className="px-4 py-2 border">2025-10-16</td>
//           <td className="px-4 py-2 border">John Doe</td>
//           <td className="px-4 py-2 border">Pending</td>
//         </tr>
//         <tr className="hover:bg-gray-50">
//           <td className="px-4 py-2 border">202</td>
//           <td className="px-4 py-2 border">Refrigerant Refill</td>
//           <td className="px-4 py-2 border">2025-10-18</td>
//           <td className="px-4 py-2 border">Jane Smith</td>
//           <td className="px-4 py-2 border">Completed</td>
//         </tr>
//       </tbody>
//     </table>
//   </div>
// )}


//             {/* My Payment Tab */}
//             {activeTab === "myPayment" && (
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
//                 <h2 className="text-2xl font-bold mb-4">My Payment</h2>
//                 <p className="text-gray-600 mb-4">Here you can view your payment history.</p>
//                 {/* Placeholder table */}
//                 <table className="w-full text-left border-collapse">
//                   <thead>
//                     <tr className="bg-gray-100">
//                       <th className="px-4 py-2 border">Payment ID</th>
//                       <th className="px-4 py-2 border">Date</th>
//                       <th className="px-4 py-2 border">Amount</th>
//                       <th className="px-4 py-2 border">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr className="hover:bg-gray-50">
//                       <td className="px-4 py-2 border">501</td>
//                       <td className="px-4 py-2 border">2025-10-10</td>
//                       <td className="px-4 py-2 border">$100</td>
//                       <td className="px-4 py-2 border">Paid</td>
//                     </tr>
//                     <tr className="hover:bg-gray-50">
//                       <td className="px-4 py-2 border">502</td>
//                       <td className="px-4 py-2 border">2025-10-12</td>
//                       <td className="px-4 py-2 border">$150</td>
//                       <td className="px-4 py-2 border">Pending</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {/* Car Profile Tab */}
//             {activeTab === "carProfile" && (
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl">
//                 <h2 className="text-2xl font-bold mb-4">Car Profile</h2>
//                 <p className="text-gray-600 mb-4">Manage your car details here.</p>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Car Make</label>
//                     <input
//                       type="text"
//                       className="px-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                       placeholder="e.g., Toyota"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Car Model</label>
//                     <input
//                       type="text"
//                       className="px-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                       placeholder="e.g., Corolla"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
//                     <input
//                       type="number"
//                       className="px-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                       placeholder="e.g., 2020"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
//                     <input
//                       type="text"
//                       className="px-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                       placeholder="e.g., ABC-1234"
//                     />
//                   </div>
//                 </div>

//                 <button className="mt-6 flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
//                   <FaSave className="mr-2" />
//                   Save Car Profile
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//     </>
//   );
// }
