import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Typography,
  Card,
  CardContent,
  Box,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close,
  Save,
  Calculate,
  Warning,
  CheckCircle,
  AttachMoney,
  Receipt,
  AccountBalance
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import cashClosureService, { 
  CashClosureCreate, 
  CashClosureResponse, 
  ShiftSummary 
} from '../../services/cash-closure';

interface CashClosureProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (closure: CashClosureResponse) => void;
  shiftStart: Date;
}

export default function CashClosure({ open, onClose, onSuccess, shiftStart }: CashClosureProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummary | null>(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState<CashClosureCreate>({
    shift_date: new Date().toISOString().split('T')[0],
    shift_start: shiftStart.toISOString(),
    shift_end: new Date().toISOString(),
    notes: '',
    total_sales: 0,
    total_products_sold: 0,
    total_memberships_sold: 0,
    total_daily_access_sold: 0,
    cash_sales: 0,
    nequi_sales: 0,
    bancolombia_sales: 0,
    daviplata_sales: 0,
    card_sales: 0,
    transfer_sales: 0,
    cash_counted: 0,
    nequi_counted: 0,
    bancolombia_counted: 0,
    daviplata_counted: 0,
    card_counted: 0,
    transfer_counted: 0,
    discrepancies_notes: ''
  });

  // Cargar resumen del turno al abrir el diálogo
  useEffect(() => {
    if (open) {
      loadShiftSummary();
    }
  }, [open, shiftStart]);

  const loadShiftSummary = async () => {
    try {
      setLoading(true);
      const summary = await cashClosureService.getShiftSummary(shiftStart.toISOString());
      setShiftSummary(summary);
      
      // Actualizar formulario con datos del sistema
      setFormData(prev => ({
        ...prev,
        total_sales: summary.total_sales,
        total_products_sold: summary.total_products_sold,
        total_memberships_sold: summary.total_memberships_sold,
        total_daily_access_sold: summary.total_daily_access_sold,
        cash_sales: summary.cash_sales,
        nequi_sales: summary.nequi_sales,
        bancolombia_sales: summary.bancolombia_sales,
        daviplata_sales: summary.daviplata_sales,
        card_sales: summary.card_sales,
        transfer_sales: summary.transfer_sales
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CashClosureCreate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateDifferences = () => {
    const salesData = {
      cash_sales: formData.cash_sales,
      nequi_sales: formData.nequi_sales,
      bancolombia_sales: formData.bancolombia_sales,
      daviplata_sales: formData.daviplata_sales,
      card_sales: formData.card_sales,
      transfer_sales: formData.transfer_sales
    };

    const countedData = {
      cash_counted: formData.cash_counted,
      nequi_counted: formData.nequi_counted,
      bancolombia_counted: formData.bancolombia_counted,
      daviplata_counted: formData.daviplata_counted,
      card_counted: formData.card_counted,
      transfer_counted: formData.transfer_counted
    };

    const differences = cashClosureService.calculateDifferences(salesData, countedData);
    
    setFormData(prev => ({
      ...prev,
      discrepancies_notes: differences.discrepancies_notes || ''
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const closure = await cashClosureService.createCashClosure(formData);
      onSuccess(closure);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { key: 'cash', label: 'Efectivo', icon: <AttachMoney />, color: '#4CAF50' },
    { key: 'nequi', label: 'Nequi', icon: <AccountBalance />, color: '#2196F3' },
    { key: 'bancolombia', label: 'Bancolombia', icon: <AccountBalance />, color: '#FF9800' },
    { key: 'daviplata', label: 'Daviplata', icon: <AccountBalance />, color: '#9C27B0' },
    { key: 'card', label: 'Tarjeta', icon: <Receipt />, color: '#607D8B' },
    { key: 'transfer', label: 'Transferencia', icon: <AccountBalance />, color: '#795548' }
  ];

  const getDifferenceColor = (difference: number) => {
    if (Math.abs(difference) < 0.01) return 'success';
    if (Math.abs(difference) < 100) return 'warning';
    return 'error';
  };

  const getDifferenceIcon = (difference: number) => {
    if (Math.abs(difference) < 0.01) return <CheckCircle />;
    if (Math.abs(difference) < 100) return <Warning />;
    return <Warning />;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            💰 Cierre de Caja
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading && !shiftSummary && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {shiftSummary && (
          <>
            {/* Resumen del Turno */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  📊 Resumen del Turno
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Total de Ventas
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {cashClosureService.formatCurrency(shiftSummary.total_sales)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Productos Vendidos
                    </Typography>
                    <Typography variant="h6">
                      {shiftSummary.total_products_sold}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Membresías Vendidas
                    </Typography>
                    <Typography variant="h6">
                      {shiftSummary.total_memberships_sold}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Conteo Físico */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              💵 Conteo Físico
            </Typography>
            
            <Grid container spacing={2}>
              {paymentMethods.map((method) => (
                <Grid item xs={12} md={6} key={method.key}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Box sx={{ color: method.color, mr: 1 }}>
                          {method.icon}
                        </Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {method.label}
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            label="Sistema"
                            value={formData[`${method.key}_sales` as keyof CashClosureCreate]}
                            onChange={(e) => handleInputChange(
                              `${method.key}_sales` as keyof CashClosureCreate, 
                              parseFloat(e.target.value) || 0
                            )}
                            fullWidth
                            size="small"
                            InputProps={{
                              startAdornment: <Typography>$</Typography>
                            }}
                            disabled
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Conteo Físico"
                            value={formData[`${method.key}_counted` as keyof CashClosureCreate]}
                            onChange={(e) => handleInputChange(
                              `${method.key}_counted` as keyof CashClosureCreate, 
                              parseFloat(e.target.value) || 0
                            )}
                            fullWidth
                            size="small"
                            InputProps={{
                              startAdornment: <Typography>$</Typography>
                            }}
                          />
                        </Grid>
                      </Grid>
                      
                      {/* Diferencia */}
                      <Box mt={1}>
                        {(() => {
                          const sales = formData[`${method.key}_sales` as keyof CashClosureCreate] as number;
                          const counted = formData[`${method.key}_counted` as keyof CashClosureCreate] as number;
                          const difference = counted - sales;
                          
                          return (
                            <Chip
                              icon={getDifferenceIcon(difference)}
                              label={`Diferencia: ${difference >= 0 ? '+' : ''}${cashClosureService.formatCurrency(difference)}`}
                              color={getDifferenceColor(difference)}
                              size="small"
                            />
                          );
                        })()}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Resumen de Diferencias */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📋 Resumen de Diferencias
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Calculate />}
                  onClick={calculateDifferences}
                  sx={{ mb: 2 }}
                >
                  Calcular Diferencias
                </Button>
                
                {formData.discrepancies_notes && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      {formData.discrepancies_notes}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Notas Adicionales */}
            <TextField
              label="Notas del Cierre"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ mt: 3 }}
              placeholder="Observaciones sobre el cierre de caja..."
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Save />}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Cierre'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
