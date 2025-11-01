"use client";
import { useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter,
  FaChartBar,
  FaClock,
  FaTools,
  FaCheckCircle,
} from "react-icons/fa";

export default function ServiceJobList({ 
  jobs = [], 
  technicians = [], 
  onView, 
  onEdit, 
  onDelete,
  onStatusChange 
}) {
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Get status color
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

  const filteredJobs = jobs.filter(job => {
    const priorityMatch = filterPriority === "all" || job.priority === filterPriority;
    const statusMatch = filterStatus === "all" || job.status === filterStatus;
    return priorityMatch && statusMatch;
  });

  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(j => j.status === "completed").length;
  const inProgressJobs = jobs.filter(j => j.status === "in-progress").length;
  const pendingJobs = jobs.filter(j => j.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Service Jobs Overview</h1>
            <p className="text-gray-600">Manage and track all service jobs</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-800">{totalJobs}</p>
              </div>
              <FaChartBar className="text-blue-600 text-3xl opacity-30" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-gray-800">{pendingJobs}</p>
              </div>
              <FaClock className="text-yellow-500 text-3xl opacity-30" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-gray-800">{inProgressJobs}</p>
              </div>
              <FaTools className="text-blue-500 text-3xl opacity-30" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-gray-800">{completedJobs}</p>
              </div>
              <FaCheckCircle className="text-green-600 text-3xl opacity-30" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Job #</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Device</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Technician</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Progress</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => {
                const completed = job.jobFlow.filter(s => s.completed).length;
                const progress = job.jobFlow.length > 0 ? (completed / job.jobFlow.length) * 100 : 0;
                const tech = technicians.find(t => t.userId === job.assignedTechnician);

                return (
                  <tr key={job.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{job.jobNumber}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{job.customerName}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{job.deviceType}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{tech?.firstName} {tech?.lastName}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <select
                        value={job.status}
                        onChange={(e) => onStatusChange(job.id, e.target.value)}
                        className={`text-xs font-semibold border rounded-full px-3 py-1 ${getStatusColor(job.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="on-hold">On Hold</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-600">{Math.round(progress)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onView(job)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => onEdit(job)}
                          className="text-orange-600 hover:text-orange-800 p-1"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => onDelete(job.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No service jobs found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}