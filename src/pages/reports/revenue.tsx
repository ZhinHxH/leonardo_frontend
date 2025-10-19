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
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip as MuiChip
} from '@mui/material';
import { 
  AttachMoney as AttachMoneyIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DateRangeFilter from '../../components/DateRangeFilter';
import { CustomLineChart, CustomBarChart, CustomPieChart } from '../../components/Charts';
import { revenueReportsService, RevenueFilters, type RevenueReport } from '../../services/revenueReports';

// Interfaces ya definidas en el servicio

export default function RevenueReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<RevenueReport | null>(null);
  
  // Filtros de fecha
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  
  // Filtros avanzados
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [membershipPlan, setMembershipPlan] = useState<string>('');
  
  // Opciones para filtros
  const [sellers, setSellers] = useState<Array<{ id: number; name: string }>>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<Array<{ id: number; name: string }>>([]);
  
  // Estado para la tabla de items vendidos
  const [soldItems, setSoldItems] = useState<any[]>([]);
  const [soldItemsPage, setSoldItemsPage] = useState(0);
  const [soldItemsPerPage, setSoldItemsPerPage] = useState(25);
  const [soldItemsTotal, setSoldItemsTotal] = useState(0);
  const [loadingSoldItems, setLoadingSoldItems] = useState(false);

  // Cargar opciones para filtros
  const loadFilterOptions = async () => {
    try {
      const [sellersData, paymentMethodsData, membershipPlansData] = await Promise.all([
        revenueReportsService.getAvailableSellers(),
        revenueReportsService.getAvailablePaymentMethods(),
        revenueReportsService.getAvailableMembershipPlans()
      ]);
      
      setSellers(sellersData);
      setPaymentMethods(paymentMethodsData);
      setMembershipPlans(membershipPlansData);
    } catch (err: any) {
      console.error('Error cargando opciones de filtros:', err);
    }
  };

  const loadRevenueStats = async () => {
    if (!startDate || !endDate) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Construir filtros
      const filters: RevenueFilters = {
        date_from: startDate.toISOString().split('T')[0],
        date_to: endDate.toISOString().split('T')[0],
        seller_id: sellerId || undefined,
        payment_method: paymentMethod || undefined,
        membership_plan: membershipPlan || undefined
      };
      
      // Obtener datos reales de la API
      const reportData = await revenueReportsService.getRevenueReport(filters);
      setReportData(reportData);
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar reporte de ingresos');
    } finally {
      setLoading(false);
    }
  };

  const loadSoldItems = async () => {
    if (!startDate || !endDate) return;
    
    try {
      setLoadingSoldItems(true);
      
      // Construir filtros
      const filters: RevenueFilters = {
        date_from: startDate.toISOString().split('T')[0],
        date_to: endDate.toISOString().split('T')[0],
        seller_id: sellerId || undefined,
        payment_method: paymentMethod || undefined,
        membership_plan: membershipPlan || undefined
      };
      
      // Obtener items vendidos
      const soldItemsData = await revenueReportsService.getSoldItems(
        filters, 
        soldItemsPage + 1, 
        soldItemsPerPage
      );
      
      setSoldItems(soldItemsData.items);
      setSoldItemsTotal(soldItemsData.total_items);
      
    } catch (err: any) {
      console.error('Error cargando items vendidos:', err);
    } finally {
      setLoadingSoldItems(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
    loadRevenueStats();
    loadSoldItems();
  }, [startDate, endDate, sellerId, paymentMethod, membershipPlan]);

  useEffect(() => {
    loadSoldItems();
  }, [soldItemsPage, soldItemsPerPage]);

  const handleApplyFilter = () => {
    loadRevenueStats();
    loadSoldItems();
  };

  const handleResetFilter = () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    setStartDate(thirtyDaysAgo);
    setEndDate(new Date());
    setSellerId(null);
    setPaymentMethod('');
    setMembershipPlan('');
  };

  // Manejadores de paginación para la tabla
  const handleSoldItemsPageChange = (event: unknown, newPage: number) => {
    setSoldItemsPage(newPage);
  };

  const handleSoldItemsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSoldItemsPerPage(parseInt(event.target.value, 10));
    setSoldItemsPage(0);
  };

  // Funciones de exportación
  const handleExportPDF = async () => {
    try {
      const filters: RevenueFilters = {
        date_from: startDate?.toISOString().split('T')[0],
        date_to: endDate?.toISOString().split('T')[0],
        seller_id: sellerId || undefined,
        payment_method: paymentMethod || undefined,
        membership_plan: membershipPlan || undefined
      };
      
      const blob = await revenueReportsService.exportToPDF(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-ingresos-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error al exportar PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const filters: RevenueFilters = {
        date_from: startDate?.toISOString().split('T')[0],
        date_to: endDate?.toISOString().split('T')[0],
        seller_id: sellerId || undefined,
        payment_method: paymentMethod || undefined,
        membership_plan: membershipPlan || undefined
      };
      
      const blob = await revenueReportsService.exportToExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-ingresos-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error al exportar Excel');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <ProtectedRoute requiredRole="admin">
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

            {/* Filtros avanzados */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                🔍 Filtros Avanzados
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Vendedor</InputLabel>
                    <Select
                      value={sellerId || ''}
                      onChange={(e) => setSellerId(e.target.value as number || null)}
                      label="Vendedor"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {sellers.map((seller) => (
                        <MenuItem key={seller.id} value={seller.id}>
                          {seller.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Método de Pago</InputLabel>
                    <Select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      label="Método de Pago"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {paymentMethods.map((method) => (
                        <MenuItem key={method} value={method}>
                          {method}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Plan de Membresía</InputLabel>
                    <Select
                      value={membershipPlan}
                      onChange={(e) => setMembershipPlan(e.target.value)}
                      label="Plan de Membresía"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {membershipPlans.map((plan) => (
                        <MenuItem key={plan.id} value={plan.name}>
                          {plan.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <ButtonGroup>
                    <Tooltip title="Actualizar datos">
                      <IconButton onClick={loadRevenueStats} disabled={loading}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Exportar PDF">
                      <IconButton onClick={handleExportPDF} disabled={loading}>
                        <PdfIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Exportar Excel">
                      <IconButton onClick={handleExportExcel} disabled={loading}>
                        <ExcelIcon />
                      </IconButton>
                    </Tooltip>
                  </ButtonGroup>
                </Grid>
              </Grid>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : reportData && (
              <>
                {/* Resumen estadístico */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="h6" color="text.secondary">
                              Total Ingresos
                            </Typography>
                            <Typography variant="h4" color="primary">
                              {formatCurrency(reportData.summary.total_revenue)}
                            </Typography>
                          </Box>
                          <AttachMoneyIcon sx={{ color: 'primary.main', fontSize: 40 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="h6" color="text.secondary">
                              Promedio Diario
                            </Typography>
                            <Typography variant="h4" color="success.main">
                              {formatCurrency(reportData.summary.daily_average)}
                            </Typography>
                          </Box>
                          <TrendingUpIcon sx={{ color: 'success.main', fontSize: 40 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="h6" color="text.secondary">
                              Transacciones
                            </Typography>
                            <Typography variant="h4" color="info.main">
                              {reportData.summary.total_transactions}
                            </Typography>
                          </Box>
                          <AttachMoneyIcon sx={{ color: 'info.main', fontSize: 40 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="h6" color="text.secondary">
                              Ticket Promedio
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                              {formatCurrency(reportData.summary.average_ticket)}
                            </Typography>
                          </Box>
                          {reportData.summary.growth_percentage >= 0 ? (
                            <TrendingUpIcon sx={{ color: 'success.main', fontSize: 40 }} />
                          ) : (
                            <TrendingDownIcon sx={{ color: 'error.main', fontSize: 40 }} />
                          )}
                        </Box>
                        <Chip 
                          label={`${reportData.summary.growth_percentage >= 0 ? '+' : ''}${reportData.summary.growth_percentage.toFixed(1)}%`}
                          color={reportData.summary.growth_percentage >= 0 ? 'success' : 'error'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Gráficos */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomBarChart
                        data={reportData.revenue_by_plan}
                        dataKey="total_revenue"
                        xAxisKey="plan_name"
                        title="Ingresos por Plan de Membresía"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomPieChart
                        data={reportData.payment_methods}
                        dataKey="total_amount"
                        nameKey="method"
                        title="Distribución por Método de Pago"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <CustomLineChart
                        data={reportData.daily_trend}
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
                        data={reportData.top_products}
                        dataKey="revenue"
                        xAxisKey="product_name"
                        title="Productos Más Vendidos"
                        height={300}
                      />
                    </Paper>
                  </Grid>
                </Grid>

                {/* Tabla de Items Vendidos */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" gutterBottom>
                          📋 Items Vendidos Detallados
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total: {soldItemsTotal} items
                        </Typography>
                      </Box>
                      
                      {loadingSoldItems ? (
                        <Box display="flex" justifyContent="center" p={4}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <>
                          <TableContainer>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell><strong>Tipo</strong></TableCell>
                                  <TableCell><strong>N° Venta</strong></TableCell>
                                  <TableCell><strong>Nombre</strong></TableCell>
                                  <TableCell><strong>SKU</strong></TableCell>
                                  <TableCell align="center"><strong>Cantidad</strong></TableCell>
                                  <TableCell align="right"><strong>Precio Unit.</strong></TableCell>
                                  <TableCell align="center"><strong>Descuento</strong></TableCell>
                                  <TableCell align="right"><strong>Total</strong></TableCell>
                                  <TableCell><strong>Fecha</strong></TableCell>
                                  <TableCell><strong>Duración</strong></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {soldItems.map((item, index) => (
                                  <TableRow key={index} hover>
                                    <TableCell>
                                      <MuiChip 
                                        label={item.type === 'product' ? 'Producto' : 'Membresía'}
                                        color={item.type === 'product' ? 'primary' : 'secondary'}
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" fontWeight="bold" color="primary">
                                        {item.sale_number}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" fontWeight="medium">
                                        {item.name}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" color="text.secondary">
                                        {item.sku || '-'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography variant="body2">
                                        {item.quantity}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography variant="body2" fontWeight="medium">
                                        {formatCurrency(item.unit_price)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      {item.discount_percentage > 0 ? (
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                          <MuiChip 
                                            label={`${item.discount_percentage}%`}
                                            color="warning"
                                            size="small"
                                          />
                                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                            Descuento
                                          </Typography>
                                        </Box>
                                      ) : (
                                        <Typography variant="body2" color="text.secondary">
                                          Sin descuento
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography variant="body2" fontWeight="bold" color="primary">
                                        {formatCurrency(item.total_price)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" color="text.secondary">
                                        {new Date(item.date).toLocaleDateString('es-CO')}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {new Date(item.date).toLocaleTimeString('es-CO', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      {item.type === 'membership' && item.duration_days ? (
                                        <Box>
                                          <Typography variant="body2" color="text.secondary">
                                            {item.duration_days} días
                                          </Typography>
                                          {item.start_date && item.end_date && (
                                            <Typography variant="caption" color="text.secondary">
                                              {item.start_date} - {item.end_date}
                                            </Typography>
                                          )}
                                        </Box>
                                      ) : (
                                        <Typography variant="body2" color="text.secondary">
                                          -
                                        </Typography>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          
                          <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={soldItemsTotal}
                            rowsPerPage={soldItemsPerPage}
                            page={soldItemsPage}
                            onPageChange={handleSoldItemsPageChange}
                            onRowsPerPageChange={handleSoldItemsPerPageChange}
                            labelRowsPerPage="Items por página:"
                            labelDisplayedRows={({ from, to, count }) => 
                              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                            }
                          />
                        </>
                      )}
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
