import React from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
  Grid,
  Typography,
  Paper
} from '@mui/material';
import { DateRange, FilterList, Refresh } from '@mui/icons-material';

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onApplyFilter: () => void;
  onResetFilter: () => void;
  loading?: boolean;
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApplyFilter,
  onResetFilter,
  loading = false
}: DateRangeFilterProps) {
  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    onStartDateChange(start);
    onEndDateChange(end);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <DateRange sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          Filtros de Fecha
        </Typography>
      </Box>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Fecha Inicial"
            type="date"
            value={formatDate(startDate)}
            onChange={(e) => onStartDateChange(e.target.value ? new Date(e.target.value) : null)}
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Fecha Final"
            type="date"
            value={formatDate(endDate)}
            onChange={(e) => onEndDateChange(e.target.value ? new Date(e.target.value) : null)}
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Rápido:
            </Typography>
            <Chip
              label="Últimos 7 días"
              onClick={() => handleQuickSelect(7)}
              variant="outlined"
              size="small"
              disabled={loading}
            />
            <Chip
              label="Últimos 30 días"
              onClick={() => handleQuickSelect(30)}
              variant="outlined"
              size="small"
              disabled={loading}
            />
            <Chip
              label="Últimos 90 días"
              onClick={() => handleQuickSelect(90)}
              variant="outlined"
              size="small"
              disabled={loading}
            />
            <Chip
              label="Último año"
              onClick={() => handleQuickSelect(365)}
              variant="outlined"
              size="small"
              disabled={loading}
            />
          </Box>
        </Grid>
      </Grid>
      
      <Box display="flex" gap={2} mt={2}>
        <Button
          variant="contained"
          startIcon={<FilterList />}
          onClick={onApplyFilter}
          disabled={loading || !startDate || !endDate}
        >
          {loading ? 'Aplicando...' : 'Aplicar Filtro'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={onResetFilter}
          disabled={loading}
        >
          Restablecer
        </Button>
      </Box>
    </Paper>
  );
}
