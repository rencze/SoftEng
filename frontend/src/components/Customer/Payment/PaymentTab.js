"use client";

export default function PaymentTab() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">My Payment</h2>
      <p className="text-gray-600 mb-4">Here you can view your payment history.</p>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Payment ID</th>
            <th className="px-4 py-2 border">Date</th>
            <th className="px-4 py-2 border">Amount</th>
            <th className="px-4 py-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 border">501</td>
            <td className="px-4 py-2 border">2025-10-10</td>
            <td className="px-4 py-2 border">$100</td>
            <td className="px-4 py-2 border">Paid</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 border">502</td>
            <td className="px-4 py-2 border">2025-10-12</td>
            <td className="px-4 py-2 border">$150</td>
            <td className="px-4 py-2 border">Pending</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}