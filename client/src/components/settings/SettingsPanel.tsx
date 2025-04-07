import React, { useEffect, useState } from 'react';
import './settings.css';

export default function SettingsPanel() {
  const [defaultView, setDefaultView] = useState<'day' | 'week'>('day');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [status, setStatus] = useState('');

  const fetchSettings = async () => {
    const res = await fetch('/api/user/settings', { credentials: 'include' });
    const data = await res.json();
    if (data) {
      setDefaultView(data.default_view || 'day');
      setNotificationsEnabled(!!data.notifications_enabled);
    }
  };

  const saveSettings = async () => {
    const res = await fetch('/api/user/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        default_view: defaultView,
        notifications_enabled: notificationsEnabled
      })
    });

    if (res.ok) {
      setStatus('Settings saved.');
      setTimeout(() => setStatus(''), 3000);
    } else {
      setStatus('Failed to save settings.');
    }
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
    </div>
  );
}