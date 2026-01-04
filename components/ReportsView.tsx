
import React, { useState, useMemo } from 'react';
import { BinderItem, ReportResult, WorkspaceTheme } from '../types';
import { 
    BookOpen, Activity, Zap, Layers, BarChart3, PieChart, Play, Loader2
} from 'lucide-react';
import { runWritingReport } from '../services/geminiService';

interface ReportsViewProps {
    items: BinderItem[];
    activeDocId: string | null;
    theme?: WorkspaceTheme;
}

const REPORT_CATEGORIES = [
    {
        name: "Writing Style",
        icon: <BookOpen size={18} />,
        reports: [
            { id: "writing-style", name: "Writing Style & Voice" },
            { id: "readability", name: "Readability Report" },
            { id: "sticky-sentences", name: "Sticky Sentences" },
            { id: "sentence-length", name: "Sentence Length" },
            { id: "overused-words", name: "Overused Words" },
            { id: "cliches", name: "Cliches & Redundancies" },
            { id: "repeats", name: "Repeated Words" }
        ]
    },
    {
        name: "Creative & Fiction",
        icon: <Zap size={18} />,
        reports: [
            { id: "dialogue-tags", name: "Dialogue Tags" },
            { id: "pacing", name: "Pacing Report" },
            { id: "sensory", name: "Sensory Report" },
            { id: "emotions", name: "Emotions (Show/Tell)" },
            { id: "vividness", name: "Vividness" },
            { id: "alliteration", name: "Alliteration" },
            { id: "author-comparison", name: "Author Comparison" }
        ]
    },
    {
        name: "Structural",
        icon: <Layers size={18} />,
        reports: [
            { id: "structure-comparison", name: "Structure Analysis" },
            { id: "transitions", name: "Transition Report" },
            { id: "contextual-spelling", name: "Contextual Spelling" },
            { id: "homonyms", name: "Homonyms" },
            { id: "acronyms", name: "Acronyms" },
            { id: "diction", name: "Diction & Purple Prose" }
        ]
    },
    {
        name: "Technical",
        icon: <Activity size={18} />,
        reports: [
            { id: "consistency", name: "Consistency Check" },
            { id: "pronouns", name: "Pronoun Usage" },
            { id: "vague-words", name: "Vague Words" },
            { id: "thesaurus", name: "Thesaurus Suggestions" },
            { id: "grammar", name: "Grammar & Syntax" },
            { id: "plagiarism", name: "Plagiarism Detector" }
        ]
    }
];

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

