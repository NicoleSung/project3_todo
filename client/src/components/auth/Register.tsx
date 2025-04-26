// import React, { useState, ChangeEvent, FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
// import styles from './auth.module.css';
// import UserPool from '../../awsConfig';

// export default function Register() {
//   const [form, setForm] = useState<{ username: string; password: string }>({
//     username: '',
//     password: '',
//   });

//   const [error, setError] = useState<string>('');
//   const navigate = useNavigate();

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     UserPool.signUp(form.username, form.password, [], null, (err, data) => {
//       if (err) {
//         console.error('Registration error:', err);
//         setError(err.message || 'Registration failed');
//       } else {
//         console.log('Registration success', data);
//         navigate('/login');
//       }
//     });
//   };

//   return (
//     <div className={styles['register-container']}>
//       <div className={styles['register-logo']}>
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

//       <h1>Register</h1>
//       <p className={styles.muted}>Help manage your day better!</p>

//       {error && (
//         <ul className={styles['flash-messages']}>
//           <li>{error}</li>
//         </ul>
//       )}

//       <form onSubmit={handleSubmit}>
//         <label>Email</label>
//         <input name="username" type="text" placeholder="mail@example.com" required onChange={handleChange} />

//         <label>Password</label>
//         <input name="password" type="password" required onChange={handleChange} />

//         <button type="submit">Register</button>
//       </form>

//       <div className={styles.link}>
//         Already have an account? <a href="/login">Login here</a>
//       </div>
//     </div>
//   );
// }


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

  // Real-time password checks
  const isLongEnough = form.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(form.password);
  const hasLowercase = /[a-z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    UserPool.signUp(form.username, form.password, [], null, (err, data) => {
      if (err) {
        console.error('Registration error:', err);

        if (err.code === 'InvalidPasswordException') {
          setError('Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.');
        } else {
          setError(err.message || 'Registration failed');
        }

      } else {
        console.log('Registration success', data);
        navigate('/login');
      }
    });
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
        <input
          name="username"
          type="text"
          placeholder="mail@example.com"
          required
          onChange={handleChange}
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          required
          onChange={handleChange}
        />

        {/* Password live validation */}
        <div className={styles['password-requirements']}>
          <ul>
            <li style={{ color: isLongEnough ? 'green' : 'red' }}>
              {isLongEnough ? '✅' : '❌'} At least 8 characters
            </li>
            <li style={{ color: hasUppercase ? 'green' : 'red' }}>
              {hasUppercase ? '✅' : '❌'} At least one uppercase letter
            </li>
            <li style={{ color: hasLowercase ? 'green' : 'red' }}>
              {hasLowercase ? '✅' : '❌'} At least one lowercase letter
            </li>
            <li style={{ color: hasNumber ? 'green' : 'red' }}>
              {hasNumber ? '✅' : '❌'} At least one number
            </li>
            <li style={{ color: hasSpecialChar ? 'green' : 'red' }}>
              {hasSpecialChar ? '✅' : '❌'} At least one special character
            </li>
          </ul>
        </div>

        <button type="submit">Register</button>
      </form>

      <div className={styles.link}>
        Already have an account? <a href="/login">Login here</a>
      </div>
    </div>
  );
}
