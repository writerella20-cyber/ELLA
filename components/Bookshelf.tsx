
import React, { useState, useRef } from 'react';
import { Project } from '../types';
import { Book, Plus, Search, Heart, Clock, FileText, Trash2, Cloud, CheckCircle, Wifi, Laptop, Settings, X, Palette, Type, Save, Layout, Upload } from 'lucide-react';
import { Logo } from './Logo';
import { useLanguage } from '../contexts/LanguageContext';

interface BookshelfProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onImportProject?: (data: any) => void;
}

const ProjectEditModal: React.FC<{ 
    project: Project; 
    onClose: () => void; 
    onSave: (updates: Partial<Project>) => void; 
}> = ({ project, onClose, onSave }) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState(project.title);
    const [author, setAuthor] = useState(project.author);
    const [synopsis, setSynopsis] = useState(project.synopsis);
    const [color, setColor] = useState(project.coverStyle.color);
    const [font, setFont] = useState(project.coverStyle.font || 'serif');

    const presets = [
        { label: 'Slate', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
        { label: 'Midnight', value: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' },
        { label: 'Purple', value: 'linear-gradient(135deg, #4c1d95 0%, #db2777 100%)' },
        { label: 'Emerald', value: '#059669' },
        { label: 'Ocean', value: 'linear-gradient(to right, #2563eb, #06b6d4)' },
        { label: 'Sunset', value: 'linear-gradient(to right, #ea580c, #db2777)' },
        { label: 'Crimson', value: '#7f1d1d' },
        { label: 'Noir', value: '#111827' },
    ];

    const fonts = [
        { label: 'Playfair (Serif)', value: 'Playfair Display' },
        { label: 'Inter (Sans)', value: 'Inter' },
        { label: 'Courier (Mono)', value: 'Courier Prime' },
    ];

    const handleSave = () => {
        onSave({ title, author, synopsis, coverStyle: { color, font } });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex overflow-hidden max-h-[90vh]">
                {/* Preview Panel */}
                <div className="w-1/3 bg-gray-100 p-8 flex items-center justify-center border-r border-gray-200 hidden md:flex">
                    <div 
                        className="aspect-[3/4] w-full max-w-[240px] rounded-r-xl rounded-l-sm shadow-2xl relative overflow-hidden flex flex-col"
                        style={{ background: color }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none w-4"></div>
                        <div className="p-6 flex-1 flex flex-col text-white relative z-10">
                            <div className="flex-1">
                                <h3 
                                    className="text-2xl font-bold leading-tight mb-2 drop-shadow-md break-words"
                                    style={{ fontFamily: font }}
                                >
                                    {title || 'Untitled'}
                                </h3>
                                <p className="text-sm opacity-90 font-medium tracking-wider uppercase">{author || 'Author'}</p>
                            </div>
                            <div className="mt-auto">
                                <div className="text-[10px] opacity-60 uppercase tracking-widest">
                                    NowElla
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Settings size={18} className="text-indigo-600" />
                            {t('bookSettings')}
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto space-y-6 flex-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">{t('title')}</label>
                                <input 
                                    type="text" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">{t('author')}</label>
                                <input 
                                    type="text" 
                                    value={author} 
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">{t('synopsis')}</label>
                            <textarea 
                                value={synopsis} 
                                onChange={(e) => setSynopsis(e.target.value)}
                                rows={4}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                placeholder="Short description of the story..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                                <Palette size={14} /> {t('coverStyle')}
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {presets.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setColor(preset.value)}
                                        className={`h-10 rounded-lg shadow-sm border-2 transition-all ${color === preset.value ? 'border-indigo-600 scale-105' : 'border-transparent hover:scale-105'}`}
                                        style={{ background: preset.value }}
                                        title={preset.label}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                                <Type size={14} /> {t('typography')}
                            </label>
                            <div className="flex gap-2">
                                {fonts.map((f) => (
                                    <button
                                        key={f.value}
                                        onClick={() => setFont(f.value)}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-all ${font === f.value ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}
                                        style={{ fontFamily: f.value }}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                            {t('cancel')}
                        </button>
                        <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-2">
                            <Save size={16} /> {t('saveChanges')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Bookshelf: React.FC<BookshelfProps> = ({ 
  projects, 
  onOpenProject, 
  onCreateProject, 
  onDeleteProject,
  onToggleFavorite,
  onUpdateProject,
  onImportProject
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'recent' | 'favorites'>('all');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProjects = projects
    .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => {
      if (filter === 'favorites') return p.isFavorite;
      return true;
    })
    .sort((a, b) => {
        if (filter === 'recent') return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        return 0;
    });

  const handleSync = () => {
      setSyncStatus('syncing');
      setTimeout(() => {
          setSyncStatus('synced');
      }, 1500);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImportProject) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = JSON.parse(e.target?.result as string);
              onImportProject(data);
          } catch (err) {
              alert("Failed to import project. Invalid file format.");
          }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f3f4f6] flex flex-col font-sans">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        style={{ display: 'none' }}
        accept=".json" 
        onChange={handleFileChange} 
      />
      
      {/* Edit Modal */}
      {editingProject && (
          <ProjectEditModal 
            project={editingProject} 
            onClose={() => setEditingProject(null)} 
            onSave={(updates) => onUpdateProject(editingProject.id, updates)}
          />
      )}

      {/* Header - VELVET MAGENTA TEXTURE */}
      <div 
        className="px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between sticky top-0 z-20 shadow-lg gap-4 shrink-0 relative overflow-hidden"
        style={{
            background: 'radial-gradient(circle at 50% 0%, #a21caf 0%, #86198f 40%, #4a044e 100%)',
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.5)'
        }}
      >
        {/* Noise overlay */}
        <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
            }}
        ></div>
        
        {/* Logo Area */}
        <div className="flex items-center justify-between w-full md:w-auto z-10">
            <div className="flex items-center gap-1 select-none pr-6">
                <Logo size="lg" variant="light" />
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
                <button onClick={handleSync} className="p-2 text-fuchsia-200">
                    {syncStatus === 'syncing' ? <Cloud size={20} className="animate-pulse text-white"/> : <Cloud size={20}/>}
                </button>
            </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl w-full md:mx-8 relative z-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-200/60" size={18} />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-fuchsia-200/50 focus:ring-2 focus:ring-fuchsia-400 focus:bg-white/20 transition-all shadow-inner"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end z-10">
            {/* Sync Status (Desktop) */}
            <div className="hidden md:flex items-center gap-2 mr-4 border-r border-fuchsia-800/50 pr-4">
                <div className="text-right">
                    <p className="text-xs font-bold text-fuchsia-100">Writer</p>
                    <p className="text-[10px] text-fuchsia-300 flex items-center justify-end gap-1">
                        {syncStatus === 'syncing' ? t('saving') : t('saved')}
                    </p>
                </div>
                <button 
                    onClick={handleSync}
                    className={`p-2 rounded-full bg-fuchsia-900/50 hover:bg-fuchsia-800 transition-colors relative group border border-fuchsia-700/50`}
                    title="Cloud Status"
                >
                    {syncStatus === 'synced' && <CheckCircle size={18} className="text-green-400" />}
                    {syncStatus === 'syncing' && <Cloud size={18} className="text-white animate-bounce" />}
                </button>
            </div>

            {onImportProject && (
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-fuchsia-100 bg-fuchsia-900/50 border border-fuchsia-700/50 hover:bg-fuchsia-800 hover:text-white transition-all text-sm backdrop-blur-sm"
                >
                    <Upload size={16} />
                    <span className="hidden sm:inline">{t('import')}</span>
                </button>
            )}

            <button 
                onClick={onCreateProject}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-5 py-2.5 rounded-full font-medium shadow-lg shadow-amber-900/20 hover:shadow-xl transition-all flex items-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap border border-amber-400/20"
            >
                <Plus size={18} />
                <span className="font-serif">{t('newBook')}</span>
            </button>
        </div>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
        
        {/* Filters */}
        <div className="flex items-center gap-6 mb-8 text-sm font-medium border-b border-gray-200 pb-1 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setFilter('all')}
            className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${filter === 'all' ? 'border-fuchsia-700 text-fuchsia-800' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            {t('allBooks')}
          </button>
          <button 
            onClick={() => setFilter('favorites')}
            className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${filter === 'favorites' ? 'border-fuchsia-700 text-fuchsia-800' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            {t('favorites')}
          </button>
          <button 
             onClick={() => setFilter('recent')}
             className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap ${filter === 'recent' ? 'border-fuchsia-700 text-fuchsia-800' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            {t('recent')}
          </button>
        </div>

        {/* Device Promo Banner */}
        <div className="mb-8 rounded-xl p-6 text-white flex items-center justify-between shadow-xl relative overflow-hidden group border border-fuchsia-900/20"
             style={{ background: 'linear-gradient(135deg, #701a75 0%, #4a044e 100%)' }}
        >
            <div className="relative z-10">
                <h2 className="font-bold text-lg mb-1 flex items-center gap-2 font-serif tracking-wide"><Laptop size={20} /> Write Everywhere</h2>
                <p className="text-fuchsia-200 text-sm max-w-lg">
                    NowElla is optimized for Chromebooks, Tablets, and Desktop. Your creative studio travels with you.
                </p>
            </div>
            <Cloud className="absolute -right-6 -bottom-6 text-white opacity-10 w-48 h-48 group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 pb-12">
          
          {/* Create New Card (Visual) */}
          <button 
            onClick={onCreateProject}
            className="group relative aspect-[3/4] rounded-r-xl rounded-l-sm bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-fuchsia-50 hover:border-fuchsia-300 hover:text-fuchsia-700 transition-all shadow-sm hover:shadow-md"
          >
            <div className="w-16 h-16 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform border border-gray-100">
                <Plus size={32} />
            </div>
            <span className="font-semibold font-serif">{t('startNewBook')}</span>
          </button>

          {filteredProjects.map((project) => (
            <div key={project.id} className="group relative perspective-1000">
                {/* Book Spine Effect */}
                <div className="absolute left-0 top-1 bottom-1 w-3 bg-gray-900/10 rounded-l-sm z-0 transform -translate-x-1"></div>
                
                {/* The Book Cover */}
                <div 
                    onClick={() => onOpenProject(project)}
                    className="aspect-[3/4] bg-white rounded-r-xl rounded-l-sm shadow-md group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col"
                    style={{ background: project.coverStyle.color }}
                >
                    {/* Gradient Overlay for Depth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none w-6"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>

                    {/* Book Content */}
                    <div className="p-6 flex-1 flex flex-col text-white relative z-10">
                        <div className="flex-1">
                            <h3 
                                className="text-2xl font-bold leading-tight mb-2 font-serif drop-shadow-md"
                                style={{ fontFamily: project.coverStyle.font || 'serif' }}
                            >
                                {project.title}
                            </h3>
                            <p className="text-sm opacity-90 font-medium tracking-wider uppercase">{project.author}</p>
                        </div>
                        
                        <div className="mt-auto">
                           {/* Abstract / Synopsis Preview on Cover */}
                           <div className="text-xs opacity-75 line-clamp-4 font-serif italic mb-4 border-l-2 border-white/30 pl-2">
                               {project.synopsis || "No synopsis available..."}
                           </div>
                           <div className="flex items-center gap-2 text-[10px] opacity-60 uppercase tracking-widest">
                                <FileText size={10} />
                                <span>{project.wordCount.toLocaleString()} {t('words')}</span>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Actions (Outside cover for easier access) */}
                <div className="flex items-center justify-between mt-3 px-1">
                     <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(project.lastModified).toLocaleDateString()}
                     </div>
                     
                     <div className="flex items-center gap-1">
                         <button 
                            onClick={(e) => { e.stopPropagation(); setEditingProject(project); }}
                            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Edit Details"
                         >
                            <Settings size={14} />
                         </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(project.id); }}
                            className={`p-1.5 rounded-full hover:bg-gray-200 transition-colors ${project.isFavorite ? 'text-pink-500' : 'text-gray-400'}`}
                         >
                            <Heart size={14} fill={project.isFavorite ? "currentColor" : "none"} />
                         </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-600 transition-colors"
                         >
                            <Trash2 size={14} />
                        </button>
                     </div>
                </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};
