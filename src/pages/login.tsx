import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  TextField, 
  Typography, 
  Link, 
  Alert, 
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useFormValidation, validations } from '../hooks/useFormValidation';

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  // Configuración de validación del formulario
  const validationRules = {
    email: validations.email,
    password: validations.password
  };

  const {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleInputChange,
    handleBlur,
    validateForm,
    resetForm
  } = useFormValidation(
    { email: '', password: '' },
    validationRules
  );

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login(formData.email, formData.password);
    } catch (error: any) {
      setLoginError(error.message || 'Error en el inicio de sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('email', e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('password', e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/img/fondo-login.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 1,
        zIndex: -1
      }
    }}>
      <Card sx={{ 
        minWidth: {xs: '90%', sm: 350},
        maxWidth: 400, 
        mx: 'auto',
        py: 4,
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Image
              src="/img/logo_claro_transparente.png" 
              alt="Logo" 
              width={200} 
              height={50} 
            />
            <Typography variant="body1" color="text.secondary" align="center" mt={1}>
              ¡Donde el cuerpo logra lo que la mente cree!
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            {loginError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginError}
              </Alert>
            )}

            <TextField 
              label="Correo electrónico" 
              type="email" 
              fullWidth 
              required 
              margin="normal"
              value={formData.email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur('email')}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isSubmitting}
              autoComplete="email"
            />

            <TextField 
              label="Contraseña" 
              type={showPassword ? 'text' : 'password'} 
              fullWidth 
              required 
              margin="normal"
              value={formData.password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              error={!!errors.password}
              helperText={errors.password}
              disabled={isSubmitting}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              type="submit"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? 'INGRESANDO...' : 'INGRESAR'}
            </Button>
          </form>

          <Typography variant="body2" align="center" mt={2}>
            ¿No tienes cuenta?{' '}
            <Link href="#" underline="hover">
              Regístrate
            </Link>
          </Typography>

          <Typography variant="body2" align="center" mt={1}>
            <Link href="#" underline="hover">
              ¿Olvidaste tu contraseña?
            </Link>
          </Typography>
        </CardContent>
        
        <Box textAlign="center" pb={2}>
          <Typography variant="caption" color="text.secondary">
            © 2025 Mind Body Company | <Link href="#" underline="hover">Colombia</Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}