import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function useDeviceContext() {
  const getDeviceInfo = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.screen.orientation?.type || 'unknown',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
  const [location, setLocation] = useState({ latitude: null, longitude: null, error: null });

  useEffect(() => {
    const handleResize = () => setDeviceInfo(getDeviceInfo());
    const handleOrientation = () => setDeviceInfo(getDeviceInfo());

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientation);

    // Get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null
          });
        },
        (err) => {
          setLocation({ latitude: null, longitude: null, error: err.message });
        }
      );
    } else {
      setLocation({ latitude: null, longitude: null, error: 'Geolocation not supported' });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, []);

  return { ...deviceInfo, ...location };
}

export default function DeviceInfoView() {
  const { width, height, orientation, latitude, longitude, error } = useDeviceContext();
  const navigate = useNavigate();

  return (
    <div>
      <h2>Screen Width: {width}px</h2>
      <h2>Screen Height: {height}px</h2>
      <h2>Orientation: {orientation}</h2>
      <h2>Latitude: {latitude}</h2>
      <h2>Longitude: {longitude}</h2>
      <h2>Time Zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</h2>
      {error && <p>Error: {error}</p>}
      <button onClick={() => navigate('/settings')}>Return to Settings</button>
    </div>
  );
};