import React from 'react';
import { notificationSettingsService } from './notificationSettings';

// Tipos de notificaciones
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
}

export enum NotificationType {
  LOW_STOCK = 'LOW_STOCK',
  SALE_COMPLETED = 'SALE_COMPLETED',
  MEMBERSHIP_EXPIRING = 'MEMBERSHIP_EXPIRING',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  CASH_CLOSURE = 'CASH_CLOSURE'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Clase abstracta para diferentes tipos de notificaciones
export abstract class NotificationHandler {
  abstract canHandle(type: NotificationType): boolean;
  abstract createNotification(data: any): Notification;
}

// Handler para notificaciones de stock bajo
export class LowStockNotificationHandler extends NotificationHandler {
  canHandle(type: NotificationType): boolean {
    return type === NotificationType.LOW_STOCK;
  }

  createNotification(data: { productName: string; currentStock: number; minStock: number }): Notification {
    return {
      id: `low-stock-${Date.now()}-${Math.random()}`,
      type: NotificationType.LOW_STOCK,
      title: 'Stock Bajo',
      message: `El producto "${data.productName}" tiene stock bajo (${data.currentStock} unidades). Stock mínimo: ${data.minStock}`,
      timestamp: new Date(),
      read: false,
      priority: data.currentStock <= 0 ? NotificationPriority.URGENT : NotificationPriority.HIGH,
      metadata: {
        productName: data.productName,
        currentStock: data.currentStock,
        minStock: data.minStock
      }
    };
  }
}

// Handler para notificaciones de ventas completadas
export class SaleCompletedNotificationHandler extends NotificationHandler {
  canHandle(type: NotificationType): boolean {
    return type === NotificationType.SALE_COMPLETED;
  }

  createNotification(data: { total: number; items: number }): Notification {
    return {
      id: `sale-${Date.now()}-${Math.random()}`,
      type: NotificationType.SALE_COMPLETED,
      title: 'Venta Completada',
      message: `Venta realizada por $${data.total.toLocaleString()} con ${data.items} productos`,
      timestamp: new Date(),
      read: false,
      priority: NotificationPriority.MEDIUM,
      metadata: {
        total: data.total,
        items: data.items
      }
    };
  }
}

// Factory para crear notificaciones
export class NotificationFactory {
  private handlers: NotificationHandler[] = [];

  constructor() {
    this.handlers = [
      new LowStockNotificationHandler(),
      new SaleCompletedNotificationHandler()
    ];
  }

  createNotification(type: NotificationType, data: any): Notification | null {
    const handler = this.handlers.find(h => h.canHandle(type));
    if (!handler) {
      console.warn(`No handler found for notification type: ${type}`);
      return null;
    }
    return handler.createNotification(data);
  }
}

// Servicio principal de notificaciones
class NotificationService {
  private notifications: Notification[] = [];
  private factory: NotificationFactory;
  private listeners: Array<(notifications: Notification[]) => void> = [];

  constructor() {
    this.factory = new NotificationFactory();
    this.loadNotifications();
  }

  // Cargar notificaciones desde localStorage
  private loadNotifications(): void {
    try {
      // Verificar que estamos en el lado del cliente
      if (typeof window === 'undefined') {
        this.notifications = [];
        return;
      }
      
      const saved = localStorage.getItem('notifications');
      if (saved) {
        this.notifications = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
    }
  }

  // Guardar notificaciones en localStorage
  private saveNotifications(): void {
    try {
      // Verificar que estamos en el lado del cliente
      if (typeof window === 'undefined') {
        return;
      }
      
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Suscribirse a cambios en las notificaciones
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar a los listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Obtener todas las notificaciones
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Obtener notificaciones no leídas
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Obtener cantidad de notificaciones no leídas
  getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }

  // Agregar nueva notificación
  addNotification(type: NotificationType, data: any): Notification | null {
    const notification = this.factory.createNotification(type, data);
    if (notification) {
      this.notifications.unshift(notification); // Agregar al inicio
      this.saveNotifications();
      this.notifyListeners();
    }
    return notification;
  }

  // Marcar notificación como leída
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Marcar todas como leídas
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Eliminar notificación
  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Eliminar todas las notificaciones
  clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  // Eliminar notificaciones leídas
  clearReadNotifications(): void {
    this.notifications = this.notifications.filter(n => !n.read);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Métodos específicos para diferentes tipos de notificaciones
  
  // Notificar stock bajo
  notifyLowStock(productName: string, currentStock: number, minStock: number): void {
    // Verificar si las notificaciones de stock están habilitadas
    const settings = notificationSettingsService.getSettings();
    if (!settings.enabled || !settings.stockNotifications.enabled) {
      return;
    }
    
    this.addNotification(NotificationType.LOW_STOCK, {
      productName,
      currentStock,
      minStock
    });
  }

  // Notificar venta completada
  notifySaleCompleted(total: number, items: number): void {
    // Verificar si las notificaciones de ventas están habilitadas
    const settings = notificationSettingsService.getSettings();
    if (!settings.enabled || !settings.salesNotifications.enabled) {
      return;
    }
    
    this.addNotification(NotificationType.SALE_COMPLETED, {
      total,
      items
    });
  }

  // Notificar membresía por expirar
  notifyMembershipExpiring(memberName: string, daysLeft: number): void {
    // Verificar si las notificaciones de membresías están habilitadas
    const settings = notificationSettingsService.getSettings();
    if (!settings.enabled || !settings.membershipNotifications.enabled) {
      return;
    }
    
    this.addNotification(NotificationType.MEMBERSHIP_EXPIRING, {
      memberName,
      daysLeft
    });
  }

  // Notificar cierre de caja
  notifyCashClosure(total: number, sales: number): void {
    // Verificar si las notificaciones de cierre de caja están habilitadas
    const settings = notificationSettingsService.getSettings();
    if (!settings.enabled || !settings.cashClosureNotifications.enabled) {
      return;
    }
    
    this.addNotification(NotificationType.CASH_CLOSURE, {
      total,
      sales
    });
  }
}

// Instancia singleton del servicio
export const notificationService = new NotificationService();

// Hook personalizado para usar el servicio de notificaciones
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    // Marcar que estamos en el lado del cliente
    setIsClient(true);
    
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(notificationService.getUnreadCount());
    });

    // Cargar notificaciones iniciales solo en el cliente
    const initialNotifications = notificationService.getNotifications();
    const initialUnreadCount = notificationService.getUnreadCount();
    
    setNotifications(initialNotifications);
    setUnreadCount(initialUnreadCount);

    return unsubscribe;
  }, []);

  // Retornar valores vacíos durante SSR
  if (!isClient) {
    return {
      notifications: [],
      unreadCount: 0,
      markAsRead: () => {},
      markAllAsRead: () => {},
      removeNotification: () => {},
      clearAll: () => {},
      clearRead: () => {},
      addNotification: () => null
    };
  }

  return {
    notifications,
    unreadCount,
    markAsRead: (id: string) => notificationService.markAsRead(id),
    markAllAsRead: () => notificationService.markAllAsRead(),
    removeNotification: (id: string) => notificationService.removeNotification(id),
    clearAll: () => notificationService.clearAllNotifications(),
    clearRead: () => notificationService.clearReadNotifications(),
    addNotification: (type: NotificationType, data: any) => notificationService.addNotification(type, data)
  };
};

