// import React, { useState, ChangeEvent, FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
// import styles from './auth.module.css';

// export default function Login() {
//   const [form, setForm] = useState({ username: '', password: '' });
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const res = await fetch('/api/auth/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify(form),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       setError(data.error || 'Login failed');
//     } else {
      
//       navigate('/dashboard');
//     }
//   };

//   return (
//     <div className={styles['login-container']}>
//       <div className={styles['login-logo']}>
//         <svg fill="currentColor" viewBox="0 0 24 24">
//           <path
//             d="M4 12l4.5 4.5L14 8l6 6"
//             stroke="currentColor"
//             strokeWidth="2"
//             fill="none"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>
//         <span>To-Do</span>
//       </div>

//       <h1>Login</h1>
//       <p className={styles.muted}>Sign in to efficiently manage your day!</p>

//       {error && (
//         <ul className={styles['flash-messages']}>
//           <li>{error}</li>
//         </ul>
//       )}

//       <form onSubmit={handleSubmit}>
//         <label>Email</label>
//         <input
//           name="username"
//           type="text"
//           value={form.username}
//           onChange={handleChange}
//           required
//         />

//         <label>Password</label>
//         <input
//           name="password"
//           type="password"
//           value={form.password}
//           onChange={handleChange}
//           required
//         />

//         <button type="submit">Sign in</button>
//       </form>

//       <div className={styles.link}>
//         Don’t have an account? <a href="/register">Register here</a>

//       </div>
//     </div>
//   );
// }


import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './auth.module.css';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import UserPool from '../../awsConfig';
import { apiFetch } from '../../utils/api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user = new CognitoUser({
      Username: form.username,
      Pool: UserPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: form.username,
      Password: form.password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        console.log('Login successful!');
        console.log('Access token:', session.getAccessToken().getJwtToken());

        // Optionally save token to localStorage
        localStorage.setItem('accessToken', session.getAccessToken().getJwtToken());

        // Fetch dashboard data after successful login
        const fetchDashboardData = async () => {
          try {
            const res = await apiFetch('/api/dashboard');
            const data = await res.json();
            console.log('Dashboard data:', data);
            // Handle dashboard data here, e.g., update state
          } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setError('Failed to fetch dashboard data.');
          }
        };

        fetchDashboardData();
        
        navigate('/dashboard');
      },
      onFailure: (err) => {
        console.error('Login failed:', err);
        setError(err.message || 'Login failed');
      },
    });
  };

  return (
    <div className={styles['login-container']}>
      {/* unchanged visual stuff */}
      <div className={styles['login-logo']}>
        <svg fill="currentColor" viewBox="0 0 24 24">
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

      <h1>Login</h1>
      <p className={styles.muted}>Sign in to efficiently manage your day!</p>

      {error && (
        <ul className={styles['flash-messages']}>
          <li>{error}</li>
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Sign in</button>
      </form>

      <div className={styles.link}>
        Don’t have an account? <a href="/register">Register here</a>
      </div>
    </div>
  );
}
