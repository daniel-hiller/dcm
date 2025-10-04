import React, { useState } from 'react';
import { X, Save, Eye, EyeOff, Folder, Tag as TagIcon, Terminal, FileKey } from 'lucide-react';
import type { Connection, ConnectionType } from '@shared/types';
import { useConnectionStore } from '../../store/connectionStore';

interface EditFormProps {
  connection?: Connection;
  onClose: () => void;
  onSave: (connection: Connection) => void;
}

export const EditForm: React.FC<EditFormProps> = ({ connection, onClose, onSave }) => {
  const isNew = !connection;
  const { folders, tags: availableTags } = useConnectionStore();

  const [formData, setFormData] = useState<Partial<Connection>>({
    name: connection?.name || '',
    type: connection?.type || 'ssh',
    host: connection?.host || '',
    port: connection?.port || undefined,
    username: connection?.username || '',
    password: connection?.password || '',
    keyFile: connection?.keyFile || '',
    customCommand: connection?.customCommand || '',
    notes: connection?.notes || '',
    folder: connection?.folder || '/',
    tags: connection?.tags || [],
    favorite: connection?.favorite || false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  const handleChange = (field: keyof Connection, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      handleChange('tags', [...(formData.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    handleChange('tags', formData.tags?.filter((t) => t !== tag) || []);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.host?.trim()) {
      newErrors.host = 'Host is required';
    }

    if (formData.port && (formData.port < 1 || formData.port > 65535)) {
      newErrors.port = 'Port must be between 1 and 65535';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const now = new Date();
    const newConnection: Connection = {
      id: connection?.id || `conn-${Date.now()}`,
      name: formData.name!,
      type: formData.type!,
      host: formData.host!,
      port: formData.port,
      username: formData.username,
      password: formData.password,
      keyFile: formData.keyFile,
      customCommand: formData.customCommand,
      notes: formData.notes,
      folder: formData.folder!,
      tags: formData.tags || [],
      favorite: formData.favorite!,
      createdAt: connection?.createdAt || now,
      updatedAt: now,
      lastUsed: connection?.lastUsed,
    };

    onSave(newConnection);
  };

  const getDefaultPort = (type: ConnectionType): number | undefined => {
    switch (type) {
      case 'ssh': return 22;
      case 'rdp': return 3389;
      case 'vnc': return 5900;
      default: return undefined;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {isNew ? 'New Connection' : 'Edit Connection'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Connection Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const type = e.target.value as ConnectionType;
                  handleChange('type', type);
                  handleChange('port', getDefaultPort(type));
                }}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ssh">SSH</option>
                <option value="rdp">RDP</option>
                <option value="vnc">VNC</option>
                <option value="anydesk">AnyDesk</option>
                <option value="teamviewer">TeamViewer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full bg-gray-700 text-white border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                }`}
                placeholder="My Server"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Host *
                </label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => handleChange('host', e.target.value)}
                  className={`w-full bg-gray-700 text-white border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                    errors.host ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                  }`}
                  placeholder="192.168.1.100 or example.com"
                />
                {errors.host && <p className="text-red-400 text-sm mt-1">{errors.host}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Port
                </label>
                <input
                  type="number"
                  value={formData.port || ''}
                  onChange={(e) => handleChange('port', e.target.value ? parseInt(e.target.value) : undefined)}
                  className={`w-full bg-gray-700 text-white border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                    errors.port ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                  }`}
                  placeholder={getDefaultPort(formData.type!)?.toString()}
                />
                {errors.port && <p className="text-red-400 text-sm mt-1">{errors.port}</p>}
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Credentials</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {formData.type === 'ssh' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SSH Key File
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.keyFile}
                    onChange={(e) => handleChange('keyFile', e.target.value)}
                    className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="C:\Users\user\.ssh\id_rsa"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.pem,.ppk,.pub,*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleChange('keyFile', file.path || '');
                        }
                      };
                      input.click();
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FileKey size={18} />
                    Browse
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Organization */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Organization</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Folder
              </label>
              <select
                value={formData.folder}
                onChange={(e) => handleChange('folder', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {folders.map((folder) => (
                  <option key={folder.path} value={folder.path}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add tag..."
                  list="available-tags"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              <datalist id="available-tags">
                {availableTags.map((tag) => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-600 text-gray-200 px-3 py-1 rounded flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="favorite"
                checked={formData.favorite}
                onChange={(e) => handleChange('favorite', e.target.checked)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="favorite" className="text-sm text-gray-300">
                Mark as favorite
              </label>
            </div>
          </div>

          {/* Advanced */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Advanced</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Custom Command
              </label>
              <input
                type="text"
                value={formData.customCommand}
                onChange={(e) => handleChange('customCommand', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Leave empty to use defaults"
              />
              <p className="text-xs text-gray-500 mt-1">
                Override the default connection command
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
