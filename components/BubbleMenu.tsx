import React from 'react';
import { Bold, Italic, Sparkles, Underline, Highlighter, Strikethrough, Subscript, Superscript } from 'lucide-react';

interface BubbleMenuProps {
    position: { x: number, y: number } | null;
    onFormat: (format: string) => void;
    onMagic: () => void;
}

export const BubbleMenu: React.FC<BubbleMenuProps> = ({ position, onFormat, onMagic }) => {
    if (!position) return null;
    
    // Prevent mouse down from stealing focus from the editor
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div 
            className="fixed z-50 bg-gray-900 text-white shadow-xl rounded-full px-2 py-1 flex items-center gap-1 -translate-x-1/2 animate-in fade-in zoom-in-95 duration-200 select-none"
            style={{ top: position.y - 45, left: position.x }}
            onMouseDown={handleMouseDown}
        >
            <button onClick={() => onFormat('bold')} className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Bold"><Bold size={14}/></button>
            <button onClick={() => onFormat('italic')} className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Italic"><Italic size={14}/></button>
            <button onClick={() => onFormat('underline')} className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Underline"><Underline size={14}/></button>
            <button onClick={() => onFormat('strikeThrough')} className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Strikethrough"><Strikethrough size={14}/></button>
            <button onClick={() => onFormat('subscript')} className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Subscript"><Subscript size={14}/></button>
            <button onClick={() => onFormat('superscript')} className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Superscript"><Superscript size={14}/></button>
             <button onClick={() => onFormat('hiliteColor')} className="p-2 hover:bg-gray-700 rounded-full text-yellow-300 transition-colors" title="Highlight"><Highlighter size={14}/></button>
            <div className="w-px h-4 bg-gray-700 mx-1"></div>
            <button 
                onClick={onMagic} 
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-purple-600 rounded-full text-xs font-medium bg-purple-700 transition-colors ml-1 shadow-sm ring-1 ring-purple-500/50"
            >
                <Sparkles size={12} className="text-purple-100"/> 
                <span>AI Refine</span>
            </button>
        </div>
    )
}