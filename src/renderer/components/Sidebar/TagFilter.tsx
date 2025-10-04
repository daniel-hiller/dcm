import React from 'react';
import { Tag, X } from 'lucide-react';
import { useConnectionStore } from '../../store/connectionStore';

export const TagFilter: React.FC = () => {
  const { tags, selectedTags, setSelectedTags } = useConnectionStore();

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  return (
    <div className="p-3 border-t border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
          <Tag className="w-3 h-3" />
          Tags
        </h3>
        {selectedTags.length > 0 && (
          <button
            onClick={clearAllTags}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {tags.length === 0 ? (
        <p className="text-xs text-gray-500 px-3 py-2">No tags yet</p>
      ) : (
        <div className="space-y-1">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="truncate">{tag}</span>
                {isSelected && <X className="w-3 h-3 ml-2 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
