
import api from './api';

export async function getClients({ search = '', page = 1, limit = 10 }) {
  const res = await api.get('/users', {
    params: { search, skip: (page - 1) * limit, limit }
  });
  return res.data;
}

export async function createClient(data: any) {
  const res = await api.post('/users', data);
  return res.data;
}

export async function updateClient(id: number, data: any) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}

export async function deleteClient(id: number) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
} 