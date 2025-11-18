// src/pages/StudentProfile.jsx - UPDATED
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = axios.create({ 
  baseURL: "https://student-advisor-matcher-bckend-production.up.railway.app"
});

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    researchInterests: [],
    careerGoals: [],
    yearLevel: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setMsg({ type: "error", text: "You must be logged in." });
        return;
      }
      setLoading(true);
      try {
        const res = await API.get("/api/match/student/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        setProfile({
          researchInterests: data.researchInterests || [],
          careerGoals: data.careerGoals || [],
          yearLevel: data.yearLevel || ""
        });
      } catch (err) {
        console.error(err);
        // It's okay if profile doesn't exist yet
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [token]);

  const toggle = (key, value, max = 4) => {
    setProfile(prev => {
      const list = prev[key] || [];
      if (list.includes(value)) {
        return { ...prev, [key]: list.filter(i => i !== value) };
      }
      if (list.length >= max) {
        setMsg({ type: "error", text: `Maximum ${max} ${key} allowed` });
        return prev;
      }
      return { ...prev, [key]: [...list, value] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!token) {
      setMsg({ type: "error", text: "You must be logged in." });
      return;
    }
    if (profile.researchInterests.length === 0) {
      setMsg({ type: "error", text: "Select at least 1 research interest." });
      return;
    }
    if (profile.careerGoals.length === 0) {
      setMsg({ type: "error", text: "Select at least 1 career goal." });
      return;
    }
    if (!profile.yearLevel) {
      setMsg({ type: "error", text: "Please select your academic year." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        researchInterests: profile.researchInterests,
        careerGoals: profile.careerGoals,
        yearLevel: profile.yearLevel
      };
      const res = await API.post("/api/match/complete-profile", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg({ 
        type: "success", 
        text: "Profile completed successfully! Redirecting to matching..." 
      });
      
      // Automatically redirect to match page after 2 seconds
      setTimeout(() => {
        navigate("/match");
      }, 2000);
      
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: err.response?.data?.message || "Saving profile failed." });
    } finally {
      setSaving(false);
    }
  };

  const RESEARCH_OPTIONS = [
    "Artificial Intelligence", "Machine Learning", "Data Science", "Software Engineering",
    "Web Development", "Mobile Development", "Cybersecurity", "Cloud Computing",
    "Networking", "Database Systems", "Computer Vision", "Natural Language Processing"
  ];

  const CAREER_OPTIONS = [
    "Software Developer", "Data Scientist", "Machine Learning Engineer", "DevOps Engineer", 
    "Cloud Architect", "Research Scientist", "Data Analyst", "Backend Developer",
    "Frontend Developer", "Full Stack Developer", "AI Engineer", "Systems Analyst"
  ];

  const YEAR_LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Postgraduate"];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600 mb-6">Select your interests and goals to find the perfect advisor match</p>
          
          {msg && (
            <div className={`p-4 rounded-lg mb-6 ${
              msg.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {msg.text}
              {msg.type === 'success' && (
                <p className="text-sm mt-1">Taking you to find advisors...</p>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Academic Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Academic Year *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {YEAR_LEVELS.map(year => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, yearLevel: year }))}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        profile.yearLevel === year 
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' 
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
                {profile.yearLevel && (
                  <p className="text-sm text-green-600 mt-2">Selected: {profile.yearLevel}</p>
                )}
              </div>

              {/* Research Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Research Interests * ({profile.researchInterests.length}/4 selected)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {RESEARCH_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        profile.researchInterests.includes(opt) 
                          ? 'border-green-500 bg-green-50 text-green-700 font-semibold' 
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                      onClick={() => toggle("researchInterests", opt, 4)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Career Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Career Goals * ({profile.careerGoals.length}/4 selected)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {CAREER_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        profile.careerGoals.includes(opt) 
                          ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold' 
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                      onClick={() => toggle("careerGoals", opt, 4)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Completing Profile...
                    </>
                  ) : (
                    "Complete Profile & Find Advisors"
                  )}
                </button>
                <p className="text-sm text-gray-500 text-center mt-2">
                  After completing your profile, you'll be taken to find your perfect advisor match
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
