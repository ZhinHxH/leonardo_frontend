import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Toolbar,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Alert,
  Divider,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  Add,
  Edit,
  Delete,
  Star,
  AccessTime,
  Group,
  Pool as PoolIcon,
  FitnessCenter
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import membershipPlansService, { MembershipPlan, PlanCreate } from '../../services/membership-plans';

// Interface importada desde el servicio

// Los datos ahora se cargan desde el backend

export default function MembershipPlans() {
  const router = useRouter();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState<{ open: boolean; plan: MembershipPlan | null; isNew: boolean }>({
    open: false,
    plan: null,
    isNew: false
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; plan: MembershipPlan | null }>({
    open: false,
    plan: null
  });

  const [formData, setFormData] = useState<Partial<MembershipPlan>>({
    name: '',
    description: '',
    plan_type: 'monthly',
    price: 0,
    duration_days: 30,
    access_hours_start: '06:00',
    access_hours_end: '22:00',
    includes_trainer: false,
    includes_nutritionist: false,
    includes_pool: false,
    includes_classes: false,
    max_guests: 0,
    is_active: true,
    is_popular: false
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Cargando planes de membresía...');
      const plansData = await membershipPlansService.getPlans();
      console.log('✅ Planes cargados:', plansData);
      setPlans(plansData);
    } catch (err: any) {
      console.error('❌ Error cargando planes:', err);
      setError(err.message || 'Error cargando planes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = () => {
    setFormData({
      name: '',
      description: '',
      plan_type: 'monthly',
      price: 0,
      duration_days: 30,
      access_hours_start: '06:00',
      access_hours_end: '22:00',
      includes_trainer: false,
      includes_nutritionist: false,
      includes_pool: false,
      includes_classes: false,
      max_guests: 0,
      is_active: true,
      is_popular: false
    });
    setEditDialog({ open: true, plan: null, isNew: true });
  };

  const handleEditPlan = (plan: MembershipPlan) => {
    setFormData(plan);
    setEditDialog({ open: true, plan, isNew: false });
  };

  const handleDeletePlan = (plan: MembershipPlan) => {
    setDeleteDialog({ open: true, plan });
  };

  const handleSavePlan = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (editDialog.isNew) {
        await membershipPlansService.createPlan(formData as PlanCreate);
      } else if (editDialog.plan) {
        await membershipPlansService.updatePlan(editDialog.plan.id, formData);
      }
      
      setEditDialog({ open: false, plan: null, isNew: false });
      await loadPlans(); // Recargar datos
      
    } catch (err: any) {
      setError(err.message || 'Error guardando plan');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.plan) return;
    
    setLoading(true);
    setError('');
    
    try {
      await membershipPlansService.deletePlan(deleteDialog.plan.id);
      setDeleteDialog({ open: false, plan: null });
      await loadPlans(); // Recargar datos
      
    } catch (err: any) {
      setError(err.message || 'Error eliminando plan');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPlanTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
      case 'yearly': return 'Anual';
      default: return type;
    }
  };

  return (
    <AdminRoute allowedRoles={['admin', 'manager']}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                  <AttachMoneyIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h4" component="h1">
                    Planes y Tarifas
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  onClick={handleAddPlan}
                  disabled={loading}
                >
                  Nuevo Plan
                </Button>
              </Box>

              {/* Error alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                {loading ? (
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                      <CircularProgress />
                      <Typography variant="body2" color="text.secondary" ml={2}>
                        Cargando planes de membresía...
                      </Typography>
                    </Box>
                  </Grid>
                ) : plans.length === 0 ? (
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                      <Typography variant="body1" color="text.secondary">
                        No hay planes de membresía configurados
                      </Typography>
                    </Box>
                  </Grid>
                ) : (
                  plans.map((plan) => (
                  <Grid item xs={12} md={6} lg={4} key={plan.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        border: plan.is_popular ? '2px solid gold' : '1px solid #e0e0e0',
                        position: 'relative'
                      }}
                    >
                      {plan.is_popular && (
                        <Chip
                          label="Más Popular"
                          color="warning"
                          size="small"
                          icon={<Star />}
                          sx={{ position: 'absolute', top: 10, right: 10 }}
                        />
                      )}
                      
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Typography variant="h6" fontWeight="bold">
                            {plan.name}
                          </Typography>
                          <Chip
                            label={plan.is_active ? 'Activo' : 'Inactivo'}
                            color={plan.is_active ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {plan.description}
                        </Typography>

                        <Box display="flex" alignItems="baseline" mb={2}>
                          {plan.discount_price ? (
                            <>
                              <Typography variant="h4" fontWeight="bold" color="primary">
                                {formatPrice(plan.discount_price)}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ textDecoration: 'line-through', ml: 1, color: 'text.secondary' }}
                              >
                                {formatPrice(plan.price)}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="h4" fontWeight="bold" color="primary">
                              {formatPrice(plan.price)}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            / {getPlanTypeLabel(plan.plan_type)}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box>
                          <Typography variant="subtitle2" mb={1}>Incluye:</Typography>
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <AccessTime fontSize="small" />
                              <Typography variant="body2">
                                {plan.access_hours_start} - {plan.access_hours_end}
                              </Typography>
                            </Box>
                            {plan.includes_trainer && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <FitnessCenter fontSize="small" color="success" />
                                <Typography variant="body2">Entrenador personal</Typography>
                              </Box>
                            )}
                            {plan.includes_nutritionist && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2">🥗 Nutricionista</Typography>
                              </Box>
                            )}
                            {plan.includes_pool && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <PoolIcon fontSize="small" color="info" />
                                <Typography variant="body2">Piscina</Typography>
                              </Box>
                            )}
                            {plan.includes_classes && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <Group fontSize="small" color="secondary" />
                                <Typography variant="body2">Clases grupales</Typography>
                              </Box>
                            )}
                            {plan.max_guests > 0 && (
                              <Typography variant="body2">
                                👥 Hasta {plan.max_guests} invitados
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box display="flex" justifyContent="space-between" mt={3}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => handleEditPlan(plan)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<Delete />}
                            onClick={() => handleDeletePlan(plan)}
                          >
                            Eliminar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  ))
                )}
              </Grid>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Dialog de edición/creación de plan */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, plan: null, isNew: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editDialog.isNew ? 'Crear Nuevo Plan' : 'Editar Plan'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Plan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Plan</InputLabel>
                <Select
                  value={formData.plan_type}
                  label="Tipo de Plan"
                  onChange={(e) => setFormData({ ...formData, plan_type: e.target.value as any })}
                >
                  <MenuItem value="daily">Diario</MenuItem>
                  <MenuItem value="weekly">Semanal</MenuItem>
                  <MenuItem value="monthly">Mensual</MenuItem>
                  <MenuItem value="yearly">Anual</MenuItem>
                </Select>
              </FormControl>
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio con Descuento (Opcional)"
                type="number"
                value={formData.discount_price || ''}
                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value ? Number(e.target.value) : undefined })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Duración (días)"
                type="number"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Hora Inicio"
                type="time"
                value={formData.access_hours_start}
                onChange={(e) => setFormData({ ...formData, access_hours_start: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Hora Fin"
                type="time"
                value={formData.access_hours_end}
                onChange={(e) => setFormData({ ...formData, access_hours_end: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Máximo de Invitados"
                type="number"
                value={formData.max_guests}
                onChange={(e) => setFormData({ ...formData, max_guests: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" mb={1}>Servicios Incluidos:</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.includes_trainer}
                        onChange={(e) => setFormData({ ...formData, includes_trainer: e.target.checked })}
                      />
                    }
                    label="Entrenador Personal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.includes_nutritionist}
                        onChange={(e) => setFormData({ ...formData, includes_nutritionist: e.target.checked })}
                      />
                    }
                    label="Nutricionista"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.includes_pool}
                        onChange={(e) => setFormData({ ...formData, includes_pool: e.target.checked })}
                      />
                    }
                    label="Piscina"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.includes_classes}
                        onChange={(e) => setFormData({ ...formData, includes_classes: e.target.checked })}
                      />
                    }
                    label="Clases Grupales"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_popular}
                        onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                      />
                    }
                    label="Plan Popular"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                    }
                    label="Plan Activo"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, plan: null, isNew: false })}>
            Cancelar
          </Button>
          <Button onClick={handleSavePlan} variant="contained">
            {editDialog.isNew ? 'Crear Plan' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, plan: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el plan "{deleteDialog.plan?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, plan: null })}>
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
