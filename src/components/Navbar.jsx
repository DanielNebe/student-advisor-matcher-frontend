import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  // Function to determine the correct home/dashboard path
  const getHomePath = () => {
    if (!user) return "/";
    
    if (user.type === "student") {
      // Check if student has completed profile (you'll need to implement this check)
      // For now, we'll assume if they're logged in, they should go to match page
      // You can enhance this later by checking profile completion status
      return "/match"; // Changed from "/student-dashboard" to "/match"
    } else if (user.type === "advisor") {
      return "/lecturer-dashboard";
    }
    return "/";
  };

  // Function to determine dashboard path (separate from home)
  const getDashboardPath = () => {
    if (!user) return "/";
    
    if (user.type === "student") {
      return "/match"; // This is now the main student dashboard
    } else if (user.type === "advisor") {
      return "/lecturer-dashboard";
    }
    return "/";
  };

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      {/* Home/Logo Link - Fixed to go to appropriate dashboard */}
      <Link 
        to={getHomePath()} 
        className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
      >
        🎓 Advisor Matcher
      </Link>

      <div className="flex items-center space-x-4">
        {/* Home Link - Fixed logic */}
        <Link
          to={getHomePath()}
          className={`px-3 py-1 rounded transition-colors ${
            location.pathname === "/" || 
            location.pathname === "/student-dashboard" || 
            location.pathname === "/lecturer-dashboard" ||
            location.pathname === "/match"
              ? "bg-blue-600 text-white" 
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Home
        </Link>

        {user ? (
          <div className="flex items-center space-x-4">
            {user.type === "student" && (
              <>
                {/* Dashboard Link - Now points to match page */}
                <Link
                  to="/match"
                  className={`px-3 py-1 rounded transition-colors ${
                    location.pathname === "/match" 
                      ? "bg-green-600 text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Find Advisors
                </Link>
                {/* Profile Link - Only for profile completion/editing */}
                <Link
                  to="/student-profile"
                  className={`px-3 py-1 rounded transition-colors ${
                    location.pathname === "/student-profile" 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  My Profile
                </Link>
              </>
            )}

            {user.type === "advisor" && (
              <>
                <Link
                  to="/lecturer-dashboard"
                  className={`px-3 py-1 rounded transition-colors ${
                    location.pathname === "/lecturer-dashboard" 
                      ? "bg-green-600 text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/lecturer-profile"
                  className={`px-3 py-1 rounded transition-colors ${
                    location.pathname === "/lecturer-profile" 
                      ? "bg-green-600 text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  My Profile
                </Link>
              </>
            )}

            <div className="flex items-center space-x-3 ml-2 pl-3 border-l border-gray-300">
              <span className="text-sm text-gray-700 font-medium">
                {user.name} ({user.type})
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className={`px-3 py-1 rounded transition-colors ${
                location.pathname === "/login" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Login
            </Link>
            <Link 
              to="/student-register" 
              className={`px-3 py-1 rounded transition-colors ${
                location.pathname === "/student-register" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Student Register
            </Link>
            <Link 
              to="/lecturer-register" 
              className={`px-3 py-1 rounded transition-colors ${
                location.pathname === "/lecturer-register" 
                  ? "bg-green-600 text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Lecturer Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;