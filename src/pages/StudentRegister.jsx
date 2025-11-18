import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      console.log("🚀 Using CORS proxy for registration...");
      console.log("📝 Sending data:", {
        name: form.name,
        identifier: form.registrationNumber,
        password: "***",
        role: "student"
      });
      
      // Use CORS proxy - try different proxy services
      const proxyUrls = [
        "https://cors-anywhere.herokuapp.com/",
        "https://api.allorigins.win/raw?url=",
        "https://corsproxy.io/?"
      ];
      
      const targetUrl = "https://student-advisor-matcher-bckend-production.up.railway.app/api/auth/register";
      
      let response;
      let lastError;
      
      // Try each proxy until one works
      for (const proxyUrl of proxyUrls) {
        try {
          console.log(`🔄 Trying proxy: ${proxyUrl}`);
          
          const fullUrl = proxyUrl === "https://api.allorigins.win/raw?url=" 
            ? proxyUrl + encodeURIComponent(targetUrl)
            : proxyUrl + targetUrl;
            
          response = await fetch(fullUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: form.name,
              identifier: form.registrationNumber,
              password: form.password,
              role: "student"
            })
          });
          
          console.log(`✅ Proxy ${proxyUrl} responded with status:`, response.status);
          break; // Success, break out of loop
          
        } catch (proxyError) {
          console.log(`❌ Proxy ${proxyUrl} failed:`, proxyError.message);
          lastError = proxyError;
          continue; // Try next proxy
        }
      }
      
      if (!response) {
        throw new Error(`All proxies failed. Last error: ${lastError?.message}`);
      }

      console.log("📡 Final response status:", response.status);
    
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch {
          errorText = "No error details available";
        }
        console.error("❌ Response error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Registration successful:", data);

      if (data.token) {
        const { user, token } = data;
        
        if (onLogin) {
          onLogin(user, token);
        } else {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
        }
        
        navigate("/student-profile");
      } else {
        console.warn("⚠️ No token in response:", data);
        setErrors({ submit: "Registration successful but no authentication token received" });
      }
    } catch (error) {
      console.error("💥 Registration failed:", error);
      
      let errorMessage = error.message;
      if (error.message.includes("Failed to fetch") || error.message.includes("Network Error")) {
        errorMessage = "Cannot connect to server. This might be a CORS issue. Please try updating your backend CORS configuration.";
      }
      
      setErrors({ 
        submit: `Registration failed: ${errorMessage}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Test backend connection
  const testBackendConnection = async () => {
    console.log("🔗 Testing backend connection...");
    try {
      const response = await fetch("https://cors-anywhere.herokuapp.com/https://student-advisor-matcher-bckend-production.up.railway.app/health");
      const data = await response.json();
      console.log("✅ Backend is reachable via proxy:", data);
    } catch (error) {
      console.error("❌ Backend connection test failed:", error);
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
          <div className="mt-2 text-xs text-gray-500">
            Using CORS proxy service
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {errors.submit}
            <div className="text-xs mt-1">
              <p>This is a CORS issue. Your backend needs to be updated to allow requests from your frontend domain.</p>
              <p>Check browser console (F12) for detailed logs</p>
            </div>
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

        <div className="mt-4 text-center space-y-2">
          <button 
            type="button"
            onClick={testBackendConnection}
            className="text-xs bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 mr-2"
          >
            Test Backend Connection
          </button>
          <div className="text-xs text-gray-500">
            Backend URL: student-advisor-matcher-bckend-production.up.railway.app
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
