import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import authService, { User } from '../services/auth';
import { LoadingScreen } from '../components/LoadingScreen';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authTimeout, setAuthTimeout] = useState(false);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Configurar el interceptor de autenticación
      authService.setupAuthInterceptor();
      
      // Verificar si hay un token guardado
      const token = authService.getToken();
      const savedUser = authService.getUser();
      
      if (token && savedUser) {
        // Si tenemos token y usuario guardado, usar los datos guardados primero
        setUser(savedUser);
        
        // Luego verificar en segundo plano si el token sigue siendo válido
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Token inválido, limpiar estado
            setUser(null);
          }
        } catch (error) {
          console.error('Error validating token:', error);
          // Mantener el usuario guardado si hay error de red
          if (!navigator.onLine) {
            console.log('Offline mode - using cached user data');
          } else {
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Login directo sin depender del sistema de refresh
      const response = await authService.login({ email, password });
      setUser(response.user);
      
      // Redirigir al dashboard después del login exitoso
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      
      // Redirigir al login después del logout
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Aún así limpiar el estado local
      setUser(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleAuthTimeout = () => {
    console.log('⏰ Timeout de autenticación alcanzado');
    setAuthTimeout(true);
    setIsLoading(false);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth
  };

  // Mostrar pantalla de carga con timeout
  if (isLoading && !authTimeout) {
    return (
      <LoadingScreen 
        message="Verificando autenticación..." 
        timeout={8}
        onTimeout={handleAuthTimeout}
      />
    );
  }

  // Si hay timeout, mostrar mensaje y redirigir al login
  if (authTimeout) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      router.push('/login');
    }
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



