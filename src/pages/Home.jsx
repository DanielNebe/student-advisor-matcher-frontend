import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🎓 Student Advisor Matcher
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect students with the perfect academic advisors based on research interests and career goals.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8">
              <div className="text-6xl text-blue-600 mb-4">
                <i className="fas fa-user-graduate"></i>
              </div>
              <h3 className="text-2xl font-bold text-blue-800 mb-3">For Students</h3>
              <p className="text-blue-700 mb-4">
                Register and find advisors who match your academic interests and research goals.
              </p>
              <Link 
                to="/student-register"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Student Registration
              </Link>
            </div>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8">
              <div className="text-6xl text-green-600 mb-4">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-3">For Lecturers</h3>
              <p className="text-green-700 mb-4">
                Register as an advisor and connect with students who share your research expertise.
              </p>
              <Link 
                to="/lecturer-register"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Lecturer Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;