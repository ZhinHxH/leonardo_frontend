import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Toolbar,
  Button,
  Alert,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import inventoryService, { Product, Category } from '../../services/inventory';

export default function InventoryDebug() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rawProductsData, setRawProductsData] = useState<any>(null);
  const [rawCategoriesData, setRawCategoriesData] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🚀 Iniciando carga de datos...');
      
      // Cargar categorías
      console.log('📂 Cargando categorías...');
      const categoriesData = await inventoryService.getCategories();
      console.log('📂 Categorías raw:', categoriesData);
      setRawCategoriesData(categoriesData);
      setCategories(categoriesData);
      
      // Cargar productos
      console.log('📦 Cargando productos...');
      const productsData = await inventoryService.getProducts({
        include_costs: user?.role === 'admin'
      });
      console.log('📦 Productos raw:', productsData);
      setRawProductsData(productsData);
      setProducts(productsData);
      
      console.log('✅ Datos cargados exitosamente');
      
    } catch (err: any) {
      console.error('❌ Error cargando datos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <AdminRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h4" mb={3}>
                🔍 Debug de Inventario
              </Typography>

              <Button onClick={loadData} variant="contained" disabled={loading} sx={{ mb: 3 }}>
                {loading ? 'Cargando...' : 'Recargar Datos'}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                {/* Categorías */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" mb={2}>
                        🏷️ Categorías ({categories.length})
                      </Typography>
                      
                      {categories.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Color</TableCell>
                                <TableCell>Productos</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {categories.map((category) => (
                                <TableRow key={category.id}>
                                  <TableCell>{category.id}</TableCell>
                                  <TableCell>{category.name}</TableCell>
                                  <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Box 
                                        sx={{ 
                                          width: 20, 
                                          height: 20, 
                                          backgroundColor: category.color,
                                          borderRadius: '50%'
                                        }} 
                                      />
                                      {category.color}
                                    </Box>
                                  </TableCell>
                                  <TableCell>{category.product_count}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography color="text.secondary">
                          No hay categorías cargadas
                        </Typography>
                      )}

                      {rawCategoriesData && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" color="primary">
                            Datos Raw de Categorías:
                          </Typography>
                          <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                            {JSON.stringify(rawCategoriesData, null, 2)}
                          </pre>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Productos */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" mb={2}>
                        📦 Productos ({products.length})
                      </Typography>
                      
                      {products.length > 0 ? (
                        <Box>
                          {products.slice(0, 3).map((product) => (
                            <Card key={product.id} sx={{ mb: 2, p: 2 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {product.name}
                              </Typography>
                              <Typography variant="body2">
                                Category ID: {product.category_id || 'NULL'}
                              </Typography>
                              <Typography variant="body2">
                                Category Name: {product.category_name || 'NO ENCONTRADO'}
                              </Typography>
                              <Typography variant="body2">
                                Category (mapped): {product.category || 'NO ENCONTRADO'}
                              </Typography>
                              <Typography variant="body2">
                                Category Color: {product.category_color || 'NO ENCONTRADO'}
                              </Typography>
                              <Box mt={1}>
                                <Chip 
                                  label={product.category_name || product.category || 'Sin categoría'}
                                  sx={{ 
                                    backgroundColor: product.category_color || '#gray',
                                    color: 'white'
                                  }}
                                />
                              </Box>
                            </Card>
                          ))}
                        </Box>
                      ) : (
                        <Typography color="text.secondary">
                          No hay productos cargados
                        </Typography>
                      )}

                      {rawProductsData && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" color="primary">
                            Datos Raw del Primer Producto:
                          </Typography>
                          <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                            {JSON.stringify(rawProductsData[0], null, 2)}
                          </pre>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>
      </Box>
    </AdminRoute>
  );
}








