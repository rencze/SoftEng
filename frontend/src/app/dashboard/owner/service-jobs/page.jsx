"use client";
import { useState, useEffect } from "react";
import ServiceJobForm from "@/components/Technician/ServiceJob/ServiceJobForm";
import ServiceJobList from "@/components/Technician/ServiceJob/ServiceJobList";
import ServiceJobDetail from "@/components/Technician/ServiceJob/ServiceJobDetail";
import {
  FaPlus,
} from "react-icons/fa";

const API_BASE = "http://localhost:3001";

export default function ServiceJobsPage() {
  const [currentView, setCurrentView] = useState("list"); // "list", "create", "edit", "detail"
  const [serviceJobs, setServiceJobs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchServiceJobs();
    fetchTechnicians();
  }, []);

  const fetchServiceJobs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/service-jobs`);
      if (response.ok) {
        const data = await response.json();
        setServiceJobs(data);
      }
    } catch (error) {
      console.error("Error fetching service jobs:", error);
      // Fallback sample data
      setServiceJobs([
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
          issueDescription: "Screen flickering and battery issues",
          priority: "high",
          assignedTechnician: "tech1",
          estimatedHours: 2,
          status: "in-progress",
          jobFlow: [
            { id: 101, title: "Initial Diagnosis", description: "Run comprehensive diagnostics", estimatedDuration: "30 min", completed: true, completedAt: "2024-01-15T10:30:00" },
            { id: 102, title: "Replace LCD Screen", description: "Install new display panel", estimatedDuration: "1 hour", completed: true, completedAt: "2024-01-15T11:45:00" },
            { id: 103, title: "Battery Replacement", description: "Install new battery pack", estimatedDuration: "30 min", completed: false },
            { id: 104, title: "Final Testing", description: "Test all functionality", estimatedDuration: "30 min", completed: false }
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
          deviceModel: "iPhone 14 Pro",
          serialNumber: "XYZ789",
          issueDescription: "Battery drain and charging port issues",
          priority: "medium",
          assignedTechnician: "tech2",
          estimatedHours: 1.5,
          status: "pending",
          jobFlow: [
            { id: 201, title: "Battery Health Check", description: "Check battery capacity and health", estimatedDuration: "20 min", completed: false },
            { id: 202, title: "Charging Port Cleaning", description: "Clean and inspect charging port", estimatedDuration: "15 min", completed: false }
          ]
        }
      ]);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/users?role=Technician`);
      if (response.ok) {
        const data = await response.json();
        setTechnicians(data);
      }
    } catch (error) {
      console.error("Error fetching technicians:", error);
      // Fallback sample data
      setTechnicians([
        { userId: "tech1", firstName: "Mike", lastName: "Johnson", role: "Technician" },
        { userId: "tech2", firstName: "Sarah", lastName: "Williams", role: "Technician" },
        { userId: "tech3", firstName: "Tom", lastName: "Brown", role: "Technician" }
      ]);
    }
  };

  // Handle saving a service job (create or update)
  const handleSaveServiceJob = async (jobData) => {
    try {
      const method = jobData.id ? "PUT" : "POST";
      const url = jobData.id ? `${API_BASE}/api/service-jobs/${jobData.id}` : `${API_BASE}/api/service-jobs`;
      
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...jobData,
          status: jobData.status || "pending",
          createdAt: jobData.createdAt || new Date().toISOString()
        })
      });

      if (response.ok) {
        const savedJob = await response.json();
        
        if (jobData.id) {
          // Update existing job
          setServiceJobs(prev => prev.map(job => job.id === jobData.id ? savedJob : job));
        } else {
          // Add new job
          setServiceJobs(prev => [...prev, { ...savedJob, id: Date.now() }]);
        }
        
        setCurrentView("list");
        alert(`Service job ${jobData.id ? 'updated' : 'created'} successfully!`);
      } else {
        throw new Error("Failed to save service job");
      }
    } catch (error) {
      console.error("Error saving service job:", error);
      alert("Error saving service job. Please try again.");
    }
  };

  // Handle job status change
  const handleStatusChange = (jobId, newStatus) => {
    setServiceJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, status: newStatus } : job
    ));
  };

  // Handle job deletion
  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this service job?")) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/service-jobs/${jobId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setServiceJobs(prev => prev.filter(job => job.id !== jobId));
        alert("Service job deleted successfully!");
      } else {
        throw new Error("Failed to delete service job");
      }
    } catch (error) {
      console.error("Error deleting service job:", error);
      alert("Error deleting service job. Please try again.");
    }
  };

  // Navigation handlers
  const handleCreateNew = () => {
    setEditingJob(null);
    setCurrentView("create");
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setCurrentView("detail");
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedJob(null);
    setEditingJob(null);
  };

  // Render appropriate view
  const renderCurrentView = () => {
    switch (currentView) {
      case "create":
      case "edit":
        return (
          <ServiceJobForm
            onSave={handleSaveServiceJob}
            initialData={editingJob}
            technicians={technicians}
            onCancel={handleBackToList}
          />
        );
      
      case "detail":
        return (
          <ServiceJobDetail
            job={selectedJob}
            technicians={technicians}
            onBack={handleBackToList}
            onStatusChange={handleStatusChange}
          />
        );
      
      case "list":
      default:
        return (
          <div>
            {/* Header with Actions */}
            <div className="flex justify-between items-center mb-6 p-6 bg-white rounded-lg shadow">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Service Jobs</h1>
                <p className="text-gray-600">Manage all service jobs in one place</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateNew}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="mr-2" />
                  New Service Job
                </button>
              </div>
            </div>

            <ServiceJobList
              jobs={serviceJobs}
              technicians={technicians}
              onView={handleViewJob}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
              onStatusChange={handleStatusChange}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {renderCurrentView()}
      </div>
    </div>
  );
}




