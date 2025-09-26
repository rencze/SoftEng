// src/app/dashboard/owner/technician-schedules/page.jsx
"use client";

import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaTools,
  FaComments
} from "react-icons/fa";

export default function TechnicianSchedulesPage() {
  const [technicians, setTechnicians] = useState([]);
  const [workingHours, setWorkingHours] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filterTech, setFilterTech] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [viewMode, setViewMode] = useState("daily"); // daily or weekly

  // Modals
  const [isWorkingHoursModalOpen, setIsWorkingHoursModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [editingWorkingHours, setEditingWorkingHours] = useState(null);
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [workingHoursData, setWorkingHoursData] = useState({
    technicianId: "",
    dayOfWeek: "",
    startTime: "09:00",
    endTime: "17:00",
    isActive: true
  });
  const [availabilityData, setAvailabilityData] = useState({
    technicianId: "",
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    available: true,
    maxAppointments: 1,
    appointmentType: "consultation"
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        const [techRes, hoursRes, availRes, typesRes] = await Promise.all([
          fetch("http://localhost:3001/api/technicians"),
          fetch("http://localhost:3001/api/working-hours"),
          fetch("http://localhost:3001/api/availability"),
          fetch("http://localhost:3001/api/appointment-types")
        ]);
        
        if (!techRes.ok) throw new Error("Failed to fetch technicians");
        if (!hoursRes.ok) throw new Error("Failed to fetch working hours");
        if (!availRes.ok) throw new Error("Failed to fetch availability");
        if (!typesRes.ok) throw new Error("Failed to fetch appointment types");
        
        const [techData, hoursData, availData, typesData] = await Promise.all([
          techRes.json(), 
          hoursRes.json(), 
          availRes.json(), 
          typesRes.json()
        ]);
        
        setTechnicians(techData);
        setWorkingHours(hoursData);
        setAvailability(availData);
        setAppointmentTypes(typesData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Open modals
  const openWorkingHoursModal = (hours = null) => {
    if (hours) {
      setEditingWorkingHours(hours);
      setWorkingHoursData({
        technicianId: hours.technicianId,
        dayOfWeek: hours.dayOfWeek,
        startTime: hours.startTime,
        endTime: hours.endTime,
        isActive: hours.isActive
      });
    } else {
      setEditingWorkingHours(null);
      setWorkingHoursData({
        technicianId: filterTech || "",
        dayOfWeek: new Date().getDay(),
        startTime: "09:00",
        endTime: "17:00",
        isActive: true
      });
    }
    setIsWorkingHoursModalOpen(true);
  };

  const openAvailabilityModal = (avail = null) => {
    if (avail) {
      setEditingAvailability(avail);
      setAvailabilityData({
        technicianId: avail.technicianId,
        date: avail.date,
        startTime: avail.startTime,
        endTime: avail.endTime,
        available: avail.available,
        maxAppointments: avail.maxAppointments,
        appointmentType: avail.appointmentType
      });
    } else {
      setEditingAvailability(null);
      setAvailabilityData({
        technicianId: filterTech || "",
        date: filterDate || new Date().toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "17:00",
        available: true,
        maxAppointments: 1,
        appointmentType: "consultation"
      });
    }
    setIsAvailabilityModalOpen(true);
  };

  // Close modals
  const closeWorkingHoursModal = () => {
    setIsWorkingHoursModalOpen(false);
    setEditingWorkingHours(null);
    setWorkingHoursData({
      technicianId: "",
      dayOfWeek: "",
      startTime: "09:00",
      endTime: "17:00",
      isActive: true
    });
  };

  const closeAvailabilityModal = () => {
    setIsAvailabilityModalOpen(false);
    setEditingAvailability(null);
    setAvailabilityData({
      technicianId: "",
      date: "",
      startTime: "09:00",
      endTime: "17:00",
      available: true,
      maxAppointments: 1,
      appointmentType: "consultation"
    });
  };

  // Handle form changes
  const handleWorkingHoursChange = (e) => {
    const { name, type, checked, value } = e.target;
    setWorkingHoursData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, type, checked, value } = e.target;
    setAvailabilityData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Save functions
  const saveWorkingHours = async () => {
    try {
      let res;
      if (editingWorkingHours) {
        res = await fetch(`http://localhost:3001/api/working-hours/${editingWorkingHours.workingHoursId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workingHoursData)
        });
      } else {
        res = await fetch("http://localhost:3001/api/working-hours", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workingHoursData)
        });
      }
      
      if (!res.ok) throw new Error("Failed to save working hours");
      
      const savedHours = await res.json();
      
      if (editingWorkingHours) {
        setWorkingHours(workingHours.map(h => 
          h.workingHoursId === editingWorkingHours.workingHoursId ? savedHours : h
        ));
      } else {
        setWorkingHours([...workingHours, savedHours]);
      }
      
      closeWorkingHoursModal();
    } catch (err) {
      console.error("Error saving working hours:", err);
      setError(err.message);
    }
  };

  const saveAvailability = async () => {
    try {
      let res;
      if (editingAvailability) {
        res = await fetch(`http://localhost:3001/api/availability/${editingAvailability.availabilityId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(availabilityData)
        });
      } else {
        res = await fetch("http://localhost:3001/api/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(availabilityData)
        });
      }
      
      if (!res.ok) throw new Error("Failed to save availability");
      
      const savedAvail = await res.json();
      
      if (editingAvailability) {
        setAvailability(availability.map(a => 
          a.availabilityId === editingAvailability.availabilityId ? savedAvail : a
        ));
      } else {
        setAvailability([...availability, savedAvail]);
      }
      
      closeAvailabilityModal();
    } catch (err) {
      console.error("Error saving availability:", err);
      setError(err.message);
    }
  };

  // Delete functions
  const deleteWorkingHours = async (id) => {
    if (!confirm("Are you sure you want to delete these working hours?")) return;
    
    try {
      const res = await fetch(`http://localhost:3001/api/working-hours/${id}`, {
        method: "DELETE"
      });
      
      if (!res.ok) throw new Error("Failed to delete working hours");
      
      setWorkingHours(workingHours.filter(h => h.workingHoursId !== id));
    } catch (err) {
      console.error("Error deleting working hours:", err);
      setError(err.message);
    }
  };

  const deleteAvailability = async (id) => {
    if (!confirm("Are you sure you want to delete this availability slot?")) return;
    
    try {
      const res = await fetch(`http://localhost:3001/api/availability/${id}`, {
        method: "DELETE"
      });
      
      if (!res.ok) throw new Error("Failed to delete availability");
      
      setAvailability(availability.filter(a => a.availabilityId !== id));
    } catch (err) {
      console.error("Error deleting availability:", err);
      setError(err.message);
    }
  };

  // Filter data
  const filteredWorkingHours = workingHours.filter(h => 
    !filterTech || h.technicianId == filterTech
  );

  const filteredAvailability = availability.filter(a => {
    const matchesTech = !filterTech || a.technicianId == filterTech;
    const matchesDate = !filterDate || a.date === filterDate;
    return matchesTech && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Technician Schedules</h1>
          <p className="text-gray-600">Manage working hours and availability</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => openWorkingHoursModal()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" /> Working Hours
          </button>
          <button
            onClick={() => openAvailabilityModal()}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors"
          >
            <FaPlus className="mr-2" /> Time Slot
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
          <select
            value={filterTech}
            onChange={(e) => setFilterTech(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">All Technicians</option>
            {technicians.map((t) => (
              <option key={t.technicianId} value={t.technicianId}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly View</option>
          </select>
        </div>
        
        <div className="self-end">
          <button
            onClick={() => {
              setFilterTech("");
              setFilterDate("");
            }}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Regular Working Hours */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">Regular Working Hours</h2>
          <p className="text-sm text-gray-600">Default weekly schedule for technicians</p>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Technician
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Day
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredWorkingHours.map((h) => {
              const tech = technicians.find(t => t.technicianId === h.technicianId);
              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              
              return (
                <tr key={h.workingHoursId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {tech ? `${tech.firstName} ${tech.lastName}` : "Unknown"}
                  </td>
                  <td className="px-6 py-4">{days[h.dayOfWeek]}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FaClock className="text-gray-400 mr-1" />
                      {h.startTime} - {h.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {h.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex space-x-3">
                    <button
                      onClick={() => openWorkingHoursModal(h)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                      title="Edit working hours"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteWorkingHours(h.workingHoursId)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                      title="Delete working hours"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredWorkingHours.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FaClock className="mx-auto text-4xl text-gray-300 mb-3" />
            <p>No working hours configured</p>
            <button 
              onClick={() => openWorkingHoursModal()}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Add working hours
            </button>
          </div>
        )}
      </div>

      {/* Specific Availability */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">Specific Availability & Time Slots</h2>
          <p className="text-sm text-gray-600">Exceptions to regular schedule and specific time slots</p>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Technician
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Time Slot
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Max Appointments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAvailability.map((a) => {
              const tech = technicians.find(t => t.technicianId === a.technicianId);
              const typeIcon = a.appointmentType === 'consultation' ? 
                <FaComments className="text-blue-500 mr-1" /> : 
                <FaTools className="text-green-500 mr-1" />;
              
              return (
                <tr key={a.availabilityId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {tech ? `${tech.firstName} ${tech.lastName}` : "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{new Date(a.date).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{new Date(a.date).toLocaleDateString(undefined, { weekday: 'long' })}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FaClock className="text-gray-400 mr-1" />
                      {a.startTime} - {a.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {typeIcon}
                      {a.appointmentType}
                    </div>
                  </td>
                  <td className="px-6 py-4">{a.maxAppointments}</td>
                  <td className="px-6 py-4">
                    {a.available ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Unavailable
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex space-x-3">
                    <button
                      onClick={() => openAvailabilityModal(a)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                      title="Edit availability"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteAvailability(a.availabilityId)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                      title="Delete availability"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAvailability.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-3" />
            <p>No specific availability configured</p>
            <button 
              onClick={() => openAvailabilityModal()}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Add time slot
            </button>
          </div>
        )}
      </div>

      {/* Working Hours Modal */}
      {isWorkingHoursModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingWorkingHours ? "Edit Working Hours" : "Add Working Hours"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                <select
                  name="technicianId"
                  value={workingHoursData.technicianId}
                  onChange={handleWorkingHoursChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Technician</option>
                  {technicians.map((t) => (
                    <option key={t.technicianId} value={t.technicianId}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                <select
                  name="dayOfWeek"
                  value={workingHoursData.dayOfWeek}
                  onChange={handleWorkingHoursChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={workingHoursData.startTime}
                    onChange={handleWorkingHoursChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={workingHoursData.endTime}
                    onChange={handleWorkingHoursChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={workingHoursData.isActive}
                  onChange={handleWorkingHoursChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeWorkingHoursModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveWorkingHours}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingWorkingHours ? "Update" : "Create"} Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {isAvailabilityModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingAvailability ? "Edit Time Slot" : "Add Time Slot"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                <select
                  name="technicianId"
                  value={availabilityData.technicianId}
                  onChange={handleAvailabilityChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Technician</option>
                  {technicians.map((t) => (
                    <option key={t.technicianId} value={t.technicianId}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={availabilityData.date}
                  onChange={handleAvailabilityChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={availabilityData.startTime}
                    onChange={handleAvailabilityChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={availabilityData.endTime}
                    onChange={handleAvailabilityChange}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
                <select
                  name="appointmentType"
                  value={availabilityData.appointmentType}
                  onChange={handleAvailabilityChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="consultation">Consultation</option>
                  <option value="service">Service Job</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Appointments</label>
                <input
                  type="number"
                  name="maxAppointments"
                  value={availabilityData.maxAppointments}
                  onChange={handleAvailabilityChange}
                  min="1"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  name="available"
                  checked={availabilityData.available}
                  onChange={handleAvailabilityChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                  Available
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeAvailabilityModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAvailability}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingAvailability ? "Update" : "Create"} Time Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
