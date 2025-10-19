import React from 'react';

// Tipos de configuración
export interface NotificationSettings {
  // Configuración general
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  
  // Configuración de stock
  stockNotifications: {
    enabled: boolean;
    lowStockThreshold: number; // 1.2 = 120% del stock mínimo
    checkInterval: number; // minutos
    onlyAfterSales: boolean; // Solo después de ventas
  };
  
  // Configuración de ventas
  salesNotifications: {
    enabled: boolean;
    highValueSales: boolean; // Ventas de alto valor
    dailyTargets: boolean; // Metas diarias
    salesSummary: boolean; // Resumen de ventas
  };
  
  // Configuración de membresías
  membershipNotifications: {
    enabled: boolean;
    expiringSoon: boolean; // Próximas a expirar
    expired: boolean; // Expiradas
    renewals: boolean; // Renovaciones
  };
  
  // Configuración del sistema
  systemNotifications: {
    enabled: boolean;
    errors: boolean; // Errores del sistema
    maintenance: boolean; // Mantenimiento
    updates: boolean; // Actualizaciones
  };
  
  // Configuración de cierre de caja
  cashClosureNotifications: {
    enabled: boolean;
    dailyClosure: boolean; // Cierre diario
    discrepancies: boolean; // Discrepancias
  };
  
  // Configuración de límites
  limits: {
    maxNotifications: number; // Máximo de notificaciones
    autoMarkAsRead: boolean; // Auto-marcar como leídas
    notificationLifetime: number; // Días de vida de notificaciones
  };
}

// Configuración por defecto
export const defaultSettings: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  vibrationEnabled: false,
  
  stockNotifications: {
    enabled: true,
    lowStockThreshold: 1.2,
    checkInterval: 0, // Solo manual
    onlyAfterSales: true
  },
  
  salesNotifications: {
    enabled: true,
    highValueSales: true,
    dailyTargets: false,
    salesSummary: false
  },
  
  membershipNotifications: {
    enabled: true,
    expiringSoon: true,
    expired: true,
    renewals: false
  },
  
  systemNotifications: {
    enabled: true,
    errors: true,
    maintenance: false,
    updates: false
  },
  
  cashClosureNotifications: {
    enabled: true,
    dailyClosure: true,
    discrepancies: true
  },
  
  limits: {
    maxNotifications: 50,
    autoMarkAsRead: false,
    notificationLifetime: 7
  }
};

// Servicio de configuraciones
class NotificationSettingsService {
  private settings: NotificationSettings;
  private listeners: Array<(settings: NotificationSettings) => void> = [];

  constructor() {
    this.settings = this.loadSettings();
  }

