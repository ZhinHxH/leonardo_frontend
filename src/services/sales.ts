import api from './api';

export interface SaleItem {
  product_id: number;
  quantity: number;
  unit_price?: number;
  discount_percentage?: number;
}

export interface MembershipItem {
  plan_id: number;
  customer_id: number;
  payment_method?: string;
}

export interface CreateSaleRequest {
  customer_id?: number;
  sale_type: 'product' | 'membership' | 'mixed';
  payment_method: string;
  amount_paid: number;
  discount_amount?: number;
  notes?: string;
  products?: SaleItem[];
  memberships?: MembershipItem[];
}

export interface Sale {
  id: number;
  sale_number: string;
  customer_id?: number;
  customer_name?: string;
  seller_id: number;
  seller_name: string;
  sale_type: 'product' | 'membership' | 'mixed';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  amount_paid: number;
  change_amount: number;
  is_reversed: boolean;
  can_be_reversed: boolean;
  created_at: string;
  notes?: string;
}

export interface SaleDetail extends Sale {
  product_items: Array<{
    id: number;
    product_name: string;
    product_sku?: string;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    line_total: number;
  }>;
  membership_items: Array<{
    id: number;
    plan_name: string;
    plan_price: number;
    duration_days: number;
    start_date: string;
    end_date: string;
  }>;
}

export interface SalesListResponse {
  sales: Sale[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ProductForSale {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  stock: number;
  unit_of_measure: string;
  category_name: string;
  is_available: boolean;
}

export interface PlanForSale {
  id: number;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  duration_days: number;
  is_active: boolean;
  is_popular?: boolean;
  includes_nutritionist?: boolean;
  includes_classes?: boolean;
}

export interface SalesSummary {
  total_sales: number;
  total_revenue: number;
  total_refunded: number;
  net_revenue: number;
  payment_methods: Array<{
    method: string;
    count: number;
    total: number;
  }>;
}

class SalesService {
  /**
   * Crea una nueva venta
   */
  async createSale(saleData: CreateSaleRequest): Promise<Sale> {
    try {
      const response = await api.post('/sales/', saleData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error creando venta');
    }
  }

  /**
   * Obtiene lista de ventas con filtros
   */
  async getSales(params: {
    date_from?: string;
    date_to?: string;
    status?: string;
    seller_id?: number;
    page?: number;
    per_page?: number;
  } = {}): Promise<SalesListResponse> {
    try {
      const response = await api.get('/sales/', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo ventas');
    }
  }

  /**
   * Obtiene detalles de una venta específica
   */
  async getSaleDetails(saleId: number): Promise<SaleDetail> {
    try {
      const response = await api.get(`/sales/${saleId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo detalles de venta');
    }
  }

  /**
   * Reversa una venta
   */
  async reverseSale(saleId: number, reason: string): Promise<boolean> {
    try {
      const response = await api.post(`/sales/${saleId}/reverse`, {
        reason
      });
      return response.data.success || true;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error reversando venta');
    }
  }

  /**
   * Obtiene productos disponibles para venta
   */
  async getProductsForSale(search?: string): Promise<ProductForSale[]> {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/sales/products/available', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo productos');
    }
  }

  /**
   * Obtiene planes de membresía disponibles para venta
   */
  async getPlansForSale(): Promise<PlanForSale[]> {
    try {
      console.log('🔍 Obteniendo planes para venta...');
      const response = await api.get('/membership-plans/active');
      console.log('✅ Planes para venta obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo planes para venta:', error);
      if (error.response?.status === 401) {
        throw new Error('No estás autenticado. Por favor, inicia sesión.');
      } else if (error.response?.status === 403) {
        throw new Error('No tienes permisos para ver los planes de membresía.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('No se puede conectar con el servidor. Verifica que esté ejecutándose.');
      }
      throw new Error(error.response?.data?.detail || 'Error obteniendo planes');
    }
  }

  /**
   * Obtiene resumen de ventas
   */
  async getSalesSummary(params: {
    date_from?: string;
    date_to?: string;
  } = {}): Promise<SalesSummary> {
    try {
      const response = await api.get('/sales/summary/statistics', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo resumen');
    }
  }

  /**
   * Obtiene clientes para autocompletado
   */
  async getCustomers(search?: string): Promise<Array<{
    id: number;
    name: string;
    email: string;
    phone?: string;
    dni?: string;
  }>> {
    try {
      const params = search ? { search, role: 'member' } : { role: 'member' };
      const response = await api.get('/users', { params });
      // Adaptarse a la estructura de respuesta
      const users = response.data.users || response.data || [];
      return users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dni: user.dni
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo clientes');
    }
  }

  /**
   * Valida si un producto tiene stock suficiente
   */
  async validateStock(productId: number, quantity: number): Promise<boolean> {
    try {
      const response = await api.post('/sales/validate-stock', {
        product_id: productId,
        quantity
      });
      return response.data.available;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Calcula el total de una venta antes de procesarla
   */
  calculateSaleTotal(items: Array<{
    price: number;
    quantity: number;
    discount?: number;
  }>, discountAmount: number = 0): {
    subtotal: number;
    tax: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const itemDiscount = itemTotal * ((item.discount || 0) / 100);
      return sum + (itemTotal - itemDiscount);
    }, 0);

    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * 0.19; // IVA 19%
    const total = discountedSubtotal + tax;

    return {
      subtotal,
      tax,
      total
    };
  }

  /**
   * Formatea precio para mostrar
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  /**
   * Formatea fecha para mostrar
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtiene etiqueta de método de pago
   */
  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      'cash': 'Efectivo',
      'nequi': 'Nequi',
      'bancolombia': 'Bancolombia',
      'daviplata': 'Daviplata',
      'card': 'Tarjeta',
      'transfer': 'Transferencia'
    };
    return labels[method] || method;
  }

  /**
   * Obtiene etiqueta de estado de venta
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'completed': 'Completada',
      'cancelled': 'Cancelada',
      'refunded': 'Reembolsada'
    };
    return labels[status] || status;
  }

  /**
   * Obtiene color de estado para chips
   */
  getStatusColor(status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
    const colors: Record<string, any> = {
      'pending': 'warning',
      'completed': 'success',
      'cancelled': 'error',
      'refunded': 'info'
    };
    return colors[status] || 'default';
  }

  /**
   * Obtiene etiqueta de tipo de venta
   */
  getSaleTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'product': 'Productos',
      'membership': 'Membresía',
      'mixed': 'Mixta'
    };
    return labels[type] || type;
  }
}

// Instancia singleton
const salesService = new SalesService();
export default salesService;