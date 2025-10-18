import { useRouter } from 'next/router';

export const useNavigation = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  const navigateToDashboard = () => {
    router.push('/dashboard');
  };

  const navigateBack = () => {
    router.back();
  };

  const isCurrentPath = (path: string) => {
    return router.pathname === path;
  };

  return {
    navigateTo,
    navigateToLogin,
    navigateToDashboard,
    navigateBack,
    isCurrentPath,
    currentPath: router.pathname
  };
};

// Rutas públicas que no requieren autenticación
export const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
];

// Rutas que requieren autenticación
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/clients',
  '/products',
  '/sales',
  '/memberships',
  '/reports'
];

// Verificar si una ruta es pública
export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.includes(path);
};

// Verificar si una ruta requiere autenticación
export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
};





