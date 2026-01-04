
import React from 'react';
import { FileText, Folder, Hash, AlignLeft, Clock } from 'lucide-react';
import { BinderItem, WorkspaceTheme } from '../types';

interface StructureViewProps {
  items: BinderItem[];
  onSelect: (id: string) => void;
  theme?: WorkspaceTheme;
}

export const StructureView: React.FC<StructureViewProps> = ({ items, onSelect, theme }) => {
  
  const getWordCount = (html?: string) => {
    if (!html) return 0;
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  const getRecursiveWordCount = (item: BinderItem): number => {
      let count = getWordCount(item.content);
      if (item.children) {
          count += item.children.reduce((acc, child) => acc + getRecursiveWordCount(child), 0);
      }
      return count;
  };

  const getSynopsis = (html?: string) => {
    if (!html) return "No content";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || "";
    text = text.replace(/\s+/g, ' ').trim();
    return text.slice(0, 80) + (text.length > 80 ? "..." : "");
  };
  
  const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#ffffff' };
  const isDark = theme?.isDark;

  if (items.length === 0) {
      return (
        <div className={`flex-1 flex flex-col items-center justify-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`} style={containerStyle}>
            <Folder size={48} className="mb-4 opacity-20" />
            <p>This section is empty.</p>
        </div>
      )
  }

  const totalWords = items.reduce((acc, item) => acc + getRecursiveWordCount(item), 0);
  const totalDocs = items.reduce((acc, item) => acc + (item.type === 'document' ? 1 : (item.children?.length || 0)), 0);

  return (
    <div 
        className="flex-1 overflow-y-auto p-8 animate-in fade-in duration-300 transition-colors"
        style={containerStyle}
    >
        <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-end justify-between">
                <div>
                    <h2 className={`text-2xl font-bold font-serif ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Structure & Stats</h2>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Detailed overview of the current section.</p>
                </div>
            </div>

            <div className={`border rounded-xl overflow-hidden shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <table className="w-full text-left text-sm">
                    <thead className={`border-b font-medium uppercase tracking-wider text-xs ${isDark ? 'bg-gray-900/50 border-gray-700 text-gray-400' : 'bg-gray-50/50 border-gray-200 text-gray-500'}`}>
                        <tr>
                            <th className="px-6 py-4 w-1/3">Title</th>
                            <th className="px-6 py-4 w-24 text-center">Type</th>
                            <th className="px-6 py-4 w-28 text-right">Word Count</th>
                            <th className="px-6 py-4">Synopsis / Preview</th>
                            <th className="px-6 py-4 w-32 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                        {items.map(item => {
                            const wc = getRecursiveWordCount(item);
                            // Mock status logic
                            let status = "Empty";
                            let statusColor = isDark ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500";
                            
                            if (item.type === 'folder') {
                                status = "Container";
                                statusColor = isDark ? "bg-indigo-900/50 text-indigo-300" : "bg-indigo-50 text-indigo-600";
                            } else if (wc > 1000) {
                                status = "Finished";
                                statusColor = isDark ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700";
                            } else if (wc > 100) {
                                status = "In Progress";
                                statusColor = isDark ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700";
                            } else if (wc > 0) {
                                status = "Draft";
                                statusColor = isDark ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700";
                            }

                            return (
                                <tr 
                                    key={item.id} 
                                    onClick={() => onSelect(item.id)}
                                    className={`cursor-pointer transition-colors group ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg transition-all ${
                                                item.type === 'folder' 
                                                    ? (isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600') 
                                                    : (isDark ? 'bg-gray-700 text-gray-400 group-hover:bg-gray-600 group-hover:text-indigo-400' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-sm')
                                            }`}>
                                                {item.type === 'folder' ? <Folder size={16} /> : <FileText size={16} />}
                                            </div>
                                            <span className={`font-medium transition-colors ${isDark ? 'text-gray-200 group-hover:text-indigo-400' : 'text-gray-900 group-hover:text-indigo-600'}`}>{item.title}</span>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                        {item.type === 'folder' ? 'Group' : 'Doc'}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {wc.toLocaleString()}
                                    </td>
                                    <td className={`px-6 py-4 truncate max-w-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {item.type === 'folder' ? (
                                            <span className="flex items-center gap-1.5 text-xs text-indigo-400">
                                                <Folder size={12} />
                                                Contains {item.children?.length || 0} items
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5">
                                                <AlignLeft size={12} className="shrink-0 opacity-50"/>
                                                {getSynopsis(item.content)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                            {status}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            
            {/* Summary Footer */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className={`flex items-center gap-3 p-4 rounded-xl border ${isDark ? 'bg-indigo-900/20 border-indigo-900 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-900'}`}>
                    <div className={`p-2 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 text-indigo-400' : 'bg-white text-indigo-600'}`}><Hash size={20} /></div>
                    <div>
                        <p className="text-xs uppercase tracking-wide font-bold opacity-60">Total Words</p>
                        <p className="text-xl font-bold">{totalWords.toLocaleString()}</p>
                    </div>
                 </div>
                 
                 <div className={`flex items-center gap-3 p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-500'}`}><FileText size={20} /></div>
                    <div>
                        <p className={`text-xs uppercase tracking-wide font-bold opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Items</p>
                        <p className="text-xl font-bold">{items.length}</p>
                    </div>
                 </div>

                 <div className={`flex items-center gap-3 p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-500'}`}><Clock size={20} /></div>
                    <div>
                        <p className={`text-xs uppercase tracking-wide font-bold opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Read Time</p>
                        <p className="text-xl font-bold">~{Math.ceil(totalWords / 200)} min</p>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};
