
import React, { useRef, useEffect } from 'react';
import { Editor, EditorRef } from './Editor';
import { Corkboard } from './Corkboard';
import { StructureView } from './StructureView';
import { ScriveningsView } from './ScriveningsView';
import { TimelineView } from './TimelineView';
import { DialogueView } from './DialogueView';
import { StyleSessionView } from './StyleSessionView';
import { ReadabilityView } from './ReadabilityView';
import { PlotGridView } from './PlotGridView';
import { CharacterElementsView } from './CharacterElementsView';
import { StoryMechanicsView } from './StoryMechanicsView';
import { SettingElementsView } from './SettingElementsView';
import { InsightBoard } from './InsightBoard';
import { ReportsView } from './ReportsView';
import { GraphView } from './GraphView'; // Import
import { DatabaseView } from './DatabaseView'; // Import
import { BinderItem, PlotThread, StickyNote, WorkspaceTheme } from '../types';
import { Folder, ChevronRight, Home } from 'lucide-react';

export type ViewMode = 'editor' | 'corkboard' | 'structure' | 'scrivenings' | 'timeline' | 'dialogue' | 'style' | 'readability' | 'plotgrid' | 'character-elements' | 'story-mechanics' | 'setting-elements' | 'insight-board' | 'reports' | 'graph' | 'database';

interface DocumentViewerProps {
  docId: string | null;
  viewMode: ViewMode;
  binderItems: BinderItem[];
  isActive: boolean;
  onFocus: () => void;
  onUpdateContent: (id: string, content: string) => void;
  onNavigate: (id: string | null) => void;
  onSelectDoc: (id: string) => void;
  editorRef?: React.RefObject<EditorRef>;
  zoomLevel?: number;
  onMagicRequest: (type: 'generate' | 'edit', initialText?: string) => void;
  showInlineNotes?: boolean;
  plotThreads: PlotThread[];
  onAddPlotThread: (name: string, color: string) => void;
  onRemovePlotThread: (id: string) => void;
  rootNotes?: StickyNote[];
  onUpdateRootNotes?: (notes: StickyNote[]) => void;
  theme?: WorkspaceTheme;
}

// Helper functions 
const findItemInTree = (items: BinderItem[], id: string): BinderItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemInTree(item.children, id);
        if (found) return found;
      }
    }
    return null;
};

