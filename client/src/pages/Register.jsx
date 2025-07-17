import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", form);
      setMessage(res.data.msg || "Registration successful");
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Registration failed");
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
            <Link to="/login">Login</Link>
          </nav>
        </div>
      </header>
      <div className="auth-container">
        <h2>Join CalmXP</h2>
      <form onSubmit={handleRegister} className="auth-form">
        <input 
          type="text" 
          name="username" 
          placeholder="Username" 
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          required 
        />
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
          autoComplete="new-password"
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {message && <p className="message">{message}</p>}
      </form>
        <div className="auth-links">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </>
  );
};

export default Register;
