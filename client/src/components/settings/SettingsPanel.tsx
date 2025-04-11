import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './settings.module.css';

export default function SettingsPanel() {
  const navigate = useNavigate();
  const [defaultView, setDefaultView] = useState<'day' | 'week'>('day');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');

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

  return (
    <div className="settings-panel">
      <h2>User Settings</h2>

      <div className="setting-item">
        <label>Default Calendar View:</label>
        <select value={defaultView} onChange={(e) => setDefaultView(e.target.value as 'day' | 'week')}>
          <option value="day">Day</option>
          <option value="week">Week</option>
        </select>
      </div>

      <div className="setting-item">
        <label>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
          />
          Enable Notifications
        </label>
      </div>

        <button onClick={saveSettings}>Save Settings</button>
        {status && <p>{status}</p>}
      

      <div className="settings-panel">
        <h2>User Device</h2>
        <p><b>Get device information</b></p>
        <button onClick={() => navigate('/settings/device-info')}>Device Info</button>
      </div>     
      </div>
    </>
  );
}
