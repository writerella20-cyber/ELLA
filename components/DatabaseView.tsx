
import React, { useMemo, useState } from 'react';
import { BinderItem, WorkspaceTheme } from '../types';
import { Database, Filter, ArrowUpDown, Search, Eye } from 'lucide-react';

interface DatabaseViewProps {
  items: BinderItem[];
  onSelect: (id: string) => void;
  theme?: WorkspaceTheme;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({ items, onSelect, theme }) => {
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState<string>('index');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isDark = theme?.isDark;
  const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#ffffff' };

  // Helper to count words from HTML
  const getWordCount = (html?: string) => {
    if (!html) return 0;
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
  };

  const rows = useMemo(() => {
    const flat: any[] = [];
    let index = 1;
    const traverse = (nodes: BinderItem[]) => {
      nodes.forEach(node => {
        if (node.type === 'document') {
          const wc = getWordCount(node.content);
          // Status Logic
          let status = 'Draft';
          if (wc === 0) status = 'Empty';
          else if (wc > 1000) status = 'Polished';
          else if (wc > 200) status = 'In Progress';

          const povChar = node.characterData?.find(c => c.id === node.povCharacterId)?.name || '-';

          flat.push({
            id: node.id,
            index: index++,
            title: node.title,
            wordCount: wc,
            status: status,
            pov: povChar,
            location: node.sceneSetting?.location || '-',
            conflict: node.sceneMetadata?.purpose || '-', // Using purpose as a proxy for main conflict note
            characters: node.characterData?.length || 0,
            date: node.timelineData?.start ? new Date(node.timelineData.start).toLocaleDateString() : '-'
          });
        }
        if (node.children) traverse(node.children);
      });
    };
    traverse(items);
    return flat;
  }, [items]);

  const sortedRows = useMemo(() => {
      return [...rows].sort((a, b) => {
          if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
          if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
          return 0;
      });
  }, [rows, sortField, sortDirection]);

  const filteredRows = sortedRows.filter(r => 
      r.title.toLowerCase().includes(filter.toLowerCase()) || 
      r.status.toLowerCase().includes(filter.toLowerCase()) ||
      r.pov.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSort = (field: string) => {
      if (sortField === field) {
          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortField(field);
          setSortDirection('asc');
      }
  };

  const HeaderCell = ({ field, label, width }: { field: string, label: string, width?: string }) => (
      <th 
        className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${width} ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}
        onClick={() => handleSort(field)}
      >
          <div className="flex items-center gap-1">
              {label}
              <ArrowUpDown size={12} className={`opacity-50 ${sortField === field ? 'text-indigo-600 opacity-100' : ''}`} />
          </div>
      </th>
  );

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Empty': return isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500';
          case 'Draft': return isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
          case 'In Progress': return isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700';
          case 'Polished': return isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700';
          default: return isDark ? 'bg-gray-800' : 'bg-gray-100';
      }
  }

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden animate-in fade-in duration-300" style={containerStyle}>
        {/* Toolbar */}
        <div className={`h-16 border-b flex items-center justify-between px-6 shrink-0 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
            <div className="flex items-center gap-3">
                <Database size={18} className="text-indigo-600" />
                <h2 className={`text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Manuscript Database</h2>
            </div>
            
            <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                <input 
                    type="text" 
                    placeholder="Filter database..." 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className={`pl-9 pr-4 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-64 ${isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200'}`}
                />
            </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
            <table className={`min-w-full divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
                <thead className={`sticky top-0 z-10 shadow-sm ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                    <tr>
                        <HeaderCell field="index" label="#" width="w-16" />
                        <HeaderCell field="title" label="Scene Title" />
                        <HeaderCell field="status" label="Status" />
                        <HeaderCell field="pov" label="POV Character" />
                        <HeaderCell field="wordCount" label="Words" />
                        <HeaderCell field="location" label="Location" />
                        <HeaderCell field="date" label="Timeline Date" />
                        <HeaderCell field="characters" label="Cast Size" />
                        <th className="px-4 py-3"></th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-800 bg-gray-900' : 'divide-gray-100 bg-white'}`}>
                    {filteredRows.map((row) => (
                        <tr key={row.id} className={`transition-colors group ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                            <td className={`px-4 py-3 text-sm font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{row.index}</td>
                            <td className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{row.title}</td>
                            <td className="px-4 py-3">
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${getStatusColor(row.status)}`}>
                                    {row.status}
                                </span>
                            </td>
                            <td className={`px-4 py-3 text-sm font-serif italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.pov}</td>
                            <td className={`px-4 py-3 text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.wordCount.toLocaleString()}</td>
                            <td className={`px-4 py-3 text-sm truncate max-w-[150px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.location}</td>
                            <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.date}</td>
                            <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.characters}</td>
                            <td className="px-4 py-3 text-right">
                                <button 
                                    onClick={() => onSelect(row.id)}
                                    className={`p-1.5 rounded transition-colors ${isDark ? 'hover:bg-indigo-900/50 text-gray-500 hover:text-indigo-400' : 'hover:bg-indigo-50 text-gray-400 hover:text-indigo-600'}`}
                                >
                                    <Eye size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        <div className={`p-3 border-t text-xs text-center ${isDark ? 'border-gray-800 bg-gray-900 text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
            {filteredRows.length} scenes found • Total {filteredRows.reduce((a, b) => a + b.wordCount, 0).toLocaleString()} words
        </div>
    </div>
  );
};
