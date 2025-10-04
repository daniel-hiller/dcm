import React from 'react';
import { Search, SlidersHorizontal, Star } from 'lucide-react';
import { useConnectionStore } from '../../store/connectionStore';

export const SearchBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    showFavoritesOnly,
    toggleShowFavoritesOnly,
    sortBy,
    setSortBy,
  } = useConnectionStore();

  return (
    <div className="p-4 bg-gray-800 border-b border-gray-700">
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connections..."
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button
          onClick={toggleShowFavoritesOnly}
          className={`px-3 py-2 rounded-lg transition-colors ${
            showFavoritesOnly
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
          title="Show favorites only"
        >
          <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex gap-2 items-center">
        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-400">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'lastUsed' | 'type')}
          className="flex-1 bg-gray-700 text-white text-xs border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Name</option>
          <option value="lastUsed">Last Used</option>
          <option value="type">Type</option>
        </select>
      </div>
    </div>
  );
};
