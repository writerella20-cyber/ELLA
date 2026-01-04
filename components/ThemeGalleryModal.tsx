
import React from 'react';
import { X, Palette, Check } from 'lucide-react';
import { WORKSPACE_THEMES } from '../data/themes';
import { WorkspaceTheme } from '../types';

interface ThemeGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: WorkspaceTheme) => void;
  activeThemeId: string;
}

export const ThemeGalleryModal: React.FC<ThemeGalleryModalProps> = ({ isOpen, onClose, onSelectTheme, activeThemeId }) => {
  if (!isOpen) return null;

  const handleSelect = (theme: WorkspaceTheme) => {
      onSelectTheme(theme);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[80vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Palette className="text-indigo-600" />
                Workspace Themes
            </h2>
            <p className="text-gray-500 text-sm mt-1">Customize your writing environment.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Grid */}
        <div className="p-8 overflow-y-auto bg-gray-50/50 flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {WORKSPACE_THEMES.map((theme) => {
                // Background Preview Logic: Blueprint needs specific handling to show up clearly in small box
                const bgStyle = theme.id === 'texture-blueprint' 
                    ? { backgroundColor: '#2563eb', backgroundImage: theme.background } 
                    : { background: theme.background };

                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelect(theme)}
                    className={`group flex flex-col text-left bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 relative ring-offset-2
                        ${activeThemeId === theme.id ? 'ring-2 ring-indigo-600 shadow-md' : 'hover:ring-2 hover:ring-indigo-300 border border-gray-200'}
                    `}
                  >
                    {/* Preview Area */}
                    <div 
                        className="h-28 w-full relative"
                        style={bgStyle}
                    >
                         {/* Mock Page */}
                         <div className="absolute inset-4 bg-white shadow-lg rounded-md opacity-90 transform group-hover:scale-105 transition-transform duration-500 origin-bottom">
                            <div className="p-2 space-y-1.5 opacity-30">
                                <div className="h-1.5 bg-gray-900 rounded w-3/4"></div>
                                <div className="h-1 bg-gray-400 rounded w-full"></div>
                                <div className="h-1 bg-gray-400 rounded w-full"></div>
                                <div className="h-1 bg-gray-400 rounded w-1/2"></div>
                            </div>
                         </div>
                         
                         {/* Active Checkmark */}
                         {activeThemeId === theme.id && (
                             <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md">
                                 <Check size={12} />
                             </div>
                         )}
                    </div>
                    
                    <div className="p-3 bg-white border-t border-gray-100">
                      <h3 className={`font-semibold text-sm ${activeThemeId === theme.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                          {theme.name}
                      </h3>
                    </div>
                  </button>
                )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
