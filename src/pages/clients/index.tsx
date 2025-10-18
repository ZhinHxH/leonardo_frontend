import { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
  TextField,
  Grid,
  MenuItem,
  Avatar,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  Delete,
  Visibility,
  Search,
  Person,
  Phone,
  Email
} from '@mui/icons-material';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { Pagination } from '../../components/Pagination';
import { getClients, createClient, updateClient, deleteClient } from '../../services/clients';

interface User {
  id: number;
  name: string;
  email: string;
  dni?: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  address?: string;
}

export default function Clients() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Estados de modales
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  });

  // Estados de formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dni: '',
    phone: '',
    role: 'member',
    address: ''
  });

  // Cargar usuarios
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Cargando usuarios...', { searchTerm, currentPage, pageSize });
      
      const response = await getClients({
        search: searchTerm,
        page: currentPage,
        limit: pageSize
      });
      
      console.log('📦 Respuesta del backend:', response);
      
      // Adaptarse a diferentes estructuras de respuesta
      if (response.users) {
        console.log('✅ Usando response.users:', response.users.length, 'usuarios');
        setUsers(response.users);
        setTotalUsers(response.total || 0);
        setTotalPages(response.total_pages || 1);
      } else if (Array.isArray(response)) {
        console.log('✅ Usando array directo:', response.length, 'usuarios');
        setUsers(response);
        setTotalUsers(response.length);
        setTotalPages(1);
      } else {
        console.log('✅ Usando response.items:', (response.items || []).length, 'usuarios');
        setUsers(response.items || []);
        setTotalUsers(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / pageSize));
      }
      
    } catch (err: any) {
      console.error('❌ Error cargando usuarios:', err);
      setError(err.message || 'Error cargando usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm, currentPage]);

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Nombre, email y contraseña son obligatorios');
      return;
    }

    console.log('🔄 Creando usuario:', formData);
    setLoading(true);
    
    try {
      const result = await createClient(formData);
      console.log('✅ Usuario creado:', result);
      
      setCreateDialog(false);
      resetForm();
      loadUsers();
      setError('');
      
      alert('Usuario creado exitosamente!');
      
    } catch (err: any) {
      console.error('❌ Error creando usuario:', err);
      setError(err.message || 'Error creando usuario');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      dni: '',
      phone: '',
      role: 'member',
      address: ''
    });
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'trainer': 'Entrenador',
      'receptionist': 'Recepcionista',
      'member': 'Miembro'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role: string): any => {
    const colors: Record<string, any> = {
      'admin': 'error',
      'manager': 'warning',
      'trainer': 'info',
      'receptionist': 'secondary',
      'member': 'success'
    };
    return colors[role] || 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  return (
    <AdminRoute allowedRoles={['admin', 'manager', 'receptionist']}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                  <Person sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h4" component="h1">
                    Gestión de Usuarios
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<PersonAdd />}
                  onClick={() => {
                    resetForm();
                    setCreateDialog(true);
                    setError('');
                  }}
                >
                  Nuevo Usuario
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* Búsqueda */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <TextField
                    fullWidth
                    placeholder="Buscar por nombre, email, DNI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </CardContent>
              </Card>

              {/* Tabla de usuarios */}
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contacto</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rol</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Registro</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
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
                              <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {user.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {user.id} {user.dni && `• DNI: ${user.dni}`}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <Email fontSize="small" color="action" />
                                <Typography variant="body2">{user.email}</Typography>
                              </Box>
                              {user.phone && (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Phone fontSize="small" color="action" />
                                  <Typography variant="body2">{user.phone}</Typography>
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getRoleLabel(user.role)}
                              color={getRoleColor(user.role)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.is_active ? 'Activo' : 'Inactivo'}
                              color={user.is_active ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(user.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={0.5}>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => {
                                  setFormData({
                                    name: user.name,
                                    email: user.email,
                                    password: '',
                                    dni: user.dni || '',
                                    phone: user.phone || '',
                                    role: user.role,
                                    address: user.address || ''
                                  });
                                  setEditDialog({ open: true, user });
                                  setError('');
                                }}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={async () => {
                                  if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
                                  setLoading(true);
                                  try {
                                    await deleteClient(user.id);
                                    loadUsers();
                                    setError('');
                                  } catch (err: any) {
                                    setError(err.message || 'Error eliminando usuario');
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                disabled={user.role === 'admin'}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Paginación */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalUsers}
                itemsPerPage={pageSize}
                onPageChange={setCurrentPage}
                loading={loading}
                showItemsPerPage={false}
              />
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Dialog de creación */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre completo *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contraseña *"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Rol"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="member">Miembro</MenuItem>
                <MenuItem value="trainer">Entrenador</MenuItem>
                <MenuItem value="receptionist">Recepcionista</MenuItem>
                <MenuItem value="manager">Gerente</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="DNI"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateUser} variant="contained" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de edición */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, user: null })} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre completo *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nueva contraseña (opcional)"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                helperText="Dejar vacío para mantener la actual"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Rol"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="member">Miembro</MenuItem>
                <MenuItem value="trainer">Entrenador</MenuItem>
                <MenuItem value="receptionist">Recepcionista</MenuItem>
                <MenuItem value="manager">Gerente</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="DNI"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, user: null })}>Cancelar</Button>
          <Button 
            onClick={async () => {
              if (!editDialog.user || !formData.name || !formData.email) {
                setError('Nombre y email son obligatorios');
                return;
              }

              setLoading(true);
              try {
                const updateData = { ...formData };
                if (!updateData.password) {
                  delete updateData.password;
                }
                
                await updateClient(editDialog.user.id, updateData);
                setEditDialog({ open: false, user: null });
                resetForm();
                loadUsers();
                setError('');
              } catch (err: any) {
                setError(err.message || 'Error actualizando usuario');
              } finally {
                setLoading(false);
              }
            }}
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminRoute>
  );
}
