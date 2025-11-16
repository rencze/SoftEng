"use client";

import { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaHistory,
  FaArrowLeft,
  FaCheck,
  FaTools,
  FaSyncAlt,
  FaUserPlus,
  FaPlus
} from "react-icons/fa";
import ServiceJobsTable from "@/components/Technician/ServiceJob/ServiceJobsTable";
import ServiceJobHistoryTable from "@/components/Technician/ServiceJob/ServiceJobHistoryTable";
import CreateServiceJobModal from "@/components/Technician/ServiceJob/CreateServiceJobModal";
import ServiceJobViewModal from "@/components/Technician/ServiceJob/ServiceJobViewModal";
import ServiceAssignModal from "@/components/Technician/ServiceJob/ServiceAssignModal";
import ServiceStatusModal from "@/components/Technician/ServiceJob/ServiceStatusModal";

export default function ServiceJobOverviewPage() {
  const [serviceJobs, setServiceJobs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Load data on component mount
  useEffect(() => {
    // Fetch functions would be called here
    setLoading(false);
  }, []);

  // Filter jobs based on status
  const activeJobs = serviceJobs.filter(job => 
    ["Checked In", "Repair", "Testing"].includes(job.status)
  );

  const historyJobs = serviceJobs.filter(job => 
    ["Completion", "Completed", "Cancelled"].includes(job.status)
  );

  // Filter jobs based on search
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

  // Calculate counts
  const checkedInCount = serviceJobs.filter(j => j.status === "Checked In").length;
  const repairCount = serviceJobs.filter(j => j.status === "Repair").length;
  const testingCount = serviceJobs.filter(j => j.status === "Testing").length;
  const completionCount = serviceJobs.filter(j => ["Completion", "Completed"].includes(j.status)).length;
  const unassignedCount = serviceJobs.filter(j => !j.assignedTechnicians || j.assignedTechnicians.length === 0).length;

  // Handle technician assignment
  const handleAssignment = async (jobId, assignedTechnicians) => {
    // Assignment logic would be here
    setIsAssignmentModalOpen(false);
  };

  // Handle status update
  const handleUpdateStatus = async (jobId, newStatus, notes = "") => {
    // Status update logic would be here
    setIsUpdateStatusModalOpen(false);
  };

  // Handle creating new service job
  const handleCreateServiceJob = async (newJobData) => {
    // Create job logic would be here
    setIsCreateModalOpen(false);
  };

  // Modal handlers
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
    setSelectedJob(null);
  };

  const openUpdateStatusModal = (job) => {
    setSelectedJob(job);
    setIsUpdateStatusModalOpen(true);
  };

  const closeUpdateStatusModal = () => {
    setIsUpdateStatusModalOpen(false);
    setSelectedJob(null);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading service jobs...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {isCreateModalOpen && (
        <CreateServiceJobModal
          onClose={closeCreateModal}
          onCreate={handleCreateServiceJob}
          technicians={technicians}
        />
      )}

      {isDetailModalOpen && selectedJob && (
        <ServiceJobViewModal
          job={selectedJob}
          onClose={closeDetailModal}
        />
      )}

      {isUpdateStatusModalOpen && selectedJob && (
        <ServiceStatusModal
          job={selectedJob}
          onClose={closeUpdateStatusModal}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {isAssignmentModalOpen && selectedJob && (
        <ServiceAssignModal
          job={selectedJob}
          technicians={technicians}
          onClose={closeAssignmentModal}
          onAssignment={handleAssignment}
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