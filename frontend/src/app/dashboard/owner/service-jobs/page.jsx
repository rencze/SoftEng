"use client";

import { useState } from "react";
import { 
  FaSearch, 
  FaUsers, 
  FaCalendarAlt, 
  FaTools,
  FaHistory,
  FaArrowLeft,
  FaEye,
  FaCheck,
  FaTimes,
  FaClock,
  FaSync,
  FaFileAlt,
  FaUserPlus,
  FaUserMinus,
  FaEdit,
  FaCog,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from "react-icons/fa";

export default function ServiceJobOverviewPage() {
  const [serviceJobs, setServiceJobs] = useState([
    {
      id: 1,
      jobNumber: "SJ-001",
      customerName: "John Smith",
      customerPhone: "+1 (555) 123-4567",
      customerEmail: "john.smith@email.com",
      serviceType: "AC Repair",
      description: "AC not cooling properly, making strange noises",
      priority: "High",
      status: "Scheduled",
      createdAt: "2024-01-15",
      scheduledDate: "2024-01-20",
      scheduledTime: "09:00 AM",
      address: "123 Main St, Apt 4B, New York, NY 10001",
      assignedTechnician: "Mike Wilson",
      estimatedDuration: "2-3 hours",
      specialRequirements: "Need to access roof unit",
      notes: "Customer prefers morning appointment",
      workLog: [
        {
          id: 1,
          date: "2024-01-15",
          time: "10:30 AM",
          action: "Job Created",
          technician: "System",
          notes: "Service request converted to job"
        }
      ]
    },
    {
      id: 2,
      jobNumber: "SJ-002",
      customerName: "Sarah Johnson",
      customerPhone: "+1 (555) 987-6543",
      customerEmail: "sarah.j@email.com",
      serviceType: "Heating System",
      description: "Furnace not turning on, pilot light issue suspected",
      priority: "Urgent",
      status: "In Progress",
      createdAt: "2024-01-14",
      scheduledDate: "2024-01-16",
      scheduledTime: "02:00 PM",
      address: "456 Oak Avenue, Brooklyn, NY 11201",
      assignedTechnician: "Lisa Garcia",
      estimatedDuration: "1-2 hours",
      specialRequirements: "Gas line inspection needed",
      notes: "Customer available after 2 PM",
      workLog: [
        {
          id: 1,
          date: "2024-01-14",
          time: "09:15 AM",
          action: "Job Created",
          technician: "System",
          notes: "Service request converted to job"
        },
        {
          id: 2,
          date: "2024-01-16",
          time: "02:05 PM",
          action: "Work Started",
          technician: "Lisa Garcia",
          notes: "Arrived on site, beginning diagnostics"
        }
      ]
    },
    {
      id: 3,
      jobNumber: "SJ-003",
      customerName: "Robert Chen",
      customerPhone: "+1 (555) 456-7890",
      customerEmail: "r.chen@email.com",
      serviceType: "Maintenance",
      description: "Regular seasonal maintenance for HVAC system",
      priority: "Medium",
      status: "Completed",
      createdAt: "2024-01-10",
      scheduledDate: "2024-01-13",
      scheduledTime: "11:00 AM",
      address: "789 Park Lane, Queens, NY 11355",
      assignedTechnician: "David Lee",
      estimatedDuration: "1 hour",
      specialRequirements: "Filter replacement included",
      notes: "System check completed, all parts replaced",
      workLog: [
        {
          id: 1,
          date: "2024-01-10",
          time: "08:45 AM",
          action: "Job Created",
          technician: "System",
          notes: "Service request converted to job"
        },
        {
          id: 2,
          date: "2024-01-13",
          time: "11:10 AM",
          action: "Work Started",
          technician: "David Lee",
          notes: "Beginning maintenance procedure"
        },
        {
          id: 3,
          date: "2024-01-13",
          time: "12:05 PM",
          action: "Work Completed",
          technician: "David Lee",
          notes: "Maintenance completed successfully"
        }
      ]
    },
    {
      id: 4,
      jobNumber: "SJ-004",
      customerName: "Emily Davis",
      customerPhone: "+1 (555) 234-5678",
      customerEmail: "emily.davis@email.com",
      serviceType: "Emergency Repair",
      description: "No heating during cold weather, system completely down",
      priority: "Urgent",
      status: "On Hold",
      createdAt: "2024-01-15",
      scheduledDate: "2024-01-15",
      scheduledTime: "04:00 PM",
      address: "321 Elm Street, Manhattan, NY 10016",
      assignedTechnician: null,
      estimatedDuration: "3-4 hours",
      specialRequirements: "After hours service required",
      notes: "Waiting for parts delivery",
      workLog: [
        {
          id: 1,
          date: "2024-01-15",
          time: "03:20 PM",
          action: "Job Created",
          technician: "System",
          notes: "Emergency service job created"
        }
      ]
    },
    {
      id: 5,
      jobNumber: "SJ-005",
      customerName: "Michael Brown",
      customerPhone: "+1 (555) 876-5432",
      customerEmail: "m.brown@email.com",
      serviceType: "Installation",
      description: "New AC unit installation for 1500 sq ft apartment",
      priority: "Medium",
      status: "Scheduled",
      createdAt: "2024-01-12",
      scheduledDate: "2024-01-25",
      scheduledTime: "08:00 AM",
      address: "654 Pine Road, Bronx, NY 10458",
      assignedTechnician: null,
      estimatedDuration: "5-6 hours",
      specialRequirements: "Permit required for installation",
      notes: "Rescheduled due to part delivery delay",
      workLog: [
        {
          id: 1,
          date: "2024-01-12",
          time: "10:30 AM",
          action: "Job Created",
          technician: "System",
          notes: "Installation job created"
        }
      ]
    }
  ]);

  const [technicians, setTechnicians] = useState([
    { id: 1, name: "Mike Wilson", specialty: "AC Repair", status: "Available", currentJobs: 2 },
    { id: 2, name: "Lisa Garcia", specialty: "Heating Systems", status: "On Job", currentJobs: 1 },
    { id: 3, name: "David Lee", specialty: "Maintenance", status: "Available", currentJobs: 0 },
    { id: 4, name: "Tom Anderson", specialty: "Installation", status: "On Break", currentJobs: 1 },
    { id: 5, name: "Sarah Johnson", specialty: "Emergency Repair", status: "Available", currentJobs: 1 }
  ]);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);

  // Filter service jobs based on search and status
  const filteredJobs = serviceJobs.filter((job) => {
    const matchesSearch = 
      job.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      job.serviceType?.toLowerCase().includes(search.toLowerCase()) ||
      job.jobNumber?.toLowerCase().includes(search.toLowerCase()) ||
      job.address?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Summary counts
  const scheduledCount = serviceJobs.filter(j => j.status === "Scheduled").length;
  const inProgressCount = serviceJobs.filter(j => j.status === "In Progress").length;
  const completedCount = serviceJobs.filter(j => j.status === "Completed").length;
  const onHoldCount = serviceJobs.filter(j => j.status === "On Hold").length;
  const unassignedCount = serviceJobs.filter(j => !j.assignedTechnician).length;

  // Action handlers
  const handleAssignTechnician = (jobId, technicianName) => {
    setServiceJobs(prev => 
      prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              assignedTechnician: technicianName,
              workLog: [
                ...job.workLog,
                {
                  id: job.workLog.length + 1,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  action: "Technician Assigned",
                  technician: "System",
                  notes: `Assigned to ${technicianName}`
                }
              ]
            }
          : job
      )
    );
    setIsAssignModalOpen(false);
  };

  const handleUnassignTechnician = (jobId) => {
    const job = serviceJobs.find(j => j.id === jobId);
    setServiceJobs(prev => 
      prev.map(j => 
        j.id === jobId 
          ? { 
              ...j, 
              assignedTechnician: null,
              workLog: [
                ...j.workLog,
                {
                  id: j.workLog.length + 1,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  action: "Technician Unassigned",
                  technician: "System",
                  notes: `${job.assignedTechnician} unassigned from job`
                }
              ]
            }
          : j
      )
    );
  };

  const handleUpdateStatus = (jobId, newStatus, notes = "") => {
    setServiceJobs(prev => 
      prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status: newStatus,
              workLog: [
                ...job.workLog,
                {
                  id: job.workLog.length + 1,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  action: `Status Updated to ${newStatus}`,
                  technician: "System",
                  notes: notes || `Status changed to ${newStatus}`
                }
              ]
            }
          : job
      )
    );
    setIsUpdateStatusModalOpen(false);
  };

  const openDetailModal = (job) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedJob(null);
  };

  const openAssignModal = (job) => {
    setSelectedJob(job);
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
  };

  const openUpdateStatusModal = (job) => {
    setSelectedJob(job);
    setIsUpdateStatusModalOpen(true);
  };

  const closeUpdateStatusModal = () => {
    setIsUpdateStatusModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Service Job Overview</h1>
        
        <div className="flex gap-4">
          <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <FaCog className="mr-3 text-lg" />
            Job Settings
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <SummaryCard
          title="Scheduled"
          count={scheduledCount}
          icon={FaCalendarAlt}
          color="blue"
          description="Upcoming jobs"
        />

        <SummaryCard
          title="In Progress"
          count={inProgressCount}
          icon={FaTools}
          color="orange"
          description="Active jobs"
        />

        <SummaryCard
          title="Completed"
          count={completedCount}
          icon={FaCheck}
          color="green"
          description="Finished jobs"
        />

        <SummaryCard
          title="On Hold"
          count={onHoldCount}
          icon={FaClock}
          color="yellow"
          description="Waiting jobs"
        />

        <SummaryCard
          title="Unassigned"
          count={unassignedCount}
          icon={FaUserPlus}
          color="red"
          description="Need technician"
        />
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center relative flex-1 max-w-md">
          <FaSearch className="absolute left-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search service jobs by customer, job number, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          >
            <option value="All">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Service Jobs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Active Service Jobs
          </h2>
          <span className="text-sm text-gray-500">
            Showing {filteredJobs.length} of {serviceJobs.length} jobs
          </span>
        </div>

        <div className="overflow-x-auto">
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
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <ServiceJobRow
                    key={job.id}
                    job={job}
                    onViewDetails={openDetailModal}
                    onAssign={openAssignModal}
                    onUnassign={handleUnassignTechnician}
                    onUpdateStatus={openUpdateStatusModal}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No service jobs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Job Detail Modal */}
      {isDetailModalOpen && selectedJob && (
        <ServiceJobDetailModal
          job={selectedJob}
          onClose={closeDetailModal}
          onAssign={openAssignModal}
          onUnassign={handleUnassignTechnician}
          onUpdateStatus={openUpdateStatusModal}
        />
      )}

      {/* Assign Technician Modal */}
      {isAssignModalOpen && selectedJob && (
        <AssignTechnicianModal
          job={selectedJob}
          technicians={technicians}
          onClose={closeAssignModal}
          onAssign={handleAssignTechnician}
        />
      )}

      {/* Update Status Modal */}
      {isUpdateStatusModalOpen && selectedJob && (
        <UpdateStatusModal
          job={selectedJob}
          onClose={closeUpdateStatusModal}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

// Summary Card Component
const SummaryCard = ({ title, count, icon: Icon, color, description }) => {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-600",
    orange: "from-orange-400 to-amber-500",
    green: "from-green-500 to-emerald-600",
    yellow: "from-yellow-400 to-amber-500",
    red: "from-red-500 to-pink-600"
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 transform translate-x-12 -translate-y-8">
        <Icon className="text-6xl" />
      </div>
      <div className="flex items-start justify-between mb-3">
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="text-white text-lg" />
        </div>
      </div>
      <div>
        <p className="text-gray-500 font-medium text-xs mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{count}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
};

// Service Job Row Component
const ServiceJobRow = ({ 
  job, 
  onViewDetails, 
  onAssign, 
  onUnassign, 
  onUpdateStatus 
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
        <div className="text-sm font-medium text-gray-900">{job.serviceType}</div>
        <div className="text-sm text-gray-500 truncate max-w-xs">{job.description}</div>
        <PriorityBadge priority={job.priority} />
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {new Date(job.scheduledDate).toLocaleDateString()}
        </div>
        <div className="text-sm text-gray-500">{job.scheduledTime}</div>
      </td>
      <td className="px-6 py-4">
        {job.assignedTechnician ? (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{job.assignedTechnician}</span>
            <button
              onClick={() => onUnassign(job.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Unassign Technician"
            >
              <FaUserMinus className="text-sm" />
            </button>
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
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs transition flex items-center"
          >
            <FaEye className="mr-1" />
            View
          </button>
          
          {!job.assignedTechnician && (
            <button
              onClick={() => onAssign(job)}
              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs transition flex items-center"
            >
              <FaUserPlus className="mr-1" />
              Assign
            </button>
          )}
          
          <button
            onClick={() => onUpdateStatus(job)}
            className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs transition flex items-center"
          >
            <FaEdit className="mr-1" />
            Status
          </button>
        </div>
      </td>
    </tr>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityStyles(priority)}`}>
      {priority}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "In Progress":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
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

// Service Job Detail Modal Component
const ServiceJobDetailModal = ({ 
  job, 
  onClose, 
  onAssign, 
  onUnassign, 
  onUpdateStatus 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{job.jobNumber}</h2>
            <p className="text-gray-600">{job.serviceType}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-500 text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaUsers className="text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{job.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaPhone className="text-gray-400 mr-3" />
                  <p className="text-gray-900">{job.customerPhone}</p>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-gray-400 mr-3" />
                  <p className="text-gray-900">{job.customerEmail}</p>
                </div>
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-gray-400 mr-3 mt-1" />
                  <p className="text-gray-900">{job.address}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Service Type</label>
                  <p className="text-gray-900">{job.serviceType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <p><PriorityBadge priority={job.priority} /></p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p><StatusBadge status={job.status} /></p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned Technician</label>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900">{job.assignedTechnician || "Not assigned"}</p>
                    {job.assignedTechnician ? (
                      <button
                        onClick={() => onUnassign(job.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Unassign
                      </button>
                    ) : (
                      <button
                        onClick={() => onAssign(job)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900 mt-1 bg-gray-50 p-4 rounded-lg">{job.description}</p>
          </div>

          {/* Schedule Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
              <p className="text-gray-900">{new Date(job.scheduledDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Scheduled Time</label>
              <p className="text-gray-900">{job.scheduledTime}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Estimated Duration</label>
              <p className="text-gray-900">{job.estimatedDuration}</p>
            </div>
          </div>

          {/* Special Requirements */}
          {job.specialRequirements && (
            <div>
              <label className="text-sm font-medium text-gray-500">Special Requirements</label>
              <p className="text-gray-900 mt-1 bg-gray-50 p-4 rounded-lg">{job.specialRequirements}</p>
            </div>
          )}

          {/* Notes */}
          {job.notes && (
            <div>
              <label className="text-sm font-medium text-gray-500">Notes</label>
              <p className="text-gray-900 mt-1 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{job.notes}</p>
            </div>
          )}

          {/* Work Log */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Work Log</h3>
            <div className="space-y-3">
              {job.workLog.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-gray-900">{log.action}</p>
                      <span className="text-sm text-gray-500">
                        {log.date} at {log.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{log.notes}</p>
                    {log.technician && log.technician !== "System" && (
                      <p className="text-xs text-gray-500 mt-1">By {log.technician}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex gap-3">
            {!job.assignedTechnician ? (
              <button
                onClick={() => onAssign(job)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
              >
                <FaUserPlus className="mr-2" />
                Assign Technician
              </button>
            ) : (
              <button
                onClick={() => onUnassign(job.id)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
              >
                <FaUserMinus className="mr-2" />
                Unassign Technician
              </button>
            )}
          </div>
          
          <button
            onClick={() => onUpdateStatus(job)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
          >
            <FaEdit className="mr-2" />
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

// Assign Technician Modal Component
const AssignTechnicianModal = ({ job, technicians, onClose, onAssign }) => {
  const [selectedTechnician, setSelectedTechnician] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTechnician) {
      onAssign(job.id, selectedTechnician);
    }
  };

  const availableTechnicians = technicians.filter(tech => tech.status === "Available");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Assign Technician</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-500 text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Technician
            </label>
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a technician...</option>
              {availableTechnicians.map((tech) => (
                <option key={tech.id} value={tech.name}>
                  {tech.name} - {tech.specialty} ({tech.status})
                </option>
              ))}
            </select>
          </div>

          {availableTechnicians.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                No available technicians at the moment. All technicians are currently assigned or unavailable.
              </p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Job Details</h4>
            <p className="text-sm text-gray-600"><strong>Job:</strong> {job.jobNumber}</p>
            <p className="text-sm text-gray-600"><strong>Service:</strong> {job.serviceType}</p>
            <p className="text-sm text-gray-600"><strong>Priority:</strong> {job.priority}</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedTechnician}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              Assign Technician
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Update Status Modal Component
const UpdateStatusModal = ({ job, onClose, onUpdateStatus }) => {
  const [newStatus, setNewStatus] = useState(job.status);
  const [statusNotes, setStatusNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateStatus(job.id, newStatus, statusNotes);
  };

  const statusOptions = ["Scheduled", "In Progress", "On Hold", "Completed"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Update Job Status</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-500 text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Notes
            </label>
            <textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Add notes about the status change..."
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Current Job Status</h4>
            <p className="text-sm text-gray-600"><strong>Job:</strong> {job.jobNumber}</p>
            <p className="text-sm text-gray-600"><strong>Current Status:</strong> <StatusBadge status={job.status} /></p>
            <p className="text-sm text-gray-600"><strong>Technician:</strong> {job.assignedTechnician || "Not assigned"}</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};