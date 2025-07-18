import React from 'react';
import CalmLoop from '../components/CalmLoop';
import Navigation from '../components/Navigation';
import './CalmLoopPage.css';

const CalmLoopPage = () => {
  return (
    <div className="calm-loop-page-container">
      <Navigation />
      <div className="calm-loop-page">
        <div className="page-header">
          <h1>Calm Loop</h1>
          <p>Take a mindful break with breathing exercises and focus games</p>
        </div>
        <CalmLoop />
      </div>
    </div>
  );
};

export default CalmLoopPage; 