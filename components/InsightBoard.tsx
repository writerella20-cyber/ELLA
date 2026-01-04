
import React, { useState, useMemo } from 'react';
import { BinderItem, PlotThread, WorkspaceTheme } from '../types';
import { ArrowRightLeft, Calendar, Users, MapPin, FileText, GitMerge, AlertTriangle, CheckCircle, Search, Filter, X, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { scanSceneDetails } from '../services/geminiService';

interface InsightBoardProps {
  items: BinderItem[];
  plotThreads: PlotThread[];
  onSelect: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<BinderItem>) => void;
  theme?: WorkspaceTheme;
}

type AxisType = 'Scenes' | 'Characters' | 'Locations' | 'Dates' | 'Plots';

interface GridCell {
    content: React.ReactNode;
    isConflict: boolean;
    sceneIds: string[];
}

interface Conflict {
    id: string;
    description: string;
    scenes: {id: string, title: string}[];
}

export const InsightBoard: React.FC<InsightBoardProps> = ({ items, plotThreads, onSelect, onUpdateItem, theme }) => {
  const [axisX, setAxisX] = useState<AxisType>('Scenes');
  const [axisY, setAxisY] = useState<AxisType>('Characters');
  const [searchFilter, setSearchFilter] = useState('');
  const [showConflicts, setShowConflicts] = useState(true);
  
  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');

  const isDark = theme?.isDark;
  const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#f9fafb' };

  // 1. Flatten Scenes
  const scenes = useMemo(() => {
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

  // 2. Global Conflict Detection
  const conflicts = useMemo(() => {
      const list: Conflict[] = [];
      const charMap = new Map<string, Map<string, Set<string>>>(); // Char -> Date -> Locations

      scenes.forEach(scene => {
          let dateKey = '';
          if (scene.timelineData?.start) {
              dateKey = scene.timelineData.start.split('T')[0];
          } else if (scene.sceneSetting?.time) {
              dateKey = scene.sceneSetting.time;
          }

          const loc = scene.sceneSetting?.location;

          if (dateKey && loc && scene.characterData) {
              scene.characterData.forEach(char => {
                  if (!charMap.has(char.name)) charMap.set(char.name, new Map());
                  const dates = charMap.get(char.name)!;
                  if (!dates.has(dateKey)) dates.set(dateKey, new Set());
                  dates.get(dateKey)!.add(loc);
              });
          }
      });

      charMap.forEach((dates, charName) => {
          dates.forEach((locs, date) => {
              if (locs.size > 1) {
                  const locArray = Array.from(locs);
                  const relatedScenes = scenes.filter(s => {
                      let sDate = s.timelineData?.start?.split('T')[0] || s.sceneSetting?.time;
                      return sDate === date && s.characterData?.some(c => c.name === charName);
                  }).map(s => ({ id: s.id, title: s.title }));

                  list.push({
                      id: `${charName}-${date}`,
                      description: `${charName} is in ${locArray.length} places on ${date}: ${locArray.join(', ')}`,
                      scenes: relatedScenes
                  });
              }
          });
      });

      return list;
  }, [scenes]);

  // 3. Grid Dimensions & Data
  const gridData = useMemo(() => {
    const chars = new Set<string>();
    const locs = new Set<string>();
    const dates = new Set<string>();

    scenes.forEach(scene => {
        scene.characterData?.forEach(c => chars.add(c.name));
        if (scene.sceneSetting?.location) locs.add(scene.sceneSetting.location);
        
        let d = '';
        if (scene.timelineData?.start) d = scene.timelineData.start.split('T')[0];
        else if (scene.sceneSetting?.time) d = scene.sceneSetting.time;
        if (d) dates.add(d);
    });

    const dimData = {
        Scenes: scenes.map(s => s.title),
        Characters: Array.from(chars).sort(),
        Locations: Array.from(locs).sort(),
        Dates: Array.from(dates).sort(),
        Plots: plotThreads.map(t => t.name)
    };

    const xLabels = dimData[axisX];
    const yLabels = dimData[axisY];

    const matrix: GridCell[][] = Array(yLabels.length).fill(null).map(() => Array(xLabels.length).fill(null));

    yLabels.forEach((yLabel, yIdx) => {
        xLabels.forEach((xLabel, xIdx) => {
            const match = (scene: BinderItem, type: AxisType, label: string) => {
                if (type === 'Scenes') return scene.title === label;
                if (type === 'Characters') return scene.characterData?.some(c => c.name === label);
                if (type === 'Locations') return scene.sceneSetting?.location === label;
                if (type === 'Dates') {
                    const t = scene.timelineData?.start?.split('T')[0];
                    return t === label || scene.sceneSetting?.time === label;
                }
                if (type === 'Plots') {
                    const tid = plotThreads.find(t => t.name === label)?.id;
                    return tid && scene.plotPoints?.[tid];
                }
                return false;
            };

            const hits = scenes.filter(s => match(s, axisX, xLabel) && match(s, axisY, yLabel));
            
            let content: React.ReactNode = null;
            let isConflict = false;

            if (hits.length > 0) {
                if ((axisX === 'Dates' && axisY === 'Characters') || (axisX === 'Characters' && axisY === 'Dates')) {
                    const locs = Array.from(new Set(hits.map(h => h.sceneSetting?.location).filter(Boolean)));
                    if (locs.length > 1) {
                        isConflict = true;
                        content = <span className="text-red-600 font-bold text-xs">{locs.length} Locations</span>;
                    } else {
                        content = locs[0] || '-';
                    }
                } else if ((axisX === 'Scenes' && axisY === 'Characters') || (axisX === 'Characters' && axisY === 'Scenes')) {
                    const charName = axisX === 'Characters' ? xLabel : yLabel;
                    const role = hits[0].characterData?.find(c => c.name === charName)?.role;
                    content = role || 'Present';
                } else if ((axisX === 'Plots' && axisY === 'Scenes') || (axisX === 'Scenes' && axisY === 'Plots')) {
                    const pName = axisX === 'Plots' ? xLabel : yLabel;
                    const pid = plotThreads.find(p => p.name === pName)?.id;
                    content = pid ? (hits[0].plotPoints?.[pid] || '-') : '-';
                } else {
                    content = hits.length === 1 ? <span className="truncate max-w-[100px] block" title={hits[0].title}>{hits[0].title}</span> : <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isDark ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-800'}`}>{hits.length}</span>;
                }
            }

            matrix[yIdx][xIdx] = { content, isConflict, sceneIds: hits.map(h => h.id) };
        });
    });

    return { xLabels, yLabels, matrix };
  }, [scenes, axisX, axisY, plotThreads, isDark]);

  const filteredX = gridData.xLabels.map((l, i) => l.toLowerCase().includes(searchFilter.toLowerCase()) ? i : -1).filter(i => i !== -1);

  // --- Scan Functionality ---
  const handleSmartScan = async () => {
      setIsScanning(true);
      setScanProgress(0);
      
      const docsToScan = scenes.filter(s => s.content && s.content.length > 50); // Scan valid docs
      let processed = 0;

      for (const doc of docsToScan) {
          setScanStatus(`Scanning: ${doc.title}...`);
          try {
              // Only scan if missing data to optimize
              if (!doc.characterData || doc.characterData.length === 0 || !doc.sceneSetting?.location) {
                  const result = await scanSceneDetails(doc.content!);
                  
                  if (result) {
                      // Construct update
                      const updates: Partial<BinderItem> = {};
                      
                      // Merge Setting
                      updates.sceneSetting = {
                          ...(doc.sceneSetting || { objects: [], senses: { sight: '', sound: '', smell: '', touch: '', taste: '' }, emotionalImpact: '' }),
                          location: result.location || doc.sceneSetting?.location || '',
                          time: result.time || doc.sceneSetting?.time || ''
                      };

                      // Merge Characters (Simple merge by name)
                      if (result.characters.length > 0) {
                          const existingChars = doc.characterData || [];
                          const newChars = result.characters
                              .filter(name => !existingChars.some(ec => ec.name.toLowerCase() === name.toLowerCase()))
                              .map(name => ({
                                  id: `${Date.now()}-${Math.random()}`,
                                  name,
                                  role: 'Supporting',
                                  goal: '', motivation: '', conflict: '', climax: '', outcome: '', arcStart: '', arcEnd: ''
                              }));
                          updates.characterData = [...existingChars, ...newChars];
                      }

                      // Update Time
                      if (result.date) {
                          updates.timelineData = { ...doc.timelineData, start: result.date };
                      }

                      onUpdateItem(doc.id, updates);
                  }
              }
          } catch (e) {
              console.error("Scan failed for", doc.title, e);
          }
          processed++;
          setScanProgress(Math.round((processed / docsToScan.length) * 100));
      }

      setIsScanning(false);
      setScanStatus('Complete');
      setTimeout(() => setScanStatus(''), 2000);
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden animate-in fade-in duration-300 relative" style={containerStyle}>
        {/* Header */}
        <div className={`h-16 border-b flex items-center justify-between px-6 shrink-0 z-20 shadow-sm ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg shadow-sm ${isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-600 text-white'}`}>
                    <ArrowRightLeft size={18} />
                </div>
                <div>
                    <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        Insight Board
                    </h2>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cross-reference story elements</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden lg:block">
                    <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={14} />
                    <input 
                        type="text" 
                        placeholder={`Filter ${axisX}...`}
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className={`pl-8 pr-4 py-1.5 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 w-48 transition-all ${isDark ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100'}`}
                    />
                </div>

                {/* Scan Button */}
                <button
                    onClick={handleSmartScan}
                    disabled={isScanning}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border
                        ${isScanning 
                            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                            : (isDark ? 'bg-gray-800 text-indigo-300 border-gray-700 hover:bg-gray-700' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm')}
                    `}
                >
                    {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {isScanning ? `${scanProgress}%` : 'Sync/Scan'}
                </button>

                {/* Axis Selectors */}
                <div className={`flex items-center gap-2 p-1 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Y-AXIS</span>
                        <select 
                            value={axisY} 
                            onChange={(e) => setAxisY(e.target.value as AxisType)}
                            className={`border-0 py-1 pl-2 pr-8 rounded text-sm font-semibold focus:ring-0 cursor-pointer shadow-sm ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700'}`}
                        >
                            <option value="Characters">Characters</option>
                            <option value="Locations">Locations</option>
                            <option value="Plots">Plots</option>
                            <option value="Scenes">Scenes</option>
                            <option value="Dates">Dates</option>
                        </select>
                    </div>
                    <div className={`w-px h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">X-AXIS</span>
                        <select 
                            value={axisX} 
                            onChange={(e) => setAxisX(e.target.value as AxisType)}
                            className={`border-0 py-1 pl-2 pr-8 rounded text-sm font-semibold focus:ring-0 cursor-pointer shadow-sm ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700'}`}
                        >
                            <option value="Scenes">Scenes</option>
                            <option value="Dates">Dates</option>
                            <option value="Locations">Locations</option>
                            <option value="Characters">Characters</option>
                            <option value="Plots">Plots</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={() => setShowConflicts(!showConflicts)}
                    className={`p-2 rounded-lg transition-colors relative ${showConflicts ? (isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800') : (isDark ? 'text-gray-500 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100')}`}
                    title="Toggle Conflict Log"
                >
                    <AlertTriangle size={18} />
                    {conflicts.length > 0 && !showConflicts && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                </button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
            {/* Overlay for Scanning */}
            {isScanning && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full text-center">
                        <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Analyzing Manuscript</h3>
                        <p className="text-gray-500 text-sm mb-4">{scanStatus}</p>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Matrix */}
            <div className={`flex-1 overflow-auto p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50/50'}`}>
                <div className={`inline-block min-w-full align-middle border rounded-xl shadow-sm overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                    <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        <thead className={isDark ? 'bg-gray-900' : 'bg-gray-50'}>
                            <tr>
                                <th scope="col" className={`sticky left-0 top-0 z-20 p-4 text-left text-xs font-bold uppercase tracking-wider w-48 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${isDark ? 'bg-gray-900 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Y \ X</span>
                                        <span>{axisY.toUpperCase()} \ {axisX.toUpperCase()}</span>
                                    </div>
                                </th>
                                {gridData.xLabels.map((label, idx) => (
                                    (filteredX.length === 0 || filteredX.includes(idx)) ? (
                                        <th key={idx} scope="col" className={`sticky top-0 z-10 px-6 py-3 text-left text-xs font-bold uppercase tracking-wider border-b min-w-[160px] ${isDark ? 'bg-gray-900 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            <div className="flex items-center gap-1.5">
                                                {axisX === 'Scenes' && <FileText size={12} className="text-gray-400"/>}
                                                {axisX === 'Characters' && <Users size={12} className="text-indigo-400"/>}
                                                {axisX === 'Locations' && <MapPin size={12} className="text-red-400"/>}
                                                {axisX === 'Dates' && <Calendar size={12} className="text-green-400"/>}
                                                {axisX === 'Plots' && <GitMerge size={12} className="text-orange-400"/>}
                                                <span className="truncate max-w-[140px]" title={label}>{label}</span>
                                            </div>
                                        </th>
                                    ) : null
                                ))}
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                            {gridData.yLabels.map((yLabel, yIdx) => (
                                <tr key={yIdx} className={`transition-colors ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-indigo-50/10'}`}>
                                    <td className={`sticky left-0 z-10 p-4 whitespace-nowrap text-sm font-bold border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-opacity-50 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900'}`}>
                                        <div className="flex items-center gap-2">
                                            {axisY === 'Scenes' && <FileText size={14} className="text-gray-400"/>}
                                            {axisY === 'Characters' && <Users size={14} className="text-indigo-500"/>}
                                            {axisY === 'Locations' && <MapPin size={14} className="text-red-500"/>}
                                            {axisY === 'Dates' && <Calendar size={14} className="text-green-500"/>}
                                            {axisY === 'Plots' && <GitMerge size={14} className="text-orange-500"/>}
                                            <span className="truncate max-w-[160px]" title={yLabel}>{yLabel}</span>
                                        </div>
                                    </td>
                                    {gridData.matrix[yIdx].map((cell, xIdx) => (
                                        (filteredX.length === 0 || filteredX.includes(xIdx)) ? (
                                            <td key={xIdx} className={`px-6 py-4 whitespace-normal text-sm border-r last:border-0 relative transition-all duration-200 ${isDark ? 'border-gray-700' : 'border-gray-100'} ${cell.content ? (isDark ? 'bg-gray-700/30' : 'bg-gray-50/30') : ''} ${cell.isConflict ? 'bg-red-50/50' : ''}`}>
                                                {cell.content ? (
                                                    <div 
                                                        className={`cursor-pointer rounded p-1.5 -m-1.5 transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'} ${cell.isConflict ? 'hover:bg-red-100' : ''}`}
                                                        onClick={() => {
                                                            if (cell.sceneIds.length > 0) onSelect(cell.sceneIds[0]);
                                                        }}
                                                    >
                                                        {cell.content}
                                                    </div>
                                                ) : (
                                                    <span className={`text-xs ${isDark ? 'text-gray-700' : 'text-gray-200'}`}>-</span>
                                                )}
                                            </td>
                                        ) : null
                                    ))}
                                </tr>
                            ))}
                            {gridData.yLabels.length === 0 && (
                                <tr>
                                    <td colSpan={Math.max(2, gridData.xLabels.length + 1)} className="px-6 py-16 text-center text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <Filter size={32} className="mb-2 opacity-20" />
                                            <p className="font-medium">No data found</p>
                                            <p className="text-xs mt-1">Try running a 'Sync/Scan' to analyze your content.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Conflict Log Sidebar */}
            {showConflicts && (
                <div className={`w-80 border-l flex flex-col shrink-0 animate-in slide-in-from-right duration-300 shadow-xl z-30 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-gray-700 bg-red-900/20' : 'border-gray-100 bg-red-50/50'}`}>
                        <div className="flex items-center gap-2 text-red-800 font-bold">
                            <AlertTriangle size={18} className="text-red-500"/>
                            <span className={isDark ? 'text-red-400' : ''}>Continuity Errors</span>
                        </div>
                        <button onClick={() => setShowConflicts(false)} className="text-red-400 hover:text-red-700">
                            <X size={16} />
                        </button>
                    </div>
                    
                    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50/30'}`}>
                        {conflicts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                <CheckCircle size={48} className="mb-4 text-green-500 opacity-20" />
                                <p className="text-sm font-medium text-gray-600">No logical conflicts detected!</p>
                                <p className="text-xs mt-2 max-w-[200px]">Your timeline, locations, and characters seem to be in sync.</p>
                            </div>
                        ) : (
                            conflicts.map((conflict, idx) => (
                                <div key={idx} className={`border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group ${isDark ? 'bg-gray-900 border-red-900/50' : 'bg-white border-red-100'}`}>
                                    <div className="flex gap-3 mb-2">
                                        <div className="mt-0.5 text-red-500">
                                            <AlertTriangle size={16} />
                                        </div>
                                        <div className={`text-sm font-medium leading-snug ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                                            {conflict.description}
                                        </div>
                                    </div>
                                    
                                    <div className="pl-7">
                                        <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Found in scenes:</div>
                                        <div className="flex flex-wrap gap-1">
                                            {conflict.scenes.map(s => (
                                                <button 
                                                    key={s.id}
                                                    onClick={() => onSelect(s.id)}
                                                    className={`text-xs px-2 py-1 rounded border transition-colors truncate max-w-full ${isDark ? 'bg-red-900/30 text-red-300 border-red-900 hover:bg-red-900/50' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100 hover:border-red-200'}`}
                                                >
                                                    {s.title}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className={`p-3 border-t text-[10px] text-center text-gray-400 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="font-bold">Tip:</span> Scan to refresh data.
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
