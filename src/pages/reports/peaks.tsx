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
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DateRangeFilter from '../../components/DateRangeFilter';
import { CustomLineChart, CustomBarChart, CustomAreaChart } from '../../components/Charts';

interface PeakStats {
  peak_hour: number;
  peak_day: string;
  average_occupation: number;
  max_occupation: number;
  hourly_occupation: Array<{ hour: number; users: number }>;
  daily_occupation: Array<{ day: string; users: number }>;
  age_comparison: Array<{ age_group: string; peak_hour: number; average_time: number }>;
  usage_patterns: Array<{ time_slot: string; users: number; duration: number }>;
}

export default function PeaksReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PeakStats | null>(null);
  
  // Filtros de fecha
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const loadPeakStats = async () => {
    if (!startDate || !endDate) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Simular datos de ejemplo (en producción esto vendría de la API)
      const mockStats: PeakStats = {
        peak_hour: 18,
        peak_day: 'Lunes',
        average_occupation: 45,
        max_occupation: 120,
        hourly_occupation: [
          { hour: 5, users: 15 },
          { hour: 6, users: 25 },
          { hour: 7, users: 35 },
          { hour: 8, users: 20 },
          { hour: 9, users: 15 },
          { hour: 10, users: 10 },
          { hour: 11, users: 12 },
          { hour: 12, users: 30 },
          { hour: 13, users: 25 },
          { hour: 14, users: 20 },
          { hour: 15, users: 18 },
          { hour: 16, users: 35 },
          { hour: 17, users: 65 },
          { hour: 18, users: 120 },
          { hour: 19, users: 95 },
          { hour: 20, users: 70 },
          { hour: 21, users: 45 },
          { hour: 22, users: 20 }
        ],
        daily_occupation: [
          { day: 'Lunes', users: 85 },
          { day: 'Martes', users: 78 },
          { day: 'Miércoles', users: 92 },
          { day: 'Jueves', users: 88 },
          { day: 'Viernes', users: 95 },
          { day: 'Sábado', users: 65 },
          { day: 'Domingo', users: 45 }
        ],
        age_comparison: [
          { age_group: '18-25', peak_hour: 19, average_time: 90 },
          { age_group: '26-35', peak_hour: 18, average_time: 75 },
          { age_group: '36-45', peak_hour: 17, average_time: 60 },
          { age_group: '46-55', peak_hour: 16, average_time: 45 },
          { age_group: '55+', peak_hour: 15, average_time: 30 }
        ],
        usage_patterns: [
          { time_slot: 'Mañana (6-12h)', users: 25, duration: 60 },
          { time_slot: 'Mediodía (12-14h)', users: 30, duration: 45 },
          { time_slot: 'Tarde (14-18h)', users: 40, duration: 75 },
          { time_slot: 'Noche (18-22h)', users: 80, duration: 90 }
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
    loadPeakStats();
  }, [startDate, endDate]);

  const handleApplyFilter = () => {
    loadPeakStats();
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
              📈 Reporte de Picos
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Análisis de horarios pico, ocupación y patrones de uso
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
                          <TrendingUpIcon sx={{ color: 'primary.main', mr: 1 }} />
                          <Typography variant="h6">Hora Pico</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">
                          {stats.peak_hour}:00
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="h6">Día Pico</Typography>
                        </Box>
                        <Typography variant="h4" color="success.main">
                          {stats.peak_day}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <TrendingUpIcon sx={{ color: 'info.main', mr: 1 }} />
                          <Typography variant="h6">Ocupación Promedio</Typography>
                        </Box>
                        <Typography variant="h4" color="info.main">
                          {stats.average_occupation}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <TrendingUpIcon sx={{ color: 'warning.main', mr: 1 }} />
                          <Typography variant="h6">Ocupación Máxima</Typography>
                        </Box>
                        <Typography variant="h4" color="warning.main">
                          {stats.max_occupation}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Gráficos */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomAreaChart
                        data={stats.hourly_occupation}
                        dataKey="users"
                        xAxisKey="hour"
                        title="Ocupación por Hora del Día"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomBarChart
                        data={stats.daily_occupation}
                        dataKey="users"
                        xAxisKey="day"
                        title="Ocupación por Día de la Semana"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomBarChart
                        data={stats.age_comparison}
                        dataKey="peak_hour"
                        xAxisKey="age_group"
                        title="Hora Pico por Grupo de Edad"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomLineChart
                        data={stats.usage_patterns}
                        dataKey="users"
                        xAxisKey="time_slot"
                        title="Patrones de Uso por Franja Horaria"
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
