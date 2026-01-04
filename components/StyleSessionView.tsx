
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BinderItem, RevisionSuggestion, WorkspaceTheme } from '../types';
import { analyzeStyle } from '../services/geminiService';
import { BookOpen, RefreshCw, AlertTriangle, Zap, Check, ChevronLeft, ChevronRight, Edit2, Eye, Save } from 'lucide-react';

interface StyleSessionViewProps {
  items: BinderItem[];
  onUpdateContent: (id: string, content: string) => void;
  theme?: WorkspaceTheme;
}

// Sub-component for individual pages to optimize rendering
const StylePageCard: React.FC<{
  doc: BinderItem;
  pageIndex: number;
  suggestions: RevisionSuggestion[];
  onUpdate: (id: string, content: string) => void;
  onApplyFix: (docId: string, suggestion: RevisionSuggestion) => void;
  isDark?: boolean;
}> = ({ doc, pageIndex, suggestions, onUpdate, onApplyFix, isDark }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(doc.content || '');
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync local content if doc updates externally and we aren't editing
  useEffect(() => {
    if (!isEditing) {
      setLocalContent(doc.content || '');
    }
  }, [doc.content, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editorRef.current) {
       // Clean up any potential artifacts if we were in highlight mode (though we switch modes explicitly)
       const clean = editorRef.current.innerHTML;
       if (clean !== doc.content) {
           onUpdate(doc.id, clean);
       }
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  // Compute display HTML: Inject highlights if suggestions exist and we aren't raw editing
  const displayHtml = useMemo(() => {
     if (isEditing || suggestions.length === 0) return localContent;
     
     let highlighted = localContent;
     // Sort suggestions by length (desc) to avoid nested replacement issues roughly
     const sorted = [...suggestions].sort((a, b) => b.original.length - a.original.length);
     
     sorted.forEach(s => {
         // Simple replacement - in production this needs robust text-node traversal
         // We add a data attribute to find it later if needed
         const span = `<span class="${isDark ? 'bg-yellow-900/50 border-b-2 border-yellow-700' : 'bg-yellow-100 border-b-2 border-yellow-300'} cursor-help group/highlight relative" data-suggestion-id="${s.id}">${s.original}</span>`;
         highlighted = highlighted.split(s.original).join(span);
     });
     return highlighted;
  }, [localContent, suggestions, isEditing, isDark]);

  return (
    <div className={`shadow-sm hover:shadow-md transition-shadow h-full flex flex-col border group relative ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
       {/* Header */}
       <div className={`px-4 py-2 border-b flex justify-between items-center ${isDark ? 'border-gray-700 bg-gray-900/30' : 'border-gray-100 bg-gray-50/50'}`}>
          <span className={`text-xs font-bold uppercase tracking-wider truncate max-w-[150px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{doc.title}</span>
          <span className={`text-[10px] font-mono ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>#{pageIndex + 1}</span>
       </div>

       {/* Editor / Viewer */}
       <div className="flex-1 relative overflow-hidden">
          <div 
             ref={editorRef}
             className={`w-full h-full p-6 text-sm font-serif leading-relaxed outline-none overflow-y-auto ${isEditing ? 'cursor-text' : 'cursor-default'} ${isDark ? 'text-gray-300' : 'text-gray-800'}`}
             contentEditable
             suppressContentEditableWarning
             onFocus={handleFocus}
             onBlur={handleBlur}
             onInput={(e) => setLocalContent(e.currentTarget.innerHTML)}
             dangerouslySetInnerHTML={{ __html: displayHtml }}
          />
          
          {/* Overlay Actions for Suggestions (When not editing) */}
          {!isEditing && suggestions.length > 0 && (
              <div className="absolute bottom-2 right-2 flex flex-col gap-2 pointer-events-none">
                 <div className={`backdrop-blur shadow-lg border p-2 rounded-lg pointer-events-auto max-w-[200px] ${isDark ? 'bg-gray-900/90 border-yellow-900/50' : 'bg-white/90 border-yellow-200'}`}>
                    <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 mb-1">
                        <AlertTriangle size={12} />
                        <span>{suggestions.length} Issues</span>
                    </div>
                    <div className="max-h-[100px] overflow-y-auto space-y-2 no-scrollbar">
                        {suggestions.map(s => (
                            <div key={s.id} className={`text-[10px] border-t pt-1 mt-1 first:border-0 first:mt-0 ${isDark ? 'border-yellow-900/30' : 'border-yellow-100'}`}>
                                <div className={`mb-0.5 line-through opacity-70 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{s.original}</div>
                                <div className="text-green-600 font-bold mb-0.5">{s.replacement}</div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onApplyFix(doc.id, s);
                                    }}
                                    className={`w-full text-center rounded px-2 py-0.5 transition-colors ${isDark ? 'bg-yellow-900/30 text-yellow-500 hover:bg-yellow-900/50' : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'}`}
                                >
                                    Apply
                                </button>
                            </div>
                        ))}
                    </div>
                 </div>
              </div>
          )}
       </div>
    </div>
  );
};

