import api from './api';

export interface Product {
  id: number;
  name: string;
  description?: string;
  category_id?: number;
  barcode?: string;
  sku?: string;
  current_cost: number;
  selling_price: number;
  profit_margin?: number;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  unit_of_measure: string;
  weight_per_unit?: number;
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  is_taxable: boolean;
  tax_rate: number;
  created_at: string;
  updated_at?: string;
  last_restock_date?: string;
  last_sale_date?: string;
  // Campos calculados/relacionados
  is_low_stock?: boolean;
  category_name?: string;
  category_color?: string;
  // Campo de compatibilidad
  category?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  product_count: number;
  created_at: string;
  updated_at?: string;
}

export interface CostHistory {
  id: number;
  product_id: number;
  cost_per_unit: number;
  quantity_purchased: number;
  total_cost: number;
  supplier_name?: string;
  supplier_invoice?: string;
  purchase_date: string;
  notes?: string;
  created_at: string;
  // Campos relacionados
  product_name?: string;
  user_name?: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  user_id: number;
  movement_type: 'purchase' | 'sale' | 'adjustment' | 'return' | 'damage' | 'expired';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  stock_before: number;
  stock_after: number;
  reference_number?: string;
  supplier?: string;
  notes?: string;
  movement_date: string;
  created_at: string;
  // Campos relacionados
  product_name?: string;
  user_name?: string;
}

export interface InventorySummary {
  total_products: number;
  total_categories: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_inventory_value: number;
  total_inventory_cost?: number;
  estimated_profit?: number;
}

export interface RestockRequest {
  quantity: number;
  unit_cost: number;
  new_selling_price?: number;
  supplier_name: string;
  invoice_number?: string;
  notes?: string;
}

class InventoryService {
  private static instance: InventoryService;

  private constructor() {}

  public static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService();
    }
    return InventoryService.instance;
  }

  // Métodos para productos
  async getProducts(params?: {
    category_id?: number;
    status?: string;
    search?: string;
    include_costs?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<{
    products: Product[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  }> {
    try {
      const response = await api.get<{
        products: Product[];
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
      }>('/inventory/products', { params });
      
      // Mapear category_name a category para compatibilidad
      const products = response.data.products.map(product => ({
        ...product,
        category: product.category_name || product.category || 'Sin categoría'
      }));
      
      return {
        ...response.data,
        products
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo productos');
    }
  }

  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'profit_margin' | 'is_low_stock' | 'category_name' | 'category_color'>): Promise<Product> {
    try {
      const response = await api.post<Product>('/inventory/products', productData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error creando producto');
    }
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    try {
      const response = await api.put<Product>(`/inventory/products/${id}`, productData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error actualizando producto');
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      await api.delete(`/inventory/products/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error eliminando producto');
    }
  }

  async restockProduct(id: number, restockData: RestockRequest): Promise<Product> {
    try {
      const response = await api.post<Product>(`/inventory/products/${id}/restock`, restockData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error en restock');
    }
  }

  async getProductCostHistory(id: number): Promise<CostHistory[]> {
    try {
      const response = await api.get<CostHistory[]>(`/inventory/products/${id}/cost-history`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo historial de costos');
    }
  }

  // Métodos para categorías
  async getCategories(includeInactive: boolean = false): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>('/inventory/categories', {
        params: { include_inactive: includeInactive }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo categorías');
    }
  }

  async createCategory(categoryData: Omit<Category, 'id' | 'product_count' | 'created_at' | 'updated_at'>): Promise<Category> {
    try {
      const response = await api.post<Category>('/inventory/categories', categoryData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error creando categoría');
    }
  }

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category> {
    try {
      const response = await api.put<Category>(`/inventory/categories/${id}`, categoryData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error actualizando categoría');
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      await api.delete(`/inventory/categories/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error eliminando categoría');
    }
  }

  // Métodos para resúmenes y reportes
  async getInventorySummary(): Promise<InventorySummary> {
    try {
      const response = await api.get<InventorySummary>('/inventory/summary');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo resumen');
    }
  }

  async getInventoryAlerts(): Promise<{ low_stock_products: Product[]; alert_count: number }> {
    try {
      const response = await api.get<{ low_stock_products: Product[]; alert_count: number }>('/inventory/alerts');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo alertas');
    }
  }

  // Método para exportar
  async exportInventory(params: {
    format: 'excel' | 'csv' | 'pdf';
    include_costs?: boolean;
    category_ids?: number[];
    status_filter?: string;
  }): Promise<Blob> {
    try {
      const response = await api.post('/inventory/export', params, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error exportando inventario');
    }
  }

  // Nuevos métodos para reportes
  async getCompleteInventoryReport(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<{
    stats: InventorySummary;
    stock_movements: any[];
    category_values: any[];
    low_stock_items: any[];
    top_products: any[];
    trends: any[];
  }> {
    try {
      const response = await api.get('/inventory/reports/complete', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo reporte completo');
    }
  }

  async getStockMovementsReport(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<any[]> {
    try {
      const response = await api.get('/inventory/reports/stock-movements', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo movimientos de stock');
    }
  }

  async getCategoryValuesReport(): Promise<any[]> {
    try {
      const response = await api.get('/inventory/reports/category-values');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo valores por categoría');
    }
  }

  async getTopProductsReport(limit: number = 10): Promise<any[]> {
    try {
      const response = await api.get('/inventory/reports/top-products', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo productos más vendidos');
    }
  }

  async getInventoryTrendsReport(months: number = 6): Promise<any[]> {
    try {
      const response = await api.get('/inventory/reports/trends', {
        params: { months }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo tendencias del inventario');
    }
  }
}

export default InventoryService.getInstance();
