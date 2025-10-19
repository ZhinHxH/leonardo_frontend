import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  TablePagination
} from '@mui/material';
import {
  People as PeopleIcon,
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Download,
  PersonAdd,
  MedicalServices,
  FitnessCenter,
  Timeline,
  DirectionsCar,
  TwoWheeler,
  PedalBike,
  Close
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { getClients, createClient, updateClient, deleteClient, getUserVehicles } from '../../services/clients';

interface Membership {
  id: number;
  type: string;
  start_date: string;
  end_date: string;
  price: number;
  payment_method: string;
}

interface Vehicle {
  id?: number;
  plate: string;
  vehicle_type: 'CAR' | 'MOTORCYCLE' | 'BICYCLE' | 'OTHER';
  brand?: string;
  model?: string;
  color?: string;
  year?: number;
  description?: string;
  is_active?: boolean;
  is_verified?: boolean;
  _action?: string; // Para marcar si se debe eliminar
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  dni?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  memberships?: Membership[];
  vehicles?: Vehicle[];
}

interface ClinicalRecord {
  id: number;
  date: string;
  type: string;
  weight?: number;
  notes: string;
  created_by: string;
}

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [userDetailDialog, setUserDetailDialog] = useState(false);
  const [clinicalHistory, setClinicalHistory] = useState<ClinicalRecord[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  });
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [vehicleToAdd, setVehicleToAdd] = useState<Vehicle>({
    plate: '',
    vehicle_type: 'CAR',
    brand: '',
    model: '',
    color: '',
    year: new Date().getFullYear(),
    description: '',
    is_active: true
  });

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar usuarios cuando cambien los filtros o la paginación
  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, roleFilter, statusFilter, debouncedSearchTerm]);

  // Cargar usuarios desde el backend
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const currentPage = page + 1; // Convertir a base 1 para el backend
      
      const response = await getClients({
        search: debouncedSearchTerm || undefined,
        role: roleFilter !== 'Todos' ? roleFilter : undefined,
        status: statusFilter !== 'Todos' ? statusFilter : undefined,
        page: currentPage,
        limit: rowsPerPage
      });
      
      console.log('📦 Usuarios cargados:', response);
      
      // Manejar diferentes estructuras de respuesta
      const usersList = response.users || response.items || response.data || response || [];
      const total = response.total || response.count || usersList.length;
      
      setUsers(usersList);
      setTotalUsers(total);
      
    } catch (err: any) {
      console.error('❌ Error cargando usuarios:', err);
      setError(err.message || 'Error cargando usuarios');
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  // Handlers de paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Resetear a la primera página
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'trainer': return 'info';
      case 'receptionist': return 'secondary';
      case 'member': return 'success';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'trainer': return 'Entrenador';
      case 'receptionist': return 'Recepcionista';
      case 'member': return 'Miembro';
      default: return role;
    }
  };

  const getMembershipStatus = (user: User) => {
    if (!user.memberships || user.memberships.length === 0) {
      return { status: 'none', label: 'Sin membresía', color: 'default' };
    }
    
    const activeMembership = user.memberships.find(m => {
      const endDate = new Date(m.end_date);
      return endDate > new Date();
    });
    
    if (activeMembership) {
      return { 
        status: 'active', 
        label: `${activeMembership.type} - Hasta ${new Date(activeMembership.end_date).toLocaleDateString()}`, 
        color: 'success' 
      };
    }
    
    return { status: 'expired', label: 'Expirada', color: 'warning' };
  };

  const handleAddUser = () => {
    router.push('/users/register');
  };

  const handleEditUser = async (user: User) => {
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      dni: user.dni,
      is_active: user.is_active
    });
    
    // Cargar vehículos del usuario
    try {
      const vehiclesData = await getUserVehicles(user.id);
      setUserVehicles(vehiclesData.vehicles || []);
    } catch (err) {
      console.error('Error cargando vehículos:', err);
      setUserVehicles([]);
    }
    
    setEditDialog({ open: true, user });
  };

  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    // Cargar vehículos del usuario
    try {
      const vehiclesData = await getUserVehicles(user.id);
      setUserVehicles(vehiclesData.vehicles || []);
    } catch (err) {
      console.error('Error cargando vehículos:', err);
      setUserVehicles([]);
    }
    setUserDetailDialog(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteDialog({ open: true, user });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.user) return;
    
    setLoading(true);
    setError('');
    
    try {
      await deleteClient(deleteDialog.user.id);
      setDeleteDialog({ open: false, user: null });
      loadUsers(); // Recargar lista
      alert('Usuario eliminado exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error eliminando usuario');
    } finally {
      setLoading(false);
    }
  };

  const confirmEdit = async () => {
    if (!editDialog.user) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Incluir vehículos en el formulario de actualización
      const updateData = {
        ...editForm,
        // Convertir rol a mayúsculas para que coincida con el enum del backend
        role: editForm.role ? editForm.role.toUpperCase() : undefined,
        vehicles: userVehicles
      };
      
      await updateClient(editDialog.user.id, updateData);
      setEditDialog({ open: false, user: null });
      setEditForm({});
      setUserVehicles([]);
      loadUsers(); // Recargar lista
      alert('Usuario actualizado exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error actualizando usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    if (!vehicleToAdd.plate) {
      alert('Por favor ingresa una placa');
      return;
    }
    
    setUserVehicles([...userVehicles, { ...vehicleToAdd }]);
    
    // Resetear formulario de vehículo
    setVehicleToAdd({
      plate: '',
      vehicle_type: 'CAR',
      brand: '',
      model: '',
      color: '',
      year: new Date().getFullYear(),
      description: '',
      is_active: true
    });
  };

  const handleRemoveVehicle = (index: number) => {
    const vehicle = userVehicles[index];
    const updatedVehicles = [...userVehicles];
    
    if (vehicle.id) {
      // Si el vehículo ya existe en la BD, marcarlo para eliminar
      updatedVehicles[index] = { ...vehicle, _action: 'delete' };
    } else {
      // Si es nuevo, simplemente quitarlo de la lista
      updatedVehicles.splice(index, 1);
    }
    
    setUserVehicles(updatedVehicles);
  };

  const handleEditVehicle = (index: number, field: keyof Vehicle, value: any) => {
    const updatedVehicles = [...userVehicles];
    updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
    setUserVehicles(updatedVehicles);
  };

  const getVehicleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'CAR': 'Automóvil',
      'MOTORCYCLE': 'Motocicleta',
      'BICYCLE': 'Bicicleta',
      'OTHER': 'Otro'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                  <PeopleIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h4" component="h1">
                    Gestión de Usuarios
                  </Typography>
                </Box>
                <Box display="flex" gap={2}>
                  <Button variant="outlined" startIcon={<Download />}>
                    Exportar
                  </Button>
                  <Button variant="contained" startIcon={<PersonAdd />} onClick={handleAddUser}>
                    Nuevo Usuario
                  </Button>
                </Box>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* Filtros */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        placeholder="Buscar por nombre, email o DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Rol</InputLabel>
                        <Select
                          value={roleFilter}
                          label="Rol"
                          onChange={(e) => setRoleFilter(e.target.value)}
                        >
                          <MenuItem value="Todos">Todos</MenuItem>
                          <MenuItem value="admin">Administrador</MenuItem>
                          <MenuItem value="manager">Gerente</MenuItem>
                          <MenuItem value="trainer">Entrenador</MenuItem>
                          <MenuItem value="receptionist">Recepcionista</MenuItem>
                          <MenuItem value="member">Miembro</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Estado</InputLabel>
                        <Select
                          value={statusFilter}
                          label="Estado"
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <MenuItem value="Todos">Todos</MenuItem>
                          <MenuItem value="active">Activo</MenuItem>
                          <MenuItem value="inactive">Inactivo</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" color="text.secondary">
                        {totalUsers} usuarios encontrados
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Tabla de usuarios con paginación */}
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rol</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contacto</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Membresía</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                            <CircularProgress />
                            <Typography color="text.secondary">Cargando usuarios...</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No se encontraron usuarios
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {user.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {user.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {user.email}
                                </Typography>
                                {user.dni && (
                                  <Typography variant="caption" color="text.secondary">
                                    DNI: {user.dni}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getRoleLabel(user.role)}
                              color={getRoleColor(user.role) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {user.phone || 'No registrado'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const membershipInfo = getMembershipStatus(user);
                              return (
                                <Chip
                                  label={membershipInfo.label}
                                  color={membershipInfo.color as any}
                                  size="small"
                                />
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.is_active ? 'Activo' : 'Inactivo'}
                              color={user.is_active ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <IconButton size="small" color="info" onClick={() => handleViewUser(user)}>
                                <Visibility />
                              </IconButton>
                              <IconButton size="small" color="primary" onClick={() => handleEditUser(user)}>
                                <Edit />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteUser(user)}>
                                <Delete />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Paginador de MUI */}
                <TablePagination
                  rowsPerPageOptions={[10, 20, 50, 100]}
                  component="div"
                  count={totalUsers}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Usuarios por página:"
                  labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                  }
                />
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Los diálogos se mantienen igual... */}
      {/* Dialog de detalle de usuario */}
      <Dialog
        open={userDetailDialog}
        onClose={() => setUserDetailDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {selectedUser?.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedUser?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUser?.email}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Información General" />
            <Tab label="Vehículos" icon={<DirectionsCar />} iconPosition="start" />
          </Tabs>

          {activeTab === 0 && (
            <Box pt={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Información Personal</Typography>
                  <Typography>DNI: {selectedUser?.dni || 'No registrado'}</Typography>
                  <Typography>Teléfono: {selectedUser?.phone || 'No registrado'}</Typography>
                  <Typography>Rol: {getRoleLabel(selectedUser?.role || '')}</Typography>
                  <Typography>Registrado: {formatDate(selectedUser?.created_at || '')}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Estado de Membresía</Typography>
                  {selectedUser && (() => {
                    const membershipInfo = getMembershipStatus(selectedUser);
                    return (
                      <Chip
                        label={membershipInfo.label}
                        color={membershipInfo.color as any}
                      />
                    );
                  })()}
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 1 && (
            <Box pt={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCar /> Vehículos Registrados
                </Typography>
                <Chip 
                  label={`${userVehicles.length} vehículo${userVehicles.length !== 1 ? 's' : ''}`} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
              
              {userVehicles.length === 0 ? (
                <Alert severity="info">
                  Este usuario no tiene vehículos registrados.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {userVehicles.map((vehicle, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined" sx={{ 
                        height: '100%',
                        '&:hover': { boxShadow: 3, borderColor: 'primary.main' }
                      }}>
                        <CardContent>
                          <Box>
                            {/* Header del vehículo */}
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                              {vehicle.vehicle_type === 'CAR' && <DirectionsCar color="primary" fontSize="large" />}
                              {vehicle.vehicle_type === 'MOTORCYCLE' && <TwoWheeler color="primary" fontSize="large" />}
                              {vehicle.vehicle_type === 'BICYCLE' && <PedalBike color="primary" fontSize="large" />}
                              <Box>
                                <Typography variant="h6" component="div">
                                  {vehicle.plate}
                                </Typography>
                                <Chip 
                                  label={getVehicleTypeLabel(vehicle.vehicle_type)} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Detalles del vehículo */}
                            <Grid container spacing={1.5}>
                              {vehicle.brand && (
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Marca
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {vehicle.brand}
                                  </Typography>
                                </Grid>
                              )}
                              
                              {vehicle.model && (
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Modelo
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {vehicle.model}
                                  </Typography>
                                </Grid>
                              )}
                              
                              {vehicle.color && (
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Color
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {vehicle.color}
                                  </Typography>
                                </Grid>
                              )}
                              
                              {vehicle.year && (
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Año
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {vehicle.year}
                                  </Typography>
                                </Grid>
                              )}
                              
                              {vehicle.description && (
                                <Grid item xs={12}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Descripción
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {vehicle.description}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                            
                            {/* Estado del vehículo */}
                            <Box mt={2} display="flex" gap={1}>
                              <Chip 
                                label={vehicle.is_active ? 'Activo' : 'Inactivo'} 
                                size="small" 
                                color={vehicle.is_active ? 'success' : 'default'}
                              />
                              {vehicle.is_verified && (
                                <Chip 
                                  label="Verificado" 
                                  size="small" 
                                  color="info"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUserDetailDialog(false);
            setUserVehicles([]);
            setActiveTab(0);
          }}>
            Cerrar
          </Button>
          <Button variant="contained" startIcon={<Edit />} onClick={() => {
            setUserDetailDialog(false);
            if (selectedUser) {
              handleEditUser(selectedUser);
            }
          }}>
            Editar Usuario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de edición de usuario */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, user: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
            <Tab label="Información Personal" />
            <Tab label="Vehículos" icon={<DirectionsCar />} iconPosition="start" />
          </Tabs>

          {/* Tab de Información Personal */}
          {activeTab === 0 && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="DNI"
                  value={editForm.dni || ''}
                  onChange={(e) => setEditForm({ ...editForm, dni: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={editForm.role || ''}
                    label="Rol"
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <MenuItem value="admin">Administrador</MenuItem>
                    <MenuItem value="manager">Gerente</MenuItem>
                    <MenuItem value="trainer">Entrenador</MenuItem>
                    <MenuItem value="receptionist">Recepcionista</MenuItem>
                    <MenuItem value="member">Miembro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={editForm.is_active ? 'active' : 'inactive'}
                    label="Estado"
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'active' })}
                  >
                    <MenuItem value="active">Activo</MenuItem>
                    <MenuItem value="inactive">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {/* Tab de Vehículos */}
          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              {/* Formulario para agregar nuevo vehículo */}
              <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Add /> Agregar Nuevo Vehículo
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Placa *"
                        value={vehicleToAdd.plate}
                        onChange={(e) => setVehicleToAdd({ ...vehicleToAdd, plate: e.target.value.toUpperCase() })}
                        placeholder="Ej: ABC123"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo de Vehículo</InputLabel>
                        <Select
                          value={vehicleToAdd.vehicle_type}
                          label="Tipo de Vehículo"
                          onChange={(e) => setVehicleToAdd({ ...vehicleToAdd, vehicle_type: e.target.value as any })}
                        >
                          <MenuItem value="CAR">
                            <Box display="flex" alignItems="center" gap={1}>
                              <DirectionsCar /> Automóvil
                            </Box>
                          </MenuItem>
                          <MenuItem value="MOTORCYCLE">
                            <Box display="flex" alignItems="center" gap={1}>
                              <TwoWheeler /> Motocicleta
                            </Box>
                          </MenuItem>
                          <MenuItem value="BICYCLE">
                            <Box display="flex" alignItems="center" gap={1}>
                              <PedalBike /> Bicicleta
                            </Box>
                          </MenuItem>
                          <MenuItem value="OTHER">Otro</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Marca"
                        value={vehicleToAdd.brand}
                        onChange={(e) => setVehicleToAdd({ ...vehicleToAdd, brand: e.target.value })}
                        placeholder="Ej: Toyota"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Modelo"
                        value={vehicleToAdd.model}
                        onChange={(e) => setVehicleToAdd({ ...vehicleToAdd, model: e.target.value })}
                        placeholder="Ej: Corolla"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Color"
                        value={vehicleToAdd.color}
                        onChange={(e) => setVehicleToAdd({ ...vehicleToAdd, color: e.target.value })}
                        placeholder="Ej: Blanco"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Año"
                        value={vehicleToAdd.year}
                        onChange={(e) => setVehicleToAdd({ ...vehicleToAdd, year: parseInt(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddVehicle}
                        sx={{ height: '56px' }}
                      >
                        Agregar
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Descripción"
                        multiline
                        rows={2}
                        value={vehicleToAdd.description}
                        onChange={(e) => setVehicleToAdd({ ...vehicleToAdd, description: e.target.value })}
                        placeholder="Información adicional del vehículo"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Lista de vehículos existentes */}
              <Typography variant="h6" gutterBottom>
                Vehículos Registrados ({userVehicles.filter(v => v._action !== 'delete').length})
              </Typography>
              
              {userVehicles.filter(v => v._action !== 'delete').length === 0 ? (
                <Alert severity="info">
                  Este usuario no tiene vehículos registrados. Agrega uno usando el formulario superior.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {userVehicles.map((vehicle, index) => {
                    if (vehicle._action === 'delete') return null;
                    
                    return (
                      <Grid item xs={12} md={6} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="start">
                              <Box flex={1}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                  {vehicle.vehicle_type === 'CAR' && <DirectionsCar color="primary" />}
                                  {vehicle.vehicle_type === 'MOTORCYCLE' && <TwoWheeler color="primary" />}
                                  {vehicle.vehicle_type === 'BICYCLE' && <PedalBike color="primary" />}
                                  <Typography variant="h6" component="span">
                                    {vehicle.plate}
                                  </Typography>
                                  <Chip 
                                    label={getVehicleTypeLabel(vehicle.vehicle_type)} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                </Box>
                                
                                <Grid container spacing={1}>
                                  <Grid item xs={6}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="Marca"
                                      value={vehicle.brand || ''}
                                      onChange={(e) => handleEditVehicle(index, 'brand', e.target.value)}
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="Modelo"
                                      value={vehicle.model || ''}
                                      onChange={(e) => handleEditVehicle(index, 'model', e.target.value)}
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="Color"
                                      value={vehicle.color || ''}
                                      onChange={(e) => handleEditVehicle(index, 'color', e.target.value)}
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      type="number"
                                      label="Año"
                                      value={vehicle.year || ''}
                                      onChange={(e) => handleEditVehicle(index, 'year', parseInt(e.target.value))}
                                    />
                                  </Grid>
                                  <Grid item xs={12}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      multiline
                                      rows={2}
                                      label="Descripción"
                                      value={vehicle.description || ''}
                                      onChange={(e) => handleEditVehicle(index, 'description', e.target.value)}
                                    />
                                  </Grid>
                                </Grid>
                              </Box>
                              
                              <IconButton 
                                color="error" 
                                onClick={() => handleRemoveVehicle(index)}
                                sx={{ ml: 1 }}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialog({ open: false, user: null });
            setUserVehicles([]);
            setActiveTab(0);
          }}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmEdit} 
            variant="contained"
            disabled={loading || !editForm.name || !editForm.email}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar al usuario "{deleteDialog.user?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Esta acción eliminará también todo su historial clínico y no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </AdminRoute>
  );
}