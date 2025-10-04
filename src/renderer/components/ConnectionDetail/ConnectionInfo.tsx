import React, { useState } from 'react';
import {
  Terminal,
  Monitor,
  Eye,
  Users,
  Video,
  Star,
  Edit2,
  Play,
  Folder,
  Tag,
} from 'lucide-react';
import type { ConnectionType } from '@shared/types';
import { useConnectionStore } from '../../store/connectionStore';
import { EditForm } from './EditForm';
import type { Connection } from '@shared/types';

const CONNECTION_ICONS: Record<ConnectionType, React.ReactNode> = {
  ssh: <Terminal className="w-6 h-6" />,
  rdp: <Monitor className="w-6 h-6" />,
  vnc: <Eye className="w-6 h-6" />,
  anydesk: <Users className="w-6 h-6" />,
  teamviewer: <Video className="w-6 h-6" />,
};

const CONNECTION_COLORS: Record<ConnectionType, string> = {
  ssh: 'bg-green-600',
  rdp: 'bg-blue-600',
  vnc: 'bg-purple-600',
  anydesk: 'bg-red-600',
  teamviewer: 'bg-indigo-600',
};

export const ConnectionInfo: React.FC = () => {
  const [showEditForm, setShowEditForm] = useState(false);
  const { selectedConnection, updateLastUsed, updateConnection, saveToBackend } = useConnectionStore();

  if (!selectedConnection) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-800">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No connection selected</h3>
          <p className="text-gray-500">Select a connection to view details</p>
        </div>
      </div>
    );
  }

  const connection = selectedConnection;

  const handleConnect = async () => {
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

  const handleSaveConnection = async (updatedConnection: Connection) => {
    updateConnection(updatedConnection);
    await saveToBackend();
    setShowEditForm(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="flex-1 bg-gray-800 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`${CONNECTION_COLORS[connection.type]} p-4 rounded-xl`}>
            {CONNECTION_ICONS[connection.type]}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{connection.name}</h2>
                <p className="text-gray-400">
                  {connection.type.toUpperCase()} Connection
                </p>
              </div>
              {connection.favorite && (
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
              )}
            </div>
          </div>
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-6"
        >
          <Play className="w-5 h-5" />
          Connect
        </button>

        {/* Details */}
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Connection Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Host</label>
                <p className="text-white font-mono">{connection.host}</p>
              </div>
              {connection.port && (
                <div>
                  <label className="text-xs text-gray-400">Port</label>
                  <p className="text-white font-mono">{connection.port}</p>
                </div>
              )}
              {connection.username && (
                <div>
                  <label className="text-xs text-gray-400">Username</label>
                  <p className="text-white font-mono">{connection.username}</p>
                </div>
              )}
              {connection.keyFile && (
                <div>
                  <label className="text-xs text-gray-400">Key File</label>
                  <p className="text-white font-mono text-sm truncate">
                    {connection.keyFile}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Organization */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Organization
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-gray-400" />
                <span className="text-white">{connection.folder}</span>
              </div>
              {connection.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {connection.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-600 text-gray-200 px-3 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {connection.notes && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                Notes
              </h3>
              <p className="text-white whitespace-pre-wrap">{connection.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Metadata
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Created</span>
                <span className="text-white">{formatDate(connection.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Modified</span>
                <span className="text-white">{formatDate(connection.updatedAt)}</span>
              </div>
              {connection.lastUsed && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Used</span>
                  <span className="text-white">{formatDate(connection.lastUsed)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => setShowEditForm(true)}
          className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          Edit Connection
        </button>
      </div>

      {showEditForm && (
        <EditForm
          connection={connection}
          onClose={() => setShowEditForm(false)}
          onSave={handleSaveConnection}
        />
      )}
    </div>
  );
};
