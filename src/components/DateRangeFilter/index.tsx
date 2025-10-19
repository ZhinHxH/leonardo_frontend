import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Chip
} from '@mui/material';
import { CalendarToday, Refresh } from '@mui/icons-material';

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

  const quickFilters = [
    { label: 'Últimos 7 días', days: 7 },
    { label: 'Últimos 30 días', days: 30 },
    { label: 'Últimos 90 días', days: 90 },
    { label: 'Último año', days: 365 }
  ];

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <CalendarToday sx={{ mr: 1, color: 'white' }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          Filtros de Fecha
        </Typography>
      </Box>

      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={3}>
          <TextField
            label="Fecha Inicial"
            type="date"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => onStartDateChange(e.target.value ? new Date(e.target.value) : null)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,1)',
                }
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            label="Fecha Final"
            type="date"
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => onEndDateChange(e.target.value ? new Date(e.target.value) : null)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,1)',
                }
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Box display="flex" gap={1} flexWrap="wrap">
            {quickFilters.map((filter) => (
              <Chip
                key={filter.days}
                label={filter.label}
                onClick={() => handleQuickSelect(filter.days)}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  }
                }}
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={2}>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              onClick={onApplyFilter}
              disabled={loading || !startDate || !endDate}
              startIcon={<CalendarToday />}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                }
              }}
            >
              Aplicar
            </Button>
            <Button
              variant="outlined"
              onClick={onResetFilter}
              disabled={loading}
              startIcon={<Refresh />}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Reset
            </Button>
          </Box>
        </Grid>
      </Grid>

      {startDate && endDate && (
        <Box mt={2}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Período seleccionado: {startDate.toLocaleDateString('es-ES')} - {endDate.toLocaleDateString('es-ES')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
