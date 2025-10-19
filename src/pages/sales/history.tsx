import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Tooltip,
  TablePagination,
  CircularProgress
} from '@mui/material';
import {
  Receipt,
  Visibility,
  Undo,
  Search,
  FilterList,
  Download,
  ShoppingCart,
  FitnessCenter,
  Person,
  AttachMoney,
  Warning
} from '@mui/icons-material';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import salesService from '../../services/sales';
import CashClosure from '../../components/CashClosure';
import { SaleDetail } from '../../services/sales';

interface Sale {
  id: number;
  sale_number: string;
  customer_id?: number;
  customer_name?: string;
  seller_id: number;
  seller_name: string;
  sale_type: 'product' | 'membership' | 'mixed';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  amount_paid: number;
  change_amount: number;
  is_reversed: boolean;
  can_be_reversed: boolean;
  created_at: string;
  notes?: string;
  product_items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
  membership_items: Array<{
    id: number;
    plan_name: string;
    plan_price: number;
    duration_days: number;
  }>;
}

export default function SalesHistory() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados de modales
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; sale: SaleDetail | null }>({
    open: false,
    sale: null
  });
  
  const [reverseDialog, setReverseDialog] = useState<{ open: boolean; sale: Sale | null }>({
    open: false,
    sale: null
  });

  const [reverseReason, setReverseReason] = useState('');

  // Estados para cierre de caja
  const [cashClosureOpen, setCashClosureOpen] = useState(false);
  const [shiftStart, setShiftStart] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString();
  });

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalSales, setTotalSales] = useState(0);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar ventas cuando cambien los filtros o la paginación
  useEffect(() => {
    loadSales();
  }, [page, rowsPerPage, statusFilter, debouncedSearchTerm]);

  // Cargar ventas desde el backend
  const loadSales = async () => {
    setLoading(true);
    setError('');
    
    try {
      const currentPage = page + 1; // Convertir a base 1 para el backend
      
      const response = await salesService.getSales({
        page: currentPage,
        per_page: rowsPerPage,
        status: statusFilter !== 'Todos' ? statusFilter : undefined,
        search: debouncedSearchTerm || undefined
      });
      
      setSales(response.sales as Sale[] || []);
      setTotalSales(response.total || 0);
      
    } catch (err: any) {
      setError(err.message || 'Error cargando ventas');
      setSales([]);
      setTotalSales(0);
    } finally {
      setLoading(false);
    }
  };

  // Handlers de paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Resetear a la primera página
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'refunded': return 'Reembolsada';
      default: return status;
    }
  };

  const getSaleTypeLabel = (type: string) => {
    switch (type) {
      case 'product': return 'Productos';
      case 'membership': return 'Membresía';
      case 'mixed': return 'Mixta';
      default: return type;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'nequi': return 'Nequi';
      case 'bancolombia': return 'Bancolombia';
      case 'daviplata': return 'Daviplata';
      case 'card': return 'Tarjeta';
      default: return method;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewSale = async (sale: Sale) => {
    setLoading(true);
    try {
      // Obtener detalles completos de la venta
      const saleDetails = await salesService.getSaleDetails(sale.id);
      console.log("Sale Details: ", saleDetails);
      const detailDialogg = { open: true, sale: saleDetails as unknown as SaleDetail | null };
      console.log("detailDialogg: ", detailDialogg);
      console.log("type of detailDialogg: ", typeof detailDialogg);
      setDetailDialog(detailDialogg);
    } catch (err: any) {
      setError(err.message || 'Error obteniendo detalles de la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleReverseSale = (sale: Sale) => {
    setReverseReason('');
    setReverseDialog({ open: true, sale });
  };

  const confirmReverse = async () => {
    if (!reverseDialog.sale || !reverseReason.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await salesService.reverseSale(reverseDialog.sale.id, reverseReason);
      
      setReverseDialog({ open: false, sale: null });
      setReverseReason('');
      
      // Recargar ventas para mostrar el estado actualizado
      loadSales();
      
      alert('Venta reversada exitosamente');
      
    } catch (err: any) {
      setError(err.message || 'Error reversando venta');
    } finally {
      setLoading(false);
    }
  };

  const canReverseSales = user?.role === 'admin' || user?.role === 'manager';
  const canCreateCashClosure = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'receptionist';

  const handleCashClosure = () => {
    // Establecer el inicio del turno como el inicio del día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setShiftStart(today.toISOString());
    setCashClosureOpen(true);
  };

  const handleCashClosureSuccess = () => {
    // Recargar ventas después del cierre exitoso
    loadSales();
  };

  return (
    <AdminRoute allowedRoles={['admin', 'manager', 'receptionist']}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                  <Receipt sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h4" component="h1">
                    Historial de Ventas
                  </Typography>
                </Box>
                <Box display="flex" gap={2}>
                  <Button variant="outlined" startIcon={<Download />}>
                    Exportar
                  </Button>
                  {canCreateCashClosure && (
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      startIcon={<AttachMoney />}
                      onClick={handleCashClosure}
                    >
                      Cierre de Caja
                    </Button>
                  )}
                  <Button variant="contained" startIcon={<ShoppingCart />} href="/sales/pos">
                    Nueva Venta
                  </Button>
                </Box>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* Filtros */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        placeholder="Buscar por número, cliente o vendedor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        select
                        fullWidth
                        label="Estado"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        SelectProps={{ native: true }}
                      >
                        <option value="Todos">Todos los estados</option>
                        <option value="completed">Completadas</option>
                        <option value="pending">Pendientes</option>
                        <option value="refunded">Reembolsadas</option>
                        <option value="cancelled">Canceladas</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" color="text.secondary">
                        {totalSales} ventas encontradas
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Tabla de ventas */}
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Venta</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Pago</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                            <CircularProgress />
                            <Typography color="text.secondary">Cargando ventas...</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : sales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No se encontraron ventas
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sales.map((sale) => (
                        <TableRow key={sale.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {sale.sale_number}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Vendedor: {sale.seller_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {sale.customer_name ? (
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{ width: 24, height: 24 }}>
                                  {sale.customer_name.charAt(0)}
                                </Avatar>
                                <Typography variant="body2">
                                  {sale.customer_name}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Cliente General
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getSaleTypeLabel(sale.sale_type)}
                              size="small"
                              icon={sale.sale_type === 'membership' ? <FitnessCenter /> : <ShoppingCart />}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" fontWeight="bold">
                              {formatPrice(sale.total_amount)}
                            </Typography>
                            {sale.discount_amount > 0 && (
                              <Typography variant="caption" color="success.main">
                                Desc: {formatPrice(sale.discount_amount)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {getPaymentMethodLabel(sale.payment_method)}
                            </Typography>
                            {sale.change_amount > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                Cambio: {formatPrice(sale.change_amount)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(sale.status)}
                              color={getStatusColor(sale.status) as any}
                              size="small"
                            />
                            {sale.is_reversed && (
                              <Chip label="Reversada" color="warning" size="small" sx={{ ml: 0.5 }} />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(sale.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={0.5}>
                              <Tooltip title="Ver detalles">
                                <IconButton size="small" color="info" onClick={() => handleViewSale(sale)}>
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              {canReverseSales && sale.can_be_reversed && !sale.is_reversed && (
                                <Tooltip title="Reversar venta">
                                  <IconButton size="small" color="warning" onClick={() => handleReverseSale(sale)}>
                                    <Undo />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Paginador de MUI */}
                <TablePagination
                  rowsPerPageOptions={[5, 10, 20, 50, 100]}
                  component="div"
                  count={totalSales}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Ventas por página:"
                  labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                  }
                />
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Dialog de detalles de venta */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, sale: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              📋 Detalle de Venta {detailDialog.sale?.['sale']?.['sale_number']}
            </Typography>
            <Chip
              label={getStatusLabel(detailDialog.sale?.['sale']?.['status'] || '')}
              color={getStatusColor(detailDialog.sale?.['sale']?.['status'] || '') as any}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailDialog.sale && (
            <Box>
              {/* Información general */}
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Cliente</Typography>
                  <Typography variant="body1">
                    {detailDialog.sale?.['sale']?.['customer_name'] || 'Cliente General'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Vendedor</Typography>
                  <Typography variant="body1">
                    {detailDialog.sale?.['sale']?.['seller_name']}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Fecha</Typography>
                  <Typography variant="body1">
                    {formatDate(detailDialog?.sale?.['sale']?.['created_at']?.toString() || '')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Método de Pago</Typography>
                  <Typography variant="body1">
                    {getPaymentMethodLabel(detailDialog.sale?.['sale']?.['payment_method'] || '')}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* Items de productos */}
              {detailDialog.sale?.['sale']?.['product_items'] && detailDialog.sale?.['sale']?.['product_items']?.length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    🛍️ Productos
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Producto</TableCell>
                          <TableCell align="right">Cantidad</TableCell>
                          <TableCell align="right">Precio Unit.</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailDialog.sale?.['sale']?.['product_items']?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{formatPrice(item.unit_price)}</TableCell>
                            <TableCell align="right">{formatPrice(item.line_total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Items de membresías */}
              {detailDialog.sale?.['sale']?.['membership_items'] && detailDialog.sale?.['sale']?.['membership_items']?.length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    🏋️ Membresías
                  </Typography>
                  <List>
                    {detailDialog.sale?.['sale']?.['membership_items']?.map((item) => (
                      <ListItem key={item.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                        <ListItemText
                          primary={item.plan_name}
                          secondary={`${item.duration_days} días - ${formatPrice(item.plan_price)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Totales */}
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography>Subtotal:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">{formatPrice(detailDialog.sale?.['sale']?.['subtotal'] || 0)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>IVA (19%):</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">{formatPrice(detailDialog.sale?.['sale']?.['tax_amount'] || 0)}</Typography>
                    </Grid>
                    {detailDialog.sale?.['sale']?.['discount_amount'] > 0 && (
                      <>
                        <Grid item xs={6}>
                          <Typography color="success.main">Descuento:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography align="right" color="success.main">
                            -{formatPrice(detailDialog.sale?.['sale']?.['discount_amount'] || 0)}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" fontWeight="bold">Total:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6" fontWeight="bold" align="right">
                        {formatPrice(detailDialog.sale?.['sale']?.['total_amount'] || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>Pagado:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">{formatPrice(detailDialog.sale?.['sale']?.['amount_paid'] || 0)}</Typography>
                    </Grid>
                    {detailDialog.sale?.['sale']?.['change_amount'] > 0 && (
                      <>
                        <Grid item xs={6}>
                          <Typography>Cambio:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography align="right">{formatPrice(detailDialog.sale?.['sale']?.['change_amount'] || 0)}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, sale: null })}>
            Cerrar
          </Button>
          {canReverseSales && detailDialog.sale?.['sale']?.['can_be_reversed'] && !detailDialog.sale?.['sale']?.['is_reversed'] && (
            <Button 
              color="warning" 
              variant="contained"
              startIcon={<Undo />}
              onClick={() => {
                setDetailDialog({ open: false, sale: null as unknown as SaleDetail | null });
                if (detailDialog.sale?.['sale']) {
                  handleReverseSale(detailDialog.sale?.['sale'] as unknown as Sale);
                }
              }}
            >
              Reversar Venta
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog de reversión */}
      <Dialog
        open={reverseDialog.open}
        onClose={() => setReverseDialog({ open: false, sale: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Warning color="warning" />
            <Typography variant="h6">
              Reversar Venta {reverseDialog.sale?.['sale']?.['sale_number']}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" mb={1}>
              <strong>Esta acción:</strong>
            </Typography>
            <Typography variant="body2" component="div">
              • Reabastecerá el stock de productos vendidos<br/>
              • Cancelará las membresías creadas<br/>
              • Marcará la venta como reembolsada<br/>
              • No se puede deshacer
            </Typography>
          </Alert>

          {reverseDialog.sale && (
            <Box mb={3}>
              <Typography variant="subtitle2" mb={1}>Detalles de la venta:</Typography>
              <Typography variant="body2">
                Total: <strong>{formatPrice(reverseDialog.sale?.['sale']?.['total_amount'] || 0)}</strong>
              </Typography>
              <Typography variant="body2">
                Productos: {reverseDialog.sale?.['sale']?.['product_items']?.length || 0}
              </Typography>
              <Typography variant="body2">
                Membresías: {reverseDialog.sale?.['sale']?.['membership_items']?.length || 0}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label="Razón de la reversión *"
            multiline
            rows={3}
            value={reverseReason}
            onChange={(e) => setReverseReason(e.target.value)}
            placeholder="Describe el motivo de la reversión..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReverseDialog({ open: false, sale: null })}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmReverse}
            color="warning"
            variant="contained"
            disabled={!reverseReason.trim() || loading}
            startIcon={<Undo />}
          >
            {loading ? 'Procesando...' : 'Confirmar Reversión'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Componente de Cierre de Caja */}
      <CashClosure
        isOpen={cashClosureOpen}
        onClose={() => setCashClosureOpen(false)}
        onSuccess={handleCashClosureSuccess}
        shiftStart={shiftStart}
      />
    </AdminRoute>
  );
}