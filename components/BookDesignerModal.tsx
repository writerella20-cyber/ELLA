
import React, { useState } from 'react';
import { X, BookOpen, Wand2, Check } from 'lucide-react';
import { BOOK_DESIGNS } from '../data/bookDesigns';
import { BookDesign } from '../types';

interface BookDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (design: BookDesign, scope: 'active' | 'all') => void;
}

export const BookDesignerModal: React.FC<BookDesignerModalProps> = ({ isOpen, onClose, onApply }) => {
  const [selectedDesign, setSelectedDesign] = useState<BookDesign>(BOOK_DESIGNS[0]);
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const handleApply = (scope: 'active' | 'all') => {
    setIsApplying(true);
    // Simulate a tiny delay for effect
    setTimeout(() => {
        onApply(selectedDesign, scope);
        setIsApplying(false);
        onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Wand2 className="text-indigo-600" />
                One-Step Book Designer
            </h2>
            <p className="text-gray-500 text-sm mt-1">Automatically format your manuscript with professional layouts.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
            
            {/* Sidebar List */}
            <div className="w-72 border-r border-gray-200 overflow-y-auto bg-gray-50 p-4 space-y-3">
                {BOOK_DESIGNS.map(design => (
                    <button
                        key={design.id}
                        onClick={() => setSelectedDesign(design)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 relative group
                            ${selectedDesign.id === design.id 
                                ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' 
                                : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'}
                        `}
                    >
                        <h3 className={`font-bold ${selectedDesign.id === design.id ? 'text-indigo-700' : 'text-gray-800'}`}>
                            {design.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{design.description}</p>
                        
                        {selectedDesign.id === design.id && (
                            <div className="absolute top-4 right-4 text-indigo-500">
                                <Check size={16} />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex justify-center">
                <div 
                    className="bg-white shadow-xl w-full max-w-[816px] min-h-[1056px] p-16 origin-top transition-all duration-300"
                    style={{ backgroundColor: selectedDesign.previewColor }}
                >
                     {/* Live Preview of the Style */}
                     <div style={{ fontFamily: selectedDesign.styles.fontHeading, marginBottom: '2em' }}>
                         <h1 style={{ 
                             fontSize: '2.5em', 
                             fontWeight: 'bold', 
                             textAlign: 'center', 
                             textTransform: selectedDesign.styles.headingUppercase ? 'uppercase' : 'none',
                             marginBottom: '0.2em'
                         }}>
                             Chapter One
                         </h1>
                         <h2 style={{ 
                             fontSize: '1.5em', 
                             fontWeight: 'normal', 
                             textAlign: 'center',
                             fontStyle: 'italic',
                             marginBottom: '2em',
                             opacity: 0.7
                         }}>
                             The Beginning
                         </h2>
                     </div>

                     <div style={{ 
                         fontFamily: selectedDesign.styles.fontBody, 
                         fontSize: selectedDesign.styles.fontSize,
                         lineHeight: '1.7',
                         textAlign: selectedDesign.styles.justify ? 'justify' : 'left'
                     }}>
                         {/* Paragraph 1 */}
                         <p style={{
                             marginBottom: selectedDesign.styles.paragraphSpacing ? '1em' : '0',
                             textIndent: '0' // First paragraph usually no indent
                         }}>
                             {selectedDesign.styles.dropCap && (
                                 <span style={{ 
                                     float: 'left', 
                                     fontSize: '3.5em', 
                                     lineHeight: '0.8', 
                                     paddingTop: '4px', 
                                     paddingRight: '8px', 
                                     fontFamily: selectedDesign.styles.fontHeading,
                                     fontWeight: 'bold'
                                 }}>I</span>
                             )}
                             t was a bright