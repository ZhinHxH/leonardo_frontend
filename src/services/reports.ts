import api from './api';

export async function getReportByType(type: string, params: any = {}) {
  const res = await api.get(`/reports/${type}`, { params });
  return res.data;
}

export async function getGeneralReport(params: any = {}) {
  const res = await api.get('/reports', { params });
  return res.data;
}

// Reportes específicos
export async function getUsersReport(startDate: string, endDate: string) {
  const res = await api.get('/reports/users', { 
    params: { start_date: startDate, end_date: endDate } 
  });
  return res.data;
}

export async function getRevenueReport(startDate: string, endDate: string) {
  const res = await api.get('/reports/revenue', { 
    params: { start_date: startDate, end_date: endDate } 
  });
  return res.data;
}

export async function getPeaksReport(startDate: string, endDate: string) {
  const res = await api.get('/reports/peaks', { 
    params: { start_date: startDate, end_date: endDate } 
  });
  return res.data;
}

export async function getInventoryReport(startDate: string, endDate: string) {
  const res = await api.get('/reports/inventory', { 
    params: { start_date: startDate, end_date: endDate } 
  });
  return res.data;
}

// Funciones de exportación
export async function exportReportToPDF(reportType: string, startDate: string, endDate: string) {
  const res = await api.get(`/reports/${reportType}/export/pdf`, { 
    params: { start_date: startDate, end_date: endDate },
    responseType: 'blob'
  });
  return res.data;
}

export async function exportReportToExcel(reportType: string, startDate: string, endDate: string) {
  const res = await api.get(`/reports/${reportType}/export/excel`, { 
    params: { start_date: startDate, end_date: endDate },
    responseType: 'blob'
  });
  return res.data;
} 