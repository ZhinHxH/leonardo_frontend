// Utilidad para debuggear el reporte de inventario
export const debugInventoryReport = {
  // Función para verificar datos de tendencias
  validateTrendsData: (trends: any[]) => {
    console.log('🔍 Validando datos de tendencias:', trends);
    
    if (!trends || trends.length === 0) {
      console.warn('⚠️ No hay datos de tendencias');
      return false;
    }
    
    // Verificar estructura de datos
    const requiredFields = ['month', 'totalValue', 'movements', 'growth'];
    const isValid = trends.every(trend => 
      requiredFields.every(field => field in trend)
    );
    
    if (!isValid) {
      console.error('❌ Estructura de datos inválida en tendencias');
      return false;
    }
    
    // Verificar valores numéricos
    const hasValidNumbers = trends.every(trend => 
      typeof trend.totalValue === 'number' && 
      typeof trend.movements === 'number' && 
      typeof trend.growth === 'number'
    );
    
    if (!hasValidNumbers) {
      console.error('❌ Valores numéricos inválidos en tendencias');
      return false;
    }
    
    console.log('✅ Datos de tendencias válidos');
    return true;
  },
  
  // Función para crear datos de ejemplo si no hay datos reales
  createSampleTrendsData: () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const baseValue = 1000000;
    
    return months.map((month, index) => ({
      month,
      totalValue: baseValue + (index * 50000),
      movements: Math.floor(Math.random() * 20) + 10,
      growth: index > 0 ? Math.random() * 10 - 5 : 0
    }));
  },
  
  // Función para formatear datos para el gráfico
  formatTrendsForChart: (trends: any[]) => {
    if (!trends || trends.length === 0) {
      return this.createSampleTrendsData();
    }
    
    return trends.map(trend => ({
      month: trend.month,
      totalValue: Number(trend.totalValue) || 0,
      movements: Number(trend.movements) || 0,
      growth: Number(trend.growth) || 0
    }));
  }
};

export default debugInventoryReport;
