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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Toolbar
} from '@mui/material';
import { 
  Inventory, 
  TrendingUp, 
  TrendingDown, 
  Warning,
  CheckCircle,
  AttachMoney,
  Assessment
} from '@mui/icons-material';
import DateRangeFilter from '../../components/DateRangeFilter';
import { CustomLineChart, CustomBarChart, CustomPieChart, CustomAreaChart, CHART_COLORS } from '../../components/Charts';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { ProtectedRoute } from '../../components/ProtectedRoute';

interface InventoryStats {
  totalValue: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalMovements: number;
  averageCost: number;
}

interface StockMovement {
  date: string;
  purchases: number;
  sales: number;
  adjustments: number;
  netMovement: number;
}

interface CategoryValue {
  category: string;
  value: number;
  percentage: number;
  products: number;
}

interface LowStockItem {
  product: string;
  currentStock: number;
  minStock: number;
  category: string;
  value: number;
  status: 'low' | 'critical' | 'out';
}

interface TopProducts {
  product: string;
  sales: number;
  revenue: number;
  profit: number;
  margin: number;
}

interface InventoryTrend {
  month: string;
  totalValue: number;
  movements: number;
  growth: number;
}

export default function InventoryReport() {
  const { theme } = useTheme();
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los datos
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [categoryValues, setCategoryValues] = useState<CategoryValue[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProducts[]>([]);
  const [inventoryTrend, setInventoryTrend] = useState<InventoryTrend[]>([]);

  const fetchInventoryReport = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulación de datos - en producción esto vendría de la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos simulados para el reporte de inventario
      setInventoryStats({
        totalValue: 12500000,
        totalProducts: 47,
        lowStockItems: 8,
        outOfStockItems: 2,
        totalMovements: 156,
        averageCost: 265957
      });

      setStockMovements([
        { date: '2024-01-01', purchases: 450000, sales: 320000, adjustments: 15000, netMovement: 145000 },
        { date: '2024-01-02', purchases: 380000, sales: 410000, adjustments: -5000, netMovement: -35000 },
        { date: '2024-01-03', purchases: 520000, sales: 380000, adjustments: 10000, netMovement: 150000 },
        { date: '2024-01-04', purchases: 290000, sales: 450000, adjustments: -8000, netMovement: -168000 },
        { date: '2024-01-05', purchases: 610000, sales: 520000, adjustments: 12000, netMovement: 102000 },
        { date: '2024-01-06', purchases: 420000, sales: 480000, adjustments: -3000, netMovement: -63000 },
        { date: '2024-01-07', purchases: 380000, sales: 390000, adjustments: 5000, netMovement: -5000 }
      ]);

      setCategoryValues([
        { category: 'Suplementos', value: 5200000, percentage: 41.6, products: 18 },
        { category: 'Bebidas', value: 2100000, percentage: 16.8, products: 12 },
        { category: 'Accesorios', value: 1900000, percentage: 15.2, products: 8 },
        { category: 'Snacks Saludables', value: 1800000, percentage: 14.4, products: 6 },
        { category: 'Ropa Deportiva', value: 1500000, percentage: 12.0, products: 3 }
      ]);

      setLowStockItems([
        { product: 'Proteína Whey Premium', currentStock: 3, minStock: 5, category: 'Suplementos', value: 360000, status: 'low' },
        { product: 'Creatina Monohidrato', currentStock: 2, minStock: 10, category: 'Suplementos', value: 100000, status: 'critical' },
        { product: 'Guantes de Entrenamiento', currentStock: 0, minStock: 5, category: 'Accesorios', value: 0, status: 'out' },
        { product: 'Bebida Energética Natural', currentStock: 8, minStock: 20, category: 'Bebidas', value: 32000, status: 'low' },
        { product: 'Barra Proteica Chocolate', currentStock: 1, minStock: 15, category: 'Snacks Saludables', value: 3000, status: 'critical' },
        { product: 'Toalla Deportiva', currentStock: 0, minStock: 10, category: 'Accesorios', value: 0, status: 'out' }
      ]);

      setTopProducts([
        { product: 'Proteína Whey Premium', sales: 45, revenue: 5400000, profit: 1575000, margin: 29.2 },
        { product: 'Bebida Energética Natural', sales: 120, revenue: 480000, profit: 180000, margin: 37.5 },
        { product: 'Barra Proteica Chocolate', sales: 89, revenue: 267000, profit: 80100, margin: 30.0 },
        { product: 'Creatina Monohidrato', sales: 23, revenue: 1150000, profit: 368000, margin: 32.0 },
        { product: 'Guantes de Entrenamiento', sales: 15, revenue: 375000, profit: 150000, margin: 40.0 }
      ]);

      setInventoryTrend([
        { month: 'Ene', totalValue: 11800000, movements: 45, growth: 5.2 },
        { month: 'Feb', totalValue: 12100000, movements: 52, growth: 2.5 },
        { month: 'Mar', totalValue: 12300000, movements: 48, growth: 1.7 },
        { month: 'Abr', totalValue: 12500000, movements: 56, growth: 1.6 },
        { month: 'May', totalValue: 12800000, movements: 61, growth: 2.4 },
        { month: 'Jun', totalValue: 12500000, movements: 58, growth: -2.3 }
      ]);
      
    } catch (err) {
      setError('Error al cargar los datos del reporte de inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryReport();
  }, []);

  const handleApplyFilter = () => {
    fetchInventoryReport();
  };

  const handleResetFilter = () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    setStartDate(thirtyDaysAgo);
    setEndDate(new Date());
    fetchInventoryReport();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'warning';
      case 'critical': return 'error';
      case 'out': return 'error';
      default: return 'success';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low': return <Warning />;
      case 'critical': return <TrendingDown />;
      case 'out': return <Warning />;
      default: return <CheckCircle />;
    }
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
                color={trend.includes('+') ? 'success' : 'error'} 
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
              📦 Reporte de Inventario
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
                title="Valor Total"
                value={formatCurrency(inventoryStats?.totalValue || 0)}
                icon={<AttachMoney />}
                color={CHART_COLORS.primary}
                subtitle="Valor total del inventario"
                trend="+2.4%"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Productos"
                value={inventoryStats?.totalProducts}
                icon={<Inventory />}
                color={CHART_COLORS.secondary}
                subtitle="Total de productos en inventario"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Stock Bajo"
                value={inventoryStats?.lowStockItems}
                icon={<Warning />}
                color={CHART_COLORS.warning}
                subtitle="Productos con stock bajo"
                trend="Alerta"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Sin Stock"
                value={inventoryStats?.outOfStockItems}
                icon={<TrendingDown />}
                color={CHART_COLORS.error}
                subtitle="Productos agotados"
                trend="Crítico"
              />
            </Grid>
          </Grid>

          {/* Gráficos principales */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Valor por Categoría */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomPieChart
                  data={categoryValues}
                  dataKey="value"
                  nameKey="category"
                  title="Distribución del Valor por Categoría"
                  height={400}
                />
              </Paper>
            </Grid>

            {/* Movimientos de Stock */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomLineChart
                  data={stockMovements}
                  dataKey="netMovement"
                  xAxisKey="date"
                  title="Movimientos Netos de Stock"
                  height={400}
                  color={CHART_COLORS.secondary}
                />
              </Paper>
            </Grid>

            {/* Tendencia del Inventario */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <CustomAreaChart
                  data={inventoryTrend}
                  dataKey="totalValue"
                  xAxisKey="month"
                  title="Evolución del Valor del Inventario"
                  height={400}
                  color={CHART_COLORS.tertiary}
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Tabla de productos con stock bajo */}
          <Paper elevation={2} sx={{ mb: 4 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #E0E0E0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                ⚠️ Productos con Stock Bajo
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="center">Stock Actual</TableCell>
                    <TableCell align="center">Stock Mínimo</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="right">Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.product}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.category}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.currentStock}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {item.minStock}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={getStatusIcon(item.status)}
                          label={item.status === 'low' ? 'Bajo' : item.status === 'critical' ? 'Crítico' : 'Agotado'}
                          color={getStatusColor(item.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(item.value)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Productos más vendidos */}
          <Paper elevation={2} sx={{ mb: 4 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #E0E0E0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                🏆 Productos Más Vendidos
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="center">Ventas</TableCell>
                    <TableCell align="right">Ingresos</TableCell>
                    <TableCell align="right">Ganancia</TableCell>
                    <TableCell align="center">Margen %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {product.product}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {product.sales}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(product.revenue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500, color: CHART_COLORS.success }}>
                          {formatCurrency(product.profit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={product.margin}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {product.margin}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Resumen de cálculos */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📊 Resumen de Cálculos del Inventario
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Valor promedio por producto:</strong> {formatCurrency(inventoryStats?.averageCost || 0)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Total de movimientos:</strong> {inventoryStats?.totalMovements} en el período
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Categoría más valiosa:</strong> {categoryValues[0]?.category} ({categoryValues[0]?.percentage}%)
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Producto más rentable:</strong> {topProducts[0]?.product} ({topProducts[0]?.margin}% margen)
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
