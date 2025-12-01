import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ✅ UPDATED: Use Render backend
const API = axios.create({ 
  baseURL: "https://student-advisor-matcher-bckend.onrender.com"
});

export default function LecturerProfile() {
  const [profile, setProfile] = useState({ 
    researchInterests: [], 
    expertiseAreas: [], 
    maxStudents: 5, 
    availableSlots: 5,
    bio: "" 
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [completedProfile, setCompletedProfile] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!token) {
        navigate("/login");
        return;
      }
      setLoading(true);
      try {
        const res = await API.post("/api/advisors/profile", {}, { 
  headers: { Authorization: `Bearer ${token}` } 
});
        if (res.data) {
          setProfile({
            researchInterests: res.data.researchInterests || [],
            expertiseAreas: res.data.expertiseAreas || [],
            maxStudents: res.data.maxStudents || 5,
            availableSlots: res.data.availableSlots || 5,
            bio: res.data.bio || ""
          });
          setCompletedProfile(!!res.data.completedProfile);
        }
      } catch (err) {
        console.error("Error loading advisor profile:", err);
        // It's okay if profile doesn't exist yet
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, navigate]);

  const toggleSelection = (key, value) => {
    setProfile(prev => {
      const list = prev[key] || [];
      if (list.includes(value)) {
        return { ...prev, [key]: list.filter(item => item !== value) };
      }
      return { ...prev, [key]: [...list, value] };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!token) {
      setMsg({ type: "error", text: "You must be logged in." });
      return;
    }

    // Validation (department requirement removed)
    if (profile.researchInterests.length === 0) {
      setMsg({ type: "error", text: "Please select at least one research interest." });
      return;
    }
    if (profile.expertiseAreas.length === 0) {
      setMsg({ type: "error", text: "Please select at least one expertise area." });
      return;
    }

    setSaving(true);
    setMsg(null);
    try {
      const payload = { 
        ...profile,
        completedProfile: true 
      };
     const res = await API.post("/api/advisors/complete-profile", payload, { 
  headers: { Authorization: `Bearer ${token}` } 
});
      setMsg({ type: "success", text: "Profile completed successfully!" });
      setCompletedProfile(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/lecturer-dashboard");
      }, 2000);
      
    } catch (err) {
      console.error("Error saving profile:", err);
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  // Research interest options
  const RESEARCH_OPTIONS = [
    "Artificial Intelligence", "Machine Learning", "Data Science", "Software Engineering",
    "Web Development", "Mobile Development", "Cybersecurity", "Cloud Computing",
    "Computer Networks", "Database Systems", "Computer Vision", "Natural Language Processing",
    "Human-Computer Interaction", "Computer Graphics", "Operating Systems", "Algorithms",
    "Data Structures", "Computer Architecture", "Embedded Systems", "Robotics"
  ];

  // Expertise/Industry experience options
  const EXPERTISE_OPTIONS = [
    "Software Development", "Data Science", "Machine Learning Engineering", "DevOps", 
    "Cloud Architecture", "Research & Development", "Data Analysis", "Backend Development",
    "Frontend Development", "Full Stack Development", "AI Engineering", "Systems Analysis",
    "Mobile App Development", "Web Development", "Database Administration", "Network Security",
    "Computer Vision", "Natural Language Processing", "Big Data", "IoT Development"
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {completedProfile ? "Update Your Advisor Profile" : "Complete Your Advisor Profile"}
          </h2>
          <p className="text-gray-600 mb-6">
            {completedProfile 
              ? "Update your information to help students find the right advisor match."
              : "Tell us about your expertise to help students find the perfect match."
            }
          </p>
          
          {msg && (
            <div className={`p-4 rounded-lg mb-6 ${
              msg.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {msg.text}
              {msg.type === 'success' && (
                <p className="text-sm mt-1">Redirecting to dashboard...</p>
              )}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            {/* Research Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Research Interests * 
                <span className="text-gray-500 ml-2">({profile.researchInterests.length} selected)</span>
              </label>
              <p className="text-sm text-gray-600 mb-3">Select all research areas you're interested in</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
                {RESEARCH_OPTIONS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleSelection("researchInterests", interest)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      profile.researchInterests.includes(interest)
                        ? 'border-green-500 bg-green-50 text-green-700 font-semibold' 
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Expertise Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Expertise & Industry Experience *
                <span className="text-gray-500 ml-2">({profile.expertiseAreas.length} selected)</span>
              </label>
              <p className="text-sm text-gray-600 mb-3">Select areas where you have professional expertise</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
                {EXPERTISE_OPTIONS.map(expertise => (
                  <button
                    key={expertise}
                    type="button"
                    onClick={() => toggleSelection("expertiseAreas", expertise)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      profile.expertiseAreas.includes(expertise)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' 
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {expertise}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Students
                </label>
                <p className="text-sm text-gray-600 mb-3">Total number of students you can advise</p>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={profile.maxStudents}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    maxStudents: parseInt(e.target.value) || 1,
                    availableSlots: parseInt(e.target.value) - (prev.maxStudents - prev.availableSlots)
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currently Available Slots
                </label>
                <p className="text-sm text-gray-600 mb-3">Number of students you can currently accept</p>
                <input
                  type="number"
                  min="0"
                  max={profile.maxStudents}
                  value={profile.availableSlots}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    availableSlots: parseInt(e.target.value) || 0 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Bio
              </label>
              <p className="text-sm text-gray-600 mb-3">Brief description of your background and approach</p>
              <textarea
                rows="4"
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Describe your research background, teaching philosophy, or anything students should know..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving Profile..." : completedProfile ? "Update Profile" : "Complete Profile & Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
