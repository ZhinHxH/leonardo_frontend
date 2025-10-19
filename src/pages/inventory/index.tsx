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
  CircularProgress
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
import { Pagination } from '../../components/Pagination';

// Interfaces importadas desde el servicio

// Los datos ahora se cargan desde el backend

const colorOptions = [
  '#4CAF50', '#FF9800', '#E91E63', '#2196F3', '#9C27B0', 
  '#F44336', '#00BCD4', '#8BC34A', '#FFC107', '#795548'
];

export default function Inventory() {
  const router = useRouter();
  const { user } = useAuth();
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
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [perPage] = useState(20); // 20 productos por página

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

  // Cargar productos cuando cambien los filtros (con debounce para búsqueda)
  useEffect(() => {
    if (categories.length > 0) { // Solo cargar productos después de tener categorías
      loadProducts(true); // Reset page when filters change
    }
  }, [debouncedSearchTerm, categoryFilter, statusFilter, categories]);

  // Cargar productos cuando cambie la página (sin reset)
  useEffect(() => {
    if (categories.length > 0 && currentPage > 1) {
      loadProducts(false);
    }
  }, [currentPage]);

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

  const loadProducts = async (resetPage: boolean = false) => {
    setLoading(true);
    setError('');
    
    const page = resetPage ? 1 : currentPage;
    if (resetPage) setCurrentPage(1);
    
    try {
      const result = await inventoryService.getProducts({
        category_id: categoryFilter !== 'Todos' ? categories.find(c => c.name === categoryFilter)?.id : undefined,
        status: statusFilter !== 'Todos' ? statusFilter : undefined,
        search: debouncedSearchTerm || undefined,
        include_costs: user?.role?.toUpperCase() === 'ADMIN',
        page: page,
        per_page: perPage
      });
      
      console.log('🔍 Resultado de productos:', result);
      console.log('🔍 Primer producto:', result.products[0]);
      
      setProducts(result.products);
      setTotalPages(result.total_pages);
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
    await loadInitialData();
    await loadProducts(true);
  };

  const calculateProfitMargin = (sellingPrice: number, cost: number): number => {
    // Fórmula corregida: (precio - costo) / precio * 100
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
    // Evitar múltiples llamadas si ya está cargando historial
    if (historyLoading) return;
    
    setHistoryLoading(true);
    setError('');
    
    try {
      // Abrir modal primero para feedback inmediato
      setHistoryDialog({ open: true, product });
      
      // Luego cargar datos sin bloquear la UI principal
      const history = await inventoryService.getProductCostHistory(product.id);
      setCostHistory(history);
      
    } catch (err: any) {
      console.error('Error loading cost history:', err);
      setError(err.message || 'Error cargando historial');
      // Cerrar modal si hay error
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
    <AdminRoute allowedRoles={['admin', 'manager', 'receptionist']}>
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
                  <Button variant="outlined" startIcon={<Download />}>
                    Exportar
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
                            {summary?.total_products || products.length}
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
                            {summary?.low_stock_count || products.filter(p => p.current_stock <= p.min_stock).length}
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
                            {summary?.out_of_stock_count || products.filter(p => p.current_stock === 0).length}
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
                          {totalPages > 1 && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Página {currentPage} de {totalPages}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Tabla de productos */}
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
                  </TableContainer>

                  {/* Paginación avanzada */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalProducts}
                    itemsPerPage={perPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(newPerPage) => {
                      // Actualizar perPage y recargar (esto requiere agregar state para perPage)
                      console.log('Cambiar items por página:', newPerPage);
                      // Por ahora solo log, se puede implementar después
                    }}
                    loading={loading}
                    showItemsPerPage={false} // Deshabilitado por ahora
                  />

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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Producto *"
                value={productForm.name || ''}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría *</InputLabel>
                <Select
                  value={productForm.category_id || ''}
                  label="Categoría *"
                  onChange={(e) => setProductForm({ ...productForm, category_id: Number(e.target.value) })}
                >
                  {categories.filter(c => c.is_active).map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: category.color 
                          }} 
                        />
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={2}
                value={productForm.description || ''}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código de Barras"
                value={productForm.barcode || ''}
                onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                value={productForm.sku || ''}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
              />
            </Grid>
            {canViewCosts && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Costo de Compra *"
                  type="number"
                  value={productForm.current_cost || ''}
                  onChange={(e) => setProductForm({ ...productForm, current_cost: Number(e.target.value) })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio de Venta *"
                type="number"
                value={productForm.selling_price || ''}
                onChange={(e) => setProductForm({ ...productForm, selling_price: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stock Actual"
                type="number"
                value={productForm.current_stock || ''}
                onChange={(e) => setProductForm({ ...productForm, current_stock: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stock Mínimo"
                type="number"
                value={productForm.min_stock || ''}
                onChange={(e) => setProductForm({ ...productForm, min_stock: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Unidad de Medida"
                value={productForm.unit_of_measure || ''}
                onChange={(e) => setProductForm({ ...productForm, unit_of_measure: e.target.value })}
                placeholder="unidad, kg, lb, etc."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={productForm.status || 'active'}
                  label="Estado"
                  onChange={(e) => setProductForm({ ...productForm, status: e.target.value as any })}
                >
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
                  <MenuItem value="out_of_stock">Sin Stock</MenuItem>
                  <MenuItem value="discontinued">Descontinuado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {productForm.current_cost && productForm.selling_price && (
              <Grid item xs={12} md={6}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Margen de ganancia: <strong>
                      {calculateProfitMargin(productForm.selling_price, productForm.current_cost).toFixed(1)}%
                    </strong>
                  </Typography>
                  <Typography variant="caption" display="block">
                    Fórmula: (Precio - Costo) / Precio × 100
                  </Typography>
                </Alert>
              </Grid>
            )}
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
          {categoryDialog.isNew ? 'Nueva Categoría' : 'Editar Categoría'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de la Categoría *"
                value={categoryForm.name || ''}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={2}
                value={categoryForm.description || ''}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Color</InputLabel>
                <Select
                  value={categoryForm.color || '#4CAF50'}
                  label="Color"
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                >
                  {colorOptions.map((color) => (
                    <MenuItem key={color} value={color}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box 
                          sx={{ 
                            width: 20, 
                            height: 20, 
                            borderRadius: '50%', 
                            backgroundColor: color 
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
              <FormControlLabel
                control={
                  <Switch
                    checked={categoryForm.is_active !== false}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
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

      {/* Modal de historial de costos */}
      <Dialog
        open={historyDialog.open}
        onClose={() => setHistoryDialog({ open: false, product: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <HistoryIcon />
            <Typography variant="h6">
              Historial de Costos - {historyDialog.product?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary">
              Seguimiento histórico de costos y restock del producto (como supermercado)
            </Typography>
          </Box>

          {/* Historial real de costos */}
          {historyLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" ml={2}>
                Cargando historial...
              </Typography>
            </Box>
          ) : costHistory.length > 0 ? (
            costHistory.map((record) => (
              <Card key={record.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">Fecha</Typography>
                      <Typography variant="body1">{formatDate(record.purchase_date)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">Costo Unitario</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatPrice(record.cost_per_unit)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">Cantidad</Typography>
                      <Typography variant="body1">{record.quantity_purchased} unidades</Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">Total</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatPrice(record.total_cost)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Proveedor</Typography>
                      <Typography variant="body1">{record.supplier_name || 'No especificado'}</Typography>
                      {record.supplier_invoice && (
                        <Typography variant="body2" color="text.secondary">
                          Factura: {record.supplier_invoice}
                        </Typography>
                      )}
                      {record.notes && (
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          "{record.notes}"
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        Registrado por: {record.user_name || 'Usuario'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          ) : (
            <Alert severity="info">
              No hay historial de costos disponible para este producto
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog({ open: false, product: null })}>
            Cerrar
          </Button>
          {canModifyInventory && (
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => {
                setHistoryDialog({ open: false, product: null });
                if (historyDialog.product) {
                  handleRestock(historyDialog.product);
                }
              }}
            >
              Agregar Restock
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de restock */}
      <Dialog
        open={restockDialog.open}
        onClose={() => setRestockDialog({ open: false, product: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Add color="success" />
            <Typography variant="h6">
              Restock - {restockDialog.product?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Stock actual:</strong> {restockDialog.product?.current_stock} {restockDialog.product?.unit_of_measure}
            </Typography>
            <Typography variant="body2">
              <strong>Costo actual:</strong> {restockDialog.product ? formatPrice(restockDialog.product.current_cost) : '$0'}
            </Typography>
            <Typography variant="body2">
              <strong>Precio actual:</strong> {restockDialog.product ? formatPrice(restockDialog.product.selling_price) : '$0'}
            </Typography>
          </Alert>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cantidad a Agregar *"
                type="number"
                value={restockForm.quantity}
                onChange={(e) => setRestockForm({ ...restockForm, quantity: Number(e.target.value) })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">{restockDialog.product?.unit_of_measure}</InputAdornment>,
                }}
                helperText="Esta cantidad se sumará al stock actual"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nuevo Costo Unitario *"
                type="number"
                value={restockForm.unit_cost}
                onChange={(e) => setRestockForm({ ...restockForm, unit_cost: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText="Costo de compra para este lote"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nuevo Precio de Venta (Opcional)"
                type="number"
                value={restockForm.new_selling_price}
                onChange={(e) => setRestockForm({ ...restockForm, new_selling_price: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText="Dejar en 0 para mantener precio actual"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Proveedor *"
                value={restockForm.supplier_name}
                onChange={(e) => setRestockForm({ ...restockForm, supplier_name: e.target.value })}
                helperText="Nombre del proveedor"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número de Factura"
                value={restockForm.invoice_number}
                onChange={(e) => setRestockForm({ ...restockForm, invoice_number: e.target.value })}
                helperText="Número de factura o referencia"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total de Compra"
                type="number"
                value={restockForm.quantity * restockForm.unit_cost}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  readOnly: true
                }}
                helperText="Calculado automáticamente"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                multiline
                rows={2}
                value={restockForm.notes}
                onChange={(e) => setRestockForm({ ...restockForm, notes: e.target.value })}
                helperText="Observaciones sobre esta compra"
              />
            </Grid>

            {restockForm.quantity > 0 && restockForm.unit_cost > 0 && (
              <Grid item xs={12}>
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Nuevo stock total:</strong> {(restockDialog.product?.current_stock || 0) + restockForm.quantity} {restockDialog.product?.unit_of_measure}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Inversión total:</strong> {formatPrice(restockForm.quantity * restockForm.unit_cost)}
                  </Typography>
                  {restockForm.new_selling_price > 0 && (
                    <Typography variant="body2">
                      <strong>Nuevo margen:</strong> {calculateProfitMargin(restockForm.new_selling_price, restockForm.unit_cost).toFixed(1)}%
                    </Typography>
                  )}
                </Alert>
              </Grid>
            )}
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
            startIcon={loading ? <CircularProgress size={20} /> : <ShoppingCart />}
            disabled={loading || restockForm.quantity <= 0 || restockForm.unit_cost <= 0 || !restockForm.supplier_name}
          >
            {loading ? 'Procesando...' : 'Confirmar Restock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null, type: 'product' })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar {deleteDialog.type === 'product' ? 'el producto' : 'la categoría'} "{deleteDialog.item?.name}"?
          </Typography>
          {deleteDialog.type === 'category' && deleteDialog.item?.product_count > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No puedes eliminar esta categoría porque tiene {deleteDialog.item.product_count} productos asignados.
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" mt={1}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, item: null, type: 'product' })}>
            Cancelar
          </Button>
          {!(deleteDialog.type === 'category' && deleteDialog.item?.product_count > 0) && (
            <Button onClick={confirmDelete} color="error" variant="contained">
              Eliminar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </AdminRoute>
  );
}