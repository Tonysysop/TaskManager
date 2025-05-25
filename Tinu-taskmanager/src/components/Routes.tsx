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
import TinuMindPage from "@/Pages/TinumindTask"
import DashboardPage from "@/Pages/Dashboard";
import LoaderUi from "@/components/TaskManager_V2/Loader";
import Notes from "@/Pages/Notes";
import FeedbackPage from "@/Pages/Feedback";
import PomodoroTimerPage from "@/Pages/PomodoroTimer";

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoaderUi />
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
          <Route path="tasks" element={<TinuMindPage />} />
          <Route path="notes" element={<Notes />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="pomodoro" element={<PomodoroTimerPage />} />
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

