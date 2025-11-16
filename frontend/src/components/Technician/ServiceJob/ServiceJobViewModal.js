"use client";

import { 
  FaTimes,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaInfoCircle,
  FaFileInvoice,
  FaDollarSign
} from "react-icons/fa";

const ServiceJobViewModal = ({ job, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Service Job Details</h2>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-blue-100 bg-blue-800 px-3 py-1 rounded-lg font-medium">
                  {job.jobNumber}
                </p>
                {job.referenceQuotation?.quotationNumber && (
                  <p className="text-amber-100 bg-amber-700 px-3 py-1 rounded-lg font-medium flex items-center">
                    <FaFileInvoice className="mr-2" />
                    {job.referenceQuotation.quotationNumber}
                  </p>
                )}
              </div>
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
          {/* Reference Quotation Section - Always Show */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FaFileInvoice className="mr-2 text-amber-600" />
              Quotation Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="flex items-center">
                  <strong className="text-gray-700 min-w-[140px]">Quotation Number:</strong>
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                    {job.referenceQuotation?.quotationNumber || "Not Available"}
                  </span>
                </p>
                <p>
                  <strong className="text-gray-700">Quotation Date:</strong> 
                  <span className="ml-2">
                    {job.referenceQuotation?.quotationDate 
                      ? new Date(job.referenceQuotation.quotationDate).toLocaleDateString()
                      : "N/A"
                    }
                  </span>
                </p>
                <p>
                  <strong className="text-gray-700">Valid Until:</strong> 
                  <span className="ml-2">
                    {job.referenceQuotation?.validUntil 
                      ? new Date(job.referenceQuotation.validUntil).toLocaleDateString()
                      : "N/A"
                    }
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-center">
                  <strong className="text-gray-700 min-w-[120px]">Total Amount:</strong>
                  <span className="flex items-center text-green-600 font-bold">
                    <FaDollarSign className="text-sm mr-1" />
                    {job.referenceQuotation?.totalAmount?.toFixed(2) || "0.00"}
                  </span>
                </p>
                <p className="flex items-center">
                  <strong className="text-gray-700 min-w-[120px]">Status:</strong>
                  <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${
                    job.referenceQuotation?.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                    job.referenceQuotation?.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    job.referenceQuotation?.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {job.referenceQuotation?.status || "No Quotation"}
                  </span>
                </p>
              </div>
            </div>
          </div>

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

export default ServiceJobViewModal;