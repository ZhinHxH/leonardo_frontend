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
  Alert
} from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DateRangeFilter from '../../components/DateRangeFilter';
import { CustomLineChart, CustomBarChart, CustomPieChart } from '../../components/Charts';

interface UserStats {
  total_users: number;
  new_users: number;
  active_users: number;
  inactive_users: number;
  age_distribution: Array<{ age_range: string; count: number }>;
  gender_distribution: Array<{ gender: string; count: number }>;
  daily_registrations: Array<{ date: string; count: number }>;
  membership_distribution: Array<{ membership_type: string; count: number }>;
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
      
      // Simular datos de ejemplo (en producción esto vendría de la API)
      const mockStats: UserStats = {
        total_users: 1250,
        new_users: 45,
        active_users: 980,
        inactive_users: 270,
        age_distribution: [
          { age_range: '18-25', count: 320 },
          { age_range: '26-35', count: 450 },
          { age_range: '36-45', count: 280 },
          { age_range: '46-55', count: 150 },
          { age_range: '55+', count: 50 }
        ],
        gender_distribution: [
          { gender: 'Masculino', count: 750 },
          { gender: 'Femenino', count: 500 }
        ],
        daily_registrations: [
          { date: '2024-01-01', count: 5 },
          { date: '2024-01-02', count: 8 },
          { date: '2024-01-03', count: 12 },
          { date: '2024-01-04', count: 7 },
          { date: '2024-01-05', count: 15 },
          { date: '2024-01-06', count: 9 },
          { date: '2024-01-07', count: 11 }
        ],
        membership_distribution: [
          { membership_type: 'Básica', count: 400 },
          { membership_type: 'Premium', count: 350 },
          { membership_type: 'VIP', count: 200 },
          { membership_type: 'Sin membresía', count: 300 }
        ]
      };
      
      setStats(mockStats);
      
    } catch (err: any) {
      setError(err.message);
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
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
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
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
