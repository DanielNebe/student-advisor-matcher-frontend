// src/pages/NotFound.jsx
import React from "react";
import "../styles/appStyles.css";

export default function NotFound() {
  return (
    <div className="page-wrap center">
      <div className="card small">
        <h1>404</h1>
        <p>Page not found.</p>
        <a href="/" className="btn-primary">Go Home</a>
      </div>
    </div>
  );
}
