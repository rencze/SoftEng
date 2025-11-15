"use client";

import { FaSort, FaEye, FaFilePdf } from "react-icons/fa";

const QuotationTableHistory = ({
  quotations,
  sortConfig,
  onSort,
  onView,
  onDownload
}) => {
  const handleSort = (key) => {
    onSort(key);
  };

  const sortedQuotations = [...quotations].sort((a, b) => {
    if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;

    if (sortConfig.key === "createdAt" || sortConfig.key === "approvedAt") {
      const dateA = new Date(a[sortConfig.key]);
      const dateB = new Date(b[sortConfig.key]);
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
    { label: "Created Date", key: "createdAt" },
    { label: "Approved Date", key: "approvedAt" },
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
              <QuotationHistoryTableRow
                key={quotation.quotationId}
                quotation={quotation}
                onView={onView}
                onDownload={onDownload}
                getCustomerName={getCustomerName}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                className="text-center py-12 text-gray-500 text-sm"
              >
                No historical quotations found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// QuotationHistoryTableRow Component
const QuotationHistoryTableRow = ({ quotation, onView, onDownload, getCustomerName }) => {
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
            {quotation.displayEmail || quotation.email || 'N/A'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
        ₱{quotation.totalCost?.toFixed(2) || '0.00'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <QuotationHistoryStatusBadge status={quotation.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(quotation.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {quotation.approvedAt 
          ? new Date(quotation.approvedAt).toLocaleDateString()
          : 'N/A'
        }
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <QuotationHistoryActionButtons 
          quotation={quotation}
          onView={onView}
          onDownload={onDownload}
        />
      </td>
    </tr>
  );
};

// QuotationHistoryActionButtons Component
const QuotationHistoryActionButtons = ({ quotation, onView, onDownload }) => {
  return (
    <div className="flex space-x-2">
      <button 
        onClick={() => onView(quotation)}
        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      >
        <FaEye />
      </button>
      
      <button 
        onClick={() => onDownload(quotation)}
        className="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-50 rounded-lg transition-colors"
        title="Download PDF"
      >
        <FaFilePdf />
      </button>
    </div>
  );
};

// QuotationHistoryStatusBadge Component
const QuotationHistoryStatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
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

export default QuotationTableHistory;