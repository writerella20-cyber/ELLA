
import React, { useState } from 'react';
import { BinderItem, SceneMetadata, WorkspaceTheme } from '../types';
import { Settings2, Anchor, Zap, Timer, Rewind, Info, Key, Map, Compass, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { analyzeSceneMechanics } from '../services/geminiService';

interface StoryMechanicsViewProps {
  item: BinderItem | null;
  onUpdateItem: (id: string, updates: Partial<BinderItem>) => void;
  onRenameItem: (id: string, newTitle: string) => void;
  theme?: WorkspaceTheme;
}

export const StoryMechanicsView: React.FC<StoryMechanicsViewProps> = ({ item, onUpdateItem, onRenameItem, theme }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isDark = theme?.isDark;
  const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#f9fafb' };

  if (!item) {
    return (
        <div className={`flex-1 flex flex-col items-center justify-center h-full ${isDark ? 'text-gray-500' : 'text-gray-400'}`} style={containerStyle}>
            <Settings2 size={48} className="mb-4 opacity-20" />
            <p>Select a scene to manage story mechanics.</p>
        </div>
    );
  }

  const metadata: SceneMetadata = item.sceneMetadata || {
      storyMap: '',
      purpose: '',
      sceneType: '',
      openingType: '',
      entryHook: '',
      closingType: '',
      exitHook: '',
      tension: 5,
      pacing: 5,
      isFlashback: false,
      backstory: 'None',
      revelation: '',
      plotPoint: ''
  };

  const updateMetadata = (field: keyof SceneMetadata, value: any) => {
      onUpdateItem(item.id, {
          sceneMetadata: { ...metadata, [field]: value }
      });
  };

  const handleAnalyze = async () => {
      if (!item.content) return;
      setIsAnalyzing(true);
      const result = await analyzeSceneMechanics(item.content);
      if (result) {
          onUpdateItem(item.id, { sceneMetadata: result });
      }
      setIsAnalyzing(false);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 animate-in fade-in duration-300" style={containerStyle}>
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h2 className={`text-2xl font-bold font-serif flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        <Compass className="text-indigo-600" />
                        Story Mechanics
                    </h2>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Evaluate the narrative arc and structural progression of <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"{item.title}"</span>.
                    </p>
                </div>
                
                <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !item.content}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isAnalyzing ? 'Analyzing...' : 'AI Analyze Scene'}
                </button>
            </div>

            <div className="space-y-6">
                
                {/* 1. Scene Basics */}
                <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                     <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                        <Map size={14} /> Structure & Purpose
                     </h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Scene Name</label>
                             <input 
                                type="text" 
                                value={item.title} 
                                onChange={(e) => onRenameItem(item.id, e.target.value)}
                                className={`w-full border rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-bold ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-900'}`}
                             />
                         </div>
                         
                         <div>
                             <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Story Map (Arc Placement)</label>
                             <select 
                                value={metadata.storyMap} 
                                onChange={(e) => updateMetadata('storyMap', e.target.value)}
                                className={`w-full border rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'}`}
                             >
                                <option value="">Select placement...</option>
                                <option value="Hook">The Hook</option>
                                <option value="Inciting Incident">Inciting Incident</option>
                                <option value="Plot Point 1">Plot Point 1</option>
                                <option value="Rising Action">Rising Action</option>
                                <option value="Midpoint">Midpoint</option>
                                <option value="Plot Point 2">Plot Point 2</option>
                                <option value="Climax">Climax</option>
                                <option value="Resolution">Resolution</option>
                             </select>
                         </div>

                         <div>
                             <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Scene Type</label>
                             <div className={`flex p-1 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                 {['Action', 'Sequel', 'Mixed'].map(type => (
                                     <button
                                        key={type}
                                        onClick={() => updateMetadata('sceneType', type)}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded ${metadata.sceneType === type ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                     >
                                         {type}
                                     </button>
                                 ))}
                             </div>
                         </div>
                         
                         <div>
                             <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Plot Point (Specific Beat)</label>
                             <input 
                                type="text" 
                                value={metadata.plotPoint} 
                                onChange={(e) => updateMetadata('plotPoint', e.target.value)}
                                placeholder="e.g. The Refusal of the Call"
                                className={`w-full border rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'}`}
                             />
                         </div>

                         <div className="col-span-1 md:col-span-2">
                             <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Scene Purpose</label>
                             <textarea 
                                rows={2}
                                value={metadata.purpose} 
                                onChange={(e) => updateMetadata('purpose', e.target.value)}
                                placeholder="Why does this scene exist? What changes by the end?"
                                className={`w-full border rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'}`}
                             />
                         </div>
                     </div>
                </div>

                {/* 2. Hooks & Openings */}
                <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                     <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                        <Anchor size={14} /> Hooks & Transitions
                     </h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                         <div className={`absolute left-1/2 top-0 bottom-0 w-px hidden md:block ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                         
                         {/* Entry */}
                         <div className="space-y-4">
                             <div className="flex justify-between items-center">
                                 <h4 className="font-bold text-sm text-green-700">Entry (Opening)</h4>
                                 <input 
                                    type="text" 
                                    placeholder="Type (e.g. In Media Res)"
                                    value={metadata.openingType}
                                    onChange={(e) => updateMetadata('openingType', e.target.value)}
                                    className={`text-xs border-none rounded px-2 py-1 w-32 text-right focus:ring-0 ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-50'}`}
                                 />
                             </div>
                             <div>
                                 <label className="block text-xs font-medium text-gray-500 mb-1">Entry Hook</label>
                                 <textarea 
                                    rows={3}
                                    value={metadata.entryHook}
                                    onChange={(e) => updateMetadata('entryHook', e.target.value)}
                                    className={`w-full border rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50/50 border-gray-200'}`}
                                    placeholder="The opening line or action that grabs attention..."
                                 />
                             </div>
                         </div>

                         {/* Exit */}
                         <div className="space-y-4">
                             <div className="flex justify-between items-center">
                                 <h4 className="font-bold text-sm text-red-700">Exit (Closing)</h4>
                                 <input 
                                    type="text" 
                                    placeholder="Type (e.g. Cliffhanger)"
                                    value={metadata.closingType}
                                    onChange={(e) => updateMetadata('closingType', e.target.value)}
                                    className={`text-xs border-none rounded px-2 py-1 w-32 text-right focus:ring-0 ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50'}`}
                                 />
                             </div>
                             <div>
                                 <label className="block text-xs font-medium text-gray-500 mb-1">Exit Hook</label>
                                 <textarea 
                                    rows={3}
                                    value={metadata.exitHook}
                                    onChange={(e) => updateMetadata('exitHook', e.target.value)}
                                    className={`w-full border rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50/50 border-gray-200'}`}
                                    placeholder="The closing line that compels reading on..."
                                 />
                             </div>
                         </div>
                     </div>
                </div>

                {/* 3. Dynamics & Mechanics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                         <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <Zap size={14} /> Dynamics
                         </h3>
                         
                         <div className="space-y-6">
                             <div>
                                 <div className="flex justify-between items-center mb-2">
                                     <label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                        <Zap size={14} className="text-amber-500" /> Tension
                                     </label>
                                     <span className="text-sm font-bold text-amber-600">{metadata.tension}/10</span>
                                 </div>
                                 <input 
                                    type="range" 
                                    min="1" max="10" 
                                    value={metadata.tension}
                                    onChange={(e) => updateMetadata('tension', parseInt(e.target.value))}
                                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                                 />
                                 <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                     <span>Relaxed</span>
                                     <span>Unbearable</span>
                                 </div>
                             </div>

                             <div>
                                 <div className="flex justify-between items-center mb-2">
                                     <label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                        <Timer size={14} className="text-blue-500" /> Pacing
                                     </label>
                                     <span className="text-sm font-bold text-blue-600">{metadata.pacing}/10</span>
                                 </div>
                                 <input 
                                    type="range" 
                                    min="1" max="10" 
                                    value={metadata.pacing}
                                    onChange={(e) => updateMetadata('pacing', parseInt(e.target.value))}
                                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                                 />
                                 <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                     <span>Slow Burn</span>
                                     <span>Rapid Fire</span>
                                 </div>
                             </div>
                         </div>
                    </div>

                    <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                         <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <Info size={14} /> Information Flow
                         </h3>
                         
                         <div className="space-y-4">
                             <div className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                                 <div className="flex items-center gap-2">
                                     <Rewind size={16} className="text-purple-500" />
                                     <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Is Flashback?</span>
                                 </div>
                                 <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={metadata.isFlashback}
                                        onChange={(e) => updateMetadata('isFlashback', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                             </div>

                             <div>
                                 <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Backstory Level</label>
                                 <div className="flex gap-1">
                                     {['None', 'Low', 'Moderate', 'High'].map(level => (
                                         <button
                                            key={level}
                                            onClick={() => updateMetadata('backstory', level)}
                                            className={`flex-1 py-1 text-xs rounded border ${metadata.backstory === level ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold' : (isDark ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')}`}
                                         >
                                             {level}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             <div>
                                 <label className={`block text-sm font-medium mb-1 flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                     <Key size={14} className="text-amber-500" /> Revelation / Information
                                 </label>
                                 <textarea 
                                    rows={2}
                                    value={metadata.revelation}
                                    onChange={(e) => updateMetadata('revelation', e.target.value)}
                                    placeholder="What new information is revealed?"
                                    className={`w-full border rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'}`}
                                 />
                             </div>
                         </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};
