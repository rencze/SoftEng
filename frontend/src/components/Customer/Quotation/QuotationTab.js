"use client";
import { FaFileInvoice, FaDownload, FaEye, FaCheckCircle, FaClock, FaTimes, FaExclamationTriangle, FaPrint, FaShare } from "react-icons/fa";
import { useState } from "react";

export default function QuotationTab({ 
  quotations, 
  loadingQuotations, 
  fetchUserQuotations, 
  acceptQuotation, 
  rejectQuotation,
  actionLoading 
}) {
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected, expired

  // Filter quotations based on selected filter
  const filteredQuotations = quotations.filter(quote => {
    if (filter === 'all') return true;
    return quote.status === filter;
  });

  // Sort quotations: pending first, then by creation date (newest first)
  const sortedQuotations = filteredQuotations.sort((a, b) => {
    // Pending quotes first
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    
    // Then by creation date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case 'accepted':
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      case 'expired':
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'accepted':
        return <FaCheckCircle className="text-green-500" />;
      case 'rejected':
        return <FaTimes className="text-red-500" />;
      case 'expired':
        return <FaExclamationTriangle className="text-gray-500" />;
      default:
        return <FaFileInvoice className="text-blue-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isQuotationExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const handleViewQuotation = (quotation) => {
    setSelectedQuotation(quotation);
  };

  const handleCloseModal = () => {
    setSelectedQuotation(null);
  };

  const handleDownloadPDF = (quotation) => {
    // Simulate PDF download
    console.log('Downloading PDF for quotation:', quotation.id);
    // In a real app, this would download the PDF file
    alert(`Downloading quotation ${quotation.quotationNumber} as PDF`);
  };

  const handlePrintQuotation = (quotation) => {
    // Simulate print functionality
    console.log('Printing quotation:', quotation.id);
    window.print();
  };

  const handleShareQuotation = (quotation) => {
    // Simulate share functionality
    if (navigator.share) {
      navigator.share({
        title: `Quotation ${quotation.quotationNumber}`,
        text: `Check out this quotation for ${quotation.serviceType}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Quotations</h2>
          <p className="text-gray-600 mt-1">
            Manage and review your service quotations
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchUserQuotations}
            disabled={loadingQuotations}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <FaDownload className={`mr-2 ${loadingQuotations ? 'animate-spin' : ''}`} />
            {loadingQuotations ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Quotations', count: quotations.length },
          { key: 'pending', label: 'Pending', count: quotations.filter(q => q.status === 'pending').length },
          { key: 'accepted', label: 'Accepted', count: quotations.filter(q => q.status === 'accepted').length },
          { key: 'rejected', label: 'Rejected', count: quotations.filter(q => q.status === 'rejected').length },
          { key: 'expired', label: 'Expired', count: quotations.filter(q => isQuotationExpired(q.validUntil)).length }
        ].map(filterOption => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`flex items-center px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              filter === filterOption.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{filterOption.label}</span>
            {filterOption.count > 0 && (
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                filter === filterOption.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}>
                {filterOption.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loadingQuotations ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : sortedQuotations.length === 0 ? (
        <div className="text-center py-12">
          <FaFileInvoice className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg font-medium mb-2">
            {filter === 'all' ? 'No quotations found' : `No ${filter} quotations`}
          </p>
          <p className="text-gray-500">
            {filter === 'all' 
              ? "You don't have any quotations yet. Quotations will appear here after service requests."
              : `You don't have any ${filter} quotations.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedQuotations.map((quotation) => {
            const isExpired = isQuotationExpired(quotation.validUntil);
            const actualStatus = isExpired ? 'expired' : quotation.status;
            
            return (
              <div
                key={quotation.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Quotation #{quotation.quotationNumber}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Service: <span className="font-medium">{quotation.serviceType}</span>
                    </p>
                    <p className="text-sm text-blue-600 mt-1 font-medium">
                      Created: {formatDate(quotation.createdAt)}
                    </p>
                    {isExpired && (
                      <p className="text-sm text-red-600 mt-1 font-medium">
                        Expired: {formatDate(quotation.validUntil)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(actualStatus)}
                    <span className={getStatusBadge(actualStatus)}>
                      {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(quotation.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valid Until</p>
                    <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(quotation.validUntil)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Service Duration</p>
                    <p className="font-medium text-gray-900">{quotation.estimatedDuration}</p>
                  </div>
                </div>

                {quotation.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Additional Notes</p>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{quotation.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleViewQuotation(quotation)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <FaEye className="mr-2" />
                    View Details
                  </button>
                  
                  <button
                    onClick={() => handleDownloadPDF(quotation)}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    <FaDownload className="mr-2" />
                    Download PDF
                  </button>

                  <button
                    onClick={() => handlePrintQuotation(quotation)}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    <FaPrint className="mr-2" />
                    Print
                  </button>

                  <button
                    onClick={() => handleShareQuotation(quotation)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <FaShare className="mr-2" />
                    Share
                  </button>

                  {/* Accept/Reject buttons for pending and non-expired quotations */}
                  {actualStatus === 'pending' && !isExpired && (
                    <>
                      <button
                        onClick={() => acceptQuotation(quotation.id)}
                        disabled={actionLoading === quotation.id}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm ml-auto"
                      >
                        <FaCheckCircle className="mr-2" />
                        {actionLoading === quotation.id ? "Processing..." : "Accept Quotation"}
                      </button>
                      
                      <button
                        onClick={() => rejectQuotation(quotation.id)}
                        disabled={actionLoading === quotation.id}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
                      >
                        <FaTimes className="mr-2" />
                        {actionLoading === quotation.id ? "Processing..." : "Reject Quotation"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quotation Detail Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Quotation #{selectedQuotation.quotationNumber}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Quotation details would go here */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="font-medium">{selectedQuotation.serviceType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedQuotation.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valid Until</p>
                  <p className="font-medium">{formatDate(selectedQuotation.validUntil)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Duration</p>
                  <p className="font-medium">{selectedQuotation.estimatedDuration}</p>
                </div>
              </div>

              {/* Service Items */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Service Items</h4>
                <div className="space-y-3">
                  {selectedQuotation.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedQuotation.notes && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2">Additional Notes</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedQuotation.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}