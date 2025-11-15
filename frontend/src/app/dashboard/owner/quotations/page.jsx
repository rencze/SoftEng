"use client";
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaEye,
  FaSearch,
  FaFileAlt,
  FaTimes,
  FaTrash,
  FaSort,
  FaCheck,
  FaHistory,
  FaArrowLeft
} from "react-icons/fa";
import QuotationModal from "@/components/Technician/Quotation/QuotationModal";
import QuotationViewModal from "@/components/Technician/Quotation/QuotationViewModal";

const API_BASE = "http://localhost:3001";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [showHistory, setShowHistory] = useState(false);

  // Fetch quotations on mount
  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/quotations`);
      if (!response.ok) throw new Error("Failed to fetch quotations");
      const data = await response.json();
      setQuotations(data);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc"
    }));
  };

  // Helper functions for customer data
  const getCustomerName = (quotation) => {
    return quotation.guestName || quotation.customerName || quotation.displayName || 'Unknown Customer';
  };

  const getCustomerEmail = (quotation) => {
    return quotation.guestEmail || quotation.email || quotation.displayEmail || 'N/A';
  };

  const getCustomerPhone = (quotation) => {
    return quotation.guestContact || quotation.phone || quotation.displayContact || 'N/A';
  };

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Expired":
        return "bg-gray-100 text-gray-800";
      case "Draft":
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Separate quotations into active and history
  const activeQuotations = quotations.filter(q => 
    ["Pending", "Draft"].includes(q.status)
  );

  const historyQuotations = quotations.filter(q => 
    ["Approved", "Rejected", "Expired"].includes(q.status)
  );

  // Filtered and sorted active quotations
  const filteredActiveQuotations = activeQuotations.filter(
    (quote) =>
      (quote.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCustomerName(quote)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCustomerEmail(quote)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || quote.status === statusFilter)
  );

  // Filtered and sorted history quotations
  const filteredHistoryQuotations = historyQuotations.filter(
    (quote) =>
      (quote.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCustomerName(quote)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCustomerEmail(quote)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || quote.status === statusFilter)
  );

  // Sort quotations
  const sortedActiveQuotations = [...filteredActiveQuotations].sort((a, b) => {
    if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;

    if (sortConfig.key === "createdAt") {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (sortConfig.key === "totalCost") {
      return sortConfig.direction === "asc" 
        ? (a.totalCost || 0) - (b.totalCost || 0)
        : (b.totalCost || 0) - (a.totalCost || 0);
    }

    const valA = a[sortConfig.key]?.toString().toLowerCase() || '';
    const valB = b[sortConfig.key]?.toString().toLowerCase() || '';

    return sortConfig.direction === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const sortedHistoryQuotations = [...filteredHistoryQuotations].sort((a, b) => {
    if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;

    if (sortConfig.key === "createdAt") {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (sortConfig.key === "totalCost") {
      return sortConfig.direction === "asc" 
        ? (a.totalCost || 0) - (b.totalCost || 0)
        : (b.totalCost || 0) - (a.totalCost || 0);
    }

    const valA = a[sortConfig.key]?.toString().toLowerCase() || '';
    const valB = b[sortConfig.key]?.toString().toLowerCase() || '';

    return sortConfig.direction === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  // Quotation summary counts
  const pendingCount = quotations.filter(q => q.status === "Pending").length;
  const draftCount = quotations.filter(q => q.status === "Draft").length;
  const approvedCount = quotations.filter(q => q.status === "Approved").length;
  const rejectedCount = quotations.filter(q => q.status === "Rejected").length;
  const expiredCount = quotations.filter(q => q.status === "Expired").length;

  // View quotation details
  const handleViewQuotation = (quotation) => {
    setSelectedQuotation(quotation);
    setShowViewModal(true);
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedQuotation(null);
  };

  // Delete quotation
  const handleDeleteQuotation = async (quotationId) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/quotations/${quotationId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete quotation");

      setQuotations((prev) => prev.filter((q) => q.quotationId !== quotationId));
      alert("Quotation deleted successfully");
    } catch (error) {
      console.error("Error deleting quotation:", error);
      alert("Failed to delete quotation");
    }
  };

  // Approve quotation
  const handleApproveQuotation = async (quotationId) => {
    try {
      const response = await fetch(`${API_BASE}/api/quotations/${quotationId}/approve`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to approve quotation");

      const updatedQuotation = await response.json();
      setQuotations((prev) =>
        prev.map((q) => (q.quotationId === quotationId ? updatedQuotation : q))
      );
      alert("Quotation approved successfully");
    } catch (error) {
      console.error("Error approving quotation:", error);
      alert("Failed to approve quotation");
    }
  };

  // Reject quotation
  const handleRejectQuotation = async (quotationId) => {
    try {
      const response = await fetch(`${API_BASE}/api/quotations/${quotationId}/reject`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to reject quotation");

      const updatedQuotation = await response.json();
      setQuotations((prev) =>
        prev.map((q) => (q.quotationId === quotationId ? updatedQuotation : q))
      );
      alert("Quotation rejected successfully");
    } catch (error) {
      console.error("Error rejecting quotation:", error);
      alert("Failed to reject quotation");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Quotations
          </h1>
          <p className="text-gray-600 flex items-center">
            <FaFileAlt className="mr-2" />
            Manage and create customer quotations
          </p>
        </div>
        
        <div className="flex gap-4">
          {/* History Toggle Button */}
          {!showHistory ? (
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
            >
              <FaHistory className="mr-3 text-lg" />
              View History ({historyQuotations.length})
            </button>
          ) : (
            <button
              onClick={() => setShowHistory(false)}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FaArrowLeft className="mr-3 text-lg" />
              Back to Active
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FaPlus className="mr-2" /> Create Quotation
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {/* Pending */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
            <FaEye className="text-yellow-500 text-7xl" />
          </div>
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaEye className="text-white text-2xl" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-gray-800">{pendingCount}</p>
            <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
          </div>
        </div>

        {/* Draft */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
            <FaFileAlt className="text-blue-500 text-7xl" />
          </div>
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaFileAlt className="text-white text-2xl" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">Draft</p>
            <p className="text-3xl font-bold text-gray-800">{draftCount}</p>
            <p className="text-xs text-gray-400 mt-1">In progress</p>
          </div>
        </div>

        {/* Approved */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
            <FaCheck className="text-green-500 text-7xl" />
          </div>
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaCheck className="text-white text-2xl" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">Approved</p>
            <p className="text-3xl font-bold text-gray-800">{approvedCount}</p>
            <p className="text-xs text-gray-400 mt-1">Accepted quotes</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
            <FaTimes className="text-red-500 text-7xl" />
          </div>
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaTimes className="text-white text-2xl" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">Rejected</p>
            <p className="text-3xl font-bold text-gray-800">{rejectedCount}</p>
            <p className="text-xs text-gray-400 mt-1">Declined quotes</p>
          </div>
        </div>

        {/* Expired */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
            <FaHistory className="text-gray-500 text-7xl" />
          </div>
          <div className="flex items-start justify-between mb-4">
            <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FaHistory className="text-white text-2xl" />
            </div>
          </div>
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1">Expired</p>
            <p className="text-3xl font-bold text-gray-800">{expiredCount}</p>
            <p className="text-xs text-gray-400 mt-1">Past validity</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${showHistory ? "history" : "active"} quotations...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {!showHistory ? (
              <>
                <option value="Pending">Pending</option>
                <option value="Draft">Draft</option>
              </>
            ) : (
              <>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Active Quotations Table */}
      {!showHistory && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading quotations...</p>
            </div>
          ) : (
            <QuotationTable
              quotations={sortedActiveQuotations}
              sortConfig={sortConfig}
              onSort={handleSort}
              onApprove={handleApproveQuotation}
              onDelete={handleDeleteQuotation}
              onReject={handleRejectQuotation}
              onView={handleViewQuotation}
              getCustomerName={getCustomerName}
              getCustomerEmail={getCustomerEmail}
              getCustomerPhone={getCustomerPhone}
              getStatusColor={getStatusColor}
              isHistory={false}
            />
          )}

          {!loading && sortedActiveQuotations.length === 0 && (
            <div className="text-center py-12">
              <FaFileAlt className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No active quotations found</p>
              <p className="text-gray-400 mt-2">
                {quotations.length === 0
                  ? "Create your first quotation to get started"
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* History Quotations Table */}
      {showHistory && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading history...</p>
            </div>
          ) : (
            <QuotationTable
              quotations={sortedHistoryQuotations}
              sortConfig={sortConfig}
              onSort={handleSort}
              onApprove={handleApproveQuotation}
              onDelete={handleDeleteQuotation}
              onReject={handleRejectQuotation}
              onView={handleViewQuotation}
              getCustomerName={getCustomerName}
              getCustomerEmail={getCustomerEmail}
              getCustomerPhone={getCustomerPhone}
              getStatusColor={getStatusColor}
              isHistory={true}
            />
          )}

          {!loading && sortedHistoryQuotations.length === 0 && (
            <div className="text-center py-12">
              <FaHistory className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No historical quotations found</p>
              <p className="text-gray-400 mt-2">
                {quotations.length === 0
                  ? "No quotations have been created yet"
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <QuotationModal
          onClose={() => setShowCreateModal(false)}
          onSave={(newQuotation) => {
            setQuotations((prev) => [newQuotation, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* View Quotation Modal */}
      {showViewModal && selectedQuotation && (
        <QuotationViewModal
          isOpen={showViewModal}
          onClose={handleCloseViewModal}
          quotation={selectedQuotation}
        />
      )}
    </div>
  );
}

// QuotationTable Component
const QuotationTable = ({
  quotations,
  sortConfig,
  onSort,
  onApprove,
  onDelete,
  onReject,
  onView,
  getCustomerName,
  getCustomerEmail,
  getCustomerPhone,
  getStatusColor,
  isHistory = false
}) => {
  const handleSort = (key) => {
    onSort(key);
  };

  const columns = [
    { label: "Quotation Details", key: "quotationNumber" },
    { label: "Customer", key: "customerName" },
    { label: "Amount", key: "totalCost" },
    { label: "Status", key: "status" },
    { label: "Date", key: "createdAt" },
    { label: "Actions", key: "actions" },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          {isHistory ? "Quotation History" : "Active Quotations"}
        </h2>
        <span className="text-sm text-gray-500">
          Showing {quotations.length} quotations
        </span>
      </div>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(({ label, key }) => (
              <th
                key={key}
                onClick={key !== "actions" ? () => handleSort(key) : undefined}
                className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
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
        <tbody className="bg-white divide-y divide-gray-200">
          {quotations.map((quotation) => (
            <QuotationTableRow
              key={quotation.quotationId}
              quotation={quotation}
              onApprove={onApprove}
              onDelete={onDelete}
              onReject={onReject}
              onView={onView}
              getCustomerName={getCustomerName}
              getCustomerEmail={getCustomerEmail}
              getCustomerPhone={getCustomerPhone}
              getStatusColor={getStatusColor}
              isHistory={isHistory}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// QuotationTableRow Component
const QuotationTableRow = ({ 
  quotation, 
  onApprove, 
  onDelete, 
  onReject, 
  onView, 
  getCustomerName, 
  getCustomerEmail, 
  getCustomerPhone,
  getStatusColor,
  isHistory = false
}) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-semibold text-gray-900">
          {quotation.quotationNumber || `QTN-${quotation.quotationId}`}
        </div>
        {quotation.bookingNumber && (
          <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mt-1">
            {quotation.bookingNumber}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">
          {getCustomerName(quotation)}
        </div>
        <div className="text-sm text-gray-500">
          {getCustomerEmail(quotation)}
        </div>
        <div className="text-xs text-gray-400">
          {getCustomerPhone(quotation)}
        </div>
        {quotation.customerId ? (
          <span className="inline-block mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            Registered Customer
          </span>
        ) : (
          <span className="inline-block mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            Guest Customer
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
        ₱{quotation.totalCost?.toFixed(2) || "0.00"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            quotation.status
          )}`}
        >
          {quotation.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(quotation.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          {/* View Button */}
          <button
            onClick={() => onView(quotation)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FaEye className="mr-2" />
            View
          </button>

          {/* Action Buttons for Active Quotations */}
          {!isHistory && quotation.status === "Pending" && (
            <>
              <button
                onClick={() => onApprove(quotation.quotationId)}
                className="flex items-center px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <FaCheck className="mr-2" />
                Approve
              </button>
              <button
                onClick={() => onReject(quotation.quotationId)}
                className="flex items-center px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                <FaTimes className="mr-2" />
                Reject
              </button>
            </>
          )}

          {/* Delete Button */}
          <button
            onClick={() => onDelete(quotation.quotationId)}
            className="flex items-center px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <FaTrash className="mr-2" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};