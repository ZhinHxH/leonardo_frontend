import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Toolbar,
  Tooltip,
  Divider
} from '@mui/material';
import {
  AccountBalance,
  Visibility,
  Download,
  Refresh,
  TrendingUp,
  Warning,
  CheckCircle,
  AttachMoney,
  Person,
  CalendarToday
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import DateRangeFilter from '../../components/DateRangeFilter';
import cashClosureService, { CashClosureResponse, CashClosureReport } from '../../services/cash-closure';

export default function CashClosuresReport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closures, setClosures] = useState<CashClosureResponse[]>([]);
  const [report, setReport] = useState<CashClosureReport | null>(null);
  const [selectedClosure, setSelectedClosure] = useState<CashClosureResponse | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Filtros de fecha
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const loadClosures = async () => {
    if (!startDate || !endDate) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await cashClosureService.getCashClosures({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        page: 1,
        per_page: 100
      });
      
      setClosures(result.cash_closures);
      
      // Cargar reporte
      const reportData = await cashClosureService.getCashClosureReport({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      
      setReport(reportData);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClosures();
  }, [startDate, endDate]);

  const handleViewClosure = (closure: CashClosureResponse) => {
    setSelectedClosure(closure);
    setDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedClosure(null);
  };

  const handleApplyFilter = () => {
    loadClosures();
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'pending': return <Warning />;
      case 'reviewed': return <TrendingUp />;
      case 'cancelled': return <Warning />;
      default: return <AccountBalance />;
    }
  };

  const canViewReports = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'MANAGER';

  if (!canViewReports) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'manager']}>
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
          <Sidebar />
          <Box sx={{ flexGrow: 1 }}>
            <Navbar />
            <Toolbar />
            <Box p={4}>
              <Alert severity="error">
                No tienes permisos para ver reportes de cierres de caja.
              </Alert>
            </Box>
          </Box>
        </Box>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={4}>
            <Typography variant="h4" gutterBottom>
              📊 Reportes de Cierres de Caja
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Historial y análisis de cierres de caja del sistema
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

            {/* Resumen del reporte */}
            {report && (
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <AccountBalance sx={{ color: 'primary.main', mr: 1 }} />
                        <Typography variant="h6">Total Cierres</Typography>
                      </Box>
                      <Typography variant="h4" color="primary">
                        {report.total_closures}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <AttachMoney sx={{ color: 'success.main', mr: 1 }} />
                        <Typography variant="h6">Total Ventas</Typography>
                      </Box>
                      <Typography variant="h4" color="success.main">
                        {formatCurrency(report.total_sales)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <TrendingUp sx={{ color: 'info.main', mr: 1 }} />
                        <Typography variant="h6">Total Contado</Typography>
                      </Box>
                      <Typography variant="h4" color="info.main">
                        {formatCurrency(report.total_counted)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <Warning sx={{ color: 'warning.main', mr: 1 }} />
                        <Typography variant="h6">Diferencias</Typography>
                      </Box>
                      <Typography variant="h4" color="warning.main">
                        {formatCurrency(report.total_differences)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Tabla de cierres */}
            <Paper elevation={2}>
              <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Historial de Cierres de Caja
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadClosures}
                  disabled={loading}
                >
                  Actualizar
                </Button>
              </Box>
              
              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Usuario</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Total Ventas</TableCell>
                        <TableCell>Total Contado</TableCell>
                        <TableCell>Diferencias</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {closures.map((closure) => (
                        <TableRow key={closure.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Person sx={{ mr: 1, color: 'text.secondary' }} />
                              {closure.user_name || `Usuario ${closure.user_id}`}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                              {formatDate(closure.created_at)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(closure.total_sales)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatCurrency(closure.total_counted)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={closure.has_discrepancies ? <Warning /> : <CheckCircle />}
                              label={formatCurrency(closure.total_differences)}
                              color={closure.has_discrepancies ? 'warning' : 'success'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(closure.status)}
                              label={closure.status}
                              color={getStatusColor(closure.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewClosure(closure)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            {/* Dialog de detalles */}
            <Dialog
              open={detailDialogOpen}
              onClose={handleCloseDetail}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>
                <Box display="flex" alignItems="center">
                  <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                  Detalles del Cierre de Caja
                </Box>
              </DialogTitle>
              
              <DialogContent>
                {selectedClosure && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Información General
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Usuario
                          </Typography>
                          <Typography variant="body1">
                            {selectedClosure.user_name || `Usuario ${selectedClosure.user_id}`}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Fecha
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(selectedClosure.created_at)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Estado
                          </Typography>
                          <Chip
                            icon={getStatusIcon(selectedClosure.status)}
                            label={selectedClosure.status}
                            color={getStatusColor(selectedClosure.status)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Diferencias
                          </Typography>
                          <Chip
                            icon={selectedClosure.has_discrepancies ? <Warning /> : <CheckCircle />}
                            label={selectedClosure.has_discrepancies ? 'Sí' : 'No'}
                            color={selectedClosure.has_discrepancies ? 'warning' : 'success'}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Resumen de Ventas
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total Ventas
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {formatCurrency(selectedClosure.total_sales)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total Contado
                          </Typography>
                          <Typography variant="h6" color="info.main">
                            {formatCurrency(selectedClosure.total_counted)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Productos Vendidos
                          </Typography>
                          <Typography variant="body1">
                            {selectedClosure.total_products_sold}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Membresías Vendidas
                          </Typography>
                          <Typography variant="body1">
                            {selectedClosure.total_memberships_sold}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    {selectedClosure.discrepancies_notes && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom color="warning.main">
                          Notas sobre Diferencias
                        </Typography>
                        <Alert severity="warning">
                          {selectedClosure.discrepancies_notes}
                        </Alert>
                      </Grid>
                    )}

                    {selectedClosure.notes && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Notas del Cierre
                        </Typography>
                        <Typography variant="body1">
                          {selectedClosure.notes}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                )}
              </DialogContent>
              
              <DialogActions>
                <Button onClick={handleCloseDetail}>
                  Cerrar
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
