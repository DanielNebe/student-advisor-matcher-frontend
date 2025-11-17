import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Custom Dropdown Component
const CustomDropdown = ({ 
  label, 
  options, 
  selected, 
  onChange, 
  minSelections = 2, 
  maxSelections = 4,
  required = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option) => {
    let newSelected;
    if (selected.includes(option)) {
      newSelected = selected.filter(item => item !== option);
    } else {
      if (selected.length >= maxSelections) return;
      newSelected = [...selected, option];
    }
    onChange(newSelected);
  };

  const removeOption = (option) => {
    const newSelected = selected.filter(item => item !== option);
    onChange(newSelected);
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-semibold mb-3">
        {label} {required && "*"} 
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({selected.length}/{maxSelections} selected)
        </span>
      </label>
      
      {/* Selected Items Display */}
      <div className="flex flex-wrap gap-2 mb-3 min-h-12 p-2 border border-gray-200 rounded-lg bg-white">
        {selected.length === 0 ? (
          <span className="text-gray-400 text-sm">Select {minSelections}-{maxSelections} options...</span>
        ) : (
          selected.map((item) => (
            <span 
              key={item} 
              className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1"
            >
              {item}
              <button 
                type="button"
                onClick={() => removeOption(item)}
                className="text-blue-600 hover:text-blue-800 text-xs font-bold"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      {/* Dropdown Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-300 rounded-lg p-3 text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent flex justify-between items-center"
        >
          <span className="text-gray-500">Click to select options...</span>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              {options.map((option) => (
                <label 
                  key={option} 
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => toggleOption(option)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            
            {/* Dropdown Footer */}
            <div className="border-t border-gray-200 p-2 bg-gray-50">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selection Requirements */}
      {selected.length < minSelections && (
        <p className="text-red-500 text-sm mt-1">
          Please select at least {minSelections} options
        </p>
      )}
    </div>
  );
};

const CompleteProfile = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    researchInterests: [],
    careerGoals: [],
    yearLevel: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Options for dropdowns
  const researchOptions = [
    "Artificial Intelligence",
    "Machine Learning", 
    "Data Science",
    "Web Development",
    "Mobile Development",
    "Cybersecurity",
    "Cloud Computing",
    "Software Engineering",
    "Database Systems",
    "Networking",
    "Computer Vision",
    "Natural Language Processing"
  ];

  const careerOptions = [
    "Software Developer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Web Developer",
    "Mobile App Developer", 
    "DevOps Engineer",
    "Cloud Architect",
    "Cybersecurity Analyst",
    "Database Administrator",
    "Network Engineer",
    "AI Research Scientist",
    "Full Stack Developer"
  ];

  const yearOptions = ["Year 1", "Year 2", "Year 3", "Year 4"];

  const handleResearchChange = (selected) => {
    setFormData({ ...formData, researchInterests: selected });
  };

  const handleCareerChange = (selected) => {
    setFormData({ ...formData, careerGoals: selected });
  };

  const handleYearChange = (e) => {
    setFormData({ ...formData, yearLevel: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.researchInterests.length < 2) {
      setError("Please select at least 2 research interests");
      setLoading(false);
      return;
    }

    if (formData.careerGoals.length < 2) {
      setError("Please select at least 2 career goals");
      setLoading(false);
      return;
    }

    if (!formData.yearLevel) {
      setError("Please select your year level");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/match/complete-profile",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.student) {
        navigate("/match");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600 text-lg">Select your interests and goals to find the perfect advisor match</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Research Interests */}
          <CustomDropdown
            label="Research Interests"
            options={researchOptions}
            selected={formData.researchInterests}
            onChange={handleResearchChange}
            minSelections={2}
            maxSelections={4}
            required={true}
          />

          {/* Career Goals */}
          <CustomDropdown
            label="Career Goals"
            options={careerOptions}
            selected={formData.careerGoals}
            onChange={handleCareerChange}
            minSelections={2}
            maxSelections={4}
            required={true}
          />

          {/* Year Level */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">
              Academic Year *
            </label>
            <select
              value={formData.yearLevel}
              onChange={handleYearChange}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              required
            >
              <option value="">Select your year level</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold text-lg disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Complete Profile & Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;