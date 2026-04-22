import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("signup"); // signup → otp
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "investigator"
  });

  const [otp, setOtp] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP sent to your email! Please verify below.");
        setStep("otp");
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(data.message || "OTP verification failed");
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
        <h2>{step === "signup" ? "Sign Up" : "Verify OTP"}</h2>
        
        {message && (
          <div className={`message ${message.includes("successful") || message.includes("OTP sent") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        {step === "signup" && (
          <form onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
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
              {loading ? "Sending OTP..." : "Sign Up"}
            </button>
            
            <div className="auth-links">
              <p>
                Already have an account? 
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#3b82f6', 
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Login here
                </button>
              </p>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit}>
            <p className="form-description" style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              We've sent a code to <strong>{formData.email}</strong>. Entering it below ensures you're legit. 🕵️‍♂️
            </p>
            
            <div className="form-group">
              <label>OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? "Verifying..." : "Verify & Complete Signup"}
            </button>

            <button 
              type="button"
              onClick={() => setStep("signup")} 
              className="auth-btn secondary"
              style={{ marginTop: '1rem', background: 'transparent', border: '1px solid #334155' }}
            >
              Back to Registration
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default Signup;
