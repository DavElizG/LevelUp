import { useState } from 'react';
import { Ban, AlertTriangle } from 'lucide-react';
import type { AdminUser } from '../../../../types/admin.types';

interface BanUserModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (reason: string, durationDays: number | null) => void;
  isLoading: boolean;
}

export function BanUserModal({ isOpen, user, onClose, onConfirm, isLoading }: BanUserModalProps) {
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState<'7' | '30' | '90' | 'permanent'>('7');

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!banReason.trim()) {
      alert('Por favor, proporciona una razón para el baneo.');
      return;
    }
    
    const durationDays = banDuration === 'permanent' ? null : parseInt(banDuration);
    onConfirm(banReason.trim(), durationDays);
    
    // Reset form
    setBanReason('');
    setBanDuration('7');
  };

  const handleCancel = () => {
    setBanReason('');
    setBanDuration('7');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={handleCancel}
        />

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-orange-100">
                  <Ban className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Banear Usuario</h3>
                  <p className="mt-1 text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-start p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="ml-2 text-sm text-orange-800">
                    El usuario no podrá acceder a su cuenta durante el período de baneo.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración del baneo
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: '7', label: '7 días' },
                      { value: '30', label: '30 días' },
                      { value: '90', label: '90 días' },
                      { value: 'permanent', label: 'Permanente' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="banDuration"
                          value={option.value}
                          checked={banDuration === option.value}
                          onChange={(e) => setBanDuration(e.target.value as typeof banDuration)}
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                          disabled={isLoading}
                        />
                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="banReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Razón del baneo <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="banReason"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Describe la razón del baneo..."
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !banReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Baneando...' : 'Banear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
