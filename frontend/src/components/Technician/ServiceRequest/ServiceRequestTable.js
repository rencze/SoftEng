
"use client";

import { useState } from "react";
import moment from "moment";
import { FaSort, FaInfoCircle, FaTools, FaBox, FaEye } from "react-icons/fa";

const ServiceRequestsTable = ({
  serviceRequests,
  sortConfig,
  onSort,
  onAccept,
  onCancel,
  onReschedule,
  onConvert,
  onReview
}) => {
  const handleSort = (key) => {
    onSort(key);
  };

  const sortedServiceRequests = [...serviceRequests].sort((a, b) => {
    if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;

    if (sortConfig.key === "createdAt" || sortConfig.key === "requestedDate") {
      const dateA = new Date(a[sortConfig.key]);
      const dateB = new Date(b[sortConfig.key]);
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (sortConfig.key === "startTime") {
      const timeA = a.startTime || "";
      const timeB = b.startTime || "";
      return sortConfig.direction === "asc"
        ? timeA.localeCompare(timeB)
        : timeB.localeCompare(timeA);
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
    { label: "Requested Date", key: "requestedDate" },
    { label: "Time", key: "startTime" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

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
          {sortedServiceRequests.length > 0 ? (
            sortedServiceRequests.map((serviceRequest) => (
              <ServiceRequestTableRow
                key={serviceRequest.serviceRequestId}
                serviceRequest={serviceRequest}
                onAccept={onAccept}
                onCancel={onCancel}
                onReschedule={onReschedule}
                onConvert={onConvert}
                onReview={onReview}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan="8"
                className="text-center py-12 text-gray-500 text-sm"
              >
                No active service requests found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ServiceRequestTableRow Component
const ServiceRequestTableRow = ({ 
  serviceRequest, 
  onAccept, 
  onCancel, 
  onReschedule, 
  onConvert, 
  onReview 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <tr className="hover:bg-gray-50 transition-all duration-200">
        <td className="px-6 py-4 font-medium text-gray-800">
          <div>
            {serviceRequest.customerName}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="ml-2 text-blue-600 hover:text-blue-800"
              title="View details"
            >
              <FaInfoCircle />
            </button>
          </div>
        </td>
        <td className="px-6 py-4 text-gray-600">{serviceRequest.customerPhone}</td>
        <td className="px-6 py-4 text-gray-600">
          <ServiceTypeBadge serviceRequest={serviceRequest} />
        </td>
        <td className="px-6 py-4 text-gray-600">
          {serviceRequest.assignedTechnician || "Unassigned"}
        </td>
        <td className="px-6 py-4 text-gray-600">
          {serviceRequest.requestedDate ? 
            moment(serviceRequest.requestedDate).format("MMM D, YYYY") : 
            "Not scheduled"
          }
        </td>
        <td className="px-6 py-4 text-gray-600">
          {serviceRequest.startTime ? 
            `${serviceRequest.startTime} - ${serviceRequest.endTime}` : 
            "Not scheduled"
          }
        </td>
        <td className="px-6 py-4">
          <ServiceRequestStatusBadge status={serviceRequest.status} />
        </td>
        <td className="px-6 py-4">
          <ServiceRequestActionButtons 
            serviceRequest={serviceRequest}
            onAccept={onAccept}
            onCancel={onCancel}
            onReschedule={onReschedule}
            onConvert={onConvert}
            onReview={onReview}
          />
        </td>
      </tr>
      
      {/* Expanded Details Row */}
      {showDetails && (
        <tr>
          <td colSpan="8" className="px-6 py-4 bg-blue-50">
            <ServiceRequestDetails serviceRequest={serviceRequest} />
          </td>
        </tr>
      )}
    </>
  );
};

// ServiceRequestDetails Component
const ServiceRequestDetails = ({ serviceRequest }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Customer Information</h4>
        <p><strong>Name:</strong> {serviceRequest.customerName}</p>
        <p><strong>Phone:</strong> {serviceRequest.customerPhone}</p>
        <p><strong>Email:</strong> {serviceRequest.customerEmail}</p>
        <p><strong>Address:</strong> {serviceRequest.address || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Service Details</h4>
        {serviceRequest.services && serviceRequest.services.length > 0 && (
          <div className="mb-2">
            <strong>Services:</strong>
            <ul className="list-disc list-inside ml-2">
              {serviceRequest.services.map((service, index) => (
                <li key={index}>
                  {service.serviceName} (Qty: {service.quantity}) - ${service.price}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {serviceRequest.servicePackages && serviceRequest.servicePackages.length > 0 && (
          <div>
            <strong>Packages:</strong>
            <ul className="list-disc list-inside ml-2">
              {serviceRequest.servicePackages.map((pkg, index) => (
                <li key={index}>
                  {pkg.packageName} (Qty: {pkg.quantity}) - ${pkg.price}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {serviceRequest.notes && (
          <p className="mt-2"><strong>Notes:</strong> {serviceRequest.notes}</p>
        )}
      </div>
    </div>
  );
};

// ServiceRequestActionButtons Component
const ServiceRequestActionButtons = ({ 
  serviceRequest, 
  onAccept, 
  onCancel, 
  onReschedule, 
  onConvert, 
  onReview 
}) => {
  // Static View handler for now
  const handleView = (serviceRequest) => {
    alert(`Viewing details for: ${serviceRequest.customerName}\nService Request ID: ${serviceRequest.serviceRequestId}\nStatus: ${serviceRequest.status}`);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {/* View button for all statuses */}
      <button
        onClick={() => handleView(serviceRequest)}
        className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs transition flex items-center"
      >
        <FaEye className="mr-1" />
        View
      </button>

      {/* Pending: Can Accept, Review, or Cancel */}
      {serviceRequest.status === "Pending" && (
        <>
          <button
            onClick={() => onAccept(serviceRequest)}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs transition"
          >
            Accept
          </button>
          <button
            onClick={() => onReview(serviceRequest)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs transition"
          >
            Review
          </button>
          <button
            onClick={() => onCancel(serviceRequest)}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs transition"
          >
            Cancel
          </button>
        </>
      )}
      
      {/* Accepted: Can Convert to Booking, Reschedule, or Cancel */}
      {serviceRequest.status === "Accepted" && (
        <>
          <button
            onClick={() => onConvert(serviceRequest)}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs transition"
          >
            Convert to Booking
          </button>
          <button
            onClick={() => onReschedule(serviceRequest)}
            className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-xs transition"
          >
            Reschedule
          </button>
          <button
            onClick={() => onCancel(serviceRequest)}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs transition"
          >
            Cancel
          </button>
        </>
      )}
      
      {/* Reviewed: Can Convert to Booking, Reschedule, or Cancel */}
      {serviceRequest.status === "Reviewed" && (
        <>
          <button
            onClick={() => onConvert(serviceRequest)}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs transition"
          >
            Convert to Booking
          </button>
          <button
            onClick={() => onReschedule(serviceRequest)}
            className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-xs transition"
          >
            Reschedule
          </button>
          <button
            onClick={() => onCancel(serviceRequest)}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs transition"
          >
            Cancel
          </button>
        </>
      )}
      
      {/* Rescheduled: Can still Cancel */}
      {serviceRequest.status === "Rescheduled" && (
        <button
          onClick={() => onCancel(serviceRequest)}
          className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs transition"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

// ServiceRequestStatusBadge Component
const ServiceRequestStatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "Accepted":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "Reviewed":
        return "bg-indigo-100 text-indigo-700 border border-indigo-300";
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

// ServiceTypeBadge Component
const ServiceTypeBadge = ({ serviceRequest }) => {
  const hasServices = serviceRequest.services && serviceRequest.services.length > 0;
  const hasPackages = serviceRequest.servicePackages && serviceRequest.servicePackages.length > 0;
  
  let type = "Custom Service";
  let icon = FaTools;
  let color = "bg-purple-100 text-purple-700 border border-purple-300";
  
  if (hasPackages) {
    type = `${serviceRequest.servicePackages.length} Package(s)`;
    icon = FaBox;
    color = "bg-indigo-100 text-indigo-700 border border-indigo-300";
  } else if (hasServices) {
    type = `${serviceRequest.services.length} Service(s)`;
    icon = FaTools;
    color = "bg-blue-100 text-blue-700 border border-blue-300";
  }
  
  const IconComponent = icon;
  
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${color}`}>
      <IconComponent className="text-xs" />
      {type}
    </span>
  );
};

export default ServiceRequestsTable;
