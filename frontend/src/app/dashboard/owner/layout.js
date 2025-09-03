// src/app/dashboard/owner/layout.js
"use client";
import { useState } from "react";
import Sidebar from "../../../components/sidebar";

export default function OwnerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col">
        <nav className="flex items-center justify-between bg-white p-4 shadow">
          {/* Hamburger */}
          <button
            className="text-2xl font-bold"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          {/* Right side placeholder */}
          <div>Logo</div>
        </nav>

        <main className="flex-1 p-6 bg-gray-50 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
