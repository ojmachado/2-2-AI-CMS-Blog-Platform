import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({} as User),
  logout: () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
        // A única fonte de verdade agora é o localStorage gerenciado pelo authService
        const storedUser = localStorage.getItem('mock_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setAppUser(parsedUser);
            } catch (e) {
                localStorage.removeItem('mock_user');
                setAppUser(null);
            }
        } else {
            setAppUser(null);
        }
        setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const user = await authService.login(email, password);
    setAppUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logout(); // authService lida com a limpeza do localStorage e recarregamento
    setAppUser(null);
  };

  return (
    <AuthContext.Provider value={{ user: appUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);