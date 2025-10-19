import api from './api';

// Interfaces para los datos de reportes
export interface InventoryStats {
  total_products: number;
  total_categories: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_inventory_value: number;
  total_inventory_cost?: number;
  estimated_profit?: number;
}

export interface StockMovement {
  date: string;
  purchases: number;
  sales: number;
  adjustments: number;
  net_movement: number;
}

export interface CategoryValue {
  category: string;
  value: number;
  percentage: number;
  products: number;
}

export interface LowStockItem {
  product: string;
  current_stock: number;
  min_stock: number;
  category: string;
  value: number;
  status: 'low' | 'critical' | 'out';
}

export interface TopProduct {
  product: string;
  sales: number;
  revenue: number;
  profit: number;
  margin: number;
}

export interface InventoryTrend {
  month: string;
  total_value: number;
  movements: number;
  growth: number;
}

export interface CompleteInventoryReport {
  stats: InventoryStats;
  stock_movements: StockMovement[];
  category_values: CategoryValue[];
  low_stock_items: LowStockItem[];
  top_products: TopProduct[];
  trends: InventoryTrend[];
}

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  categories?: number[];
  stock_status?: 'all' | 'low' | 'out' | 'normal';
  price_range?: { min: number; max: number };
}

class InventoryReportsService {
  private static instance: InventoryReportsService;

  private constructor() {}

  public static getInstance(): InventoryReportsService {
    if (!InventoryReportsService.instance) {
      InventoryReportsService.instance = new InventoryReportsService();
    }
    return InventoryReportsService.instance;
  }

  /**
   * Obtiene reporte completo de inventario
   */
  async getCompleteReport(filters: ReportFilters = {}): Promise<CompleteInventoryReport> {
    try {
      const response = await api.get<CompleteInventoryReport>('/inventory/reports/complete', {
        params: {
          date_from: filters.date_from,
          date_to: filters.date_to
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo reporte completo de inventario');
    }
  }

  /**
   * Obtiene movimientos de stock para reportes
   */
  async getStockMovements(filters: ReportFilters = {}): Promise<StockMovement[]> {
    try {
      const response = await api.get<StockMovement[]>('/inventory/reports/stock-movements', {
        params: {
          date_from: filters.date_from,
          date_to: filters.date_to
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo movimientos de stock');
    }
  }

  /**
   * Obtiene valores por categoría
   */
  async getCategoryValues(): Promise<CategoryValue[]> {
    try {
      const response = await api.get<CategoryValue[]>('/inventory/reports/category-values');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo valores por categoría');
    }
  }

  /**
   * Obtiene productos más vendidos
   */
  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    try {
      const response = await api.get<TopProduct[]>('/inventory/reports/top-products', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo productos más vendidos');
    }
  }

  /**
   * Obtiene tendencias del inventario
   */
  async getInventoryTrends(months: number = 6): Promise<InventoryTrend[]> {
    try {
      const response = await api.get<InventoryTrend[]>('/inventory/reports/trends', {
        params: { months }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo tendencias del inventario');
    }
  }

  /**
   * Obtiene alertas de inventario
   */
  async getInventoryAlerts(): Promise<{
    low_stock_products: any[];
    alert_count: number;
  }> {
    try {
      const response = await api.get('/inventory/alerts');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo alertas de inventario');
    }
  }

  /**
   * Obtiene resumen del inventario
   */
  async getInventorySummary(): Promise<InventoryStats> {
    try {
      const response = await api.get<InventoryStats>('/inventory/summary');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo resumen del inventario');
    }
  }

  /**
   * Exporta reporte a PDF
   */
  async exportToPDF(filters: ReportFilters = {}): Promise<Blob> {
    try {
      const response = await api.get('/inventory/reports/export/pdf', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error exportando reporte a PDF');
    }
  }

  /**
   * Exporta reporte a Excel
   */
  async exportToExcel(filters: ReportFilters = {}): Promise<Blob> {
    try {
      const response = await api.get('/inventory/reports/export/excel', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error exportando reporte a Excel');
    }
  }

  /**
   * Exporta reporte a CSV
   */
  async exportToCSV(filters: ReportFilters = {}): Promise<Blob> {
    try {
      const response = await api.get('/inventory/reports/export/csv', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error exportando reporte a CSV');
    }
  }

  /**
   * Formatea fechas para la API
   */
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Valida filtros de reporte
   */
  validateFilters(filters: ReportFilters): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (filters.date_from && filters.date_to) {
      const fromDate = new Date(filters.date_from);
      const toDate = new Date(filters.date_to);
      
      if (fromDate > toDate) {
        errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    if (filters.price_range) {
      if (filters.price_range.min < 0) {
        errors.push('El precio mínimo no puede ser negativo');
      }
      if (filters.price_range.max < filters.price_range.min) {
        errors.push('El precio máximo debe ser mayor al mínimo');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default InventoryReportsService.getInstance();
