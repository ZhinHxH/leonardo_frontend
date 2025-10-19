import { useEffect, useRef } from 'react';
import inventoryService, { Product } from '../services/inventory';
import { notificationService, NotificationType } from '../services/notificationService';
import { notificationSettingsService } from '../services/notificationSettings';

interface StockMonitoringOptions {
  checkInterval?: number; // Intervalo en milisegundos (default: 5 minutos)
  enableNotifications?: boolean;
  lowStockThreshold?: number; // Porcentaje del stock mínimo para considerar "bajo" (default: 1.2 = 120%)
}

export const useStockMonitoring = (options: StockMonitoringOptions = {}) => {
  const {
    checkInterval = 5 * 60 * 1000, // 5 minutos por defecto
    enableNotifications = true,
    lowStockThreshold = 1.2 // 120% del stock mínimo
  } = options;

  const lastCheckRef = useRef<Date>(new Date());
  const checkedProductsRef = useRef<Set<number>>(new Set());

  const checkLowStock = async () => {
    try {
      // Obtener todos los productos activos (manejar paginación si es necesario)
      let allProducts: any[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const result = await inventoryService.getProducts({
          status: 'active',
          per_page: 500, // Límite máximo del backend
          page: page
        });
        
        allProducts = allProducts.concat(result.products);
        hasMore = result.has_next;
        page++;
        
        // Limitar a máximo 3 páginas para evitar bucles infinitos
        if (page > 3) break;
      }

      const products = allProducts;

      // Obtener configuración de stock
      const settings = notificationSettingsService.getSettings();
      const stockSettings = settings.stockNotifications;
      
      // Filtrar productos con stock bajo usando la configuración
      const lowStockProducts = products.filter(product => {
        const isLowStock = product.current_stock <= (product.min_stock * stockSettings.lowStockThreshold);
        return isLowStock && product.current_stock >= 0; // Solo productos que no estén agotados
      });

      // Generar notificaciones para productos con stock bajo
      if (enableNotifications && stockSettings.enabled && lowStockProducts.length > 0) {
        for (const product of lowStockProducts) {
          // Evitar notificaciones duplicadas para el mismo producto
          if (!checkedProductsRef.current.has(product.id)) {
            notificationService.notifyLowStock(
              product.name,
              product.current_stock,
              product.min_stock
            );
            checkedProductsRef.current.add(product.id);
          }
        }
      }

      // Limpiar productos que ya no están en stock bajo
      const currentProductIds = new Set(products.map(p => p.id));
      const productsToRemove = Array.from(checkedProductsRef.current).filter(
        id => !currentProductIds.has(id) || 
        !products.find(p => p.id === id && p.current_stock <= (p.min_stock * lowStockThreshold))
      );
      
      productsToRemove.forEach(id => {
        checkedProductsRef.current.delete(id);
      });

      lastCheckRef.current = new Date();
      
    } catch (error) {
      // Error silencioso para no interrumpir la experiencia del usuario
    }
  };

  // Verificación inicial al montar el componente (solo si está habilitado)
  useEffect(() => {
    if (enableNotifications && checkInterval > 0) {
      checkLowStock();
    }
  }, [enableNotifications, checkInterval]);

  // Configurar verificación periódica
  useEffect(() => {
    if (!enableNotifications || checkInterval <= 0) return;

    const interval = setInterval(checkLowStock, checkInterval);
    
    return () => {
      clearInterval(interval);
    };
  }, [checkInterval, enableNotifications]);

  // Función manual para verificar stock
  const manualCheck = () => {
    return checkLowStock();
  };

  // Función para verificar un producto específico
  const checkProductStock = async (productId: number) => {
    try {
      const result = await inventoryService.getProducts({
        status: 'active',
        per_page: 1000
      });
      
      const product = result.products.find(p => p.id === productId);
      if (!product) return false;

      const isLowStock = product.current_stock <= (product.min_stock * lowStockThreshold);
      
      if (isLowStock && enableNotifications) {
        notificationService.notifyLowStock(
          product.name,
          product.current_stock,
          product.min_stock
        );
      }

      return isLowStock;
    } catch (error) {
      return false;
    }
  };

  return {
    manualCheck,
    checkProductStock,
    lastCheck: lastCheckRef.current
  };
};

// Hook específico para monitorear stock después de ventas
export const useStockMonitoringAfterSale = () => {
  const checkStockAfterSale = async (soldProducts: Array<{ productId: number; quantity: number }>) => {
    try {
      for (const soldProduct of soldProducts) {
        const result = await inventoryService.getProducts({
          status: 'active',
          per_page: 500,
          page: 1
        });
        
        const product = result.products.find(p => p.id === soldProduct.productId);
        if (!product) continue;

        // Verificar si el producto ahora está en stock bajo después de la venta
        const isLowStock = product.current_stock <= (product.min_stock * 1.2);
        
        if (isLowStock) {
          notificationService.notifyLowStock(
            product.name,
            product.current_stock,
            product.min_stock
          );
        }
      }
    } catch (error) {
      // Error silencioso
    }
  };

  return {
    checkStockAfterSale
  };
};
