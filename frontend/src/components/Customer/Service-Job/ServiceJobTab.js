"use client";

export default function ServiceJobTab() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">My Service Job</h2>
      <p className="text-gray-600 mb-4">Here you can see all your service jobs.</p>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Job ID</th>
            <th className="px-4 py-2 border">Service Type</th>
            <th className="px-4 py-2 border">Date</th>
            <th className="px-4 py-2 border">Technician</th>
            <th className="px-4 py-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 border">201</td>
            <td className="px-4 py-2 border">Aircon Cleaning</td>
            <td className="px-4 py-2 border">2025-10-16</td>
            <td className="px-4 py-2 border">John Doe</td>
            <td className="px-4 py-2 border">Pending</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 border">202</td>
            <td className="px-4 py-2 border">Refrigerant Refill</td>
            <td className="px-4 py-2 border">2025-10-18</td>
            <td className="px-4 py-2 border">Jane Smith</td>
            <td className="px-4 py-2 border">Completed</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}