export const StyleSessionView: React.FC<StyleSessionViewProps> = ({ items, onUpdateContent, theme }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [allSuggestions, setAllSuggestions] = useState<Record<string, RevisionSuggestion[]>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const ITEMS_PER_PAGE = 6;

  const isDark = theme?.isDark;
  const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#f3f4f6' };

  // Flatten documents (skip folders)
  const documents = useMemo(() => {
    const flat: BinderItem[] = [];
    const traverse = (nodes: BinderItem[]) => {
        nodes.forEach(node => {
            if (node.type === 'document') flat.push(node);
            if (node.children) traverse(node.children);
        });
    };
    traverse(items);
    return flat;
  }, [items]);

  const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE);
  const currentDocs = documents.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  const runAnalysis = async () => {
    setAnalyzing(true);
    const newSuggestions: Record<string, RevisionSuggestion[]> = { ...allSuggestions };

    // Analyze visible docs
    await Promise.all(currentDocs.map(async (doc) => {
        if (doc.content && doc.content.length > 10) {
            const results = await analyzeStyle(doc.content);
            newSuggestions[doc.id] = results;
        }
    }));

    setAllSuggestions(newSuggestions);
    setAnalyzing(false);
  };

  const handleApplyFix = (docId: string, suggestion: RevisionSuggestion) => {
      const doc = documents.find(d => d.id === docId);
      if (!doc || !doc.content) return;

      const newContent = doc.content.replace(suggestion.original, suggestion.replacement);
      onUpdateContent(docId, newContent);

      // Remove suggestion
      setAllSuggestions(prev => ({
          ...prev,
          [docId]: prev[docId]?.filter(s => s.id !== suggestion.id) || []
      }));
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden" style={containerStyle}>
       
       {/* Top Bar */}
       <div className={`h-14 border-b flex items-center justify-between px-6 shrink-0 z-10 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
           <div className="flex items-center gap-3">
               <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                   <BookOpen size={18} />
               </div>
               <div>
                   <h2 className={`font-bold text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Style Session</h2>
                   <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>6-Page Spread View</p>
               </div>
           </div>

           <div className="flex items-center gap-4">
                {/* Pagination */}
                <div className={`flex items-center gap-2 rounded-lg p-1 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className={`p-1.5 rounded-md disabled:opacity-30 transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-white'}`}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className={`text-xs font-mono font-medium w-16 text-center ${isDark ? 'text-gray-300' : ''}`}>
                        {currentPage + 1} / {totalPages || 1}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className={`p-1.5 rounded-md disabled:opacity-30 transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-white'}`}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className={`h-6 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

                <button 
                    onClick={runAnalysis}
                    disabled={analyzing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${analyzing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}
                >
                    {analyzing ? <RefreshCw size={14} className="animate-spin"/> : <Zap size={14} />}
                    {analyzing ? 'Scanning...' : 'Analyze Spread'}
                </button>
           </div>
       </div>

       {/* Grid Content */}
       <div className="flex-1 overflow-y-auto p-8">
           {currentDocs.length === 0 ? (
               <div className={`h-full flex flex-col items-center justify-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                   <BookOpen size={48} className="mb-4 opacity-20" />
                   <p>No documents found.</p>
               </div>
           ) : (
               <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                   {/* Render 6 Slots always to maintain grid look, filling empty ones if needed */}
                   {[...Array(ITEMS_PER_PAGE)].map((_, i) => {
                       const doc = currentDocs[i];
                       if (!doc) {
                           return (
                               <div key={`empty-${i}`} className={`aspect-[3/4] border-2 border-dashed rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-800/30 border-gray-700 text-gray-600' : 'bg-gray-50/50 border-gray-200 text-gray-300'}`}>
                                   <span className="font-serif italic text-2xl opacity-20">Empty Page</span>
                               </div>
                           );
                       }
                       return (
                           <div key={doc.id} className="aspect-[3/4]">
                                <StylePageCard 
                                    doc={doc}
                                    pageIndex={(currentPage * ITEMS_PER_PAGE) + i}
                                    suggestions={allSuggestions[doc.id] || []}
                                    onUpdate={onUpdateContent}
                                    onApplyFix={handleApplyFix}
                                    isDark={isDark}
                                />
                           </div>
                       );
                   })}
               </div>
           )}
       </div>
    </div>
  );
};
