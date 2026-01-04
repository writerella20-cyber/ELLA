
import React, { useState } from 'react';
import { 
  Folder, FileText, ChevronRight, ChevronDown, Trash2, 
  Book, FilePlus, FolderPlus, X, Bookmark
} from 'lucide-react';
import { BinderItem } from '../types';

interface BinderSidebarProps {
  isOpen: boolean;
  items: BinderItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onAddItem: (type: 'folder' | 'document', parentId?: string) => void;
  onDeleteItem: (id: string) => void;
  onRenameItem: (id: string, newName: string) => void;
  onToggleBookmark: (id: string) => void;
  onClose: () => void;
}

const BinderNode: React.FC<{
  item: BinderItem;
  level: number;
  activeId: string | null;
  onSelect: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onAddItem: (type: 'folder' | 'document', parentId?: string) => void;
  onDeleteItem: (id: string) => void;
  onRenameItem: (id: string, newName: string) => void;
  onToggleBookmark: (id: string) => void;
  isVisible: boolean; // For filtering
}> = ({ item, level, activeId, onSelect, onToggleFolder, onAddItem, onDeleteItem, onRenameItem, onToggleBookmark, isVisible }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.title);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmitRename = () => {
    if (editName.trim()) {
      onRenameItem(item.id, editName);
    } else {
      setEditName(item.title);
    }
    setIsEditing(false);
  };

  const isSelected = activeId === item.id;

  if (!isVisible) return null;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-1 py-1.5 px-2 cursor-pointer transition-colors group relative
          ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onSelect(item.id)} // Always select on main click
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
        }}
      >
        {/* Expand Toggle */}
        <div className="shrink-0 w-4 h-4 flex items-center justify-center text-gray-400">
          {item.type === 'folder' && (
             <button 
                onClick={(e) => { e.stopPropagation(); onToggleFolder(item.id); }} 
                className="hover:text-gray-800 p-0.5 rounded"
             >
                {item.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
             </button>
          )}
        </div>

        {/* Icon */}
        <div className={`shrink-0 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`}>
          {item.type === 'folder' ? <Folder size={16} fill={item.isOpen ? "currentColor" : "none"} className="opacity-80"/> : <FileText size={16} />}
        </div>

        {/* Title */}
        {isEditing ? (
          <input 
            autoFocus
            type="text" 
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSubmitRename}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitRename()}
            onClick={(e) => e.stopPropagation()}
            className="ml-2 text-sm bg-white border border-indigo-300 rounded px-1 py-0.5 w-full min-w-0 outline-none"
          />
        ) : (
          <span className="ml-2 text-sm truncate flex-1">
              {item.title}
          </span>
        )}

        {/* Bookmark & Actions Container */}
        <div className="flex items-center gap-1">
            {/* Bookmark Toggle - Always visible (dimmed if inactive) for better discoverability */}
            <button
                onClick={(e) => { e.stopPropagation(); onToggleBookmark(item.id); }}
                className={`p-1 rounded-md transition-all ${
                    item.isBookmarked 
                    ? 'text-red-500 opacity-100 scale-100' 
                    : 'text-gray-300 hover:text-red-400 opacity-40 hover:opacity-100 hover:scale-110'
                }`}
                title={item.isBookmarked ? "Remove Bookmark" : "Bookmark this"}
            >
                <Bookmark size={14} fill={item.isBookmarked ? "currentColor" : "none"} />
            </button>

            {/* Editing Actions (Hover or Selected) */}
            {(isHovered || isSelected) && !isEditing && (
                <div className="flex items-center bg-white/90 shadow-sm rounded border border-gray-100 p-0.5 z-10 ml-1">
                    {item.type === 'folder' && (
                        <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onAddItem('document', item.id); }}
                                className="p-1 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 rounded"
                                title="Add File inside"
                            >
                                <FilePlus size={12} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onAddItem('folder', item.id); }}
                                className="p-1 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 rounded"
                                title="Add Folder inside"
                            >
                                <FolderPlus size={12} />
                            </button>
                        </>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                        className="p-1 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded"
                        title="Delete"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Children */}
      {item.type === 'folder' && item.isOpen && item.children && (
        <div className="border-l border-gray-100 ml-4">
          {item.children.map(child => (
            <BinderNode 
              key={child.id} 
              item={child} 
              level={level + 1}
              activeId={activeId}
              onSelect={onSelect}
              onToggleFolder={onToggleFolder}
              onAddItem={onAddItem}
              onDeleteItem={onDeleteItem}
              onRenameItem={onRenameItem}
              onToggleBookmark={onToggleBookmark}
              isVisible={isVisible} 
            />
          ))}
          {item.children.length === 0 && (
              <div className="pl-8 py-1 text-xs text-gray-400 italic">Empty folder</div>
          )}
        </div>
      )}
    </div>
  );
};

