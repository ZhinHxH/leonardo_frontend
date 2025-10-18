import api from './api';

export interface ClinicalRecord {
  id: number;
  user_id: number;
  date: string;
  type: 'initial_assessment' | 'progress_check' | 'body_composition' | 'measurements' | 'medical_clearance' | 'injury_report' | 'nutrition_plan' | 'training_plan';
  weight?: number;
  height?: number;
  body_fat?: number;
  muscle_mass?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  notes: string;
  recommendations?: string;
  created_by: string;
  created_at: string;
}

export interface CreateClinicalRecordRequest {
  user_id: number;
  record_type: 'initial_assessment' | 'progress_check' | 'body_composition' | 'measurements' | 'medical_clearance' | 'injury_report' | 'nutrition_plan' | 'training_plan';
  weight?: number;
  height?: number;
  body_fat?: number;
  muscle_mass?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  notes: string;
  recommendations?: string;
  target_weight?: number;
  target_body_fat?: number;
  record_date?: string;
}

class ClinicalHistoryService {
  /**
   * Obtiene la historia clínica de un usuario
   */
  async getClinicalHistory(userId: number): Promise<ClinicalRecord[]> {
    try {
      const response = await api.get(`/clinical-history/user/${userId}`);
      return response.data;
    } catch (error: any) {
      // Si no existe el endpoint, devolver array vacío
      if (error.response?.status === 404) {
        return [];
      }
      throw new Error(error.response?.data?.detail || 'Error obteniendo historia clínica');
    }
  }

  /**
   * Crea un nuevo registro en la historia clínica
   */
  async createClinicalRecord(recordData: CreateClinicalRecordRequest): Promise<ClinicalRecord> {
    try {
      const response = await api.post('/clinical-history', recordData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error creando registro clínico');
    }
  }

  /**
   * Actualiza un registro de historia clínica
   */
  async updateClinicalRecord(recordId: number, recordData: Partial<CreateClinicalRecordRequest>): Promise<ClinicalRecord> {
    try {
      const response = await api.put(`/clinical-history/${recordId}`, recordData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error actualizando registro clínico');
    }
  }

  /**
   * Elimina un registro de historia clínica
   */
  async deleteClinicalRecord(recordId: number): Promise<boolean> {
    try {
      await api.delete(`/clinical-history/${recordId}`);
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error eliminando registro clínico');
    }
  }

  /**
   * Obtiene estadísticas de un usuario
   */
  async getUserStats(userId: number): Promise<{
    current_weight?: number;
    target_weight?: number;
    height?: number;
    bmi?: number;
    weight_change_30_days?: number;
    last_measurement_date?: string;
  }> {
    try {
      const response = await api.get(`/clinical-history/user/${userId}/stats`);
      return response.data;
    } catch (error: any) {
      // Si no existe el endpoint, devolver objeto vacío
      if (error.response?.status === 404) {
        return {};
      }
      throw new Error(error.response?.data?.detail || 'Error obteniendo estadísticas');
    }
  }

  /**
   * Obtiene tipos de registro disponibles
   */
  getRecordTypes(): Array<{
    value: string;
    label: string;
    icon: string;
  }> {
    return [
      { value: 'initial_assessment', label: 'Evaluación Inicial', icon: '📋' },
      { value: 'progress_check', label: 'Control de Progreso', icon: '📈' },
      { value: 'body_composition', label: 'Composición Corporal', icon: '⚖️' },
      { value: 'measurements', label: 'Medidas Corporales', icon: '📏' },
      { value: 'medical_clearance', label: 'Autorización Médica', icon: '🏥' },
      { value: 'injury_report', label: 'Reporte de Lesión', icon: '🩹' },
      { value: 'nutrition_plan', label: 'Plan Nutricional', icon: '🥗' },
      { value: 'training_plan', label: 'Plan de Entrenamiento', icon: '🏋️' }
    ];
  }

  /**
   * Calcula IMC
   */
  calculateBMI(weight: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return Math.round((weight / (heightM * heightM)) * 10) / 10;
  }

  /**
   * Obtiene categoría de IMC
   */
  getBMICategory(bmi: number): {
    category: string;
    color: 'success' | 'warning' | 'error' | 'info';
  } {
    if (bmi < 18.5) {
      return { category: 'Bajo peso', color: 'info' };
    } else if (bmi < 25) {
      return { category: 'Normal', color: 'success' };
    } else if (bmi < 30) {
      return { category: 'Sobrepeso', color: 'warning' };
    } else {
      return { category: 'Obesidad', color: 'error' };
    }
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
   * Obtiene etiqueta del tipo de registro
   */
  getRecordTypeLabel(type: string): string {
    const types = this.getRecordTypes();
    const found = types.find(t => t.value === type);
    return found ? found.label : type;
  }

  /**
   * Obtiene icono del tipo de registro
   */
  getRecordTypeIcon(type: string): string {
    const types = this.getRecordTypes();
    const found = types.find(t => t.value === type);
    return found ? found.icon : '📋';
  }
}

// Instancia singleton
const clinicalHistoryService = new ClinicalHistoryService();
export default clinicalHistoryService;

