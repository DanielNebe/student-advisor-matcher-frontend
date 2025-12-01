// App.js - UPDATED
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import StudentRegister from "./pages/StudentRegister";
import LecturerRegister from "./pages/LecturerRegister";
import StudentProfile from "./pages/StudentProfile";
import LecturerProfile from "./pages/LecturerProfile";
import MatchPage from "./pages/MatchPage";
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard"; 
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [advisorProfile, setAdvisorProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Check profile based on user role
        if (parsedUser.role === "student") {
          checkStudentProfile(token);
        } else if (parsedUser.role === "advisor") {
          checkAdvisorProfile(token);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoadingUser(false);
  }, []);

const checkStudentProfile = async (token) => {
  try {
    const response = await fetch("https://student-advisor-matcher-bckend.onrender.com/api/match/student/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const profileData = await response.json();
      setStudentProfile(profileData);
    }
  } catch (error) {
    console.error("Error checking student profile:", error);
  }
};

 const checkAdvisorProfile = async (token) => {
  try {
    const response = await fetch("https://student-advisor-matcher-bckend.onrender.com/api/advisors/profile", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        setAdvisorProfile(result.advisor);
      }
    } else if (response.status === 404) {
      // Advisor profile doesn't exist yet - that's okay
      console.log("Advisor profile not created yet");
    }
  } catch (error) {
    console.error("Error checking advisor profile:", error);
  }
};
  
const login = async (userData, token) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(userData));
  setUser(userData);
  
  // Check profile after login
  if (userData.role === "student") {
    await checkStudentProfile(token);
  } else if (userData.role === "advisor") {
    await checkAdvisorProfile(token);
  }
};
  
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setStudentProfile(null);
    setAdvisorProfile(null);
  };

  // Determine where to redirect student after login
  const getStudentRedirectPath = () => {
    if (!studentProfile || !studentProfile.researchInterests || studentProfile.researchInterests.length === 0) {
      return "/complete-profile"; // Profile not completed
    } else if (!studentProfile.hasMatched) {
      return "/match"; // Profile completed but no match yet
    } else {
      return "/student-dashboard"; // Profile completed and matched
    }
  };

  // Determine where to redirect advisor after login
  const getAdvisorRedirectPath = () => {
    if (!advisorProfile || !advisorProfile.completedProfile) {
      return "/lecturer-profile"; // Profile not completed
    } else {
      return "/lecturer-dashboard"; // Profile completed
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar user={user} onLogout={logout} />
      <Routes>
        {/* Home page - only show if not logged in */}
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate to={
                user.role === "student" ? getStudentRedirectPath() : 
                user.role === "advisor" ? getAdvisorRedirectPath() : 
                "/"
              } replace />
            ) : (
              <Home />
            )
          } 
        />

        {/* Login route */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={
                user.role === "student" ? getStudentRedirectPath() : 
                user.role === "advisor" ? getAdvisorRedirectPath() : 
                "/"
              } replace />
            ) : (
              <Login onLogin={login} />
            )
          }
        />

        {/* Registration routes */}
        <Route
          path="/student-register"
          element={
            user ? (
              <Navigate to={
                user.role === "student" ? getStudentRedirectPath() : 
                user.role === "advisor" ? getAdvisorRedirectPath() : 
                "/"
              } replace />
            ) : (
              <StudentRegister onLogin={login} />
            )
          }
        />
        <Route
          path="/lecturer-register"
          element={
            user ? (
              <Navigate to={
                user.role === "advisor" ? getAdvisorRedirectPath() : 
                user.role === "student" ? getStudentRedirectPath() : 
                "/"
              } replace />
            ) : (
              <LecturerRegister onLogin={login} />
            )
          }
        />

        {/* Student flow routes */}
        <Route 
          path="/complete-profile" 
          element={
            user?.role === "student" ? (
              <StudentProfile />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/match" 
          element={
            user?.role === "student" ? (
              <MatchPage user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route
          path="/student-dashboard"
          element={
            user?.role === "student" ? (
              <StudentDashboard user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Advisor/Lecturer routes */}
        <Route
          path="/lecturer-dashboard"
          element={
            user?.role === "advisor" ? (
              <LecturerDashboard user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route 
          path="/lecturer-profile" 
          element={
            user?.role === "advisor" ? (
              <LecturerProfile />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Legacy routes for compatibility */}
        <Route 
          path="/student-profile" 
          element={
            user?.role === "student" ? (
              <Navigate to={getStudentRedirectPath()} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
