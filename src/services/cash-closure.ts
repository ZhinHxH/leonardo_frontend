import api from './api';

export interface CashClosureCreate {
  shift_date: string;
  shift_start: string;
  shift_end?: string;
  notes?: string;
  // Resumen de ventas
  total_sales: number;
  total_products_sold: number;
  total_memberships_sold: number;
  total_daily_access_sold: number;
  // Desglose por método de pago
  cash_sales: number;
  nequi_sales: number;
  bancolombia_sales: number;
  daviplata_sales: number;
  card_sales: number;
  transfer_sales: number;
  // Conteo físico
  cash_counted: number;
  nequi_counted: number;
  bancolombia_counted: number;
  daviplata_counted: number;
  card_counted: number;
  transfer_counted: number;
  // Notas sobre diferencias
  discrepancies_notes?: string;
}

export interface CashClosureResponse {
  id: number;
  user_id: number;
  user_name?: string;
  shift_date: string;
  shift_start: string;
  shift_end: string;
  total_sales: number;
  total_products_sold: number;
  total_memberships_sold: number;
  total_daily_access_sold: number;
  // Desglose por método de pago
  cash_sales: number;
  nequi_sales: number;
  bancolombia_sales: number;
  daviplata_sales: number;
  card_sales: number;
  transfer_sales: number;
  // Conteo físico
  cash_counted: number;
  nequi_counted: number;
  bancolombia_counted: number;
  daviplata_counted: number;
  card_counted: number;
  transfer_counted: number;
  // Diferencias
  cash_difference: number;
  nequi_difference: number;
  bancolombia_difference: number;
  daviplata_difference: number;
  card_difference: number;
  transfer_difference: number;
  // Estado y metadatos
  status: 'pending' | 'completed' | 'reviewed' | 'cancelled';
  notes?: string;
  discrepancies_notes?: string;
  created_at: string;
  updated_at?: string;
  reviewed_by_id?: number;
  reviewed_at?: string;
  // Campos calculados
  total_counted: number;
  total_differences: number;
  has_discrepancies: boolean;
}

export interface ShiftSummary {
  total_sales: number;
  total_products_sold: number;
  total_memberships_sold: number;
  total_daily_access_sold: number;
  cash_sales: number;
  nequi_sales: number;
  bancolombia_sales: number;
  daviplata_sales: number;
  card_sales: number;
  transfer_sales: number;
  sales_count: number;
}

export interface CashClosureListResponse {
  cash_closures: CashClosureResponse[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CashClosureReport {
  period_start: string;
  period_end: string;
  total_closures: number;
  total_sales: number;
  total_counted: number;
  total_differences: number;
  closures_with_discrepancies: number;
  average_difference: number;
  closures_by_user: Array<{
    user_name: string;
    closures_count: number;
    total_sales: number;
    total_differences: number;
    discrepancies_count: number;
  }>;
  daily_summary: Array<{
    date: string;
    closures_count: number;
    total_sales: number;
    total_differences: number;
    discrepancies_count: number;
  }>;
}

class CashClosureService {
  private static instance: CashClosureService;

  public static getInstance(): CashClosureService {
    if (!CashClosureService.instance) {
      CashClosureService.instance = new CashClosureService();
    }
    return CashClosureService.instance;
  }

  // Obtener resumen del turno actual
  async getShiftSummary(shiftStart: string): Promise<ShiftSummary> {
    try {
      const response = await api.get('/cash-closures/shift-summary', {
        params: { shift_start: shiftStart }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo resumen del turno');
    }
  }

  // Crear cierre de caja
  async createCashClosure(cashClosureData: CashClosureCreate): Promise<CashClosureResponse> {
    try {
      const response = await api.post('/cash-closures/', cashClosureData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error creando cierre de caja');
    }
  }

  // Obtener lista de cierres de caja
  async getCashClosures(params?: {
    user_id?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<CashClosureListResponse> {
    try {
      const response = await api.get('/cash-closures/', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo cierres de caja');
    }
  }

  // Obtener cierre de caja específico
  async getCashClosure(closureId: number): Promise<CashClosureResponse> {
    try {
      const response = await api.get(`/cash-closures/${closureId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo cierre de caja');
    }
  }

  // Actualizar cierre de caja
  async updateCashClosure(closureId: number, updateData: {
    status?: string;
    notes?: string;
    discrepancies_notes?: string;
    reviewed_by_id?: number;
  }): Promise<CashClosureResponse> {
    try {
      const response = await api.put(`/cash-closures/${closureId}`, updateData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error actualizando cierre de caja');
    }
  }

  // Obtener reporte de cierres de caja
  async getCashClosureReport(params: {
    start_date: string;
    end_date: string;
    user_id?: number;
  }): Promise<CashClosureReport> {
    try {
      const response = await api.get('/cash-closures/reports/summary', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo reporte de cierres');
    }
  }

  // Obtener resumen diario
  async getDailySummary(date: string): Promise<{
    date: string;
    total_closures: number;
    total_sales: number;
    total_counted: number;
    total_differences: number;
    discrepancies_count: number;
    average_difference: number;
    closures: CashClosureResponse[];
  }> {
    try {
      const response = await api.get('/cash-closures/reports/daily-summary', {
        params: { date }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error obteniendo resumen diario');
    }
  }

  // Calcular diferencias entre sistema y conteo físico
  calculateDifferences(salesData: any, countedData: any) {
    const differences: any = {};
    const discrepanciesNotes: string[] = [];

    const paymentMethods = ['cash', 'nequi', 'bancolombia', 'daviplata', 'card', 'transfer'];

    paymentMethods.forEach(method => {
      const salesKey = `${method}_sales`;
      const countedKey = `${method}_counted`;
      const differenceKey = `${method}_difference`;

      const salesAmount = salesData[salesKey] || 0;
      const countedAmount = countedData[countedKey] || 0;
      const difference = countedAmount - salesAmount;

      differences[differenceKey] = difference;

      // Si hay diferencia significativa, agregar nota
      if (Math.abs(difference) > 0.01) {
        discrepanciesNotes.push(
          `${method.toUpperCase()}: Sistema $${salesAmount.toFixed(2)} vs Físico $${countedAmount.toFixed(2)} ` +
          `(Diferencia: $${difference >= 0 ? '+' : ''}${difference.toFixed(2)})`
        );
      }
    });

    if (discrepanciesNotes.length > 0) {
      differences.discrepancies_notes = discrepanciesNotes.join('; ');
    }

    return differences;
  }

  // Formatear moneda
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Formatear fecha
  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export default CashClosureService.getInstance();
