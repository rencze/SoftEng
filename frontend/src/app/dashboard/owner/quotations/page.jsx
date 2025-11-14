"use client";
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaEye,
  FaSearch,
  FaFilter,
  FaFilePdf,
  FaPrint,
  FaFileAlt,
  FaTimes,
  FaTrash
} from "react-icons/fa";
import QuotationModal from "@/components/Technician/Quotation/QuotationModal";

const API_BASE = "http://localhost:3001";

// Main Quotations Page Component
export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Fetch quotations from backend
  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/quotations`);
      if (!response.ok) throw new Error('Failed to fetch quotations');
      const data = await response.json();
      setQuotations(data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter(quote => 
    (quote.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === "all" || quote.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteQuotation = async (quotationId) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/quotations/${quotationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete quotation');

      setQuotations(prev => prev.filter(q => q.quotationId !== quotationId));
      alert('Quotation deleted successfully');
    } catch (error) {
      console.error('Error deleting quotation:', error);
      alert('Failed to delete quotation');
    }
  };

  const handleApproveQuotation = async (quotationId) => {
    try {
      const response = await fetch(`${API_BASE}/api/quotations/${quotationId}/approve`, {
        method: 'PATCH'
      });

      if (!response.ok) throw new Error('Failed to approve quotation');

      const updatedQuotation = await response.json();
      setQuotations(prev => prev.map(q => 
        q.quotationId === quotationId ? updatedQuotation : q
      ));
      alert('Quotation approved successfully');
    } catch (error) {
      console.error('Error approving quotation:', error);
      alert('Failed to approve quotation');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Quotations
            </h1>
            <p className="text-gray-600 flex items-center">
              <FaFileAlt className="mr-2" />
              Manage and create customer quotations
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FaPlus className="mr-2" />
            Create Quotation
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search quotations, customers, or booking numbers..."
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
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading quotations...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quotation Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation.quotationId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {quotation.quotationNumber || `QTN-${quotation.quotationId}`}
                        </div>
                        {quotation.bookingNumber && (
                          <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mt-1">
                            {quotation.bookingNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {quotation.customerName}
                        </div>
                        {quotation.email && (
                          <div className="text-sm text-gray-500">{quotation.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₱{quotation.totalCost?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(quotation.status)}`}>
                        {quotation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quotation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setSelectedQuotation(quotation)}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {quotation.status === 'Pending' && (
                          <button 
                            onClick={() => handleApproveQuotation(quotation.quotationId)}
                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve Quotation"
                          >
                            <FaEdit />
                          </button>
                        )}
                        <button 
                          className="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <FaFilePdf />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuotation(quotation.quotationId)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Quotation"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredQuotations.length === 0 && (
          <div className="text-center py-12">
            <FaFileAlt className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No quotations found</p>
            <p className="text-gray-400 mt-2">
              {quotations.length === 0 
                ? "Create your first quotation to get started" 
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </div>
        )}
      </div>

      {/* Create Quotation Modal */}
      {showCreateModal && (
        <QuotationModal 
          onClose={() => setShowCreateModal(false)}
          onSave={(newQuotation) => {
            setQuotations(prev => [newQuotation, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* View Quotation Modal */}
      {selectedQuotation && (
        <ViewQuotationModal
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
        />
      )}
    </div>
  );
}

// View Quotation Modal Component
function ViewQuotationModal({ quotation, onClose }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quotation Details</h2>
              <p className="text-green-100">{quotation.quotationNumber || `QTN-${quotation.quotationId}`}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors p-2"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Information</h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {quotation.customerName}</p>
                <p><strong>Email:</strong> {quotation.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {quotation.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {quotation.address || 'N/A'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quotation Details</h3>
              <div className="space-y-2">
                {quotation.bookingNumber && (
                  <p><strong>Booking Reference:</strong> {quotation.bookingNumber}</p>
                )}
                <p><strong>Date:</strong> {new Date(quotation.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    quotation.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    quotation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    quotation.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {quotation.status}
                  </span>
                </p>
                {quotation.approvedAt && (
                  <p><strong>Approved At:</strong> {new Date(quotation.approvedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(quotation.laborCost)}</p>
                <p className="text-gray-600">Labor Cost</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(quotation.partsCost)}</p>
                <p className="text-gray-600">Parts Cost</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">-{formatCurrency(quotation.discount)}</p>
                <p className="text-gray-600">Discount</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(quotation.totalCost)}</p>
                <p className="text-gray-600">Total Cost</p>
              </div>
            </div>
          </div>

          {quotation.quote && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
              <p className="text-gray-700">{quotation.quote}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <FaFilePdf className="mr-2" />
              Export PDF
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <FaPrint className="mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}