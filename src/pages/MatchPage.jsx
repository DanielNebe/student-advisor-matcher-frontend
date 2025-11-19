import React, { useState, useEffect } from "react";
import axios from "axios";

// ✅ UPDATED: Use Render backend
const API = axios.create({ 
  baseURL: "https://student-advisor-matcher-bckend.onrender.com"
});

export default function MatchPage() {
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [msg, setMsg] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!token) {
      setMsg({ type: "error", text: "You must be logged in." });
      return;
    }
    
    try {
      const res = await API.get("/api/match/student/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(res.data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setMsg({ type: "error", text: "Failed to load dashboard: " + (err.response?.data?.message || err.message) });
    }
  };

  const runMatch = async () => {
    if (!token) {
      setMsg({ type: "error", text: "You must be logged in." });
      return;
    }
    
    setMsg(null);
    setMatchResult(null);
    setLoading(true);
    
    try {
      // Run the actual match
      const res = await API.post("/api/match/find-match", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMatchResult(res.data);
      setMsg({ 
        type: res.data.success ? "success" : "error", 
        text: res.data.message 
      });
      
      if (res.data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      const errorData = err.response?.data;
      setMatchResult(errorData);
      setMsg({ 
        type: "error", 
        text: errorData?.message || "Matching failed." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {!dashboard ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading dashboard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Profile</h3>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Profile Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dashboard.profile.completedProfile 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {dashboard.profile.completedProfile ? 'Completed' : 'Incomplete'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Match Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dashboard.matchStatus.hasMatched 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dashboard.matchStatus.hasMatched ? 'Matched' : 'Not Matched'}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Research Interests</h4>
                  <div className="space-y-2">
                    {dashboard.profile.researchInterests.map((interest, index) => (
                      <div key={index} className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm">
                        {interest}
                      </div>
                    ))}
                    {dashboard.profile.researchInterests.length === 0 && (
                      <p className="text-gray-500 text-sm">No interests selected</p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Career Goals</h4>
                  <div className="space-y-2">
                    {dashboard.profile.careerGoals.map((goal, index) => (
                      <div key={index} className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm">
                        {goal}
                      </div>
                    ))}
                    {dashboard.profile.careerGoals.length === 0 && (
                      <p className="text-gray-500 text-sm">No goals selected</p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Academic Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Year Level:</span>
                      <span className="text-sm font-medium">{dashboard.profile.yearLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Advisors</h2>
                <p className="text-gray-600 mb-6">Run a match based on your profile to find the perfect advisor.</p>
                
                {msg && (
                  <div className={`p-4 rounded-lg mb-6 ${
                    msg.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {msg.text}
                  </div>
                )}

                {dashboard.matchStatus.hasMatched ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <h3 className="text-lg font-semibold text-blue-800">Already Matched!</h3>
                    </div>
                    <p className="text-blue-700 mb-4">
                      You were matched on: {new Date(dashboard.matchStatus.matchDate).toLocaleDateString()}
                    </p>
                    {dashboard.matchStatus.matchedAdvisor && (
                      <div className="bg-white rounded-lg p-4 border">
                        <h4 className="font-semibold text-gray-800 mb-2">Your Advisor:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium">{dashboard.matchStatus.matchedAdvisor.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Research Areas</p>
                            <p className="font-medium">{dashboard.matchStatus.matchedAdvisor.researchAreas?.join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{dashboard.matchStatus.matchedAdvisor.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {!dashboard.profile.completedProfile ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Profile Incomplete</h3>
                        <p className="text-yellow-700 mb-4">
                          Please complete your profile before finding a match.
                        </p>
                        <a 
                          href="/student-profile" 
                          className="inline-block bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-all"
                        >
                          Complete Profile
                        </a>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={runMatch} 
                          disabled={loading}
                          className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Finding Match..." : "Run Match"}
                        </button>
                        <p className="text-gray-500 mt-3">
                          Click to find the best advisor match based on your profile
                        </p>
                      </>
                    )}
                  </div>
                )}

                {matchResult && (
                  <div className={`border rounded-lg p-6 ${
                    matchResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      matchResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {matchResult.success ? '🎉 Match Successful!' : '❌ No Match Found'}
                    </h3>
                    
                    <p className="mb-4">{matchResult.message}</p>
                    
                    {matchResult.reason && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Reason:</h4>
                        <p>{matchResult.reason}</p>
                      </div>
                    )}
                    
                    {matchResult.details && (
                      <div className="mb-4 bg-white p-3 rounded border">
                        <h4 className="font-semibold mb-2">Details:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Total Advisors:</div>
                          <div className="font-medium">{matchResult.details.totalAdvisors}</div>
                          <div>Matching Interests:</div>
                          <div className="font-medium">{matchResult.details.advisorsWithMatchingInterests}</div>
                          <div>Your Interests:</div>
                          <div className="font-medium">{matchResult.details.yourInterests?.join(', ')}</div>
                        </div>
                      </div>
                    )}
                    
                    {matchResult.suggestion && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Suggestion:</h4>
                        <p>{matchResult.suggestion}</p>
                      </div>
                    )}
                    
                    {matchResult.matchedAdvisor && (
                      <div className="bg-white rounded-lg p-4 border mt-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Matched Advisor Details:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium">{matchResult.matchedAdvisor.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Research Areas</p>
                            <p className="font-medium">{matchResult.matchedAdvisor.researchAreas?.join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{matchResult.matchedAdvisor.email}</p>
                          </div>
                        </div>
                        
                        {matchResult.matchDetails?.sharedInterests && (
                          <div className="mt-4">
                            <h5 className="font-semibold text-sm text-gray-700 mb-2">Shared Research Interests:</h5>
                            <div className="flex flex-wrap gap-2">
                              {matchResult.matchDetails.sharedInterests.map((interest, index) => (
                                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
