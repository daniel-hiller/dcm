import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Edit2, Check } from 'lucide-react';
import { useConnectionStore } from '../../store/connectionStore';

interface TagManagementDialogProps {
  onClose: () => void;
}

export const TagManagementDialog: React.FC<TagManagementDialogProps> = ({ onClose }) => {
  const { tags, addTag, removeTag, renameTag, connections } = useConnectionStore();
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  const getTagUsageCount = (tag: string) => {
    return connections.filter(c => c.tags.includes(tag)).length;
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      setError('Tag name cannot be empty');
      return;
    }

    if (tags.includes(newTagName.trim())) {
      setError('Tag already exists');
      return;
    }

    addTag(newTagName.trim());
    setNewTagName('');
    setError('');
  };

  const handleDeleteTag = (tag: string) => {
    const count = getTagUsageCount(tag);
    const message = count > 0
      ? `Delete tag "${tag}"? It is used in ${count} connection(s).`
      : `Delete tag "${tag}"?`;
    
    if (confirm(message)) {
      removeTag(tag);
    }
  };

  const handleStartEdit = (tag: string) => {
    setEditingTag(tag);
    setEditValue(tag);
  };

  const handleSaveEdit = (oldTag: string) => {
    if (!editValue.trim() || editValue === oldTag) {
      setEditingTag(null);
      return;
    }

    if (tags.includes(editValue.trim()) && editValue !== oldTag) {
      alert('Tag name already exists');
      return;
    }

    renameTag(oldTag, editValue.trim());
    setEditingTag(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag size={24} />
            Manage Tags
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Add New Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Tag
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => {
                  setNewTagName(e.target.value);
                  setError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="production, development, etc."
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>

          {/* Existing Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Existing Tags
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tags.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No tags yet</p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2"
                  >
                    {editingTag === tag ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(tag);
                            if (e.key === 'Escape') setEditingTag(null);
                          }}
                          className="flex-1 bg-gray-600 text-white border border-gray-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(tag)}
                          className="text-green-400 hover:text-green-300"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setEditingTag(null)}
                          className="text-gray-400 hover:text-gray-300"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-white">{tag}</span>
                          <span className="text-xs text-gray-400">
                            ({getTagUsageCount(tag)})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(tag)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
