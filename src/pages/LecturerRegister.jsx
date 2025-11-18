// src/pages/LecturerRegister.jsx 
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = axios.create({ 
  baseURL: "https://student-advisor-matcher-bckend-production.up.railway.app"
});

const LecturerRegister = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    staffNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.staffNumber.trim()) newErrors.staffNumber = "Staff number is required";
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
      console.log("Sending registration request...", {
        name: form.name,
        identifier: form.staffNumber,
        password: "***",
        role: "advisor"
      });

      const response = await API.post("/api/auth/register", {
        name: form.name,
        identifier: form.staffNumber,
        password: form.password,
        role: "advisor"
      });

      console.log("Registration response:", response.data);

      if (response.data.token) {
        const { user, token } = response.data;
        
        if (onLogin) {
          onLogin(user, token);
        } else {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
        }
        
        navigate("/lecturer-profile");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ 
        submit: error.response?.data?.message || 
                error.message || 
                "Registration failed" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-4xl text-green-600 mb-2">
            <i className="fas fa-chalkboard-teacher"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Advisor Registration</h2>
          <p className="text-gray-600 mt-2">Create your advisor account</p>
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
            className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"} p-3 rounded-lg focus:ring-2 focus:ring-green-500`}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          <input
            type="text"
            placeholder="Staff Number *"
            className={`w-full border ${errors.staffNumber ? "border-red-500" : "border-gray-300"} p-3 rounded-lg focus:ring-2 focus:ring-green-500`}
            value={form.staffNumber}
            onChange={(e) => setForm({ ...form, staffNumber: e.target.value })}
          />
          {errors.staffNumber && <p className="text-red-500 text-sm">{errors.staffNumber}</p>}

          <input
            type="password"
            placeholder="Password *"
            className={`w-full border ${errors.password ? "border-red-500" : "border-gray-300"} p-3 rounded-lg focus:ring-2 focus:ring-green-500`}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

          <input
            type="password"
            placeholder="Confirm Password *"
            className={`w-full border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} p-3 rounded-lg focus:ring-2 focus:ring-green-500`}
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:bg-green-400"
          >
            {loading ? "Creating Account..." : "Register as Advisor"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LecturerRegister;
