"use client";

import { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaHistory,
  FaArrowLeft,
  FaExclamationTriangle,
  FaUsers,
  FaEye,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaCalendarPlus,
  FaFileInvoiceDollar
} from "react-icons/fa";
import ServiceRescheduleModal from "@/components/Technician/ServiceRequest/RescheduleServiceRequestModal"; 
import ConvertToQuotationServiceRequest from "@/components/Technician/ServiceRequest/convertToQuotationServiceRequest";
import ViewServiceRequestModal from "@/components/Technician/ServiceRequest/viewServiceRequestModal";

export default function ServiceRequestBookingPage() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  
  // Reschedule modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedServiceRequest, setSelectedServiceRequest] = useState(null);

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRequestForView, setSelectedRequestForView] = useState(null);

  // Convert modal state
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedRequestForConvert, setSelectedRequestForConvert] = useState(null);

  // Calculate summary counts
  const activeBookings = serviceRequests.filter(req => 
    ["Pending", "Accepted", "Reviewed", "Rescheduled"].includes(req.status)
  );
  
  const incomingCount = serviceRequests.filter(req => 
    req.status === "Pending"
  ).length;
  
  const rescheduleCount = serviceRequests.filter(req => 
    req.status === "Rescheduled"
  ).length;
  
  const historyCount = serviceRequests.filter(req => 
    ["Converted", "Cancelled", "Completed"].includes(req.status)
  ).length;

  // Fetch data from backend
  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:3001/api/service-request-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch service requests');
      
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setServiceRequests(data);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching service requests:', err);
      setError(err.message);
      setServiceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    // Refresh data whenever modal closes
    if (!rescheduleModalOpen && !convertModalOpen) {
      fetchServiceRequests();
    }
  }, [rescheduleModalOpen, convertModalOpen]);

  // Filter service requests based on search and status
  const filteredRequests = serviceRequests.filter((request) => {
    const matchesSearch = 
      request.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      request.serviceType?.toLowerCase().includes(search.toLowerCase()) ||
      request.description?.toLowerCase().includes(search.toLowerCase()) ||
      request.address?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Action handlers
  const handleAccept = async (request) => {
    try {
      setActionLoading(request.serviceRequestId);
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `http://localhost:3001/api/service-request-bookings/${request.serviceRequestId}/status`, 
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'Accepted',
            remarks: 'Service request accepted by technician'
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to accept request');
      
      await fetchServiceRequests();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (request) => {
    if (confirm("Are you sure you want to cancel this service request?")) {
      try {
        setActionLoading(request.serviceRequestId);
        const token = localStorage.getItem("token");
        
        const response = await fetch(
          `http://localhost:3001/api/service-request-bookings/${request.serviceRequestId}/status`, 
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: 'Cancelled',
              remarks: 'Cancelled by user'
            }),
          }
        );

        if (!response.ok) throw new Error('Failed to cancel request');
        
        await fetchServiceRequests();
      } catch (err) {
        alert(`Error: ${err.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Review handler
  const handleReview = async (request) => {
    try {
      setActionLoading(request.serviceRequestId);
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `http://localhost:3001/api/service-request-bookings/${request.serviceRequestId}/status`, 
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'Reviewed',
            remarks: 'Service request reviewed by technician'
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to mark as reviewed');
      
      await fetchServiceRequests();
      setViewModalOpen(false);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Convert handler
  const handleConvert = async (request) => {
    try {
      setActionLoading(request.serviceRequestId);
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `http://localhost:3001/api/service-request-bookings/${request.serviceRequestId}/status`, 
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'Converted',
            remarks: 'Service request converted to job order'
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to convert request');
      
      await fetchServiceRequests();
      setConvertModalOpen(false);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Reschedule handler
  const handleReschedule = (request) => {
    console.log("🔄 Opening reschedule modal for:", request.serviceRequestId);
    setSelectedServiceRequest(request);
    setRescheduleModalOpen(true);
  };

  // View handler
  const handleView = (request) => {
    setSelectedRequestForView(request);
    setViewModalOpen(true);
  };

  // Convert button handler
  const handleConvertClick = (request) => {
    setSelectedRequestForConvert(request);
    setConvertModalOpen(true);
  };

  const handleRescheduleSuccess = () => {
    fetchServiceRequests(); // Refresh the data
    setRescheduleModalOpen(false);
  };

  const displayRequests = showHistory ? 
    filteredRequests.filter(req => ["Converted", "Cancelled", "Completed"].includes(req.status)) : 
    filteredRequests.filter(req => ["Pending", "Accepted", "Reviewed", "Rescheduled"].includes(req.status));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading service requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Reschedule Modal */}
      <ServiceRescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        serviceRequestId={selectedServiceRequest?.serviceRequestId}
        onRescheduleSuccess={handleRescheduleSuccess}              
      />

      {/* View Details Modal */}
      {viewModalOpen && (
        <ViewServiceRequestModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          serviceRequest={selectedRequestForView}
          onReview={handleReview}
          actionLoading={actionLoading}
        />
      )}

      {/* Convert to Job Order Modal */}
      <ConvertToQuotationServiceRequest
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        serviceRequest={selectedRequestForConvert}
        onConvert={handleConvert}
        actionLoading={actionLoading}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Service Request Management</h1>
        
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center px-6 py-3 rounded-xl transition-colors shadow-sm ${
            showHistory ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {showHistory ? <FaArrowLeft className="mr-3" /> : <FaHistory className="mr-3" />}
          {showHistory ? 'Back to Active Requests' : `View Service History`}
        </button>
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-600 mr-3" />
            <div>
              <p className="text-red-800 font-semibold">Error loading data</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center relative flex-1 max-w-md">
          <FaSearch className="absolute left-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${showHistory ? "history" : "active"} service requests...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Converted">Converted</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {showHistory ? "Service Request History" : "Active Service Requests"}
          </h2>
          <span className="text-sm text-gray-500">
            Showing {displayRequests.length} requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Service Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Requested Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayRequests.length > 0 ? (
                displayRequests.map((request) => (
                  <tr key={request.serviceRequestId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{request.customerName}</div>
                        <div className="text-sm text-gray-500">{request.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{request.serviceType}</div>
                      <div className="text-sm text-gray-500">{request.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.requestedDate ? new Date(request.requestedDate).toLocaleDateString() : 'Not set'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'Reviewed' ? 'bg-purple-100 text-purple-800' :
                        request.status === 'Converted' ? 'bg-green-100 text-green-800' :
                        request.status === 'Rescheduled' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* View button - always visible for all requests */}
                        <button
                          onClick={() => handleView(request)}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm space-x-1"
                        >
                          <FaEye className="text-xs" />
                          <span>View</span>
                        </button>
                        
                        {/* Accept button - only for Pending status */}
                        {!showHistory && request.status === "Pending" && (
                          <button
                            onClick={() => handleAccept(request)}
                            disabled={actionLoading === request.serviceRequestId}
                            className="flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm space-x-1 disabled:opacity-50"
                          >
                            <FaCheck className="text-xs" />
                            <span>{actionLoading === request.serviceRequestId ? 'Processing...' : 'Accept'}</span>
                          </button>
                        )}
                        
                        {/* Cancel button - always visible for active requests */}
                        {!showHistory && ["Pending", "Accepted", "Reviewed", "Rescheduled"].includes(request.status) && (
                          <button
                            onClick={() => handleCancel(request)}
                            disabled={actionLoading === request.serviceRequestId}
                            className="flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm space-x-1 disabled:opacity-50"
                          >
                            <FaTimes className="text-xs" />
                            <span>{actionLoading === request.serviceRequestId ? 'Processing...' : 'Cancel'}</span>
                          </button>
                        )}
                        
                        {/* Reschedule button for active requests */}
                        {!showHistory && ["Pending", "Accepted", "Reviewed", "Rescheduled"].includes(request.status) && (
                          <button
                            onClick={() => handleReschedule(request)}
                            className="flex items-center px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-lg hover:bg-yellow-600 transition-colors shadow-sm space-x-1"
                          >
                            <FaCalendarPlus className="text-xs" />
                            <span>Reschedule</span>
                          </button>
                        )}
                        
                        {/* Convert button for Reviewed requests */}
                        {!showHistory && request.status === "Reviewed" && (
                          <button
                            onClick={() => handleConvertClick(request)}
                            className="flex items-center px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm space-x-1"
                          >
                            <FaFileInvoiceDollar className="text-xs" />
                            <span>Convert</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <FaSearch className="text-3xl text-gray-300 mx-auto mb-3" />
                    <p>No service requests found</p>
                    {search && (
                      <p className="text-sm mt-2">Try adjusting your search or filters</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}