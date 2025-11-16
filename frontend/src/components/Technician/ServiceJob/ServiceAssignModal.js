"use client";

import { useState } from "react";
import { 
  FaTimes,
  FaUsers,
  FaUserPlus,
  FaCheck,
  FaInfoCircle
} from "react-icons/fa";

const ServiceAssignModal = ({ job, technicians, onClose, onAssignment }) => {
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

export default ServiceAssignModal;