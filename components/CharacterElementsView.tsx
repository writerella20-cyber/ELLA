
import React, { useState, useMemo } from 'react';
import { BinderItem, CharacterSceneData, WorkspaceTheme } from '../types';
import { Users, Plus, Trash2, User, Target, Heart, ShieldAlert, ArrowRightCircle, Eye, Brain, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, TrendingUp, ArrowRight, Sparkles, Loader2, Activity, PlayCircle, Lightbulb, Zap, Link as LinkIcon, FileText } from 'lucide-react';
import { checkPovConsistency, analyzeCharacterArc, analyzeCharacterMotion, generateActionSuggestions, analyzeCharacterConflict } from '../services/geminiService';

// Helper to flatten docs for search
const flattenDocs = (items: BinderItem[]) => {
    const flat: BinderItem[] = [];
    const traverse = (nodes: BinderItem[]) => {
        nodes.forEach(node => {
            if (node.type === 'document') flat.push(node);
            if (node.children) traverse(node.children);
        });
    };
    traverse(items);
    return flat;
};

interface CharacterElementsViewProps {
  item: BinderItem | null;
  onUpdateItem: (id: string, updates: Partial<BinderItem>) => void;
  // New prop to access global context for linking
  binderItems?: BinderItem[];
  onNavigate?: (id: string) => void;
  theme?: WorkspaceTheme;
}

