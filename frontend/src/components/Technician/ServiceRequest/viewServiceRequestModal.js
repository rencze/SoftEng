"use client";

import { FaTimes, FaUser, FaPhone, FaMapMarkerAlt, FaCalendar, FaFileAlt, FaExclamationCircle, FaTools, FaBox, FaStickyNote } from "react-icons/fa";

export default function ViewServiceRequestModal({ 
  isOpen, 
  onClose, 
  serviceRequest,
  onReview,
  actionLoading 
}) {
  if (!isOpen || !serviceRequest) return null;

  // Helper function to determine service type
  const determineServiceType = (services, packages) => {
    if (packages && packages.length > 0) {
      return packages[0].packageName || 'Service Package';
    }
    if (services && services.length > 0) {
      return services[0].serviceName || 'Service';
    }
    return 'General Service';
  };

  // Extract services and packages from the service request
  const services = serviceRequest.services || [];
  const servicePackages = serviceRequest.servicePackages || [];
  const notes = serviceRequest.notes || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Service Request Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <FaUser className="mr-2" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Name</label>
                  <p className="text-gray-900 font-semibold">{serviceRequest.customerName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Phone</label>
                  <p className="text-gray-900 font-semibold flex items-center">
                    <FaPhone className="mr-2 text-sm" />
                    {serviceRequest.customerPhone || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Customer Email</label>
                  <p className="text-gray-900 font-semibold">{serviceRequest.customerEmail || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <FaFileAlt className="mr-2" />
                Service Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Service Type</label>
                  <p className="text-gray-900 font-semibold">
                    {determineServiceType(services, servicePackages)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    serviceRequest.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    serviceRequest.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                    serviceRequest.status === 'Reviewed' ? 'bg-purple-100 text-purple-800' :
                    serviceRequest.status === 'Converted' ? 'bg-green-100 text-green-800' :
                    serviceRequest.status === 'Rescheduled' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {serviceRequest.status || 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Requested Date</label>
                  <p className="text-gray-900 font-semibold flex items-center">
                    <FaCalendar className="mr-2 text-sm" />
                    {serviceRequest.requestedDate ? 
                      new Date(serviceRequest.requestedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not set'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Requested Time</label>
                  <p className="text-gray-900 font-semibold">
                    {serviceRequest.startTime && serviceRequest.endTime 
                      ? `${serviceRequest.startTime} - ${serviceRequest.endTime}`
                      : 'Not specified'
                    }
                  </p>
                </div>
                {serviceRequest.assignedTechnician && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Assigned Technician</label>
                    <p className="text-gray-900 font-semibold">{serviceRequest.assignedTechnician}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Services */}
            {services.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-800 mb-3 flex items-center">
                  <FaTools className="mr-2" />
                  Selected Services ({services.length})
                </h3>
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div key={service.id || index} className="bg-white rounded-lg p-3 border border-indigo-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {service.serviceName || service.servicesName || 'Unnamed Service'}
                          </h4>
                          {service.serviceDescription || service.servicesDescription ? (
                            <p className="text-sm text-gray-600 mt-1">
                              {service.serviceDescription || service.servicesDescription}
                            </p>
                          ) : null}
                        </div>
                        {service.quantity && service.quantity > 1 && (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold">
                            Qty: {service.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Service Packages */}
            {servicePackages.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <FaBox className="mr-2" />
                  Selected Service Packages ({servicePackages.length})
                </h3>
                <div className="space-y-3">
                  {servicePackages.map((pkg, index) => (
                    <div key={pkg.id || index} className="bg-white rounded-lg p-3 border border-purple-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {pkg.packageName || 'Unnamed Package'}
                          </h4>
                          {pkg.packageDescription ? (
                            <p className="text-sm text-gray-600 mt-1">
                              {pkg.packageDescription}
                            </p>
                          ) : null}
                        </div>
                        {pkg.quantity && pkg.quantity > 1 && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                            Qty: {pkg.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Notes */}
            {notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
                  <FaStickyNote className="mr-2" />
                  Customer Notes
                </h3>
                <div className="bg-white border border-yellow-100 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {notes}
                  </p>
                </div>
              </div>
            )}

            {/* Location Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                Location Information
              </h3>
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900 font-semibold mt-1">
                  {serviceRequest.address || 'N/A'}
                </p>
              </div>
            </div>

            {/* Description */}
            {serviceRequest.description && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FaFileAlt className="mr-2" />
                  Service Description
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {serviceRequest.description}
                  </p>
                </div>
              </div>
            )}

            {/* Remarks */}
            {serviceRequest.remarks && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FaExclamationCircle className="mr-2" />
                  Remarks
                </h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {serviceRequest.remarks}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="flex justify-between p-6 border-t border-gray-200">
          <div className="flex gap-2">
            {/* Review button for Accepted AND Rescheduled requests */}
            {(serviceRequest?.status === "Accepted" || serviceRequest?.status === "Rescheduled") && (
              <button
                onClick={() => onReview(serviceRequest)}
                disabled={actionLoading === serviceRequest?.serviceRequestId}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {actionLoading === serviceRequest?.serviceRequestId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaFileAlt className="mr-2" />
                    Mark as Reviewed
                  </>
                )}
              </button>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { FaTimes, FaUser, FaPhone, FaMapMarkerAlt, FaCalendar, FaFileAlt, FaExclamationCircle } from "react-icons/fa";

// export default function ViewServiceRequestModal({ 
//   isOpen, 
//   onClose, 
//   serviceRequest,
//   onReview,
//   actionLoading 
// }) {
//   if (!isOpen || !serviceRequest) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <h2 className="text-xl font-bold text-gray-800">Service Request Details</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors"
//           >
//             <FaTimes className="w-6 h-6" />
//           </button>
//         </div>
        
//         {/* Content */}
//         <div className="p-6">
//           <div className="space-y-6">
//             {/* Customer Information */}
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
//                 <FaUser className="mr-2" />
//                 Customer Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Customer Name</label>
//                   <p className="text-gray-900 font-semibold">{serviceRequest.customerName || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Customer Phone</label>
//                   <p className="text-gray-900 font-semibold flex items-center">
//                     <FaPhone className="mr-2 text-sm" />
//                     {serviceRequest.customerPhone || 'N/A'}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Service Details */}
//             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//               <h3 className="font-semibold text-green-800 mb-3 flex items-center">
//                 <FaFileAlt className="mr-2" />
//                 Service Details
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Service Type</label>
//                   <p className="text-gray-900 font-semibold">{serviceRequest.serviceType || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Status</label>
//                   <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                     serviceRequest.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
//                     serviceRequest.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
//                     serviceRequest.status === 'Reviewed' ? 'bg-purple-100 text-purple-800' :
//                     serviceRequest.status === 'Converted' ? 'bg-green-100 text-green-800' :
//                     serviceRequest.status === 'Rescheduled' ? 'bg-orange-100 text-orange-800' :
//                     'bg-red-100 text-red-800'
//                   }`}>
//                     {serviceRequest.status || 'N/A'}
//                   </span>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Requested Date</label>
//                   <p className="text-gray-900 font-semibold flex items-center">
//                     <FaCalendar className="mr-2 text-sm" />
//                     {serviceRequest.requestedDate ? 
//                       new Date(serviceRequest.requestedDate).toLocaleDateString('en-US', {
//                         weekday: 'long',
//                         year: 'numeric',
//                         month: 'long',
//                         day: 'numeric'
//                       }) : 'Not set'
//                     }
//                   </p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Requested Time</label>
//                   <p className="text-gray-900 font-semibold">
//                     {serviceRequest.requestedTime || 'Not specified'}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Location Information */}
//             <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
//               <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
//                 <FaMapMarkerAlt className="mr-2" />
//                 Location Information
//               </h3>
//               <div>
//                 <label className="text-sm font-medium text-gray-500">Address</label>
//                 <p className="text-gray-900 font-semibold mt-1">
//                   {serviceRequest.address || 'N/A'}
//                 </p>
//               </div>
//             </div>

//             {/* Description */}
//             <div>
//               <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
//                 <FaFileAlt className="mr-2" />
//                 Service Description
//               </h3>
//               <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//                 <p className="text-gray-900 whitespace-pre-wrap">
//                   {serviceRequest.description || 'No description provided'}
//                 </p>
//               </div>
//             </div>

//             {/* Remarks */}
//             {serviceRequest.remarks && (
//               <div>
//                 <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
//                   <FaExclamationCircle className="mr-2" />
//                   Remarks
//                 </h3>
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                   <p className="text-gray-900 whitespace-pre-wrap">
//                     {serviceRequest.remarks}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
        
//         {/* Footer Actions */}
//         <div className="flex justify-between p-6 border-t border-gray-200">
//           <div className="flex gap-2">
//             {/* Review button for Accepted AND Rescheduled requests */}
//             {(serviceRequest?.status === "Accepted" || serviceRequest?.status === "Rescheduled") && (
//               <button
//                 onClick={() => onReview(serviceRequest)}
//                 disabled={actionLoading === serviceRequest?.serviceRequestId}
//                 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
//               >
//                 {actionLoading === serviceRequest?.serviceRequestId ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <FaFileAlt className="mr-2" />
//                     Mark as Reviewed
//                   </>
//                 )}
//               </button>
//             )}
//           </div>
          
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }