import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    role: "investigator"
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Login successful! Redirecting to dashboard...");
        console.log("User logged in:", data.user);
        
        // Use central login with token
        login(data.user, data.token);

        // Role-based redirection (CRITICAL)
        setTimeout(() => {
          if (data.user.role === "admin") {
            navigate("/admin/dashboard");
          }
          if (data.user.role === "investigator") {
            navigate("/investigator/dashboard");
          }
          if (data.user.role === "legal_advisor") {
            navigate("/legal/dashboard");
          }
        }, 1500);
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="form-box">
        <h2>Login</h2>
        
        {message && (
          <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username or Email</label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="admin">Admin</option>
              <option value="investigator">Investigator</option>
              <option value="legal_advisor">Legal Advisor</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Don't have an account? 
            <button 
              onClick={() => navigate('/signup')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#3b82f6', 
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Sign up here
            </button>
          </p>
          <p>
            Need to verify your account? 
            <button 
              onClick={() => navigate('/verify-otp')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#3b82f6', 
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Verify OTP
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
