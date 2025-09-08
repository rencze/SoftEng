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
  FaTimesCircle
} from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function TechnicianSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterTech, setFilterTech] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Modal
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    technicianId: "",
    date: "",
    isOpen: false,
    startTime: "",
    endTime: "",
    preferred: false
  });

  // Fetch schedules + technicians
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, tRes] = await Promise.all([
          fetch("http://localhost:3001/api/schedules"),
          fetch("http://localhost:3001/api/technicians")
        ]);
        const [sData, tData] = await Promise.all([sRes.json(), tRes.json()]);
        setSchedules(sData);
        setTechnicians(tData);
      } catch (err) {
        console.error("Error fetching schedules:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helpers
  const openModal = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setScheduleData({
        technicianId: schedule.technicianId,
        date: schedule.date,
        isOpen: schedule.isOpen,
        startTime: schedule.startTime || "",
        endTime: schedule.endTime || "",
        preferred: schedule.preferred
      });
    } else {
      setEditingSchedule(null);
      setScheduleData({
        technicianId: "",
        date: "",
        isOpen: false,
        startTime: "",
        endTime: "",
        preferred: false
      });
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setScheduleData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const saveSchedule = async () => {
    try {
      if (editingSchedule) {
        // Update
        const res = await fetch(
          `http://localhost:3001/api/schedules/${editingSchedule.scheduleId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(scheduleData)
          }
        );
        if (res.ok) {
          setSchedules(
            schedules.map((s) =>
              s.scheduleId === editingSchedule.scheduleId
                ? { ...s, ...scheduleData }
                : s
            )
          );
          setEditingSchedule(null);
        }
      } else {
        // Create
        const res = await fetch("http://localhost:3001/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scheduleData)
        });
        const newSchedule = await res.json();
        if (res.ok) setSchedules([...schedules, newSchedule]);
      }
      setScheduleData({
        technicianId: "",
        date: "",
        isOpen: false,
        startTime: "",
        endTime: "",
        preferred: false
      });
    } catch (err) {
      console.error("Error saving schedule:", err);
    }
  };

  const deleteSchedule = async (id) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    try {
      await fetch(`http://localhost:3001/api/schedules/${id}`, {
        method: "DELETE"
      });
      setSchedules(schedules.filter((s) => s.scheduleId !== id));
    } catch (err) {
      console.error("Error deleting schedule:", err);
    }
  };

  // Filter schedules
  const filteredSchedules = schedules.filter((s) => {
    const matchesTech = !filterTech || s.technicianId == filterTech;
    const matchesDate = !filterDate || s.date === filterDate;
    return matchesTech && matchesDate;
  });

  // Calendar helpers
  const closedDays = schedules
    .filter((s) => !s.isOpen)
    .map((s) => new Date(s.date));

  const handleDayClick = (date) => {
    const isoDate = date.toISOString().split("T")[0];
    // open modal with closed schedule for this date
    setEditingSchedule(null);
    setScheduleData({
      technicianId: "",
      date: isoDate,
      isOpen: false,
      startTime: "",
      endTime: "",
      preferred: false
    });
  };

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
          <p className="text-gray-600">Manage daily working hours & availability</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          <FaPlus className="mr-2" /> Add Schedule
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-4">
        <select
          value={filterTech}
          onChange={(e) => setFilterTech(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Technicians</option>
          {technicians.map((t) => (
            <option key={t.technicianId} value={t.technicianId}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
        <button
          onClick={() => {
            setFilterTech("");
            setFilterDate("");
          }}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <Calendar
          onClickDay={handleDayClick}
          tileClassName={({ date }) =>
            closedDays.some((d) => d.toDateString() === date.toDateString())
              ? "bg-red-200 text-red-800 font-bold rounded-full"
              : ""
          }
        />
        <p className="mt-2 text-sm text-gray-600">
          Red = Closed. Click a day to mark as closed.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
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
                Open Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Preferred
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSchedules.map((s) => {
              const tech = technicians.find(
                (t) => t.technicianId === s.technicianId
              );
              return (
                <tr key={s.scheduleId}>
                  <td className="px-6 py-4">
                    {tech ? `${tech.firstName} ${tech.lastName}` : "Unknown"}
                  </td>
                  <td className="px-6 py-4">{s.date}</td>
                  <td className="px-6 py-4">
                    {s.isOpen ? `${s.startTime} - ${s.endTime}` : "Closed"}
                  </td>
                  <td className="px-6 py-4">
                    {s.preferred ? (
                      <span className="flex items-center text-green-600">
                        <FaCheckCircle className="mr-1" /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <FaTimesCircle className="mr-1" /> No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex space-x-3">
                    <button
                      onClick={() => openModal(s)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteSchedule(s.scheduleId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredSchedules.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No schedules found
          </div>
        )}
      </div>

      {/* Modal */}
      {(editingSchedule ||
        scheduleData.technicianId !== "" ||
        scheduleData.date !== "") && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingSchedule ? "Edit Schedule" : "Add Schedule"}
            </h2>
            <div className="space-y-3">
              <select
                name="technicianId"
                value={scheduleData.technicianId}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Technician</option>
                {technicians.map((t) => (
                  <option key={t.technicianId} value={t.technicianId}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
              <input
                type="date"
                name="date"
                value={scheduleData.date}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isOpen"
                  checked={scheduleData.isOpen}
                  onChange={handleChange}
                />
                <span>Open Hours</span>
              </label>
              {scheduleData.isOpen && (
                <div className="flex space-x-3">
                  <input
                    type="time"
                    name="startTime"
                    value={scheduleData.startTime}
                    onChange={handleChange}
                    className="flex-1 border rounded-lg px-3 py-2"
                  />
                  <input
                    type="time"
                    name="endTime"
                    value={scheduleData.endTime}
                    onChange={handleChange}
                    className="flex-1 border rounded-lg px-3 py-2"
                  />
                </div>
              )}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="preferred"
                  checked={scheduleData.preferred}
                  onChange={handleChange}
                />
                <span>Preferred Technician</span>
              </label>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingSchedule(null);
                  setScheduleData({
                    technicianId: "",
                    date: "",
                    isOpen: false,
                    startTime: "",
                    endTime: "",
                    preferred: false
                  });
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveSchedule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



















// // src/app/dashboard/owner/technician-schedules/page.jsx
// "use client"import { useState, useEffect } from "react";
// import { 
//   FaCalendarAlt,
//   FaClock,
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaUserTie,
//   FaCheckCircle,
//   FaTimesCircle
// } from "react-icons/fa";

// export default function TechnicianSchedulesPage() {
//   const [schedules, setSchedules] = useState([]);
//   const [technicians, setTechnicians] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Filters
//   const [filterTech, setFilterTech] = useState("");
//   const [filterDate, setFilterDate] = useState("");

//   // Modal
//   const [editingSchedule, setEditingSchedule] = useState(null);
//   const [scheduleData, setScheduleData] = useState({
//     technicianId: "",
//     date: "",
//     isOpen: false,
//     startTime: "",
//     endTime: "",
//     preferred: false
//   });

//   // Fetch schedules + technicians
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [sRes, tRes] = await Promise.all([
//           fetch("http://localhost:3001/api/schedules"),
//           fetch("http://localhost:3001/api/technicians")
//         ]);
//         const [sData, tData] = await Promise.all([sRes.json(), tRes.json()]);
//         setSchedules(sData);
//         setTechnicians(tData);
//       } catch (err) {
//         console.error("Error fetching schedules:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Helpers
//   const openModal = (schedule = null) => {
//     if (schedule) {
//       setEditingSchedule(schedule);
//       setScheduleData({
//         technicianId: schedule.technicianId,
//         date: schedule.date,
//         isOpen: schedule.isOpen,
//         startTime: schedule.startTime || "",
//         endTime: schedule.endTime || "",
//         preferred: schedule.preferred
//       });
//     } else {
//       setEditingSchedule(null);
//       setScheduleData({
//         technicianId: "",
//         date: "",
//         isOpen: false,
//         startTime: "",
//         endTime: "",
//         preferred: false
//       });
//     }
//   };

//   const handleChange = (e) => {
//     const { name, type, checked, value } = e.target;
//     setScheduleData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value
//     }));
//   };

//   const saveSchedule = async () => {
//     try {
//       if (editingSchedule) {
//         // Update
//         const res = await fetch(`http://localhost:3001/api/schedules/${editingSchedule.scheduleId}`, {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(scheduleData),
//         });
//         if (res.ok) {
//           setSchedules(schedules.map((s) =>
//             s.scheduleId === editingSchedule.scheduleId ? { ...s, ...scheduleData } : s
//           ));
//           setEditingSchedule(null);
//         }
//       } else {
//         // Create
//         const res = await fetch("http://localhost:3001/api/schedules", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(scheduleData),
//         });
//         const newSchedule = await res.json();
//         if (res.ok) setSchedules([...schedules, newSchedule]);
//       }
//       setScheduleData({ technicianId: "", date: "", isOpen: false, startTime: "", endTime: "", preferred: false });
//     } catch (err) {
//       console.error("Error saving schedule:", err);
//     }
//   };

//   const deleteSchedule = async (id) => {
//     if (!confirm("Are you sure you want to delete this schedule?")) return;
//     try {
//       await fetch(`http://localhost:3001/api/schedules/${id}`, { method: "DELETE" });
//       setSchedules(schedules.filter((s) => s.scheduleId !== id));
//     } catch (err) {
//       console.error("Error deleting schedule:", err);
//     }
//   };

//   // Filter schedules
//   const filteredSchedules = schedules.filter((s) => {
//     const matchesTech = !filterTech || s.technicianId == filterTech;
//     const matchesDate = !filterDate || s.date === filterDate;
//     return matchesTech && matchesDate;
//   });

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Technician Schedules</h1>
//           <p className="text-gray-600">Manage daily working hours & availability</p>
//         </div>
//         <button
//           onClick={() => openModal()}
//           className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
//         >
//           <FaPlus className="mr-2" /> Add Schedule
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-4">
//         <select
//           value={filterTech}
//           onChange={(e) => setFilterTech(e.target.value)}
//           className="border rounded-lg px-3 py-2"
//         >
//           <option value="">All Technicians</option>
//           {technicians.map((t) => (
//             <option key={t.technicianId} value={t.technicianId}>
//               {t.firstName} {t.lastName}
//             </option>
//           ))}
//         </select>
//         <input
//           type="date"
//           value={filterDate}
//           onChange={(e) => setFilterDate(e.target.value)}
//           className="border rounded-lg px-3 py-2"
//         />
//         <button
//           onClick={() => {
//             setFilterTech("");
//             setFilterDate("");
//           }}
//           className="px-4 py-2 border rounded-lg hover:bg-gray-50"
//         >
//           Clear Filters
//         </button>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-xl shadow overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open Hours</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preferred</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {filteredSchedules.map((s) => {
//               const tech = technicians.find((t) => t.technicianId === s.technicianId);
//               return (
//                 <tr key={s.scheduleId}>
//                   <td className="px-6 py-4">{tech ? `${tech.firstName} ${tech.lastName}` : "Unknown"}</td>
//                   <td className="px-6 py-4">{s.date}</td>
//                   <td className="px-6 py-4">
//                     {s.isOpen ? `${s.startTime} - ${s.endTime}` : "Closed"}
//                   </td>
//                   <td className="px-6 py-4">
//                     {s.preferred ? (
//                       <span className="flex items-center text-green-600">
//                         <FaCheckCircle className="mr-1" /> Yes
//                       </span>
//                     ) : (
//                       <span className="flex items-center text-red-600">
//                         <FaTimesCircle className="mr-1" /> No
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 flex space-x-3">
//                     <button onClick={() => openModal(s)} className="text-blue-600 hover:text-blue-800">
//                       <FaEdit />
//                     </button>
//                     <button onClick={() => deleteSchedule(s.scheduleId)} className="text-red-600 hover:text-red-800">
//                       <FaTrash />
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>

//         {filteredSchedules.length === 0 && (
//           <div className="text-center py-12 text-gray-500">No schedules found</div>
//         )}
//       </div>

//       {/* Modal */}
//       {(editingSchedule || scheduleData.technicianId !== "" || scheduleData.date !== "") && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 w-full max-w-md">
//             <h2 className="text-xl font-bold mb-4">
//               {editingSchedule ? "Edit Schedule" : "Add Schedule"}
//             </h2>
//             <div className="space-y-3">
//               <select
//                 name="technicianId"
//                 value={scheduleData.technicianId}
//                 onChange={handleChange}
//                 className="w-full border rounded-lg px-3 py-2"
//               >
//                 <option value="">Select Technician</option>
//                 {technicians.map((t) => (
//                   <option key={t.technicianId} value={t.technicianId}>
//                     {t.firstName} {t.lastName}
//                   </option>
//                 ))}
//               </select>
//               <input
//                 type="date"
//                 name="date"
//                 value={scheduleData.date}
//                 onChange={handleChange}
//                 className="w-full border rounded-lg px-3 py-2"
//               />
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   name="isOpen"
//                   checked={scheduleData.isOpen}
//                   onChange={handleChange}
//                 />
//                 <span>Open Hours</span>
//               </label>
//               {scheduleData.isOpen && (
//                 <div className="flex space-x-3">
//                   <input
//                     type="time"
//                     name="startTime"
//                     value={scheduleData.startTime}
//                     onChange={handleChange}
//                     className="flex-1 border rounded-lg px-3 py-2"
//                   />
//                   <input
//                     type="time"
//                     name="endTime"
//                     value={scheduleData.endTime}
//                     onChange={handleChange}
//                     className="flex-1 border rounded-lg px-3 py-2"
//                   />
//                 </div>
//               )}
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   name="preferred"
//                   checked={scheduleData.preferred}
//                   onChange={handleChange}
//                 />
//                 <span>Preferred Technician</span>
//               </label>
//             </div>
//             <div className="mt-4 flex justify-end space-x-3">
//               <button
//                 onClick={() => {
//                   setEditingSchedule(null);
//                   setScheduleData({ technicianId: "", date: "", isOpen: false, startTime: "", endTime: "", preferred: false });
//                 }}
//                 className="px-4 py-2 border rounded-lg"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={saveSchedule}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
