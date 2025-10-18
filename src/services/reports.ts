import api from './api';

export async function getReportByType(type: string, params: any = {}) {
  const res = await api.get(`/reports/${type}`, { params });
  return res.data;
}

export async function getGeneralReport(params: any = {}) {
  const res = await api.get('/reports', { params });
  return res.data;
} 