// "use client";
// import { useState, useEffect } from "react";
// import {
//   FaPlus,
//   FaTrash,
//   FaSave,
//   FaCalendarAlt,
//   FaUser,
//   FaTools,
//   FaClipboardCheck,
//   FaClock,
//   FaExclamationTriangle,
//   FaCheckCircle,
//   FaArrowRight
// } from "react-icons/fa";

// export default function CreateServiceJobPage() {
//   const [serviceJob, setServiceJob] = useState({
//     jobNumber: "",
//     date: new Date().toISOString().split('T')[0],
//     customerName: "",
//     customerPhone: "",
//     customerEmail: "",
//     customerAddress: "",
//     deviceType: "",
//     deviceModel: "",
//     serialNumber: "",
//     issueDescription: "",
//     priority: "medium",
//     assignedTechnician: "",
//     estimatedHours: 1,
//     jobFlow: []
//   });

//   const [newStep, setNewStep] = useState({
//     title: "",
//     description: "",
//     estimatedDuration: "",
//     status: "pending"
//   });

//   // Available technicians
//   const [technicians, setTechnicians] = useState([]);

//   useEffect(() => {
//     // Fetch technicians
//     fetch("http://localhost:3001/api/users?role=Technician")
//       .then(res => res.json())
//       .then(data => setTechnicians(data))
//       .catch(err => console.error("Error fetching technicians:", err));
//   }, []);

//   // Add step to job flow
//   const addStep = () => {
//     if (!newStep.title) {
//       alert("Please enter a step title");
//       return;
//     }

//     setServiceJob(prev => ({
//       ...prev,
//       jobFlow: [...prev.jobFlow, { 
//         ...newStep, 
//         id: Date.now(),
//         completed: false,
//         completedAt: null
//       }]
//     }));

//     setNewStep({
//       title: "",
//       description: "",
//       estimatedDuration: "",
//       status: "pending"
//     });
//   };

//   // Remove step
//   const removeStep = (id) => {
//     setServiceJob(prev => ({
//       ...prev,
//       jobFlow: prev.jobFlow.filter(step => step.id !== id)
//     }));
//   };

//   // Toggle step completion
//   const toggleStepCompletion = (id) => {
//     setServiceJob(prev => ({
//       ...prev,
//       jobFlow: prev.jobFlow.map(step => 
//         step.id === id 
//           ? { 
//               ...step, 
//               completed: !step.completed,
//               completedAt: !step.completed ? new Date().toISOString() : null
//             } 
//           : step
//       )
//     }));
//   };

//   // Handle service job field changes
//   const handleServiceJobChange = (e) => {
//     const { name, value } = e.target;
//     setServiceJob(prev => ({ ...prev, [name]: value }));
//   };

//   // Handle step field changes
//   const handleStepChange = (e) => {
//     const { name, value } = e.target;
//     setNewStep(prev => ({ ...prev, [name]: value }));
//   };

//   // Save service job
//   const saveServiceJob = async () => {
//     if (!serviceJob.customerName || !serviceJob.deviceType || !serviceJob.issueDescription) {
//       alert("Please fill required fields: Customer Name, Device Type, and Issue Description");
//       return;
//     }

//     try {
//       const res = await fetch("http://localhost:3001/api/service-jobs", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...serviceJob,
//           status: "new",
//           createdAt: new Date().toISOString()
//         })
//       });

//       if (res.ok) {
//         alert("Service job created successfully!");
//         // Reset form or redirect
//       } else {
//         alert("Failed to create service job");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error creating service job");
//     }
//   };

