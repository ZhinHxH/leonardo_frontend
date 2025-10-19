import { api } from './api';

export interface CashClosureCreate {
  shift_date: string;
  shift_start: string;
  shift_end?: string;
  notes?: string;
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
  cash_counted: number;
  nequi_counted: number;
  bancolombia_counted: number;
  daviplata_counted: number;
  card_counted: number;
  transfer_counted: number;
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
  cash_sales: number;
  nequi_sales: number;
  bancolombia_sales: number;
  daviplata_sales: number;
  card_sales: number;
  transfer_sales: number;
  cash_counted: number;
  nequi_counted: number;
  bancolombia_counted: number;
  daviplata_counted: number;
  card_counted: number;
  transfer_counted: number;
  cash_difference: number;
  nequi_difference: number;
  bancolombia_difference: number;
  daviplata_difference: number;
  card_difference: number;
  transfer_difference: number;
  status: 'pending' | 'completed' | 'reviewed' | 'cancelled';
  notes?: string;
  discrepancies_notes?: string;
  created_at: string;
  updated_at?: string;
  reviewed_by_id?: number;
  reviewed_at?: string;
  total_counted: number;
  total_differences: number;
  has_discrepancies: boolean;
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

export interface ItemSold {
  product_id: number;
  product_name: string;
  remaining_stock: number;
  unit_price: number;
  quantity_sold: number;
}

export interface ItemsSoldSummary {
  items_sold: ItemSold[];
  total_items_sold: number;
  total_products_sold: number;
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

export const cashClosureService = {
  // Obtener resumen del turno
  getShiftSummary: async (shiftStart: string): Promise<ShiftSummary> => {
    const response = await api.get(`/cash-closures/shift-summary?shift_start=${shiftStart}`);
    return response.data;
  },

  // Obtener items vendidos en el turno
  getShiftItems: async (shiftStart: string): Promise<ItemsSoldSummary> => {
    const response = await api.get(`/cash-closures/shift-items?shift_start=${shiftStart}`);
    return response.data;
  },

  // Obtener cierre del día actual
  getTodayClosure: async (): Promise<CashClosureResponse | null> => {
    const response = await api.get('/cash-closures/today');
    return response.data;
  },

  // Crear cierre de caja
  createCashClosure: async (data: CashClosureCreate): Promise<CashClosureResponse> => {
    const response = await api.post('/cash-closures/', data);
    return response.data;
  },

  // Obtener lista de cierres de caja
  getCashClosures: async (params?: {
    user_id?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<CashClosureListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const response = await api.get(`/cash-closures/?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener cierre de caja específico
  getCashClosure: async (closureId: number): Promise<CashClosureResponse> => {
    const response = await api.get(`/cash-closures/${closureId}`);
    return response.data;
  },

  // Actualizar cierre de caja
  updateCashClosure: async (closureId: number, data: Partial<CashClosureCreate>): Promise<CashClosureResponse> => {
    const response = await api.put(`/cash-closures/${closureId}`, data);
    return response.data;
  },

  // Obtener reporte de cierres de caja
  getCashClosureReport: async (startDate: string, endDate: string, userId?: number): Promise<CashClosureReport> => {
    const queryParams = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });
    
    if (userId) queryParams.append('user_id', userId.toString());

    const response = await api.get(`/cash-closures/reports/summary?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener resumen diario
  getDailySummary: async (date: string): Promise<any> => {
    const response = await api.get(`/cash-closures/reports/daily-summary?date=${date}`);
    return response.data;
  },

  // Descargar PDF del cierre de caja
  downloadCashClosurePDF: async (closureId: number): Promise<void> => {
    const response = await api.get(`/cash-closures/${closureId}/pdf`, {
      responseType: 'blob'
    });
    
    // Crear URL del blob y descargar
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cierre_caja_${closureId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Obtener reporte de cierres de caja con filtros
  getCashClosureReports: async (params?: {
    start_date?: string;
    end_date?: string;
    user_id?: number;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<CashClosureListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const response = await api.get(`/cash-closures/reports/list?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener usuarios autorizados para cierres de caja
  getAuthorizedUsers: async (): Promise<{users: any[], total: number}> => {
    const response = await api.get('/cash-closures/authorized-users');
    return response.data;
  }
};
