
import React, { useMemo, useState } from 'react';
import { BinderItem, PlotThread, WorkspaceTheme } from '../types';
import { Plus, Trash2, GitMerge, FileText, X, BookOpen } from 'lucide-react';

interface PlotGridViewProps {
  items: BinderItem[];
  threads: PlotThread[];
  onUpdateItem: (id: string, updates: Partial<BinderItem>) => void;
  onAddThread: (name: string, color: string) => void;
  onRemoveThread: (id: string) => void;
  onSelect: (id: string) => void;
  theme?: WorkspaceTheme;
}

export const PlotGridView: React.FC<PlotGridViewProps> = ({ 
    items, threads, onUpdateItem, onAddThread, onRemoveThread, onSelect, theme 
}) => {
  const [newThreadName, setNewThreadName] = useState('');
  const [isAddingThread, setIsAddingThread] = useState(false);
  const [viewingThreadId, setViewingThreadId] = useState<string | null>(null);

  const isDark = theme?.isDark;
  const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#ffffff' };

  // Flatten the binder items to get a linear list of scenes/chapters
  const rows = useMemo(() => {
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

  const handleCellChange = (itemId: string, threadId: string, value: string) => {
      const item = rows.find(r => r.id === itemId);
      if (!item) return;
      const updatedPlotPoints = { ...(item.plotPoints || {}), [threadId]: value };
      onUpdateItem(itemId, { plotPoints: updatedPlotPoints });
  };

  const handleCreateThread = () => {
      if (!newThreadName.trim()) return;
      const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#22d3ee', '#818cf8', '#e879f9', '#fb7185'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      onAddThread(newThreadName, randomColor);
      setNewThreadName('');
      setIsAddingThread(false);
  };

  const activeThread = useMemo(() => {
      return threads.find(t => t.id === viewingThreadId);
  }, [threads, viewingThreadId]);

  if (rows.length === 0) {
    return (
        <div className={`flex-1 flex flex-col items-center justify-center h-full ${isDark ? 'text-gray-500' : 'text-gray-400'}`} style={containerStyle}>
            <GitMerge size={48} className="mb-4 opacity-20" />
            <p>No scenes found. Add documents to the binder to start plotting.</p>
        </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col relative" style={containerStyle}>
        
        {/* Thread Reader Modal */}
        {activeThread && (
            <div className={`absolute inset-0 z-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 ${isDark ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}>
                <div className={`h-16 border-b flex items-center justify-between px-6 shrink-0 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activeThread.color }}></div>
                        <h2 className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{activeThread.name} - Continuity Check</h2>
                    </div>
                    <button onClick={() => setViewingThreadId(null)} className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                    {rows.map((row, idx) => {
                        const point = row.plotPoints?.[activeThread.id];
                        if (!point) return null;
                        return (
                            <div key={row.id} className="flex gap-6 mb-8 relative group">
                                <div className="w-32 text-right shrink-0 pt-1">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{row.title}</div>
                                    <div className="text-[10px] text-gray-400">Scene {idx + 1}</div>
                                </div>
                                
                                {/* Connector Line */}
                                <div className={`absolute left-[8.5rem] top-0 bottom-[-2rem] w-0.5 group-last:bottom-0 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                <div className={`absolute left-[8.35rem] top-1.5 w-3 h-3 rounded-full border-2 z-10 ${isDark ? 'border-gray-800' : 'border-white'}`} style={{ backgroundColor: activeThread.color }}></div>

                                <div className={`flex-1 p-4 rounded-xl border text-sm leading-relaxed shadow-sm ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                                    {point}
                                </div>
                            </div>
                        )
                    })}
                    {rows.every(r => !r.plotPoints?.[activeThread.id]) && (
                        <div className="text-center text-gray-400 italic mt-20">No plot points added for this thread yet.</div>
                    )}
                </div>
            </div>
        )}

        {/* Header / Toolbar */}
        <div className={`h-16 border-b flex items-center justify-between px-6 shrink-0 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
            <div>
                <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    <GitMerge className="text-indigo-600" size={20} />
                    Plot Grid
                </h2>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Track subplots and character arcs across scenes.</p>
            </div>
            
            <div className="flex items-center gap-2">
                {isAddingThread ? (
                    <div className={`flex items-center gap-2 border rounded-lg p-1 animate-in fade-in slide-in-from-right-2 ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="Thread Name (e.g. Hero's Arc)" 
                            className={`text-sm border-none focus:ring-0 w-48 bg-transparent px-2 ${isDark ? 'text-white' : ''}`}
                            value={newThreadName}
                            onChange={(e) => setNewThreadName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateThread()}
                        />
                        <button onClick={handleCreateThread} className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                            <Plus size={16} />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsAddingThread(true)}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-medium transition-all shadow-sm ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-indigo-400 hover:border-indigo-500' : 'bg-white border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-300'}`}
                    >
                        <Plus size={16} /> Add Plot Thread
                    </button>
                )}
            </div>
        </div>

        {/* Grid Container */}
        <div className={`flex-1 overflow-auto relative scroll-smooth ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <table className="border-collapse w-full min-w-max">
                <thead className={`sticky top-0 z-20 shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                    <tr>
                        {/* Chapter Column Header */}
                        <th className={`sticky left-0 z-30 border-b border-r p-4 text-left w-64 min-w-[250px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Scene / Chapter</span>
                        </th>
                        
                        {/* Thread Headers */}
                        {threads.map(thread => (
                            <th key={thread.id} className={`border-b border-r p-3 w-72 min-w-[280px] relative group ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: thread.color }}></div>
                                        <span className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{thread.name}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => setViewingThreadId(thread.id)}
                                            className={`text-gray-400 hover:text-indigo-600 p-1 rounded ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                                            title="Read Thread Flow"
                                        >
                                            <BookOpen size={14} />
                                        </button>
                                        <button 
                                            onClick={() => { if(confirm('Delete this thread?')) onRemoveThread(thread.id); }}
                                            className={`text-gray-400 hover:text-red-500 p-1 rounded ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <div className="h-full opacity-30" style={{ backgroundColor: thread.color, width: '100%' }}></div>
                                </div>
                            </th>
                        ))}
                        
                        {/* Add Column Placeholder */}
                        {threads.length === 0 && (
                            <th className={`p-4 text-left border-b font-normal italic w-full ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                                Add a thread to start tracking plots...
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-800 bg-gray-900' : 'divide-gray-100 bg-white'}`}>
                    {rows.map(item => (
                        <tr key={item.id} className={`group transition-colors ${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50/50'}`}>
                            {/* Chapter / Scene Cell (Sticky) */}
                            <td className={`sticky left-0 z-10 border-r p-4 align-top shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${isDark ? 'bg-gray-900 group-hover:bg-gray-800/50 border-gray-700' : 'bg-white group-hover:bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-start gap-3">
                                    <div className="pt-1 text-gray-400">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <h4 
                                            onClick={() => onSelect(item.id)}
                                            className={`font-semibold text-sm hover:underline cursor-pointer mb-1 block ${isDark ? 'text-gray-200 hover:text-indigo-400' : 'text-gray-900 hover:text-indigo-600'}`}
                                        >
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                                            {item.content?.replace(/<[^>]*>?/gm, '').substring(0, 80) || "No content..."}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            {/* Thread Cells */}
                            {threads.map(thread => (
                                <td key={`${item.id}-${thread.id}`} className={`border-r p-0 align-top h-32 relative ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                                    <textarea
                                        className={`w-full h-full min-h-[120px] text-sm bg-transparent border-none resize-none focus:ring-inset focus:ring-2 focus:ring-indigo-500/20 p-3 leading-relaxed transition-colors ${isDark ? 'focus:bg-gray-800 text-gray-300 placeholder-gray-600' : 'focus:bg-white text-gray-700 placeholder-gray-300'}`}
                                        placeholder="Add plot beat..."
                                        value={item.plotPoints?.[thread.id] || ''}
                                        onChange={(e) => handleCellChange(item.id, thread.id, e.target.value)}
                                    />
                                    {/* Subtle highlight if filled */}
                                    {item.plotPoints?.[thread.id] && (
                                        <div className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-r-[8px] border-transparent border-t-indigo-200/50 border-r-indigo-200/50"></div>
                                    )}
                                </td>
                            ))}
                            {threads.length === 0 && <td></td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};
