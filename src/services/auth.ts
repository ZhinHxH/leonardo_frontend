import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

class AuthService {
  private static instance: AuthService;
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private refreshTokenKey = 'refresh_token';
  private tokenExpiryKey = 'token_expiry';
  private refreshPromise: Promise<string> | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      // Guardar token y datos del usuario en localStorage
      this.setToken(response.data.access_token);
      this.setUser(response.data.user);
      this.setTokenExpiry(response.data.access_token);
      
      // Configurar el token en las cabeceras de axios
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error en el inicio de sesión');
    }
  }

  async logout(): Promise<void> {
    try {
      // Llamar al endpoint de logout del backend
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar datos locales independientemente del resultado del backend
      this.clearAuth();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      // Hacer la petición directamente sin refresh automático para evitar bucles
      const response = await api.get<User>('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error getting current user:', error);
      
      // Si el token es inválido, limpiar y devolver null
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, clearing auth');
        this.clearAuth();
      }
      
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.tokenExpiryKey);
    }
    delete api.defaults.headers.common['Authorization'];
  }

  private setTokenExpiry(token: string): void {
    try {
      // Decodificar el JWT para obtener la fecha de expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convertir a milisegundos
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.tokenExpiryKey, expiry.toString());
      }
    } catch (error) {
      console.error('Error setting token expiry:', error);
    }
  }

  private isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true;
    
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    if (!expiry) return true;
    
    const now = Date.now();
    const expiryTime = parseInt(expiry);
    
    // Considerar expirado si faltan menos de 5 minutos
    return now >= (expiryTime - 5 * 60 * 1000);
  }

  private async ensureValidToken(): Promise<void> {
    if (this.isTokenExpired()) {
      await this.refreshToken();
    }
  }

  private async refreshToken(): Promise<string> {
    // Evitar múltiples llamadas simultáneas de refresh
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      const currentToken = this.getToken();
      if (!currentToken) {
        throw new Error('No token available');
      }

      // Intentar refrescar usando el token actual
      const response = await api.post<{ access_token: string; token_type: string }>('/auth/refresh', {
        refresh_token: currentToken
      });

      const newToken = response.data.access_token;
      this.setToken(newToken);
      this.setTokenExpiry(newToken);
      
      // Actualizar el header de autorización
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearAuth();
      throw error;
    }
  }

  // Configurar interceptor simple para manejar tokens
  setupAuthInterceptor(): void {
    // Interceptor de request para agregar token
    api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de response para manejar errores de autenticación
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Solo limpiar auth en errores 401, sin intentar refresh automático
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          console.log('401 error detected, clearing auth');
          this.clearAuth();
          // Solo redirigir si no estamos ya en login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Método manual para refrescar token cuando sea necesario
  async refreshTokenManually(): Promise<boolean> {
    try {
      const currentToken = this.getToken();
      if (!currentToken) return false;

      const response = await api.post<{ access_token: string; token_type: string }>('/auth/refresh', {
        refresh_token: currentToken
      });

      const newToken = response.data.access_token;
      this.setToken(newToken);
      this.setTokenExpiry(newToken);
      
      // Actualizar el header de autorización
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return true;
    } catch (error) {
      console.error('Error refreshing token manually:', error);
      this.clearAuth();
      return false;
    }
  }
}

export default AuthService.getInstance();
