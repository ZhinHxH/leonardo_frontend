import api from './api';

export interface MembershipPlan {
  id: number;
  name: string;
  description: string;
  plan_type: 'monthly' | 'daily' | 'weekly' | 'quarterly' | 'yearly';
  price: number;
  discount_price?: number;
  duration_days: number;
  access_hours_start?: string;
  access_hours_end?: string;
  includes_trainer: boolean;
  includes_nutritionist: boolean;
  includes_pool: boolean;
  includes_classes: boolean;
  max_guests: number;
  max_visits_per_day?: number;
  max_visits_per_month?: number;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

export interface PlanCreate {
  name: string;
  description?: string;
  plan_type: string;
  price: number;
  discount_price?: number;
  duration_days: number;
  access_hours_start?: string;
  access_hours_end?: string;
  includes_trainer?: boolean;
  includes_nutritionist?: boolean;
  includes_pool?: boolean;
  includes_classes?: boolean;
  max_guests?: number;
  max_visits_per_day?: number;
  max_visits_per_month?: number;
  is_active?: boolean;
  is_popular?: boolean;
  sort_order?: number;
}

class MembershipPlansService {
  private static instance: MembershipPlansService;

  private constructor() {}

  public static getInstance(): MembershipPlansService {
    if (!MembershipPlansService.instance) {
      MembershipPlansService.instance = new MembershipPlansService();
    }
    return MembershipPlansService.instance;
  }

  async getPlans(includeInactive: boolean = false): Promise<MembershipPlan[]> {
    try {
      console.log('🔍 Obteniendo planes de membresía...');
      const response = await api.get<MembershipPlan[]>('/membership-plans', {
        params: { include_inactive: includeInactive }
      });
      console.log('✅ Planes obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo planes:', error);
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

  async createPlan(planData: PlanCreate): Promise<MembershipPlan> {
    try {
      const response = await api.post<MembershipPlan>('/membership-plans', planData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error creando plan');
    }
  }

  async updatePlan(id: number, planData: Partial<PlanCreate>): Promise<MembershipPlan> {
    try {
      const response = await api.put<MembershipPlan>(`/membership-plans/${id}`, planData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error actualizando plan');
    }
  }

  async deletePlan(id: number): Promise<void> {
    try {
      await api.delete(`/membership-plans/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error eliminando plan');
    }
  }

  async getActivePlansForSale(): Promise<MembershipPlan[]> {
    try {
      console.log('🔍 Obteniendo planes activos para venta...');
      const response = await api.get<MembershipPlan[]>('/membership-plans/active');
      console.log('✅ Planes activos obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo planes activos:', error);
      if (error.response?.status === 401) {
        throw new Error('No estás autenticado. Por favor, inicia sesión.');
      } else if (error.response?.status === 403) {
        throw new Error('No tienes permisos para ver los planes de membresía.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('No se puede conectar con el servidor. Verifica que esté ejecutándose.');
      }
      throw new Error(error.response?.data?.detail || 'Error obteniendo planes activos');
    }
  }
}

export default MembershipPlansService.getInstance();

