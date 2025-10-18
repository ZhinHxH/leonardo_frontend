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
  Avatar,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  ShoppingCart,
  Add,
  Visibility,
  Receipt,
  Search,
  Download,
  Person,
  AttachMoney
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { AdminRoute } from '../../components/AdminRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

interface Sale {
  id: number;
  customer: { id: number; name: string; email: string };
  seller: { id: number; name: string };
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  total_amount: number;
  payment_method: string;
  sale_type: string;
  created_at: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export default function Sales() {
  const router = useRouter();

  const handleNewSale = () => {
    router.push('/sales/pos');
  };

  const handleViewHistory = () => {
    router.push('/sales/history');
  };

  return (
    <AdminRoute allowedRoles={['admin', 'manager', 'receptionist']}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Toolbar />
          <Box p={4}>
            <Paper elevation={2} sx={{ p: 4 }}>
              <Box textAlign="center" mb={4}>
                <ShoppingCart sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h3" component="h1" gutterBottom>
                  Sistema de Ventas
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Gestiona ventas de productos e membresías de forma rápida y eficiente
                </Typography>
              </Box>

              <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                      transition: 'all 0.3s',
                      border: '2px solid',
                      borderColor: 'primary.main'
                    }}
                    onClick={handleNewSale}
                  >
                    <ShoppingCart sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" mb={1}>
                      Nueva Venta
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={2}>
                      Interfaz optimizada para ventas rápidas de productos y membresías
                    </Typography>
                    <Button variant="contained" size="large" startIcon={<Add />}>
                      Iniciar Venta
                    </Button>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                      transition: 'all 0.3s',
                      border: '2px solid',
                      borderColor: 'secondary.main'
                    }}
                    onClick={handleViewHistory}
                  >
                    <Receipt sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" mb={1}>
                      Historial de Ventas
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={2}>
                      Consulta, revisa y reversa ventas realizadas
                    </Typography>
                    <Button variant="outlined" size="large" startIcon={<Visibility />}>
                      Ver Historial
                    </Button>
                  </Card>
                </Grid>
              </Grid>

              <Box mt={6}>
                <Typography variant="h6" gutterBottom color="primary">
                  🚀 Características del Sistema:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="✅ Ventas de productos con control de stock"
                          secondary="Actualización automática de inventario"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="✅ Ventas de membresías con activación automática"
                          secondary="Creación inmediata de membresías activas"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="✅ Múltiples métodos de pago"
                          secondary="Efectivo, Nequi, Bancolombia, Tarjeta"
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="✅ Reversión de ventas"
                          secondary="Reabastecimiento automático de stock"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="✅ Historial detallado"
                          secondary="Seguimiento completo de transacciones"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="✅ Interfaz optimizada"
                          secondary="Diseño pensado para velocidad de venta"
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </AdminRoute>
  );
}