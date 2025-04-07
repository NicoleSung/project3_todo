import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './auth.module.css';

export default function Register() {
  const [form, setForm] = useState<{ username: string; password: string }>({
    username: '',
    password: '',
  });

  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', 
      body: JSON.stringify(form),
    });

    const data = await res.json();

    //debug line
    console.log('Register status:', res.status, 'data:', data);

    if (!res.ok) {
      setError(data.error || 'Registration failed');
    } else {
      navigate('/login'); 
    }
  };

  return (
    <div className={styles['register-container']}>
      <div className={styles['register-logo']}>
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

      <h1>Register</h1>
      <p className={styles.muted}>Help manage your day better!</p>

      {error && (
        <ul className={styles['flash-messages']}>
          <li>{error}</li>
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input name="username" type="text" placeholder="mail@example.com" required onChange={handleChange} />

        <label>Password</label>
        <input name="password" type="password" required onChange={handleChange} />

        <button type="submit">Register</button>
      </form>

      <div className={styles.link}>
        Already have an account? <a href="/login">Login here</a>
      </div>
    </div>
  );
}
