import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./Dashboard.css";
import Navigation from "../components/Navigation";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [checkInData, setCheckInData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckInPopup, setShowCheckInPopup] = useState(false);

  useEffect(() => {
    fetchCheckInData();
  }, []);

  useEffect(() => {
    if (checkInData?.currentMonth?.hasCheckedInToday) {
      setShowCheckInPopup(true);
      const timer = setTimeout(() => setShowCheckInPopup(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [checkInData]);

  const fetchCheckInData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/auth/checkins", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCheckInData(response.data);
    } catch (error) {
      console.error("Error fetching check-in data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const renderCalendar = () => {
    if (!checkInData) return null;
    const { currentMonth } = checkInData;
    const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
    const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const days = [];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isCheckedIn = currentMonth.checkedDays.includes(day);
      const isToday = day === new Date().getDate() && 
                     currentMonth.month === new Date().getMonth() + 1 &&
                     currentMonth.year === new Date().getFullYear();
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isCheckedIn ? 'checked-in' : ''} ${isToday ? 'today' : ''}`}
        >
          {day}
          {isCheckedIn && <div className="check-mark">✓</div>}
        </div>
      );
    }
    return (
      <div className="calendar-container">
        <h3 className="calendar-title">
          {monthNames[currentMonth.month - 1]} {currentMonth.year}
        </h3>
        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {days}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div>
        <header className="dashboard-header">
          <div className="user-info">
            <h1 style={{marginRight: 'auto'}}>Welcome back, {user?.username}!</h1>
            <button onClick={logout} className="logout-btn" style={{marginLeft: 'auto'}}>Logout</button>
          </div>
        </header>
        <div className="dashboard-content two-column-layout">
          <div className="dashboard-left">
            <div className="hero-section">
              <div className="user-welcome">
                <h2>Your Progress Journey</h2>
                <p>Keep building your mindful habits</p>
              </div>
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-content">
                    <h3>{user?.xp || 0}</h3>
                    <p>Total XP</p>
                  </div>
                  <div className="stat-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${((user?.xp || 0) % 100)}%`}}
                      ></div>
                    </div>
                    <span className="progress-text">{100 - ((user?.xp || 0) % 100)} XP to Level {(user?.level || 1) + 1}</span>
                  </div>
                </div>
                <div className="stat-card secondary">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-content">
                    <h3>Level {user?.level || 1}</h3>
                    <p>Current Level</p>
                  </div>
                </div>
                <div className="stat-card accent">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <h3>{checkInData?.currentMonth?.totalCheckIns || 0}</h3>
                    <p>This Month</p>
                  </div>
                </div>
                <div className="stat-card highlight">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-content">
                    <h3>{checkInData?.user?.totalCheckIns || 0}</h3>
                    <p>Total Check-ins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-right">
            <div className="calendar-section">
              <div className="section-header">
                <h2>Monthly Check-in Calendar</h2>
                <p>Track your consistency and build lasting habits</p>
              </div>
              <div className="calendar-container">
                {renderCalendar()}
              </div>
              <div className="calendar-legend">
                <div className="legend-item">
                  <div className="legend-box checked"></div>
                  <span>Checked In</span>
                </div>
                <div className="legend-item">
                  <div className="legend-box today"></div>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showCheckInPopup && (
          <div className="checkin-popup">
            <div className="status-icon">🎉</div>
            <div className="status-content">
              <h3>Daily Check-in Complete!</h3>
              <p>You've earned your daily 10 XP. Come back tomorrow for more!</p>
            </div>
            <button className="close-popup" onClick={() => setShowCheckInPopup(false)}>&times;</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
