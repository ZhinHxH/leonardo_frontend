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
  Alert
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
  Timeline
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { getClients, createClient, updateClient, deleteClient } from '../../services/clients';

interface Membership {
  id: number;
  type: string;
  start_date: string;
  end_date: string;
  price: number;
  payment_method: string;
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
}

interface ClinicalRecord {
  id: number;
  date: string;
  type: string;
  weight?: number;
  notes: string;
  created_by: string;
}

// Datos de ejemplo
const mockUsers: User[] = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan@email.com',
    role: 'member',
    phone: '3001234567',
    dni: '12345678',
    is_active: true,
    created_at: '2024-01-15',
    membership_status: 'active'
  },
  {
    id: 2,
    name: 'María García',
    email: 'maria@email.com',
    role: 'trainer',
    phone: '3009876543',
    dni: '87654321',
    is_active: true,
    created_at: '2024-01-10',
    membership_status: 'none'
  }
];

const mockClinicalHistory: ClinicalRecord[] = [
  {
    id: 1,
    date: '2024-01-15',
    type: 'weight_update',
    weight: 75.5,
    notes: 'Peso inicial registrado',
    created_by: 'Dr. Smith'
  },
  {
    id: 2,
    date: '2024-01-20',
    type: 'nutritionist_note',
    notes: 'Plan nutricional ajustado. Reducir carbohidratos en la cena.',
    created_by: 'Nutricionista López'
  }
];

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
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

  // Cargar usuarios desde el backend
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getClients({
        search: searchTerm,
        page: 1,
        limit: 1000 // Cargar todos para filtros locales
      });
      
      console.log('📦 Usuarios cargados:', response);
      
      const usersList = response.users || response.items || response || [];
      setUsers(usersList);
      
    } catch (err: any) {
      console.error('❌ Error cargando usuarios:', err);
      setError(err.message || 'Error cargando usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios al inicializar
  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrar usuarios
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.dni?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'Todos') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'Todos') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

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

  const handleEditUser = (user: User) => {
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      dni: user.dni,
      is_active: user.is_active
    });
    setEditDialog({ open: true, user });
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    // Por ahora usar datos vacíos hasta implementar backend de historia clínica
    setClinicalHistory([]);
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
      await updateClient(editDialog.user.id, editForm);
      setEditDialog({ open: false, user: null });
      setEditForm({});
      loadUsers(); // Recargar lista
      alert('Usuario actualizado exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error actualizando usuario');
    } finally {
      setLoading(false);
    }
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
                        {filteredUsers.length} usuarios encontrados
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Tabla de usuarios */}
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
                    {filteredUsers.map((user) => (
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
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      </Box>

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
            <Tab label="Historial Clínico" />
            <Tab label="Objetivos" />
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
                <Typography variant="h6">Historial Clínico</Typography>
                <Button variant="outlined" size="small" startIcon={<Add />}>
                  Agregar Registro
                </Button>
              </Box>
              
              {clinicalHistory.map((record) => (
                <Card key={record.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {record.type === 'weight_update' ? '📊 Actualización de Peso' : '📝 Nota Nutricional'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(record.date)} - Por {record.created_by}
                        </Typography>
                        {record.weight && (
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            Peso: <strong>{record.weight} kg</strong>
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {record.notes}
                        </Typography>
                      </Box>
                      <Chip size="small" label={record.type} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {activeTab === 2 && (
            <Box pt={3}>
              <Typography variant="h6" mb={2}>Objetivos y Metas</Typography>
              <Alert severity="info">
                Funcionalidad de objetivos en desarrollo
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetailDialog(false)}>Cerrar</Button>
          <Button variant="contained" startIcon={<Edit />}>
            Editar Usuario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de edición de usuario */}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, user: null })}>
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
