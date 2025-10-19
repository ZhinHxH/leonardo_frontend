import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Toolbar,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Alert,
  Divider,
  InputAdornment,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Avatar,
  Badge,
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  ShoppingCart,
  Add,
  Remove,
  Delete,
  Payment,
  Receipt,
  Person,
  Search,
  Clear,
  AttachMoney,
  CreditCard,
  AccountBalance,
  FitnessCenter,
  Inventory,
  X
} from '@mui/icons-material';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import inventoryService, { Product } from '../../services/inventory';
import membershipPlansService, { MembershipPlan } from '../../services/membership-plans';
import salesService from '../../services/sales';
import { getClients } from '../../services/clients';
import { parse } from 'path';

interface CartItem {
  id: string;
  type: 'product' | 'membership';
  product_id?: number;
  plan_id?: number;
  name: string;
  price: number;
  quantity: number;
  stock?: number;
  unit_of_measure?: string;
  discount?: number;
  customer_id?: number; // Para membresías
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  dni?: string;
}

// Los clientes se cargarán desde el backend

export default function POSSystem() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  //Discount consts
  // Agrega estos estados en tu componente
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: Productos, 1: Membresías
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados de pago
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState(0);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Cargando datos iniciales del POS...');
      
      // Cargar productos disponibles
      console.log('📦 Cargando productos...');
      const productsResult = await inventoryService.getProducts({
        status: 'active',
        include_costs: false
      });
      const availableProducts = productsResult.products.filter(p => p.current_stock > 0);
      setProducts(availableProducts);
      console.log('✅ Productos cargados:', availableProducts.length);

      // Cargar planes de membresía
      console.log('💳 Cargando planes de membresía...');
      const plansData = await membershipPlansService.getActivePlansForSale();
      setPlans(plansData);
      console.log('✅ Planes cargados:', plansData.length);

      // Cargar clientes
      console.log('👥 Cargando clientes...');
      const customersResult = await getClients({ search: '', page: 1, limit: 100 });
      const clientsList = customersResult.users || customersResult.items || customersResult || [];
      const members = clientsList.filter((c: any) => c.role === 'member');
      setCustomers(members);
      console.log('✅ Clientes cargados:', members.length);
      
    } catch (err: any) {
      console.error('❌ Error cargando datos:', err);
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  // Funciones del carrito
  const addToCart = (item: Product | MembershipPlan, type: 'product' | 'membership', customerId?: number) => {
    const cartId = `${type}-${item.id}${customerId ? `-${customerId}` : ''}`;
    
    const existingItem = cart.find(cartItem => cartItem.id === cartId);
    
    if (existingItem && type === 'product') {
      // Incrementar cantidad para productos
      updateCartItemQuantity(cartId, existingItem.quantity + 1);
    } else {
      // Agregar nuevo item
      const newItem: CartItem = {
        id: cartId,
        type,
        product_id: type === 'product' ? item.id : undefined,
        plan_id: type === 'membership' ? item.id : undefined,
        name: item.name,
        price: type === 'product' ? (item as Product).selling_price : (item as MembershipPlan).discount_price || (item as MembershipPlan).price,
        quantity: 1,
        stock: type === 'product' ? (item as Product).current_stock : undefined,
        unit_of_measure: type === 'product' ? (item as Product).unit_of_measure : undefined,
        customer_id: customerId
      };
      
      setCart([...cart, newItem]);
    }
  };

  const updateCartItemQuantity = (cartId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === cartId 
        ? { ...item, quantity: Math.min(newQuantity, item.stock || 999) }
        : item
    ));
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.id !== cartId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  // Cálculos
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = 0
  const total = subtotal + tax;
  const change = amountPaid - total + discountAmount;

  const handlePayment = () => {
    setAmountPaid(total); // Pre-llenar con el total exacto
    setPaymentDialog(true);
  };

  const processSale = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    
    try {
      // Preparar datos de la venta
      const products = cart.filter(item => item.type === 'product').map(item => ({
        product_id: item.product_id!,
        quantity: item.quantity,
        unit_price: item.price,
        discount_percentage: item.discount || 0
      }));

      const memberships = cart.filter(item => item.type === 'membership').map(item => ({
        plan_id: item.plan_id!,
        customer_id: item.customer_id!,
        payment_method: paymentMethod
      }));

      // Determinar tipo de venta
      let saleType = 'product';
      if (products.length > 0 && memberships.length > 0) {
        saleType = 'mixed';
      } else if (memberships.length > 0) {
        saleType = 'membership';
      }

      console.log("Aplicar descuento: ", applyDiscount)

      // Crear venta
      const saleData = {
        customer_id: selectedCustomer?.id,
        sale_type: saleType,
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        notes: '',
        products: products.length > 0 ? products : undefined,
        memberships: memberships.length > 0 ? memberships : undefined,
        is_discount: applyDiscount,
        discount_amount: discountAmount,
        discount_reason: discountReason
      };

      const result = await salesService.createSale(saleData);
      
      // Limpiar carrito después de venta exitosa
      clearCart();
      setPaymentDialog(false);
      setAmountPaid(0);
      
      alert(`¡Venta procesada exitosamente!\nNúmero de venta: ${result.sale_number}`);
      
      // Recargar productos para actualizar stock
      loadInitialData();
      
    } catch (err: any) {
      setError(err.message || 'Error procesando venta');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminRoute allowedRoles={['admin', 'manager', 'receptionist']}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={2}>
            <Grid container spacing={2} sx={{ height: 'calc(100vh - 140px)' }}>
              {/* Panel izquierdo - Productos/Membresías */}
              <Grid item xs={12} md={8}>
                <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                    <Typography variant="h5" fontWeight="bold">
                      🛒 Punto de Venta
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="Buscar productos o membresías..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                      sx={{ width: 300 }}
                    />
                  </Box>

                  <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                    <Tab label="Productos" icon={<Inventory />} />
                    <Tab label="Membresías" icon={<FitnessCenter />} />
                  </Tabs>

                  <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {activeTab === 0 && (
                      <Grid container spacing={1}>
                        {filteredProducts.map((product) => (
                          <Grid item xs={6} sm={4} md={3} key={product.id}>
                            <Card 
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { boxShadow: 3 },
                                opacity: product.current_stock === 0 ? 0.5 : 1
                              }}
                              onClick={() => product.current_stock > 0 && addToCart(product, 'product')}
                            >
                              <CardContent sx={{ p: 1.5 }}>
                                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                  {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {product.category}
                                </Typography>
                                <Box display="flex" justifyContent="between" alignItems="center" mt={1}>
                                  <Typography variant="h6" color="primary" fontWeight="bold">
                                    ${product.selling_price.toLocaleString()}
                                  </Typography>
                                  <Chip 
                                    label={`${product.current_stock} ${product.unit_of_measure}`}
                                    size="small"
                                    color={product.current_stock < 5 ? "warning" : "success"}
                                  />
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}

                    {activeTab === 1 && (
                      <Grid container spacing={2}>
                      {filteredPlans.map((plan) => (
                        <Grid item xs={12} sm={6} md={4} key={plan.id} sx={{ display: 'flex' }}>
                          <Card 
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { boxShadow: 3 },
                              border: plan.is_popular ? '2px solid gold' : '1px solid #e0e0e0',
                              display: 'flex',
                              flexDirection: 'column',
                              width: '100%', // Ocupar todo el ancho del Grid item
                              height: '100%', // Ocupar toda la altura disponible
                            }}
                            onClick={() => {
                              if (selectedCustomer) {
                                addToCart(plan, 'membership', selectedCustomer.id);
                              } else {
                                alert('Selecciona un cliente para agregar membresía');
                              }
                            }}
                          >
                            <CardContent sx={{ 
                              flexGrow: 1, // Hacer que el contenido ocupe todo el espacio disponible
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%'
                            }}>
                              {plan.is_popular && (
                                <Chip label="⭐ Popular" color="warning" size="small" sx={{ mb: 1 }} />
                              )}
                              <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {plan.name}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  flexGrow: 1, // Hacer que la descripción ocupe el espacio sobrante
                                  mb: 2 
                                }}
                              >
                                {plan.description}
                              </Typography>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="h5" color="primary" fontWeight="bold">
                                  ${plan.price.toLocaleString()}
                                </Typography>
                                <Typography variant="caption">
                                  {plan.duration_days} días
                                </Typography>
                              </Box>
                              <Box sx={{ mt: 'auto' }}> {/* Empujar hacia abajo */}
                                {plan.includes_nutritionist && (
                                  <Chip label="Nutricionista" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                )}
                                {plan.includes_classes && (
                                  <Chip label="Clases" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Panel derecho - Carrito y Pago */}
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Cliente seleccionado */}
                  <Box mb={2}>
                    <Typography variant="h6" mb={1}>👤 Cliente</Typography>
                    <Autocomplete
                      size="small"
                      options={customers}
                      getOptionLabel={(customer) => `${customer.name} - ${customer.dni}`}
                      value={selectedCustomer}
                      onChange={(_, newValue) => setSelectedCustomer(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Seleccionar cliente..."
                          variant="outlined"
                        />
                      )}
                      renderOption={(props, customer) => (
                        <Box component="li" {...props}>
                          <Avatar sx={{ mr: 2 }}>{customer.name.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="body2">{customer.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {customer.dni} | {customer.phone}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                  </Box>

                  {/* Carrito */}
                  <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                      <Typography variant="h6">🛒 Carrito</Typography>
                      <Badge badgeContent={cart.length} color="primary">
                        <ShoppingCart />
                      </Badge>
                    </Box>

                    {cart.length === 0 ? (
                      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                        <ShoppingCart sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
                        <Typography color="text.secondary">
                          Carrito vacío
                        </Typography>
                      </Box>
                    ) : (
                      <List dense>
                        {cart.map((item) => (
                          <ListItem
                            key={item.id}
                            sx={{ 
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                              mb: 1,
                              bgcolor: item.type === 'membership' ? '#f3e5f5' : '#e8f5e8'
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  {item.type === 'membership' ? <FitnessCenter fontSize="small" /> : <Inventory fontSize="small" />}
                                  <Typography variant="body2" fontWeight="bold">
                                    {item.name}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2">
                                    ${item.price.toLocaleString()} × {item.quantity}
                                  </Typography>
                                  {item.stock !== undefined && (
                                    <Typography variant="caption" color="text.secondary">
                                      Stock: {item.stock} {item.unit_of_measure}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                            
                            {item.type === 'product' && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                >
                                  <Remove />
                                </IconButton>
                                <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                                  {item.quantity}
                                </Typography>
                                <IconButton 
                                  size="small" 
                                  onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= (item.stock || 0)}
                                >
                                  <Add />
                                </IconButton>
                              </Box>
                            )}
                            
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Delete />
                            </IconButton>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>

                  {/* Totales */}
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Box display="flex" justifyContent="between" mb={1}>
                      <Typography>Subtotal:</Typography>
                      <Typography>${subtotal.toLocaleString()}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="between" mb={2}>
                      <Typography variant="h6" fontWeight="bold">Total:</Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        ${total.toLocaleString()}
                      </Typography>
                    </Box>

                    {/* Botones de acción */}
                    <Box display="flex" gap={1}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Clear />}
                        onClick={clearCart}
                        disabled={cart.length === 0}
                      >
                        Limpiar
                      </Button>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Payment />}
                        onClick={handlePayment}
                        disabled={cart.length === 0}
                        size="large"
                      >
                        Pagar
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Dialog de pago */}
      <Dialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>💳 Procesar Pago</DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="h4" color="primary" fontWeight="bold" textAlign="center">
              Total: ${(total - discountAmount).toLocaleString()}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" mb={1}>Método de Pago:</Typography>
              <Grid container spacing={1}>
                {[
                  { value: 'cash', label: 'Efectivo', icon: <AttachMoney /> },
                  { value: 'nequi', label: 'Nequi', icon: <CreditCard /> },
                  { value: 'bancolombia', label: 'Bancolombia', icon: <AccountBalance /> },
                  { value: 'card', label: 'Tarjeta', icon: <CreditCard /> }
                ].map((method) => (
                  <Grid item xs={6} key={method.value}>
                    <Button
                      variant={paymentMethod === method.value ? "contained" : "outlined"}
                      fullWidth
                      startIcon={method.icon}
                      onClick={() => setPaymentMethod(method.value)}
                    >
                      {method.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Grid>
              {/* Campo de monto pagado existente */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Monto Pagado"
                  type="number"
                  value={amountPaid.toString()}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  error={amountPaid < (total - discountAmount)}
                  helperText={amountPaid < (total - discountAmount) ? "Monto insuficiente" : change > 0 ? `Cambio: $${change.toLocaleString()}` : ""}
                />
              </Grid>

                {/* Nuevo grid para descuento */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={applyDiscount}
                                onChange={(e) => {
                                  setApplyDiscount(e.target.checked);
                                  if (!e.target.checked) {
                                    setDiscountAmount(0);
                                    setDiscountReason('');
                                  }
                                }}
                              />
                            }
                            label="Aplicar Descuento"
                          />
                        </Grid>

                        {applyDiscount && (
                          <>
                            <Grid item xs={12} md={0}>
                              <TextField
                                fullWidth
                                label="Monto del Descuento"
                                type="number"
                                value={discountAmount.toString()  }
                                onChange={(e) => {
                                  console.log("Value change: ", e.target.value)
                                  console.log("type_off: ", typeof(e.target.value))
                                  const discount = Number(e.target.value);

                                  setDiscountAmount(discount);
                                  // Validar que el descuento no sea mayor al total
                                  if (discount > total) {
                                    setError('El descuento no puede ser mayor al total');
                                  } else if (discount < 0) {
                                    setError('El descuento no puede ser negativo');
                                  } else {
                                    setError('');
                                  }
                                }}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                error={discountAmount > total || discountAmount < 0}
                                helperText={
                                  discountAmount > total 
                                    ? "El descuento excede el total" 
                                    : discountAmount < 0
                                    ? "El descuento no puede ser negativo"
                                    : `Nuevo total: $${(total - discountAmount).toLocaleString()}`
                                }
                              />
                            </Grid>
                            <Grid item xs={12} md={0}>
                              <TextField
                                fullWidth
                                label="Razón del Descuento"
                                value={discountReason}
                                onChange={(e) => setDiscountReason(e.target.value)}
                                placeholder="Ej: Promoción especial, cliente frecuente, etc."
                                helperText="Obligatorio para aplicar descuento"
                              />
                            </Grid>
                            {discountAmount > 0 && (
                              <Grid item xs={0}>
                                <Alert 
                                  severity="info" 
                                  sx={{ mt: 1 }}
                                  action={
                                    <Button 
                                      color="inherit" 
                                      size="small"
                                      onClick={() => {
                                        setApplyDiscount(false);
                                        setDiscountAmount(0);
                                        setDiscountReason('');
                                      }}
                                    >
                                      Quitar
                                    </Button>
                                  }
                                >
                                  <Typography variant="body2">
                                    <strong>Descuento aplicado:</strong> ${discountAmount.toLocaleString()}
                                  </Typography>
                                  {discountReason && (
                                    <Typography variant="body2">
                                      <strong>Razón:</strong> {discountReason}
                                    </Typography>
                                  )}
                                  <Typography variant="body2">
                                    <strong>Total con descuento:</strong> ${(total - discountAmount).toLocaleString()}
                                  </Typography>
                                </Alert>
                              </Grid>
                            )}
                          </>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

            {selectedCustomer && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Cliente:</strong> {selectedCustomer.name} ({selectedCustomer.dni})
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={processSale} 
            variant="contained" 
            disabled={amountPaid < total || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Receipt />}
          >
            {loading ? 'Procesando...' : 'Confirmar Venta'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminRoute>
  );
}
