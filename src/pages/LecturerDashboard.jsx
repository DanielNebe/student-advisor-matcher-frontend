import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ UPDATED: Use Render backend
const API = axios.create({ 
  baseURL: "https://student-advisor-matcher-bckend.onrender.com"
});

export default function LecturerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadDashboard() {
      if (!token) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const res = await API.get("/api/advisors/dashboard", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setDashboard(res.data);
      } catch (err) {
        console.error("Error fetching advisor dashboard:", err);
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [token]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-red-600">{error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Advisor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {dashboard?.profile?.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statistics Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Students</span>
                <span className="text-2xl font-bold text-blue-600">{dashboard?.statistics?.totalStudents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Slots</span>
                <span className="text-2xl font-bold text-green-600">{dashboard?.statistics?.availableSlots}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Max Capacity</span>
                <span className="text-2xl font-bold text-gray-600">{dashboard?.statistics?.maxStudents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Utilization</span>
                <span className="text-2xl font-bold text-purple-600">{dashboard?.statistics?.utilizationRate}%</span>
              </div>
            </div>
          </div>

          {/* Profile Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Profile</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Research Areas</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {dashboard?.profile?.researchAreas?.map((area, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {area}
                    </span>
                  ))}
                  {(!dashboard?.profile?.researchAreas || dashboard.profile.researchAreas.length === 0) && (
                    <p className="text-gray-500 text-sm">No research areas set</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = "/lecturer-profile"}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Profile
              </button>
              <button 
                onClick={() => window.location.href = "/lecturer-profile"}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Manage Availability
              </button>
            </div>
          </div>
        </div>

        {/* Matched Students Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Matched Students</h3>
          
          {dashboard?.students && dashboard.students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard.students.map((student) => (
                <div key={student._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-800">{student.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{student.email}</p>
                  
                  <div className="mb-2">
                    <p className="text-xs text-gray-500">Research Interests</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {student.researchInterests?.slice(0, 3).map((interest, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Year {student.yearLevel}</span>
                    <span>Matched: {new Date(student.matchDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No students matched yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Students will appear here once they are matched with you through the system.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
