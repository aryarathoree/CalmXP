import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/journaling', label: 'Journaling', icon: '📝' },
    { path: '/calm-loop', label: 'Calm Loop', icon: '🧘‍♀️' }
  ];
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  return (
    <>
      <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Open navigation">
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
      </button>
      <nav className={`main-navigation overlay-nav${open ? ' open' : ''}`} ref={sidebarRef}>
        <div className="nav-container">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      {open && <div className="nav-backdrop" onClick={() => setOpen(false)}></div>}
    </>
  );
};

export default Navigation; 