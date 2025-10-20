import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Toolbar,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar
} from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DateRangeFilter from '../../components/DateRangeFilter';
import { CustomLineChart, CustomBarChart, CustomPieChart } from '../../components/Charts';
import { getUsersReport } from '../../services/reports';

interface UserStats {
  total_users: number;
  new_users: number;
  active_users: number;
  inactive_users: number;
  age_distribution: Array<{ age_range: string; count: number }>;
  gender_distribution: Array<{ gender: string; count: number }>;
  daily_registrations: Array<{ date: string; count: number }>;
  membership_distribution: Array<{ membership_type: string; count: number }>;
  users_list: Array<{
    id: number;
    name: string;
    email: string;
    dni: string;
    phone: string;
    role: string;
    is_active: boolean;
    created_at: string;
    membership_type?: string;
    membership_status?: string;
  }>;
}

export default function UsersReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  
  // Filtros de fecha
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const loadUserStats = async () => {
    if (!startDate || !endDate) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Formatear fechas para la API
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Obtener datos reales del backend
      const response = await getUsersReport(startDateStr, endDateStr);
      
      // Transformar la respuesta para que coincida con la interfaz
      const transformedStats: UserStats = {
        total_users: response.user_stats.total_users,
        new_users: response.user_stats.new_users,
        active_users: response.user_stats.active_users,
        inactive_users: response.user_stats.inactive_users,
        age_distribution: response.age_distribution,
        gender_distribution: response.gender_distribution,
        daily_registrations: response.daily_registrations,
        membership_distribution: response.membership_distribution,
        users_list: response.users_list
      };
      
      setStats(transformedStats);
      
    } catch (err: any) {
      console.error('Error cargando estadísticas de usuarios:', err);
      setError(err.response?.data?.detail || err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserStats();
  }, [startDate, endDate]);

  const handleApplyFilter = () => {
    loadUserStats();
  };

  const handleResetFilter = () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    setStartDate(thirtyDaysAgo);
    setEndDate(new Date());
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={4}>
            <Typography variant="h4" gutterBottom>
              👥 Reporte de Usuarios
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Análisis demográfico y estadísticas de usuarios del gimnasio
            </Typography>

            {/* Filtros de fecha */}
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onApplyFilter={handleApplyFilter}
              onResetFilter={handleResetFilter}
              loading={loading}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : stats && (
              <>
                {/* Resumen estadístico */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <PeopleIcon sx={{ color: 'primary.main', mr: 1 }} />
                          <Typography variant="h6">Total Usuarios</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">
                          {stats.total_users.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <PeopleIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="h6">Nuevos Usuarios</Typography>
                        </Box>
                        <Typography variant="h4" color="success.main">
                          {stats.new_users}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <PeopleIcon sx={{ color: 'info.main', mr: 1 }} />
                          <Typography variant="h6">Usuarios Activos</Typography>
                        </Box>
                        <Typography variant="h4" color="info.main">
                          {stats.active_users}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <PeopleIcon sx={{ color: 'warning.main', mr: 1 }} />
                          <Typography variant="h6">Usuarios Inactivos</Typography>
                        </Box>
                        <Typography variant="h4" color="warning.main">
                          {stats.inactive_users}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Gráficos */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomBarChart
                        data={stats.age_distribution}
                        dataKey="count"
                        xAxisKey="age_range"
                        title="Distribución por Edades"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomPieChart
                        data={stats.gender_distribution}
                        dataKey="count"
                        nameKey="gender"
                        title="Distribución por Género"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomLineChart
                        data={stats.daily_registrations}
                        dataKey="count"
                        xAxisKey="date"
                        title="Registros Diarios"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomPieChart
                        data={stats.membership_distribution}
                        dataKey="count"
                        nameKey="membership_type"
                        title="Distribución por Tipo de Membresía"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </>
            )}

            {/* Tabla de usuarios */}
            {stats && stats.users_list && stats.users_list.length > 0 && (
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      👥 Lista de Usuarios ({stats.users_list.length})
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Usuario</TableCell>
                            <TableCell>Contacto</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Membresía</TableCell>
                            <TableCell>Fecha Registro</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.users_list.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                    {user.name.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                      {user.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      ID: {user.id}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{user.email}</Typography>
                                {user.phone && (
                                  <Typography variant="caption" color="text.secondary">
                                    {user.phone}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={user.role.toUpperCase()} 
                                  size="small" 
                                  color={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={user.is_active ? 'Activo' : 'Inactivo'} 
                                  size="small" 
                                  color={user.is_active ? 'success' : 'error'}
                                />
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {user.membership_type || 'Sin membresía'}
                                  </Typography>
                                  {user.membership_status && (
                                    <Chip 
                                      label={user.membership_status} 
                                      size="small" 
                                      color={user.membership_status === 'Activa' ? 'success' : 'default'}
                                    />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(user.created_at).toLocaleDateString('es-ES')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(user.created_at).toLocaleTimeString('es-ES')}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
