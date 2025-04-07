import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <h1 className="logo">To-Do</h1>
        <nav>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/calendar">Calendar</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}