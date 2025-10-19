import { useState, useEffect } from 'react';
import { useStockMonitoring } from '../../hooks/useStockMonitoring';
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Alert,
  Divider,
  InputAdornment,
  Switch,
  FormControlLabel,
  Avatar,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  CircularProgress,
  TablePagination // Importar TablePagination de MUI
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Add,
  Edit,
  Delete,
  Search,
  Download,
  Category as CategoryIcon,
  History as HistoryIcon,
  TrendingUp,
  TrendingDown,
  Warning,
  Visibility,
  VisibilityOff,
  AttachMoney,
  ShoppingCart,
  LocalOffer,
  Palette,
  Label,
  Save,
  Cancel
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import inventoryService, { Product, Category, InventorySummary, CostHistory } from '../../services/inventory';
import { useDebounce } from '../../hooks/useDebounce';

// Interfaces importadas desde el servicio

// Los datos ahora se cargan desde el backend

const colorOptions = [
  '#4CAF50', '#FF9800', '#E91E63', '#2196F3', '#9C27B0', 
  '#F44336', '#00BCD4', '#8BC34A', '#FFC107', '#795548'
];

export default function Inventory() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Configurar monitoreo de stock (solo manual, no automático)
  const { manualCheck } = useStockMonitoring({
    checkInterval: 0, // Desactivar verificación automática
    enableNotifications: false, // Desactivar notificaciones automáticas
    lowStockThreshold: 1.2 // 120% del stock mínimo
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [costHistory, setCostHistory] = useState<CostHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  
  // Debounce para evitar múltiples llamadas mientras el usuario escribe
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay
  const [activeTab, setActiveTab] = useState(0);
  const [showCosts, setShowCosts] = useState(user?.role?.toUpperCase() === 'ADMIN');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Estados de paginación mejorados
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);

  // Estados de modales
  const [productDialog, setProductDialog] = useState<{ open: boolean; product: Product | null; isNew: boolean }>({
    open: false,
    product: null,
    isNew: false
  });

  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; category: Category | null; isNew: boolean }>({
    open: false,
    category: null,
    isNew: false
  });

  const [historyDialog, setHistoryDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null
  });

  const [restockDialog, setRestockDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null
  });

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: any; type: 'product' | 'category' }>({
    open: false,
    item: null,
    type: 'product'
  });

  // Form data
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({});
  const [restockForm, setRestockForm] = useState({
    quantity: 0,
    unit_cost: 0,
    new_selling_price: 0,
    supplier_name: '',
    invoice_number: '',
    notes: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar productos cuando cambien los filtros o la página
  useEffect(() => {
    if (categories.length > 0) {
      loadProducts();
    }
  }, [debouncedSearchTerm, categoryFilter, statusFilter, categories, page, rowsPerPage]);

  const loadCategories = async () => {
    try {
      const categoriesData = await inventoryService.getCategories();
      console.log('🔍 Categorías recibidas del backend:', categoriesData);
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError(err.message || 'Error cargando categorías');
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const currentPage = page + 1; // Convertir a base 1 para el backend
      
      const result = await inventoryService.getProducts({
        category_id: categoryFilter !== 'Todos' ? categories.find(c => c.name === categoryFilter)?.id : undefined,
        status: statusFilter !== 'Todos' ? statusFilter : undefined,
        search: debouncedSearchTerm || undefined,
        include_costs: user?.role?.toUpperCase() === 'ADMIN',
        page: currentPage,
        per_page: rowsPerPage
      });
      
      console.log('🔍 Resultado de productos:', result);
      console.log('🔍 Primer producto:', result.products[0]);
      
      setProducts(result.products);
      setTotalProducts(result.total);
      
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.message || 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    
    try {
      // Cargar categorías primero
      await loadCategories();
      
      // Cargar resumen
      const summaryData = await inventoryService.getInventorySummary();
      setSummary(summaryData);
      
    } catch (err: any) {
      console.error('Error loading initial data:', err);
      setError(err.message || 'Error cargando datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    // Resetear a página 0 al refrescar
    setPage(0);
    await loadInitialData();
  };

  // Handlers de paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Resetear a la primera página cuando cambie el tamaño de página
  };

  const calculateProfitMargin = (sellingPrice: number, cost: number): number => {
    if (sellingPrice > 0) {
      return ((sellingPrice - cost) / sellingPrice) * 100;
    }
    return 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'out_of_stock': return 'error';
      case 'discontinued': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'out_of_stock': return 'Sin Stock';
      case 'discontinued': return 'Descontinuado';
      default: return status;
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
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  // Handlers para productos
  const handleAddProduct = () => {
    setProductForm({
      name: '',
      description: '',
      category_id: categories[0]?.id || 1,
      current_cost: 0,
      selling_price: 0,
      current_stock: 0,
      min_stock: 5,
      unit_of_measure: 'unidad',
      status: 'active'
    });
    setProductDialog({ open: true, product: null, isNew: true });
  };

  const handleEditProduct = (product: Product) => {
    setProductForm(product);
    setProductDialog({ open: true, product, isNew: false });
  };

  const handleDeleteProduct = (product: Product) => {
    setDeleteDialog({ open: true, item: product, type: 'product' });
  };

  const handleSaveProduct = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (productDialog.isNew) {
        await inventoryService.createProduct(productForm as any);
      } else if (productDialog.product) {
        await inventoryService.updateProduct(productDialog.product.id, productForm);
      }
      
      setProductDialog({ open: false, product: null, isNew: false });
      await refreshData(); // Recargar datos
      
    } catch (err: any) {
      setError(err.message || 'Error guardando producto');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para categorías
  const handleAddCategory = () => {
    setCategoryForm({
      name: '',
      description: '',
      color: '#4CAF50',
      icon: 'category',
      is_active: true
    });
    setCategoryDialog({ open: true, category: null, isNew: true });
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm(category);
    setCategoryDialog({ open: true, category, isNew: false });
  };

  const handleDeleteCategory = (category: Category) => {
    setDeleteDialog({ open: true, item: category, type: 'category' });
  };

  const handleSaveCategory = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (categoryDialog.isNew) {
        await inventoryService.createCategory(categoryForm as any);
      } else if (categoryDialog.category) {
        await inventoryService.updateCategory(categoryDialog.category.id, categoryForm);
      }
      
      setCategoryDialog({ open: false, category: null, isNew: false });
      await refreshData(); // Recargar datos
      
    } catch (err: any) {
      setError(err.message || 'Error guardando categoría');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (deleteDialog.type === 'product') {
        await inventoryService.deleteProduct(deleteDialog.item.id);
      } else {
        await inventoryService.deleteCategory(deleteDialog.item.id);
      }
      
      setDeleteDialog({ open: false, item: null, type: 'product' });
      await refreshData(); // Recargar datos
      
    } catch (err: any) {
      setError(err.message || 'Error eliminando elemento');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (product: Product) => {
    if (historyLoading) return;
    
    setHistoryLoading(true);
    setError('');
    
    try {
      setHistoryDialog({ open: true, product });
      const history = await inventoryService.getProductCostHistory(product.id);
      setCostHistory(history);
      
    } catch (err: any) {
      console.error('Error loading cost history:', err);
      setError(err.message || 'Error cargando historial');
      setHistoryDialog({ open: false, product: null });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRestock = (product: Product) => {
    setRestockForm({
      quantity: 0,
      unit_cost: product.current_cost || 0,
      new_selling_price: product.selling_price || 0,
      supplier_name: '',
      invoice_number: '',
      notes: ''
    });
    setRestockDialog({ open: true, product });
  };

  const handleSaveRestock = async () => {
    if (!restockDialog.product) return;
    
    setLoading(true);
    setError('');
    
    try {
      await inventoryService.restockProduct(restockDialog.product.id, {
        quantity: restockForm.quantity,
        unit_cost: restockForm.unit_cost,
        new_selling_price: restockForm.new_selling_price,
        supplier_name: restockForm.supplier_name,
        invoice_number: restockForm.invoice_number,
        notes: restockForm.notes
      });
      
      setRestockDialog({ open: false, product: null });
      await refreshData(); // Recargar datos
      
    } catch (err: any) {
      setError(err.message || 'Error en restock');
    } finally {
      setLoading(false);
    }
  };

  const canModifyInventory = user?.role?.toUpperCase() === 'ADMIN';
  const canViewCosts = user?.role?.toUpperCase() === 'ADMIN';

  return (
    <AdminRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              {/* Header */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                  <InventoryIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h4" component="h1">
                    Gestión de Inventario
                  </Typography>
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                  {canViewCosts && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showCosts}
                          onChange={(e) => setShowCosts(e.target.checked)}
                        />
                      }
                      label="Mostrar Costos"
                    />
                  )}
                  {/* <Button 
                    variant="outlined" 
                    startIcon={<Download />}
                    onClick={() => console.log('🔍 Verificando stock manualmente...')}
                  >
                    Exportar
                  </Button> */}
                  <Button 
                    variant="contained" 
                    color="warning"
                    onClick={async () => {
                      // Crear una verificación manual con notificaciones habilitadas
                      const { notificationService } = require('../../services/notificationService');
                      
                      try {
                        // Obtener productos usando el servicio importado
                        const result = await inventoryService.getProducts({
                          status: 'active',
                          per_page: 500,
                          page: 1
                        });

                        const products = result.products;
                        const lowStockProducts = products.filter(product => {
                          const isLowStock = product.current_stock <= (product.min_stock * 1.2);
                          return isLowStock && product.current_stock >= 0;
                        });

                        // Generar notificaciones para productos con stock bajo
                        if (lowStockProducts.length > 0) {
                          for (const product of lowStockProducts) {
                            notificationService.notifyLowStock(
                              product.name,
                              product.current_stock,
                              product.min_stock
                            );
                          }
                        }
                      } catch (error) {
                        // Error silencioso
                      }
                    }}
                    sx={{ ml: 1 }}
                  >
                    Verificar Stock
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error"
                    onClick={() => {
                      const { notificationService } = require('../../services/notificationService');
                      notificationService.notifyLowStock('Producto de Prueba', 5, 10);
                    }}
                    sx={{ ml: 1 }}
                  >
                    Prueba Notificación
                  </Button>
                </Box>
              </Box>

              {/* Error alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* Métricas rápidas */}
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Total Productos
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {totalProducts}
                          </Typography>
                        </Box>
                        <InventoryIcon color="primary" fontSize="large" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Stock Bajo
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="warning.main">
                            {summary?.low_stock_count || 0}
                          </Typography>
                        </Box>
                        <Warning color="warning" fontSize="large" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Sin Stock
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="error.main">
                            {summary?.out_of_stock_count || 0}
                          </Typography>
                        </Box>
                        <LocalOffer color="error" fontSize="large" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            {canViewCosts ? 'Valor Total' : 'Categorías'}
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {canViewCosts && summary?.total_inventory_value 
                              ? formatPrice(summary.total_inventory_value)
                              : (summary?.total_categories || categories.filter(c => c.is_active).length)
                            }
                          </Typography>
                        </Box>
                        {canViewCosts ? 
                          <AttachMoney color="success" fontSize="large" /> :
                          <CategoryIcon color="info" fontSize="large" />
                        }
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Tabs */}
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                <Tab label="Productos" icon={<InventoryIcon />} />
                <Tab label="Categorías" icon={<CategoryIcon />} />
              </Tabs>

              {activeTab === 0 && (
                <>
                  {/* Filtros de productos */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth>
                            <InputLabel>Categoría</InputLabel>
                            <Select
                              value={categoryFilter}
                              label="Categoría"
                              onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                              <MenuItem value="Todos">Todas las categorías</MenuItem>
                              {categories.map((category) => (
                                <MenuItem key={category.id} value={category.name}>
                                  {category.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth>
                            <InputLabel>Estado</InputLabel>
                            <Select
                              value={statusFilter}
                              label="Estado"
                              onChange={(e) => setStatusFilter(e.target.value)}
                            >
                              <MenuItem value="Todos">Todos los estados</MenuItem>
                              <MenuItem value="active">Activo</MenuItem>
                              <MenuItem value="inactive">Inactivo</MenuItem>
                              <MenuItem value="out_of_stock">Sin Stock</MenuItem>
                              <MenuItem value="discontinued">Descontinuado</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <Typography variant="body2" color="text.secondary">
                            {totalProducts} productos encontrados
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Tabla de productos con paginación */}
                  <TableContainer component={Paper} elevation={1}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Producto</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Categoría</TableCell>
                          {canViewCosts && showCosts && (
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Costo</TableCell>
                          )}
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Precio</TableCell>
                          {canViewCosts && showCosts && (
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Margen</TableCell>
                          )}
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stock</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={canViewCosts && showCosts ? 8 : 6} align="center" sx={{ py: 4 }}>
                              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                                <CircularProgress />
                                <Typography color="text.secondary">Cargando productos...</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : products.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={canViewCosts && showCosts ? 8 : 6} align="center" sx={{ py: 4 }}>
                              <Typography color="text.secondary">
                                No se encontraron productos
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          products.map((product) => (
                            <TableRow key={product.id} hover>
                              <TableCell>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {product.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {product.description}
                                  </Typography>
                                  {product.sku && (
                                    <Typography variant="caption" color="text.secondary">
                                      SKU: {product.sku}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={product.category_name || product.category || 'Sin categoría'}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: product.category_color || categories.find(c => c.name === (product.category_name || product.category))?.color || '#gray',
                                    color: 'white'
                                  }}
                                />
                              </TableCell>
                              {canViewCosts && showCosts && (
                                <TableCell>
                                  <Typography fontWeight="bold" color="error">
                                    {formatPrice(product.current_cost)}
                                  </Typography>
                                </TableCell>
                              )}
                              <TableCell>
                                <Typography fontWeight="bold" color="success.main">
                                  {formatPrice(product.selling_price)}
                                </Typography>
                              </TableCell>
                              {canViewCosts && showCosts && (
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    {product.profit_margin && product.profit_margin > 30 ? <TrendingUp color="success" /> : <TrendingDown color="warning" />}
                                    <Typography color={product.profit_margin && product.profit_margin > 30 ? 'success.main' : 'warning.main'}>
                                      {product.profit_margin ? product.profit_margin.toFixed(1) : '0.0'}%
                                    </Typography>
                                  </Box>
                                </TableCell>
                              )}
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  {product.current_stock <= product.min_stock && (
                                    <Warning color="warning" fontSize="small" />
                                  )}
                                  <Typography
                                    color={product.current_stock === 0 ? 'error' : product.current_stock <= product.min_stock ? 'warning.main' : 'text.primary'}
                                    fontWeight={product.current_stock <= product.min_stock ? 'bold' : 'normal'}
                                  >
                                    {product.current_stock} {product.unit_of_measure}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getStatusLabel(product.status)}
                                  color={getStatusColor(product.status) as any}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Box display="flex" gap={1}>
                                  <Tooltip title="Ver historial">
                                    <IconButton size="small" color="info" onClick={() => handleViewHistory(product)}>
                                      <HistoryIcon />
                                    </IconButton>
                                  </Tooltip>
                                  {canModifyInventory && (
                                    <>
                                      <Tooltip title="Restock">
                                        <IconButton size="small" color="success" onClick={() => handleRestock(product)}>
                                          <Add />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Editar">
                                        <IconButton size="small" color="primary" onClick={() => handleEditProduct(product)}>
                                          <Edit />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Eliminar">
                                        <IconButton size="small" color="error" onClick={() => handleDeleteProduct(product)}>
                                          <Delete />
                                        </IconButton>
                                      </Tooltip>
                                    </>
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
                      count={totalProducts}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      labelRowsPerPage="Productos por página:"
                      labelDisplayedRows={({ from, to, count }) => 
                        `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                      }
                    />
                  </TableContainer>

                  {/* FAB para agregar producto */}
                  {canModifyInventory && (
                    <Fab
                      color="primary"
                      aria-label="add"
                      sx={{ position: 'fixed', bottom: 16, right: 16 }}
                      onClick={handleAddProduct}
                    >
                      <Add />
                    </Fab>
                  )}
                </>
              )}

              {activeTab === 1 && (
                <>
                  {/* Header de categorías */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">Gestión de Categorías</Typography>
                    {canModifyInventory && (
                      <Button variant="contained" startIcon={<Add />} onClick={handleAddCategory}>
                        Nueva Categoría
                      </Button>
                    )}
                  </Box>

                  {/* Grid de categorías */}
                  <Grid container spacing={3}>
                    {categories.map((category) => (
                      <Grid item xs={12} md={6} lg={4} key={category.id}>
                        <Card sx={{ height: '100%' }}>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ backgroundColor: category.color, width: 50, height: 50 }}>
                                  <CategoryIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" fontWeight="bold">
                                    {category.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {category.product_count} productos
                                  </Typography>
                                </Box>
                              </Box>
                              <Chip
                                label={category.is_active ? 'Activa' : 'Inactiva'}
                                color={category.is_active ? 'success' : 'error'}
                                size="small"
                              />
                            </Box>
                            
                            <Typography variant="body2" mb={2} sx={{ minHeight: 40 }}>
                              {category.description}
                            </Typography>

                            <Typography variant="caption" color="text.secondary" mb={2} display="block">
                              Creada: {formatDate(category.created_at)}
                            </Typography>

                            {canModifyInventory && (
                              <Box display="flex" justifyContent="space-between" mt={2}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Edit />}
                                  onClick={() => handleEditCategory(category)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<Delete />}
                                  onClick={() => handleDeleteCategory(category)}
                                  disabled={category.product_count > 0}
                                >
                                  Eliminar
                                </Button>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Los modales se mantienen igual... */}
      {/* Modal de producto */}
      <Dialog
        open={productDialog.open}
        onClose={() => setProductDialog({ open: false, product: null, isNew: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {productDialog.isNew ? 'Agregar Producto' : 'Editar Producto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Información básica */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información Básica
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Producto"
                value={productForm.name || ''}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                required
                error={!productForm.name}
                helperText={!productForm.name ? 'El nombre es requerido' : ''}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Descripción"
                value={productForm.description || ''}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={productForm.category_id || ''}
                  label="Categoría"
                  onChange={(e) => setProductForm({...productForm, category_id: Number(e.target.value)})}
                  error={!productForm.category_id}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                value={productForm.sku || ''}
                onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                placeholder="Código único del producto"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código de Barras"
                value={productForm.barcode || ''}
                onChange={(e) => setProductForm({...productForm, barcode: e.target.value})}
                placeholder="Código de barras del producto"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unidad de Medida"
                value={productForm.unit_of_measure || 'unidad'}
                onChange={(e) => setProductForm({...productForm, unit_of_measure: e.target.value})}
                select
              >
                <MenuItem value="unidad">Unidad</MenuItem>
                <MenuItem value="kg">Kilogramo</MenuItem>
                <MenuItem value="g">Gramo</MenuItem>
                <MenuItem value="l">Litro</MenuItem>
                <MenuItem value="ml">Mililitro</MenuItem>
                <MenuItem value="m">Metro</MenuItem>
                <MenuItem value="cm">Centímetro</MenuItem>
                <MenuItem value="caja">Caja</MenuItem>
                <MenuItem value="paquete">Paquete</MenuItem>
              </TextField>
            </Grid>
            
            {/* Precios y costos */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Precios y Costos
              </Typography>
            </Grid>
            
            {canViewCosts && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Costo Unitario"
                  type="number"
                  value={productForm.current_cost || 0}
                  onChange={(e) => setProductForm({...productForm, current_cost: Number(e.target.value)})}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio de Venta"
                type="number"
                value={productForm.selling_price || 0}
                onChange={(e) => setProductForm({...productForm, selling_price: Number(e.target.value)})}
                required
                error={!productForm.selling_price || productForm.selling_price <= 0}
                helperText={!productForm.selling_price || productForm.selling_price <= 0 ? 'El precio debe ser mayor a 0' : ''}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={productForm.is_taxable || false}
                    onChange={(e) => setProductForm({...productForm, is_taxable: e.target.checked})}
                  />
                }
                label="Gravable con IVA"
              />
            </Grid>
            
            {productForm.is_taxable && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tasa de IVA (%)"
                  type="number"
                  value={productForm.tax_rate || 19}
                  onChange={(e) => setProductForm({...productForm, tax_rate: Number(e.target.value)})}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </Grid>
            )}
            
            {/* Stock */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Gestión de Stock
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stock Actual"
                type="number"
                value={productForm.current_stock || 0}
                onChange={(e) => setProductForm({...productForm, current_stock: Number(e.target.value)})}
                required
                error={productForm.current_stock !== undefined && productForm.current_stock < 0}
                helperText={productForm.current_stock !== undefined && productForm.current_stock < 0 ? 'El stock no puede ser negativo' : ''}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stock Mínimo"
                type="number"
                value={productForm.min_stock || 5}
                onChange={(e) => setProductForm({...productForm, min_stock: Number(e.target.value)})}
                required
                error={productForm.min_stock !== undefined && productForm.min_stock < 0}
                helperText={productForm.min_stock !== undefined && productForm.min_stock < 0 ? 'El stock mínimo no puede ser negativo' : ''}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stock Máximo"
                type="number"
                value={productForm.max_stock || ''}
                onChange={(e) => setProductForm({...productForm, max_stock: Number(e.target.value) || undefined})}
                helperText="Opcional"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Peso por Unidad (kg)"
                type="number"
                value={productForm.weight_per_unit || ''}
                onChange={(e) => setProductForm({...productForm, weight_per_unit: Number(e.target.value) || undefined})}
                helperText="Opcional"
                inputProps={{ step: 0.01 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={productForm.status || 'active'}
                  label="Estado"
                  onChange={(e) => setProductForm({...productForm, status: e.target.value as any})}
                >
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
                  <MenuItem value="out_of_stock">Sin Stock</MenuItem>
                  <MenuItem value="discontinued">Descontinuado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setProductDialog({ open: false, product: null, isNew: false })} 
            startIcon={<Cancel />}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveProduct} 
            variant="contained" 
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            disabled={loading}
          >
            {loading ? 'Guardando...' : (productDialog.isNew ? 'Crear Producto' : 'Guardar Cambios')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de categoría */}
      <Dialog
        open={categoryDialog.open}
        onClose={() => setCategoryDialog({ open: false, category: null, isNew: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {categoryDialog.isNew ? 'Agregar Categoría' : 'Editar Categoría'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de la Categoría"
                value={categoryForm.name || ''}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                required
                error={!categoryForm.name}
                helperText={!categoryForm.name ? 'El nombre es requerido' : ''}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={categoryForm.description || ''}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Color</InputLabel>
                <Select
                  value={categoryForm.color || '#4CAF50'}
                  label="Color"
                  onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                >
                  {colorOptions.map((color) => (
                    <MenuItem key={color} value={color}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: color,
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                          }}
                        />
                        {color}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Icono"
                value={categoryForm.icon || 'category'}
                onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                placeholder="Nombre del icono de Material-UI"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={categoryForm.is_active !== false}
                    onChange={(e) => setCategoryForm({...categoryForm, is_active: e.target.checked})}
                  />
                }
                label="Categoría Activa"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCategoryDialog({ open: false, category: null, isNew: false })} 
            startIcon={<Cancel />}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained" 
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            disabled={loading}
          >
            {loading ? 'Guardando...' : (categoryDialog.isNew ? 'Crear Categoría' : 'Guardar Cambios')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de restock */}
      <Dialog
        open={restockDialog.open}
        onClose={() => setRestockDialog({ open: false, product: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Restock: {restockDialog.product?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cantidad a Agregar"
                type="number"
                value={restockForm.quantity}
                onChange={(e) => setRestockForm({...restockForm, quantity: Number(e.target.value)})}
                required
                error={restockForm.quantity <= 0}
                helperText={restockForm.quantity <= 0 ? 'La cantidad debe ser mayor a 0' : ''}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Costo Unitario"
                type="number"
                value={restockForm.unit_cost}
                onChange={(e) => setRestockForm({...restockForm, unit_cost: Number(e.target.value)})}
                required
                error={restockForm.unit_cost <= 0}
                helperText={restockForm.unit_cost <= 0 ? 'El costo debe ser mayor a 0' : ''}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nuevo Precio de Venta"
                type="number"
                value={restockForm.new_selling_price}
                onChange={(e) => setRestockForm({...restockForm, new_selling_price: Number(e.target.value)})}
                helperText="Opcional - dejar en 0 para mantener precio actual"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Proveedor"
                value={restockForm.supplier_name}
                onChange={(e) => setRestockForm({...restockForm, supplier_name: e.target.value})}
                required
                error={!restockForm.supplier_name}
                helperText={!restockForm.supplier_name ? 'El proveedor es requerido' : ''}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número de Factura"
                value={restockForm.invoice_number}
                onChange={(e) => setRestockForm({...restockForm, invoice_number: e.target.value})}
                placeholder="Opcional"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                value={restockForm.notes}
                onChange={(e) => setRestockForm({...restockForm, notes: e.target.value})}
                multiline
                rows={3}
                placeholder="Notas adicionales sobre el restock..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRestockDialog({ open: false, product: null })} 
            startIcon={<Cancel />}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveRestock} 
            variant="contained" 
            startIcon={loading ? <CircularProgress size={20} /> : <Add />}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Registrar Restock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de historial de costos */}
      <Dialog
        open={historyDialog.open}
        onClose={() => setHistoryDialog({ open: false, product: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Historial de Costos: {historyDialog.product?.name}
        </DialogTitle>
        <DialogContent>
          {historyLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
            </Box>
          ) : costHistory.length === 0 ? (
            <Typography color="text.secondary" align="center" py={4}>
              No hay historial de costos disponible
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Costo Unitario</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Costo Total</TableCell>
                    <TableCell>Proveedor</TableCell>
                    <TableCell>Notas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {costHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.purchase_date)}</TableCell>
                      <TableCell>{formatPrice(record.cost_per_unit)}</TableCell>
                      <TableCell>{record.quantity_purchased}</TableCell>
                      <TableCell>{formatPrice(record.total_cost)}</TableCell>
                      <TableCell>{record.supplier_name || '-'}</TableCell>
                      <TableCell>{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setHistoryDialog({ open: false, product: null })} 
            startIcon={<Cancel />}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null, type: 'product' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar{' '}
            <strong>{deleteDialog.item?.name}</strong>?
            {deleteDialog.type === 'category' && deleteDialog.item?.product_count > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Esta categoría tiene {deleteDialog.item.product_count} productos asignados. 
                No se puede eliminar hasta que se reasignen o eliminen esos productos.
              </Alert>
            )}
            {deleteDialog.type === 'product' && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Esta acción no se puede deshacer. Se eliminarán todos los datos relacionados con este producto.
              </Alert>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, item: null, type: 'product' })} 
            startIcon={<Cancel />}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
            disabled={loading || (deleteDialog.type === 'category' && deleteDialog.item?.product_count > 0)}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

    </AdminRoute>
  );
}