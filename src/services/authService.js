// Normalize API URL: accept VITE_API_URL with or without trailing slash or '/api'
// Fallback to production backend (Render) — not old Vercel backend
let API_URL = import.meta.env.VITE_API_URL || 'https://backend-ourrecepi2.onrender.com/api';
API_URL = API_URL.trim();
if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);
if (!API_URL.endsWith('/api')) API_URL = API_URL + '/api';

const authService = {
  // Register
  register: async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      // Simpan token ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Login
  login: async (name, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      // Simpan token ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan');

      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data user');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan');

      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal logout');
      }

      // Hapus token dari localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Cek apakah user sudah login
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;
