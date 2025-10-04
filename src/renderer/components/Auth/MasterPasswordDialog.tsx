import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, FolderOpen, X, MoreHorizontal, Trash2, ExternalLink, Github } from 'lucide-react';
import logoSvg from '../../assets/logo.svg';

// Get version from package.json
const APP_VERSION = '1.0.1';

interface MasterPasswordDialogProps {
  onAuthenticated: (password: string) => void;
}

export const MasterPasswordDialog: React.FC<MasterPasswordDialogProps> = ({ onAuthenticated }) => {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [databasePath, setDatabasePath] = useState('');
  const [rememberPath, setRememberPath] = useState(true);
  const [recentPaths, setRecentPaths] = useState<string[]>([]);
  const [showAllPaths, setShowAllPaths] = useState(false);

  useEffect(() => {
    checkFirstTime();
    loadRecentPaths();
  }, []);

  const loadRecentPaths = () => {
    const stored = localStorage.getItem('dcm_recent_paths');
    if (stored) {
      try {
        const paths = JSON.parse(stored);
        setRecentPaths(paths);
        // Auto-select most recent if available and user hasn't chosen
        if (paths.length > 0 && !databasePath) {
          setDatabasePath(paths[0]);
        }
      } catch (e) {
        console.error('Failed to parse recent paths');
      }
    }
  };

  const saveRecentPath = (path: string) => {
    if (!rememberPath || !path.trim()) return;
    
    const updated = [path, ...recentPaths.filter(p => p !== path)].slice(0, 20);
    setRecentPaths(updated);
    localStorage.setItem('dcm_recent_paths', JSON.stringify(updated));
  };

  const handleSelectPath = (path: string) => {
    setDatabasePath(path);
    setShowAllPaths(false);
  };

  const handleBrowseFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.encrypted,.db,*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const path = file.path || '';
        setDatabasePath(path);
        saveRecentPath(path);
      }
    };
    input.click();
  };

  const handleRemovePath = (pathToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentPaths.filter(p => p !== pathToRemove);
    setRecentPaths(updated);
    localStorage.setItem('dcm_recent_paths', JSON.stringify(updated));
    if (databasePath === pathToRemove) {
      setDatabasePath('');
    }
  };

  const checkFirstTime = async () => {
    try {
      const hasMasterPassword = await window.electronAPI.hasMasterPassword();
      setIsFirstTime(!hasMasterPassword);
      setLoading(false);
    } catch (err) {
      setError('Failed to check authentication status');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate database path
    if (!databasePath.trim()) {
      setError('Please select a database file');
      return;
    }

    if (isFirstTime) {
      // Create new master password
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      try {
        const result = await window.electronAPI.setMasterPassword(password);
        if (result.success) {
          saveRecentPath(databasePath);
          onAuthenticated(password);
        } else {
          setError(result.error || 'Failed to set password');
        }
      } catch (err) {
        setError('Failed to set master password');
      }
    } else {
      // Verify existing password
      try {
        const isValid = await window.electronAPI.verifyMasterPassword(password);
        if (isValid) {
          saveRecentPath(databasePath);
          onAuthenticated(password);
        } else {
          setError('Invalid password');
          setPassword('');
        }
      } catch (err) {
        setError('Failed to verify password');
      }
    }
  };

  const visiblePaths = recentPaths.slice(0, 5);
  const hasMorePaths = recentPaths.length > 5;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md my-4">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={logoSvg} 
              alt="DCM Logo" 
              className="w-24 h-24"
            />
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">
            DCM
          </h1>
          <p className="text-gray-400 text-center mb-6">
            Daniel's Connection Manager
          </p>

        {isFirstTime ? (
          <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
            <p className="text-sm text-blue-300">
              Welcome! Create a master password and choose where to store your encrypted database.
            </p>
            <p className="text-xs text-blue-400 mt-2">
              ⚠️ Keep this password safe - it cannot be recovered!
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-center mb-6">
            Enter your master password to unlock
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Database File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Database File <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={databasePath}
                onChange={(e) => setDatabasePath(e.target.value)}
                className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Select or enter database file path..."
                required
              />
              <button
                type="button"
                onClick={handleBrowseFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title="Browse for database file"
              >
                <FolderOpen size={20} />
              </button>
            </div>

            {/* Recent Files */}
            {recentPaths.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Recent files:</span>
                  {hasMorePaths && (
                    <button
                      type="button"
                      onClick={() => setShowAllPaths(true)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <MoreHorizontal size={14} />
                      {recentPaths.length - 5} more
                    </button>
                  )}
                </div>
                {visiblePaths.map((path, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectPath(path)}
                    className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      databasePath === path
                        ? 'bg-blue-600/30 border border-blue-500'
                        : 'bg-gray-700/50 hover:bg-gray-700 border border-transparent'
                    }`}
                  >
                    <span className="text-xs text-gray-300 truncate flex-1 mr-2" title={path}>
                      {path}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleRemovePath(path, e)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberPath}
                onChange={(e) => setRememberPath(e.target.checked)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-400">Remember file path history</span>
            </label>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {isFirstTime ? 'Create Master Password' : 'Master Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                required
                minLength={8}
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

          {isFirstTime && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm password"
                required
                minLength={8}
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            {isFirstTime ? 'Create & Continue' : 'Unlock'}
          </button>
        </form>

        {isFirstTime && (
          <div className="mt-6 text-xs text-gray-500 space-y-1">
            <p>✓ Password must be at least 8 characters</p>
            <p>✓ All connections will be encrypted with AES-256</p>
            <p>✓ Database file will be created at selected location</p>
          </div>
        )}
        </div>
      </div>

      {/* All Paths Modal */}
      {showAllPaths && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">All Recent Files</h3>
              <button
                onClick={() => setShowAllPaths(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto space-y-2">
              {recentPaths.map((path, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectPath(path)}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    databasePath === path
                      ? 'bg-blue-600/30 border border-blue-500'
                      : 'bg-gray-700/50 hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <span className="text-sm text-gray-300 break-all flex-1 mr-2">
                    {path}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleRemovePath(path, e)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="text-gray-400">
            © {new Date().getFullYear()} Daniel Hiller · v{APP_VERSION}
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.electronAPI.openExternal('https://dcm.hillerdaniel.de');
              }}
              className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>Homepage</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.electronAPI.openExternal('https://github.com/daniel-hiller/dcm');
              }}
              className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Github size={14} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
