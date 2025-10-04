import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useConnectionStore } from '../../store/connectionStore';

interface SettingsDialogProps {
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ onClose }) => {
  const { settings, updateSettings } = useConnectionStore();
  const [formData, setFormData] = useState({
    autoLockMinutes: settings?.autoLockMinutes || 15,
    theme: settings?.theme || 'dark',
    vncClient: settings?.vncClient || '',
    rememberDatabase: settings?.rememberDatabase ?? true,
    minimizeToTray: settings?.minimizeToTray || false,
    closeToTray: settings?.closeToTray || false,
    startWithWindows: settings?.startWithWindows || false,
  });

  // Load settings from disk on mount
  useEffect(() => {
    window.electronAPI.getSettings().then((result) => {
      if (result.success && result.settings) {
        const savedSettings = result.settings;
        setFormData({
          autoLockMinutes: savedSettings.autoLockMinutes || 15,
          theme: savedSettings.theme || 'dark',
          vncClient: savedSettings.vncClient || '',
          rememberDatabase: savedSettings.rememberDatabase ?? true,
          minimizeToTray: savedSettings.minimizeToTray || false,
          closeToTray: savedSettings.closeToTray || false,
          startWithWindows: savedSettings.startWithWindows || false,
        });
        updateSettings(savedSettings);
      }
    }).catch((error) => {
      console.error('Failed to load settings:', error);
    });
  }, [updateSettings]);

  const handleSave = () => {
    updateSettings(formData);
    
    // Notify main process about settings changes
    window.electronAPI.updateSettings(formData).catch((error) => {
      console.error('Failed to update settings:', error);
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Auto Lock */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Auto Lock After (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={formData.autoLockMinutes}
              onChange={(e) => setFormData({ ...formData, autoLockMinutes: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Set to 0 to disable auto-lock</p>
          </div>

          {/* VNC Client Path */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              VNC Client Path (optional)
            </label>
            <input
              type="text"
              value={formData.vncClient}
              onChange={(e) => setFormData({ ...formData, vncClient: e.target.value })}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="C:\\Program Files\\TightVNC\\vncviewer.exe"
            />
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value as any })}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Remember Database */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rememberDatabase}
                onChange={(e) => setFormData({ ...formData, rememberDatabase: e.target.checked })}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Remember database file path</span>
            </label>
          </div>

          {/* System Tray Options */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">System Tray</h3>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.minimizeToTray}
                  onChange={(e) => setFormData({ ...formData, minimizeToTray: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Minimize to tray</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.closeToTray}
                  onChange={(e) => setFormData({ ...formData, closeToTray: e.target.checked })}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Close to tray instead of exit</span>
              </label>
            </div>
          </div>

          {/* Autostart */}
          <div className="border-t border-gray-700 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.startWithWindows}
                onChange={(e) => setFormData({ ...formData, startWithWindows: e.target.checked })}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Start with Windows</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Save size={18} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
