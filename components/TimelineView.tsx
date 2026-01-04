
import React, { useState, useMemo } from 'react';
import { BinderItem, WorkspaceTheme } from '../types';
import { Calendar, Clock, GripVertical, AlertCircle, ArrowDown, Layers, MapPin } from 'lucide-react';

interface TimelineViewProps {
  items: BinderItem[];
  onUpdateItem: (id: string, updates: Partial<BinderItem>) => void;
  onSelect: (id: string) => void;
  theme?: WorkspaceTheme;
}

type SortMode = 'narrative' | 'chronological';

export const TimelineView: React.FC<TimelineViewProps> = ({ items, onUpdateItem, onSelect, theme }) => {
  const [draggedItem, setDraggedItem] = useState<BinderItem | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('chronological');

  // Flatten items
  const { scheduled, unscheduled } = useMemo(() => {
    const flat: BinderItem[] = [];
    const traverse = (nodes: BinderItem[]) => {
      nodes.forEach(node => {
        if (node.type === 'document') flat.push(node);
        if (node.children) traverse(node.children);
      });
    };
    traverse(items);

    const withTime = flat.filter(i => i.timelineData?.start);
    const withoutTime = flat.filter(i => !i.timelineData?.start);

    // Sort scheduled based on mode
    if (sortMode === 'chronological') {
        withTime.sort((a, b) => {
            const tA = new Date(a.timelineData!.start!).getTime();
            const tB = new Date(b.timelineData!.start!).getTime();
            return tA - tB;
        });
    } 
    // If 'narrative', we respect the original flat order (Binder order)

    return { scheduled: withTime, unscheduled: withoutTime };
  }, [items, sortMode]);

  const handleTimeChange = (id: string, newTime: string) => {
      // Basic validation
      if(!newTime) return;
      onUpdateItem(id, {
          timelineData: { 
              ...items.find(i => i.id === id)?.timelineData, 
              start: newTime 
          }
      });
  };

  const handleDropOnTimeline = (e: React.DragEvent) => {
      e.preventDefault();
      // Drop logic handled by the specific drop zones (SortDrop) or main area
      // Default fallback: Add to end of time
      if (!draggedItem) return;
      
      if (!draggedItem.timelineData?.start) {
          // If coming from unscheduled, give it a default time (now, or last item + 1 hour)
          const lastItem = scheduled[scheduled.length - 1];
          let newTime = new Date().toISOString().slice(0, 16);
          
          if (lastItem && lastItem.timelineData?.start) {
              const d = new Date(lastItem.timelineData.start);
              d.setHours(d.getHours() + 1);
              // Adjust for timezone offset for input[type="datetime-local"]
              const offset = d.getTimezoneOffset() * 60000;
              newTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
          }

          onUpdateItem(draggedItem.id, {
              timelineData: { start: newTime, duration: 60 }
          });
      }
      setDraggedItem(null);
  };

  const handleUnschedule = (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedItem) return;
      onUpdateItem(draggedItem.id, { timelineData: undefined });
      setDraggedItem(null);
  }

  // Detect time conflicts (items starting at exact same time)
  const getConflictWarning = (currentItem: BinderItem, index: number) => {
      if (sortMode !== 'chronological') return false;
      const prev = scheduled[index - 1];
      if (prev && prev.timelineData?.start === currentItem.timelineData?.start) {
          return true;
      }
      return false;
  };

  const isDark = theme?.isDark;
  const containerStyle = theme ? { background: theme.background } : { backgroundColor: '#f0f2f5' };

  return (
    <div className="flex h-full overflow-hidden animate-in fade-in duration-300 font-sans bg-gray-100">
      {/* Sidebar: Unscheduled */}
      <div 
        className={`w-72 border-r flex flex-col shrink-0 z-10 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleUnschedule}
      >
        <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-gray-800 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
          <div>
            <h3 className={`font-bold text-sm uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Unscheduled</h3>
            <p className="text-[10px] text-gray-400">{unscheduled.length} items</p>
          </div>
        </div>
        
        <div className={`flex-1 overflow-y-auto p-3 space-y-2 ${isDark ? 'bg-gray-900' : 'bg-gray-50/50'}`}>
            {unscheduled.map(item => (
                <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDraggedItem(item)}
                    className={`p-3 border rounded-lg shadow-sm cursor-grab hover:shadow-md transition-all group flex flex-col gap-1
                        ${isDark ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' : 'bg-white border-gray-200 hover:border-indigo-400'}
                    `}
                >
                    <div className="flex items-center gap-2">
                        <GripVertical size={14} className="text-gray-300" />
                        <span className={`font-semibold text-sm truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.title}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 pl-5 truncate">
                        {item.content?.replace(/<[^>]*>?/gm, '').substring(0, 30) || "Empty"}
                    </p>
                </div>
            ))}
            {unscheduled.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-xs italic">
                    All scenes are on the timeline.
                </div>
            )}
        </div>
        <div className={`p-3 border-t text-[10px] text-center text-gray-400 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            Drag items here to remove time.
        </div>
      </div>

      {/* Main Timeline */}
      <div 
        className="flex-1 flex flex-col h-full overflow-hidden transition-colors duration-300"
        style={containerStyle}
      >
          {/* Timeline Header */}
          <div className={`h-14 border-b flex items-center justify-between px-6 shrink-0 shadow-sm z-20 ${isDark ? 'bg-gray-900/90 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
              <div className="flex items-center gap-2">
                  <Calendar className="text-indigo-600" size={18} />
                  <span className="font-bold">Timeline</span>
              </div>
              
              <div className={`flex p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <button 
                    onClick={() => setSortMode('chronological')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${sortMode === 'chronological' ? (isDark ? 'bg-gray-700 text-indigo-300' : 'bg-white text-indigo-700 shadow-sm') : 'text-gray-500 hover:text-gray-400'}`}
                  >
                      Chronological
                  </button>
                  <button 
                    onClick={() => setSortMode('narrative')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${sortMode === 'narrative' ? (isDark ? 'bg-gray-700 text-indigo-300' : 'bg-white text-indigo-700 shadow-sm') : 'text-gray-500 hover:text-gray-400'}`}
                  >
                      Binder Order
                  </button>
              </div>
          </div>

          <div 
            className="flex-1 overflow-y-auto p-8 relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnTimeline}
          >
              <div className="max-w-4xl mx-auto pb-32">
                  {/* Central Line */}
                  <div className="absolute left-[50px] md:left-1/2 top-0 bottom-0 w-0.5 bg-indigo-200 transform md:-translate-x-1/2 z-0"></div>

                  {scheduled.map((item, index) => {
                      const isConflict = getConflictWarning(item, index);
                      const dateObj = new Date(item.timelineData!.start!);
                      const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                          <div key={item.id} className="relative mb-8 group">
                              
                              {/* Connector Node */}
                              <div className={`absolute left-[41px] md:left-1/2 top-6 w-5 h-5 rounded-full border-4 z-10 transform md:-translate-x-1/2 transition-colors shadow-sm
                                  ${isConflict ? 'bg-red-500 border-red-200' : 'bg-white border-indigo-500'}
                              `}></div>

                              {/* Content Container - Alternating sides for visual interest on desktop */}
                              <div className={`flex flex-col md:flex-row items-start md:items-center w-full pl-[70px] md:pl-0 
                                  ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}
                              `}>
                                  
                                  {/* Date/Time Label (Opposite Side) */}
                                  <div className={`md:w-1/2 md:px-12 mb-1 md:mb-0 text-left 
                                      ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}
                                  `}>
                                      <div className="inline-flex flex-col">
                                          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{dateStr}</span>
                                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded border shadow-sm mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                              <Clock size={12} className="text-indigo-500"/>
                                              <input 
                                                  type="datetime-local"
                                                  value={item.timelineData!.start}
                                                  onChange={(e) => handleTimeChange(item.id, e.target.value)}
                                                  className={`text-xs border-none p-0 w-32 focus:ring-0 font-mono bg-transparent ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                                              />
                                          </div>
                                          {isConflict && (
                                              <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1 font-bold">
                                                  <AlertCircle size={10} /> Conflict
                                              </span>
                                          )}
                                      </div>
                                  </div>

                                  {/* Scene Card */}
                                  <div className="md:w-1/2 md:px-12 w-full">
                                      <div 
                                        onClick={() => onSelect(item.id)}
                                        className={`p-4 rounded-xl border shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden group/card
                                            ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                                        `}
                                      >
                                          {/* Duration Bar (Visual) */}
                                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                          
                                          <div className="flex justify-between items-start mb-2">
                                              <h4 className={`font-bold text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.title}</h4>
                                              <div className="flex gap-2">
                                                  {item.sceneSetting?.location && (
                                                      <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 truncate max-w-[80px] ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                                          <MapPin size={8} /> {item.sceneSetting.location}
                                                      </span>
                                                  )}
                                              </div>
                                          </div>
                                          
                                          <p className={`text-xs line-clamp-2 font-serif leading-relaxed mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                              {item.content?.replace(/<[^>]*>?/gm, '') || "No content summary available."}
                                          </p>

                                          <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-50'}`}>
                                              <span className="text-[10px] text-gray-400 font-mono">
                                                  {sortMode === 'narrative' ? `Binder Position: ${items.findIndex(i => i.id === item.id) + 1}` : `Scene Time`}
                                              </span>
                                              <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-medium opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                  Edit Scene <ArrowDown size={10} className="-rotate-90"/>
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                              </div>
                          </div>
                      );
                  })}

                  {scheduled.length === 0 && (
                      <div className="text-center py-20 opacity-50">
                          <Layers size={64} className="mx-auto text-gray-300 mb-4" />
                          <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>Drag scenes from the sidebar to schedule them.</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
