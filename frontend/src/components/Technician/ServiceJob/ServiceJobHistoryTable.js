"use client";

import { 
  FaEye, 
  FaMapMarkerAlt,
  FaHistory
} from "react-icons/fa";

const ServiceJobHistoryTable = ({ 
  jobs, 
  onViewDetails 
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
              Service Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Completed Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Technician
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <ServiceJobHistoryRow
                key={job.id}
                job={job}
                onViewDetails={onViewDetails}
              />
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                No service job history found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Service Job History Row Component
const ServiceJobHistoryRow = ({ 
  job, 
  onViewDetails 
}) => {
  const getCompletionDate = (job) => {
    const completionLog = job.workLog.find(log => log.action.includes("Completed"));
    return completionLog ? `${completionLog.date} at ${completionLog.time}` : job.scheduledDate;
  };

  const getCompletionStatus = (job) => {
    const completionLog = job.workLog.find(log => log.action.includes("Completed"));
    return completionLog ? "Completed Successfully" : "Completed";
  };

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
        <div className="text-sm font-medium text-gray-900">{job.serviceType}</div>
        <div className="text-sm text-gray-500 truncate max-w-xs">{job.description}</div>
        <div className="mt-1">
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
            {getCompletionStatus(job)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {new Date(job.scheduledDate).toLocaleDateString()}
        </div>
        <div className="text-sm text-gray-500">{getCompletionDate(job)}</div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-gray-900">{job.assignedTechnician || "N/A"}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-900">{job.estimatedDuration}</span>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onViewDetails(job)}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs transition flex items-center"
        >
          <FaEye className="mr-1" />
          View Details
        </button>
      </td>
    </tr>
  );
};

export default ServiceJobHistoryTable;