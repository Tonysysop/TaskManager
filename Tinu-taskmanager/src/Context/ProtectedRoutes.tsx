import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/Context/AuthContext"; // Corrected path if needed

interface Props {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  // Keep this log, it's very helpful!
  console.log("🧠 ProtectedRoute Check. State:", { isAuthenticated, loading });

  if (loading) {
    // --- CORRECTED LOGIC ---
    // While authentication status is loading, don't render anything or redirect.
    // Return null or a loading indicator specific to this component.
    console.log("⏳ ProtectedRoute: Auth state is loading...");
    // You can return a spinner, a placeholder, or null
    return <div className="text-center p-4">Checking Authentication...</div>;
    // return null;
  }

  if (!isAuthenticated) {
    // Only check authentication status *after* loading is complete.
    console.log("🚫 ProtectedRoute: Not authenticated. Redirecting to /login.");
    return <Navigate to="/login" replace />; // 'replace' is good practice here
  }

  // If loading is false AND isAuthenticated is true:
  console.log("✅ ProtectedRoute: Authenticated. Rendering children.");
  return <>{children}</>; // Render the protected component
};