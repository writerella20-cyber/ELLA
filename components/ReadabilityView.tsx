
import React, { useState, useMemo, useEffect } from 'react';
import { BinderItem, ReadabilityMetrics, WorkspaceTheme } from '../types';
import { analyzeReadability } from '../services/geminiService';
import { Eye, Activity, BarChart, FileText, RefreshCw, CheckCircle, AlertTriangle, AlertOctagon, ArrowLeft } from 'lucide-react';

interface ReadabilityViewProps {
  activeDocId: string | null;
  items: BinderItem[];
  onUpdateItem: (id: string, updates: Partial<BinderItem>) => void;
  theme?: WorkspaceTheme;
}

// Helper to find item
const findItem = (items: BinderItem[], id: string): BinderItem | null => {
    for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
            const found = findItem(item.children, id);
            if (found) return found;
        }
    }
    return null;
}

export const ReadabilityView: React.FC<ReadabilityViewProps> = ({ activeDocId, items, onUpdateItem, theme }) => {
  const [analyzing, setAnalyzing] = useState(false);

  // Sync: Always derive the document from props
  const selectedDoc = activeDocId ? findItem(items, activeDocId) : null;

  const handleAnalyze = async () => {
    if (!selectedDoc || !selectedDoc.content) return;
    
    setAnalyzing(true);
    const metrics = await analyzeReadability(selectedDoc.content);
    setAnalyzing(false);

    if (metrics) {
      onUpdateItem(selectedDoc.id, { readability: metrics });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 border-green-500 bg-green-50';
    if (score >= 60) return 'text-yellow-500 border-yellow-500 bg-yellow-50';
    return 'text-red-500 border-red-500 bg-red-50';
  };

  // Robust highlighting: Works by splitting content on the exact match phrases
  // This is safer than Regex for simple substrings and preserves basic HTML structure 
  // if the match doesn't cross block tags.
  const getHighlightedContent = useMemo(() => {
    if (!selectedDoc?.content) return '';
    if (!selectedDoc.readability || selectedDoc.readability.issues.length === 0) return selectedDoc.content;

    let html = selectedDoc.content;
    const issues = [...selectedDoc.readability.issues].sort((a, b) => b.text.length - a.text.length);

    // Create a temporary map to avoid double replacements
    const replacements: {start: number, end: number, replacement: string}[] = [];

    // Very simple matcher: Find the text in HTML, ensuring we aren't inside a tag attribute
    // Note: A full DOM parser solution is ideal but heavy. For this fix, we iterate issues.
    
    issues.forEach(issue => {
        // We strip tags to find the clean text, then find that text in the HTML? 
        // No, that's hard to map back.
        // We will try to find the string directly. The AI is instructed to return exact substrings.
        
        const idx = html.indexOf(issue.text);
        if (idx !== -1) {
             const className = issue.type === 'complexity' 
                ? 'bg-red-100 border-b-2 border-red-300 cursor-help text-black' 
                : 'bg-orange-100 border-b-2 border-orange-300 cursor-help text-black';
             
             // Check if we are inside a tag (simple heuristic: look for < and > around)
             const nextTagOpen = html.indexOf('<', idx);
             const prevTagClose = html.lastIndexOf('>', idx);
             
             // Valid replacement
             html = html.replace(
                issue.text, 
                `<span class="${className}" title="Suggestion: ${issue.suggestion}">${issue.text}</span>`
             );
        }
    });
    
    return html;

  }, [selectedDoc?.content, selectedDoc?.readability]);

  const isDark = theme?.isDark;
  const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#F9FBFD' };

  if (!selectedDoc || selectedDoc.type === 'folder') {
      return (
        <div className={`flex-1 flex flex-col items-center justify-center h-full ${isDark ? 'text-gray-500' : 'text-gray-400'}`} style={containerStyle}>
            <Activity size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">Readability Analyzer</p>
            <p className="text-sm">Select a specific document from the binder to analyze.</p>
        </div>
      );
  }

  const score = selectedDoc.readability?.score;

  return (
    <div className="flex h-full overflow-hidden animate-in fade-in duration-300 relative" style={containerStyle}>
        
        {/* Main Content (Center) */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 relative">
             <div className={`max-w-3xl mx-auto shadow-sm border min-h-full p-12 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h1 className={`text-3xl font-serif font-bold mb-8 border-b pb-4 ${isDark ? 'text-gray-200 border-gray-700' : 'text-gray-900'}`}>{selectedDoc.title}</h1>
                <div 
                    className={`prose prose-lg max-w-none font-serif leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-800'}`} 
                    dangerouslySetInnerHTML={{ __html: getHighlightedContent }} 
                />
             </div>
        </div>

        {/* Floating Controls / Sidebar (Right) */}
        <div className={`w-80 border-l shadow-xl flex flex-col shrink-0 z-10 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
             
             {/* Header */}
             <div className={`p-6 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50/50 border-gray-100'}`}>
                 <h2 className={`font-bold text-lg flex items-center gap-2 mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                     <Activity className="text-indigo-600" />
                     Analysis
                 </h2>
                 <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedDoc.readability ? `Last checked: Just now` : 'Not analyzed yet'}
                 </p>
             </div>

             {/* Action Button */}
             <div className="p-6 pb-2">
                 <button
                     onClick={handleAnalyze}
                     disabled={analyzing}
                     className={`w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md
                         ${analyzing 
                             ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                             : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'}
                     `}
                 >
                     {analyzing ? <RefreshCw size={16} className="animate-spin" /> : <Eye size={16} />}
                     {analyzing ? 'Analyzing...' : (selectedDoc.readability ? 'Re-Analyze' : 'Analyze Text')}
                 </button>
             </div>

             {/* Stats Panel */}
             {selectedDoc.readability ? (
                 <div className="flex-1 overflow-y-auto p-6 space-y-8">
                     
                     {/* Score Card */}
                     <div className="text-center">
                         <div className={`w-32 h-32 rounded-full border-[6px] flex items-center justify-center mx-auto mb-3 text-4xl font-bold bg-white shadow-inner ${getScoreColor(selectedDoc.readability.score)}`}>
                             {selectedDoc.readability.score}
                         </div>
                         <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Smoothness Score</p>
                         <div className="flex justify-center gap-1 mt-1">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className={`h-1.5 w-6 rounded-full ${i <= (selectedDoc.readability!.score / 20) ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>
                            ))}
                         </div>
                     </div>

                     {/* Details */}
                     <div className="space-y-4">
                         <div className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                             <span className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><BarChart size={14}/> Grade Level</span>
                             <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{selectedDoc.readability.gradeLevel}</span>
                         </div>
                         <div className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                             <span className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}><FileText size={14}/> Avg Sentence</span>
                             <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{selectedDoc.readability.avgSentenceLength.toFixed(1)} words</span>
                         </div>
                     </div>

                     {/* Issues List */}
                     <div>
                         <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 border-b pb-2 ${isDark ? 'text-gray-500 border-gray-700' : 'text-gray-400'}`}>
                             Flagged Issues ({selectedDoc.readability.issues.length})
                         </h4>
                         
                         {selectedDoc.readability.issues.length === 0 ? (
                             <div className="flex flex-col items-center py-6 text-green-600 bg-green-50 rounded-xl border border-green-100">
                                 <CheckCircle size={32} className="mb-2 opacity-80"/>
                                 <span className="font-medium">All Clear!</span>
                                 <span className="text-xs text-green-700 opacity-70">Great writing flow.</span>
                             </div>
                         ) : (
                             <div className="space-y-3">
                                 {selectedDoc.readability.issues.map((issue, idx) => (
                                     <div key={idx} className={`p-3 border rounded-lg shadow-sm transition-colors ${isDark ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' : 'bg-white border-gray-200 hover:border-indigo-300'}`}>
                                         <div className="flex items-center gap-2 mb-2">
                                             {issue.type === 'complexity' 
                                                 ? <AlertOctagon size={14} className="text-red-500" /> 
                                                 : <AlertTriangle size={14} className="text-orange-500" />
                                             }
                                             <span className="text-[10px] font-bold uppercase text-gray-500">{issue.type}</span>
                                         </div>
                                         <p className={`text-xs mb-2 font-serif p-1.5 rounded border italic ${isDark ? 'text-gray-300 bg-gray-700 border-gray-600' : 'text-gray-800 bg-gray-50 border-gray-100'}`}>
                                            "{issue.text}"
                                         </p>
                                         <div className="text-xs text-indigo-600">
                                             <span className="font-semibold">Try: </span> {issue.suggestion}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>

                 </div>
             ) : (
                 <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                     <p>Run analysis to see score, grade level, and flow suggestions.</p>
                 </div>
             )}
        </div>
    </div>
  );
};
