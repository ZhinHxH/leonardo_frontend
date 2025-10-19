import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Snackbar,
  Paper,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  AttachMoney as AttachMoneyIcon,
  VolumeUp as VolumeUpIcon,
  Vibration as VibrationIcon,
  Restore as RestoreIcon,
  Save as SaveIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useNotificationSettings, NotificationSettings } from '../../services/notificationSettings';

const NotificationSettingsDashboard: React.FC = () => {
  const {
    settings,
    updateSettings,
    updateStockSettings,
    updateSalesSettings,
    updateMembershipSettings,
    updateSystemSettings,
    updateCashClosureSettings,
    updateLimits,
    resetToDefault
  } = useNotificationSettings();

  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | false>('general');

  const handleSectionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleReset = () => {
    resetToDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <NotificationsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" fontWeight={600}>
          Configuración de Notificaciones
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" mb={4}>
        Personaliza qué notificaciones recibir y cómo se comportan en tu sistema.
      </Typography>

      {/* Configuración General */}
      <Accordion 
        expanded={expandedSection === 'general'} 
        onChange={handleSectionChange('general')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">Configuración General</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Estado General
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enabled}
                        onChange={(e) => updateSettings({ enabled: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Habilitar notificaciones"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Activa o desactiva todas las notificaciones del sistema
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Alertas Sensoriales
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.soundEnabled}
                        onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <VolumeUpIcon sx={{ mr: 1, fontSize: 20 }} />
                        Sonido
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.vibrationEnabled}
                        onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <VibrationIcon sx={{ mr: 1, fontSize: 20 }} />
                        Vibración
                      </Box>
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Configuración de Stock */}
      <Accordion 
        expanded={expandedSection === 'stock'} 
        onChange={handleSectionChange('stock')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <InventoryIcon sx={{ mr: 2, color: 'warning.main' }} />
            <Typography variant="h6">Notificaciones de Stock</Typography>
            <Chip 
              label={settings.stockNotifications.enabled ? "Activo" : "Inactivo"} 
              color={settings.stockNotifications.enabled ? "success" : "default"}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Configuración de Stock
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.stockNotifications.enabled}
                        onChange={(e) => updateStockSettings({ enabled: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled}
                      />
                    }
                    label="Habilitar notificaciones de stock"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.stockNotifications.onlyAfterSales}
                        onChange={(e) => updateStockSettings({ onlyAfterSales: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled || !settings.stockNotifications.enabled}
                      />
                    }
                    label="Solo después de ventas"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Umbral de Stock Bajo
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Porcentaje del stock mínimo para considerar "bajo"
                  </Typography>
                  <Slider
                    value={settings.stockNotifications.lowStockThreshold}
                    onChange={(_, value) => updateStockSettings({ lowStockThreshold: value as number })}
                    min={1.0}
                    max={2.0}
                    step={0.1}
                    marks={[
                      { value: 1.0, label: '100%' },
                      { value: 1.5, label: '150%' },
                      { value: 2.0, label: '200%' }
                    ]}
                    disabled={!settings.enabled || !settings.stockNotifications.enabled}
                    sx={{ mt: 2 }}
                  />
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    Actual: {Math.round(settings.stockNotifications.lowStockThreshold * 100)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Configuración de Ventas */}
      <Accordion 
        expanded={expandedSection === 'sales'} 
        onChange={handleSectionChange('sales')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <ShoppingCartIcon sx={{ mr: 2, color: 'success.main' }} />
            <Typography variant="h6">Notificaciones de Ventas</Typography>
            <Chip 
              label={settings.salesNotifications.enabled ? "Activo" : "Inactivo"} 
              color={settings.salesNotifications.enabled ? "success" : "default"}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tipos de Notificaciones de Ventas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.salesNotifications.enabled}
                        onChange={(e) => updateSalesSettings({ enabled: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled}
                      />
                    }
                    label="Habilitar notificaciones de ventas"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.salesNotifications.highValueSales}
                        onChange={(e) => updateSalesSettings({ highValueSales: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled || !settings.salesNotifications.enabled}
                      />
                    }
                    label="Ventas de alto valor"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.salesNotifications.dailyTargets}
                        onChange={(e) => updateSalesSettings({ dailyTargets: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled || !settings.salesNotifications.enabled}
                      />
                    }
                    label="Metas diarias"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.salesNotifications.salesSummary}
                        onChange={(e) => updateSalesSettings({ salesSummary: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled || !settings.salesNotifications.enabled}
                      />
                    }
                    label="Resumen de ventas"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>

      {/* Configuración de Membresías */}
      <Accordion 
        expanded={expandedSection === 'membership'} 
        onChange={handleSectionChange('membership')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <PeopleIcon sx={{ mr: 2, color: 'info.main' }} />
            <Typography variant="h6">Notificaciones de Membresías</Typography>
            <Chip 
              label={settings.membershipNotifications.enabled ? "Activo" : "Inactivo"} 
              color={settings.membershipNotifications.enabled ? "success" : "default"}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tipos de Notificaciones de Membresías
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.membershipNotifications.enabled}
                        onChange={(e) => updateMembershipSettings({ enabled: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled}
                      />
                    }
                    label="Habilitar notificaciones de membresías"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.membershipNotifications.expiringSoon}
                        onChange={(e) => updateMembershipSettings({ expiringSoon: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled || !settings.membershipNotifications.enabled}
                      />
                    }
                    label="Próximas a expirar"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.membershipNotifications.expired}
                        onChange={(e) => updateMembershipSettings({ expired: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled || !settings.membershipNotifications.enabled}
                      />
                    }
                    label="Membresías expiradas"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.membershipNotifications.renewals}
                        onChange={(e) => updateMembershipSettings({ renewals: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled || !settings.membershipNotifications.enabled}
                      />
                    }
                    label="Renovaciones"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>

      {/* Configuración de Cierre de Caja */}
      <Accordion 
        expanded={expandedSection === 'cashClosure'} 
        onChange={handleSectionChange('cashClosure')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <AttachMoneyIcon sx={{ mr: 2, color: 'success.main' }} />
            <Typography variant="h6">Notificaciones de Cierre de Caja</Typography>
            <Chip 
              label={settings.cashClosureNotifications.enabled ? "Activo" : "Inactivo"} 
              color={settings.cashClosureNotifications.enabled ? "success" : "default"}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tipos de Notificaciones de Cierre de Caja
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.cashClosureNotifications.enabled}
                        onChange={(e) => updateCashClosureSettings({ enabled: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled}
                      />
                    }
                    label="Habilitar notificaciones de cierre de caja"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.cashClosureNotifications.dailyClosure}
                        onChange={(e) => updateCashClosureSettings({ dailyClosure: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled || !settings.cashClosureNotifications.enabled}
                      />
                    }
                    label="Cierre diario"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.cashClosureNotifications.discrepancies}
                        onChange={(e) => updateCashClosureSettings({ discrepancies: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled || !settings.cashClosureNotifications.enabled}
                      />
                    }
                    label="Discrepancias"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>

      {/* Límites y Configuración Avanzada */}
      <Accordion 
        expanded={expandedSection === 'limits'} 
        onChange={handleSectionChange('limits')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <SettingsIcon sx={{ mr: 2, color: 'secondary.main' }} />
            <Typography variant="h6">Límites y Configuración Avanzada</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Límites de Notificaciones
                  </Typography>
                  <TextField
                    label="Máximo de notificaciones"
                    type="number"
                    value={settings.limits.maxNotifications}
                    onChange={(e) => updateLimits({ maxNotifications: parseInt(e.target.value) || 50 })}
                    fullWidth
                    sx={{ mb: 2 }}
                    disabled={!settings.enabled}
                  />
                  <TextField
                    label="Días de vida de notificaciones"
                    type="number"
                    value={settings.limits.notificationLifetime}
                    onChange={(e) => updateLimits({ notificationLifetime: parseInt(e.target.value) || 7 })}
                    fullWidth
                    disabled={!settings.enabled}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Comportamiento
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.limits.autoMarkAsRead}
                        onChange={(e) => updateLimits({ autoMarkAsRead: e.target.checked })}
                        color="primary"
                        disabled={!settings.enabled}
                      />
                    }
                    label="Auto-marcar como leídas"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Las notificaciones se marcarán automáticamente como leídas después de un tiempo
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Botones de Acción */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
        <Button
          variant="outlined"
          startIcon={<RestoreIcon />}
          onClick={handleReset}
          color="secondary"
        >
          Restaurar por Defecto
        </Button>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            color="primary"
          >
            Guardar Configuración
          </Button>
        </Box>
      </Box>

      {/* Snackbar de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          icon={<CheckIcon />}
        >
          Configuración guardada exitosamente
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationSettingsDashboard;
