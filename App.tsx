
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Toolbar } from './components/Toolbar';
import { EditorRef } from './components/Editor';
import { AIAssistant } from './components/AIAssistant';
import { MenuBar } from './components/MenuBar';
import { TemplateModal } from './components/TemplateModal';
import { Template } from './data/templates';
import { BinderSidebar } from './components/BinderSidebar';
import { DocumentViewer, ViewMode } from './components/DocumentViewer';
import { VersionHistory } from './components/VersionHistory';
import { Bookshelf } from './components/Bookshelf';
import { BookDesignerModal } from './components/BookDesignerModal';
import { RevisionDashboard } from './components/RevisionDashboard';
import { StickyNotesBoard } from './components/StickyNotesBoard';
import { ThemeGalleryModal } from './components/ThemeGalleryModal';
import { applyDesignToBinder } from './services/bookFormatService';
import { exportToFDX } from './services/exporter';
import { autoPopulateSceneData } from './services/geminiService';
import { 
    Cloud, Loader2, PanelLeft, LayoutGrid, PenTool, 
    List, ScrollText, Columns2, Rows2, Square, X, History, Calendar, MessageSquare, BookOpen, Eye, 
    ChevronDown, Library, ArrowLeft, GitMerge, Users, Compass, Globe, Table2, Activity, Network, Database,
    Bookmark, StickyNote as StickyIcon, Palette, Settings, Layout, RefreshCw, Sparkles, Book, Share2, Download, Info
} from 'lucide-react';
import { BinderItem, DocumentVersion, Project, BookDesign, PlotThread, StickyNote, WorkspaceTheme } from './types';
import { BOOK_DESIGNS } from './data/bookDesigns';
import { WORKSPACE_THEMES } from './data/themes';

const BINDER_STORAGE_PREFIX = 'nebula_content_'; // + projectId
const METADATA_STORAGE_KEY = 'nebula_projects_meta';

// Legacy keys for migration
const LEGACY_BINDER_KEY = 'nebula_binder_data';
const LEGACY_THREADS_KEY = 'nebula_plot_threads';
const LEGACY_NOTES_KEY = 'nebula_root_notes';

// --- View Categories Configuration ---
const VIEW_CATEGORIES = {
  Writing: [
    { mode: 'editor', label: 'Editor', icon: PenTool },
    { mode: 'scrivenings', label: 'Scrivenings', icon: ScrollText },
    { mode: 'dialogue', label: 'Dialogue Audit', icon: MessageSquare },
    { mode: 'style', label: 'Style Focus', icon: BookOpen },
  ],
  Planning: [
    { mode: 'corkboard', label: 'Corkboard', icon: LayoutGrid },
    { mode: 'timeline', label: 'Timeline', icon: Calendar },
    { mode: 'plotgrid', label: 'Plot Grid', icon: GitMerge },
    { mode: 'graph', label: 'Network Graph', icon: Network },
  ],
  World: [
    { mode: 'character-elements', label: 'Characters', icon: Users },
    { mode: 'story-mechanics', label: 'Story Arc', icon: Compass },
    { mode: 'setting-elements', label: 'Settings', icon: Globe },
    { mode: 'database', label: 'Database', icon: Database },
  ],
  Analysis: [
    { mode: 'insight-board', label: 'Insight Board', icon: Table2 },
    { mode: 'reports', label: 'Full Reports', icon: Activity },
  ]
};

// --- Helper Functions ---
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

const updateItemInTree = (items: BinderItem[], id: string, updates: Partial<BinderItem>): BinderItem[] => {
  return items.map(item => {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    if (item.children) {
      return { ...item, children: updateItemInTree(item.children, id, updates) };
    }
    return item;
  });
};

const deleteItemInTree = (items: BinderItem[], id: string): BinderItem[] => {
  return items.filter(item => item.id !== id).map(item => {
    if (item.children) {
      return { ...item, children: deleteItemInTree(item.children, id) };
    }
    return item;
  });
};

const addItemToTree = (items: BinderItem[], parentId: string | undefined, newItem: BinderItem): BinderItem[] => {
  if (!parentId) {
    return [...items, newItem];
  }
  return items.map(item => {
    if (item.id === parentId) {
      return { ...item, children: [...(item.children || []), newItem], isOpen: true };
    }
    if (item.children) {
      return { ...item, children: addItemToTree(item.children, parentId, newItem) };
    }
    return item;
  });
};

const findFirstDocument = (items: BinderItem[]): BinderItem | null => {
    for(const item of items) {
        if (item.type === 'document') return item;
        if (item.children) {
            const found = findFirstDocument(item.children);
            if (found) return found;
        }
    }
    return null;
}

type SplitMode = 'single' | 'vertical' | 'horizontal';

interface ViewState {
    projectId: string;
    docId: string | null;
    viewMode: ViewMode;
}

interface ProjectContent {
    binderItems: BinderItem[];
    plotThreads: PlotThread[];
    rootNotes: StickyNote[];
}

const DEFAULT_CONTENT: ProjectContent = {
    binderItems: [],
    plotThreads: [{ id: 'main', name: 'Main Plot', color: '#818cf8' }],
    rootNotes: []
};