export const ReportsView: React.FC<ReportsViewProps> = ({ items, activeDocId, theme }) => {
    const [activeReportId, setActiveReportId] = useState<string | null>(null);
    const [reportResults, setReportResults] = useState<Record<string, ReportResult>>({});
    const [isRunning, setIsRunning] = useState(false);

    const isDark = theme?.isDark;
    const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#ffffff' };

    const activeDoc = activeDocId ? findItem(items, activeDocId) : null;
    const currentResult = activeReportId ? reportResults[activeReportId] : null;

    const handleRunReport = async (reportId: string) => {
        if (!activeDoc || !activeDoc.content) return;
        
        setActiveReportId(reportId);
        setIsRunning(true);
        
        // Short delay to allow UI update
        await new Promise(r => setTimeout(r, 100));

        const result = await runWritingReport(reportId, activeDoc.content);
        if (result) {
            setReportResults(prev => ({ ...prev, [reportId]: result }));
        }
        setIsRunning(false);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getHighlightClass = (type: string) => {
        switch(type) {
            case 'critical': return 'bg-red-100 border-b-2 border-red-400 cursor-help text-black';
            case 'warning': return 'bg-orange-100 border-b-2 border-orange-300 cursor-help text-black';
            case 'success': return 'bg-green-100 border-b-2 border-green-300 cursor-help text-black';
            default: return 'bg-blue-50 border-b-2 border-blue-200 cursor-help text-black';
        }
    };

    // Render highlighted text
    const displayContent = useMemo(() => {
        if (!activeDoc?.content) return '';
        if (!currentResult || !currentResult.highlights) return activeDoc.content;

        let html = activeDoc.content;
        // Sort highlights by length descending to prevent nesting issues roughly
        const highlights = [...currentResult.highlights].sort((a, b) => b.text.length - a.text.length);

        // Simple string replacement (Note: in production, use a tree walker)
        highlights.forEach(h => {
            // Find first occurrence to avoid messing up HTML tags too much
            // We escape the text for regex safety if needed, but here simple split/join for demo
            const parts = html.split(h.text);
            if (parts.length > 1) {
                // Only replace the first one or all? Let's replace all for this demo
                // Ideally we map ranges.
                const replacement = `<span class="${getHighlightClass(h.type)} group/mark relative">
                    ${h.text}
                    <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/mark:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-50 whitespace-nowrap min-w-[150px] max-w-[300px] whitespace-normal">
                        ${h.comment}
                    </span>
                </span>`;
                html = parts.join(replacement);
            }
        });
        return html;
    }, [activeDoc?.content, currentResult]);

    if (!activeDoc || activeDoc.type !== 'document') {
        return (
            <div className={`flex-1 flex flex-col items-center justify-center h-full ${isDark ? 'text-gray-500' : 'text-gray-400'}`} style={containerStyle}>
                <BarChart3 size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Select a document to analyze</p>
            </div>
        );
    }

    return (
        <div className="flex h-full overflow-hidden animate-in fade-in duration-300" style={containerStyle}>
            {/* Sidebar: Categories */}
            <div className={`w-64 border-r flex flex-col shrink-0 overflow-y-auto ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`p-4 border-b sticky top-0 z-10 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h2 className={`font-bold text-lg flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        <Activity className="text-indigo-600" />
                        Reports
                    </h2>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pro Analysis Suite</p>
                </div>
                
                <div className="p-3 space-y-6">
                    {REPORT_CATEGORIES.map((cat, idx) => (
                        <div key={idx}>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2 px-2">
                                {cat.icon} {cat.name}
                            </h3>
                            <div className="space-y-1">
                                {cat.reports.map(rep => (
                                    <button
                                        key={rep.id}
                                        onClick={() => handleRunReport(rep.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between group
                                            ${activeReportId === rep.id 
                                                ? 'bg-indigo-600 text-white shadow-md' 
                                                : (isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-white hover:shadow-sm')
                                            }
                                        `}
                                    >
                                        {rep.name}
                                        {activeReportId === rep.id && isRunning && <Loader2 size={12} className="animate-spin text-white/80" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50/30'}`}>
                {activeReportId ? (
                    <>
                        {/* Report Header */}
                        <div className={`border-b p-6 shadow-sm shrink-0 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                        {REPORT_CATEGORIES.flatMap(c => c.reports).find(r => r.id === activeReportId)?.name}
                                        {currentResult && (
                                            <span className={`text-xs font-normal px-2 py-1 rounded-full ${isDark ? 'text-gray-400 bg-gray-700' : 'text-gray-400 bg-gray-100'}`}>
                                                Generated just now
                                            </span>
                                        )}
                                    </h1>
                                    {isRunning && <p className="text-indigo-600 text-sm mt-1 animate-pulse">Analyzing document content...</p>}
                                    {currentResult && <p className={`text-sm mt-2 max-w-3xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{currentResult.summary}</p>}
                                </div>

                                {currentResult && currentResult.score !== undefined && (
                                    <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 ${getScoreColor(currentResult.score)}`}>
                                        <span className="text-2xl font-bold">{currentResult.score}</span>
                                        <span className="text-[10px] uppercase font-bold opacity-80">Score</span>
                                    </div>
                                )}
                            </div>

                            {/* Stats Grid */}
                            {currentResult && currentResult.stats && (
                                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {currentResult.stats.map((stat, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                            <p className="text-xs text-gray-500 uppercase font-bold">{stat.label}</p>
                                            <p className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Chart Area (If applicable) */}
                        {currentResult && currentResult.chartData && (
                            <div className={`border-b p-4 shrink-0 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Distribution</h4>
                                <div className="h-24 flex items-end gap-2">
                                    {currentResult.chartData.map((d, i) => (
                                        <div key={i} className="flex-1 flex flex-col justify-end group relative">
                                            <div 
                                                className="bg-indigo-500 rounded-t opacity-80 hover:opacity-100 transition-all min-h-[4px]" 
                                                style={{ height: `${d.value}%` }}
                                            ></div>
                                            <span className="text-[10px] text-center text-gray-500 mt-1 truncate">{d.label}</span>
                                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                {d.value}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Text Visualization */}
                        <div className="flex-1 overflow-y-auto p-8 relative">
                            {isRunning ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <Loader2 size={48} className="mb-4 animate-spin text-indigo-500" />
                                    <p>AI is reading your manuscript...</p>
                                </div>
                            ) : currentResult ? (
                                <div className={`max-w-3xl mx-auto shadow-sm border min-h-full p-12 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <div 
                                        className={`prose prose-lg max-w-none font-serif leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-800'}`}
                                        dangerouslySetInnerHTML={{ __html: displayContent }}
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <Play size={48} className="mb-4 opacity-20" />
                                    <p>Ready to analyze.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <PieChart size={64} className="mb-6 opacity-20" />
                        <h2 className="text-xl font-bold">Select a Report</h2>
                        <p className="text-sm mt-2 max-w-md text-center">
                            Choose from over 20 specialized reports in the sidebar to analyze your writing style, pacing, structure, and more.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
