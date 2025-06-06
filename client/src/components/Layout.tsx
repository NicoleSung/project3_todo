import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaCog, FaBars  } from 'react-icons/fa';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout-container">
      <button id="sidebarToggle" onClick={toggleSidebar}>
      <FaBars size={20} color="#fff" />
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="dashboard-logo">
          <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            style={{ marginRight: '0.5rem' }}
          >
            <path
              d="M4 12l4.5 4.5L14 8l6 6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>To-Do</span>
        </div>

        <nav>
          <ul>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                <FaHome className="icon" />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/calendar" className={({ isActive }) => (isActive ? 'active' : '')}>
                <FaCalendarAlt className="icon" />
                Calendar
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
                <FaCog className="icon" />
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
