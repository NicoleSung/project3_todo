import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/settings/settings.module.css';

export default function SettingsPanel() {
  const [defaultView, setDefaultView] = useState<'day' | 'week'>('day');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  // Fetch user settings on mount
  const fetchSettings = async () => {
    const res = await fetch('/api/settings', { credentials: 'include' });
    const data = await res.json();
    console.log('Settings data received:', data);
    if (data) {
      setDefaultView(data.default_view);
      setNotificationsEnabled(!!data.notifications_enabled);
      setUsername(data.username);
    }
  };

  // Save user settings
  const saveSettings = async () => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        default_view: defaultView,
        notifications_enabled: notificationsEnabled,
      }),
    });

    if (res.ok) {
      setStatus('Settings saved.');
      setTimeout(() => setStatus(''), 3000);
    } else {
      setStatus('Failed to save settings.');
    }
  };

  // Log out user
  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/login';
  };

  useEffect(() => {
    fetchSettings();
  }, []);


const displayDeviceInfo = () => { // Display device information
  navigate('/settings/device-info');
};

  return (
    <div className="settings-panel">
      <h2>Account</h2>
      <div className="account-info">
        <input type="email" value={username} readOnly />
        <button onClick={logout}>Log Out</button>
      </div>

      <h2>Preferences</h2>
      <div className="settings-grid">
        <div className="setting-item row">
          <label htmlFor="view">Default Calendar View</label>
          <select
            id="view"
            value={defaultView}
            onChange={(e) => setDefaultView(e.target.value as 'day' | 'week')}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
          </select>
        </div>

        <div className="setting-row spaced">
          <span>Enable Notifications</span>
          <input
            id="notify"
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
          />
        </div>

      </div>

      <button onClick={saveSettings}>Save Settings</button>

      <div className={`status-message ${status ? 'show' : ''}`}>
        {status}
      </div>

      <h2>Device Information</h2>
      <div className="device-info">
      </div>
      <button onClick={displayDeviceInfo}>More</button>

    </div>
  );
}
