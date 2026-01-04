
import React from 'react';
import { Editor, EditorRef } from './Editor';
import { BinderItem, WorkspaceTheme } from '../types';
import { FileText, ScrollText } from 'lucide-react';

interface ScriveningsViewProps {
  items: BinderItem[];
  onUpdateContent: (id: string, content: string) => void;
  onMagicRequest: (type: 'generate' | 'edit', initialText?: string) => void;
  onSetActive: (id: string) => void;
  activeDocId: string | null;
  theme?: WorkspaceTheme;
}

export const ScriveningsView: React.FC<ScriveningsViewProps> = ({ 
    items, 
    onUpdateContent, 
    onMagicRequest, 
    onSetActive,
    activeDocId,
    theme
}) => {
  
  // Flatten tree into a linear list of documents
  const flattenDocs = (nodes: BinderItem[]): BinderItem[] => {
      let flat: BinderItem[] = [];
      nodes.forEach(node => {
          if (node.type === 'document') {
              flat.push(node);
          }
          if (node.children) {
              flat = [...flat, ...flattenDocs(node.children)];
          }
      });
      return flat;
  };

  const allDocs = flattenDocs(items);
  const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#F9FBFD' };
  const isDark = theme?.isDark;

  if (allDocs.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white" style={containerStyle}>
            <ScrollText size={48} className="mb-4 opacity-20" />
            <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>No documents found in this section.</p>
        </div>
      );
  }

  return (
    <div 
        className="flex-1 overflow-y-auto pb-32 animate-in fade-in duration-300 relative no-scrollbar transition-colors"
        style={containerStyle}
    >
        <div className="max-w-[900px] mx-auto pt-8 px-4">
            <div className={`text-center mb-8 pb-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-serif font-bold flex items-center justify-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    <ScrollText className="text-indigo-600" />
                    Scrivenings Mode
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Viewing {allDocs.length} documents as one continuous stream.
                </p>
            </div>

            <div className="space-y-4">
                {allDocs.map((doc, index) => (
                    <div key={doc.id} className="relative group">
                        {/* Section Separator */}
                        <div className="flex items-center gap-4 py-2 opacity-50 hover:opacity-100 transition-opacity select-none">
                            <div className={`h-px flex-1 ${isDark ? 'bg-indigo-900' : 'bg-indigo-100'}`}></div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300">
                                <FileText size={12} />
                                {doc.title}
                            </div>
                            <div className={`h-px flex-1 ${isDark ? 'bg-indigo-900' : 'bg-indigo-100'}`}></div>
                        </div>

                        {/* Editor Instance */}
                        <div 
                            className={`shadow-sm border rounded-lg transition-all duration-200 
                                ${activeDocId === doc.id ? 'ring-2 ring-indigo-500/20 border-indigo-200' : isDark ? 'border-gray-700 bg-white/5' : 'border-gray-200 hover:border-gray-300 bg-white'}
                            `}
                        >
                            <Editor
                                variant="scrivenings"
                                content={doc.content || ''}
                                onChange={(val) => onUpdateContent(doc.id, val)}
                                onMagicRequest={onMagicRequest}
                                onFocus={() => onSetActive(doc.id)}
                                placeholder="Write scene content..."
                            />
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-16 text-center text-gray-300">
                <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto mb-2"></div>
                <span className="text-xs uppercase tracking-widest font-serif">End of Stream</span>
            </div>
        </div>
    </div>
  );
};
