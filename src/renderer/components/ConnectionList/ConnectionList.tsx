import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useConnectionStore } from '../../store/connectionStore';
import { SearchBar } from './SearchBar';
import { ConnectionCard } from './ConnectionCard';
import { EditForm } from '../ConnectionDetail/EditForm';
import type { Connection } from '@shared/types';

export const ConnectionList: React.FC = () => {
  const [showEditForm, setShowEditForm] = useState(false);
  const {
    selectedConnection,
    selectConnection,
    toggleFavorite,
    updateLastUsed,
    getFilteredConnections,
    saveToBackend,
    addConnection,
  } = useConnectionStore();

  const connections = getFilteredConnections();

  const handleConnect = async (connection: typeof connections[0]) => {
    try {
      const result = await window.electronAPI.launchConnection(connection);
      if (result.success) {
        updateLastUsed(connection.id);
        await saveToBackend();
      } else {
        alert(`Failed to connect: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    toggleFavorite(id);
    await saveToBackend();
  };

  const handleSaveConnection = async (connection: Connection) => {
    addConnection(connection);
    await saveToBackend();
    setShowEditForm(false);
    selectConnection(connection);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      <SearchBar />

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {connections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No connections found</p>
            <p className="text-sm text-gray-500 mt-2">Create your first connection to get started</p>
          </div>
        ) : (
          connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              isSelected={selectedConnection?.id === connection.id}
              onSelect={() => selectConnection(connection)}
              onConnect={() => handleConnect(connection)}
              onToggleFavorite={() => handleToggleFavorite(connection.id)}
            />
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setShowEditForm(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Connection
        </button>
      </div>

      {showEditForm && (
        <EditForm
          onClose={() => setShowEditForm(false)}
          onSave={handleSaveConnection}
        />
      )}
    </div>
  );
};
