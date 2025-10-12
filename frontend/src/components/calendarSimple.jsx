"use client";

import { useState } from "react";
import moment from "moment";

export default function CompactCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = () => {
    const start = moment(currentDate).startOf("month");
    const end = moment(currentDate).endOf("month");
    const days = [];

    // Empty cells before month starts
    const startDay = start.day();
    for (let i = 0; i < startDay; i++) {
      days.push({ date: start.clone().subtract(startDay - i, "days").toDate(), outside: true });
    }

    // Days in current month
    for (let i = 1; i <= end.date(); i++) {
      days.push({ date: moment(currentDate).date(i).toDate(), outside: false });
    }

    // Fill remaining cells to make 42 total (6 weeks grid)
    while (days.length < 42) {
      days.push({ date: end.add(1, "day").toDate(), outside: true });
    }

    return days;
  };

  const navigate = (direction) => {
    const newDate = moment(currentDate)
      .add(direction === "NEXT" ? 1 : -1, "month")
      .toDate();
    setCurrentDate(newDate);
  };

  const days = getDaysInMonth();
  const monthYear = moment(currentDate).format("MMMM YYYY");
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("PREV")}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            ←
          </button>
          <span className="text-lg font-semibold text-gray-800">{monthYear}</span>
          <button
            onClick={() => navigate("NEXT")}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            →
          </button>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid (fixed 6 rows / 42 days) */}
        <div className="grid grid-cols-7 gap-2">
          {days.map(({ date, outside }, index) => {
            const isToday = moment(date).isSame(new Date(), "day");
            const isSelected = selectedDate && moment(date).isSame(selectedDate, "day");

            return (
              <button
                key={index}
                onClick={() => !outside && setSelectedDate(date)}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                  ${outside ? "text-gray-300 cursor-default" : ""}
                  ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md"
                      : isToday && !outside
                      ? "bg-indigo-100 text-indigo-600 font-semibold"
                      : !outside
                      ? "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      : ""
                  }
                `}
                disabled={outside}
              >
                {moment(date).date()}
              </button>
            );
          })}
        </div>

        {/* Selected Date Display */}
        {selectedDate && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Selected Date</p>
              <p className="text-lg font-semibold text-indigo-600">
                {moment(selectedDate).format("MMMM D, YYYY")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import moment from "moment";

// export default function CompactCalendar() {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [timeSlots, setTimeSlots] = useState({ AM: [], PM: [] });

//   const getDaysInMonth = () => {
//     const start = moment(currentDate).startOf("month");
//     const end = moment(currentDate).endOf("month");
//     const days = [];

//     const startDay = start.day();
//     for (let i = 0; i < startDay; i++) {
//       days.push({ date: start.clone().subtract(startDay - i, "days").toDate(), outside: true });
//     }

//     for (let i = 1; i <= end.date(); i++) {
//       days.push({ date: moment(currentDate).date(i).toDate(), outside: false });
//     }

//     while (days.length < 42) {
//       days.push({ date: end.add(1, "day").toDate(), outside: true });
//     }

//     return days;
//   };

//   const navigate = (direction) => {
//     const newDate = moment(currentDate)
//       .add(direction === "NEXT" ? 1 : -1, "month")
//       .toDate();
//     setCurrentDate(newDate);
//   };

//   const handleDateClick = (date) => {
//     setSelectedDate(date);
//     setIsModalOpen(true);
//   };

//   // Placeholder fetch
//   useEffect(() => {
//     if (!selectedDate) return;

//     // Example: fetch from backend /api/slot-dates/:date
//     const formattedDate = moment(selectedDate).format("YYYY-MM-DD");

//     // Placeholder logic: even dates have slots
//     if (selectedDate.getDate() % 2 === 0) {
//       setTimeSlots({
//         AM: [
//           { start: "09:00", end: "10:00", isAvailable: true },
//           { start: "10:00", end: "11:00", isAvailable: false },
//           { start: "11:00", end: "12:00", isAvailable: true },
//         ],
//         PM: [
//           { start: "13:00", end: "14:00", isAvailable: true },
//           { start: "14:00", end: "15:00", isAvailable: true },
//           { start: "15:00", end: "16:00", isAvailable: false },
//         ],
//       });
//     } else {
//       setTimeSlots({ AM: [], PM: [] });
//     }
//   }, [selectedDate]);

//   const days = getDaysInMonth();
//   const monthYear = moment(currentDate).format("MMMM YYYY");
//   const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

//   const renderTimeSlots = (slots) => {
//     if (!slots.length) return <p className="text-gray-500">No slots available.</p>;

//     return slots.map((slot, index) => (
//       <div
//         key={index}
//         className={`p-2 rounded-lg mb-2 text-center text-sm font-medium ${
//           slot.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//         }`}
//       >
//         {slot.start} - {slot.end}
//       </div>
//     ));
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-sm">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <button
//             onClick={() => navigate("PREV")}
//             className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors"
//           >
//             ←
//           </button>
//           <span className="text-lg font-semibold text-gray-800">{monthYear}</span>
//           <button
//             onClick={() => navigate("NEXT")}
//             className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors"
//           >
//             →
//           </button>
//         </div>

//         {/* Weekday Labels */}
//         <div className="grid grid-cols-7 gap-2 mb-3">
//           {weekDays.map((day, i) => (
//             <div key={i} className="text-center text-xs font-medium text-gray-500">
//               {day}
//             </div>
//           ))}
//         </div>

//         {/* Calendar Grid */}
//         <div className="grid grid-cols-7 gap-2">
//           {days.map(({ date, outside }, index) => {
//             const isToday = moment(date).isSame(new Date(), "day");
//             const isSelected = selectedDate && moment(date).isSame(selectedDate, "day");

//             return (
//               <button
//                 key={index}
//                 onClick={() => !outside && handleDateClick(date)}
//                 className={`
//                   aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
//                   ${outside ? "text-gray-300 cursor-default" : ""}
//                   ${isSelected ? "bg-indigo-600 text-white shadow-md" : ""}
//                   ${isToday && !outside ? "bg-indigo-100 text-indigo-600 font-semibold" : ""}
//                   ${!outside && !isSelected && !isToday ? "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600" : ""}
//                 `}
//                 disabled={outside}
//               >
//                 {moment(date).date()}
//               </button>
//             );
//           })}
//         </div>

//         {/* Modal */}
//         {isModalOpen && selectedDate && (
//           <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//             <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-full">
//               <h2 className="text-lg font-semibold text-gray-800 mb-4">
//                 {moment(selectedDate).format("MMMM D, YYYY")}
//               </h2>

//               <div className="grid grid-cols-2 gap-4">
//                 {/* AM */}
//                 <div>
//                   <h3 className="font-medium text-gray-700 mb-2 text-center">AM</h3>
//                   {renderTimeSlots(timeSlots.AM)}
//                 </div>

//                 {/* PM */}
//                 <div>
//                   <h3 className="font-medium text-gray-700 mb-2 text-center">PM</h3>
//                   {renderTimeSlots(timeSlots.PM)}
//                 </div>
//               </div>

//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
