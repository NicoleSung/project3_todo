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

        const idToken = session.getIdToken().getJwtToken();
        localStorage.setItem('accessToken', idToken);

        apiFetch('/api/auth/me')
          .then(res => res.json())
          .then(({ authenticated, user }) => {
            if (authenticated) {
              console.log('Auth OK:', user);
              navigate('/dashboard');
            } else {
              setError('Authentication check failed.');
            }
          })
          .catch(err => {
            console.error('Auth.me error:', err);
            setError('Unable to verify session.');
          });
      },
      onFailure: (err) => {
        console.error('Login failed:', err);
        setError(err.message || 'Login failed');
      },
    });
  };

  return (
    <div className={styles['login-container']}>
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
