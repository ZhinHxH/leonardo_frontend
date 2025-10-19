# Sistema de Notificaciones

## Descripción General

El sistema de notificaciones implementa un patrón Factory/Abstracto que permite generar notificaciones automáticas para diferentes eventos del sistema, con enfoque especial en el monitoreo de stock bajo.

## Características Principales

### 🔔 Componente de Notificaciones
- **Icono de campana**: Muestra estado visual (con/sin notificaciones)
- **Burbuja roja**: Contador de notificaciones no leídas
- **Lógica +99**: Cuando hay más de 99 notificaciones, muestra "+99"
- **Interfaz centralizada**: Panel desplegable con todas las notificaciones

### 🏭 Patrón Factory/Abstracto
- **NotificationHandler**: Clase abstracta para diferentes tipos de notificaciones
- **LowStockNotificationHandler**: Maneja notificaciones de stock bajo
- **SaleCompletedNotificationHandler**: Maneja notificaciones de ventas
- **NotificationFactory**: Factory para crear notificaciones según el tipo

### 📦 Monitoreo de Stock
- **Verificación automática**: Cada 2 minutos en la página de inventario
- **Verificación post-venta**: Después de cada venta en el POS
- **Umbral configurable**: 120% del stock mínimo por defecto
- **Notificaciones inteligentes**: Evita duplicados

## Estructura de Archivos

```
Frontend/src/
├── services/
│   └── notificationService.ts          # Servicio principal y factory
├── components/
│   ├── NotificationBell/
│   │   └── index.tsx                  # Componente de notificaciones
│   └── Navbar/
│       └── index.tsx                  # Navbar actualizado
├── hooks/
│   └── useStockMonitoring.ts         # Hooks para monitoreo de stock
└── pages/
    ├── inventory/index.tsx            # Integración en inventario
    └── sales/pos.tsx                 # Integración en POS
```

## Tipos de Notificaciones

### 1. Stock Bajo (LOW_STOCK)
- **Trigger**: Cuando `current_stock <= (min_stock * 1.2)`
- **Prioridad**: URGENT (stock = 0) o HIGH (stock bajo)
- **Mensaje**: "El producto 'X' tiene stock bajo (Y unidades). Stock mínimo: Z"

### 2. Venta Completada (SALE_COMPLETED)
- **Trigger**: Después de procesar una venta
- **Prioridad**: MEDIUM
- **Mensaje**: "Venta realizada por $X con Y productos"

### 3. Membresía por Expirar (MEMBERSHIP_EXPIRING)
- **Trigger**: Cuando una membresía está próxima a expirar
- **Prioridad**: MEDIUM
- **Mensaje**: "La membresía de X expira en Y días"

### 4. Cierre de Caja (CASH_CLOSURE)
- **Trigger**: Al realizar cierre de caja
- **Prioridad**: MEDIUM
- **Mensaje**: "Cierre de caja: $X total, Y ventas"

### 5. Alerta del Sistema (SYSTEM_ALERT)
- **Trigger**: Eventos críticos del sistema
- **Prioridad**: URGENT
- **Mensaje**: Mensaje personalizado según el evento

## Uso del Sistema

### Hook Principal
```typescript
import { useNotifications } from '../services/notificationService';

const { notifications, unreadCount, markAsRead, addNotification } = useNotifications();
```

### Monitoreo de Stock
```typescript
import { useStockMonitoring } from '../hooks/useStockMonitoring';

const { manualCheck } = useStockMonitoring({
  checkInterval: 2 * 60 * 1000, // 2 minutos
  enableNotifications: true,
  lowStockThreshold: 1.2 // 120% del stock mínimo
});
```

### Monitoreo Post-Venta
```typescript
import { useStockMonitoringAfterSale } from '../hooks/useStockMonitoring';

const { checkStockAfterSale } = useStockMonitoringAfterSale();

// Después de una venta
await checkStockAfterSale([
  { productId: 1, quantity: 2 },
  { productId: 3, quantity: 1 }
]);
```

## Configuración

### Umbrales de Stock
- **Umbral por defecto**: 120% del stock mínimo
- **Configurable**: A través del hook `useStockMonitoring`
- **Verificación**: Cada 2 minutos en inventario, inmediata post-venta

### Persistencia
- **LocalStorage**: Las notificaciones se guardan automáticamente
- **Recuperación**: Se cargan al inicializar la aplicación
- **Limpieza**: Opción de limpiar notificaciones leídas

## Interfaz de Usuario

### Navbar
- ✅ **Hora eliminada**: Ya no se muestra la hora actual
- ✅ **Tema oculto**: Icono de cambio de tema removido
- ✅ **Notificaciones centralizadas**: Componente NotificationBell integrado

### Panel de Notificaciones
- **Header**: Título y botones de acción
- **Sección no leídas**: Notificaciones pendientes con borde azul
- **Sección leídas**: Notificaciones ya vistas (opacidad reducida)
- **Acciones**: Marcar como leída, eliminar, limpiar todas
- **Estado vacío**: Mensaje cuando no hay notificaciones

## Extensibilidad

### Agregar Nuevos Tipos
1. Crear nuevo handler extendiendo `NotificationHandler`
2. Agregar el tipo a `NotificationType` enum
3. Registrar el handler en `NotificationFactory`
4. Implementar lógica de detección en el sistema

### Ejemplo de Nuevo Handler
```typescript
export class NewEventNotificationHandler extends NotificationHandler {
  canHandle(type: NotificationType): boolean {
    return type === NotificationType.NEW_EVENT;
  }

  createNotification(data: any): Notification {
    return {
      id: `new-event-${Date.now()}`,
      type: NotificationType.NEW_EVENT,
      title: 'Nuevo Evento',
      message: data.message,
      timestamp: new Date(),
      read: false,
      priority: NotificationPriority.MEDIUM
    };
  }
}
```

## Beneficios

1. **Automatización**: Monitoreo automático sin intervención manual
2. **Escalabilidad**: Fácil agregar nuevos tipos de notificaciones
3. **UX Mejorada**: Interfaz centralizada y intuitiva
4. **Persistencia**: Notificaciones se mantienen entre sesiones
5. **Performance**: Verificación eficiente con debounce y cache
6. **Flexibilidad**: Configuración granular de umbrales y intervalos

## Próximas Mejoras

- [ ] Notificaciones push del navegador
- [ ] Sonidos de notificación
- [ ] Filtros por tipo de notificación
- [ ] Exportación de notificaciones
- [ ] Integración con email/SMS
- [ ] Dashboard de métricas de notificaciones
