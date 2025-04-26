export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken');
    const headers = {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  
    const response = await fetch(endpoint, { ...options, headers });
    return response;
  }
  