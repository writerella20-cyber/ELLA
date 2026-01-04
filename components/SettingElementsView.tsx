
import React, { useState } from 'react';
import { BinderItem, SceneSetting, WorkspaceTheme } from '../types';
import { MapPin, Clock, Package, Eye, Ear, Hand, Ghost, CloudFog, Sparkles, Loader2, Globe, HeartPulse } from 'lucide-react';
import { analyzeSceneSetting } from '../services/geminiService';

interface SettingElementsViewProps {
  item: BinderItem | null;
  onUpdateItem: (id: string, updates: Partial<BinderItem>) => void;
  theme?: WorkspaceTheme;
}

export const SettingElementsView: React.FC<SettingElementsViewProps> = ({ item, onUpdateItem, theme }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isDark = theme?.isDark;
  const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#f9fafb' };

  if (!item) {
    return (
        <div className={`flex-1 flex flex-col items-center justify-center h-full ${isDark ? 'text-gray-500' : 'text-gray-400'}`} style={containerStyle}>
            <Globe size={48} className="mb-4 opacity-20" />
            <p>Select a scene to manage setting elements.</p>
        </div>
    );
  }

  const setting: SceneSetting = item.sceneSetting || {
      location: '',
      time: '',
      objects: [],
      senses: {
          sight: '',
          smell: '',
          taste: '',
          sound: '',
          touch: ''
      },
      emotionalImpact: ''
  };

  const updateSetting = (field: keyof SceneSetting, value: any) => {
      onUpdateItem(item.id, {
          sceneSetting: { ...setting, [field]: value }
      });
  };

  const updateSense = (sense: keyof typeof setting.senses, value: string) => {
      onUpdateItem(item.id, {
          sceneSetting: { 
              ...setting, 
              senses: { ...setting.senses, [sense]: value } 
          }
      });
  };

  const handleAnalyze = async () => {
      if (!item.content) return;
      setIsAnalyzing(true);
      const result = await analyzeSceneSetting(item.content);
      if (result) {
          onUpdateItem(item.id, { sceneSetting: result });
      }
      setIsAnalyzing(false);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 animate-in fade-in duration-300" style={containerStyle}>
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h2 className={`text-2xl font-bold font-serif flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        <Globe className="text-indigo-600" />
                        Setting & Atmosphere
                    </h2>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Define the "stage" and sensory experience for <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"{item.title}"</span>.
                    </p>
                </div>
                
                <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !item.content}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isAnalyzing ? 'Scanning...' : 'Extract Details'}
                </button>
            </div>

            <div className="space-y-6">
                
                {/* 1. Logistics */}
                <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                     <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                        <MapPin size={14} /> Logistics
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-1">
                             <label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                 <MapPin size={14} className="text-red-500" /> Location
                             </label>
                             <input 
                                type="text" 
                                className={`w-full border rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'}`}
                                placeholder="e.g. The Abandoned Lighthouse"
                                value={setting.location}
                                onChange={(e) => updateSetting('location', e.target.value)}
                             />
                         </div>
                         <div className="space-y-1">
                             <label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                 <Clock size={14} className="text-blue-500" /> Time / Date
                             </label>
                             <input 
                                type="text" 
                                className={`w-full border rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'}`}
                                placeholder="e.g. Midnight, Winter Solstice"
                                value={setting.time}
                                onChange={(e) => updateSetting('time', e.target.value)}
                             />
                         </div>
                     </div>
                </div>

                {/* 2. Sensory Details Grid */}
                <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                     <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                        <CloudFog size={14} /> Sensory Immersion
                     </h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {/* Sight */}
                         <div className="space-y-2">
                             <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                 <Eye size={16} className="text-teal-500" /> Sight
                             </label>
                             <textarea 
                                rows={3}
                                className={`w-full border rounded-lg focus:border-teal-500 focus:ring-teal-500 text-sm ${isDark ? 'bg-teal-900/10 border-teal-900/30 text-gray-200' : 'border-gray-200 bg-teal-50/30'}`}
                                placeholder="Visual details..."
                                value={setting.senses.sight}
                                onChange={(e) => updateSense('sight', e.target.value)}
                             />
                         </div>

                         {/* Sound */}
                         <div className="space-y-2">
                             <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                 <Ear size={16} className="text-purple-500" /> Sound
                             </label>
                             <textarea 
                                rows={3}
                                className={`w-full border rounded-lg focus:border-purple-500 focus:ring-purple-500 text-sm ${isDark ? 'bg-purple-900/10 border-purple-900/30 text-gray-200' : 'border-gray-200 bg-purple-50/30'}`}
                                placeholder="Auditory details..."
                                value={setting.senses.sound}
                                onChange={(e) => updateSense('sound', e.target.value)}
                             />
                         </div>

                         {/* Smell */}
                         <div className="space-y-2">
                             <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                 <CloudFog size={16} className="text-orange-500" /> Smell
                             </label>
                             <textarea 
                                rows={3}
                                className={`w-full border rounded-lg focus:border-orange-500 focus:ring-orange-500 text-sm ${isDark ? 'bg-orange-900/10 border-orange-900/30 text-gray-200' : 'border-gray-200 bg-orange-50/30'}`}
                                placeholder="Olfactory details..."
                                value={setting.senses.smell}
                                onChange={(e) => updateSense('smell', e.target.value)}
                             />
                         </div>

                         {/* Touch */}
                         <div className="space-y-2">
                             <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                 <Hand size={16} className="text-amber-600" /> Touch
                             </label>
                             <textarea 
                                rows={3}
                                className={`w-full border rounded-lg focus:border-amber-500 focus:ring-amber-500 text-sm ${isDark ? 'bg-amber-900/10 border-amber-900/30 text-gray-200' : 'border-gray-200 bg-amber-50/30'}`}
                                placeholder="Tactile details..."
                                value={setting.senses.touch}
                                onChange={(e) => updateSense('touch', e.target.value)}
                             />
                         </div>

                         {/* Taste */}
                         <div className="space-y-2">
                             <label className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                 <Ghost size={16} className="text-pink-500" /> Taste
                             </label>
                             <textarea 
                                rows={3}
                                className={`w-full border rounded-lg focus:border-pink-500 focus:ring-pink-500 text-sm ${isDark ? 'bg-pink-900/10 border-pink-900/30 text-gray-200' : 'border-gray-200 bg-pink-50/30'}`}
                                placeholder="Gustatory details..."
                                value={setting.senses.taste}
                                onChange={(e) => updateSense('taste', e.target.value)}
                             />
                         </div>
                     </div>
                </div>

                {/* 3. Props & Emotion */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                         <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <Package size={14} /> Key Objects (Props)
                         </h3>
                         <textarea 
                            rows={4}
                            className={`w-full border rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'}`}
                            placeholder="List specific items used to ground the scene..."
                            value={Array.isArray(setting.objects) ? setting.objects.join('\n') : setting.objects}
                            onChange={(e) => updateSetting('objects', e.target.value.split('\n'))}
                         />
                         <p className="text-[10px] text-gray-400 mt-2">Enter one item per line.</p>
                    </div>

                    <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                         <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <HeartPulse size={14} /> Emotional Impact
                         </h3>
                         <textarea 
                            rows={4}
                            className={`w-full border rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isDark ? 'bg-indigo-900/20 border-indigo-900/50 text-gray-200' : 'border-gray-300 bg-gradient-to-br from-indigo-50/50 to-white'}`}
                            placeholder="What feeling is the setting designed to evoke?"
                            value={setting.emotionalImpact}
                            onChange={(e) => updateSetting('emotionalImpact', e.target.value)}
                         />
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};
