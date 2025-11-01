"use client";
import { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import NavbarAfterLogin from "@/components/NavbarAfterLogin";
import CustomerSideBar from "@/components/Customer/customerSideBar"; 
import CustomerRescheduleModal from "@/components/Customer/CustomerRescheduleModal";
import { useAuth } from "@/contexts/AuthContext";

// Import the new tab components
import ProfileTab from "@/components/Customer/Profile/ProfileTab";
import SecurityTab from "@/components/Customer/Security&Password/SecurityTab";
import CarTab from "@/components/Customer/Car/CarTab";
import BookingTab from "@/components/Customer/Booking/BookingTab";
import ServiceJobTab from "@/components/Customer/Service-Job/ServiceJobTab";
import PaymentTab from "@/components/Customer/Payment/PaymentTab";

export default function ProfileSettingsPage() {
  const { user: authUser } = useAuth();
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

  // My Bookings state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Reschedule Modal state
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState(null);

  // Fix hydration issue - only access localStorage on client side
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
        
        const userFullName = `${user.firstName} ${user.lastName}`;
        const userBookings = allBookings.filter(booking => 
          booking.customerName === userFullName || 
          booking.email === user.email
        ).map(booking => ({
          ...booking,
          formattedDate: new Date(booking.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          formattedTime: `${booking.startTime} - ${booking.endTime}`,
          statusName: booking.statusName || 'Pending'
        }));
        
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

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Save profile changes
  const saveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/users/${user.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage("Profile updated successfully!");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Change password
  const changePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      setMessage("New passwords don't match");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword
        })
      });

      if (response.ok) {
        setMessage("Password changed successfully!");
        setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage(error.message || "Error changing password");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Cancel booking
// In your main ProfileSettingsPage component
const cancelBooking = async (bookingId) => {
  setActionLoading(bookingId);
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        statusId: 5, // Cancelled status (from your bookingStatus table)
        changedBy: user?.userId,
        remarks: "Cancelled by customer"
      })
    });

    if (response.ok) {
      setMessage("Booking cancelled successfully!");
      fetchUserBookings(); // Refresh the list
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
  // Open reschedule modal
  const openRescheduleModal = (booking) => {
    setSelectedBookingForReschedule(booking);
    setIsRescheduleModalOpen(true);
  };

  // Close reschedule modal
  const closeRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setSelectedBookingForReschedule(null);
  };

  // Handle successful reschedule
  const handleRescheduleSuccess = () => {
    fetchUserBookings();
    closeRescheduleModal();
  };

  // Get status badge color
  const getStatusBadge = (statusName) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'Confirmed': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Completed': 'bg-green-100 text-green-800 border border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border border-red-200',
      'In Progress': 'bg-purple-100 text-purple-800 border border-purple-200',
      'Incoming': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      'Accepted': 'bg-green-100 text-green-800 border border-green-200',
      'Reschedule': 'bg-orange-100 text-orange-800 border border-orange-200'
    };
    
    return statusColors[statusName] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

// For customer side, always allow cancel/reschedule for active bookings
const canModifyBooking = (statusName) => {
  return ['Confirmed', 'Rescheduled'].includes(statusName);
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
            <div className={`mb-6 p-4 rounded-xl flex items-center justify-center ${
              message.includes("Error") 
                ? "bg-red-50 border border-red-200 text-red-800" 
                : "bg-green-50 border border-green-200 text-green-800"
            }`}>
              <FaCheckCircle className={`mr-2 ${message.includes("Error") ? "text-red-600" : "text-green-600"}`} />
              <span className="font-medium">{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <CustomerSideBar 
              user={user} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <ProfileTab
                  user={user}
                  profileData={profileData}
                  handleProfileChange={handleProfileChange}
                  saveProfile={saveProfile}
                  saving={saving}
                />
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <SecurityTab
                  securityData={securityData}
                  handleSecurityChange={handleSecurityChange}
                  showPasswords={showPasswords}
                  togglePasswordVisibility={togglePasswordVisibility}
                  changePassword={changePassword}
                  saving={saving}
                />
              )}

              {/* My Booking Tab */}
              {activeTab === "myBooking" && (
                <BookingTab
                  bookings={bookings}
                  loadingBookings={loadingBookings}
                  fetchUserBookings={fetchUserBookings}
                  cancelBooking={cancelBooking}
                  openRescheduleModal={openRescheduleModal}
                  actionLoading={actionLoading}
                  getStatusBadge={getStatusBadge}
                  canModifyBooking={canModifyBooking}
                />
              )}

              {/* My Service Job Tab */}
              {activeTab === "myServiceJob" && <ServiceJobTab />}

              {/* My Payment Tab */}
              {activeTab === "myPayment" && <PaymentTab />}

              {/* Car Profile Tab */}
              {activeTab === "carProfile" && <CarTab />}
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      <CustomerRescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={closeRescheduleModal}
        bookingId={selectedBookingForReschedule?.bookingId}
        onRescheduleSuccess={handleRescheduleSuccess}
      />
    </>
  );
}