export const CharacterElementsView: React.FC<CharacterElementsViewProps> = ({ item, onUpdateItem, binderItems = [], onNavigate, theme }) => {
  const [newCharName, setNewCharName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingCharId, setAnalyzingCharId] = useState<string | null>(null);
  const [analyzingMotionId, setAnalyzingMotionId] = useState<string | null>(null);
  const [analyzingConflictId, setAnalyzingConflictId] = useState<string | null>(null);
  const [generatingIdeasId, setGeneratingIdeasId] = useState<string | null>(null);
  const [actionIdeas, setActionIdeas] = useState<Record<string, string[]>>({});
  const [viewingBacklinksFor, setViewingBacklinksFor] = useState<string | null>(null);

  const isDark = theme?.isDark;
  const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#f9fafb' };

  // Compute Backlinks (Bidirectional Linking)
  const allDocs = useMemo(() => flattenDocs(binderItems), [binderItems]);
  
  const getBacklinks = (charName: string) => {
      const links: { docId: string, title: string, snippet: string }[] = [];
      const regex = new RegExp(`\\b${charName}\\b`, 'i');
      
      allDocs.forEach(doc => {
          if (doc.id === item?.id) return; // Skip current
          if (doc.content) {
              const text = doc.content.replace(/<[^>]*>?/gm, ''); // Strip HTML
              const matchIndex = text.search(regex);
              
              if (matchIndex !== -1) {
                  const start = Math.max(0, matchIndex - 30);
                  const end = Math.min(text.length, matchIndex + charName.length + 30);
                  const snippet = "..." + text.substring(start, end) + "...";
                  links.push({ docId: doc.id, title: doc.title, snippet });
              }
          }
      });
      return links;
  };

  if (!item) {
    return (
        <div className={`flex-1 flex flex-col items-center justify-center h-full ${isDark ? 'text-gray-500' : 'text-gray-400'}`} style={containerStyle}>
            <Users size={48} className="mb-4 opacity-20" />
            <p>Select a scene to manage character elements.</p>
        </div>
    );
  }

  const characters = item.characterData || [];
  const povId = item.povCharacterId;
  const analysis = item.povAnalysis;

  const handleAddCharacter = () => {
    if (!newCharName.trim()) return;
    
    const newChar: CharacterSceneData = {
        id: Date.now().toString(),
        name: newCharName,
        role: 'Supporting',
        goal: '',
        motivation: '',
        conflict: '',
        climax: '',
        outcome: '',
        arcStart: '',
        arcEnd: ''
    };

    onUpdateItem(item.id, {
        characterData: [...characters, newChar]
    });
    setNewCharName('');
  };

  const updateCharacter = (charId: string, field: keyof CharacterSceneData, value: string) => {
      const updated = characters.map(c => 
          c.id === charId ? { ...c, [field]: value } : c
      );
      onUpdateItem(item.id, { characterData: updated });
  };

  const removeCharacter = (charId: string) => {
      if(confirm('Remove this character from the scene elements?')) {
          const updated = characters.filter(c => c.id !== charId);
          const updates: Partial<BinderItem> = { characterData: updated };
          if (item.povCharacterId === charId) {
              updates.povCharacterId = undefined;
          }
          onUpdateItem(item.id, updates);
      }
  };

  const setPov = (charId: string) => {
      onUpdateItem(item.id, { povCharacterId: charId, povAnalysis: undefined }); 
  };

  const handleRunPovCheck = async () => {
      if (!item.content || !povId) return;
      const char = characters.find(c => c.id === povId);
      if (!char) return;

      setIsAnalyzing(true);
      const result = await checkPovConsistency(item.content, char.name);
      if (result) {
          onUpdateItem(item.id, { povAnalysis: result });
      }
      setIsAnalyzing(false);
  };

  const handleAutoDetectArc = async (charId: string, charName: string) => {
      if (!item.content) return;
      setAnalyzingCharId(charId);
      const result = await analyzeCharacterArc(item.content, charName);
      if (result) {
          const updated = characters.map(c => 
              c.id === charId ? { ...c, arcStart: result.start, arcEnd: result.end, outcome: result.outcome } : c
          );
          onUpdateItem(item.id, { characterData: updated });
      }
      setAnalyzingCharId(null);
  };

  const handleAnalyzeMotion = async (charId: string, charName: string) => {
      if (!item.content) return;
      setAnalyzingMotionId(charId);
      const result = await analyzeCharacterMotion(item.content, charName);
      if (result) {
          const updated = characters.map(c => 
              c.id === charId ? { ...c, motionAnalysis: result } : c
          );
          onUpdateItem(item.id, { characterData: updated });
      }
      setAnalyzingMotionId(null);
  };

  const handleGetActionIdeas = async (charId: string, charName: string) => {
      if (!item.content) return;
      setGeneratingIdeasId(charId);
      const suggestions = await generateActionSuggestions(item.content, charName);
      setActionIdeas(prev => ({ ...prev, [charId]: suggestions }));
      setGeneratingIdeasId(null);
  };

  const handleDetectConflict = async (charId: string, charName: string) => {
      if (!item.content) return;
      setAnalyzingConflictId(charId);
      const result = await analyzeCharacterConflict(item.content, charName);
      if (result) {
          updateCharacter(charId, 'conflict', result);
      }
      setAnalyzingConflictId(null);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 animate-in fade-in duration-300" style={containerStyle}>
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h2 className={`text-2xl font-bold font-serif flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        <Users className="text-indigo-600" />
                        Character Elements
                    </h2>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Map internal and external drivers for characters in <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"{item.title}"</span>.
                    </p>
                </div>
            </div>

            {/* Global Scene POV Analysis */}
            {povId && (
                <div className={`rounded-xl shadow-sm border p-6 mb-8 relative overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-indigo-100'}`}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>
                                <Eye size={16} /> Point of View (POV)
                            </h3>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Current Scene Narrator: <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{characters.find(c => c.id === povId)?.name}</span>
                            </p>
                        </div>
                        <button 
                            onClick={handleRunPovCheck}
                            disabled={isAnalyzing || !item.content}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${isDark ? 'bg-gray-700 text-indigo-300 hover:bg-gray-600' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                        >
                            {isAnalyzing ? <Loader2 size={12} className="animate-spin"/> : <Brain size={12} />}
                            {isAnalyzing ? 'Analyzing...' : 'Check Consistency'}
                        </button>
                    </div>

                    {analysis ? (
                        <div className={`rounded-lg p-4 text-sm ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`flex items-center gap-4 mb-3 border-b pb-3 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                                <div className={`flex items-center gap-2 font-bold ${analysis.score > 80 ? 'text-green-600' : 'text-amber-600'}`}>
                                    <div className="text-2xl">{analysis.score}</div>
                                    <span className="text-xs font-normal uppercase text-gray-500">Consistency Score</span>
                                </div>
                                <div className="h-8 w-px bg-gray-200"></div>
                                <div>
                                    <div className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{analysis.voiceType}</div>
                                    <div className="text-xs text-gray-500">{analysis.consistencyStatus}</div>
                                </div>
                            </div>
                            <p className={`mb-2 italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"{analysis.feedback}"</p>
                            {analysis.issues.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {analysis.issues.map((issue, idx) => (
                                        <div key={idx} className={`flex items-start gap-2 text-xs p-2 rounded border ${isDark ? 'bg-gray-800 border-red-900/50' : 'bg-white border-red-100'}`}>
                                            <AlertCircle size={12} className="text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium text-red-700">Issue: </span>
                                                <span className={` ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>"{issue.text}" - {issue.explanation}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-xs text-gray-400 italic">
                            Run a check to ensure the narrative voice stays consistent with the chosen character.
                        </div>
                    )}
                </div>
            )}
            
            {/* Add Bar */}
            <div className={`p-4 rounded-xl shadow-sm border mb-8 flex items-center gap-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`p-2 rounded-full ${isDark ? 'bg-gray-700 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    <User size={20} />
                </div>
                <input 
                    type="text" 
                    placeholder="Add a character to this scene..." 
                    className={`flex-1 border-none focus:ring-0 text-sm bg-transparent placeholder-gray-400 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
                    value={newCharName}
                    onChange={(e) => setNewCharName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCharacter()}
                />
                <button 
                    onClick={handleAddCharacter}
                    disabled={!newCharName.trim()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    <Plus size={16} /> Add
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-6 pb-20">
                {characters.map(char => {
                    const isPov = char.id === povId;
                    const backlinks = viewingBacklinksFor === char.id ? getBacklinks(char.name) : [];

                    return (
                        <div 
                            key={char.id} 
                            className={`rounded-xl shadow-sm border overflow-hidden transition-all duration-200 ${isPov ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' : (isDark ? 'border-gray-700' : 'border-gray-200')} ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                        >
                            {/* Header with Linked Data Toggle */}
                            <div className={`px-6 py-4 border-b flex items-center justify-between ${isPov ? (isDark ? 'bg-indigo-900/30 border-indigo-800' : 'bg-indigo-50 border-indigo-100') : (isDark ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50/50 border-gray-100')}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold text-lg ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{char.name}</span>
                                    <select 
                                        value={char.role}
                                        onChange={(e) => updateCharacter(char.id, 'role', e.target.value)}
                                        className={`text-xs font-medium uppercase tracking-wider border rounded px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-500'}`}
                                    >
                                        <option value="Protagonist">Protagonist</option>
                                        <option value="Antagonist">Antagonist</option>
                                        <option value="Supporting">Supporting</option>
                                        <option value="Minor">Minor</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setViewingBacklinksFor(viewingBacklinksFor === char.id ? null : char.id)}
                                        className={`text-xs px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors border
                                            ${viewingBacklinksFor === char.id
                                                ? (isDark ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200')
                                                : (isDark ? 'bg-gray-700 border-gray-600 text-gray-400 hover:text-blue-400' : 'bg-white border-gray-200 text-gray-500 hover:text-blue-600')}
                                        `}
                                    >
                                        <LinkIcon size={12} />
                                        Mentions
                                    </button>
                                    <button
                                        onClick={() => setPov(char.id)}
                                        disabled={isPov}
                                        className={`text-xs px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors
                                            ${isPov 
                                                ? 'bg-indigo-600 text-white cursor-default' 
                                                : (isDark ? 'bg-gray-700 border-gray-600 text-gray-400 hover:text-indigo-400 border' : 'bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300')}
                                        `}
                                    >
                                        <Eye size={12} />
                                        {isPov ? 'POV' : 'Set POV'}
                                    </button>
                                    <button onClick={() => removeCharacter(char.id)} className="text-gray-400 hover:text-red-500 p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Backlinks Panel */}
                            {viewingBacklinksFor === char.id && (
                                <div className={`p-4 border-b animate-in slide-in-from-top-2 ${isDark ? 'bg-blue-900/20 border-blue-900' : 'bg-blue-50/50 border-blue-100'}`}>
                                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <LinkIcon size={12} /> Appearances in other scenes ({backlinks.length})
                                    </h4>
                                    {backlinks.length === 0 ? (
                                        <p className="text-xs text-gray-500 italic">No other mentions found.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {backlinks.map((link, i) => (
                                                <div key={i} className={`p-3 rounded border shadow-sm hover:shadow-md transition-all cursor-pointer ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-100'}`} onClick={() => onNavigate && onNavigate(link.docId)}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FileText size={12} className="text-gray-400"/>
                                                        <span className={`text-sm font-bold hover:underline ${isDark ? 'text-gray-200 hover:text-blue-400' : 'text-gray-800 hover:text-blue-600'}`}>{link.title}</span>
                                                    </div>
                                                    <p className={`text-xs font-serif italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>"{link.snippet}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="p-6 space-y-6">
                                {/* 1. Drivers */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={`flex items-center gap-2 text-xs font-bold uppercase ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                            <Target size={14} /> Goal
                                        </label>
                                        <textarea 
                                            className={`w-full text-sm border rounded-lg min-h-[80px] p-2 focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'bg-blue-900/10 border-blue-900/30 text-gray-200' : 'bg-blue-50/30 border-gray-200'}`}
                                            value={char.goal}
                                            onChange={(e) => updateCharacter(char.id, 'goal', e.target.value)}
                                            placeholder="What do they want in this scene?"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`flex items-center gap-2 text-xs font-bold uppercase ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                            <Heart size={14} /> Motivation
                                        </label>
                                        <textarea 
                                            className={`w-full text-sm border rounded-lg min-h-[80px] p-2 focus:ring-purple-500 focus:border-purple-500 ${isDark ? 'bg-purple-900/10 border-purple-900/30 text-gray-200' : 'bg-purple-50/30 border-gray-200'}`}
                                            value={char.motivation}
                                            onChange={(e) => updateCharacter(char.id, 'motivation', e.target.value)}
                                            placeholder="Why do they want it?"
                                        />
                                    </div>
                                </div>

                                {/* 2. Conflict & Climax */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className={`flex items-center gap-2 text-xs font-bold uppercase ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                                <ShieldAlert size={14} /> Conflict
                                            </label>
                                            <button 
                                                onClick={() => handleDetectConflict(char.id, char.name)}
                                                disabled={analyzingConflictId === char.id}
                                                className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                                            >
                                                {analyzingConflictId === char.id ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10} />}
                                                Detect
                                            </button>
                                        </div>
                                        <textarea 
                                            className={`w-full text-sm border rounded-lg min-h-[80px] p-2 focus:ring-red-500 focus:border-red-500 ${isDark ? 'bg-red-900/10 border-red-900/30 text-gray-200' : 'bg-red-50/30 border-gray-200'}`}
                                            value={char.conflict}
                                            onChange={(e) => updateCharacter(char.id, 'conflict', e.target.value)}
                                            placeholder="What stands in their way?"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`flex items-center gap-2 text-xs font-bold uppercase ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                                            <ArrowRightCircle size={14} /> Climax
                                        </label>
                                        <textarea 
                                            className={`w-full text-sm border rounded-lg min-h-[80px] p-2 focus:ring-orange-500 focus:border-orange-500 ${isDark ? 'bg-orange-900/10 border-orange-900/30 text-gray-200' : 'bg-orange-50/30 border-gray-200'}`}
                                            value={char.climax}
                                            onChange={(e) => updateCharacter(char.id, 'climax', e.target.value)}
                                            placeholder="Their moment of highest intensity or decision."
                                        />
                                    </div>
                                </div>

                                {/* 3. Arc Tracking */}
                                <div className={`border rounded-xl p-4 ${isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                            <TrendingUp size={14} /> Emotional Arc
                                        </h4>
                                        <button 
                                            onClick={() => handleAutoDetectArc(char.id, char.name)}
                                            disabled={analyzingCharId === char.id}
                                            className={`text-xs border px-3 py-1 rounded-md transition-colors flex items-center gap-2 shadow-sm ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {analyzingCharId === char.id ? <Loader2 size={12} className="animate-spin"/> : <RefreshCw size={12} />}
                                            Auto-Detect
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Start State</label>
                                            <input 
                                                type="text" 
                                                className={`w-full text-sm border rounded-md py-1.5 px-2 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'}`}
                                                placeholder="e.g. Hopeful"
                                                value={char.arcStart}
                                                onChange={(e) => updateCharacter(char.id, 'arcStart', e.target.value)}
                                            />
                                        </div>
                                        <div className="hidden md:flex items-center justify-center pt-6 text-gray-300">
                                            <ArrowRight size={16} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">End State</label>
                                            <input 
                                                type="text" 
                                                className={`w-full text-sm border rounded-md py-1.5 px-2 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'}`}
                                                placeholder="e.g. Disillusioned"
                                                value={char.arcEnd}
                                                onChange={(e) => updateCharacter(char.id, 'arcEnd', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-3 mt-2">
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Outcome / Change</label>
                                            <textarea 
                                                className={`w-full text-sm border rounded-md py-1.5 px-2 h-16 resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'}`}
                                                placeholder="How did the events of this scene change them?"
                                                value={char.outcome}
                                                onChange={(e) => updateCharacter(char.id, 'outcome', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Activity / Motion */}
                                <div className={`border rounded-xl p-4 relative overflow-hidden ${isDark ? 'bg-gray-700/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                            <Activity size={14} /> Physical Activity
                                        </h4>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleGetActionIdeas(char.id, char.name)}
                                                disabled={generatingIdeasId === char.id}
                                                className={`text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors ${isDark ? 'text-indigo-400 hover:bg-indigo-900/30' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                            >
                                                {generatingIdeasId === char.id ? <Loader2 size={12} className="animate-spin"/> : <Lightbulb size={12} />}
                                                Ideas
                                            </button>
                                            <button 
                                                onClick={() => handleAnalyzeMotion(char.id, char.name)}
                                                disabled={analyzingMotionId === char.id}
                                                className={`text-xs px-3 py-1 rounded transition-colors flex items-center gap-2 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                {analyzingMotionId === char.id ? <Loader2 size={12} className="animate-spin"/> : <PlayCircle size={12} />}
                                                Analyze
                                            </button>
                                        </div>
                                    </div>

                                    {char.motionAnalysis ? (
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`text-xl font-bold ${char.motionAnalysis.score < 40 ? 'text-red-500' : char.motionAnalysis.score < 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {char.motionAnalysis.score}/100
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${char.motionAnalysis.status === 'Static' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {char.motionAnalysis.status}
                                                </span>
                                            </div>
                                            <p className={`text-sm italic mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>"{char.motionAnalysis.feedback}"</p>
                                            {char.motionAnalysis.actions.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {char.motionAnalysis.actions.map((action, i) => (
                                                        <span key={i} className={`text-[10px] px-2 py-1 rounded border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                            {action}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-400 text-xs italic relative z-10">
                                            Is {char.name} a "talking head" or interacting with the world? Run analysis to check.
                                        </div>
                                    )}

                                    {/* Action Suggestions Panel */}
                                    {actionIdeas[char.id] && (
                                        <div className={`mt-4 pt-3 border-t animate-in slide-in-from-top-2 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                            <p className="text-xs font-bold text-indigo-600 mb-2 flex items-center gap-1"><Zap size={12}/> Suggested Actions:</p>
                                            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                                                {actionIdeas[char.id].map((idea, idx) => (
                                                    <li key={idx} className={isDark ? 'text-gray-400' : 'text-gray-600'}>{idea}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};
