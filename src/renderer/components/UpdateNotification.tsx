import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, AlertCircle, X } from 'lucide-react';

interface UpdateStatus {
  type: 'available' | 'downloading' | 'not-available' | 'error';
  version?: string;
  percent?: number;
  transferred?: number;
  total?: number;
  error?: string;
}

export const UpdateNotification: React.FC = () => {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Listen for update status from main process
    const handleUpdateStatus = (status: UpdateStatus) => {
      console.log('Update status received:', status);
      setUpdateStatus(status);
      
      // Show notification for important updates
      if (status.type === 'available' || status.type === 'downloading' || status.type === 'error') {
        setShow(true);
      }
      
      // Auto-hide "not available" status
      if (status.type === 'not-available') {
        setShow(false);
      }
    };

    // Subscribe to update status events
    const unsubscribe = window.electronAPI?.onUpdateStatus?.(handleUpdateStatus);

    return () => {
      // Cleanup subscription
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (!show || !updateStatus) {
    return null;
  }

  const handleClose = () => {
    setShow(false);
  };

  const getIcon = () => {
    switch (updateStatus.type) {
      case 'available':
        return <Download className="w-5 h-5 text-blue-400" />;
      case 'downloading':
        return <Download className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
  };

  const getMessage = () => {
    switch (updateStatus.type) {
      case 'available':
        return `Update verfügbar: Version ${updateStatus.version}`;
      case 'downloading':
        const percent = updateStatus.percent?.toFixed(1) || 0;
        return `Download läuft... ${percent}%`;
      case 'error':
        return `Update-Fehler: ${updateStatus.error}`;
      default:
        return 'Keine Updates verfügbar';
    }
  };

  const getColor = () => {
    switch (updateStatus.type) {
      case 'error':
        return 'bg-red-900 border-red-600';
      case 'downloading':
        return 'bg-blue-900 border-blue-600';
      default:
        return 'bg-gray-800 border-gray-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in-bottom">
      <div className={`${getColor()} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm">
              {getMessage()}
            </p>
            
            {updateStatus.type === 'downloading' && updateStatus.percent !== undefined && (
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${updateStatus.percent}%` }}
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {updateStatus.transferred && updateStatus.total
                    ? `${(updateStatus.transferred / 1024 / 1024).toFixed(1)} MB / ${(updateStatus.total / 1024 / 1024).toFixed(1)} MB`
                    : ''}
                </p>
              </div>
            )}
            
            {updateStatus.type === 'available' && (
              <p className="text-gray-400 text-xs mt-1">
                Download wird automatisch gestartet...
              </p>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
