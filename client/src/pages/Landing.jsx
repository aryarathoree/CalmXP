import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="container">
          <h1 className="logo">CalmXP</h1>
          <nav className="nav">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link nav-link-primary">Sign Up</Link>
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h2 className="hero-title">
                Track Your Progress with
                <span className="highlight"> Calm Focus</span>
              </h2>
              <p className="hero-description">
                Experience a peaceful approach to productivity. CalmXP helps you build habits, 
                track goals, and celebrate achievements in a serene, distraction-free environment.
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary">Get Started</Link>
                <Link to="/login" className="btn btn-secondary">Sign In</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2025 CalmXP. Find your peaceful productivity.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 