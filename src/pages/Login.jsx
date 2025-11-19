import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    identifier: '', // Registration number or staff ID
    password: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ UPDATED: Use Render backend
      const response = await axios.post('https://student-advisor-matcher-bckend.onrender.com/api/auth/login', {
        identifier: formData.identifier,
        password: formData.password,
        role: formData.role
      });

      // ✅ FIXED: Check for token directly, not response.data.success
      if (response.data.token) {
        const { user, token } = response.data;
        
        // Call onLogin if provided, otherwise use localStorage
        if (onLogin) {
          onLogin(user, token);
        } else {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
        }

        // Navigate to dashboard based on role
        if (user.role === 'student') {
          navigate('/student-dashboard');
        } else if (user.role === 'advisor') {
          navigate('/lecturer-dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => (formData.role === 'student' ? 'Registration Number' : 'Staff Number');
  const getInputLabel = () => (formData.role === 'student' ? 'Registration Number' : 'Staff Number');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-4xl text-blue-600 mb-2">
            {formData.role === 'student' ? (
              <i className="fas fa-user-graduate"></i>
            ) : (
              <i className="fas fa-chalkboard-teacher"></i>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Sign in to your {formData.role === 'student' ? 'Student' : 'Lecturer'} account
          </h2>
          <p className="text-gray-600 mt-2">
            Enter your {getPlaceholder().toLowerCase()} and password
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-gray-700 mb-2 font-semibold">I am a:</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  formData.role === 'student'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                <i className="fas fa-user-graduate mr-2"></i> Student
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'advisor' })}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  formData.role === 'advisor'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                }`}
              >
                <i className="fas fa-chalkboard-teacher mr-2"></i> Lecturer
              </button>
            </div>
          </div>

          {/* Identifier Input */}
          <div>
            <label htmlFor="identifier" className="block text-gray-700 mb-2 font-semibold">
              {getInputLabel()} *
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              placeholder={getPlaceholder()}
              value={formData.identifier}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2 font-semibold">
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i> Signing In...
              </>
            ) : (
              `Sign in as ${formData.role === 'student' ? 'Student' : 'Lecturer'}`
            )}
          </button>
        </form>

        <div className="text-center mt-6 space-y-3">
          <p className="text-gray-600">
            Don't have an account?{' '}
            {formData.role === 'student' ? (
              <Link to="/student-register" className="text-blue-600 hover:text-blue-800 font-semibold">
                Register as Student
              </Link>
            ) : (
              <Link to="/lecturer-register" className="text-green-600 hover:text-green-800 font-semibold">
                Register as Lecturer
              </Link>
            )}
          </p>

          <Link to="/" className="inline-block text-gray-600 hover:text-gray-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
