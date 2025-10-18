import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Toolbar,
  Alert,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import membershipPlansService, { MembershipPlan } from '../../services/membership-plans';

export default function PlansDebug() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rawData, setRawData] = useState<any>(null);

  const loadPlans = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🚀 Cargando planes desde backend...');
      const plansData = await membershipPlansService.getPlans();
      
      console.log('📋 Planes recibidos:', plansData);
      setRawData(plansData);
      setPlans(plansData);
      
    } catch (err: any) {
      console.error('❌ Error cargando planes:', err);
      setError(err.message || 'Error cargando planes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

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
      case 'quarterly': return 'Trimestral';
      case 'yearly': return 'Anual';
      default: return type;
    }
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
              <Typography variant="h4" mb={3}>
                🔍 Debug - Planes de Membresía
              </Typography>

              <Button onClick={loadPlans} variant="contained" disabled={loading} sx={{ mb: 3 }}>
                {loading ? 'Cargando...' : 'Recargar Planes'}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" mb={2}>
                        📋 Planes Cargados ({plans.length})
                      </Typography>
                      
                      {loading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                          <CircularProgress />
                        </Box>
                      ) : plans.length > 0 ? (
                        <Grid container spacing={2}>
                          {plans.map((plan) => (
                            <Grid item xs={12} md={6} key={plan.id}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Box display="flex" justifyContent="between" alignItems="start" mb={1}>
                                    <Typography variant="h6" fontWeight="bold">
                                      {plan.name}
                                    </Typography>
                                    {plan.is_popular && (
                                      <Chip label="Popular" color="warning" size="small" />
                                    )}
                                  </Box>
                                  
                                  <Typography variant="body2" color="text.secondary" mb={2}>
                                    {plan.description}
                                  </Typography>

                                  <Typography variant="h5" color="primary" fontWeight="bold" mb={1}>
                                    {formatPrice(plan.price)}
                                  </Typography>
                                  
                                  <Typography variant="body2" mb={1}>
                                    <strong>Tipo:</strong> {getPlanTypeLabel(plan.plan_type)} ({plan.duration_days} días)
                                  </Typography>
                                  
                                  <Typography variant="body2" mb={1}>
                                    <strong>Horario:</strong> {plan.access_hours_start} - {plan.access_hours_end}
                                  </Typography>

                                  <Box>
                                    <Typography variant="body2" mb={1}>
                                      <strong>Incluye:</strong>
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                                      {plan.includes_nutritionist && <Chip label="Nutricionista" size="small" color="success" />}
                                      {plan.includes_classes && <Chip label="Clases/Aerorumba" size="small" color="info" />}
                                      {plan.includes_trainer && <Chip label="Entrenador" size="small" color="warning" />}
                                      {plan.max_guests > 0 && <Chip label={`${plan.max_guests} invitado(s)`} size="small" color="secondary" />}
                                      {!plan.includes_nutritionist && !plan.includes_classes && !plan.includes_trainer && (
                                        <Chip label="Solo instalaciones" size="small" variant="outlined" />
                                      )}
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography color="text.secondary">
                          No hay planes cargados
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" mb={2}>
                        🔧 Datos Raw del Backend
                      </Typography>
                      
                      {rawData ? (
                        <pre style={{ 
                          fontSize: '10px', 
                          background: '#f5f5f5', 
                          padding: '10px', 
                          borderRadius: '4px',
                          overflow: 'auto',
                          maxHeight: '400px'
                        }}>
                          {JSON.stringify(rawData, null, 2)}
                        </pre>
                      ) : (
                        <Typography color="text.secondary">
                          No hay datos para mostrar
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>
      </Box>
    </AdminRoute>
  );
}








