import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './auth.module.css';
import UserPool from '../../awsConfig';

export default function Register() {
  const [form, setForm] = useState<{ username: string; password: string }>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // Live password‐requirement checks
  const isLongEnough = form.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(form.password);
  const hasLowercase = /[a-z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);
  const allValid = isLongEnough && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    console.log('handleSubmit called'); // Check if the function is triggered
    e.preventDefault();
    setError(''); // clear previous error

    UserPool.signUp(form.username, form.password, [], null, (err, data) => {
      if (err) {
        console.log('!!! SIGNUP CALLBACK - ERROR BLOCK ENTERED !!!'); 
        console.error('[Register] Error Object:', err); // Log the full error object


        // Show friendly helper if password fails policy
        if (
          err.code === 'InvalidPasswordException' ||
          (typeof err.message === 'string' &&
            err.message.toLowerCase().includes('password did not conform'))
        ) {
          setError(
            'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.'
          );
        } else {
          setError(err.message || 'Registration failed');
        }
        return;
      }

      console.log('Registration success', data);

      // Redirect to confirmation page, passing the username
      navigate('/register/confirm', { state: { username: form.username } });
    });
  };

  console.log('Rendering Register component, allValid:', allValid); // Log the value of allValid to check if it's being calculated correctly

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
        <input
          name="username"
          type="text"
          placeholder="mail@example.com"
          required
          value={form.username}
          onChange={handleChange}
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
        />

        {/* <button type="submit" 
        // disabled={!allValid}
        > */}

        <button
        type="submit"
        // disabled={!allValid} // Keep disabled commented out for testing
        onClick={() => {
          console.log('Register BUTTON CLICKED!'); // Add this log
        }}
        >
          Register
        </button>
      </form>

      <button 
      onClick={() => console.log('SIMPLE BUTTON CLICKED')}
      style={{
        backgroundColor: 'red',
        color: 'white',
        padding: '10px',
        margin: '10px 0',
        border: '2px solid black',
        width: '100%'
        }}
      >
      Test Click Me
      </button>

      <div className={styles.link}>
        Already have an account? <a href="/login">Login here</a>
      </div>
    </div>
  );
}
