import { api } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export const userService = {
  // Obtener lista de usuarios
  getUsers: async (): Promise<UserListResponse> => {
    const response = await api.get('/users/');
    return response.data;
  },

  // Obtener usuario por ID
  getUser: async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }
};
