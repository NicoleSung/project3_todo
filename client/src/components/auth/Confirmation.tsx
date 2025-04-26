// import React, { useState, ChangeEvent, FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
// import styles from './auth.module.css';
// import UserPool from '../../awsConfig';
// import { CognitoUser } from 'amazon-cognito-identity-js';

// export default function Confirm() {
//   const [form, setForm] = useState<{ username: string; code: string }>({
//     username: '',
//     code: '',
//   });
//   const [error, setError] = useState<string>('');
//   const navigate = useNavigate();

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError(''); // Clear any previous error

//     const user = new CognitoUser({
//       Username: form.username,
//       Pool: UserPool,
//     });

//     user.confirmRegistration(form.code, true, (err, data) => {
//       if (err) {
//         console.error('[Confirm]', err);
//         setError(err.message || 'Confirmation failed.');
//       } else {
//         console.log('User confirmed successfully', data);
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

//       <h1>Confirm Account</h1>
//       <p className={styles.muted}>Please enter the code sent to your email.</p>

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
//           placeholder="mail@example.com"
//           required
//           value={form.username}
//           onChange={handleChange}
//         />

//         <label>Confirmation Code</label>
//         <input
//           name="code"
//           type="text"
//           placeholder="Enter your code"
//           required
//           value={form.code}
//           onChange={handleChange}
//         />

//         <button type="submit">
//           Confirm Account
//         </button>
//       </form>

//       <div className={styles.link}>
//         Already confirmed? <a href="/login">Login here</a>
//       </div>
//     </div>
//   );
// }

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './auth.module.css';
import UserPool from '../../awsConfig';
import { CognitoUser } from 'amazon-cognito-identity-js';

type LocationState = {
  username?: string;
};

export default function Confirm() {
  const navigate = useNavigate();
  const location = useLocation<LocationState>();

  // Initialize username from location.state if available
  const [form, setForm] = useState<{ username: string; code: string }>({
    username: location.state?.username || '',
    code: '',
  });
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<string>('');

  // Keep form.username in sync if location.state changes
  useEffect(() => {
    if (location.state?.username) {
      setForm(f => ({ ...f, username: location.state!.username! }));
    }
  }, [location.state]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setInfo('');

    const user = new CognitoUser({
      Username: form.username,
      Pool: UserPool,
    });

    user.confirmRegistration(form.code, true, (err, data) => {
      if (err) {
        console.error('[Confirm]', err);
        setError(err.message || 'Confirmation failed.');
      } else {
        console.log('User confirmed successfully', data);
        navigate('/login');
      }
    });
  };

  const handleResend = () => {
    setError('');
    setInfo('');

    const user = new CognitoUser({
      Username: form.username,
      Pool: UserPool,
    });

    user.resendConfirmationCode((err, data) => {
      if (err) {
        console.error('[Resend]', err);
        setError(err.message || 'Failed to resend code.');
      } else {
        console.log('Resend code success', data);
        setInfo(`Confirmation code resent to ${form.username}.`);
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

      <h1>Confirm Account</h1>
      <p className={styles.muted}>Please enter the code sent to your email.</p>

      {error && (
        <ul className={styles['flash-messages']}>
          <li>{error}</li>
        </ul>
      )}
      {info && (
        <ul className={styles['flash-messages']}>
          <li style={{ color: 'green' }}>{info}</li>
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

        <label>Confirmation Code</label>
        <input
          name="code"
          type="text"
          placeholder="Enter your code"
          required
          value={form.code}
          onChange={handleChange}
        />

        <button type="submit">
          Confirm Account
        </button>
      </form>

      <div className={styles.link}>
        <button
          type="button"
          onClick={handleResend}
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0 }}
        >
          Resend code?
        </button>
      </div>

      <div className={styles.link}>
        Already confirmed? <a href="/login">Login here</a>
      </div>
    </div>
  );
}
