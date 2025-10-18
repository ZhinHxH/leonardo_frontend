import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/auth';

export const useTokenRefresh = () => {
  const { isAuthenticated, logout } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Configurar refresh automático cada 25 minutos (5 minutos antes de que expire)
      intervalRef.current = setInterval(async () => {
        try {
          console.log('🔄 Intentando refresh automático del token...');
          const success = await authService.refreshTokenManually();
          
          if (success) {
            console.log('✅ Token refrescado exitosamente');
          } else {
            console.log('❌ Error refrescando token, cerrando sesión');
            await logout();
          }
        } catch (error) {
          console.error('Error en refresh automático:', error);
          await logout();
        }
      }, 25 * 60 * 1000); // 25 minutos

      // También verificar al inicio si el token necesita refresh
      const checkTokenOnMount = async () => {
        try {
          const token = authService.getToken();
          if (token) {
            // Decodificar para verificar expiración
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000;
            const now = Date.now();
            
            // Si expira en menos de 10 minutos, refrescar
            if (now >= (expiry - 10 * 60 * 1000)) {
              console.log('🔄 Token próximo a expirar, refrescando...');
              await authService.refreshTokenManually();
            }
          }
        } catch (error) {
          console.error('Error checking token on mount:', error);
        }
      };

      checkTokenOnMount();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, logout]);

  // Limpiar interval al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};








