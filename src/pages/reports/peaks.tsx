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
  Chip,
  Toolbar
} from '@mui/material';
import { 
  TrendingUp, 
  People, 
  Schedule, 
  AccessTime,
  Group,
  Timeline
} from '@mui/icons-material';
import DateRangeFilter from '../../components/DateRangeFilter';
import { CustomLineChart, CustomBarChart, CustomAreaChart, CHART_COLORS } from '../../components/Charts';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { ProtectedRoute } from '../../components/ProtectedRoute';

interface PeakStats {
  peakHour: string;
  peakDay: string;
  averageSessionTime: number;
  totalSessions: number;
  busiestHour: number;
  quietestHour: number;
}

interface HourlyPeaks {
  hour: string;
  entries: number;
  exits: number;
  occupancy: number;
}

interface AgeComparison {
  ageRange: string;
  count: number;
  averageTime: number;
  peakHour: string;
}

interface DailyPattern {
  day: string;
  entries: number;
  averageTime: number;
  peakHour: string;
}

interface WeeklyTrend {
  week: string;
  totalEntries: number;
  averageTime: number;
  peakDay: string;
}

export default function PeaksReport() {
  const { theme } = useTheme();
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los datos
  const [peakStats, setPeakStats] = useState<PeakStats | null>(null);
  const [hourlyPeaks, setHourlyPeaks] = useState<HourlyPeaks[]>([]);
  const [ageComparison, setAgeComparison] = useState<AgeComparison[]>([]);
  const [dailyPattern, setDailyPattern] = useState<DailyPattern[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrend[]>([]);

  const fetchPeaksReport = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulación de datos - en producción esto vendría de la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos simulados para el reporte de picos
      setPeakStats({
        peakHour: '18:00',
        peakDay: 'Miércoles',
        averageSessionTime: 85,
        totalSessions: 2847,
        busiestHour: 156,
        quietestHour: 8
      });

      setHourlyPeaks([
        { hour: '06:00', entries: 12, exits: 8, occupancy: 4 },
        { hour: '07:00', entries: 28, exits: 15, occupancy: 17 },
        { hour: '08:00', entries: 45, exits: 22, occupancy: 40 },
        { hour: '09:00', entries: 38, exits: 35, occupancy: 43 },
        { hour: '10:00', entries: 25, exits: 28, occupancy: 40 },
        { hour: '11:00', entries: 18, exits: 22, occupancy: 36 },
        { hour: '12:00', entries: 35, exits: 15, occupancy: 56 },
        { hour: '13:00', entries: 42, exits: 25, occupancy: 73 },
        { hour: '14:00', entries: 38, exits: 30, occupancy: 81 },
        { hour: '15:00', entries: 32, exits: 28, occupancy: 85 },
        { hour: '16:00', entries: 48, exits: 22, occupancy: 111 },
        { hour: '17:00', entries: 65, exits: 35, occupancy: 141 },
        { hour: '18:00', entries: 89, exits: 45, occupancy: 185 },
        { hour: '19:00', entries: 78, exits: 52, occupancy: 211 },
        { hour: '20:00', entries: 45, exits: 68, occupancy: 188 },
        { hour: '21:00', entries: 28, exits: 45, occupancy: 171 },
        { hour: '22:00', entries: 15, exits: 38, occupancy: 148 }
      ]);

      setAgeComparison([
        { ageRange: '18-25', count: 312, averageTime: 95, peakHour: '19:00' },
        { ageRange: '26-35', count: 498, averageTime: 88, peakHour: '18:00' },
        { ageRange: '36-45', count: 287, averageTime: 75, peakHour: '17:00' },
        { ageRange: '46-55', count: 124, averageTime: 65, peakHour: '16:00' },
        { ageRange: '55+', count: 26, averageTime: 55, peakHour: '15:00' }
      ]);

      setDailyPattern([
        { day: 'Lunes', entries: 245, averageTime: 82, peakHour: '18:00' },
        { day: 'Martes', entries: 267, averageTime: 85, peakHour: '19:00' },
        { day: 'Miércoles', entries: 289, averageTime: 88, peakHour: '18:00' },
        { day: 'Jueves', entries: 278, averageTime: 86, peakHour: '18:00' },
        { day: 'Viernes', entries: 312, averageTime: 90, peakHour: '17:00' },
        { day: 'Sábado', entries: 198, averageTime: 95, peakHour: '10:00' },
        { day: 'Domingo', entries: 156, averageTime: 88, peakHour: '11:00' }
      ]);

      setWeeklyTrend([
        { week: 'Sem 1', totalEntries: 1847, averageTime: 85, peakDay: 'Miércoles' },
        { week: 'Sem 2', totalEntries: 1923, averageTime: 87, peakDay: 'Viernes' },
        { week: 'Sem 3', totalEntries: 2015, averageTime: 89, peakDay: 'Miércoles' },
        { week: 'Sem 4', totalEntries: 2089, averageTime: 91, peakDay: 'Viernes' }
      ]);
      
    } catch (err) {
      setError('Error al cargar los datos del reporte de picos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeaksReport();
  }, []);

  const handleApplyFilter = () => {
    fetchPeaksReport();
  };

  const handleResetFilter = () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    setStartDate(thirtyDaysAgo);
    setEndDate(new Date());
    fetchPeaksReport();
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }: any) => (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box sx={{ color, fontSize: 40 }}>
            {icon}
          </Box>
          <Box textAlign="right">
            <Typography variant="h4" sx={{ fontWeight: 600, color }}>
              {value}
            </Typography>
            {trend && (
              <Chip 
                label={trend} 
                size="small" 
                color="info" 
                sx={{ mt: 1 }}
              />
            )}
          </Box>
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
              📊 Reporte de Picos y Patrones
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
                title="Hora Pico"
                value={peakStats?.peakHour}
                icon={<TrendingUp />}
                color={CHART_COLORS.primary}
                subtitle="Hora de mayor afluencia"
                trend="Máximo"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Día Más Activo"
                value={peakStats?.peakDay}
                icon={<People />}
                color={CHART_COLORS.secondary}
                subtitle="Día de la semana con más actividad"
                trend="Pico"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tiempo Promedio"
                value={`${peakStats?.averageSessionTime} min`}
                icon={<Schedule />}
                color={CHART_COLORS.tertiary}
                subtitle="Duración promedio de sesión"
                trend="Óptimo"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total de Sesiones"
                value={peakStats?.totalSessions.toLocaleString()}
                icon={<Group />}
                color={CHART_COLORS.quaternary}
                subtitle="Sesiones en el período"
                trend="Activo"
              />
            </Grid>
          </Grid>

          {/* Gráficos */}
          <Grid container spacing={3}>
            {/* Picos por Hora */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomAreaChart
                  data={hourlyPeaks}
                  dataKey="occupancy"
                  xAxisKey="hour"
                  title="Ocupación por Hora del Día"
                  height={400}
                  color={CHART_COLORS.primary}
                />
              </Paper>
            </Grid>

            {/* Comparativa por Edades */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomBarChart
                  data={ageComparison}
                  dataKey="averageTime"
                  xAxisKey="ageRange"
                  title="Tiempo Promedio por Rango de Edad"
                  height={400}
                  color={CHART_COLORS.secondary}
                />
              </Paper>
            </Grid>

            {/* Patrón Diario */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomBarChart
                  data={dailyPattern}
                  dataKey="entries"
                  xAxisKey="day"
                  title="Entradas por Día de la Semana"
                  height={400}
                  color={CHART_COLORS.tertiary}
                />
              </Paper>
            </Grid>

            {/* Tendencia Semanal */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomLineChart
                  data={weeklyTrend}
                  dataKey="totalEntries"
                  xAxisKey="week"
                  title="Tendencia Semanal de Entradas"
                  height={400}
                  color={CHART_COLORS.quaternary}
                />
              </Paper>
            </Grid>

            {/* Análisis Detallado de Horarios */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomLineChart
                  data={hourlyPeaks}
                  dataKey="entries"
                  xAxisKey="hour"
                  title="Flujo de Entradas por Hora"
                  height={400}
                  color={CHART_COLORS.quinary}
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Resumen de patrones */}
          <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📈 Análisis de Patrones
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Hora más ocupada:</strong> {peakStats?.peakHour} ({peakStats?.busiestHour} personas)
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Hora más tranquila:</strong> {peakStats?.quietestHour}:00 ({peakStats?.quietestHour} personas)
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Grupo de edad más activo:</strong> {ageComparison[1]?.ageRange} ({ageComparison[1]?.count} usuarios)
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Día con mayor crecimiento:</strong> {weeklyTrend[weeklyTrend.length - 1]?.peakDay}
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
