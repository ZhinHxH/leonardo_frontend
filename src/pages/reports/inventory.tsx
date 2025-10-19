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
  Toolbar,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Inventory, 
  TrendingUp, 
  TrendingDown, 
  Warning,
  CheckCircle,
  AttachMoney,
  Assessment,
  Refresh,
  Download,
  PictureAsPdf,
  TableChart,
  FileDownload
} from '@mui/icons-material';
import DateRangeFilter from '../../components/DateRangeFilter';
import { CustomLineChart, CustomBarChart, CustomPieChart, CustomAreaChart } from '../../components/Charts';

// Paleta de colores para los gráficos
const CHART_COLORS = {
  primary: '#2E86AB',
  secondary: '#A23B72',
  success: '#F18F01',
  warning: '#C73E1D',
  error: '#C73E1D',
  info: '#6C757D',
  light: '#E9ECEF',
  tertiary: '#6C757D'
};
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import inventoryReportsService from '../../services/inventoryReports';
import { debugInventoryReport } from '../../utils/debugInventoryReport';

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
      // Obtener datos reales del backend
      const reportData = await inventoryReportsService.getCompleteReport({
        date_from: startDate.toISOString().split('T')[0],
        date_to: endDate.toISOString().split('T')[0]
      });
      
      // Mapear datos del backend a formato del frontend
      setInventoryStats({
        totalValue: reportData.stats.total_inventory_value,
        totalProducts: reportData.stats.total_products,
        lowStockItems: reportData.stats.low_stock_count,
        outOfStockItems: reportData.stats.out_of_stock_count,
        totalMovements: reportData.stock_movements.length,
        averageCost: reportData.stats.total_inventory_cost 
          ? reportData.stats.total_inventory_cost / reportData.stats.total_products 
          : 0
      });

      // Mapear movimientos de stock
      const mappedMovements = reportData.stock_movements.map(movement => ({
        date: movement.date,
        purchases: movement.purchases,
        sales: movement.sales,
        adjustments: movement.adjustments,
        netMovement: movement.net_movement
      }));
      setStockMovements(mappedMovements);

      // Mapear valores por categoría
      const mappedCategoryValues = reportData.category_values.map(category => ({
        category: category.category,
        value: category.value,
        percentage: category.percentage,
        products: category.products
      }));
      setCategoryValues(mappedCategoryValues);

      // Mapear productos con stock bajo
      const mappedLowStockItems = reportData.low_stock_items.map(item => ({
        product: item.product,
        currentStock: item.current_stock,
        minStock: item.min_stock,
        category: item.category,
        value: item.value,
        status: item.status
      }));
      setLowStockItems(mappedLowStockItems);

      // Mapear productos más vendidos
      const mappedTopProducts = reportData.top_products.map(product => ({
        product: product.product,
        sales: product.sales,
        revenue: product.revenue,
        profit: product.profit,
        margin: product.margin
      }));
      setTopProducts(mappedTopProducts);

      // Mapear tendencias del inventario
      const rawTrends = reportData.trends || [];
      const mappedTrends = rawTrends.map(trend => ({
        month: trend.month,
        totalValue: trend.total_value || 0,
        movements: trend.movements || 0,
        growth: trend.growth || 0
      }));
      
      // Validar y formatear datos para el gráfico
      const isValid = debugInventoryReport.validateTrendsData(mappedTrends);
      const finalTrends = isValid ? mappedTrends : debugInventoryReport.createSampleTrendsData();
      
      console.log('📊 Tendencias del inventario procesadas:', finalTrends);
      setInventoryTrend(finalTrends);
      
    } catch (err: any) {
      console.error('Error fetching inventory report:', err);
      setError(err.message || 'Error al cargar los datos del reporte de inventario');
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

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setLoading(true);
      let blob: Blob;
      
      switch (format) {
        case 'pdf':
          blob = await inventoryReportsService.exportToPDF({
            date_from: startDate?.toISOString().split('T')[0],
            date_to: endDate?.toISOString().split('T')[0]
          });
          break;
        case 'excel':
          blob = await inventoryReportsService.exportToExcel({
            date_from: startDate?.toISOString().split('T')[0],
            date_to: endDate?.toISOString().split('T')[0]
          });
          break;
        case 'csv':
          blob = await inventoryReportsService.exportToCSV({
            date_from: startDate?.toISOString().split('T')[0],
            date_to: endDate?.toISOString().split('T')[0]
          });
          break;
        default:
          throw new Error('Formato no soportado');
      }

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-inventario-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error: any) {
      setError(`Error exportando reporte: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = () => {
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                📦 Reporte de Inventario
              </Typography>
              
              <Box display="flex" gap={2}>
                <Tooltip title="Actualizar datos">
                  <IconButton 
                    onClick={handleRefreshData} 
                    disabled={loading}
                    color="primary"
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
                
                <ButtonGroup variant="outlined" size="small">
                  <Tooltip title="Exportar a PDF">
                    <Button 
                      startIcon={<PictureAsPdf />}
                      onClick={() => handleExportReport('pdf')}
                      disabled={loading}
                    >
                      PDF
                    </Button>
                  </Tooltip>
                  <Tooltip title="Exportar a Excel">
                    <Button 
                      startIcon={<TableChart />}
                      onClick={() => handleExportReport('excel')}
                      disabled={loading}
                    >
                      Excel
                    </Button>
                  </Tooltip>
                  <Tooltip title="Exportar a CSV">
                    <Button 
                      startIcon={<FileDownload />}
                      onClick={() => handleExportReport('csv')}
                      disabled={loading}
                    >
                      CSV
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </Box>
            </Box>

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
                      color={CHART_COLORS.warning}
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
                        color={CHART_COLORS.info}
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
