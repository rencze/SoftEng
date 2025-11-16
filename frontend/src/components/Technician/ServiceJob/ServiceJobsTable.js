"use client";

import { 
  FaEye, 
  FaUserPlus, 
  FaEdit, 
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaSyncAlt,
  FaUsers,
  FaCog
} from "react-icons/fa";

const ServiceJobsTable = ({ 
  jobs, 
  onViewDetails, 
  onAssignment, 
  onUpdateStatus,
  onJobSettings
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Job Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Service Types
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Schedule
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Technician
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
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <ServiceJobRow
                key={job.id}
                job={job}
                onViewDetails={onViewDetails}
                onAssignment={onAssignment}
                onUpdateStatus={onUpdateStatus}
                onJobSettings={onJobSettings}
              />
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                No active service jobs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const ServiceJobRow = ({ 
  job, 
  onViewDetails, 
  onAssignment, 
  onUpdateStatus,
  onJobSettings
}) => {
  // Function to truncate service types if too many
  const renderServiceTypes = (serviceTypes) => {
    if (!serviceTypes || serviceTypes.length === 0) {
      return <span className="text-gray-500 text-xs">No services</span>;
    }

    const services = Array.isArray(serviceTypes) ? serviceTypes : [serviceTypes];
    
    return (
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1">
          {services.slice(0, 2).map((service, index) => (
            <span 
              key={index}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium border border-blue-200 truncate max-w-[120px]"
            >
              {service}
            </span>
          ))}
          {services.length > 2 && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border border-gray-200">
              +{services.length - 2} more
            </span>
          )}
        </div>
        {services.length > 2 && (
          <div className="text-xs text-gray-500 mt-1">
            {services.slice(2).join(', ')}
          </div>
        )}
      </div>
    );
  };

  return (
    <tr className="hover:bg-blue-50 transition-colors group border-l-4 border-l-transparent hover:border-l-blue-500">
      <td className="px-6 py-4">
        <div className="min-w-[200px]">
          <div className="font-bold text-gray-900 text-sm">{job.jobNumber}</div>
          <div className="font-medium text-gray-900 mt-1">{job.customerName}</div>
          <div className="text-sm text-gray-500 flex items-center mt-1">
            <FaMapMarkerAlt className="mr-1 text-xs flex-shrink-0" />
            <span className="truncate">{job.address?.split(',')[0]}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 min-w-[200px] max-w-[300px]">
        {renderServiceTypes(job.serviceType)}
        {job.description && (
          <div className="text-sm text-gray-500 mt-2 line-clamp-2">
            {job.description}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">
          {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Not scheduled'}
        </div>
        {job.scheduledTime && (
          <div className="text-xs text-gray-500">
            {job.scheduledTime}
          </div>
        )}
      </td>
      <td className="px-6 py-4 min-w-[150px]">
        {job.assignedTechnicians && job.assignedTechnicians.length > 0 ? (
          <div className="space-y-1">
            {job.assignedTechnicians.slice(0, 2).map((tech, index) => (
              <div key={index} className="flex items-center">
                <span className="text-sm font-medium text-gray-900 truncate">{tech}</span>
              </div>
            ))}
            {job.assignedTechnicians.length > 2 && (
              <div className="text-xs text-gray-500">
                +{job.assignedTechnicians.length - 2} more
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-500 italic">Unassigned</span>
        )}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={job.status} />
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2 flex-wrap min-w-[200px]">
          <button
            onClick={() => onViewDetails(job)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm space-x-1 border border-blue-600 hover:border-blue-700"
          >
            <FaEye className="text-xs" />
            <span>View</span>
          </button>
          
          <button
            onClick={() => onAssignment(job)}
            className="flex items-center px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm space-x-1 border border-green-600 hover:border-green-700"
          >
            <FaUsers className="text-xs" />
            <span>Assign</span>
          </button>
          
          <button
            onClick={() => onUpdateStatus(job)}
            className="flex items-center px-3 py-2 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm space-x-1 border border-purple-600 hover:border-purple-700"
          >
            <FaSyncAlt className="text-xs" />
            <span>Status</span>
          </button>

          <button
            onClick={() => onJobSettings(job)}
            className="flex items-center px-3 py-2 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-sm space-x-1 border border-gray-600 hover:border-gray-700"
          >
            <FaCog className="text-xs" />
            <span>Settings</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Checked In":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Repair":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Testing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completion":
        return "bg-green-100 text-green-800 border-green-200";
      case "Scheduled":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "In Progress":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
};

export default ServiceJobsTable;