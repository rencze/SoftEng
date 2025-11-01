
"use client";

import { useState, useEffect } from "react";
import { 
  FaArrowUp, 
  FaArrowDown, 
  FaTools, 
  FaBox, 
  FaUserEdit, 
  FaSearch, 
  FaFilter, 
  FaExclamationTriangle,
  FaArrowRight
} from "react-icons/fa";



export default function InventoryMovementPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
const [stockHistory, setStockHistory] = useState([]); // replace static data later
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/parts/history/all");
      if (!res.ok) throw new Error("Failed to fetch part history");
      const data = await res.json();
      setStockHistory(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchHistory();
}, []);

  const getReferenceTypeIcon = (referenceType) => {
    switch (referenceType) {
      case 'Service Job':
        return <FaTools className="inline mr-1" />;
      case 'Stock-in':
        return <FaBox className="inline mr-1" />;
      case 'Manual Adjustment':
        return <FaUserEdit className="inline mr-1" />;
      default:
        return null;
    }
  };

  const getReferenceTypeColor = (referenceType) => {
    switch (referenceType) {
      case 'Service Job':
        return "text-purple-600 bg-purple-50 border-purple-200";
      case 'Stock-in':
        return "text-blue-600 bg-blue-50 border-blue-200";
      case 'Manual Adjustment':
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getQuantityChangeDisplay = (quantityChange) => {
    const isPositive = quantityChange > 0;
    const arrow = isPositive ? <FaArrowUp className="inline mr-1" /> : <FaArrowDown className="inline mr-1" />;
    const colorClass = isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
        {arrow}
        {Math.abs(quantityChange)}
      </span>
    );
  };

  // Filter and search
  const filteredHistory = stockHistory.filter((tx) => {
    const matchesSearch = 
      tx.partName?.toLowerCase().includes(search.toLowerCase()) ||
      tx.remarks?.toLowerCase().includes(search.toLowerCase()) ||
      tx.technicianName?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === "all" || tx.referenceType === filterType;
    return matchesSearch && matchesType;
  });

  // Summary
  const summaryStats = {
    totalMovements: filteredHistory.length,
    stockIns: filteredHistory.filter(tx => tx.quantityChange > 0).length,
    stockOuts: filteredHistory.filter(tx => tx.quantityChange < 0).length,
    totalQuantityChange: filteredHistory.reduce((sum, tx) => sum + tx.quantityChange, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FaBox className="text-blue-600 text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Inventory Movement</h1>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-600">Total Movements</p>
          <p className="text-2xl font-bold text-gray-800">{summaryStats.totalMovements}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-600">Stock Ins</p>
          <p className="text-2xl font-bold text-gray-800">{summaryStats.stockIns}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500">
          <p className="text-sm font-medium text-gray-600">Stock Outs</p>
          <p className="text-2xl font-bold text-gray-800">{summaryStats.stockOuts}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
          <p className="text-sm font-medium text-gray-600">Net Change</p>
          <p className={`text-2xl font-bold ${summaryStats.totalQuantityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summaryStats.totalQuantityChange >= 0 ? '+' : ''}{summaryStats.totalQuantityChange}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">Movement History</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by part, remarks, or technician..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none w-full sm:w-48"
              >
                <option value="all">All Types</option>
                <option value="Stock-in">Stock In</option>
                <option value="Service Job">Service Job</option>
                <option value="Manual Adjustment">Manual Adjustment</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part & Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Levels</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredHistory.map((tx) => (
                <tr key={tx.partHistoryId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 text-sm">{tx.partName}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 w-fit border ${getReferenceTypeColor(tx.referenceType)}`}>
                        {getReferenceTypeIcon(tx.referenceType)}
                        {tx.referenceType}
                      </span>
                      {tx.referenceId && (
                        <span className="text-xs text-gray-500 mt-1">Reference: #{tx.referenceId}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getQuantityChangeDisplay(tx.quantityChange)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Before</div>
                        <div className="font-medium text-sm">{tx.previousQuantity}</div>
                      </div>
                      <FaArrowRight className="text-gray-400 text-xs" />
                      <div className="text-left">
                        <div className="text-xs text-gray-500">After</div>
                        <div className="font-semibold text-gray-900 text-sm">{tx.newQuantity}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 max-w-xs">
                      {tx.remarks && (
                        <div className="text-sm text-gray-700"><span className="font-medium">Remarks:</span> {tx.remarks}</div>
                      )}
                      {tx.technicianName && (
                        <div className="text-sm text-gray-700"><span className="font-medium">Technician:</span> {tx.technicianName}</div>
                      )}
                      {!tx.remarks && !tx.technicianName && <span className="text-gray-400 text-sm">-</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Showing {filteredHistory.length} of {stockHistory.length} movements
      </div>
    </div>
  );
}