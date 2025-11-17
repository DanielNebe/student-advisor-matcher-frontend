import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentDashboard = ({ user }) => {
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/match/student/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudentProfile(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to fetch student profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleMatch = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/match/find-match",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMatch(response.data.matchedAdvisor);
    } catch (err) {
      console.error("Error finding match:", err);
      setError(err.response?.data?.message || "Failed to find match");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name}</h1>

        {!studentProfile ? (
          <p>Profile not found. Please complete your profile.</p>
        ) : (
          <>
            <h2 className="text-xl font-semibold mt-4">Profile Details</h2>
            <div className="mt-2 space-y-1">
              <p><strong>Registration Number:</strong> {studentProfile.registrationNumber || "N/A"}</p>
              <p><strong>Career Goals:</strong> {Array.isArray(studentProfile.careerGoals) ? studentProfile.careerGoals.join(", ") : studentProfile.careerGoals || "N/A"}</p>
              <p><strong>Research Interests:</strong> {Array.isArray(studentProfile.researchInterests) ? studentProfile.researchInterests.join(", ") : studentProfile.researchInterests || "N/A"}</p>
              <p><strong>Preferred Advisor Types:</strong> {Array.isArray(studentProfile.preferredAdvisorTypes) ? studentProfile.preferredAdvisorTypes.join(", ") : studentProfile.preferredAdvisorTypes || "N/A"}</p>
              <p><strong>Has Matched:</strong> {studentProfile.hasMatched ? "Yes" : "No"}</p>
            </div>

            {!studentProfile.hasMatched && (
              <button onClick={handleMatch} className="mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-all">
                {loading ? "Finding Match..." : "Find Advisor Match"}
              </button>
            )}

            {match && (
              <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded">
                <h3 className="font-semibold">Matched Advisor</h3>
                <p><strong>Name:</strong> {match.name}</p>
                <p><strong>Department:</strong> {match.department}</p>
                <p><strong>Research Areas:</strong> {Array.isArray(match.researchAreas) ? match.researchAreas.join(", ") : match.researchAreas || "N/A"}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
