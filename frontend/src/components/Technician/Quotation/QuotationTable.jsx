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
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <div className="font-bold text-gray-900">{job.jobNumber}</div>
          <div className="font-medium text-gray-900">{job.customerName}</div>
          <div className="text-sm text-gray-500 flex items-center">
            <FaMapMarkerAlt className="mr-1 text-xs" />
            {job.address.split(',')[0]}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {Array.isArray(job.serviceType) ? (
            job.serviceType.map((service, index) => (
              <span 
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
              >
                {service}
              </span>
            ))
          ) : (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              {job.serviceType}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 truncate max-w-xs mt-1">{job.description}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {new Date(job.scheduledDate).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4">
        {job.assignedTechnicians && job.assignedTechnicians.length > 0 ? (
          <div className="space-y-1">
            {job.assignedTechnicians.map((tech, index) => (
              <div key={index} className="flex items-center">
                <span className="text-sm font-medium text-gray-900">{tech}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-500 italic">Unassigned</span>
        )}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={job.status} />
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onViewDetails(job)}
            className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm space-x-1"
          >
            <FaEye className="text-xs" />
            <span>View</span>
          </button>
          
          <button
            onClick={() => onAssignment(job)}
            className="flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm space-x-1"
          >
            <FaUsers className="text-xs" />
            <span>Assignment</span>
          </button>
          
          <button
            onClick={() => onUpdateStatus(job)}
            className="flex items-center px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm space-x-1"
          >
            <FaSyncAlt className="text-xs" />
            <span>Status</span>
          </button>

          <button
            onClick={() => onJobSettings(job)}
            className="flex items-center px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm space-x-1"
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
};

export default ServiceJobsTable;