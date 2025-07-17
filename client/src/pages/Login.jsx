import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="auth-header">
        <div className="container">
          <Link to="/" className="logo">CalmXP</Link>
          <nav className="auth-nav">
            <Link to="/register">Sign Up</Link>
          </nav>
        </div>
      </header>
      <div className="auth-container">
        <h2>Welcome Back</h2>
      <form onSubmit={handleLogin} className="auth-form">
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {message && <p className="message">{message}</p>}
      </form>
        <div className="auth-links">
          <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
        </div>
      </div>
    </>
  );
};

export default Login;
