import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
        console.log("🔍 Loading advisor profile with token:", token.substring(0, 20) + "...");
        
        const res = await API.post("/api/advisors/profile", {}, { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        });
        
        console.log("🔍 Profile response:", res.data);
        
        if (res.data && res.data.success) {
          const advisor = res.data.advisor;
          console.log("🔍 Advisor data received:", advisor);
          
          setProfile({
            researchInterests: advisor.researchInterests || [],
            expertiseAreas: advisor.expertiseAreas || [],
            maxStudents: advisor.maxStudents || 5,
            availableSlots: advisor.availableSlots || 5,
            bio: advisor.bio || ""
          });
          setCompletedProfile(!!advisor.completedProfile);
          console.log("✅ Profile loaded, completedProfile:", !!advisor.completedProfile);
        } else {
          console.log("⚠️ No profile data yet or success false");
        }
      } catch (err) {
        console.error("❌ Error loading advisor profile:", err);
        console.error("❌ Error response:", err.response?.data);
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

    // Validation
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
        researchInterests: profile.researchInterests,
        expertiseAreas: profile.expertiseAreas,
        maxStudents: profile.maxStudents,
        availableSlots: profile.availableSlots,
        bio: profile.bio,
        completedProfile: true 
      };
      
      console.log("📤 Sending payload:", payload);
      console.log("📤 Token:", token.substring(0, 20) + "...");
      
      const res = await API.post("/api/advisors/complete-profile", payload, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        } 
      });
      
      console.log("✅ Save response:", res.data);
      
      if (res.data.success) {
        setMsg({ type: "success", text: "Profile completed successfully!" });
        setCompletedProfile(true);
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/lecturer-dashboard");
        }, 2000);
      } else {
        setMsg({ type: "error", text: res.data.message || "Failed to save profile." });
      }
      
    } catch (err) {
      console.error("❌ Error saving profile:", err);
      console.error("❌ Error response:", err.response?.data);
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to save profile. Please try again." });
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
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
              <div className="flex items-start">
                {msg.type === 'success' ? (
                  <svg className="w-5 h-5 mr-2 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <div>
                  <p className="font-medium">{msg.text}</p>
                  {msg.type === 'success' && (
                    <p className="text-sm mt-1 text-green-700">Redirecting to dashboard...</p>
                  )}
                </div>
              </div>
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
                disabled={saving || loading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Profile...
                  </>
                ) : completedProfile ? "Update Profile" : "Complete Profile & Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