const App: React.FC = () => {
  // App View State
  const [showBookshelf, setShowBookshelf] = useState(false); // Start in workspace if data exists, handled in useEffect
  
  // Projects Metadata
  const [projects, setProjects] = useState<Project[]>([]);

  // Project Content Store (Loaded projects)
  const [projectContents, setProjectContents] = useState<Record<string, ProjectContent>>({});

  // View State
  const [splitMode, setSplitMode] = useState<SplitMode>('single');
  const [primaryView, setPrimaryView] = useState<ViewState>({ projectId: 'p1', docId: null, viewMode: 'editor' });
  const [secondaryView, setSecondaryView] = useState<ViewState>({ projectId: 'p1', docId: null, viewMode: 'editor' });
  const [focusedPane, setFocusedPane] = useState<'primary' | 'secondary'>('primary');
  const [isBinderOpen, setIsBinderOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<WorkspaceTheme>(WORKSPACE_THEMES[0]);

  // UI State
  const [isMagicOpen, setIsMagicOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStickyOpen, setIsStickyOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isBookDesignerOpen, setIsBookDesignerOpen] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [isThemeGalleryOpen, setIsThemeGalleryOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  
  const [magicMode, setMagicMode] = useState<'chat' | 'generate' | 'edit'>('chat');
  const [refineSelection, setRefineSelection] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showInlineNotes, setShowInlineNotes] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); // New state for Smart Sync

  const isLoadedRef = useRef(false);
  const primaryEditorRef = useRef<EditorRef>(null);
  const secondaryEditorRef = useRef<EditorRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Derived Active Context
  const activeView = focusedPane === 'primary' ? primaryView : secondaryView;
  const activeProjectId = activeView.projectId;
  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeContent = projectContents[activeProjectId] || DEFAULT_CONTENT;
  
  // Helpers for current context
  const binderItems = activeContent.binderItems;
  const plotThreads = activeContent.plotThreads;
  const rootNotes = activeContent.rootNotes;
  const activeDocId = activeView.docId;
  const activeItem = activeDocId ? findItemInTree(binderItems, activeDocId) : null;
  const activeDocTitle = activeItem ? activeItem.title : (activeProject?.title || 'Untitled');

  // -- Initialization --
  useEffect(() => {
      // 1. Load Projects Metadata
      const metaData = localStorage.getItem(METADATA_STORAGE_KEY);
      let loadedProjects: Project[] = [];
      
      if (metaData) {
          try { loadedProjects = JSON.parse(metaData); } catch(e) { console.error(e); }
      }

      if (loadedProjects.length === 0) {
          // Default first project
          loadedProjects = [{
              id: 'p1',
              title: 'The Silent Ocean',
              author: 'J. Doe',
              lastModified: new Date(),
              wordCount: 0,
              synopsis: 'A new story begins...',
              coverStyle: { color: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', font: 'Playfair Display' }
          }];
      }
      setProjects(loadedProjects);

      // 2. Load Content for initial projects (or legacy migration)
      const initialContents: Record<string, ProjectContent> = {};
      
      // Check legacy single-project data
      const legacyBinder = localStorage.getItem(LEGACY_BINDER_KEY);
      const legacyThreads = localStorage.getItem(LEGACY_THREADS_KEY);
      const legacyNotes = localStorage.getItem(LEGACY_NOTES_KEY);

      if (legacyBinder) {
          // Migrating legacy data to Project 'p1'
          try {
              initialContents['p1'] = {
                  binderItems: JSON.parse(legacyBinder),
                  plotThreads: legacyThreads ? JSON.parse(legacyThreads) : DEFAULT_CONTENT.plotThreads,
                  rootNotes: legacyNotes ? JSON.parse(legacyNotes) : []
              };
          } catch(e) { console.error("Migration failed", e); }
      }

      // Check specific project data
      loadedProjects.forEach(p => {
          if (!initialContents[p.id]) {
              const stored = localStorage.getItem(BINDER_STORAGE_PREFIX + p.id);
              if (stored) {
                  try { initialContents[p.id] = JSON.parse(stored); } catch(e) {}
              } else {
                  // Initialize empty
                  const newId = 'doc-' + Date.now();
                  initialContents[p.id] = {
                      binderItems: [{ id: newId, type: 'document', title: 'Untitled Document', content: '<p>Start writing...</p>' }],
                      plotThreads: DEFAULT_CONTENT.plotThreads,
                      rootNotes: []
                  };
              }
          }
      });

      setProjectContents(initialContents);

      // Setup initial view
      const startProj = loadedProjects[0].id;
      const firstDoc = findFirstDocument(initialContents[startProj]?.binderItems || []);
      
      setPrimaryView({ projectId: startProj, docId: firstDoc?.id || null, viewMode: 'editor' });
      setSecondaryView({ projectId: startProj, docId: firstDoc?.id || null, viewMode: 'editor' });

      isLoadedRef.current = true;
  }, []);

  // -- Update Document Title --
  useEffect(() => {
      document.title = activeDocTitle ? `${activeDocTitle} | Nebula Docs` : 'Nebula Docs';
  }, [activeDocTitle]);

  // -- Persistence --
  useEffect(() => {
      if (!isLoadedRef.current) return;

      const saveData = () => {
          localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(projects));
          
          // Save each project's content
          Object.entries(projectContents).forEach(([pid, content]) => {
              localStorage.setItem(BINDER_STORAGE_PREFIX + pid, JSON.stringify(content));
          });

          // Also update legacy keys for 'p1' for safety/backward compatibility for now
          if (projectContents['p1']) {
              localStorage.setItem(LEGACY_BINDER_KEY, JSON.stringify(projectContents['p1'].binderItems));
              localStorage.setItem(LEGACY_THREADS_KEY, JSON.stringify(projectContents['p1'].plotThreads));
              localStorage.setItem(LEGACY_NOTES_KEY, JSON.stringify(projectContents['p1'].rootNotes)); 
          }

          setSaveStatus('saved');
      };

      const timer = setTimeout(saveData, 2000);
      return () => clearTimeout(timer);
  }, [projectContents, projects]);

  // -- Click Outside Handlers for Custom Menus --
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
              setIsViewMenuOpen(false);
          }
          if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
              setIsSettingsMenuOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Handlers (Context Aware) ---

  const updateProjectContent = (pid: string, updates: Partial<ProjectContent>) => {
      setSaveStatus('saving');
      setProjectContents(prev => ({
          ...prev,
          [pid]: { ...prev[pid], ...updates }
      }));
  };

  const handleItemUpdate = (id: string, update: string | Partial<BinderItem>) => {
      const pid = activeProjectId;
      const currentItems = projectContents[pid]?.binderItems || [];
      
      let updates: Partial<BinderItem> = {};
      if (typeof update === 'string') {
          updates = { content: update };
      } else {
          updates = update;
      }
      
      const newItems = updateItemInTree(currentItems, id, updates);
      updateProjectContent(pid, { binderItems: newItems });
  };

  const handleTitleUpdate = (newTitle: string) => {
      if (activeDocId) {
          const pid = activeProjectId;
          const currentItems = projectContents[pid]?.binderItems || [];
          const newItems = updateItemInTree(currentItems, activeDocId, { title: newTitle });
          updateProjectContent(pid, { binderItems: newItems });
      }
  };

  // --- Smart Sync Logic ---
  const handleSmartSync = async () => {
      if (!activeDocId || !activeItem || !activeItem.content) {
          alert("Open a document with text to sync.");
          return;
      }

      setIsSyncing(true);
      try {
          const result = await autoPopulateSceneData(activeItem.content);
          if (result) {
              handleItemUpdate(activeDocId, {
                  characterData: result.characters,
                  sceneSetting: result.setting,
                  sceneMetadata: result.metadata,
                  timelineData: result.timeline.start ? { ...activeItem.timelineData, start: result.timeline.start } : activeItem.timelineData
              });
          }
      } catch (error) {
          console.error("Sync failed", error);
      } finally {
          setIsSyncing(false);
      }
  };

  // --- Project Management Handlers ---
  const handleOpenProject = (project: Project) => {
      // Ensure data is initialized if it's a new session load
      if (!projectContents[project.id]) {
          const stored = localStorage.getItem(BINDER_STORAGE_PREFIX + project.id);
          let content = stored ? JSON.parse(stored) : null;
          
          if (!content) {
               const newId = 'doc-' + Date.now();
               content = {
                  binderItems: [{ id: newId, type: 'document', title: 'Start Here', content: '' }],
                  plotThreads: DEFAULT_CONTENT.plotThreads,
                  rootNotes: []
               };
          }
          setProjectContents(prev => ({ ...prev, [project.id]: content }));
      }

      // Determine first doc
      const content = projectContents[project.id] || DEFAULT_CONTENT; // Fallback
      const firstDoc = findFirstDocument(content.binderItems);

      // Update the FOCUSED pane
      if (focusedPane === 'primary') {
          setPrimaryView({ projectId: project.id, docId: firstDoc?.id || null, viewMode: 'editor' });
      } else {
          setSecondaryView({ projectId: project.id, docId: firstDoc?.id || null, viewMode: 'editor' });
      }
      
      setShowBookshelf(false);
  };

  const handleCreateProject = () => {
      const newId = 'p' + Date.now();
      const newProject: Project = {
          id: newId,
          title: 'Untitled Project',
          author: 'Author',
          lastModified: new Date(),
          wordCount: 0,
          synopsis: '',
          coverStyle: { color: '#4f46e5', font: 'Inter' }
      };
      setProjects(prev => [...prev, newProject]);
      
      // Init Data
      const firstDocId = 'doc-' + Date.now();
      setProjectContents(prev => ({
          ...prev,
          [newId]: {
              binderItems: [{ id: firstDocId, type: 'document', title: 'Chapter 1', content: '' }],
              plotThreads: DEFAULT_CONTENT.plotThreads,
              rootNotes: []
          }
      }));

      handleOpenProject(newProject);
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleDeleteProject = (id: string) => {
      if(confirm("Are you sure? This will delete the project and all documents.")) {
          setProjects(prev => prev.filter(p => p.id !== id));
          // Logic to switch view if active project deleted omitted for brevity
      }
  };

  const handleToggleFavorite = (id: string) => {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  }

  // --- Import / Export Handlers ---
  const handleBackupProject = () => {
      if (!activeProject) return;
      const data = {
          metadata: activeProject,
          content: activeContent
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProject.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_backup.json`;
      a.click();
      URL.revokeObjectURL(url);
      setIsSettingsMenuOpen(false);
  };

  const handleImportProject = (data: any) => {
      if (data && data.metadata && data.content) {
          // Verify ID uniqueness or regenerate
          const newId = 'p' + Date.now(); // Always new ID to avoid conflict
          const newProject = { ...data.metadata, id: newId };
          const newContent = data.content;

          setProjects(prev => [...prev, newProject]);
          setProjectContents(prev => ({ ...prev, [newId]: newContent }));
          
          alert("Project imported successfully!");
      } else {
          alert("Invalid project file.");
      }
  };

  // --- Specific Item Handlers (Using Active Context) ---
  const handleSelectDoc = (id: string) => {
      // Find which project this doc belongs to? 
      // Assumption: The user selects from the sidebar, which is bound to activeProjectId.
      const pid = activeProjectId; 
      const newItem = findItemInTree(projectContents[pid]?.binderItems || [], id);
      if (!newItem) return;

      const updateState = (prev: ViewState): ViewState => {
          let newMode = prev.viewMode;
          if (newItem.type === 'document') {
              if (['graph', 'database', 'corkboard'].includes(newMode)) newMode = 'editor';
          }
          return { ...prev, docId: id, viewMode: newMode };
      };

      if (focusedPane === 'primary') setPrimaryView(updateState);
      else setSecondaryView(updateState);
  };

  const handleAddItem = (type: 'folder' | 'document', parentId?: string) => {
      const pid = activeProjectId;
      const currentItems = projectContents[pid]?.binderItems || [];
      
      const newItem: BinderItem = {
          id: `${type}-${Date.now()}`,
          type,
          title: type === 'folder' ? 'New Group' : 'Untitled Scene',
          content: '',
          children: type === 'folder' ? [] : undefined,
          isOpen: true,
          versions: []
      };

      let targetParentId = parentId;
      if (!targetParentId && activeDocId) {
          const activeItem = findItemInTree(currentItems, activeDocId);
          if (activeItem?.type === 'folder') {
              targetParentId = activeItem.id;
          } else {
              const parentInfo = findParentInTree(currentItems, activeDocId);
              targetParentId = parentInfo?.parent?.id;
          }
      }

      const newItems = addItemToTree(currentItems, targetParentId, newItem);
      updateProjectContent(pid, { binderItems: newItems });

      // Auto-select
      if (focusedPane === 'primary') setPrimaryView(prev => ({ ...prev, docId: newItem.id, viewMode: type === 'document' ? 'editor' : 'corkboard' }));
      else setSecondaryView(prev => ({ ...prev, docId: newItem.id, viewMode: type === 'document' ? 'editor' : 'corkboard' }));
  };

  const handleToggleFolder = (id: string) => {
      const pid = activeProjectId;
      const currentItems = projectContents[pid]?.binderItems || [];
      const item = findItemInTree(currentItems, id);
      if (item) {
          const newItems = updateItemInTree(currentItems, id, { isOpen: !item.isOpen });
          updateProjectContent(pid, { binderItems: newItems });
      }
  };

  const handleDeleteItem = (id: string) => {
      if (!confirm("Delete item?")) return;
      const pid = activeProjectId;
      const newItems = deleteItemInTree(projectContents[pid]?.binderItems || [], id);
      updateProjectContent(pid, { binderItems: newItems });
      
      if (activeDocId === id) {
          if (focusedPane === 'primary') setPrimaryView(prev => ({ ...prev, docId: null, viewMode: 'corkboard' }));
          else setSecondaryView(prev => ({ ...prev, docId: null, viewMode: 'corkboard' }));
      }
  };

  const handleRenameItem = (id: string, newName: string) => {
      const pid = activeProjectId;
      const newItems = updateItemInTree(projectContents[pid]?.binderItems || [], id, { title: newName });
      updateProjectContent(pid, { binderItems: newItems });
  };

  const handleToggleBookmark = (targetId?: string) => {
      const idToToggle = targetId || activeDocId;
      if (!idToToggle) return;
      
      const pid = activeProjectId;
      const items = projectContents[pid]?.binderItems || [];
      const item = findItemInTree(items, idToToggle);
      
      if (item) {
          const newItems = updateItemInTree(items, idToToggle, { isBookmarked: !item.isBookmarked });
          updateProjectContent(pid, { binderItems: newItems });
      }
  };

  // --- Plot & Note Handlers ---
  const handleAddPlotThread = (name: string, color: string) => {
      const pid = activeProjectId;
      const current = projectContents[pid]?.plotThreads || [];
      updateProjectContent(pid, { plotThreads: [...current, { id: Date.now().toString(), name, color }] });
  };

  const handleRemovePlotThread = (id: string) => {
      const pid = activeProjectId;
      const current = projectContents[pid]?.plotThreads || [];
      updateProjectContent(pid, { plotThreads: current.filter(t => t.id !== id) });
  };

  const handleUpdateRootNotes = (notes: StickyNote[]) => {
      updateProjectContent(activeProjectId, { rootNotes: notes });
  };

  const handleAddStickyNote = (color: string) => {
      if (!activeDocId) return;
      const pid = activeProjectId;
      const items = projectContents[pid]?.binderItems || [];
      const item = findItemInTree(items, activeDocId);
      if(!item) return;

      const newNote: StickyNote = { id: Date.now().toString(), content: '', color, rotation: (Math.random() - 0.5) * 4 };
      const newItems = updateItemInTree(items, activeDocId, { stickyNotes: [...(item.stickyNotes || []), newNote] });
      updateProjectContent(pid, { binderItems: newItems });
  };

  const handleUpdateStickyNote = (noteId: string, content: string) => {
      if (!activeDocId) return;
      const pid = activeProjectId;
      const items = projectContents[pid]?.binderItems || [];
      const item = findItemInTree(items, activeDocId);
      if(!item || !item.stickyNotes) return;

      const updatedNotes = item.stickyNotes.map(n => n.id === noteId ? { ...n, content } : n);
      const newItems = updateItemInTree(items, activeDocId, { stickyNotes: updatedNotes });
      updateProjectContent(pid, { binderItems: newItems });
  };

  const handleDeleteStickyNote = (noteId: string) => {
      if (!activeDocId) return;
      const pid = activeProjectId;
      const items = projectContents[pid]?.binderItems || [];
      const item = findItemInTree(items, activeDocId);
      if(!item || !item.stickyNotes) return;

      const updatedNotes = item.stickyNotes.filter(n => n.id !== noteId);
      const newItems = updateItemInTree(items, activeDocId, { stickyNotes: updatedNotes });
      updateProjectContent(pid, { binderItems: newItems });
  };

  const handleChangeStickyColor = (noteId: string, color: string) => {
      if (!activeDocId) return;
      const pid = activeProjectId;
      const items = projectContents[pid]?.binderItems || [];
      const item = findItemInTree(items, activeDocId);
      if(!item || !item.stickyNotes) return;

      const updatedNotes = item.stickyNotes.map(n => n.id === noteId ? { ...n, color } : n);
      const newItems = updateItemInTree(items, activeDocId, { stickyNotes: updatedNotes });
      updateProjectContent(pid, { binderItems: newItems });
  };

  // --- Snapshot Handlers ---
  const handleCreateSnapshot = (name: string) => {
      if (!activeDocId) return;
      const pid = activeProjectId;
      const items = projectContents[pid]?.binderItems || [];
      const item = findItemInTree(items, activeDocId);
      if (!item) return;

      const newVersion: DocumentVersion = {
          id: Date.now().toString(),
          name: name,
          timestamp: new Date().toISOString(),
          content: item.content || ''
      };
      
      const newItems = updateItemInTree(items, activeDocId, { versions: [...(item.versions || []), newVersion] });
      updateProjectContent(pid, { binderItems: newItems });
  };

  const handleRestoreSnapshot = (version: DocumentVersion) => {
      if(activeDocId) handleItemUpdate(activeDocId, version.content);
  };

  const handleDeleteSnapshot = (versionId: string) => {
      if (!activeDocId) return;
      const pid = activeProjectId;
      const items = projectContents[pid]?.binderItems || [];
      const item = findItemInTree(items, activeDocId);
      if (!item) return;

      const updatedVersions = (item.versions || []).filter(v => v.id !== versionId);
      const newItems = updateItemInTree(items, activeDocId, { versions: updatedVersions });
      updateProjectContent(pid, { binderItems: newItems });
  };

  // --- Split Layout ---
  const handleSplitLayout = (mode: SplitMode) => {
      if (mode !== 'single' && splitMode === 'single') {
          // Initialize secondary view with a copy of primary, or keep separate?
          // Default: Same project, same doc to start.
          setSecondaryView({ ...primaryView }); 
          setFocusedPane('secondary');
      }
      setSplitMode(mode);
  };

  // --- View Mode Helpers ---
  const setViewModeForActive = (mode: ViewMode) => {
      if (focusedPane === 'primary') setPrimaryView(prev => ({ ...prev, viewMode: mode }));
      else setSecondaryView(prev => ({ ...prev, viewMode: mode }));
      setIsViewMenuOpen(false); // Close dropdown on selection
  };

  const handleNavigateView = (id: string | null) => {
      if (focusedPane === 'primary') setPrimaryView(prev => ({ ...prev, docId: id }));
      else setSecondaryView(prev => ({ ...prev, docId: id }));
  };

  // --- Toolbar Handlers ---
  const activeEditorRef = focusedPane === 'primary' ? primaryEditorRef : secondaryEditorRef;
  const handleFormat = (cmd: string, val?: string) => activeEditorRef.current?.executeCommand(cmd, val);
  const handleInsertImage = () => { fileInputRef.current?.click(); };
  const handleMagicRequest = (type: 'generate' | 'edit', text?: string) => { 
      setMagicMode(type); 
      if(text) setRefineSelection(text); 
      setIsMagicOpen(true); 
  };
  const handleInsertContent = (c: string, t: 'text' | 'image') => activeEditorRef.current?.insertContent(c, t);
  const handleExport = () => {
     if(!activeItem?.content) return;
     const blob = new Blob([activeItem.content], {type: 'text/html'});
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `${activeItem.title || 'document'}.html`;
     a.click();
  };
  const getActiveTextContent = () => {
      if (!activeDocId) return '';
      const item = findItemInTree(binderItems, activeDocId);
      if (!item?.content) return '';
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = item.content;
      return tempDiv.textContent || tempDiv.innerText || '';
  }

  // --- Apply Template (Complex) ---
  const handleApplyTemplate = (t: Template) => {
      const pid = activeProjectId;
      const currentItems = projectContents[pid]?.binderItems || [];
      const item = activeDocId ? findItemInTree(currentItems, activeDocId) : null;

      if (item && item.type === 'document' && activeView.viewMode === 'editor') {
          if (activeEditorRef.current) {
              activeEditorRef.current.insertContent(t.content, 'text');
          } else {
              handleItemUpdate(item.id, (item.content || '') + t.content);
          }
      } else {
          // New Doc
          const newItem: BinderItem = {
              id: `doc-${Date.now()}`,
              type: 'document',
              title: t.name,
              content: t.content
          };
          let targetParentId = undefined;
          if (item?.type === 'folder') targetParentId = item.id;
          else if (item) targetParentId = findParentInTree(currentItems, item.id)?.parent?.id;

          const newItems = addItemToTree(currentItems, targetParentId, newItem);
          updateProjectContent(pid, { binderItems: newItems });
          
          if (focusedPane === 'primary') setPrimaryView(prev => ({ ...prev, docId: newItem.id, viewMode: 'editor' }));
          else setSecondaryView(prev => ({ ...prev, docId: newItem.id, viewMode: 'editor' }));
      }
      setIsTemplateModalOpen(false);
  };

  const handleApplyBookDesign = (design: BookDesign, scope: 'active' | 'all') => {
      const pid = activeProjectId;
      const currentItems = projectContents[pid]?.binderItems || [];
      
      if (scope === 'all') {
          const newItems = applyDesignToBinder(currentItems, design);
          updateProjectContent(pid, { binderItems: newItems });
      } else if (activeDocId) {
          const item = findItemInTree(currentItems, activeDocId);
          if (item?.content) {
             const transformed = applyDesignToBinder([item], design)[0];
             handleItemUpdate(activeDocId, transformed.content || '');
          }
      }
  };

  const getCurrentViewLabel = () => {
      const mode = activeView.viewMode;
      for (const cat in VIEW_CATEGORIES) {
          // @ts-ignore
          const found = VIEW_CATEGORIES[cat].find(v => v.mode === mode);
          if (found) return found;
      }
      return { label: 'Editor', icon: PenTool }; // Default
  };

  const currentViewConfig = getCurrentViewLabel();
  const CurrentViewIcon = currentViewConfig.icon;

  // --- Render ---

  if (showBookshelf) {
      return (
          <Bookshelf 
            projects={projects}
            onOpenProject={handleOpenProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onToggleFavorite={handleToggleFavorite}
            onUpdateProject={handleUpdateProject}
            onImportProject={handleImportProject}
          />
      );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#F0F2F5]">
      {/* Fallback inline style for hiding file input if Tailwind class is missing */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        style={{ display: 'none' }}
        accept="image/*" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => activeEditorRef.current?.insertContent(ev.target?.result as string, 'image');
              reader.readAsDataURL(file);
          }
      }} />

      <TemplateModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} onSelectTemplate={handleApplyTemplate} />
      <BookDesignerModal isOpen={isBookDesignerOpen} onClose={() => setIsBookDesignerOpen(false)} onApply={handleApplyBookDesign} />
      <ThemeGalleryModal 
          isOpen={isThemeGalleryOpen} 
          onClose={() => setIsThemeGalleryOpen(false)} 
          onSelectTheme={setCurrentTheme} 
          activeThemeId={currentTheme.id}
      />
      
      <RevisionDashboard 
          isOpen={isRevisionOpen}
          onClose={() => setIsRevisionOpen(false)}
          documentContent={activeItem?.content || ''}
          onApplySuggestion={(original, replacement) => {
              if (activeItem?.content) {
                  const newContent = activeItem.content.replace(original, replacement);
                  handleItemUpdate(activeItem.id, newContent);
              }
          }}
          onApplyAll={(suggestions) => {
              if (activeItem?.content) {
                  let newContent = activeItem.content;
                  suggestions.forEach(s => { newContent = newContent.replace(s.original, s.replacement); });
                  handleItemUpdate(activeItem.id, newContent);
              }
          }}
      />

      {/* Header */}
      <div className="h-14 bg-white border-b border-gray-300 flex items-center px-4 justify-between shrink-0 z-50 relative shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={() => setShowBookshelf(true)} 
            className="flex items-center gap-2 mr-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-indigo-600 transition-colors font-medium text-sm" 
            title="Return to Library"
          >
             <Library size={18} />
             <span className="hidden sm:inline">Library</span>
          </button>

          <button onClick={() => setIsBinderOpen(!isBinderOpen)} className={`p-2 rounded-md transition-colors ${isBinderOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}>
             <PanelLeft size={20} />
          </button>

          {/* New Central View Switcher Dropdown */}
          <div className="relative" ref={viewMenuRef}>
              <button 
                onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-200"
              >
                  <CurrentViewIcon size={16} className="text-indigo-600" />
                  <span className="text-sm font-semibold hidden sm:inline">{currentViewConfig.label}</span>
                  <ChevronDown size={14} className="opacity-50" />
              </button>

              {isViewMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                      {Object.entries(VIEW_CATEGORIES).map(([category, views]) => (
                          <div key={category} className="p-2 border-b last:border-0 border-gray-100">
                              <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{category}</div>
                              <div className="grid grid-cols-2 gap-1">
                                  {views.map(v => (
                                      <button
                                        key={v.mode}
                                        onClick={() => setViewModeForActive(v.mode as ViewMode)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs gap-1 transition-colors
                                            ${activeView.viewMode === v.mode ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                        `}
                                      >
                                          <v.icon size={18} className="opacity-80" />
                                          <span>{v.label}</span>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
          
          <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={activeDocTitle}
                onChange={(e) => handleTitleUpdate(e.target.value)}
                disabled={!activeDocId || (activeDocId !== null && findItemInTree(binderItems, activeDocId)?.type === 'folder')}
                className="text-sm font-bold text-gray-800 bg-transparent border-none focus:ring-0 p-0 hover:bg-gray-100 rounded px-1 transition-colors w-24 lg:w-48 truncate -ml-1 disabled:opacity-50"
              />
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 select-none">
                 {saveStatus === 'saving' ? <Loader2 size={10} className="animate-spin" /> : <Cloud size={10} />}
                 <span className="hidden lg:inline">{saveStatus === 'saved' ? 'Saved' : 'Saving...'}</span>
              </div>
              
              {activeDocId && (
                  <button 
                    onClick={() => handleToggleBookmark()} 
                    className={`ml-1 p-1 rounded-full hover:bg-gray-100 transition-colors ${activeItem?.isBookmarked ? 'text-red-500' : 'text-gray-300'}`}
                    title="Bookmark"
                  >
                      <Bookmark size={14} fill={activeItem?.isBookmarked ? "currentColor" : "none"} />
                  </button>
              )}
            </div>
             <MenuBar onAction={(a) => {
                 if (a === 'file-new') handleAddItem('document');
                 else if (a === 'file-print') window.print();
                 else if (a === 'file-export') handleExport();
                 else if (a === 'format-book') setIsBookDesignerOpen(true);
                 else if (a === 'file-export-fdx') { /* ... */ }
            }} />
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          
             <button 
                onClick={handleSmartSync}
                disabled={isSyncing} 
                className={`hidden md:flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm border transition-all ${isSyncing ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent hover:shadow-md'}`}
                title="Auto-fill Characters, Settings, and Timeline from text"
             >
                {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isSyncing ? 'Syncing...' : 'Smart Sync'}
             </button>

          <button onClick={() => { setMagicMode('chat'); setIsMagicOpen(!isMagicOpen); setIsHistoryOpen(false); setIsStickyOpen(false); }} className={`hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm border ${isMagicOpen ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}>
            <Sparkles size={14} /> AI Magic
          </button>
          
          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

          {/* New Consolidated Settings Menu */}
          <div className="relative" ref={settingsMenuRef}>
              <button 
                onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                className={`p-2 rounded-full transition-colors ${isSettingsMenuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
                title="Settings & Tools"
              >
                 <Settings size={20} />
              </button>

              {isSettingsMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                      <div className="p-3 border-b border-gray-100">
                          <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Layout</h4>
                          <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button onClick={() => handleSplitLayout('single')} className={`flex-1 p-1.5 rounded ${splitMode === 'single' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`} title="Single View"><Square size={14} className="mx-auto"/></button>
                                <button onClick={() => handleSplitLayout('vertical')} className={`flex-1 p-1.5 rounded ${splitMode === 'vertical' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`} title="Split Vertical"><Columns2 size={14} className="mx-auto"/></button>
                                <button onClick={() => handleSplitLayout('horizontal')} className={`flex-1 p-1.5 rounded ${splitMode === 'horizontal' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`} title="Split Horizontal"><Rows2 size={14} className="mx-auto"/></button>
                          </div>
                      </div>

                      <div className="p-1">
                          <button 
                            onClick={() => { setIsThemeGalleryOpen(true); setIsSettingsMenuOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                          >
                              <Palette size={16} className="text-pink-500" /> Themes
                          </button>
                          <button 
                            onClick={() => { setIsStickyOpen(!isStickyOpen); setIsSettingsMenuOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                          >
                              <StickyIcon size={16} className="text-amber-500" /> Sticky Notes
                          </button>
                          <button 
                            onClick={() => { setIsHistoryOpen(!isHistoryOpen); setIsSettingsMenuOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                          >
                              <History size={16} className="text-blue-500" /> Version History
                          </button>
                          <button 
                            onClick={() => { setIsBookDesignerOpen(true); setIsSettingsMenuOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                          >
                              <Book size={16} className="text-indigo-500" /> Book Designer
                          </button>
                          <button 
                            onClick={handleBackupProject}
                            className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                          >
                              <Download size={16} className="text-green-600" /> Backup Project (.json)
                          </button>
                      </div>
                      
                      <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                          <button 
                            className="text-xs font-bold text-gray-500 hover:text-indigo-600 hover:underline w-full flex items-center justify-center gap-1"
                            onClick={() => { 
                                navigator.clipboard.writeText(window.location.href);
                                alert("Data is stored locally on this device. To share the project content, please use the 'Backup Project' option to send the file."); 
                                setIsSettingsMenuOpen(false); 
                            }}
                          >
                              <Share2 size={12} /> Copy App Link
                          </button>
                      </div>
                  </div>
              )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <BinderSidebar 
            isOpen={isBinderOpen}
            items={binderItems}
            activeId={activeDocId}
            onSelect={handleSelectDoc}
            onToggleFolder={handleToggleFolder}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onRenameItem={handleRenameItem}
            onToggleBookmark={handleToggleBookmark}
            onClose={() => setIsBinderOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 relative">
          <Toolbar 
              onFormat={handleFormat} 
              onInsertImage={() => fileInputRef.current?.click()}
              onMagicWrite={() => { setMagicMode('chat'); setIsMagicOpen(!isMagicOpen); setIsHistoryOpen(false); setIsStickyOpen(false); }}
              onOpenTemplates={() => setIsTemplateModalOpen(true)}
              isMagicOpen={isMagicOpen}
              onExport={handleExport}
              showInlineNotes={showInlineNotes}
              onToggleNotes={() => setShowInlineNotes(!showInlineNotes)}
              onOpenRevision={() => setIsRevisionOpen(true)}
              onOpenBookDesigner={() => setIsBookDesignerOpen(true)}
              onSmartSync={handleSmartSync}
              isSyncing={isSyncing}
              onOpenThemes={() => setIsThemeGalleryOpen(true)}
          />

          <div className={`flex-1 flex min-h-0 ${splitMode === 'horizontal' ? 'flex-col' : 'flex-row'}`}>
             
             {/* Primary View */}
             <div className={`flex-1 min-w-0 min-h-0 relative flex flex-col ${splitMode !== 'single' ? 'border-r border-b border-gray-300' : ''}`}>
                 <DocumentViewer 
                    docId={primaryView.docId}
                    viewMode={primaryView.viewMode}
                    binderItems={projectContents[primaryView.projectId]?.binderItems || []}
                    isActive={focusedPane === 'primary'}
                    onFocus={() => setFocusedPane('primary')}
                    onUpdateContent={handleItemUpdate} // Uses focusedPane to determine target
                    onNavigate={handleNavigateView}
                    onSelectDoc={(id) => { setFocusedPane('primary'); handleSelectDoc(id); }}
                    editorRef={primaryEditorRef}
                    zoomLevel={zoomLevel}
                    onMagicRequest={handleMagicRequest}
                    showInlineNotes={showInlineNotes}
                    plotThreads={projectContents[primaryView.projectId]?.plotThreads || []}
                    onAddPlotThread={handleAddPlotThread}
                    onRemovePlotThread={handleRemovePlotThread}
                    rootNotes={projectContents[primaryView.projectId]?.rootNotes || []}
                    onUpdateRootNotes={handleUpdateRootNotes}
                    theme={currentTheme}
                 />
                 {splitMode !== 'single' && (
                     <div className="absolute top-2 right-2 bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold shadow-sm pointer-events-none z-10 opacity-80">
                         {projects.find(p => p.id === primaryView.projectId)?.title}
                     </div>
                 )}
             </div>

             {/* Secondary View (Split) */}
             {splitMode !== 'single' && (
                 <div className="flex-1 min-w-0 min-h-0 relative flex flex-col bg-gray-50/50">
                    <DocumentViewer 
                        docId={secondaryView.docId}
                        viewMode={secondaryView.viewMode}
                        binderItems={projectContents[secondaryView.projectId]?.binderItems || []}
                        isActive={focusedPane === 'secondary'}
                        onFocus={() => setFocusedPane('secondary')}
                        onUpdateContent={handleItemUpdate} // Uses focusedPane to determine target
                        onNavigate={handleNavigateView}
                        onSelectDoc={(id) => { setFocusedPane('secondary'); handleSelectDoc(id); }}
                        editorRef={secondaryEditorRef}
                        zoomLevel={zoomLevel}
                        onMagicRequest={handleMagicRequest}
                        showInlineNotes={showInlineNotes}
                        plotThreads={projectContents[secondaryView.projectId]?.plotThreads || []}
                        onAddPlotThread={handleAddPlotThread}
                        onRemovePlotThread={handleRemovePlotThread}
                        rootNotes={projectContents[secondaryView.projectId]?.rootNotes || []}
                        onUpdateRootNotes={handleUpdateRootNotes}
                        theme={currentTheme}
                    />
                     <button onClick={() => setSplitMode('single')} className="absolute top-2 right-2 p-1 bg-white/80 rounded shadow hover:bg-red-50 hover:text-red-600 z-20">
                         <X size={14} />
                     </button>
                     <div className="absolute top-2 left-2 bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold shadow-sm pointer-events-none z-10 opacity-80">
                         {projects.find(p => p.id === secondaryView.projectId)?.title}
                     </div>
                 </div>
             )}
          </div>
        </div>

        <VersionHistory
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            versions={activeItem?.versions || []}
            onCreateSnapshot={handleCreateSnapshot}
            onRestoreSnapshot={handleRestoreSnapshot}
            onDeleteSnapshot={handleDeleteSnapshot}
            documentTitle={activeDocTitle}
        />

        <StickyNotesBoard
            isOpen={isStickyOpen}
            onClose={() => setIsStickyOpen(false)}
            notes={activeItem?.stickyNotes || []}
            onAddNote={handleAddStickyNote}
            onUpdateNote={handleUpdateStickyNote}
            onDeleteNote={handleDeleteStickyNote}
            onChangeColor={handleChangeStickyColor}
        />

        <AIAssistant 
          isOpen={isMagicOpen} 
          onClose={() => setIsMagicOpen(false)}
          documentContext={getActiveTextContent()} 
          onInsertContent={handleInsertContent}
          selectionForRefine={refineSelection}
          initialMode={magicMode}
        />
      </div>
    </div>
  );
};

export default App;