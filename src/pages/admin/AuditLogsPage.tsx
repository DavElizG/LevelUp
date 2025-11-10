import { useState, useMemo } from 'react';
import { useAuditLogs } from '../../hooks/admin/useAdmin';
import { Search, Filter, FileText, Download, Calendar } from 'lucide-react';

export function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [limit] = useState(100);
  const [offset] = useState(0);

  const { data: logs, isLoading } = useAuditLogs(limit, offset);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];

    let filtered = logs;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.action_type.toLowerCase().includes(search) ||
        (log.target_table && log.target_table.toLowerCase().includes(search)) ||
        (log.target_id && log.target_id.toLowerCase().includes(search))
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action_type === actionFilter);
    }

    return filtered;
  }, [logs, searchTerm, actionFilter]);

  const actionTypes = useMemo(() => {
    if (!logs) return [];
    const types = new Set(logs.map(log => log.action_type));
    return Array.from(types).sort();
  }, [logs]);

  const handleExport = () => {
    const csv = [
      ['Fecha', 'Usuario', 'Acción', 'Tabla', 'ID Objetivo', 'Valores Anteriores', 'Valores Nuevos'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toLocaleString('es-ES'),
        log.admin_user_id,
        log.action_type,
        log.target_table || '',
        log.target_id || '',
        JSON.stringify(log.old_values || {}),
        JSON.stringify(log.new_values || {}),
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('create') || lowerAction.includes('assign')) return 'bg-green-100 text-green-800';
    if (lowerAction.includes('update') || lowerAction.includes('edit')) return 'bg-blue-100 text-blue-800';
    if (lowerAction.includes('delete') || lowerAction.includes('remove')) return 'bg-red-100 text-red-800';
    if (lowerAction.includes('restore')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatActionType = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Historial de acciones administrativas en el sistema</p>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredLogs.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Logs</p>
              <p className="text-3xl font-bold text-gray-900">{filteredLogs.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tipos de Acción</p>
              <p className="text-3xl font-bold text-gray-900">{actionTypes.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Última Acción</p>
              <p className="text-sm font-medium text-gray-900">
                {filteredLogs.length > 0
                  ? new Date(filteredLogs[0].created_at).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por acción, tabla o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las acciones</option>
              {actionTypes.map(type => (
                <option key={type} value={type}>{formatActionType(type)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {new Array(10).fill(0).map((_, i) => (
                <div key={`loading-${String(i)}`} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay logs</h3>
            <p className="text-gray-500">No se encontraron registros con los filtros aplicados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha & Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tabla / ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cambios
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(log.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {log.admin_user_id.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm text-gray-900 font-mono">
                            {log.admin_user_id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(log.action_type)}`}>
                        {formatActionType(log.action_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.target_table || 'N/A'}</div>
                      {log.target_id && (
                        <div className="text-xs text-gray-500 font-mono">
                          ID: {log.target_id.substring(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md">
                        {log.new_values && Object.keys(log.new_values).length > 0 ? (
                          <div className="space-y-1">
                            {Object.entries(log.new_values).slice(0, 2).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium text-gray-700">{key}:</span>{' '}
                                <span className="text-gray-600">
                                  {typeof value === 'object' ? JSON.stringify(value).substring(0, 30) : String(value).substring(0, 30)}
                                  {(typeof value === 'object' ? JSON.stringify(value).length : String(value).length) > 30 && '...'}
                                </span>
                              </div>
                            ))}
                            {Object.keys(log.new_values).length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{Object.keys(log.new_values).length - 2} más...
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Sin cambios registrados</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Info */}
      {filteredLogs.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Mostrando {filteredLogs.length} de {logs?.length || 0} registros
        </div>
      )}
    </div>
  );
}