const findParentInTree = (items: BinderItem[], childId: string): { parent: BinderItem | null, items: BinderItem[] } | null => {
    for (const item of items) {
        if (item.children) {
            if (item.children.some(child => child.id === childId)) {
                return { parent: item, items: item.children };
            }
            const found = findParentInTree(item.children, childId);
            if (found) return found;
        }
    }
    if (items.some(i => i.id === childId)) {
        return { parent: null, items: items };
    }
    return null;
};

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  docId,
  viewMode,
  binderItems,
  isActive,
  onFocus,
  onUpdateContent,
  onNavigate,
  onSelectDoc,
  editorRef,
  zoomLevel = 1,
  onMagicRequest,
  showInlineNotes = true,
  plotThreads,
  onAddPlotThread,
  onRemovePlotThread,
  rootNotes = [],
  onUpdateRootNotes,
  theme
}) => {
  
  // Computed Context
  const item = docId ? findItemInTree(binderItems, docId) : null;
  
  // Navigation context
  let corkboardItems: BinderItem[] = binderItems;
  let parentTitle = 'Binder';
  let corkboardParentId: string | null = null;
  let parentItem: BinderItem | null = null;

  if (docId) {
      if (item?.type === 'folder') {
          corkboardItems = item.children || [];
          parentTitle = item.title;
          corkboardParentId = item.id;
          parentItem = item;
      } else {
          const parentData = findParentInTree(binderItems, docId);
          if (parentData) {
              corkboardItems = parentData.items;
              corkboardParentId = parentData.parent?.id || null;
              parentTitle = parentData.parent?.title || 'Binder';
              parentItem = parentData.parent;
          }
      }
  }

  const handleNavigateUp = () => {
     if (!corkboardParentId) {
         onNavigate(null);
         return;
     }
     const parentData = findParentInTree(binderItems, corkboardParentId);
     if (parentData?.parent) {
         onSelectDoc(parentData.parent.id);
     } else {
         onNavigate(null);
     }
  };

  const handleItemUpdate = (id: string, updates: Partial<BinderItem>) => {
      // @ts-ignore 
      (onUpdateContent as any)(id, updates);
  }

  const handleRenameItem = (id: string, newTitle: string) => {
      handleItemUpdate(id, { title: newTitle });
  }

  // Handle Note updates for the current corkboard context (folder)
  const handleUpdateNotes = (notes: StickyNote[]) => {
      if (parentItem) {
          handleItemUpdate(parentItem.id, { stickyNotes: notes });
      }
  };

  // Determine which notes/handler to use: Parent Folder's or Root's
  const notesToShow = parentItem ? parentItem.stickyNotes : rootNotes;
  const updateNotesHandler = parentItem ? handleUpdateNotes : onUpdateRootNotes;

  // Background Style for Editor Mode & others
  const workspaceStyle = theme ? { background: theme.background } : { backgroundColor: '#F9FBFD' };

  return (
    <div 
        className={`flex-1 flex flex-col min-w-0 h-full relative transition-all duration-200 ${isActive ? 'ring-2 ring-inset ring-indigo-500/20' : 'opacity-80 hover:opacity-100'}`}
        onClick={onFocus}
    >
        {(viewMode !== 'editor') && (
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2 text-xs text-gray-600 shrink-0">
                <button onClick={() => onNavigate(null)} className="hover:text-indigo-600 flex items-center gap-1">
                    <Home size={12} />
                </button>
                {corkboardParentId && (
                    <>
                    <ChevronRight size={12} className="text-gray-400" />
                    <span className="font-semibold text-gray-900 truncate max-w-[150px]">{parentTitle}</span>
                    <button 
                        onClick={handleNavigateUp}
                        className="ml-auto text-indigo-600 hover:text-indigo-800 font-medium text-[10px] uppercase tracking-wider"
                    >
                        ↑ Up
                    </button>
                    </>
                )}
            </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col relative">
            {viewMode === 'editor' ? (
                 <div 
                    className="flex-1 overflow-y-auto relative no-scrollbar transition-colors duration-300" 
                    style={workspaceStyle}
                 >
                    {item && item.type === 'document' ? (
                        <>
                            <Editor 
                                key={item.id}
                                ref={editorRef}
                                content={item.content || ''}
                                onChange={(val) => onUpdateContent(item.id, val)}
                                onMagicRequest={onMagicRequest}
                                scale={zoomLevel}
                                onFocus={onFocus}
                                showInlineNotes={showInlineNotes}
                            />
                            <div className="h-20"></div>
                        </>
                    ) : (
                        <div className={`flex flex-col items-center justify-center h-full ${theme?.isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                             <Folder size={48} className="mb-4 opacity-20" />
                             <p className="text-sm">Select a document</p>
                        </div>
                    )}
                 </div>
            ) : viewMode === 'corkboard' ? (
                <Corkboard 
                    items={corkboardItems} 
                    parentId={corkboardParentId}
                    onReorder={() => {}} 
                    onSelect={onSelectDoc}
                    notes={notesToShow}
                    onUpdateNotes={updateNotesHandler}
                    theme={theme}
                />
            ) : viewMode === 'structure' ? (
                <StructureView 
                    items={corkboardItems}
                    onSelect={onSelectDoc}
                    theme={theme}
                />
            ) : viewMode === 'timeline' ? (
                <TimelineView
                    items={corkboardItems}
                    onUpdateItem={handleItemUpdate}
                    onSelect={onSelectDoc}
                    theme={theme}
                />
            ) : viewMode === 'dialogue' ? (
                <DialogueView
                    items={corkboardItems}
                    onUpdateItem={handleItemUpdate}
                    onSelect={onSelectDoc}
                    theme={theme}
                />
            ) : viewMode === 'style' ? (
                <StyleSessionView 
                    items={corkboardItems}
                    onUpdateContent={onUpdateContent}
                    theme={theme}
                />
            ) : viewMode === 'readability' ? (
                <ReadabilityView
                    activeDocId={docId}
                    items={binderItems}
                    onUpdateItem={handleItemUpdate}
                    theme={theme}
                />
            ) : viewMode === 'plotgrid' ? (
                <PlotGridView 
                    items={corkboardItems}
                    threads={plotThreads}
                    onUpdateItem={handleItemUpdate}
                    onAddThread={onAddPlotThread}
                    onRemoveThread={onRemovePlotThread}
                    onSelect={onSelectDoc}
                    theme={theme}
                />
            ) : viewMode === 'character-elements' ? (
                <CharacterElementsView 
                    item={item}
                    onUpdateItem={handleItemUpdate}
                    binderItems={binderItems} // Pass global items for backlinks
                    onNavigate={onSelectDoc}
                    theme={theme}
                />
            ) : viewMode === 'story-mechanics' ? (
                <StoryMechanicsView 
                    item={item}
                    onUpdateItem={handleItemUpdate}
                    onRenameItem={handleRenameItem}
                    theme={theme}
                />
            ) : viewMode === 'setting-elements' ? (
                <SettingElementsView 
                    item={item}
                    onUpdateItem={handleItemUpdate}
                    theme={theme}
                />
            ) : viewMode === 'insight-board' ? (
                <InsightBoard 
                    items={binderItems}
                    plotThreads={plotThreads}
                    onSelect={onSelectDoc}
                    onUpdateItem={handleItemUpdate}
                    theme={theme}
                />
            ) : viewMode === 'reports' ? (
                <ReportsView 
                    items={binderItems}
                    activeDocId={docId}
                    theme={theme}
                />
            ) : viewMode === 'graph' ? (
                <GraphView items={binderItems} onSelect={onSelectDoc} theme={theme} />
            ) : viewMode === 'database' ? (
                <DatabaseView items={binderItems} onSelect={onSelectDoc} theme={theme} />
            ) : (
                <ScriveningsView
                    items={corkboardItems}
                    onUpdateContent={onUpdateContent}
                    onMagicRequest={onMagicRequest}
                    onSetActive={onSelectDoc}
                    activeDocId={docId}
                    theme={theme}
                />
            )}
        </div>
    </div>
  );
};
