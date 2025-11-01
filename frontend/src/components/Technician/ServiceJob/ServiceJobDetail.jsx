"use client";
import {
  FaUser,
  FaTools,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClipboardCheck,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function ServiceJobDetail({ job, technicians = [], onBack, onStatusChange }) {
  if (!job) return null;

  const completed = job.jobFlow.filter(s => s.completed).length;
  const progress = job.jobFlow.length > 0 ? (completed / job.jobFlow.length) * 100 : 0;
  const tech = technicians.find(t => t.userId === job.assignedTechnician);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-gray-100 text-gray-700 border-gray-200";
      case "in-progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      case "on-hold": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-700 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "high": return "bg-orange-100 text-orange-700 border-orange-200";
      case "urgent": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{job.jobNumber}</h1>
            <p className="text-gray-600">{job.customerName}</p>
          </div>
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to List
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <FaUser className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{job.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{job.customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{job.customerEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{job.customerAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaTools className="mr-2 text-green-600" />
                Device Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Device Type</p>
                  <p className="font-medium">{job.deviceType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-medium">{job.deviceModel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Serial Number</p>
                  <p className="font-medium">{job.serialNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    {job.date}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Issue Description</p>
                <p className="font-medium mt-1 p-3 bg-gray-50 rounded-lg">{job.issueDescription}</p>
              </div>
            </div>

            {/* Job Flow */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaClipboardCheck className="mr-2 text-purple-600" />
                Service Workflow
              </h2>
              <div className="space-y-3">
                {job.jobFlow.map((step, idx) => (
                  <div key={step.id} className={`border rounded-lg p-4 ${step.completed ? 'bg-green-50 border-green-200' : 'border-gray-200'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${step.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                        {step.completed && <FaCheckCircle className="text-white text-sm" />}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${step.completed ? 'line-through text-green-700' : 'text-gray-900'}`}>
                          Step {idx + 1}: {step.title}
                        </h3>
                        {step.description && <p className="text-sm text-gray-600 mt-1">{step.description}</p>}
                        {step.estimatedDuration && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <FaClock /> {step.estimatedDuration}
                          </p>
                        )}
                        {step.completed && step.completedAt && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <FaCheckCircle /> Completed on {new Date(step.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Job Status</h3>
              <select
                value={job.status}
                onChange={(e) => onStatusChange(job.id, e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 font-semibold ${getStatusColor(job.status)}`}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FaExclamationTriangle className="text-orange-500" />
                Priority
              </h3>
              <span className={`inline-block px-4 py-2 rounded-full font-semibold border ${getPriorityColor(job.priority)}`}>
                {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
              </span>
            </div>

            {/* Progress Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Progress</h3>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-gray-800">{Math.round(progress)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">{completed} of {job.jobFlow.length} steps completed</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Time:</span>
                  <span className="font-medium">{job.estimatedHours} hours</span>
                </div>
              </div>
            </div>

            {/* Technician Card */}
            {tech && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-4">Assigned Technician</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{tech.firstName} {tech.lastName}</p>
                    <p className="text-xs text-gray-600">{tech.userId}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}