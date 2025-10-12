"use client";

import { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function StockHistory({ apiUrl = "http://localhost:3001/api/stock-history" }) {
  const [stockHistory, setStockHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockHistory();
  }, []);

  const fetchStockHistory = async () => {
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch stock history");
      const data = await res.json();
      setStockHistory(data);
    } catch (err) {
      console.error(err);
      setStockHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-6">
      <h2 className="text-xl font-bold mb-4">Stock History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stockHistory.length > 0 ? (
              stockHistory.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{tx.partName}</td>
                  <td className={`px-4 py-2 font-medium ${tx.type === "in" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "in" ? <FaArrowUp className="inline mr-1" /> : <FaArrowDown className="inline mr-1" />}
                    {tx.type === "in" ? "Stock In" : "Stock Out"}
                  </td>
                  <td className="px-4 py-2">{tx.quantity}</td>
                  <td className="px-4 py-2">{tx.description || "-"}</td>
                  <td className="px-4 py-2">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No stock transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
