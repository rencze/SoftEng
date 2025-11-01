"use client";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function SecurityTab({ 
  securityData, 
  handleSecurityChange, 
  showPasswords, 
  togglePasswordVisibility, 
  changePassword, 
  saving 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Settings</h2>

      {["current", "new", "confirm"].map((field) => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field === "current"
              ? "Current Password"
              : field === "new"
              ? "New Password"
              : "Confirm New Password"}
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPasswords[field] ? "text" : "password"}
              name={field === "current" ? "currentPassword" : field === "new" ? "newPassword" : "confirmPassword"}
              value={
                field === "current"
                  ? securityData.currentPassword
                  : field === "new"
                  ? securityData.newPassword
                  : securityData.confirmPassword
              }
              onChange={handleSecurityChange}
              className="pl-10 pr-12 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter password"
            />
            <button
              onClick={() => togglePasswordVisibility(field)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPasswords[field] ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={changePassword}
        disabled={saving}
        className="mt-6 flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
      >
        <FaLock className="mr-2" />
        {saving ? "Updating..." : "Update Password"}
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2">Password Requirements</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Minimum 8 characters</li>
          <li>• At least one uppercase letter</li>
          <li>• At least one number</li>
          <li>• At least one special character</li>
        </ul>
      </div>
    </div>
  );
}