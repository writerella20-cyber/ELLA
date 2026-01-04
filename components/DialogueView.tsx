
import React, { useState, useMemo, useEffect } from 'react';
import { BinderItem, WorkspaceTheme } from '../types';
import { MessageSquare, User, Mic, Filter, PieChart, Save, RefreshCw } from 'lucide-react';

interface DialogueViewProps {
  items: BinderItem[];
  onUpdateItem: (id: string, updates: Partial<BinderItem>) => void;
  onSelect: (id: string) => void;
  theme?: WorkspaceTheme;
}

interface DialogueBlock {
    id: string; // Unique ID
    docId: string;
    docTitle: string;
    character: string;
    text: string;
    originalHtml: string; // To locate for replacement
    type: 'script' | 'prose';
}

export const DialogueView: React.FC<DialogueViewProps> = ({ items, onUpdateItem, onSelect, theme }) => {
    const [selectedCharacter, setSelectedCharacter] = useState<string>('All');
    const [localBlocks, setLocalBlocks] = useState<DialogueBlock[]>([]);
    const [stats, setStats] = useState<{char: string, words: number, percentage: number}[]>([]);

    // Helper: Flatten items
    const documents = useMemo(() => {
        const docs: BinderItem[] = [];
        const traverse = (nodes: BinderItem[]) => {
            nodes.forEach(node => {
                if (node.type === 'document') docs.push(node);
                if (node.children) traverse(node.children);
            });
        };
        traverse(items);
        return docs;
    }, [items]);

    // SMART PARSER: Extracts dialogue from both Script formats and Novel prose
    useEffect(() => {
        const blocks: DialogueBlock[] = [];
        const parser = new DOMParser();

        documents.forEach(doc => {
            if (!doc.content) return;
            const dom = parser.parseFromString(doc.content, 'text/html');
            
            // 1. Try Script Format (Class based)
            const scriptNodes = dom.querySelectorAll('.script-dialogue');
            if (scriptNodes.length > 0) {
                scriptNodes.forEach((node, idx) => {
                    let charName = "UNKNOWN";
                    // Walk backwards to find character name
                    let prev = node.previousElementSibling;
                    while(prev) {
                        if (prev.classList.contains('script-character')) {
                            charName = prev.textContent?.trim().toUpperCase() || "UNKNOWN";
                            break;
                        }
                        // Skip parentheticals or other dialogue lines to find the speaker
                        if (!prev.classList.contains('script-parenthetical') && !prev.classList.contains('script-dialogue')) break;
                        prev = prev.previousElementSibling;
                    }

                    blocks.push({
                        id: `script-${doc.id}-${idx}`,
                        docId: doc.id,
                        docTitle: doc.title,
                        character: charName,
                        text: node.innerHTML,
                        originalHtml: node.outerHTML,
                        type: 'script'
                    });
                });
            } 
            
            // 2. Prose Format (Quote detection) - Only if no script tags found in this paragraph, or mixed mode
            // We iterate all paragraphs that are NOT script classes
            const paragraphs = dom.querySelectorAll('p:not(.script-dialogue):not(.script-action):not(.script-character)');
            paragraphs.forEach((p, pIdx) => {
                const text = p.textContent || "";
                // Regex for standard English quotes (double or single curly/straight)
                // This is a basic heuristic.
                const quoteRegex = /["“]([^"”]+)["”]/g;
                let match;
                while ((match = quoteRegex.exec(text)) !== null) {
                    if (match[1].length > 2) { // Filter out noise
                        // Attempt to guess speaker from paragraph? Hard without NLP.
                        // We mark as "PROSE / UNSPECIFIED" unless we find a name tag pattern.
                        blocks.push({
                            id: `prose-${doc.id}-${pIdx}-${match.index}`,
                            docId: doc.id,
                            docTitle: doc.title,
                            character: "NARRATIVE/PROSE", 
                            text: match[1],
                            originalHtml: match[0], // The quoted part
                            type: 'prose'
                        });
                    }
                }
            });
        });

        setLocalBlocks(blocks);

        // Calculate Stats
        const charCounts: Record<string, number> = {};
        let totalWords = 0;
        blocks.forEach(b => {
            const w = b.text.split(/\s+/).length;
            charCounts[b.character] = (charCounts[b.character] || 0) + w;
            totalWords += w;
        });

        const statArray = Object.entries(charCounts)
            .map(([char, words]) => ({
                char, 
                words, 
                percentage: totalWords > 0 ? Math.round((words / totalWords) * 100) : 0
            }))
            .sort((a, b) => b.words - a.words);
        
        setStats(statArray);

    }, [documents]);

    const characters = useMemo(() => {
        const set = new Set(localBlocks.map(b => b.character));
        return ['All', ...Array.from(set).sort()];
    }, [localBlocks]);

    const filteredBlocks = selectedCharacter === 'All' 
        ? localBlocks 
        : localBlocks.filter(b => b.character === selectedCharacter);

    const handleUpdateDialogue = (block: DialogueBlock, newText: string) => {
        // Optimistic UI update
        setLocalBlocks(prev => prev.map(b => b.id === block.id ? { ...b, text: newText } : b));
    };

    const commitChange = (block: DialogueBlock) => {
        const doc = documents.find(d => d.id === block.docId);
        if (!doc || !doc.content) return;

        // Dangerously simple replace - in production use unique IDs injected into the DOM
        // Here we rely on the original HTML string being unique enough or finding the first occurrence
        // For robustness, we check if the doc content actually contains the block's text
        
        // This is a "Best Effort" replace for the prototype
        // We construct the new HTML based on type
        let newHtmlChunk = newTextToHtml(block.text, block.type);
        
        // We need to find the node in the real document content
        // 1. Create a DOM
        const parser = new DOMParser();
        const dom = parser.parseFromString(doc.content, 'text/html');
        
        // 2. Find the node (Heuristic: Text Match)
        // This is the tricky part of sync. 
        // We'll strip HTML tags to compare text content for safety
        const allNodes = dom.body.querySelectorAll('*');
        let found = false;
        
        for (let i = 0; i < allNodes.length; i++) {
            const node = allNodes[i];
            if (node.innerHTML === block.text) {
                // Exact match (no change yet?) - skip
                continue;
            }
            // If we are looking for the *old* text to replace
            // We don't have the old text easily here without storing it separately.
            // For this demo, we assume the user hasn't changed the structure externally.
        }
        
        // Simplified approach: String replacement on the raw HTML
        // NOTE: This assumes the originalHtml stored in the block hasn't changed since render
        // Ideally, we'd use unique IDs on every paragraph in the Editor.
        
        // For now, we will notify the user this is a "View Only" audit unless using Script Mode
        // because robust two-way syncing of partial text matches is extremely complex without Node IDs.
        
        if (block.type === 'script') {
             // Script mode is safer because of the specific classes
             // We can find the nth occurrence of script-dialogue for this character... roughly.
             console.log("Saving script changes not fully implemented in this demo without Node IDs");
        }
    };
    
    // Helper to format text back to HTML
    const newTextToHtml = (text: string, type: 'script' | 'prose') => {
        if (type === 'script') return text; // Inner HTML remains
        return `"${text}"`; // Wrap quotes
    };

    const isDark = theme?.isDark;
    const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#f3f4f6' };

    return (
        <div className="flex h-full overflow-hidden animate-in fade-in duration-300" style={containerStyle}>
            {/* Sidebar: Character Stats */}
            <div className={`w-72 border-r flex flex-col shrink-0 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                    <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        <PieChart size={16} className="text-indigo-600" />
                        Voice Balance
                    </h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Word count distribution</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    <button
                        onClick={() => setSelectedCharacter('All')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center 
                            ${selectedCharacter === 'All' 
                                ? (isDark ? 'bg-indigo-900/50 text-indigo-300 font-bold' : 'bg-indigo-50 text-indigo-700 font-bold')
                                : (isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50')
                            }`}
                    >
                        <span>All Characters</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200'}`}>{localBlocks.length} lines</span>
                    </button>
                    
                    {stats.map(stat => (
                        <button
                            key={stat.char}
                            onClick={() => setSelectedCharacter(stat.char)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors group 
                                ${selectedCharacter === stat.char 
                                    ? (isDark ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-800' : 'bg-indigo-50 text-indigo-700 border border-indigo-100')
                                    : (isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50')
                                }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="truncate font-medium">{stat.char}</span>
                                <span className="text-xs opacity-60">{stat.percentage}%</span>
                            </div>
                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <div 
                                    className={`h-full ${selectedCharacter === stat.char ? 'bg-indigo-500' : (isDark ? 'bg-gray-500 group-hover:bg-indigo-400' : 'bg-gray-400 group-hover:bg-indigo-400')}`} 
                                    style={{ width: `${stat.percentage}%` }}
                                ></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className={`text-2xl font-serif font-bold flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                <Mic className="text-indigo-600" />
                                Dialogue Audit
                            </h2>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Review voice distinctiveness and rhythm.</p>
                        </div>
                        <div className={`text-xs px-3 py-1.5 rounded border flex items-center gap-2 ${isDark ? 'text-orange-400 bg-orange-900/20 border-orange-900/50' : 'text-orange-600 bg-orange-50 border-orange-200'}`}>
                            <Save size={12} />
                            <span>Changes here are for audit (Read-Only)</span>
                        </div>
                    </div>

                    {filteredBlocks.length === 0 ? (
                        <div className={`text-center py-12 border-2 border-dashed rounded-xl ${isDark ? 'text-gray-500 border-gray-700 bg-gray-800/30' : 'text-gray-400 border-gray-200 bg-gray-50/50'}`}>
                            <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No dialogue found for this selection.</p>
                            <p className="text-xs mt-2">Try using Script formatting or standard "quotes".</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBlocks.map((block) => (
                                <div key={block.id} className={`p-4 rounded-xl border shadow-sm hover:shadow-md transition-all group flex gap-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    {/* Avatar / Char Initials */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border-2
                                        ${block.character === 'NARRATIVE/PROSE' 
                                            ? (isDark ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-500 border-gray-200')
                                            : (isDark ? 'bg-indigo-900/50 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-100')
                                        }
                                    `}>
                                        {block.character.slice(0, 2)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{block.character}</span>
                                            <button 
                                                onClick={() => onSelect(block.docId)}
                                                className={`text-[10px] hover:underline ${isDark ? 'text-gray-500 hover:text-indigo-400' : 'text-gray-400 hover:text-indigo-600'}`}
                                            >
                                                {block.docTitle}
                                            </button>
                                        </div>
                                        
                                        <div 
                                            className={`font-serif leading-relaxed text-lg ${isDark ? 'text-gray-300' : 'text-gray-800'}`}
                                            dangerouslySetInnerHTML={{ __html: block.text }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
