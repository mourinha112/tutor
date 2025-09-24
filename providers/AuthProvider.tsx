import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { apiPost } from '@/config/api';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  xp: number;
  streak: number;
  joinDate: Date;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResult = {
  success: boolean;
  message?: string;
};

// Dados mockup para demonstração
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    level: 'Intermediário',
    xp: 1250,
    streak: 15,
    joinDate: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    level: 'Iniciante',
    xp: 420,
    streak: 7,
    joinDate: new Date('2024-03-10'),
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@email.com',
    level: 'Avançado',
    xp: 3850,
    streak: 42,
    joinDate: new Date('2023-11-20'),
  },
];

export const [AuthProvider, useAuthStore] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        // Converter joinDate string de volta para Date
        parsedUser.joinDate = new Date(parsedUser.joinDate);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    // First try the PHP backend
    try {
  const resp = await apiPost('backend/login.php', { email: credentials.email, password: credentials.password });
      // Expecting { success: boolean, user?: {...} }
      if (resp && resp.success && resp.user) {
        const userFromServer = resp.user as User;
        // Ensure joinDate is a Date
        if (userFromServer.joinDate) userFromServer.joinDate = new Date(userFromServer.joinDate);
        setUser(userFromServer);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('user_data', JSON.stringify(userFromServer));
        if (resp.token) await AsyncStorage.setItem('api_token', String(resp.token));
        return { success: true };
      }
      if (resp && !resp.success && resp.message) {
        return { success: false, message: String(resp.message) };
      }
    } catch (err: unknown) {
      // If backend is unreachable or returns error, we'll fallback to mock users below
      const msg = err && typeof err === 'object' && 'message' in err ? (err as any).message : String(err);
      console.warn('Backend login failed, falling back to local mock auth:', msg);
    }

    // Fallback to local mock users (offline/demo)
  try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));
      const foundUser = MOCK_USERS.find(u => u.email === credentials.email);
      if (foundUser && credentials.password === '123456') {
        setUser(foundUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('user_data', JSON.stringify(foundUser));
        // No token in mock mode
        return { success: true };
      }
      return { success: false, message: 'Email ou senha incorretos.' };
    } catch (error) {
      console.error('Login fallback error:', error);
      return { success: false, message: 'Erro no login.' };
    }
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; }): Promise<LoginResult> => {
    try {
  const resp = await apiPost('backend/register.php', { name: data.name, email: data.email, password: data.password });
      if (resp && resp.success && resp.user) {
        const userFromServer = resp.user as User;
        if (userFromServer.joinDate) userFromServer.joinDate = new Date(userFromServer.joinDate);
        setUser(userFromServer);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('user_data', JSON.stringify(userFromServer));
        if (resp.token) await AsyncStorage.setItem('api_token', String(resp.token));
        return { success: true };
      }
      return { success: false, message: resp.message || 'Erro ao registrar' };
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? (err as any).message : String(err);
      console.warn('Register failed:', msg);
      return { success: false, message: 'Erro de rede' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('api_token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const updateUserXP = useCallback(async (xpGained: number) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      xp: user.xp + xpGained,
    };
    
    setUser(updatedUser);
    await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
  }, [user]);

  const updateStreak = useCallback(async () => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      streak: user.streak + 1,
    };
    
    setUser(updatedUser);
    await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
  }, [user]);

  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    login,
  register,
    logout,
    updateUserXP,
    updateStreak,
    mockUsers: MOCK_USERS, // Para referência nas credenciais
  }), [user, isLoading, isAuthenticated, login, logout, updateUserXP, updateStreak]);
});