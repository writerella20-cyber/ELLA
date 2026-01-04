
import React, { useState, useEffect } from 'react';
import { Check, X, RefreshCw, MessageSquareQuote, SpellCheck, Zap, ArrowRight, BookOpen, ALargeSmall, Fingerprint, Filter, CheckCheck, Brain } from 'lucide-react';
import { RevisionSuggestion } from '../types';
import { generateRevisionSuggestions, runAdvancedGrammarCheck } from '../services/geminiService';

interface RevisionDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    documentContent: string;
    onApplySuggestion: (original: string, replacement: string) => void;
    onApplyAll?: (suggestions: RevisionSuggestion[]) => void;
}

export const RevisionDashboard: React.FC<RevisionDashboardProps> = ({
    isOpen, onClose, documentContent, onApplySuggestion, onApplyAll
}) => {
    const [suggestions, setSuggestions] = useState<RevisionSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);
    const [mode, setMode] = useState<'creative' | 'grammar'>('grammar');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    const runAnalysis = async () => {
        setIsLoading(true);
        let results: RevisionSuggestion[] = [];
        
        if (mode === 'grammar') {
            results = await runAdvancedGrammarCheck(documentContent);
        } else {
            results = await generateRevisionSuggestions(documentContent);
        }

        setSuggestions(results);
        
        // Automatically enable all categories found in the results
        const categories = Array.from(new Set(results.map(s => s.category)));
        setActiveFilters(categories);
        
        setHasAnalyzed(true);
        setIsLoading(false);
    };

    // Auto-analyze when opened if not done yet
    useEffect(() => {
        if (isOpen && !hasAnalyzed && documentContent.length > 20) {
            runAnalysis();
        }
    }, [isOpen]);

    // Re-run if mode changes
    useEffect(() => {
        if (isOpen && hasAnalyzed) {
            runAnalysis();
        }
    }, [mode]);

    const handleAccept = (suggestion: RevisionSuggestion) => {
        onApplySuggestion(suggestion.original, suggestion.replacement);
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    };

    const handleAcceptAll = () => {
        const toApply = suggestions.filter(s => activeFilters.includes(s.category));
        if (onApplyAll && toApply.length > 0) {
            onApplyAll(toApply);
            setSuggestions(prev => prev.filter(s => !toApply.includes(s)));
        }
    };

    const handleDismiss = (id: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== id));
    };

    const toggleFilter = (category: string) => {
        setActiveFilters(prev => 
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const getIcon = (category: string) => {
        switch(category) {
            case 'Grammar': return <ALargeSmall size={14} className="text-red-600" />;
            case 'Spelling': return <SpellCheck size={14} className="text-red-500" />;
            case 'Punctuation': return <Fingerprint size={14} className="text-orange-500" />;
            case 'Semantics': return <Brain size={14} className="text-pink-600" />;
            case 'Clarity': return <BookOpen size={14} className="text-blue-500" />;
            case 'Style': return <MessageSquareQuote size={14} className="text-purple-500" />;
            case 'Conciseness': return <Zap size={14} className="text-yellow-500" />;
            default: return <SpellCheck size={14} className="text-gray-500" />;
        }
    };

    if (!isOpen) return null;

    // Derived state
    const availableCategories = Array.from(new Set(suggestions.map(s => s.category)));
    const filteredSuggestions = suggestions.filter(s => activeFilters.includes(s.category));

    return (
        <div className="fixed right-0 top-[57px] bottom-0 w-96 bg-gray-50/95 backdrop-blur-md shadow-2xl border-l border-gray-200 flex flex-col z-30 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <SpellCheck className="text-teal-600" />
                            Revisions
                        </h2>
                        <p className="text-xs text-gray-500">AI-powered editor</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {filteredSuggestions.length > 1 && (
                            <button 
                                onClick={handleAcceptAll}
                                className="p-2 rounded-full hover:bg-green-50 text-green-600 transition-colors"
                                title="Fix All Shown"
                            >
                                <CheckCheck size={18} />
                            </button>
                        )}
                        <button 
                            onClick={runAnalysis}
                            disabled={isLoading}
                            className={`p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors ${isLoading ? 'animate-spin' : ''}`}
                            title="Re-scan Document"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Mode Toggles */}
                <div className="flex p-1 bg-gray-100 rounded-lg">
                    <button 
                        onClick={() => setMode('grammar')}
                        className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${mode === 'grammar' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Grammar & Checks
                    </button>
                    <button 
                        onClick={() => setMode('creative')}
                        className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${mode === 'creative' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Creative Style
                    </button>
                </div>

                {/* Filter Bar */}
                {availableCategories.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        <div className="text-gray-400 shrink-0">
                            <Filter size={14} />
                        </div>
                        {availableCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => toggleFilter(cat)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 border
                                    ${activeFilters.includes(cat) 
                                        ? 'bg-gray-800 text-white border-gray-800' 
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}
                                `}
                            >
                                {getIcon(cat)}
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!hasAnalyzed && !isLoading && (
                    <div className="text-center py-12 text-gray-500">
                        <p>Click refresh to analyze your document.</p>
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-3">
                        <RefreshCw size={24} className="animate-spin text-teal-600" />
                        <p className="text-sm">
                            {mode === 'grammar' ? "Checking grammar & mechanics..." : "Analyzing flow & tone..."}
                        </p>
                    </div>
                )}

                {!isLoading && hasAnalyzed && suggestions.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                            <Check size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900">All Clear!</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {mode === 'grammar' ? "No grammatical errors found." : "No stylistic improvements found."}
                        </p>
                    </div>
                )}

                {!isLoading && hasAnalyzed && filteredSuggestions.length === 0 && suggestions.length > 0 && (
                     <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No suggestions match selected filters.</p>
                        <button 
                            onClick={() => setActiveFilters(availableCategories)}
                            className="mt-2 text-xs text-indigo-600 hover:underline"
                        >
                            Reset Filters
                        </button>
                     </div>
                )}

                {filteredSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-100`}>
                                    {getIcon(suggestion.category)}
                                    {suggestion.category}
                                </span>
                            </div>
                            
                            <div className="mb-3 space-y-2">
                                {/* Use dangerouslySetInnerHTML to render formatting tags returned by AI */}
                                <div 
                                    className="bg-red-50 p-2.5 rounded-lg text-sm text-red-800 line-through decoration-red-300 decoration-2 decoration-wavy opacity-80 border border-red-100 font-serif"
                                    dangerouslySetInnerHTML={{ __html: String(suggestion.original) }}
                                />
                                <div className="flex justify-center text-gray-300 -my-1">
                                    <ArrowRight size={14} className="rotate-90" />
                                </div>
                                <div 
                                    className="bg-green-50 p-2.5 rounded-lg text-sm text-green-800 font-bold border border-green-100 font-serif"
                                    dangerouslySetInnerHTML={{ __html: String(suggestion.replacement) }}
                                />
                            </div>

                            <p className="text-xs text-gray-500 italic mb-4">
                                {suggestion.explanation}
                            </p>

                            <div className="flex gap-2 pt-2 border-t border-gray-100">
                                <button 
                                    onClick={() => handleAccept(suggestion)}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                                >
                                    <Check size={12} /> Apply Fix
                                </button>
                                <button 
                                    onClick={() => handleDismiss(suggestion.id)}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
                                    title="Dismiss"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="p-3 border-t border-gray-200 bg-white text-xs text-center text-gray-400 flex justify-between px-6">
                <span>{filteredSuggestions.length} shown</span>
                <span>{suggestions.length} total</span>
            </div>
        </div>
    );
};
