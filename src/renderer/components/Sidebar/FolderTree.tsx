import React from 'react';
import { Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { useConnectionStore } from '../../store/connectionStore';

export const FolderTree: React.FC = () => {
  const {
    folders,
    selectedFolder,
    setSelectedFolder,
    toggleFolderExpanded,
    connections,
  } = useConnectionStore();

  const getConnectionCount = (folderPath: string) => {
    return connections.filter((c) => c.folder === folderPath).length;
  };

  const renderFolder = (folder: typeof folders[0], depth = 0) => {
    const isSelected = selectedFolder === folder.path;
    const count = getConnectionCount(folder.path);

    return (
      <div key={folder.path}>
        <div
          onClick={() => {
            if (folder.path !== '/') {
              toggleFolderExpanded(folder.path);
            }
            setSelectedFolder(isSelected ? null : folder.path);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {folder.path !== '/' && (
            <span className="flex-shrink-0">
              {folder.expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
          <Folder className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 truncate text-sm">{folder.name}</span>
          {count > 0 && (
            <span className="text-xs bg-gray-600 px-2 py-0.5 rounded">
              {count}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 space-y-1">
      <h3 className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2">
        Folders
      </h3>
      {folders.map((folder) => renderFolder(folder))}
    </div>
  );
};
