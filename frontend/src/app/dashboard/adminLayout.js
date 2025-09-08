"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();

  // -------- AUTH GUARD ----------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login"); // redirect to login if no token
    }
  }, [router]);
  // ------------------------------

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      {/* You can import your Sidebar component here and pass logout */}
      <div className="w-64 border-r bg-white">
        {/* Example: <Sidebar onLogout={handleLogout} /> */}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );

  
}
