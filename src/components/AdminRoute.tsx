import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AdminRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  allowedRoles = ['admin', 'manager', 'receptionist'] 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !allowedRoles.includes(user.role)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" mt={2}>
          Verificando permisos...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography variant="h4" color="error" gutterBottom>
          🚫 Acceso Denegado
        </Typography>
        <Typography variant="body1" align="center">
          Esta página solo está disponible para administradores y personal del gimnasio.
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Tu rol actual: {user.role}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};






