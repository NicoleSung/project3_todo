import React from 'react';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <a href="/dashboard">Back to Dashboard</a>
    </div>
  );
}
