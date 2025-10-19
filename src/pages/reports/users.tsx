import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Toolbar
} from '@mui/material';
import { People, TrendingUp, Group, PersonAdd } from '@mui/icons-material';
import DateRangeFilter from '../../components/DateRangeFilter';
import { CustomLineChart, CustomBarChart, CustomPieChart, CHART_COLORS } from '../../components/Charts';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { ProtectedRoute } from '../../components/ProtectedRoute';

interface UserStats {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

interface AgeDistribution {
  range: string;
  count: number;
  percentage: number;
}

interface GenderDistribution {
  gender: string;
  count: number;
  percentage: number;
}

interface UserRegistrationTrend {
  date: string;
  registrations: number;
  cumulative: number;
}

export default function UsersReport() {
  const { theme } = useTheme();
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los datos
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [ageDistribution, setAgeDistribution] = useState<AgeDistribution[]>([]);
  const [genderDistribution, setGenderDistribution] = useState<GenderDistribution[]>([]);
  const [registrationTrend, setRegistrationTrend] = useState<UserRegistrationTrend[]>([]);

  const fetchUserReport = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulación de datos - en producción esto vendría de la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos simulados para el reporte de usuarios
      setUserStats({
        totalUsers: 1247,
        newUsers: 89,
        activeUsers: 1156,
        inactiveUsers: 91
      });

      setAgeDistribution([
        { range: '18-25', count: 312, percentage: 25.0 },
        { range: '26-35', count: 498, percentage: 39.9 },
        { range: '36-45', count: 287, percentage: 23.0 },
        { range: '46-55', count: 124, percentage: 9.9 },
        { range: '55+', count: 26, percentage: 2.1 }
      ]);

      setGenderDistribution([
        { gender: 'Masculino', count: 748, percentage: 60.0 },
        { gender: 'Femenino', count: 499, percentage: 40.0 }
      ]);

      setRegistrationTrend([
        { date: '2024-01-01', registrations: 12, cumulative: 12 },
        { date: '2024-01-02', registrations: 8, cumulative: 20 },
        { date: '2024-01-03', registrations: 15, cumulative: 35 },
        { date: '2024-01-04', registrations: 22, cumulative: 57 },
        { date: '2024-01-05', registrations: 18, cumulative: 75 },
        { date: '2024-01-06', registrations: 25, cumulative: 100 },
        { date: '2024-01-07', registrations: 14, cumulative: 114 }
      ]);
      
    } catch (err) {
      setError('Error al cargar los datos del reporte de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserReport();
  }, []);

  const handleApplyFilter = () => {
    fetchUserReport();
  };

  const handleResetFilter = () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    setStartDate(thirtyDaysAgo);
    setEndDate(new Date());
    fetchUserReport();
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box sx={{ color, fontSize: 40 }}>
            {icon}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color }}>
            {value}
          </Typography>
        </Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
              👥 Reporte de Usuarios
            </Typography>

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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Estadísticas principales */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total de Usuarios"
                value={userStats?.totalUsers.toLocaleString()}
                icon={<People />}
                color={CHART_COLORS.primary}
                subtitle="Usuarios registrados en el sistema"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Nuevos Usuarios"
                value={userStats?.newUsers.toLocaleString()}
                icon={<PersonAdd />}
                color={CHART_COLORS.secondary}
                subtitle="Registros en el período seleccionado"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Usuarios Activos"
                value={userStats?.activeUsers.toLocaleString()}
                icon={<TrendingUp />}
                color={CHART_COLORS.success}
                subtitle="Usuarios con membresía activa"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Usuarios Inactivos"
                value={userStats?.inactiveUsers.toLocaleString()}
                icon={<Group />}
                color={CHART_COLORS.warning}
                subtitle="Usuarios sin membresía activa"
              />
            </Grid>
          </Grid>

          {/* Gráficos */}
          <Grid container spacing={3}>
            {/* Distribución por Edades */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomBarChart
                  data={ageDistribution}
                  dataKey="count"
                  xAxisKey="range"
                  title="Distribución por Edades"
                  height={350}
                  color={CHART_COLORS.primary}
                />
              </Paper>
            </Grid>

            {/* Distribución por Género */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomPieChart
                  data={genderDistribution}
                  dataKey="count"
                  nameKey="gender"
                  title="Distribución por Género"
                  height={350}
                />
              </Paper>
            </Grid>

            {/* Tendencia de Registros */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomLineChart
                  data={registrationTrend}
                  dataKey="registrations"
                  xAxisKey="date"
                  title="Tendencia de Registros Diarios"
                  height={400}
                  color={CHART_COLORS.secondary}
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Resumen de datos */}
          <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📈 Resumen del Período
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Período analizado:</strong> {startDate?.toLocaleDateString('es-ES')} - {endDate?.toLocaleDateString('es-ES')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Rango de edad predominante:</strong> 26-35 años ({ageDistribution.find(a => a.range === '26-35')?.percentage}%)
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Promedio de registros diarios:</strong> {Math.round((userStats?.newUsers || 0) / 30)} usuarios/día
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
          </Container>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