//   // Priority colors
//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case "low": return "bg-green-100 text-green-700 border-green-200";
//       case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
//       case "high": return "bg-orange-100 text-orange-700 border-orange-200";
//       case "urgent": return "bg-red-100 text-red-700 border-red-200";
//       default: return "bg-gray-100 text-gray-700 border-gray-200";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
//               Create Service Job
//             </h1>
//             <p className="text-gray-600 flex items-center">
//               <FaTools className="mr-2" />
//               Create a new service job with workflow steps
//             </p>
//           </div>
//           <div className="flex space-x-3">
//             <button 
//               onClick={saveServiceJob}
//               className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
//             >
//               <FaSave className="mr-2" />
//               Save Job
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Job Details - Top Section */}
//         <div className="lg:col-span-3">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-xl font-semibold mb-4 flex items-center">
//               <FaUser className="mr-2 text-blue-600" />
//               Job & Customer Details
//             </h2>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Job Number
//                 </label>
//                 <input
//                   type="text"
//                   name="jobNumber"
//                   value={serviceJob.jobNumber}
//                   onChange={handleServiceJobChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="SJ-001"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
//                   <FaCalendarAlt className="mr-1" />
//                   Date
//                 </label>
//                 <input
//                   type="date"
//                   name="date"
//                   value={serviceJob.date}
//                   onChange={handleServiceJobChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Priority
//                 </label>
//                 <select
//                   name="priority"
//                   value={serviceJob.priority}
//                   onChange={handleServiceJobChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="low">Low</option>
//                   <option value="medium">Medium</option>
//                   <option value="high">High</option>
//                   <option value="urgent">Urgent</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Customer Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="customerName"
//                   value={serviceJob.customerName}
//                   onChange={handleServiceJobChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="John Doe"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone
//                 </label>
//                 <input
//                   type="tel"
//                   name="customerPhone"
//                   value={serviceJob.customerPhone}
//                   onChange={handleServiceJobChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="+1 (555) 000-0000"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   name="customerEmail"
//                   value={serviceJob.customerEmail}
//                   onChange={handleServiceJobChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="customer@email.com"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Device Type *
//                 </label>
//                 <input
//                   type="text"
//                   name="deviceType"
//                   value={serviceJob.deviceType}
//                   onChange={handleServiceJobChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Laptop, Phone, Tablet, etc."
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Device Model
//                 </label>
//                 <input
//                   type="text"
//                   name="deviceModel"
//                   value={serviceJob.deviceModel}
//                   onChange={handleServiceJobChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Model number"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Serial Number
//                 </label>
//                 <input
//                   type="text"
//                   name="serialNumber"
//                   value={serviceJob.serialNumber}
//                   onChange={handleServiceJobChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Serial number"
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Assigned Technician
//                 </label>
//                 <select
//                   name="assignedTechnician"
//                   value={serviceJob.assignedTechnician}
//                   onChange={handleServiceJobChange}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Select Technician</option>
//                   {technicians.map(tech => (
//                     <option key={tech.userId} value={tech.userId}>
//                       {tech.firstName} {tech.lastName}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
//                   <FaClock className="mr-1" />
//                   Estimated Hours
//                 </label>
//                 <input
//                   type="number"
//                   name="estimatedHours"
//                   value={serviceJob.estimatedHours}
//                   onChange={handleServiceJobChange}
//                   min="0.5"
//                   step="0.5"
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div className="md:col-span-3">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Issue Description *
//                 </label>
//                 <textarea
//                   name="issueDescription"
//                   value={serviceJob.issueDescription}
//                   onChange={handleServiceJobChange}
//                   rows={3}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Describe the issue in detail..."
//                   required
//                 />
//               </div>

//               <div className="md:col-span-3">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Customer Address
//                 </label>
//                 <textarea
//                   name="customerAddress"
//                   value={serviceJob.customerAddress}
//                   onChange={handleServiceJobChange}
//                   rows={2}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Service address if different..."
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Job Flow Section - Bottom */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-xl font-semibold mb-4 flex items-center">
//               <FaClipboardCheck className="mr-2 text-green-600" />
//               Service Job Flow
//             </h2>

