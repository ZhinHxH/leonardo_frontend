import api from './api';

export async function getMemberships({ search = '', page = 1, limit = 10 }) {
  const res = await api.get('/memberships', {
    params: { search, skip: (page - 1) * limit, limit }
  });
  return res.data;
}

export async function createMembership(data: any) {
  const res = await api.post('/memberships', data);
  return res.data;
}

export async function updateMembership(id: number, data: any) {
  const res = await api.put(`/memberships/${id}`, data);
  return res.data;
}

export async function deleteMembership(id: number) {
  const res = await api.delete(`/memberships/${id}`);
  return res.data;
} 