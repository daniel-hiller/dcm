import React, { useState } from 'react';
import { X, Plus, Trash2, FolderPlus } from 'lucide-react';
import { useConnectionStore } from '../../store/connectionStore';
import type { Folder } from '@shared/types';

interface FolderManagementDialogProps {
  onClose: () => void;
}

export const FolderManagementDialog: React.FC<FolderManagementDialogProps> = ({ onClose }) => {
  const { folders, addFolder, deleteFolder } = useConnectionStore();
  const [newFolderPath, setNewFolderPath] = useState('');
  const [error, setError] = useState('');

  const handleAddFolder = () => {
    if (!newFolderPath.trim()) {
      setError('Folder path cannot be empty');
      return;
    }

    if (!newFolderPath.startsWith('/')) {
      setError('Folder path must start with /');
      return;
    }

    if (folders.some(f => f.path === newFolderPath)) {
      setError('Folder already exists');
      return;
    }

    const pathParts = newFolderPath.split('/').filter(Boolean);
    const name = pathParts[pathParts.length - 1] || 'Root';

    addFolder({
      path: newFolderPath,
      name,
      expanded: true,
    });

    setNewFolderPath('');
    setError('');
  };

  const handleDeleteFolder = (path: string) => {
    if (path === '/') {
      alert('Cannot delete root folder');
      return;
    }
    
    if (confirm(`Delete folder "${path}"? Connections in this folder will be moved to root.`)) {
      deleteFolder(path);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderPlus size={24} />
            Manage Folders
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Add New Folder */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Folder Path
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFolderPath}
                onChange={(e) => {
                  setNewFolderPath(e.target.value);
                  setError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFolder()}
                className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/Work/Servers"
              />
              <button
                onClick={handleAddFolder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            <p className="text-xs text-gray-400 mt-1">
              Use / for nested folders, e.g., /Work/Production
            </p>
          </div>

          {/* Existing Folders */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Existing Folders
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {folders.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No folders yet</p>
              ) : (
                folders.map((folder) => (
                  <div
                    key={folder.path}
                    className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2"
                  >
                    <span className="text-white">{folder.path}</span>
                    {folder.path !== '/' && (
                      <button
                        onClick={() => handleDeleteFolder(folder.path)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
