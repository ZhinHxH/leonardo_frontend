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
import { AttachMoney as AttachMoneyIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DateRangeFilter from '../../components/DateRangeFilter';
import { CustomLineChart, CustomBarChart, CustomPieChart } from '../../components/Charts';

interface RevenueStats {
  total_revenue: number;
  daily_revenue: number;
  monthly_revenue: number;
  revenue_by_plan: Array<{ plan: string; revenue: number }>;
  payment_method_distribution: Array<{ method: string; amount: number; percentage: number }>;
  daily_revenue_trend: Array<{ date: string; revenue: number }>;
  membership_sales: Array<{ membership_type: string; sales: number }>;
  product_sales: Array<{ product_category: string; sales: number }>;
}

export default function RevenueReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  
  // Filtros de fecha
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const loadRevenueStats = async () => {
    if (!startDate || !endDate) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Simular datos de ejemplo (en producción esto vendría de la API)
      const mockStats: RevenueStats = {
        total_revenue: 2500000,
        daily_revenue: 85000,
        monthly_revenue: 2500000,
        revenue_by_plan: [
          { plan: 'Básica', revenue: 800000 },
          { plan: 'Premium', revenue: 1200000 },
          { plan: 'VIP', revenue: 500000 }
        ],
        payment_method_distribution: [
          { method: 'Efectivo', amount: 1000000, percentage: 40 },
          { method: 'Nequi', amount: 750000, percentage: 30 },
          { method: 'Bancolombia', amount: 500000, percentage: 20 },
          { method: 'Tarjeta', amount: 250000, percentage: 10 }
        ],
        daily_revenue_trend: [
          { date: '2024-01-01', revenue: 75000 },
          { date: '2024-01-02', revenue: 82000 },
          { date: '2024-01-03', revenue: 95000 },
          { date: '2024-01-04', revenue: 88000 },
          { date: '2024-01-05', revenue: 105000 },
          { date: '2024-01-06', revenue: 92000 },
          { date: '2024-01-07', revenue: 98000 }
        ],
        membership_sales: [
          { membership_type: 'Básica', sales: 45 },
          { membership_type: 'Premium', sales: 32 },
          { membership_type: 'VIP', sales: 18 }
        ],
        product_sales: [
          { product_category: 'Suplementos', sales: 150000 },
          { product_category: 'Ropa Deportiva', sales: 200000 },
          { product_category: 'Accesorios', sales: 100000 },
          { product_category: 'Bebidas', sales: 75000 }
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
    loadRevenueStats();
  }, [startDate, endDate]);

  const handleApplyFilter = () => {
    loadRevenueStats();
  };

  const handleResetFilter = () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    setStartDate(thirtyDaysAgo);
    setEndDate(new Date());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
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
              💰 Reporte de Ingresos
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Análisis de ventas, ingresos por plan y métodos de pago
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
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <AttachMoneyIcon sx={{ color: 'primary.main', mr: 1 }} />
                          <Typography variant="h6">Total Ingresos</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">
                          {formatCurrency(stats.total_revenue)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <AttachMoneyIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="h6">Ingresos Diarios</Typography>
                        </Box>
                        <Typography variant="h4" color="success.main">
                          {formatCurrency(stats.daily_revenue)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <AttachMoneyIcon sx={{ color: 'info.main', mr: 1 }} />
                          <Typography variant="h6">Ingresos Mensuales</Typography>
                        </Box>
                        <Typography variant="h4" color="info.main">
                          {formatCurrency(stats.monthly_revenue)}
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
                        data={stats.revenue_by_plan}
                        dataKey="revenue"
                        xAxisKey="plan"
                        title="Ingresos por Plan de Membresía"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomPieChart
                        data={stats.payment_method_distribution}
                        dataKey="amount"
                        nameKey="method"
                        title="Distribución por Método de Pago"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomLineChart
                        data={stats.daily_revenue_trend}
                        dataKey="revenue"
                        xAxisKey="date"
                        title="Tendencia de Ingresos Diarios"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomBarChart
                        data={stats.product_sales}
                        dataKey="sales"
                        xAxisKey="product_category"
                        title="Ventas por Categoría de Productos"
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