export const BinderSidebar: React.FC<BinderSidebarProps> = (props) => {
  const [filterMode, setFilterMode] = useState<'all' | 'bookmarks'>('all');

  if (!props.isOpen) return null;

  // Filter logic
  const isItemVisible = (item: BinderItem): boolean => {
      if (filterMode === 'all') return true;
      if (item.isBookmarked) return true;
      if (item.children) {
          return item.children.some(child => isItemVisible(child));
      }
      return false;
  };

  return (
    <>
        {/* Overlay for mobile */}
        <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={props.onClose}
        ></div>

        <div className="absolute md:relative z-50 md:z-auto w-[280px] md:w-64 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0 h-full shadow-2xl md:shadow-none animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-serif text-gray-800 font-semibold">
                    <Book size={18} className="text-gray-500"/>
                    <span>Binder</span>
                </div>
                <button onClick={props.onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200">
                    <X size={16} />
                </button>
            </div>
            
            {/* Filter Toggle */}
            <div className="flex bg-gray-200 p-0.5 rounded-lg">
                <button 
                    onClick={() => setFilterMode('all')}
                    className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${filterMode === 'all' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilterMode('bookmarks')}
                    className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1 ${filterMode === 'bookmarks' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Bookmark size={10} className={filterMode === 'bookmarks' ? 'fill-red-600' : ''} /> Bookmarks
                </button>
            </div>
        </div>

        {/* Primary Actions */}
        {filterMode === 'all' && (
            <div className="p-2 grid grid-cols-2 gap-2 border-b border-gray-200 bg-gray-50">
                <button 
                    onClick={() => props.onAddItem('document')}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm"
                >
                    <FilePlus size={14} /> New Doc
                </button>
                <button 
                    onClick={() => props.onAddItem('folder')}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm"
                >
                    <FolderPlus size={14} /> Group
                </button>
            </div>
        )}

        {/* Tree Content */}
        <div className="flex-1 overflow-y-auto py-2">
            {props.items.length === 0 && (
                <div className="text-center p-8 text-sm text-gray-400">
                    Your binder is empty. Create a document to start writing.
                </div>
            )}
            {props.items.map(item => (
                <BinderNode 
                    key={item.id} 
                    item={item} 
                    level={0}
                    {...props}
                    isVisible={isItemVisible(item)}
                />
            ))}
            {filterMode === 'bookmarks' && !props.items.some(i => isItemVisible(i)) && (
                <div className="text-center p-8 text-sm text-gray-400 italic flex flex-col items-center">
                    <Bookmark size={24} className="mb-2 opacity-20" />
                    <p>No bookmarks found.</p>
                    <p className="text-xs mt-2 opacity-70 max-w-[150px]">Click the bookmark icon next to any document in 'All' view to save it here.</p>
                </div>
            )}
        </div>
        
        {/* Footer info */}
        <div className="p-3 border-t border-gray-200 text-xs text-gray-400 text-center bg-gray-50">
            {props.items.reduce((acc, item) => acc + (item.children ? item.children.length + 1 : 1), 0)} items
        </div>
        </div>
    </>
  );
};
