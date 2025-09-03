///IT IS STILL NOT WOKRINGGGGGGGGGGGGGGGGGGGGGGGGGGG

// src/components/ProtectedRoute.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login"); // redirect if not authenticated
    } else {
      setIsLoading(false); // token exists, allow rendering
    }
  }, [router]);

  if (isLoading) return null; // or a spinner/loading indicator

  return <>{children}</>;
}
