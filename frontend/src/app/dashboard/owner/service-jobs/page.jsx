"use client";

import { useState } from "react";
import { 
  FaSearch, 
  FaCalendarAlt, 
  FaTools,
  FaHistory,
  FaArrowLeft,
  FaCheck,
  FaClock,
  FaUserPlus,
  FaPlus,
  FaTimes,
  FaEye,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaInfoCircle,
  FaUsers,
  FaEdit,
  FaTrash,
  FaSyncAlt
} from "react-icons/fa";
import ServiceJobsTable from "@/components/Technician/ServiceJob/ServiceJobsTable";
import ServiceJobHistoryTable from "@/components/Technician/ServiceJob/ServiceJobHistoryTable";
import CreateServiceJobModal from "@/components/Technician/ServiceJob/CreateServiceJobModal";

export default function ServiceJobOverviewPage() {
  // Available service types
  const serviceTypes = [
    "AC Repair",
    "Heating System",
    "Maintenance",
    "Emergency Repair",
    "Installation",
    "Electrical Repair",
    "Plumbing",
    "Brake Service",
    "Oil Change",
    "Tire Replacement",
    "Battery Replacement",
    "Engine Diagnostic",
    "Transmission Repair",
    "Suspension Repair",
    "Air Conditioning Service"
  ];

  const [serviceJobs, setServiceJobs] = useState([
    {
      id: 1,
      jobNumber: "SB-0001",
      customerName: "John Smith",
      customerPhone: "+1 (555) 123-4567",
      customerEmail: "john.smith@email.com",
      serviceType: ["AC Repair", "Maintenance"],
      description: "AC not cooling properly, making strange noises. Regular maintenance check included.",
      status: "Checked In",
      createdAt: "2024-01-15",
      scheduledDate: "2024-01-20",
      address: "123 Main St, Apt 4B, New York, NY 10001",
      assignedTechnicians: ["Mike Wilson", "Lisa Garcia"],
      estimatedDuration: "2-3 hours",
      // REMOVED: specialRequirements
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
      jobNumber: "SB-0002",
      customerName: "Sarah Johnson",
      customerPhone: "+1 (555) 987-6543",
      customerEmail: "sarah.j@email.com",
      serviceType: ["Heating System", "Emergency Repair"],
      description: "Furnace not turning on, pilot light issue suspected. Emergency heating repair needed.",
      status: "Repair",
      createdAt: "2024-01-14",
      scheduledDate: "2024-01-16",
      address: "456 Oak Avenue, Brooklyn, NY 11201",
      assignedTechnicians: ["David Lee"],
      estimatedDuration: "1-2 hours",
      // REMOVED: specialRequirements
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
      jobNumber: "SB-0003",
      customerName: "Robert Chen",
      customerPhone: "+1 (555) 456-7890",
      customerEmail: "r.chen@email.com",
      serviceType: ["Maintenance", "Oil Change", "Brake Service"],
      description: "Regular seasonal maintenance for HVAC system. Includes oil change and brake inspection.",
      status: "Testing",
      createdAt: "2024-01-10",
      scheduledDate: "2024-01-13",
      address: "789 Park Lane, Queens, NY 11355",
      assignedTechnicians: ["David Lee", "Tom Anderson"],
      estimatedDuration: "3 hours",
      // REMOVED: specialRequirements
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
          action: "Status Updated to Testing",
          technician: "David Lee",
          notes: "Maintenance completed, beginning testing phase"
        }
      ]
    },
    {
      id: 4,
      jobNumber: "SB-0004",
      customerName: "Maria Garcia",
      customerPhone: "+1 (555) 234-5678",
      customerEmail: "maria.g@email.com",
      serviceType: ["Emergency Repair", "Electrical Repair"],
      description: "No cooling during heat wave, urgent repair needed. Electrical system inspection required.",
      status: "Completion",
      createdAt: "2024-01-16",
      scheduledDate: "2024-01-17",
      address: "321 Pine Street, Bronx, NY 10458",
      assignedTechnicians: [],
      estimatedDuration: "3-4 hours",
      // REMOVED: specialRequirements
      notes: "Waiting for parts delivery",
      workLog: [
        {
          id: 1,
          date: "2024-01-16",
          time: "03:20 PM",
          action: "Job Created",
          technician: "System",
          notes: "Emergency service request"
        },
        {
          id: 2,
          date: "2024-01-16",
          time: "04:15 PM",
          action: "Status Updated to Completion",
          technician: "System",
          notes: "Repair completed, finalizing documentation"
        }
      ]
    }
  ]);

  // Updated technicians without specialty and status
  const [technicians, setTechnicians] = useState([
    { id: 1, name: "Mike Wilson" },
    { id: 2, name: "Lisa Garcia" },
    { id: 3, name: "David Lee" },
    { id: 4, name: "Tom Anderson" },
    { id: 5, name: "Sarah Johnson" }
  ]);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJobSettingsModalOpen, setIsJobSettingsModalOpen] = useState(false);

  const activeJobs = serviceJobs.filter(job => 
    ["Checked In", "Repair", "Testing"].includes(job.status)
  );

  const historyJobs = serviceJobs.filter(job => 
    ["Completion"].includes(job.status)
  );

  const filteredActiveJobs = activeJobs.filter((job) => {
    const matchesSearch = 
      job.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(job.serviceType) && job.serviceType.some(service => 
        service.toLowerCase().includes(search.toLowerCase())
      )) ||
      job.jobNumber?.toLowerCase().includes(search.toLowerCase()) ||
      job.address?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredHistoryJobs = historyJobs.filter((job) => {
    const matchesSearch = 
      job.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(job.serviceType) && job.serviceType.some(service => 
        service.toLowerCase().includes(search.toLowerCase())
      )) ||
      job.jobNumber?.toLowerCase().includes(search.toLowerCase()) ||
      job.address?.toLowerCase().includes(search.toLowerCase());
    
    return matchesSearch;
  });

  const checkedInCount = serviceJobs.filter(j => j.status === "Checked In").length;
  const repairCount = serviceJobs.filter(j => j.status === "Repair").length;
  const testingCount = serviceJobs.filter(j => j.status === "Testing").length;
  const completionCount = serviceJobs.filter(j => j.status === "Completion").length;
  const unassignedCount = serviceJobs.filter(j => !j.assignedTechnicians || j.assignedTechnicians.length === 0).length;

  const handleAssignment = (jobId, assignedTechnicians) => {
    setServiceJobs(prev => 
      prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              assignedTechnicians: assignedTechnicians,
              workLog: [
                ...job.workLog,
                {
                  id: job.workLog.length + 1,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  action: "Technicians Updated",
                  technician: "System",
                  notes: `Assigned technicians: ${assignedTechnicians.join(', ')}`
                }
              ]
            }
          : job
      )
    );
    setIsAssignmentModalOpen(false);
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

  const handleCreateServiceJob = (newJobData) => {
    const newJob = {
      id: Math.max(...serviceJobs.map(j => j.id)) + 1,
      jobNumber: `SB-${String(Math.max(...serviceJobs.map(j => parseInt(j.jobNumber.split('-')[1]))) + 1).padStart(4, '0')}`,
      ...newJobData,
      status: "Checked In",
      createdAt: new Date().toISOString().split('T')[0],
      assignedTechnicians: [],
      workLog: [
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: "Job Created",
          technician: "System",
          notes: "New service job created"
        }
      ]
    };
    
    setServiceJobs(prev => [newJob, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleUpdateJobSettings = (jobId, updatedData) => {
    setServiceJobs(prev => 
      prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              ...updatedData,
              workLog: [
                ...job.workLog,
                {
                  id: job.workLog.length + 1,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  action: "Job Details Updated",
                  technician: "System",
                  notes: "Job settings modified"
                }
              ]
            }
          : job
      )
    );
    setIsJobSettingsModalOpen(false);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm("Are you sure you want to delete this service job? This action cannot be undone.")) {
      setServiceJobs(prev => prev.filter(job => job.id !== jobId));
      setIsJobSettingsModalOpen(false);
    }
  };

  const openDetailModal = (job) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedJob(null);
  };

  const openAssignmentModal = (job) => {
    setSelectedJob(job);
    setIsAssignmentModalOpen(true);
  };

  const closeAssignmentModal = () => {
    setIsAssignmentModalOpen(false);
  };

  const openUpdateStatusModal = (job) => {
    setSelectedJob(job);
    setIsUpdateStatusModalOpen(true);
  };

  const closeUpdateStatusModal = () => {
    setIsUpdateStatusModalOpen(false);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const openJobSettingsModal = (job) => {
    setSelectedJob(job);
    setIsJobSettingsModalOpen(true);
  };

  const closeJobSettingsModal = () => {
    setIsJobSettingsModalOpen(false);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {isCreateModalOpen && (
        <CreateServiceJobModal
          onClose={closeCreateModal}
          onCreate={handleCreateServiceJob}
          technicians={technicians}
          serviceTypes={serviceTypes}
        />
      )}

      {isDetailModalOpen && selectedJob && (
        <ViewJobDetailsModal
          job={selectedJob}
          onClose={closeDetailModal}
        />
      )}

      {isUpdateStatusModalOpen && selectedJob && (
        <UpdateJobStatusModal
          job={selectedJob}
          onClose={closeUpdateStatusModal}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {isAssignmentModalOpen && selectedJob && (
        <AssignmentModal
          job={selectedJob}
          technicians={technicians}
          onClose={closeAssignmentModal}
          onAssignment={handleAssignment}
        />
      )}

      {isJobSettingsModalOpen && selectedJob && (
        <JobSettingsModal
          job={selectedJob}
          onClose={closeJobSettingsModal}
          onUpdate={handleUpdateJobSettings}
          onDelete={handleDeleteJob}
          serviceTypes={serviceTypes}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {showHistory ? "Service Job History" : "Service Job Overview"}
        </h1>
        
        <div className="flex gap-4">
          {!showHistory && (
            <button
              onClick={openCreateModal}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <FaPlus className="mr-3 text-lg" />
              Create Service Job
            </button>
          )}
          
          {!showHistory ? (
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
            >
              <FaHistory className="mr-3 text-lg" />
              View Job History ({historyJobs.length})
            </button>
          ) : (
            <button
              onClick={() => setShowHistory(false)}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FaArrowLeft className="mr-3 text-lg" />
              Back to Active Jobs
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <SummaryCard
          title="Checked In"
          count={checkedInCount}
          icon={FaCheck}
          color="blue"
          description="New jobs"
        />

        <SummaryCard
          title="Repair"
          count={repairCount}
          icon={FaTools}
          color="orange"
          description="In repair"
        />

        <SummaryCard
          title="Testing"
          count={testingCount}
          icon={FaSyncAlt}
          color="yellow"
          description="Under testing"
        />

        <SummaryCard
          title="Completion"
          count={completionCount}
          icon={FaCheck}
          color="green"
          description="Completed jobs"
        />

        <SummaryCard
          title="Unassigned"
          count={unassignedCount}
          icon={FaUserPlus}
          color="red"
          description="Need technician"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center relative flex-1 max-w-md">
          <FaSearch className="absolute left-4 text-gray-400" />
          <input
            type="text"
            placeholder={
              showHistory 
                ? "Search job history by customer, job number, service type, or address..." 
                : "Search service jobs by customer, job number, service type, or address..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        
        {!showHistory && (
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="All">All Status</option>
              <option value="Checked In">Checked In</option>
              <option value="Repair">Repair</option>
              <option value="Testing">Testing</option>
            </select>
          </div>
        )}
      </div>

      {!showHistory && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Active Service Jobs</h2>
            <span className="text-sm text-gray-500">
              Showing {filteredActiveJobs.length} of {activeJobs.length} jobs
            </span>
          </div>

          <ServiceJobsTable
            jobs={filteredActiveJobs}
            onViewDetails={openDetailModal}
            onAssignment={openAssignmentModal}
            onUpdateStatus={openUpdateStatusModal}
            onJobSettings={openJobSettingsModal}
          />
        </div>
      )}

      {showHistory && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FaHistory className="mr-3 text-green-600" />
              Service Job History
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredHistoryJobs.length} of {historyJobs.length} completed jobs
            </span>
          </div>

          <ServiceJobHistoryTable
            jobs={filteredHistoryJobs}
            onViewDetails={openDetailModal}
          />
        </div>
      )}
    </div>
  );
}

const ViewJobDetailsModal = ({ job, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Service Job Details</h2>
              <p className="text-blue-100">{job.jobNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-2"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                Customer Information
              </h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {job.customerName}</p>
                <p className="flex items-center">
                  <FaPhone className="mr-2 text-gray-400" />
                  <strong>Phone:</strong> {job.customerPhone}
                </p>
                <p className="flex items-center">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  <strong>Email:</strong> {job.customerEmail}
                </p>
                <p className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-gray-400" />
                  <strong>Address:</strong> {job.address}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FaInfoCircle className="mr-2 text-blue-600" />
                Job Details
              </h3>
              <div className="space-y-2">
                <p><strong>Service Types:</strong></p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Array.isArray(job.serviceType) ? (
                    job.serviceType.map((service, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {service}
                      </span>
                    ))
                  ) : (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {job.serviceType}
                    </span>
                  )}
                </div>
                <p className="mt-3"><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    job.status === 'Checked In' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'Repair' ? 'bg-orange-100 text-orange-800' :
                    job.status === 'Testing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {job.status}
                  </span>
                </p>
                <p>
                  <strong>Assigned Technicians:</strong> 
                  {job.assignedTechnicians && job.assignedTechnicians.length > 0 ? (
                    <div className="mt-1 space-y-1">
                      {job.assignedTechnicians.map((tech, index) => (
                        <span key={index} className="block bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="ml-2 text-gray-500 italic">Unassigned</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2">Service Description</h3>
            <p className="text-gray-700">{job.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Schedule</h3>
              <div className="space-y-2">
                <p><strong>Date:</strong> {new Date(job.scheduledDate).toLocaleDateString()}</p>
                <p><strong>Estimated Duration:</strong> {job.estimatedDuration}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
              <div className="space-y-2">
                {/* REMOVED: Special Requirements section */}
                {job.notes && (
                  <p><strong>Notes:</strong> {job.notes}</p>
                )}
              </div>
            </div>
          </div>

          {job.workLog && job.workLog.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Work Log</h3>
              <div className="space-y-3">
                {job.workLog.map((log) => (
                  <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{log.action}</p>
                        <p className="text-sm text-gray-600">{log.notes}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{new Date(log.date).toLocaleDateString()}</p>
                        <p>{log.time}</p>
                        <p className="text-xs">{log.technician}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UpdateJobStatusModal = ({ job, onClose, onUpdateStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState(job.status);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    onUpdateStatus(job.id, selectedStatus, notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Update Job Status</h2>
              <p className="text-blue-100">{job.jobNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-2"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Checked In">Checked In</option>
                <option value="Repair">Repair</option>
                <option value="Testing">Testing</option>
                <option value="Completion">Completion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                placeholder="Add any notes about the status change..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaCheck className="mr-2" />
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssignmentModal = ({ job, technicians, onClose, onAssignment }) => {
  const [assignedTechnicians, setAssignedTechnicians] = useState(job.assignedTechnicians || []);

  const handleTechnicianToggle = (technicianName) => {
    setAssignedTechnicians(prev => 
      prev.includes(technicianName)
        ? prev.filter(tech => tech !== technicianName)
        : [...prev, technicianName]
    );
  };

  const handleSubmit = () => {
    onAssignment(job.id, assignedTechnicians);
  };

  const availableTechnicians = technicians.filter(tech => 
    !assignedTechnicians.includes(tech.name)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Manage Technician Assignment</h2>
              <p className="text-blue-100">{job.jobNumber}</p>
              <p className="text-blue-100 text-sm mt-1">
                Services: {Array.isArray(job.serviceType) ? job.serviceType.join(', ') : job.serviceType}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-2"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <FaInfoCircle className="mr-2" />
                Job Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Customer:</strong> {job.customerName}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    job.status === 'Checked In' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'Repair' ? 'bg-orange-100 text-orange-800' :
                    job.status === 'Testing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {job.status}
                  </span>
                </p>
                <p><strong>Schedule:</strong> {new Date(job.scheduledDate).toLocaleDateString()}</p>
                <p><strong>Duration:</strong> {job.estimatedDuration}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                <FaUsers className="mr-2 text-blue-600" />
                Currently Assigned Technicians ({assignedTechnicians.length})
              </h4>
              
              {assignedTechnicians.length > 0 ? (
                <div className="space-y-2">
                  {assignedTechnicians.map((techName) => (
                    <div
                      key={techName}
                      className="border border-green-200 bg-green-50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div>
                          <p className="font-semibold text-gray-900">{techName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTechnicianToggle(techName)}
                        className="flex items-center px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors space-x-1"
                      >
                        <FaTimes className="text-xs" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <FaUsers className="text-3xl text-gray-300 mx-auto mb-2" />
                  <p>No technicians assigned</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                <FaUserPlus className="mr-2 text-blue-600" />
                Available Technicians ({availableTechnicians.length})
              </h4>
              
              {availableTechnicians.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {availableTechnicians.map((tech) => (
                    <div
                      key={tech.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        assignedTechnicians.includes(tech.name)
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTechnicianToggle(tech.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div>
                            <p className="font-semibold text-gray-900">{tech.name}</p>
                          </div>
                        </div>
                      </div>
                      {assignedTechnicians.includes(tech.name) && (
                        <div className="mt-2 flex items-center text-blue-600 text-sm">
                          <FaCheck className="mr-1" />
                          Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <FaUsers className="text-3xl text-gray-300 mx-auto mb-2" />
                  <p>No available technicians</p>
                </div>
              )}
            </div>

            {assignedTechnicians.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 font-medium">
                  <FaUsers className="inline mr-2" />
                  {assignedTechnicians.length} technician(s) will be assigned
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {assignedTechnicians.join(', ')}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaUserPlus className="mr-2" />
              Save Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobSettingsModal = ({ job, onClose, onUpdate, onDelete, serviceTypes }) => {
  const [formData, setFormData] = useState({
    customerName: job.customerName,
    customerPhone: job.customerPhone,
    customerEmail: job.customerEmail,
    serviceType: Array.isArray(job.serviceType) ? job.serviceType : [job.serviceType],
    description: job.description,
    scheduledDate: job.scheduledDate,
    address: job.address,
    estimatedDuration: job.estimatedDuration,
    // REMOVED: specialRequirements
    notes: job.notes || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceTypeChange = (service) => {
    setFormData(prev => {
      const currentServices = Array.isArray(prev.serviceType) ? prev.serviceType : [prev.serviceType];
      const updatedServices = currentServices.includes(service)
        ? currentServices.filter(s => s !== service)
        : [...currentServices, service];
      
      return {
        ...prev,
        serviceType: updatedServices
      };
    });
  };

  const handleSubmit = () => {
    onUpdate(job.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Job Settings</h2>
              <p className="text-purple-100">{job.jobNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors p-2"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Customer Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Phone
                </label>
                <input
                  type="text"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Job Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Types
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  <div className="grid grid-cols-1 gap-2">
                    {serviceTypes.map((service) => (
                      <label key={service} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.serviceType.includes(service)}
                          onChange={() => handleServiceTypeChange(service)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {formData.serviceType.length} service(s)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleChange}
                  placeholder="e.g., 2-3 hours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Additional Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                placeholder="Additional notes or customer preferences..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-red-800">Delete this job</h4>
                  <p className="text-sm text-red-600 mt-1">
                    Once you delete a job, there is no going back. Please be certain.
                  </p>
                </div>
                <button
                  onClick={() => onDelete(job.id)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FaTrash className="mr-2" />
                  Delete Job
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaCheck className="mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};