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
        <h1 className="landing-main-title">CalmXP</h1>
        <section className="features">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h4>Journaling</h4>
              <p>Reflect, write, and track your thoughts and progress in a private, calming space.</p>
              </div>
            <div className="feature-card">
              <div className="feature-icon">🧘‍♀️</div>
              <h4>Calm Loop Game</h4>
              <p>Practice mindfulness with guided breathing, focus games, and mood tracking.</p>
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