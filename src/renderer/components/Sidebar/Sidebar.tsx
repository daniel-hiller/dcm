import React, { useState } from 'react';
import { Settings, Lock, FolderPlus, Tag } from 'lucide-react';
import { FolderTree } from './FolderTree';
import { TagFilter } from './TagFilter';
import { SettingsDialog } from './SettingsDialog';
import { FolderManagementDialog } from './FolderManagementDialog';
import { TagManagementDialog } from './TagManagementDialog';
import { useConnectionStore } from '../../store/connectionStore';
import logoSvg from '../../assets/logo.svg';

export const Sidebar: React.FC = () => {
  const { logout } = useConnectionStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showFolderManagement, setShowFolderManagement] = useState(false);
  const [showTagManagement, setShowTagManagement] = useState(false);

  const handleLock = () => {
    if (confirm('Lock the application? You will need to enter your master password again.')) {
      logout();
    }
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <img 
            src={logoSvg} 
            alt="DCM Logo" 
            className="w-10 h-10"
          />
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">DCM</h1>
            <p className="text-xs text-gray-400">Connection Manager</p>
          </div>
          <button
            onClick={handleLock}
            className="text-gray-400 hover:text-white transition-colors"
            title="Lock Application"
          >
            <Lock size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <FolderTree />
        <TagFilter />
      </div>

      <div className="border-t border-gray-700 p-3 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => setShowFolderManagement(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            title="Manage Folders"
          >
            <FolderPlus size={16} />
            Folders
          </button>
          <button
            onClick={() => setShowTagManagement(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            title="Manage Tags"
          >
            <Tag size={16} />
            Tags
          </button>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
          title="Settings"
        >
          <Settings size={16} />
          Settings
        </button>
      </div>

      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} />}
      {showFolderManagement && <FolderManagementDialog onClose={() => setShowFolderManagement(false)} />}
      {showTagManagement && <TagManagementDialog onClose={() => setShowTagManagement(false)} />}
    </div>
  );
};
