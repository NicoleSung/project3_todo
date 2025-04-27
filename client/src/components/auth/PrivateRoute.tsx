// import React, { useEffect, useState } from 'react';
// import { Navigate } from 'react-router-dom';

// interface Props {
//   children: JSX.Element;
// }

// const PrivateRoute = ({ children }: Props) => {
//   const [authChecked, setAuthChecked] = useState(false);
//   const [authenticated, setAuthenticated] = useState(false);

//   useEffect(() => {
//     fetch('/api/auth/me', {
//       method: 'GET',
//       credentials: 'include',
//     })
//       .then(res => {
//         if (res.ok) {
//           setAuthenticated(true);
//         } else {
//           setAuthenticated(false);
//         }
//         setAuthChecked(true);
//       })
//       .catch(() => {
//         setAuthenticated(false);
//         setAuthChecked(true);
//       });
//   }, []);

//   if (!authChecked) return <div>Loading...</div>;
//   return authenticated ? children : <Navigate to="/login" replace />;
// };

// export default PrivateRoute;


import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';

interface Props {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: Props) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          setAuthenticated(false);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.authenticated) {
          setAuthenticated(true);
        }
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  if (!authChecked) return <div>Loading...</div>;
  return authenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;