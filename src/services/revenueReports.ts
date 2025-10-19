import { api } from './api';

export interface RevenueStats {
  total_revenue: number;
  daily_revenue: number;
  monthly_revenue: number;
  revenue_by_plan: Array<{ plan: string; revenue: number }>;
  payment_method_distribution: Array<{ method: string; amount: number; percentage: number }>;
  daily_revenue_trend: Array<{ date: string; revenue: number }>;
  membership_sales: Array<{ membership_type: string; sales: number }>;
  product_sales: Array<{ product_category: string; sales: number }>;
}

export interface RevenueFilters {
  date_from?: string;
  date_to?: string;
  seller_id?: number;
  payment_method?: string;
  membership_plan?: string;
}

export interface RevenueByPlan {
  plan_name: string;
  total_revenue: number;
  sales_count: number;
  average_ticket: number;
  percentage: number;
}

export interface PaymentMethodStats {
  method: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface DailyRevenueTrend {
  date: string;
  revenue: number;
  transactions: number;
  average_ticket: number;
}

export interface RevenueReport {
  summary: {
    total_revenue: number;
    daily_average: number;
    monthly_revenue: number;
    total_transactions: number;
    average_ticket: number;
    growth_percentage: number;
  };
  revenue_by_plan: RevenueByPlan[];
  payment_methods: PaymentMethodStats[];
  daily_trend: DailyRevenueTrend[];
  top_products: Array<{
    product_name: string;
    category: string;
    sales_count: number;
    revenue: number;
  }>;
  membership_analytics: Array<{
    plan_name: string;
    new_memberships: number;
    renewals: number;
    revenue: number;
  }>;
}

class RevenueReportsService {
  private baseUrl = '/reports/revenue';

  /**
   * Obtiene reporte completo de ingresos
   */
  async getRevenueReport(filters: RevenueFilters): Promise<RevenueReport> {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.seller_id) params.append('seller_id', filters.seller_id.toString());
      if (filters.payment_method) params.append('payment_method', filters.payment_method);
      if (filters.membership_plan) params.append('membership_plan', filters.membership_plan);

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo reporte de ingresos:', error);
      throw new Error(error.response?.data?.detail || 'Error al obtener reporte de ingresos');
    }
  }

  /**
   * Obtiene ingresos por plan de membresía
   */
  async getRevenueByPlan(filters: RevenueFilters): Promise<RevenueByPlan[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`${this.baseUrl}/by-plan?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo ingresos por plan:', error);
      throw new Error(error.response?.data?.detail || 'Error al obtener ingresos por plan');
    }
  }

  /**
   * Obtiene distribución por método de pago
   */
  async getPaymentMethodsDistribution(filters: RevenueFilters): Promise<PaymentMethodStats[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`${this.baseUrl}/payment-methods?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo distribución de métodos de pago:', error);
      throw new Error(error.response?.data?.detail || 'Error al obtener distribución de métodos de pago');
    }
  }

  /**
   * Obtiene tendencia diaria de ingresos
   */
  async getDailyRevenueTrend(filters: RevenueFilters): Promise<DailyRevenueTrend[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`${this.baseUrl}/daily-trend?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo tendencia diaria:', error);
      throw new Error(error.response?.data?.detail || 'Error al obtener tendencia diaria');
    }
  }

  /**
   * Obtiene productos más vendidos
   */
  async getTopProducts(filters: RevenueFilters, limit: number = 10): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      params.append('limit', limit.toString());

      const response = await api.get(`${this.baseUrl}/top-products?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo productos más vendidos:', error);
      throw new Error(error.response?.data?.detail || 'Error al obtener productos más vendidos');
    }
  }

  /**
   * Obtiene análisis de membresías
   */
  async getMembershipAnalytics(filters: RevenueFilters): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`${this.baseUrl}/membership-analytics?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo análisis de membresías:', error);
      throw new Error(error.response?.data?.detail || 'Error al obtener análisis de membresías');
    }
  }

  /**
   * Exporta reporte a PDF
   */
  async exportToPDF(filters: RevenueFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.seller_id) params.append('seller_id', filters.seller_id.toString());
      if (filters.payment_method) params.append('payment_method', filters.payment_method);

      const response = await api.get(`${this.baseUrl}/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Error exportando a PDF:', error);
      throw new Error(error.response?.data?.detail || 'Error al exportar a PDF');
    }
  }

  /**
   * Exporta reporte a Excel
   */
  async exportToExcel(filters: RevenueFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.seller_id) params.append('seller_id', filters.seller_id.toString());
      if (filters.payment_method) params.append('payment_method', filters.payment_method);

      const response = await api.get(`${this.baseUrl}/export/excel?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Error exportando a Excel:', error);
      throw new Error(error.response?.data?.detail || 'Error al exportar a Excel');
    }
  }

  /**
   * Obtiene vendedores disponibles para filtros
   */
  async getAvailableSellers(): Promise<Array<{ id: number; name: string }>> {
    try {
      const response = await api.get('/users/sellers');
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo vendedores:', error);
      throw new Error(error.response?.data?.detail || 'Error al obtener vendedores');
    }
  }

  /**
   * Obtiene métodos de pago disponibles
   */
  async getAvailablePaymentMethods(): Promise<string[]> {
    try {
      const response = await api.get('/sales/payment-methods');
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo métodos de pago:', error);
      throw new Error(error.response?.data?.detail || 'Error al obtener métodos de pago');
    }
  }

  /**
   * Obtiene planes de membresía disponibles
   */
  async getAvailableMembershipPlans(): Promise<Array<{ id: number; name: string }>> {
    try {
      const response = await api.get('/membership-plans');
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo planes de membresía:', error);
      throw new Error(error.response?.data?.detail || 'Error al obtener planes de membresía');
    }
  }

  /**
   * Obtiene items vendidos detallados
   */
  async getSoldItems(filters: RevenueFilters, page: number = 1, perPage: number = 50): Promise<any> {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.seller_id) params.append('seller_id', filters.seller_id.toString());
      if (filters.payment_method) params.append('payment_method', filters.payment_method);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());

      const response = await api.get(`${this.baseUrl}/sold-items?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo items vendidos:', error);
      throw new Error(error.response?.data?.detail || 'Error al obtener items vendidos');
    }
  }
}

export const revenueReportsService = new RevenueReportsService();
export default revenueReportsService;