  // Cargar configuraciones desde localStorage
  private loadSettings(): NotificationSettings {
    try {
      if (typeof window === 'undefined') {
        return defaultSettings;
      }
      
      const saved = localStorage.getItem('notificationSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Fusionar con configuración por defecto para nuevas propiedades
        return { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
    
    return defaultSettings;
  }

  // Guardar configuraciones en localStorage
  private saveSettings(): void {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      
      localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // Notificar a los listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.settings }));
  }

  // Obtener configuraciones actuales
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Actualizar configuraciones
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.notifyListeners();
  }

  // Actualizar configuración específica
  updateStockSettings(stockSettings: Partial<NotificationSettings['stockNotifications']>): void {
    this.settings.stockNotifications = { ...this.settings.stockNotifications, ...stockSettings };
    this.saveSettings();
    this.notifyListeners();
  }

  updateSalesSettings(salesSettings: Partial<NotificationSettings['salesNotifications']>): void {
    this.settings.salesNotifications = { ...this.settings.salesNotifications, ...salesSettings };
    this.saveSettings();
    this.notifyListeners();
  }

  updateMembershipSettings(membershipSettings: Partial<NotificationSettings['membershipNotifications']>): void {
    this.settings.membershipNotifications = { ...this.settings.membershipNotifications, ...membershipSettings };
    this.saveSettings();
    this.notifyListeners();
  }

  updateSystemSettings(systemSettings: Partial<NotificationSettings['systemNotifications']>): void {
    this.settings.systemNotifications = { ...this.settings.systemNotifications, ...systemSettings };
    this.saveSettings();
    this.notifyListeners();
  }

  updateCashClosureSettings(cashClosureSettings: Partial<NotificationSettings['cashClosureNotifications']>): void {
    this.settings.cashClosureNotifications = { ...this.settings.cashClosureNotifications, ...cashClosureSettings };
    this.saveSettings();
    this.notifyListeners();
  }

  updateLimits(limits: Partial<NotificationSettings['limits']>): void {
    this.settings.limits = { ...this.settings.limits, ...limits };
    this.saveSettings();
    this.notifyListeners();
  }

  // Suscribirse a cambios
  subscribe(listener: (settings: NotificationSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Resetear a configuración por defecto
  resetToDefault(): void {
    this.settings = { ...defaultSettings };
    this.saveSettings();
    this.notifyListeners();
  }

  // Verificar si un tipo de notificación está habilitado
  isNotificationTypeEnabled(type: keyof NotificationSettings): boolean {
    if (type === 'enabled') return this.settings.enabled;
    if (type === 'stockNotifications') return this.settings.stockNotifications.enabled;
    if (type === 'salesNotifications') return this.settings.salesNotifications.enabled;
    if (type === 'membershipNotifications') return this.settings.membershipNotifications.enabled;
    if (type === 'systemNotifications') return this.settings.systemNotifications.enabled;
    if (type === 'cashClosureNotifications') return this.settings.cashClosureNotifications.enabled;
    return false;
  }

  // Verificar si las notificaciones están habilitadas globalmente
  isGloballyEnabled(): boolean {
    return this.settings.enabled;
  }

  // Obtener configuración de stock
  getStockSettings(): NotificationSettings['stockNotifications'] {
    return { ...this.settings.stockNotifications };
  }

  // Obtener configuración de ventas
  getSalesSettings(): NotificationSettings['salesNotifications'] {
    return { ...this.settings.salesNotifications };
  }

  // Obtener configuración de membresías
  getMembershipSettings(): NotificationSettings['membershipNotifications'] {
    return { ...this.settings.membershipNotifications };
  }

  // Obtener configuración del sistema
  getSystemSettings(): NotificationSettings['systemNotifications'] {
    return { ...this.settings.systemNotifications };
  }

  // Obtener configuración de cierre de caja
  getCashClosureSettings(): NotificationSettings['cashClosureNotifications'] {
    return { ...this.settings.cashClosureNotifications };
  }

  // Obtener límites
  getLimits(): NotificationSettings['limits'] {
    return { ...this.settings.limits };
  }
}

// Instancia singleton
export const notificationSettingsService = new NotificationSettingsService();

// Hook personalizado para usar las configuraciones
export const useNotificationSettings = () => {
  const [settings, setSettings] = React.useState<NotificationSettings>(defaultSettings);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    
    const unsubscribe = notificationSettingsService.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    // Cargar configuraciones iniciales
    const initialSettings = notificationSettingsService.getSettings();
    setSettings(initialSettings);

    return unsubscribe;
  }, []);

  // Retornar configuración por defecto durante SSR
  if (!isClient) {
    return {
      settings: defaultSettings,
      updateSettings: () => {},
      updateStockSettings: () => {},
      updateSalesSettings: () => {},
      updateMembershipSettings: () => {},
      updateSystemSettings: () => {},
      updateCashClosureSettings: () => {},
      updateLimits: () => {},
      resetToDefault: () => {},
      isNotificationTypeEnabled: () => false,
      isGloballyEnabled: () => true
    };
  }

  return {
    settings,
    updateSettings: (newSettings: Partial<NotificationSettings>) => 
      notificationSettingsService.updateSettings(newSettings),
    updateStockSettings: (stockSettings: Partial<NotificationSettings['stockNotifications']>) => 
      notificationSettingsService.updateStockSettings(stockSettings),
    updateSalesSettings: (salesSettings: Partial<NotificationSettings['salesNotifications']>) => 
      notificationSettingsService.updateSalesSettings(salesSettings),
    updateMembershipSettings: (membershipSettings: Partial<NotificationSettings['membershipNotifications']>) => 
      notificationSettingsService.updateMembershipSettings(membershipSettings),
    updateSystemSettings: (systemSettings: Partial<NotificationSettings['systemNotifications']>) => 
      notificationSettingsService.updateSystemSettings(systemSettings),
    updateCashClosureSettings: (cashClosureSettings: Partial<NotificationSettings['cashClosureNotifications']>) => 
      notificationSettingsService.updateCashClosureSettings(cashClosureSettings),
    updateLimits: (limits: Partial<NotificationSettings['limits']>) => 
      notificationSettingsService.updateLimits(limits),
    resetToDefault: () => notificationSettingsService.resetToDefault(),
    isNotificationTypeEnabled: (type: keyof NotificationSettings) => 
      notificationSettingsService.isNotificationTypeEnabled(type),
    isGloballyEnabled: () => notificationSettingsService.isGloballyEnabled()
  };
};
