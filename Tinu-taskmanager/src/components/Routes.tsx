import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "@/Pages/Login";
import Signup from "@/Pages/Signup";
import TinuMind from "@/Pages/TinuMind";
import Home from "@/Pages/Home"
import { ProtectedRoute } from "@/Context/ProtectedRoutes";
import { useAuth } from "@/Context/AuthContext";

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
          path="/"
          element={
            <ProtectedRoute>
              <TinuMind />
            </ProtectedRoute>
          }
        />
        {/* Optional: Keep /tinumind route as an alias if needed */}
        <Route
          path="/tinumind"
          element={
            <ProtectedRoute>
              <TinuMind />
            </ProtectedRoute>
          }
        />
      
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




















// // Fake authentication function (Replace with real auth logic)
// const isAuthenticated = () => {
//   return localStorage.getItem("authToken") !== null;
// };

// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   return isAuthenticated() ? children : <Navigate to="/login" />;
// };

// const AppRoutes = () => {
//   return (
//     <Router>
//       <Routes>
//         {/* Login Route */}
//         <Route path="/login" element={<Login />} />

//         {/* Signup Route */}
//         <Route path="/signup" element={<Signup />} />


//         {/* Protected Route: Only show App if authenticated */}
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               <TinuMind />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </Router>
//   );
// };

// export default AppRoutes;




