"use client";

import { FaSort, FaEdit, FaTrash, FaCheck, FaTimes, FaEye } from "react-icons/fa";

const QuotationTable = ({
  quotations,
  sortConfig,
  onSort,
  onApprove,
  onDelete,
  onReject,
  onView 
}) => {
  const handleSort = (key) => {
    onSort(key);
  };

  const sortedQuotations = [...quotations].sort((a, b) => {
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

  const columns = [
    { label: "Quotation Details", key: "quotationNumber" },
    { label: "Customer", key: "customerName" },
    { label: "Amount", key: "totalCost" },
    { label: "Status", key: "status" },
    { label: "Date", key: "createdAt" },
    { label: "Actions", key: "actions" },
  ];

  // Helper function to get customer name
  const getCustomerName = (quotation) => {
    return quotation.displayName || quotation.customerName || 'Unknown Customer';
  };

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
          {sortedQuotations.length > 0 ? (
            sortedQuotations.map((quotation) => (
              <QuotationTableRow
                key={quotation.quotationId}
                quotation={quotation}
                onApprove={onApprove}
                onDelete={onDelete}
                onReject={onReject}
                onView={onView}  // ADD THIS LINE - Pass onView prop
                getCustomerName={getCustomerName}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="text-center py-12 text-gray-500 text-sm"
              >
                No active quotations found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// QuotationTableRow Component - UPDATED
const QuotationTableRow = ({ quotation, onApprove, onDelete, onReject, onView, getCustomerName, getCustomerEmail }) => {
  return (
    <tr className="hover:bg-gray-50 transition-all duration-200">
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
            {getCustomerName(quotation)}
          </div>
          <div className="text-sm text-gray-500">
            {getCustomerEmail(quotation)}
          </div>
          <div className="text-xs text-gray-400">
            {getCustomerPhone(quotation)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
        ₱{quotation.totalCost?.toFixed(2) || '0.00'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <QuotationStatusBadge status={quotation.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(quotation.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <QuotationActionButtons 
          quotation={quotation}
          onApprove={onApprove}
          onDelete={onDelete}
          onReject={onReject}
          onView={onView}
        />
      </td>
    </tr>
  );
};

// QuotationActionButtons Component
const QuotationActionButtons = ({ quotation, onApprove, onDelete, onReject, onView }) => {
  return (
    <div className="flex space-x-2 items-center">
      {/* Add View Button - Show for all statuses */}
      <button 
        onClick={() => onView(quotation)}
        className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm space-x-1"
        title="View Quotation"
      >
        <FaEye className="text-xs" />
        <span>View</span>
      </button>

      {/* Accept and Reject Buttons for Pending Status */}
      {quotation.status === 'Pending' && (
        <>
          <button 
            onClick={() => onApprove(quotation.quotationId)}
            className="flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm space-x-1"
            title="Accept Quotation"
          >
            <FaCheck className="text-xs" />
            <span>Accept</span>
          </button>
          <button 
            onClick={() => onReject(quotation.quotationId)}
            className="flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm space-x-1"
            title="Reject Quotation"
          >
            <FaTimes className="text-xs" />
            <span>Reject</span>
          </button>
        </>
      )}
      
      {/* Delete Button with Icon */}
      <button 
        onClick={() => onDelete(quotation.quotationId)}
        className="flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm space-x-1"
        title="Delete Quotation"
      >
        <FaTrash className="text-xs" />
        <span>Delete</span>
      </button>
    </div>
  );
};

// QuotationStatusBadge Component
const QuotationStatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
};

export default QuotationTable;