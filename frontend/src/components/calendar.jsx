"use client";

import { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function SimpleCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Custom Toolbar
  const CustomToolbar = ({ date, onNavigate }) => {
    const monthYear = moment(date).format("MMMM YYYY");
    return (
      <div className="flex items-center justify-center gap-6 py-4">
        <button
          onClick={() => onNavigate("PREV")}
          className="px-4 py-2 text-lg font-bold text-indigo-600 hover:text-indigo-800"
        >
          &lt;
        </button>
        <span className="text-xl font-semibold text-gray-800">{monthYear}</span>
        <button
          onClick={() => onNavigate("NEXT")}
          className="px-4 py-2 text-lg font-bold text-indigo-600 hover:text-indigo-800"
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="modern-calendar" style={{ height: "700px" }}>
              <Calendar
                localizer={localizer}
                events={[]}
                startAccessor="start"
                endAccessor="end"
                views={["month"]}
                view="month"
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                components={{
                  toolbar: CustomToolbar,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Remove weekday headers */
        .modern-calendar .rbc-header {
          display: none !important;
        }

        .modern-calendar .rbc-toolbar {
          background: transparent !important;
          box-shadow: none !important;
          margin-bottom: 0 !important;
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
}
