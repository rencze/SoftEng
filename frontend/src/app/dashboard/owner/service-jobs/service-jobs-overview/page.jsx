"use client";
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaCalendarAlt,
  FaUser,
  FaTools,
  FaClipboardCheck,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight,
  FaEdit,
  FaEye,
  FaUsers,
  FaChartBar,
  FaTimes,
  FaFilter,
  FaHome,
  FaList
} from "react-icons/fa";

export default function ServiceJobSystem() {
  const [currentView, setCurrentView] = useState("home");
  const [serviceJobs, setServiceJobs] = useState([
    {
      id: 1,
      jobNumber: "SJ-001",
      date: "2024-01-15",
      customerName: "John Doe",
      customerPhone: "+1-555-0001",
      customerEmail: "john@email.com",
      customerAddress: "123 Main St",
      deviceType: "Laptop",
      deviceModel: "Dell XPS 15",
      serialNumber: "ABC123",
      issueDescription: "Screen flickering",
      priority: "high",
      assignedTechnician: "tech1",
      estimatedHours: 2,
      status: "in-progress",
      jobFlow: [
        { id: 101, title: "Diagnosis", description: "Run diagnostics", estimatedDuration: "30 min", completed: true, completedAt: "2024-01-15" },
        { id: 102, title: "Replace LCD", description: "Replace the screen", estimatedDuration: "1 hour", completed: true, completedAt: "2024-01-15" },
        { id: 103, title: "Testing", description: "Test functionality", estimatedDuration: "30 min", completed: false }
      ]
    },
    {
      id: 2,
      jobNumber: "SJ-002",
      date: "2024-01-16",
      customerName: "Jane Smith",
      customerPhone: "+1-555-0002",
      customerEmail: "jane@email.com",
      customerAddress: "456 Oak Ave",
      deviceType: "iPhone",
      deviceModel: "iPhone 14",
      serialNumber: "XYZ789",
      issueDescription: "Battery drain",
      priority: "medium",
      assignedTechnician: "tech2",
      estimatedHours: 1.5,
      status: "pending",
      jobFlow: [
        { id: 201, title: "Battery Test", description: "Check battery health", estimatedDuration: "20 min", completed: false }
      ]
    }
  ]);

  const [technicians] = useState([
    { userId: "tech1", firstName: "Mike", lastName: "Johnson" },
    { userId: "tech2", firstName: "Sarah", lastName: "Williams" },
    { userId: "tech3", firstName: "Tom", lastName: "Brown" }
  ]);

  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [filterPriority, setFilterPriority] = useState("all");

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

  // Update job flow step
  const updateJobStep = (jobId, stepId, updates) => {
    setServiceJobs(prev => prev.map(job => 
      job.id === jobId
        ? {
            ...job,
            jobFlow: job.jobFlow.map(step =>
              step.id === stepId ? { ...step, ...updates } : step
            )
          }
        : job
    ));
  };

  // Update job status
  const updateJobStatus = (jobId, newStatus) => {
    setServiceJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, status: newStatus } : job
    ));
  };

  // Delete job
  const deleteJob = (jobId) => {
    setServiceJobs(prev => prev.filter(job => job.id !== jobId));
  };

  // Add new step to job
  const addStepToJob = (jobId, newStep) => {
    setServiceJobs(prev => prev.map(job =>
      job.id === jobId
        ? {
            ...job,
            jobFlow: [...job.jobFlow, { ...newStep, id: Date.now(), completed: false }]
          }
        : job
    ));
  };

  // Remove step from job
  const removeStepFromJob = (jobId, stepId) => {
    setServiceJobs(prev => prev.map(job =>
      job.id === jobId
        ? { ...job, jobFlow: job.jobFlow.filter(s => s.id !== stepId) }
        : job
    ));
  };

  // Update entire job
  const updateJob = (jobId, updates) => {
    setServiceJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, ...updates } : job
    ));
  };

  // HOME PAGE
  if (currentView === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Service Job Management</h1>
            <p className="text-blue-100 text-lg">Manage service jobs, track technicians, and monitor workflow</p>
          </div>

          {/* Main Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button
              onClick={() => setCurrentView("overview")}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl hover:scale-105 transition-all text-center"
            >
              <FaChartBar className="text-4xl text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Overview</h2>
              <p className="text-gray-600">View all service jobs</p>
            </button>

            <button
              onClick={() => setCurrentView("detail")}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl hover:scale-105 transition-all text-center"
            >
              <FaEye className="text-4xl text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Job Details</h2>
              <p className="text-gray-600">View specific job</p>
            </button>

            <button
              onClick={() => setCurrentView("technician")}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl hover:scale-105 transition-all text-center"
            >
              <FaUsers className="text-4xl text-orange-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Technician</h2>
              <p className="text-gray-600">View technician jobs</p>
            </button>

            <button
              onClick={() => setCurrentView("update")}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl hover:scale-105 transition-all text-center"
            >
              <FaEdit className="text-4xl text-purple-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Update Job</h2>
              <p className="text-gray-600">Update job flow</p>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-white border-opacity-30">
              <p className="text-blue-100 text-sm mb-2">Total Jobs</p>
              <p className="text-4xl font-bold text-white">{serviceJobs.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-white border-opacity-30">
              <p className="text-blue-100 text-sm mb-2">Pending</p>
              <p className="text-4xl font-bold text-white">{serviceJobs.filter(j => j.status === "pending").length}</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-white border-opacity-30">
              <p className="text-blue-100 text-sm mb-2">In Progress</p>
              <p className="text-4xl font-bold text-white">{serviceJobs.filter(j => j.status === "in-progress").length}</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-white border-opacity-30">
              <p className="text-blue-100 text-sm mb-2">Completed</p>
              <p className="text-4xl font-bold text-white">{serviceJobs.filter(j => j.status === "completed").length}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // OVERVIEW PAGE
  if (currentView === "overview") {
    const filteredJobs = filterPriority === "all" 
      ? serviceJobs 
      : serviceJobs.filter(j => j.priority === filterPriority);
    const totalJobs = serviceJobs.length;
    const completedJobs = serviceJobs.filter(j => j.status === "completed").length;
    const inProgressJobs = serviceJobs.filter(j => j.status === "in-progress").length;
    const pendingJobs = serviceJobs.filter(j => j.status === "pending").length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Service Jobs Overview</h1>
              <p className="text-gray-600">Manage and track all service jobs</p>
            </div>
            <button
              onClick={() => setCurrentView("home")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <FaHome /> Home
            </button>
          </div>

          {/* Stats Only - Top Section */}
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
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
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
                            onClick={() => { setSelectedJob(job); setCurrentView("detail"); }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => { setEditingJobId(job.id); setCurrentView("update"); }}
                            className="text-orange-600 hover:text-orange-800 p-1"
                            title="Update"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => deleteJob(job.id)}
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
          </div>
        </div>
      </div>
    );
  }

  // DETAIL VIEW PAGE
  if (currentView === "detail") {
    const job = selectedJob || serviceJobs[0];
    const completed = job.jobFlow.filter(s => s.completed).length;
    const progress = job.jobFlow.length > 0 ? (completed / job.jobFlow.length) * 100 : 0;
    const tech = technicians.find(t => t.userId === job.assignedTechnician);

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
              onClick={() => setCurrentView("overview")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <FaTimes /> Back
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{job.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{job.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{job.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{job.customerAddress}</p>
                  </div>
                </div>
              </div>

              {/* Device Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Device Information</h2>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Issue Description</p>
                  <p className="font-medium">{job.issueDescription}</p>
                </div>
              </div>

              {/* Job Flow */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Service Workflow</h2>
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
                          {step.estimatedDuration && <p className="text-xs text-gray-500 mt-1">⏱ {step.estimatedDuration}</p>}
                          {step.completed && <p className="text-xs text-green-600 mt-1">✓ Completed on {step.completedAt}</p>}
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
                  onChange={(e) => { updateJobStatus(job.id, e.target.value); setSelectedJob({...job, status: e.target.value}); }}
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
                <h3 className="font-semibold mb-4">Priority</h3>
                <span className={`inline-block px-4 py-2 rounded-full font-semibold border ${getPriorityColor(job.priority)}`}>
                  {job.priority}
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
              </div>

              {/* Technician Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-4">Assigned Technician</h3>
                <div className="flex items-center gap-3">
                  <FaUser className="text-blue-600 text-2xl" />
                  <div>
                    <p className="font-medium">{tech?.firstName} {tech?.lastName}</p>
                    <p className="text-xs text-gray-600">{tech?.userId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TECHNICIAN DASHBOARD PAGE
  if (currentView === "technician") {
    const techJobs = selectedTechnician 
      ? serviceJobs.filter(j => j.assignedTechnician === selectedTechnician)
      : [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Technician Dashboard</h1>
            <button
              onClick={() => setCurrentView("home")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <FaHome /> Home
            </button>
          </div>

          {/* Technician Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Technician</label>
            <select
              value={selectedTechnician || ""}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-lg w-full md:w-96"
            >
              <option value="">Choose a Technician</option>
              {technicians.map(tech => (
                <option key={tech.userId} value={tech.userId}>
                  {tech.firstName} {tech.lastName}
                </option>
              ))}
            </select>
          </div>

          {selectedTechnician && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
                  <p className="text-gray-600 text-sm">Assigned Jobs</p>
                  <p className="text-3xl font-bold text-gray-800">{techJobs.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                  <p className="text-gray-600 text-sm">Pending</p>
                  <p className="text-3xl font-bold text-gray-800">{techJobs.filter(j => j.status === "pending").length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <p className="text-gray-600 text-sm">In Progress</p>
                  <p className="text-3xl font-bold text-gray-800">{techJobs.filter(j => j.status === "in-progress").length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
                  <p className="text-gray-600 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-gray-800">{techJobs.filter(j => j.status === "completed").length}</p>
                </div>
              </div>

              {/* Jobs List */}
              <div className="space-y-4">
                {techJobs.map(job => {
                  const completed = job.jobFlow.filter(s => s.completed).length;
                  const progress = job.jobFlow.length > 0 ? (completed / job.jobFlow.length) * 100 : 0;

                  return (
                    <div key={job.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{job.jobNumber}</h3>
                          <p className="text-gray-600">{job.customerName} - {job.deviceType}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(job.priority)}`}>
                            {job.priority}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{job.issueDescription}</p>

                      {/* Job Flow Steps */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-sm mb-3">Service Steps ({completed}/{job.jobFlow.length})</h4>
                        <div className="space-y-2">
                          {job.jobFlow.map(step => (
                            <div key={step.id} className="flex items-center gap-3">
                              <button
                                onClick={() => updateJobStep(job.id, step.id, { completed: !step.completed, completedAt: !step.completed ? new Date().toISOString().split('T')[0] : null })}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${step.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'}`}
                              >
                                {step.completed && <FaCheckCircle className="text-white text-xs" />}
                              </button>
                              <span className={step.completed ? 'line-through text-gray-500' : 'text-gray-700'}>{step.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                        <span className="ml-3 text-sm font-semibold text-gray-700">{Math.round(progress)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // UPDATE SERVICE JOB PAGE
  if (currentView === "update" && editingJobId) {
    const job = serviceJobs.find(j => j.id === editingJobId);
    const [newStep, setNewStep] = useState({ title: "", description: "", estimatedDuration: "" });
    const [editJobData, setEditJobData] = useState(job);

    if (!job) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Update Service Job: {job.jobNumber}</h1>
            <button
              onClick={() => { setCurrentView("overview"); setEditingJobId(null); }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <FaTimes /> Close
            </button>
          </div>

          <div className="space-y-6">
            {/* Job Status Update */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Update Job Status</h2>
              <select
                value={editJobData.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setEditJobData({...editJobData, status: newStatus});
                  updateJobStatus(job.id, newStatus);
                }}
                className={`w-full border rounded-lg px-4 py-2 font-semibold ${getStatusColor(editJobData.status)}`}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Job Details Update */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                  <input
                    type="number"
                    value={editJobData.estimatedHours}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setEditJobData({...editJobData, estimatedHours: val});
                      updateJob(job.id, {estimatedHours: val});
                    }}
                    step="0.5"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={editJobData.priority}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditJobData({...editJobData, priority: val});
                      updateJob(job.id, {priority: val});
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Flow Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaClipboardCheck className="mr-2 text-green-600" />
                Service Job Flow
              </h2>

              {/* Add New Step */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-sm mb-3">Add New Step</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newStep.title}
                    onChange={(e) => setNewStep({...newStep, title: e.target.value})}
                    placeholder="Step title"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <textarea
                    value={newStep.description}
                    onChange={(e) => setNewStep({...newStep, description: e.target.value})}
                    placeholder="Step description"
                    rows="2"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    value={newStep.estimatedDuration}
                    onChange={(e) => setNewStep({...newStep, estimatedDuration: e.target.value})}
                    placeholder="Estimated duration (e.g., 30 min, 1 hour)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={() => {
                      if (newStep.title.trim()) {
                        addStepToJob(job.id, newStep);
                        setNewStep({title: "", description: "", estimatedDuration: ""});
                        setEditJobData({...editJobData, jobFlow: [...editJobData.jobFlow, {id: Date.now(), ...newStep, completed: false}]});
                      }
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <FaPlus /> Add Step
                  </button>
                </div>
              </div>

              {/* Existing Steps */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Current Steps</h3>
                {editJobData.jobFlow.map((step, idx) => (
                  <div key={step.id} className={`border rounded-lg p-4 ${step.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => {
                            updateJobStep(job.id, step.id, {completed: !step.completed, completedAt: !step.completed ? new Date().toISOString().split('T')[0] : null});
                            setEditJobData({
                              ...editJobData,
                              jobFlow: editJobData.jobFlow.map(s => s.id === step.id ? {...s, completed: !s.completed, completedAt: !s.completed ? new Date().toISOString().split('T')[0] : null} : s)
                            });
                          }}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${step.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'}`}
                        >
                          {step.completed && <FaCheckCircle className="text-white text-xs" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 font-mono">#{idx + 1}</span>
                            <h3 className={`font-medium ${step.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                              {step.title}
                            </h3>
                          </div>
                          {step.description && <p className="text-sm text-gray-600 mt-1">{step.description}</p>}
                          {step.estimatedDuration && <p className="text-xs text-gray-500 mt-1">⏱ {step.estimatedDuration}</p>}
                          {step.completed && <p className="text-xs text-green-600 mt-1">✓ Completed: {step.completedAt}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          removeStepFromJob(job.id, step.id);
                          setEditJobData({...editJobData, jobFlow: editJobData.jobFlow.filter(s => s.id !== step.id)});
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Changes */}
            <button
              onClick={() => { setCurrentView("overview"); setEditingJobId(null); }}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-lg font-semibold"
            >
              <FaSave /> Save All Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}