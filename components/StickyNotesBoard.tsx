
import React, { useState } from 'react';
import { StickyNote } from '../types';
import { Plus, X, Trash2, Palette, StickyNote as NoteIcon } from 'lucide-react';

interface StickyNotesBoardProps {
    isOpen: boolean;
    notes: StickyNote[];
    onAddNote: (color: string) => void;
    onUpdateNote: (id: string, content: string) => void;
    onDeleteNote: (id: string) => void;
    onChangeColor: (id: string, color: string) => void;
    onClose: () => void;
}

export const StickyNotesBoard: React.FC<StickyNotesBoardProps> = ({ 
    isOpen, notes, onAddNote, onUpdateNote, onDeleteNote, onChangeColor, onClose
}) => {
    if (!isOpen) return null;

    const colors = [
        { name: 'yellow', class: 'bg-amber-100 border-amber-200 text-amber-900 placeholder-amber-800/50' },
        { name: 'pink', class: 'bg-pink-100 border-pink-200 text-pink-900 placeholder-pink-800/50' },
        { name: 'blue', class: 'bg-sky-100 border-sky-200 text-sky-900 placeholder-sky-800/50' },
        { name: 'green', class: 'bg-green-100 border-green-200 text-green-900 placeholder-green-800/50' },
        { name: 'purple', class: 'bg-purple-100 border-purple-200 text-purple-900 placeholder-purple-800/50' },
    ];

    const getColorClass = (colorName: string) => {
        return colors.find(c => c.name === colorName)?.class || colors[0].class;
    };

    return (
        <div className="fixed right-0 top-[57px] bottom-0 w-80 sm:w-96 bg-gray-50/95 backdrop-blur-md shadow-2xl border-l border-gray-200 flex flex-col z-30 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-800 font-bold">
                    <NoteIcon size={18} className="text-amber-500" />
                    <span>Sticky Notes</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onAddNote('yellow')}
                        className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                        <Plus size={14} /> New Note
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {notes.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-sm">No notes yet.</p>
                        <p className="text-xs mt-1 opacity-70">Add a sticky note to jot down ideas for this scene.</p>
                        <div className="mt-4 text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                            Tip: Notes are saved with the currently active document.
                        </div>
                    </div>
                )}
                
                {notes.map(note => (
                    <div 
                        key={note.id} 
                        className={`p-4 rounded-xl shadow-sm border relative group transition-all hover:shadow-md ${getColorClass(note.color)}`}
                        style={{ transform: `rotate(${note.rotation || 0}deg)` }}
                    >
                        <textarea
                            value={note.content}
                            onChange={(e) => onUpdateNote(note.id, e.target.value)}
                            placeholder="Write something..."
                            className="w-full bg-transparent border-none resize-none focus:ring-0 text-sm font-medium leading-relaxed h-32 p-0 scrollbar-hide"
                        />
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/50 backdrop-blur rounded-lg p-1 shadow-sm">
                            <div className="flex gap-1 pr-1 border-r border-gray-300/50">
                                {colors.map(c => (
                                    <button 
                                        key={c.name}
                                        onClick={() => onChangeColor(note.id, c.name)}
                                        className={`w-3 h-3 rounded-full border border-black/10 ${c.class.split(' ')[0]} hover:scale-125 transition-transform`}
                                    />
                                ))}
                            </div>
                            <button 
                                onClick={() => onDeleteNote(note.id)}
                                className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