//             {/* Add Step Form */}
//             <div className="bg-gray-50 rounded-lg p-4 mb-6">
//               <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
//                 <div className="md:col-span-4">
//                   <input
//                     type="text"
//                     name="title"
//                     value={newStep.title}
//                     onChange={handleStepChange}
//                     placeholder="Step title"
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
//                   />
//                 </div>
//                 <div className="md:col-span-5">
//                   <input
//                     type="text"
//                     name="description"
//                     value={newStep.description}
//                     onChange={handleStepChange}
//                     placeholder="Step description"
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
//                   />
//                 </div>
//                 <div className="md:col-span-2">
//                   <input
//                     type="text"
//                     name="estimatedDuration"
//                     value={newStep.estimatedDuration}
//                     onChange={handleStepChange}
//                     placeholder="Duration"
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
//                   />
//                 </div>
//                 <div className="md:col-span-1">
//                   <button
//                     onClick={addStep}
//                     className="w-full bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition-colors"
//                   >
//                     <FaPlus />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Job Flow Steps */}
//             <div className="space-y-4">
//               {serviceJob.jobFlow.map((step, index) => (
//                 <div 
//                   key={step.id} 
//                   className={`border rounded-lg p-4 transition-all ${
//                     step.completed 
//                       ? 'bg-green-50 border-green-200' 
//                       : 'bg-white border-gray-200'
//                   }`}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex items-start space-x-3 flex-1">
//                       <button
//                         onClick={() => toggleStepCompletion(step.id)}
//                         className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
//                           step.completed
//                             ? 'bg-green-500 border-green-500 text-white'
//                             : 'border-gray-300 hover:border-green-500'
//                         }`}
//                       >
//                         {step.completed && <FaCheckCircle className="w-3 h-3" />}
//                       </button>
                      
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-2">
//                           <span className="text-sm text-gray-500 font-mono">#{index + 1}</span>
//                           <h3 className={`font-medium ${
//                             step.completed ? 'text-green-700 line-through' : 'text-gray-900'
//                           }`}>
//                             {step.title}
//                           </h3>
//                         </div>
                        
//                         {step.description && (
//                           <p className="text-sm text-gray-600 mt-1">{step.description}</p>
//                         )}
                        
//                         {step.estimatedDuration && (
//                           <div className="flex items-center mt-2 text-xs text-gray-500">
//                             <FaClock className="mr-1" />
//                             Estimated: {step.estimatedDuration}
//                           </div>
//                         )}
                        
//                         {step.completed && step.completedAt && (
//                           <div className="flex items-center mt-1 text-xs text-green-600">
//                             <FaCheckCircle className="mr-1" />
//                             Completed: {new Date(step.completedAt).toLocaleDateString()}
//                           </div>
//                         )}
//                       </div>
//                     </div>
                    
//                     <button
//                       onClick={() => removeStep(step.id)}
//                       className="text-red-600 hover:text-red-800 p-1 ml-2"
//                     >
//                       <FaTrash />
//                     </button>
//                   </div>
//                 </div>
//               ))}

//               {serviceJob.jobFlow.length === 0 && (
//                 <div className="text-center py-8 text-gray-500">
//                   No steps added yet. Start by creating your service workflow above.
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Summary & Priority Section */}
//         <div className="lg:col-span-1">
//           <div className="space-y-6">
//             {/* Priority Card */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-xl font-semibold mb-4 flex items-center">
//                 <FaExclamationTriangle className="mr-2 text-orange-600" />
//                 Job Priority
//               </h2>
              
//               <div className="text-center">
//                 <span className={`inline-flex px-4 py-2 text-lg font-medium rounded-full border ${getPriorityColor(serviceJob.priority)}`}>
//                   {serviceJob.priority.charAt(0).toUpperCase() + serviceJob.priority.slice(1)}
//                 </span>
                
//                 <div className="mt-4 text-sm text-gray-600">
//                   {serviceJob.priority === "low" && "Standard service timeline"}
//                   {serviceJob.priority === "medium" && "Moderate urgency"}
//                   {serviceJob.priority === "high" && "High priority service"}
//                   {serviceJob.priority === "urgent" && "Immediate attention required"}
//                 </div>
//               </div>
//             </div>

//             {/* Progress Card */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-xl font-semibold mb-4">Progress</h2>
              
//               <div className="space-y-3">
//                 <div className="flex justify-between text-sm">
//                   <span>Steps Completed:</span>
//                   <span>
//                     {serviceJob.jobFlow.filter(step => step.completed).length} / {serviceJob.jobFlow.length}
//                   </span>
//                 </div>
                
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div 
//                     className="bg-green-500 h-2 rounded-full transition-all"
//                     style={{ 
//                       width: serviceJob.jobFlow.length > 0 
//                         ? `${(serviceJob.jobFlow.filter(step => step.completed).length / serviceJob.jobFlow.length) * 100}%` 
//                         : '0%' 
//                     }}
//                   ></div>
//                 </div>

//                 <div className="flex justify-between text-sm">
//                   <span>Estimated Time:</span>
//                   <span className="font-medium">{serviceJob.estimatedHours} hours</span>
//                 </div>

//                 {serviceJob.assignedTechnician && (
//                   <div className="flex justify-between text-sm">
//                     <span>Assigned To:</span>
//                     <span className="font-medium">
//                       {technicians.find(t => t.userId === serviceJob.assignedTechnician)?.firstName || 'Technician'}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }