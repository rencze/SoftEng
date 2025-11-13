"use client";

import moment from "moment";
import { FaSort } from "react-icons/fa";

const ServiceRequestHistoryTable = ({
  serviceRequests,
  sortConfig,
  onSort,
}) => {
  const handleSort = (key) => {
    onSort(key);
  };

  const sortedServiceRequests = [...serviceRequests].sort((a, b) => {
    if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;

    if (sortConfig.key === "createdAt" || sortConfig.key === "updatedAt") {
      const dateA = new Date(a[sortConfig.key]);
      const dateB = new Date(b[sortConfig.key]);
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (sortConfig.key === "status") {
      return sortConfig.direction === "asc"
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }

    const valA = a[sortConfig.key]?.toString().toLowerCase() || "";
    const valB = b[sortConfig.key]?.toString().toLowerCase() || "";

    return sortConfig.direction === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const columns = [
    { label: "Customer", key: "customerName" },
    { label: "Phone", key: "customerPhone" },
    { label: "Service Type", key: "serviceType" },
    { label: "Technician", key: "assignedTechnician" },
    { label: "Request Date", key: "createdAt" },
    { label: "Status", key: "status" },
    { label: "Notes", key: "notes" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(({ label, key }) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center">
                  {label}
                  <FaSort className="ml-1 text-gray-400" />
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {sortedServiceRequests.length > 0 ? (
            sortedServiceRequests.map((serviceRequest) => (
              <ServiceRequestHistoryTableRow
                key={serviceRequest.serviceRequestId}
                serviceRequest={serviceRequest}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                className="text-center py-12 text-gray-500 text-sm"
              >
                No service request history found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ServiceRequestHistoryTableRow Component
const ServiceRequestHistoryTableRow = ({ serviceRequest }) => {
  return (
    <tr className="hover:bg-gray-50 transition-all duration-200">
      <td className="px-6 py-4 font-medium text-gray-800">{serviceRequest.customerName}</td>
      <td className="px-6 py-4 text-gray-600">{serviceRequest.customerPhone}</td>
      <td className="px-6 py-4 text-gray-600">
        {serviceRequest.serviceType || "General Service"}
      </td>
      <td className="px-6 py-4 text-gray-600">
        {serviceRequest.assignedTechnician || "Unassigned"}
      </td>
      <td className="px-6 py-4 text-gray-600">
        {moment(serviceRequest.createdAt).format("MMM D, YYYY")}
      </td>
      <td className="px-6 py-4">
        <ServiceRequestStatusBadge status={serviceRequest.status} />
      </td>
      <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
        {serviceRequest.notes || "No notes"}
      </td>
    </tr>
  );
};

// Reuse the ServiceRequestStatusBadge component from above
const ServiceRequestStatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Converted":
        return "bg-green-100 text-green-700 border border-green-300";
      case "Cancelled":
        return "bg-red-100 text-red-700 border border-red-300";
      case "Rescheduled":
        return "bg-orange-100 text-orange-700 border border-orange-300";
      case "Completed":
        return "bg-emerald-100 text-emerald-700 border border-emerald-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
};

export default ServiceRequestHistoryTable;