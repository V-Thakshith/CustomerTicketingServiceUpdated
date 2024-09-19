import api from './api';
import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null); // State for handling errors

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/users/me');
        setUser(data);
        console.log(user)
        
      } catch (err) {
        // Handle errors, e.g., redirect to login or show a message
        setError(err.response?.data?.msg || 'An error occurred');
      } finally {
        setReady(true);
      }
    };

    fetchUser();
  }, []); // Dependency array is correct to ensure it runs only on mount

  return (
    <UserContext.Provider value={{ user, setUser, ready, error }}>
      {children}
    </UserContext.Provider>
  );
}
