
import React, { useState } from 'react';
import { FileText, Folder, GripVertical, Plus, X, Trash2 } from 'lucide-react';
import { BinderItem, StickyNote, WorkspaceTheme } from '../types';

interface CorkboardProps {
  items: BinderItem[];
  parentId: string | null; // For context
  onReorder: (parentId: string | null, fromIndex: number, toIndex: number) => void;
  onSelect: (id: string) => void;
  notes?: StickyNote[];
  onUpdateNotes?: (notes: StickyNote[]) => void;
  theme?: WorkspaceTheme;
}

export const Corkboard: React.FC<CorkboardProps> = ({ items, parentId, onReorder, onSelect, notes = [], onUpdateNotes, theme }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    
    onReorder(parentId, draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  const handleAddNote = () => {
      if (!onUpdateNotes) return;
      const colors = ['yellow', 'pink', 'blue', 'green', 'purple'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newNote: StickyNote = {
          id: Date.now().toString(),
          content: '',
          color: randomColor,
          rotation: (Math.random() - 0.5) * 6
      };
      onUpdateNotes([...notes, newNote]);
  };

  const handleUpdateNote = (id: string, content: string) => {
      if (!onUpdateNotes) return;
      const updated = notes.map(n => n.id === id ? { ...n, content } : n);
      onUpdateNotes(updated);
  };

  const handleDeleteNote = (id: string) => {
      if (!onUpdateNotes) return;
      if (confirm('Delete this note?')) {
          const updated = notes.filter(n => n.id !== id);
          onUpdateNotes(updated);
      }
  };

  const getNoteColor = (color: string) => {
      switch(color) {
          case 'pink': return 'bg-pink-200 text-pink-900 border-pink-300';
          case 'blue': return 'bg-sky-200 text-sky-900 border-sky-300';
          case 'green': return 'bg-green-200 text-green-900 border-green-300';
          case 'purple': return 'bg-purple-200 text-purple-900 border-purple-300';
          default: return 'bg-yellow-200 text-yellow-900 border-yellow-300'; // Yellow
      }
  };

  const getPreviewText = (html?: string) => {
    if (!html) return "No content...";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.substring(0, 150) + (text.length > 150 ? "..." : "");
  };

  const containerStyle = theme ? { background: theme.background } : {};
  const isDark = theme?.isDark;
  const textColor = isDark ? 'text-gray-200' : 'text-gray-600';
  const headingColor = isDark ? 'text-gray-100' : 'text-gray-800';

  const isEmpty = items.length === 0 && notes.length === 0;

  if (isEmpty) {
    return (
        <div 
            className="flex-1 h-full p-8 flex flex-col items-center justify-center transition-colors duration-300"
            style={containerStyle}
        >
            <div className={`text-center mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Folder size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-serif italic">This board is empty.</p>
                <p className="text-sm">Add documents or sticky notes to organize your thoughts.</p>
            </div>
            {onUpdateNotes && (
                <button 
                    onClick={handleAddNote}
                    className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-6 py-2 rounded-full font-bold shadow-md transition-transform hover:-translate-y-1"
                >
                    <Plus size={18} /> Add First Sticky Note
                </button>
            )}
        </div>
    );
  }

  return (
    <div 
        className="flex-1 h-full overflow-y-auto p-8 transition-colors duration-300"
        style={containerStyle}
    >
      
      {/* Toolbar / Header within Corkboard */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-end">
          {onUpdateNotes && (
              <button 
                  onClick={handleAddNote}
                  className="flex items-center gap-1 bg-white/80 hover:bg-white text-gray-700 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 text-sm font-medium transition-all"
              >
                  <Plus size={16} className="text-yellow-600" /> New Note
              </button>
          )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        
        {/* Render Sticky Notes First */}
        {notes.map(note => (
            <div
                key={note.id}
                className={`
                    relative group h-64 rounded-sm shadow-md hover:shadow-xl transition-all duration-300 flex flex-col
                    ${getNoteColor(note.color)}
                `}
                style={{ transform: `rotate(${note.rotation || 0}deg)` }}
            >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-400 shadow-sm z-20 border border-black/10"></div>
                
                <div className="flex-1 p-4">
                    <textarea 
                        className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-lg font-handwriting leading-relaxed placeholder-black/20"
                        value={note.content}
                        onChange={(e) => handleUpdateNote(note.id, e.target.value)}
                        placeholder="Write a note..."
                        style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
                    />
                </div>
                
                <button 
                    onClick={() => handleDeleteNote(note.id)}
                    className="absolute top-2 right-2 p-1 text-black/20 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        ))}

        {/* Render Documents */}
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => onSelect(item.id)}
            className={`
              relative group h-64 rounded-sm shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col border-t-4
              ${item.type === 'folder' ? 'border-indigo-500' : 'border-gray-800'}
              ${draggedIndex === index ? 'opacity-40 scale-95 ring-2 ring-indigo-400' : ''}
              ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}
            `}
          >
            {/* Header / Pin */}
            <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-100 bg-gray-50/50'}`}>
                <div className="flex items-center gap-2 overflow-hidden">
                    {item.type === 'folder' ? <Folder size={14} className="text-indigo-500 shrink-0"/> : <FileText size={14} className="text-gray-500 shrink-0"/>}
                    <h3 className={`font-bold truncate text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.title}</h3>
                </div>
                <GripVertical size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing" />
            </div>

            {/* Body / Index Card Lines */}
            <div className="flex-1 p-4 relative overflow-hidden">
                {/* Lined paper effect - only visible in light mode usually, disable for dark mode to keep clean */}
                {!isDark && (
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_23px,#e5e7eb_24px)] bg-[length:100%_24px] pointer-events-none mt-10"></div>
                )}
                
                <p className={`text-sm font-serif leading-[24px] relative z-10 pointer-events-none select-none ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getPreviewText(item.content)}
                </p>
            </div>

            {/* Footer */}
            <div className="p-2 text-right">
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                    {item.type === 'folder' ? 'Section' : 'Scene'}
                </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
