
// // src/app/dashboard/owner/page.js
"use client";

import { useState, useEffect } from "react";
import { 
  FaUsers, 
  FaClipboardList, 
  FaFileInvoiceDollar,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaEye,
  FaChartLine,
  FaUserPlus,
  FaClock
} from "react-icons/fa";
import axios from "axios";

export default function DashboardPage() {
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
// Purpose: Keeps track of which user is currently being edited.
// Initial value: null → means no user is being edited yet.
// When you click the Edit button, you set this to the selected user:
  const [editingUser, setEditingUser] = useState(null); //setEditingUser(null); // close modal
//Purpose: Stores the current form values for the user being edited.
// Initial value: {} → empty object.
// When you open the modal, you fill it with the user's current info:
  const [editData, setEditData] = useState({});


  // Fetch users from backend
  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3001/api/users");
      setUserCount(res.data.length);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: userCount,
      icon: <FaUsers className="text-white text-2xl" />,
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      change: "+12%",
      changeType: "positive",
      period: "vs last month",
      loading: loading
    },
    {
      title: "Pending Bookings",
      value: 12,
      icon: <FaClipboardList className="text-white text-2xl" />,
      bg: "bg-gradient-to-br from-amber-500 to-orange-500",
      change: "+5%",
      changeType: "positive",
      period: "vs last week",
      loading: false
    },
    {
      title: "Pending Quotations",
      value: 5,
      icon: <FaFileInvoiceDollar className="text-white text-2xl" />,
      bg: "bg-gradient-to-br from-emerald-500 to-green-600",
      change: "-2%",
      changeType: "negative",
      period: "vs last week",
      loading: false
    },
    {
      title: "Monthly Revenue",
      value: "₱45,230",
      icon: <FaChartLine className="text-white text-2xl" />,
      bg: "bg-gradient-to-br from-purple-500 to-indigo-600",
      change: "+18%",
      changeType: "positive",
      period: "vs last month",
      loading: false
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: "New user registration",
      user: "John Doe",
      time: "2 minutes ago",
      icon: <FaUserPlus className="text-blue-500" />
    },
    {
      id: 2,
      action: "Booking completed",
      user: "Jane Smith",
      time: "15 minutes ago",
      icon: <FaClipboardList className="text-green-500" />
    },
    {
      id: 3,
      action: "Quotation sent",
      user: "Mike Johnson",
      time: "1 hour ago",
      icon: <FaFileInvoiceDollar className="text-purple-500" />
    },
    {
      id: 4,
      action: "Payment received",
      user: "Sarah Wilson",
      time: "2 hours ago",
      icon: <FaChartLine className="text-emerald-500" />
    }
  ];

  const quickActions = [
    {
      title: "Add New User",
      description: "Create a new user account",
      icon: <FaUserPlus className="text-blue-500 text-xl" />,
      color: "border-blue-200 hover:border-blue-300 hover:bg-blue-50"
    },
    {
      title: "View Bookings",
      description: "Manage pending bookings",
      icon: <FaEye className="text-amber-500 text-xl" />,
      color: "border-amber-200 hover:border-amber-300 hover:bg-amber-50"
    },
    {
      title: "Generate Report",
      description: "Create monthly reports",
      icon: <FaChartLine className="text-purple-500 text-xl" />,
      color: "border-purple-200 hover:border-purple-300 hover:bg-purple-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 flex items-center">
              <FaCalendarAlt className="mr-2" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-16 -translate-y-16">
              {stat.icon}
            </div>
            
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <div className="flex items-center text-sm">
                {stat.changeType === 'positive' ? (
                  <FaArrowUp className="text-green-500 mr-1" />
                ) : (
                  <FaArrowDown className="text-red-500 mr-1" />
                )}
                <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-500 font-medium text-sm mb-1">{stat.title}</p>
              <div className="flex items-end justify-between">
                {stat.loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">{stat.period}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`p-4 bg-white rounded-xl border-2 ${action.color} transition-all duration-200 text-left group hover:scale-105`}
            >
              <div className="flex items-center mb-2">
                {action.icon}
                <h3 className="font-semibold text-gray-800 ml-3">{action.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Bookings Analytics</h2>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full">Monthly</button>
                <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-full">Weekly</button>
                <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-full">Daily</button>
              </div>
            </div>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-200">
              <div className="text-center">
                <FaChartLine className="text-4xl text-blue-400 mx-auto mb-2" />
                <p className="text-gray-500">Interactive Chart Component</p>
                <p className="text-sm text-gray-400">Bookings trend visualization</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">User Growth</h2>
              <div className="flex items-center text-sm text-gray-500">
                <FaArrowUp className="mr-1 text-green-500" />
                <span>+15.3% this month</span>
              </div>
            </div>
            <div className="h-64 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl flex items-center justify-center border-2 border-dashed border-emerald-200">
              <div className="text-center">
                <FaUsers className="text-4xl text-emerald-400 mx-auto mb-2" />
                <p className="text-gray-500">User Analytics Chart</p>
                <p className="text-sm text-gray-400">New registrations & activity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
              <FaClock className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mt-1">{activity.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              View All Activity
            </button>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Services</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-yellow-600">75% Used</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// "use client";

// import { useState, useEffect } from "react";
// import { FaUsers, FaClipboardList, FaFileInvoiceDollar } from "react-icons/fa";
// import axios from "axios";

// export default function DashboardPage() {
//   const [userCount, setUserCount] = useState(0);

//   // Fetch users from backend
//   async function fetchUsers() {
//     try {
//       const res = await axios.get("http://localhost:3001/api/users"); // adjust URL if needed
//       setUserCount(res.data.length);
//     } catch (err) {
//       console.error("Error fetching users:", err);
//     }
//   }

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const stats = [
//     {
//       title: "Total Users",
//       value: userCount, // dynamically from DB
//       icon: <FaUsers className="text-white text-2xl" />,
//       bg: "bg-blue-500",
//     },
//     { title: "Pending Bookings", value: 12, icon: <FaClipboardList className="text-white text-2xl" />, bg: "bg-yellow-500" },
//     { title: "Pending Quotations", value: 5, icon: <FaFileInvoiceDollar className="text-white text-2xl" />, bg: "bg-green-500" },
//   ];

//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Overview</h1>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {stats.map((stat, index) => (
//           <div
//             key={index}
//             className="flex items-center p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
//           >
//             <div className={`${stat.bg} p-4 rounded-full mr-4 flex items-center justify-center`}>
//               {stat.icon}
//             </div>
//             <div>
//               <p className="text-gray-500 font-medium">{stat.title}</p>
//               <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Optional charts section */}
//       <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-xl shadow">
//           <h2 className="font-semibold text-gray-700 mb-4">Bookings This Month</h2>
//           <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
//             Chart goes here
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow">
//           <h2 className="font-semibold text-gray-700 mb-4">New Users This Month</h2>
//           <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
//             Chart goes here
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

