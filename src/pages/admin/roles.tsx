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
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Alert,
  Divider
} from '@mui/material';
import {
  Security as SecurityIcon,
  Add,
  Edit,
  Delete,
  Check,
  Close,
  AdminPanelSettings,
  ManageAccounts,
  Group,
  Person
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  is_active: boolean;
  user_count: number;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Permisos disponibles
const availablePermissions: Permission[] = [
  // Usuarios
  { id: 'users.create', name: 'Crear Usuarios', description: 'Puede crear nuevos usuarios', category: 'Usuarios' },
  { id: 'users.read', name: 'Ver Usuarios', description: 'Puede ver lista de usuarios', category: 'Usuarios' },
  { id: 'users.update', name: 'Editar Usuarios', description: 'Puede editar información de usuarios', category: 'Usuarios' },
  { id: 'users.delete', name: 'Eliminar Usuarios', description: 'Puede eliminar usuarios', category: 'Usuarios' },
  
  // Ventas
  { id: 'sales.create', name: 'Crear Ventas', description: 'Puede registrar nuevas ventas', category: 'Ventas' },
  { id: 'sales.read', name: 'Ver Ventas', description: 'Puede ver historial de ventas', category: 'Ventas' },
  { id: 'sales.update', name: 'Editar Ventas', description: 'Puede modificar ventas', category: 'Ventas' },
  { id: 'sales.delete', name: 'Eliminar Ventas', description: 'Puede eliminar ventas', category: 'Ventas' },
  
  // Inventario
  { id: 'inventory.create', name: 'Crear Productos', description: 'Puede agregar productos al inventario', category: 'Inventario' },
  { id: 'inventory.read', name: 'Ver Inventario', description: 'Puede ver el inventario', category: 'Inventario' },
  { id: 'inventory.update', name: 'Editar Productos', description: 'Puede editar productos', category: 'Inventario' },
  { id: 'inventory.delete', name: 'Eliminar Productos', description: 'Puede eliminar productos', category: 'Inventario' },
  
  // Reportes
  { id: 'reports.view', name: 'Ver Reportes', description: 'Puede acceder a reportes', category: 'Reportes' },
  { id: 'reports.export', name: 'Exportar Reportes', description: 'Puede exportar reportes', category: 'Reportes' },
  
  // Administración
  { id: 'admin.roles', name: 'Gestionar Roles', description: 'Puede crear y editar roles', category: 'Administración' },
  { id: 'admin.settings', name: 'Configuración', description: 'Puede modificar configuración del sistema', category: 'Administración' },
];

// Datos de ejemplo
const mockRoles: Role[] = [
  {
    id: 1,
    name: 'admin',
    display_name: 'Administrador',
    description: 'Acceso completo al sistema',
    permissions: availablePermissions.map(p => p.id),
    is_active: true,
    user_count: 2,
    created_at: '2024-01-01'
  },
  {
    id: 2,
    name: 'manager',
    display_name: 'Gerente',
    description: 'Gestión operativa del gimnasio',
    permissions: [
      'users.create', 'users.read', 'users.update',
      'sales.create', 'sales.read', 'sales.update',
      'inventory.create', 'inventory.read', 'inventory.update',
      'reports.view', 'reports.export'
    ],
    is_active: true,
    user_count: 1,
    created_at: '2024-01-01'
  },
  {
    id: 3,
    name: 'receptionist',
    display_name: 'Recepcionista',
    description: 'Atención al cliente y ventas',
    permissions: [
      'users.read', 'users.update',
      'sales.create', 'sales.read',
      'inventory.read'
    ],
    is_active: true,
    user_count: 3,
    created_at: '2024-01-01'
  },
  {
    id: 4,
    name: 'trainer',
    display_name: 'Entrenador',
    description: 'Entrenamiento y seguimiento de miembros',
    permissions: [
      'users.read', 'users.update'
    ],
    is_active: true,
    user_count: 5,
    created_at: '2024-01-01'
  },
  {
    id: 5,
    name: 'member',
    display_name: 'Miembro',
    description: 'Usuario final del gimnasio',
    permissions: [],
    is_active: true,
    user_count: 150,
    created_at: '2024-01-01'
  }
];

export default function Roles() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [editDialog, setEditDialog] = useState<{ open: boolean; role: Role | null; isNew: boolean }>({
    open: false,
    role: null,
    isNew: false
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; role: Role | null }>({
    open: false,
    role: null
  });

  const [formData, setFormData] = useState<Partial<Role>>({
    name: '',
    display_name: '',
    description: '',
    permissions: [],
    is_active: true
  });

  const handleAddRole = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      permissions: [],
      is_active: true
    });
    setEditDialog({ open: true, role: null, isNew: true });
  };

  const handleEditRole = (role: Role) => {
    setFormData(role);
    setEditDialog({ open: true, role, isNew: false });
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteDialog({ open: true, role });
  };

  const handleSaveRole = () => {
    if (editDialog.isNew) {
      const newRole = {
        ...formData,
        id: roles.length + 1,
        user_count: 0,
        created_at: new Date().toISOString()
      } as Role;
      setRoles([...roles, newRole]);
    } else {
      setRoles(roles.map(r => r.id === editDialog.role?.id ? { ...formData, id: r.id, user_count: r.user_count } as Role : r));
    }
    setEditDialog({ open: false, role: null, isNew: false });
  };

  const confirmDelete = () => {
    if (deleteDialog.role && deleteDialog.role.user_count === 0) {
      setRoles(roles.filter(r => r.id !== deleteDialog.role!.id));
      setDeleteDialog({ open: false, role: null });
    }
  };

  const togglePermission = (permissionId: string) => {
    const currentPermissions = formData.permissions || [];
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId];
    
    setFormData({ ...formData, permissions: newPermissions });
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    availablePermissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'admin': return <AdminPanelSettings color="error" />;
      case 'manager': return <ManageAccounts color="warning" />;
      case 'trainer': return <Group color="info" />;
      case 'receptionist': return <Person color="secondary" />;
      case 'member': return <Person color="success" />;
      default: return <Person />;
    }
  };

  return (
    <AdminRoute allowedRoles={['ADMIN']}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                  <SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h4" component="h1">
                    Gestión de Roles
                  </Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={handleAddRole}>
                  Nuevo Rol
                </Button>
              </Box>

              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rol</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Permisos</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuarios</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            {getRoleIcon(role.name)}
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {role.display_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {role.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {role.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {role.permissions.length} permisos
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {role.user_count} usuarios
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={role.is_active ? 'Activo' : 'Inactivo'}
                            color={role.is_active ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <IconButton size="small" color="primary" onClick={() => handleEditRole(role)}>
                              <Edit />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleDeleteRole(role)}
                              disabled={role.user_count > 0 || role.name === 'admin'}
                            >
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

      {/* Dialog de edición/creación de rol */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, role: null, isNew: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editDialog.isNew ? 'Crear Nuevo Rol' : `Editar Rol: ${editDialog.role?.display_name}`}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Rol"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                helperText="Nombre visible para los usuarios"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Identificador"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                helperText="Identificador único del rol (automático)"
                disabled={!editDialog.isNew}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Rol Activo"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" mb={2}>Permisos:</Typography>
              {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                <Card key={category} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="primary" mb={1}>
                      {category}
                    </Typography>
                    <List dense>
                      {permissions.map((permission) => (
                        <ListItem key={permission.id} sx={{ py: 0.5 }}>
                          <ListItemIcon>
                            <Checkbox
                              checked={formData.permissions?.includes(permission.id) || false}
                              onChange={() => togglePermission(permission.id)}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={permission.name}
                            secondary={permission.description}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, role: null, isNew: false })}>
            Cancelar
          </Button>
          <Button onClick={handleSaveRole} variant="contained">
            {editDialog.isNew ? 'Crear Rol' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, role: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          {deleteDialog.role?.user_count === 0 ? (
            <>
              <Typography>
                ¿Estás seguro de que deseas eliminar el rol "{deleteDialog.role?.display_name}"?
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Esta acción no se puede deshacer.
              </Typography>
            </>
          ) : (
            <Alert severity="warning">
              No puedes eliminar este rol porque tiene {deleteDialog.role?.user_count} usuarios asignados.
              Primero debes reasignar o eliminar esos usuarios.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, role: null })}>
            Cancelar
          </Button>
          {deleteDialog.role?.user_count === 0 && (
            <Button onClick={confirmDelete} color="error" variant="contained">
              Eliminar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </AdminRoute>
  );
}









