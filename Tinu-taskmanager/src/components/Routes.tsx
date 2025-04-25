//import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "@/Pages/Login";
import Signup from "@/Pages/Signup";
import AppLayout from "@/Pages/AppLayout";
import Home from "@/Pages/Home";
import { ProtectedRoute } from "@/Context/ProtectedRoutes";
import { useAuth } from "@/Context/AuthContext";
import TasksPage from "@/components/TaskManager/TaskManager"
import DashboardPage from "@/Pages/Dashboard";

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }
  console.log("loading:", loading, "isAuthenticated:", isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/tinumind" replace /> : <Home />
          }
        />
        <Route
          path="/tinumind/*"
          element={
            <ProtectedRoute>
              <AppLayout /> {/* contains the sidebar */}
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
        </Route>


        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/tinumind" replace /> : <Login />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? <Navigate to="/tinumind" replace /> : <Signup />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;

