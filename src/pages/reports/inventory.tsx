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
  Chip
} from '@mui/material';
import { Inventory as InventoryIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DateRangeFilter from '../../components/DateRangeFilter';
import { CustomLineChart, CustomBarChart, CustomPieChart, CustomAreaChart } from '../../components/Charts';

interface InventoryStats {
  total_value: number;
  total_products: number;
  low_stock_items: number;
  out_of_stock_items: number;
  value_by_category: Array<{ category: string; value: number }>;
  stock_movements: Array<{ date: string; incoming: number; outgoing: number }>;
  inventory_evolution: Array<{ month: string; totalValue: number }>;
  top_selling_products: Array<{ product: string; sales: number; revenue: number }>;
  low_stock_products: Array<{ product: string; current_stock: number; min_stock: number; category: string }>;
}

export default function InventoryReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  
  // Filtros de fecha
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const loadInventoryStats = async () => {
    if (!startDate || !endDate) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Simular datos de ejemplo (en producción esto vendría de la API)
      const mockStats: InventoryStats = {
        total_value: 15000000,
        total_products: 150,
        low_stock_items: 12,
        out_of_stock_items: 3,
        value_by_category: [
          { category: 'Suplementos', value: 8000000 },
          { category: 'Ropa Deportiva', value: 4000000 },
          { category: 'Accesorios', value: 2000000 },
          { category: 'Bebidas', value: 1000000 }
        ],
        stock_movements: [
          { date: '2024-01-01', incoming: 50, outgoing: 25 },
          { date: '2024-01-02', incoming: 30, outgoing: 40 },
          { date: '2024-01-03', incoming: 45, outgoing: 35 },
          { date: '2024-01-04', incoming: 60, outgoing: 30 },
          { date: '2024-01-05', incoming: 35, outgoing: 50 },
          { date: '2024-01-06', incoming: 40, outgoing: 45 },
          { date: '2024-01-07', incoming: 55, outgoing: 40 }
        ],
        inventory_evolution: [
          { month: 'Ene', totalValue: 12000000 },
          { month: 'Feb', totalValue: 13500000 },
          { month: 'Mar', totalValue: 14200000 },
          { month: 'Abr', totalValue: 13800000 },
          { month: 'May', totalValue: 14500000 },
          { month: 'Jun', totalValue: 15000000 }
        ],
        top_selling_products: [
          { product: 'Proteína Whey', sales: 45, revenue: 2250000 },
          { product: 'Creatina', sales: 38, revenue: 1900000 },
          { product: 'Shorts Deportivos', sales: 32, revenue: 1600000 },
          { product: 'Botella Deportiva', sales: 28, revenue: 1400000 },
          { product: 'Banda de Resistencia', sales: 25, revenue: 1250000 }
        ],
        low_stock_products: [
          { product: 'Proteína Caseína', current_stock: 5, min_stock: 10, category: 'Suplementos' },
          { product: 'Guantes de Gimnasio', current_stock: 3, min_stock: 8, category: 'Accesorios' },
          { product: 'Cinturón de Pesas', current_stock: 2, min_stock: 5, category: 'Accesorios' },
          { product: 'Aminoácidos', current_stock: 4, min_stock: 12, category: 'Suplementos' }
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
    loadInventoryStats();
  }, [startDate, endDate]);

  const handleApplyFilter = () => {
    loadInventoryStats();
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
              📦 Reporte de Inventario
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Control de stock, movimientos y valoración de inventario
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
                          <InventoryIcon sx={{ color: 'primary.main', mr: 1 }} />
                          <Typography variant="h6">Valor Total</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">
                          {formatCurrency(stats.total_value)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <InventoryIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="h6">Total Productos</Typography>
                        </Box>
                        <Typography variant="h4" color="success.main">
                          {stats.total_products}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <InventoryIcon sx={{ color: 'warning.main', mr: 1 }} />
                          <Typography variant="h6">Stock Bajo</Typography>
                        </Box>
                        <Typography variant="h4" color="warning.main">
                          {stats.low_stock_items}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <InventoryIcon sx={{ color: 'error.main', mr: 1 }} />
                          <Typography variant="h6">Sin Stock</Typography>
                        </Box>
                        <Typography variant="h4" color="error.main">
                          {stats.out_of_stock_items}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Gráficos */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomPieChart
                        data={stats.value_by_category}
                        dataKey="value"
                        nameKey="category"
                        title="Valor por Categoría"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomBarChart
                        data={stats.stock_movements}
                        dataKey="incoming"
                        xAxisKey="date"
                        title="Movimientos de Stock - Entradas"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomAreaChart
                        data={stats.inventory_evolution}
                        dataKey="totalValue"
                        xAxisKey="month"
                        title="Evolución del Valor del Inventario"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                </Grid>

                {/* Tablas */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Productos Más Vendidos
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Producto</TableCell>
                              <TableCell align="right">Ventas</TableCell>
                              <TableCell align="right">Ingresos</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stats.top_selling_products.map((product, index) => (
                              <TableRow key={index}>
                                <TableCell>{product.product}</TableCell>
                                <TableCell align="right">{product.sales}</TableCell>
                                <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Productos con Stock Bajo
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Producto</TableCell>
                              <TableCell align="right">Stock</TableCell>
                              <TableCell align="right">Mínimo</TableCell>
                              <TableCell align="center">Estado</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stats.low_stock_products.map((product, index) => (
                              <TableRow key={index}>
                                <TableCell>{product.product}</TableCell>
                                <TableCell align="right">{product.current_stock}</TableCell>
                                <TableCell align="right">{product.min_stock}</TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={product.current_stock === 0 ? 'Sin Stock' : 'Stock Bajo'}
                                    color={product.current_stock === 0 ? 'error' : 'warning'}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
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
