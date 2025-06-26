import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/user', {
          withCredentials: true
        });
        setUser(response.data);
      } catch (err) {
        setError('Not authenticated');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = () => {
    window.location.href = 'http://localhost:3000/auth/gitlab';
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      setError('Failed to logout');
    }
  };

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    try {
      const response = await axios.post(
        '/api/user/preferences',
        { preferences },
        { withCredentials: true }
      );
      setUser(response.data);
    } catch (err) {
      setError('Failed to update preferences');
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    updatePreferences
  };
} 