import React, { useState, useEffect } from 'react';
import { cashClosureService, CashClosureCreate, ShiftSummary, ItemsSoldSummary, ItemSold } from '../../services/cashClosure';
import styles from './CashClosure.module.css';

interface CashClosureProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shiftStart: string;
}

const CashClosure: React.FC<CashClosureProps> = ({ isOpen, onClose, onSuccess, shiftStart }) => {
  const [loading, setLoading] = useState(false);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummary | null>(null);
  const [itemsSold, setItemsSold] = useState<ItemsSoldSummary | null>(null);
  const [existingClosure, setExistingClosure] = useState<CashClosureResponse | null>(null);
  const [closureId, setClosureId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CashClosureCreate>({
    shift_date: new Date().toISOString().split('T')[0],
    shift_start: shiftStart,
    shift_end: new Date().toISOString(),
    notes: '',
    total_sales: 0,
    total_products_sold: 0,
    total_memberships_sold: 0,
    total_daily_access_sold: 0,
    cash_sales: 0,
    nequi_sales: 0,
    bancolombia_sales: 0,
    daviplata_sales: 0,
    card_sales: 0,
    transfer_sales: 0,
    cash_counted: 0,
    nequi_counted: 0,
    bancolombia_counted: 0,
    daviplata_counted: 0,
    card_counted: 0,
    transfer_counted: 0,
    discrepancies_notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Siempre recargar datos cuando se abre el modal para obtener ventas más recientes
      loadShiftSummary();
      loadShiftItems();
      checkExistingClosure();
    }
  }, [isOpen, shiftStart]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const checkExistingClosure = async () => {
    try {
      const existing = await cashClosureService.getTodayClosure();
      setExistingClosure(existing);
      
      if (existing) {
        console.log('Cierre existente encontrado:', existing);
        setClosureId(existing.id);
        
        // Solo actualizar campos de conteo físico y notas, no sobrescribir datos de ventas
        // Los datos de ventas ya se han actualizado con los datos más recientes en loadShiftSummary
        setFormData(prev => ({
          ...prev,
          // Mantener los datos de ventas actualizados (no sobrescribir)
          // total_sales, cash_sales, etc. ya están actualizados con datos recientes
          
          // Solo actualizar campos de conteo físico y notas
          cash_counted: existing.cash_counted,
          nequi_counted: existing.nequi_counted,
          bancolombia_counted: existing.bancolombia_counted,
          daviplata_counted: existing.daviplata_counted,
          card_counted: existing.card_counted,
          transfer_counted: existing.transfer_counted,
          notes: existing.notes || ''
        }));
      }
    } catch (error) {
      console.error('Error verificando cierre existente:', error);
    }
  };

  const loadShiftSummary = async () => {
    try {
      setLoading(true);
      console.log('Cargando resumen del turno desde:', shiftStart);
      const summary = await cashClosureService.getShiftSummary(shiftStart);
      console.log('Resumen recibido:', summary);
      setShiftSummary(summary);
      
      // Siempre actualizar los datos del sistema con los datos más recientes
      // Esto asegura que se incluyan las nuevas ventas realizadas después del primer cierre
      setFormData(prev => ({
        ...prev,
        total_sales: summary.total_sales,
        total_products_sold: summary.total_products_sold,
        total_memberships_sold: summary.total_memberships_sold,
        total_daily_access_sold: summary.total_daily_access_sold,
        cash_sales: summary.cash_sales,
        nequi_sales: summary.nequi_sales,
        bancolombia_sales: summary.bancolombia_sales,
        daviplata_sales: summary.daviplata_sales,
        card_sales: summary.card_sales,
        transfer_sales: summary.transfer_sales
      }));
      
      console.log('Datos del formulario actualizados:', {
        total_sales: summary.total_sales,
        cash_sales: summary.cash_sales,
        sales_count: summary.sales_count
      });
    } catch (error) {
      console.error('Error cargando resumen del turno:', error);
      alert('Error cargando datos del turno. Verifique la conexión.');
    } finally {
      setLoading(false);
    }
  };

  const loadShiftItems = async () => {
    try {
      console.log('Cargando items vendidos desde:', shiftStart);
      const items = await cashClosureService.getShiftItems(shiftStart);
      console.log('Items vendidos recibidos:', items);
      setItemsSold(items);
    } catch (error) {
      console.error('Error cargando items vendidos:', error);
      // No mostrar alerta para items vendidos ya que no es crítico
    }
  };

  const handleInputChange = (field: keyof CashClosureCreate, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateDifferences = () => {
    const cashDiff = formData.cash_counted - formData.cash_sales;
    const nequiDiff = formData.nequi_counted - formData.nequi_sales;
    const bancolombiaDiff = formData.bancolombia_counted - formData.bancolombia_sales;
    const daviplataDiff = formData.daviplata_counted - formData.daviplata_sales;
    const cardDiff = formData.card_counted - formData.card_sales;
    const transferDiff = formData.transfer_counted - formData.transfer_sales;

    return {
      cash: cashDiff,
      nequi: nequiDiff,
      bancolombia: bancolombiaDiff,
      daviplata: daviplataDiff,
      card: cardDiff,
      transfer: transferDiff,
      total: cashDiff + nequiDiff + bancolombiaDiff + daviplataDiff + cardDiff + transferDiff
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que shift_start no esté vacío
    if (!formData.shift_start || formData.shift_start.trim() === '') {
      alert('Error: La fecha de inicio del turno es requerida');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Enviando datos del cierre de caja:', formData);
      const result = await cashClosureService.createCashClosure(formData);
      setClosureId(result.id);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creando cierre de caja:', error);
      console.error('Datos enviados:', formData);
      alert('Error al crear el cierre de caja. Revisa la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!closureId) {
      alert('No hay cierre de caja para exportar');
      return;
    }

    try {
      setLoading(true);
      await cashClosureService.downloadCashClosurePDF(closureId);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error al descargar el PDF. Verifique la conexión.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const differences = calculateDifferences();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4 ${styles.animateFadeIn} ${styles.cashClosureModal}`}>
      <div className={`bg-white rounded-lg p-4 sm:p-6 w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl relative ${styles.animateSlideIn} ${styles.cashClosureContent}`}>
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            💰 {existingClosure ? 'Actualizar Cierre de Caja' : 'Cierre de Caja'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200 text-2xl font-bold"
            title="Cerrar"
          >
            ×
          </button>
        </div>

        {loading && !shiftSummary ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensaje informativo para cierre existente */}
            {existingClosure && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Cierre de Caja Existente
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Ya existe un cierre de caja para hoy. Los datos mostrados son del cierre anterior. 
                      Puedes actualizar la información y guardar los cambios.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Resumen del Sistema */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Resumen del Sistema</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Ventas</label>
                  <div className="text-lg font-bold text-blue-600">${formData.total_sales.toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Productos Vendidos</label>
                  <div className="text-lg font-bold text-blue-600">{formData.total_products_sold}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Membresías Vendidas</label>
                  <div className="text-lg font-bold text-blue-600">{formData.total_memberships_sold}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Accesos Diarios</label>
                  <div className="text-lg font-bold text-blue-600">{formData.total_daily_access_sold}</div>
                </div>
              </div>
            </div>

            {/* Desglose por Método de Pago - Sistema */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Desglose por Método de Pago (Sistema)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Efectivo</label>
                  <div className="text-lg font-bold text-gray-600">${formData.cash_sales.toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nequi</label>
                  <div className="text-lg font-bold text-gray-600">${formData.nequi_sales.toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bancolombia</label>
                  <div className="text-lg font-bold text-gray-600">${formData.bancolombia_sales.toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Daviplata</label>
                  <div className="text-lg font-bold text-gray-600">${formData.daviplata_sales.toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tarjeta</label>
                  <div className="text-lg font-bold text-gray-600">${formData.card_sales.toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transferencia</label>
                  <div className="text-lg font-bold text-gray-600">${formData.transfer_sales.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Conteo Físico */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Conteo Físico</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Efectivo Contado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cash_counted}
                    onChange={(e) => handleInputChange('cash_counted', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nequi Contado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.nequi_counted}
                    onChange={(e) => handleInputChange('nequi_counted', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bancolombia Contado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.bancolombia_counted}
                    onChange={(e) => handleInputChange('bancolombia_counted', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Daviplata Contado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.daviplata_counted}
                    onChange={(e) => handleInputChange('daviplata_counted', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tarjeta Contado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.card_counted}
                    onChange={(e) => handleInputChange('card_counted', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transferencia Contado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.transfer_counted}
                    onChange={(e) => handleInputChange('transfer_counted', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Desglose */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">Desglose de Items Vendidos</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Cargando items vendidos...</p>
                </div>
              ) : itemsSold && itemsSold.items_sold.length > 0 ? (
                <div className="space-y-4">
                  {/* Resumen */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg border border-purple-200">
                      <div className="text-sm text-gray-600">Productos Únicos</div>
                      <div className="text-lg font-bold text-purple-700">{itemsSold.total_products_sold}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-purple-200">
                      <div className="text-sm text-gray-600">Items Totales</div>
                      <div className="text-lg font-bold text-purple-700">{itemsSold.total_items_sold}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-purple-200">
                      <div className="text-sm text-gray-600">Valor Total</div>
                      <div className="text-lg font-bold text-purple-700">
                        ${itemsSold.items_sold.reduce((sum, item) => sum + (item.quantity_sold * item.unit_price), 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Lista de items */}
                  <div className="max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {itemsSold.items_sold.map((item, index) => (
                        <div key={item.product_id} className="bg-white p-3 rounded-lg border border-purple-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{item.product_name}</div>
                              <div className="text-sm text-gray-600">
                                Vendidos: <span className="font-semibold text-purple-700">{item.quantity_sold}</span> | 
                                Stock: <span className={`font-semibold ${item.remaining_stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {item.remaining_stock}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Precio Unit.</div>
                              <div className="font-bold text-purple-700">${item.unit_price.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-lg font-medium text-gray-600">No hay items vendidos</p>
                    <p className="text-sm text-gray-400 mt-2">No se han registrado ventas de productos en este turno</p>
                  </div>
                </div>
              )}
            </div>

            {/* Diferencias */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">Diferencias Encontradas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Efectivo</label>
                  <div className={`text-lg font-bold ${differences.cash === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${differences.cash.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nequi</label>
                  <div className={`text-lg font-bold ${differences.nequi === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${differences.nequi.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bancolombia</label>
                  <div className={`text-lg font-bold ${differences.bancolombia === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${differences.bancolombia.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Daviplata</label>
                  <div className={`text-lg font-bold ${differences.daviplata === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${differences.daviplata.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tarjeta</label>
                  <div className={`text-lg font-bold ${differences.card === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${differences.card.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transferencia</label>
                  <div className={`text-lg font-bold ${differences.transfer === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${differences.transfer.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Diferencia Total:</span>
                  <span className={`text-xl font-bold ${differences.total === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${differences.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas del Cierre</label>
              <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              placeholder="Observaciones sobre el cierre de caja..."
            />
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
              >
          Cancelar
              </button>
              
              {/* Botón de exportar PDF - solo visible si hay un cierre de caja */}
              {closureId && (
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {loading ? 'Generando...' : 'Exportar PDF'}
                </button>
              )}
              
              <button
                type="submit"
          disabled={loading}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? 'Guardando...' : (existingClosure ? 'Actualizar Cierre de Caja' : 'Guardar Cierre de Caja')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CashClosure;