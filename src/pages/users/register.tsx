import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Paper,
  Toolbar,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import {
  // ... tus imports existentes
  DirectionsCar,
  TimeToLeave,
  Description,
  LocalParking,
  Build, Palette, CalendarToday
} from '@mui/icons-material';
import { PersonAdd, Save, Cancel } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useFormValidation, validations } from '../../hooks/useFormValidation';
import { createClient } from '../../services/clients';

interface UserFormData {
  [key: string]: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: string;
  phone: string;
  address: string;
  dni: string;
  birth_date: string;
  blood_type: string;
  gender: string;
  eps: string;
  emergency_contact: string;
  emergency_phone: string;

  // 🔹 Nuevos campos del vehículo
  has_vehicle?:Boolean;
  vehicle_plate?: string;
  vehicle_type?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  vehicle_year?: string;
  vehicle_description?: string;
}

const initialFormData: UserFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  role: 'member',
  phone: '',
  address: '',
  dni: '',
  birth_date: '',
  blood_type: '',
  gender: '',
  eps: '',
  emergency_contact: '',
  emergency_phone: '',

  // 🔹 Campos del vehículo
  vehicle_plate: '',
  vehicle_type: '',
  vehicle_brand: '',
  vehicle_model: '',
  vehicle_color: '',
  vehicle_year: '',
  vehicle_description: ''
};


const userRoles = [
  { value: 'admin', label: 'Administrador' },
  { value: 'manager', label: 'Gerente' },
  { value: 'trainer', label: 'Entrenador' },
  { value: 'receptionist', label: 'Recepcionista' },
  { value: 'member', label: 'Miembro' }
];

const bloodTypes = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
];

const genders = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' }
];

