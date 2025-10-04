import React from 'react';
import { 
  Terminal, 
  Monitor, 
  Eye, 
  Users, 
  Video,
  Star,
  Clock,
} from 'lucide-react';
import type { Connection, ConnectionType } from '@shared/types';

interface ConnectionCardProps {
  connection: Connection;
  isSelected: boolean;
  onSelect: () => void;
  onConnect: () => void;
  onToggleFavorite: () => void;
}

const CONNECTION_ICONS: Record<ConnectionType, React.ReactNode> = {
  ssh: <Terminal className="w-5 h-5" />,
  rdp: <Monitor className="w-5 h-5" />,
  vnc: <Eye className="w-5 h-5" />,
  anydesk: <Users className="w-5 h-5" />,
  teamviewer: <Video className="w-5 h-5" />,
};

const CONNECTION_COLORS: Record<ConnectionType, string> = {
  ssh: 'bg-green-600',
  rdp: 'bg-blue-600',
  vnc: 'bg-purple-600',
  anydesk: 'bg-red-600',
  teamviewer: 'bg-indigo-600',
};

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  isSelected,
  onSelect,
  onConnect,
  onToggleFavorite,
}) => {
  const formatLastUsed = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      onClick={onSelect}
      onDoubleClick={onConnect}
      className={`p-3 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-600 ring-2 ring-blue-400'
          : 'bg-gray-700 hover:bg-gray-650'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`${CONNECTION_COLORS[connection.type]} p-2 rounded-lg flex-shrink-0`}>
          {CONNECTION_ICONS[connection.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white truncate">{connection.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="flex-shrink-0"
            >
              <Star
                className={`w-4 h-4 ${
                  connection.favorite
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-400 hover:text-yellow-400'
                }`}
              />
            </button>
          </div>

          <p className="text-sm text-gray-300 truncate mt-1">
            {connection.username && `${connection.username}@`}
            {connection.host}
            {connection.port && `:${connection.port}`}
          </p>

          {/* Tags */}
          {connection.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {connection.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-600 text-gray-200 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Last Used */}
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatLastUsed(connection.lastUsed)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
