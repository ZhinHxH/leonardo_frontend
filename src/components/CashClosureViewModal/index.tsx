import React, { useState, useEffect } from 'react';
import { cashClosureService, CashClosureResponse, ItemsSoldSummary } from '../../services/cashClosure';
import styles from './CashClosureViewModal.module.css';

interface CashClosureViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  closure: CashClosureResponse;
}

const CashClosureViewModal: React.FC<CashClosureViewModalProps> = ({ isOpen, onClose, closure }) => {
  const [loading, setLoading] = useState(false);
  const [itemsSold, setItemsSold] = useState<ItemsSoldSummary | null>(null);

  useEffect(() => {
    if (isOpen && closure) {
      loadItemsSold();
    }
  }, [isOpen, closure]);

  const loadItemsSold = async () => {
    try {
      setLoading(true);
      const items = await cashClosureService.getShiftItems(closure.shift_start);
      setItemsSold(items);
    } catch (error) {
      console.error('Error cargando items vendidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await cashClosureService.downloadCashClosurePDF(closure.id);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error descargando PDF');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      'REVIEWED': { color: 'bg-green-100 text-green-800', text: 'Revisado' },
      'DISCREPANCY': { color: 'bg-red-100 text-red-800', text: 'Discrepancia' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const calculateDifferences = () => {
    return {
      cash: closure.cash_counted - closure.cash_sales,
      nequi: closure.nequi_counted - closure.nequi_sales,
      bancolombia: closure.bancolombia_counted - closure.bancolombia_sales,
      daviplata: closure.daviplata_counted - closure.daviplata_sales,
      card: closure.card_counted - closure.card_sales,
      transfer: closure.transfer_counted - closure.transfer_sales,
      total: (closure.cash_counted + closure.nequi_counted + closure.bancolombia_counted + 
              closure.daviplata_counted + closure.card_counted + closure.transfer_counted) - 
             (closure.cash_sales + closure.nequi_sales + closure.bancolombia_sales + 
              closure.daviplata_sales + closure.card_sales + closure.transfer_sales)
    };
  };

  if (!isOpen) return null;

  const differences = calculateDifferences();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4 ${styles.animateFadeIn} ${styles.cashClosureModal}`}>
      <div className={`bg-white rounded-lg p-4 sm:p-6 w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl relative ${styles.animateSlideIn} ${styles.cashClosureContent}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              📊 Cierre de Caja #{closure.id}
            </h2>
            <p className="text-gray-600 mt-1">
              {closure.user_name} • {formatDate(closure.shift_date)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(closure.status)}
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200 text-2xl font-bold"
              title="Cerrar"
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información del Cierre */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Información del Cierre</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuario</label>
                <div className="text-lg font-bold text-blue-700">{closure.user_name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha del Turno</label>
                <div className="text-lg font-bold text-blue-700">{formatDate(closure.shift_date)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Inicio del Turno</label>
                <div className="text-lg font-bold text-blue-700">{formatDate(closure.shift_start)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fin del Turno</label>
                <div className="text-lg font-bold text-blue-700">{formatDate(closure.shift_end)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <div className="mt-1">{getStatusBadge(closure.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Creado</label>
                <div className="text-lg font-bold text-blue-700">{formatDate(closure.created_at)}</div>
              </div>
            </div>
          </div>

          {/* Resumen de Ventas */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Resumen de Ventas del Sistema</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total de Ventas</label>
                <div className="text-2xl font-bold text-green-700">{formatCurrency(closure.total_sales)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Productos Vendidos</label>
                <div className="text-2xl font-bold text-green-700">{closure.total_products_sold}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Membresías Vendidas</label>
                <div className="text-2xl font-bold text-green-700">{closure.total_memberships_sold}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Accesos Diarios</label>
                <div className="text-2xl font-bold text-green-700">{closure.total_daily_access_sold}</div>
              </div>
            </div>
          </div>

          {/* Desglose por Método de Pago */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Desglose por Método de Pago</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Efectivo</label>
                <div className="text-lg font-bold text-purple-700">{formatCurrency(closure.cash_sales)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nequi</label>
                <div className="text-lg font-bold text-purple-700">{formatCurrency(closure.nequi_sales)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bancolombia</label>
                <div className="text-lg font-bold text-purple-700">{formatCurrency(closure.bancolombia_sales)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Daviplata</label>
                <div className="text-lg font-bold text-purple-700">{formatCurrency(closure.daviplata_sales)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tarjeta</label>
                <div className="text-lg font-bold text-purple-700">{formatCurrency(closure.card_sales)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transferencia</label>
                <div className="text-lg font-bold text-purple-700">{formatCurrency(closure.transfer_sales)}</div>
              </div>
            </div>
          </div>

          {/* Conteo Físico */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-800 mb-4">Conteo Físico</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Efectivo Contado</label>
                <div className="text-lg font-bold text-orange-700">{formatCurrency(closure.cash_counted)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nequi Contado</label>
                <div className="text-lg font-bold text-orange-700">{formatCurrency(closure.nequi_counted)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bancolombia Contado</label>
                <div className="text-lg font-bold text-orange-700">{formatCurrency(closure.bancolombia_counted)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Daviplata Contado</label>
                <div className="text-lg font-bold text-orange-700">{formatCurrency(closure.daviplata_counted)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tarjeta Contada</label>
                <div className="text-lg font-bold text-orange-700">{formatCurrency(closure.card_counted)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transferencia Contada</label>
                <div className="text-lg font-bold text-orange-700">{formatCurrency(closure.transfer_counted)}</div>
              </div>
            </div>
          </div>

          {/* Items Vendidos */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Items Vendidos en el Turno</h3>
            
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
                      {formatCurrency(itemsSold.items_sold.reduce((sum, item) => sum + (item.quantity_sold * item.unit_price), 0))}
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
                            <div className="font-bold text-purple-700">{formatCurrency(item.unit_price)}</div>
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
                  <p className="text-sm text-gray-400 mt-2">No se registraron ventas de productos en este turno</p>
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
                  {formatCurrency(differences.cash)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nequi</label>
                <div className={`text-lg font-bold ${differences.nequi === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(differences.nequi)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bancolombia</label>
                <div className={`text-lg font-bold ${differences.bancolombia === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(differences.bancolombia)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Daviplata</label>
                <div className={`text-lg font-bold ${differences.daviplata === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(differences.daviplata)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tarjeta</label>
                <div className={`text-lg font-bold ${differences.card === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(differences.card)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transferencia</label>
                <div className={`text-lg font-bold ${differences.transfer === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(differences.transfer)}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-yellow-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">Diferencia Total:</span>
                <span className={`text-2xl font-bold ${differences.total === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(differences.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {closure.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Notas del Cierre</h3>
              <p className="text-gray-700">{closure.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashClosureViewModal;
