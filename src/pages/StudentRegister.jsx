import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = axios.create({ 
  baseURL: "https://student-advisor-matcher-bckend-production.up.railway.app"
});

// Add request/response logging
API.interceptors.request.use(
  (config) => {
    console.log("🚀 Making API Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error("❌ Response Error:", {
      message: error.message,
      response: error.response,
      request: error.request
    });
    return Promise.reject(error);
  }
);

const StudentRegister = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    registrationNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
    if (!form.password) newErrors.password = "Password is required";
    if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log("📝 Form data being sent:", {
        name: form.name,
        identifier: form.registrationNumber,
        password: "***", // Don't log actual password
        role: "student"
      });

      const response = await API.post("/api/auth/register", {
        name: form.name,
        identifier: form.registrationNumber,
        password: form.password,
        role: "student"
      });

      console.log("🎉 Registration successful:", response.data);

      if (response.data.token) {
        const { user, token } = response.data;
        
        if (onLogin) {
          onLogin(user, token);
        } else {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
        }
        
        navigate("/student-profile");
      } else {
        console.warn("⚠️ No token in response:", response.data);
        setErrors({ submit: "Registration successful but no token received" });
      }
    } catch (error) {
      console.error("💥 Registration failed:", error);
      
      let errorMessage = "Registration failed";
      
      if (error.response) {
        // Server responded with error status
        console.error("📡 Server error details:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response received
        console.error("📡 No response received:", error.request);
        errorMessage = "No response from server - check network connection";
      } else {
        // Something else happened
        console.error("📡 Other error:", error.message);
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-4xl text-blue-600 mb-2">
            <i className="fas fa-user-graduate"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Student Registration</h2>
          <p className="text-gray-600 mt-2">Create your student account</p>
        </div>

        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name *"
            className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"} p-3 rounded-lg focus:ring-2 focus:ring-blue-500`}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          <input
            type="text"
            placeholder="Registration Number *"
            className={`w-full border ${errors.registrationNumber ? "border-red-500" : "border-gray-300"} p-3 rounded-lg focus:ring-2 focus:ring-blue-500`}
            value={form.registrationNumber}
            onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
          />
          {errors.registrationNumber && <p className="text-red-500 text-sm">{errors.registrationNumber}</p>}

          <input
            type="password"
            placeholder="Password *"
            className={`w-full border ${errors.password ? "border-red-500" : "border-gray-300"} p-3 rounded-lg focus:ring-2 focus:ring-blue-500`}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

          <input
            type="password"
            placeholder="Confirm Password *"
            className={`w-full border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} p-3 rounded-lg focus:ring-2 focus:ring-blue-500`}
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-400"
          >
            {loading ? "Creating Account..." : "Register as Student"}
          </button>
        </form>
        
        {/* Debug info */}
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <p>Debug: Check browser console (F12) for detailed logs</p>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
