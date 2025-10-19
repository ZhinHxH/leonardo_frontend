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
  AttachMoney, 
  TrendingUp, 
  Receipt, 
  CreditCard,
  LocalAtm,
  AccountBalance
} from '@mui/icons-material';
import DateRangeFilter from '../../components/DateRangeFilter';
import { CustomLineChart, CustomBarChart, CustomPieChart, CHART_COLORS } from '../../components/Charts';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { ProtectedRoute } from '../../components/ProtectedRoute';

interface RevenueStats {
  totalRevenue: number;
  membershipRevenue: number;
  dailyAccessRevenue: number;
  productSalesRevenue: number;
  growthRate: number;
}

interface RevenueByPlan {
  plan: string;
  revenue: number;
  count: number;
  percentage: number;
}

interface PaymentMethodData {
  method: string;
  amount: number;
  percentage: number;
  count: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  membership: number;
  dailyAccess: number;
  products: number;
}

interface MonthlyTrend {
  month: string;
  revenue: number;
  growth: number;
}

export default function RevenueReport() {
  const { theme } = useTheme();
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los datos
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [revenueByPlan, setRevenueByPlan] = useState<RevenueByPlan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);

  const fetchRevenueReport = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulación de datos - en producción esto vendría de la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos simulados para el reporte de ingresos
      setRevenueStats({
        totalRevenue: 15420000,
        membershipRevenue: 12360000,
        dailyAccessRevenue: 2100000,
        productSalesRevenue: 960000,
        growthRate: 12.5
      });

      setRevenueByPlan([
        { plan: 'Plan Básico Mensual', revenue: 4800000, count: 40, percentage: 38.8 },
        { plan: 'Plan Premium Mensual', revenue: 3600000, count: 20, percentage: 29.1 },
        { plan: 'Plan Trimestral', revenue: 2400000, count: 8, percentage: 19.4 },
        { plan: 'Acceso Diario', revenue: 1200000, count: 80, percentage: 9.7 },
        { plan: 'Plan Estudiante', revenue: 360000, count: 4, percentage: 2.9 }
      ]);

      setPaymentMethods([
        { method: 'Efectivo', amount: 4626000, percentage: 30.0, count: 45 },
        { method: 'Nequi', amount: 4626000, percentage: 30.0, count: 38 },
        { method: 'Bancolombia', amount: 3084000, percentage: 20.0, count: 25 },
        { method: 'Daviplata', amount: 3084000, percentage: 20.0, count: 22 }
      ]);

      setDailyRevenue([
        { date: '2024-01-01', revenue: 450000, membership: 350000, dailyAccess: 75000, products: 25000 },
        { date: '2024-01-02', revenue: 520000, membership: 400000, dailyAccess: 80000, products: 40000 },
        { date: '2024-01-03', revenue: 480000, membership: 380000, dailyAccess: 70000, products: 30000 },
        { date: '2024-01-04', revenue: 610000, membership: 450000, dailyAccess: 100000, products: 60000 },
        { date: '2024-01-05', revenue: 580000, membership: 420000, dailyAccess: 90000, products: 70000 },
        { date: '2024-01-06', revenue: 650000, membership: 500000, dailyAccess: 100000, products: 50000 },
        { date: '2024-01-07', revenue: 720000, membership: 550000, dailyAccess: 120000, products: 50000 }
      ]);

      setMonthlyTrend([
        { month: 'Ene', revenue: 18500000, growth: 8.5 },
        { month: 'Feb', revenue: 19800000, growth: 7.0 },
        { month: 'Mar', revenue: 21200000, growth: 7.1 },
        { month: 'Abr', revenue: 22800000, growth: 7.5 },
        { month: 'May', revenue: 24500000, growth: 7.5 },
        { month: 'Jun', revenue: 26200000, growth: 6.9 }
      ]);
      
    } catch (err) {
      setError('Error al cargar los datos del reporte de ingresos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueReport();
  }, []);

  const handleApplyFilter = () => {
    fetchRevenueReport();
  };

  const handleResetFilter = () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    setStartDate(thirtyDaysAgo);
    setEndDate(new Date());
    fetchRevenueReport();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
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
                label={`+${trend}%`} 
                size="small" 
                color="success" 
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
              💰 Reporte de Ingresos
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
                title="Ingresos Totales"
                value={formatCurrency(revenueStats?.totalRevenue || 0)}
                icon={<AttachMoney />}
                color={CHART_COLORS.primary}
                subtitle="Total de ingresos en el período"
                trend={revenueStats?.growthRate}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Ingresos por Membresías"
                value={formatCurrency(revenueStats?.membershipRevenue || 0)}
                icon={<Receipt />}
                color={CHART_COLORS.secondary}
                subtitle="Planes de membresía vendidos"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Accesos Diarios"
                value={formatCurrency(revenueStats?.dailyAccessRevenue || 0)}
                icon={<LocalAtm />}
                color={CHART_COLORS.tertiary}
                subtitle="Pagos por acceso diario"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Ventas de Productos"
                value={formatCurrency(revenueStats?.productSalesRevenue || 0)}
                icon={<CreditCard />}
                color={CHART_COLORS.quaternary}
                subtitle="Ventas de suplementos y accesorios"
              />
            </Grid>
          </Grid>

          {/* Gráficos */}
          <Grid container spacing={3}>
            {/* Ingresos por Plan */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomBarChart
                  data={revenueByPlan}
                  dataKey="revenue"
                  xAxisKey="plan"
                  title="Ingresos por Plan de Membresía"
                  height={400}
                  color={CHART_COLORS.primary}
                />
              </Paper>
            </Grid>

            {/* Métodos de Pago */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomPieChart
                  data={paymentMethods}
                  dataKey="amount"
                  nameKey="method"
                  title="Distribución por Método de Pago"
                  height={400}
                />
              </Paper>
            </Grid>

            {/* Tendencia Diaria */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomLineChart
                  data={dailyRevenue}
                  dataKey="revenue"
                  xAxisKey="date"
                  title="Tendencia de Ingresos Diarios"
                  height={400}
                  color={CHART_COLORS.secondary}
                />
              </Paper>
            </Grid>

            {/* Comparativa de Fuentes de Ingreso */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomBarChart
                  data={dailyRevenue}
                  dataKeys={['membership', 'dailyAccess', 'products']}
                  xAxisKey="date"
                  title="Desglose de Ingresos por Fuente"
                  height={400}
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Resumen de datos */}
          <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📈 Análisis de Ingresos
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Ingresos promedio diarios:</strong> {formatCurrency((revenueStats?.totalRevenue || 0) / 30)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Plan más vendido:</strong> {revenueByPlan[0]?.plan} ({revenueByPlan[0]?.count} ventas)
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Método de pago preferido:</strong> {paymentMethods[0]?.method} ({paymentMethods[0]?.percentage}%)
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Crecimiento del período:</strong> +{revenueStats?.growthRate}%
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
