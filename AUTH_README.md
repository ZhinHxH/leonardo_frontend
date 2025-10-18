# Sistema de Autenticación - Frontend

Este documento explica cómo usar el sistema de autenticación implementado en el frontend.

## Componentes Principales

### 1. AuthService (`src/services/auth.ts`)
Servicio principal para manejar la autenticación:

```typescript
import authService from '../services/auth';

// Login
await authService.login({ email: 'user@example.com', password: 'password' });

// Logout
await authService.logout();

// Verificar si está autenticado
const isAuth = authService.isAuthenticated();

// Obtener usuario actual
const user = authService.getCurrentUser();
```

### 2. AuthContext (`src/contexts/AuthContext.tsx`)
Contexto global para el estado de autenticación:

```typescript
import { useAuth } from '../contexts/AuthContext';

const { user, isAuthenticated, isLoading, login, logout } = useAuth();
```

### 3. useFormValidation (`src/hooks/useFormValidation.ts`)
Hook para validación de formularios:

```typescript
import { useFormValidation, validations } from '../hooks/useFormValidation';

const validationRules = {
  email: validations.email,
  password: validations.password
};

const {
  formData,
  errors,
  isSubmitting,
  handleInputChange,
  handleBlur,
  validateForm
} = useFormValidation(initialData, validationRules);
```

### 4. ProtectedRoute (`src/components/ProtectedRoute.tsx`)
Componente para proteger rutas:

```typescript
import { ProtectedRoute } from '../components/ProtectedRoute';

// Proteger ruta básica
<ProtectedRoute>
  <MiComponente />
</ProtectedRoute>

// Proteger ruta con rol específico
<ProtectedRoute requiredRole="admin">
  <AdminComponent />
</ProtectedRoute>
```

## Uso en Páginas

### Página de Login
```typescript
import { useAuth } from '../contexts/AuthContext';
import { useFormValidation, validations } from '../hooks/useFormValidation';

export default function Login() {
  const { login } = useAuth();
  const { formData, errors, handleInputChange, validateForm } = useFormValidation(
    { email: '', password: '' },
    { email: validations.email, password: validations.password }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await login(formData.email, formData.password);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
      />
      {/* ... resto del formulario */}
    </form>
  );
}
```

### Página Protegida
```typescript
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div>
        <h1>Bienvenido, {user?.name}</h1>
        {/* Contenido del dashboard */}
      </div>
    </ProtectedRoute>
  );
}
```

## Configuración

### Variables de Entorno
Crear archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Configuración en _app.tsx
El AuthProvider debe envolver toda la aplicación:

```typescript
import { AuthProvider } from '../contexts/AuthContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
```

## Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales → Validación → Llamada a API → Guardar token → Redirigir a dashboard
2. **Protección de Rutas**: Verificar token en cada navegación → Redirigir a login si no hay token
3. **Logout**: Llamar endpoint de logout → Limpiar token local → Redirigir a login
4. **Token Expirado**: Interceptor detecta 401 → Limpiar token → Redirigir a login

## Validaciones Disponibles

### Validaciones Predefinidas
```typescript
import { validations } from '../hooks/useFormValidation';

// Email
validations.email

// Contraseña (mínimo 6 caracteres)
validations.password

// Campo requerido
validations.required
```

### Validación Personalizada
```typescript
const customValidation = {
  required: true,
  minLength: 3,
  maxLength: 50,
  pattern: /^[a-zA-Z]+$/,
  custom: (value) => {
    if (value.includes('admin')) {
      return 'No puede contener la palabra admin';
    }
    return null;
  }
};
```

## Manejo de Errores

### Errores de Validación
Los errores se muestran automáticamente en los campos del formulario.

### Errores de API
```typescript
try {
  await login(email, password);
} catch (error) {
  setLoginError(error.message);
}
```

### Errores de Autenticación
El interceptor maneja automáticamente los errores 401 (token expirado).

## Seguridad

- Tokens se almacenan en localStorage
- Interceptor automático para tokens expirados
- Validación de roles para rutas protegidas
- Limpieza automática de datos al logout

## Próximos Pasos

1. Implementar refresh tokens
2. Agregar persistencia de sesión
3. Implementar autenticación de dos factores
4. Agregar logging de auditoría