export default function RegisterUser() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [hasVehicle, setHasVehicle] = useState(false);
  // Configuración de validación del formulario
  const validationRules = {
    email: validations.email,
    password: validations.password,
    confirmPassword: {
      required: true,
      custom: (value: string) => {
        if (value !== formData.password) {
          return 'Las contraseñas no coinciden';
        }
        return null;
      }
    },
    name: validations.required,
    role: validations.required,
    dni: validations.required
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
  } = useFormValidation(initialFormData, validationRules);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!validateForm()) {
      return;
    }

    // Verificar que no haya errores de campos únicos
    if (Object.keys(fieldErrors).length > 0) {
      setSubmitError('Por favor, corrige los errores de campos duplicados antes de continuar.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Función para transformar valores del frontend al backend
      const transformToBackendValues = (data: any) => ({
        ...data,
        role: data.role?.toUpperCase() || 'MEMBER',
        blood_type: data.blood_type ? data.blood_type.replace('+', '_POSITIVE').replace('-', '_NEGATIVE') : undefined,
        gender: data.gender?.toUpperCase() || undefined
      });

      // Preparar datos para el backend
      const userData = transformToBackendValues({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        dni: formData.dni,
        phone: formData.phone,
        role: formData.role,
        address: formData.address,
        blood_type: formData.blood_type,
        gender: formData.gender,
        birth_date: formData.birth_date,
        eps: formData.eps,
        emergency_contact: formData.emergency_contact,
        emergency_phone: formData.emergency_phone,

        // 🔹 Datos del vehículo
        has_vehicle: hasVehicle,
        vehicle_plate: formData.vehicle_plate,
        vehicle_type: formData.vehicle_type,
        vehicle_brand: formData.vehicle_brand,
        vehicle_model: formData.vehicle_model,
        vehicle_color: formData.vehicle_color,
        vehicle_year: formData.vehicle_year,
        vehicle_description: formData.vehicle_description
      });
      
      console.log('🔄 Creando usuario:', userData);
      
      // Crear usuario en el backend
      const response = await createClient(userData);
      
      console.log('✅ Usuario creado:', response);
      
      setSubmitSuccess('Usuario creado exitosamente');
      resetForm();
      
      // Redirigir a la lista de usuarios después de 2 segundos
      setTimeout(() => {
        router.push('/users');
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Error creando usuario:', error);
      
      // Manejar errores específicos del backend
      let errorMessage = 'Error al crear el usuario';
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        
        // Detectar errores de campos duplicados
        if (detail.includes('email') && detail.includes('registrado')) {
          errorMessage = '📧 El email ya está registrado. Por favor, usa otro email.';
        } else if (detail.includes('DNI') && detail.includes('registrado')) {
          errorMessage = '🆔 El DNI ya está registrado. Por favor, verifica el número de documento.';
        } else if (detail.includes('phone') && detail.includes('registrado')) {
          errorMessage = '📱 El teléfono ya está registrado. Por favor, usa otro número.';
        } else {
          errorMessage = detail;
        }
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos. Por favor, revisa la información ingresada.';
      } else if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para crear usuarios.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor. Por favor, contacta al administrador.';
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para validar campos únicos
  const validateUniqueField = async (fieldName: string, value: string) => {
    if (!value.trim()) return;
    
    try {
      // Buscar si ya existe un usuario con este valor
      const response = await getClients({ 
        search: value, 
        page: 1, 
        limit: 10 
      });
      
      const users = response.users || [];
      const existingUser = users.find((u: any) => {
        if (fieldName === 'email') return u.email === value;
        if (fieldName === 'dni') return u.dni === value;
        if (fieldName === 'phone') return u.phone === value;
        return false;
      });
      
      if (existingUser) {
        const fieldLabels = {
          email: '📧 Email',
          dni: '🆔 DNI', 
          phone: '📱 Teléfono'
        };
        
        setFieldErrors(prev => ({
          ...prev,
          [fieldName]: `${fieldLabels[fieldName as keyof typeof fieldLabels]} ya está registrado`
        }));
      } else {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    } catch (error) {
      console.error(`Error validando ${fieldName}:`, error);
    }
  };

  const handleCancel = () => {
    router.push('/users');
  };

  return (
    <AdminRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <PersonAdd sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h4" component="h1" gutterBottom>
                  Registrar Nuevo Usuario
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                {submitError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {submitError}
                  </Alert>
                )}

                {submitSuccess && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {submitSuccess}
                  </Alert>
                )}

                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Información de Cuenta
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Correo electrónico *"
                          type="email"
                          fullWidth
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          onBlur={(e) => {
                            handleBlur('email');
                            validateUniqueField('email', e.target.value);
                          }}
                          error={!!errors.email || !!fieldErrors.email}
                          helperText={fieldErrors.email || errors.email}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!errors.role}>
                          <InputLabel>Rol *</InputLabel>
                          <Select
                            value={formData.role}
                            label="Rol *"
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            disabled={isSubmitting}
                          >
                            {userRoles.map((role) => (
                              <MenuItem key={role.value} value={role.value}>
                                {role.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Contraseña *"
                          type="password"
                          fullWidth
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          onBlur={() => handleBlur('password')}
                          error={!!errors.password}
                          helperText={errors.password}
                          disabled={isSubmitting}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Confirmar Contraseña *"
                          type="password"
                          fullWidth
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          onBlur={() => handleBlur('confirmPassword')}
                          error={!!errors.confirmPassword}
                          helperText={errors.confirmPassword}
                          disabled={isSubmitting}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Información Personal
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Nombre completo *"
                          fullWidth
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          onBlur={() => handleBlur('name')}
                          error={!!errors.name}
                          helperText={errors.name}
                          disabled={isSubmitting}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Documento de identidad *"
                          fullWidth
                          value={formData.dni}
                          onChange={(e) => handleInputChange('dni', e.target.value)}
                          onBlur={(e) => {
                            handleBlur('dni');
                            validateUniqueField('dni', e.target.value);
                          }}
                          error={!!errors.dni || !!fieldErrors.dni}
                          helperText={fieldErrors.dni || errors.dni}
                          disabled={isSubmitting}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Teléfono"
                          fullWidth
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Fecha de nacimiento"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={formData.birth_date}
                          onChange={(e) => handleInputChange('birth_date', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Tipo de sangre</InputLabel>
                          <Select
                            value={formData.blood_type}
                            label="Tipo de sangre"
                            onChange={(e) => handleInputChange('blood_type', e.target.value)}
                            disabled={isSubmitting}
                          >
                            {bloodTypes.map((type) => (
                              <MenuItem key={type.value} value={type.value}>
                                {type.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Género</InputLabel>
                          <Select
                            value={formData.gender}
                            label="Género"
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            disabled={isSubmitting}
                          >
                            {genders.map((gender) => (
                              <MenuItem key={gender.value} value={gender.value}>
                                {gender.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="Dirección"
                          fullWidth
                          multiline
                          rows={2}
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Información Médica y de Emergencia
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="EPS"
                          fullWidth
                          value={formData.eps}
                          onChange={(e) => handleInputChange('eps', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Contacto de emergencia"
                          fullWidth
                          value={formData.emergency_contact}
                          onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Teléfono de emergencia"
                          fullWidth
                          value={formData.emergency_phone}
                          onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                <Card sx={{ mb: 3 }}>
  <CardContent>
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
      <Typography variant="h6" color="primary">
        🏍️/🚗 Información del Vehículo
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={hasVehicle}
            onChange={(e) => {
              setHasVehicle(e.target.checked);
              if (!e.target.checked) {
                // Limpiar campos si se desactiva el switch
                [
                  'vehicle_plate',
                  'vehicle_type',
                  'vehicle_brand',
                  'vehicle_model',
                  'vehicle_color',
                  'vehicle_year',
                  'vehicle_description'
                ].forEach((field) => handleInputChange(field, ''));
              }
            }}
          />
        }
        label="Registrar vehículo"
      />
    </Box>

    <Divider sx={{ mb: 2 }} />

    {hasVehicle ? (
      <Grid container spacing={3}>
        {/* PLACA */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Placa del vehículo"
            fullWidth
            value={formData.vehicle_plate || ''}
            onChange={(e) => {
              const plate = e.target.value.toUpperCase();
              handleInputChange('vehicle_plate', plate);
            }}
            placeholder="ABC123"
            disabled={isSubmitting}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DirectionsCar />
                </InputAdornment>
              ),
            }}
            helperText="Ingrese la placa en formato estándar"
          />
        </Grid>

        {/* TIPO DE VEHÍCULO */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo de vehículo</InputLabel>
            <Select
              value={formData.vehicle_type || ''}
              onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
              disabled={isSubmitting}
            >
              <MenuItem value="CAR">Automóvil</MenuItem>
              <MenuItem value="MOTORCYCLE">Motocicleta</MenuItem>
              <MenuItem value="BICYCLE">Bicicleta</MenuItem>
              <MenuItem value="OTHER">Otro</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* MARCA */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Marca"
            fullWidth
            value={formData.vehicle_brand || ''}
            onChange={(e) => handleInputChange('vehicle_brand', e.target.value)}
            placeholder="Ej: Toyota, Honda, etc."
            disabled={isSubmitting}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Build />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* MODELO */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Modelo"
            fullWidth
            value={formData.vehicle_model || ''}
            onChange={(e) => handleInputChange('vehicle_model', e.target.value)}
            placeholder="Ej: Corolla, Civic, Pulsar"
            disabled={isSubmitting}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TimeToLeave />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* COLOR */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Color"
            fullWidth
            value={formData.vehicle_color || ''}
            onChange={(e) => handleInputChange('vehicle_color', e.target.value)}
            placeholder="Ej: Rojo, Negro, Azul"
            disabled={isSubmitting}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Palette />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* AÑO */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Año"
            type="number"
            fullWidth
            value={formData.vehicle_year || ''}
            onChange={(e) => handleInputChange('vehicle_year', e.target.value)}
            placeholder="Ej: 2022"
            disabled={isSubmitting}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* DESCRIPCIÓN */}
        <Grid item xs={12}>
          <TextField
            label="Descripción adicional"
            fullWidth
            multiline
            rows={3}
            value={formData.vehicle_description || ''}
            onChange={(e) => handleInputChange('vehicle_description', e.target.value)}
            placeholder="Color, modelo, características especiales, etc."
            disabled={isSubmitting}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Description />
                </InputAdornment>
              ),
            }}
            helperText="Descripción detallada para identificación"
          />
        </Grid>

        {/* ALERTA INFORMATIVA */}
        <Grid item xs={12}>
          <Alert severity="info" icon={<LocalParking />}>
            <Typography variant="body2">
              Esta información será utilizada para el control de parqueadero y seguridad del gimnasio.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    ) : (
      <Box textAlign="center" py={2}>
        <Typography variant="body2" color="text.secondary">
          Activa el interruptor para registrar un vehículo
        </Typography>
      </Box>
    )}
  </CardContent>
</Card>

                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    startIcon={<Cancel />}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                  >
                    {isSubmitting ? 'Creando...' : 'Crear Usuario'}
                  </Button>
                </Box>
              </form>
            </Paper>
          </Box>
        </Box>
      </Box>
    </AdminRoute>
  );
}
