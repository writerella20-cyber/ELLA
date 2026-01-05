
import React, { useState, useRef } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Indent, Outdent,
  Type, Palette, Baseline, Highlighter,
  Image as ImageIcon, Link as LinkIcon, Table, Minus,
  Undo, Redo, RemoveFormatting,
  ZoomIn, ZoomOut, Maximize, Search,
  Printer, Download, FileText,
  Heading1, Heading2, Quote, Code,
  Copy, Scissors, Clipboard,
  ArrowUp, ArrowDown, ChevronDown, MoveVertical, 
  Sparkles, LayoutTemplate, Eye, EyeOff, Hash, Calendar, Eraser, SpellCheck, Book, MessageSquarePlus, RefreshCw, Layout
} from 'lucide-react';
import { FormatType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ToolbarProps {
  onFormat: (command: FormatType | string, value?: string) => void;
  onInsertImage: () => void;
  onMagicWrite: () => void;
  onOpenTemplates: () => void;
  onExport: () => void;
  isMagicOpen: boolean;
  showInlineNotes: boolean;
  onToggleNotes: () => void;
  onOpenRevision: () => void;
  onOpenBookDesigner: () => void;
  onSmartSync?: () => void;
  isSyncing?: boolean;
  onOpenThemes?: () => void;
}

type ToolbarTab = 'File' | 'Home' | 'Insert' | 'Layout' | 'View' | 'Review';

// --- Tooltip Helper ---
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div className="absolute top-full mt-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg delay-300">
        {text}
      </div>
    </div>
  );
};

// --- Button Helper ---
const ToolbarButton: React.FC<{
  icon: any;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
}> = ({ icon: Icon, label, onClick, active, disabled, className, showLabel }) => (
  <Tooltip text={label}>
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center rounded-sm transition-all duration-200
        ${showLabel ? 'px-3 py-1 gap-1 h-12' : 'p-1.5 h-8 w-8'}
        ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
        ${className || ''}
      `}
    >
      <Icon size={showLabel ? 20 : 16} />
      {showLabel && <span className="text-[10px] font-medium leading-none">{label}</span>}
    </button>
  </Tooltip>
);

const Divider = () => <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>;

const SectionLabel = ({ label }: { label: string }) => (
    <div className="absolute bottom-0 left-0 right-0 text-center text-[9px] text-gray-400 uppercase font-bold tracking-wider pointer-events-none pb-0.5">
        {label}
    </div>
);

export const Toolbar: React.FC<ToolbarProps> = ({ 
    onFormat, onInsertImage, onMagicWrite, isMagicOpen, onExport, onOpenTemplates,
    showInlineNotes, onToggleNotes, onOpenRevision, onOpenBookDesigner, onSmartSync, isSyncing, onOpenThemes
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ToolbarTab>('Home');

  const handleLink = () => {
      const url = prompt("Enter URL:", "https://");
      if (url) onFormat('createLink', url);
  };

  const handleTable = () => {
      const rows = prompt("Number of Rows:", "3");
      const cols = prompt("Number of Columns:", "3");
      if (rows && cols) onFormat('insertTable', `${rows}x${cols}`);
  };

  const copyToClipboard = () => {
      document.execCommand('copy');
  };

  const tabs: ToolbarTab[] = ['File', 'Home', 'Insert', 'Layout', 'Review', 'View'];

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-300 shadow-sm flex flex-col select-none">
      
      {/* 1. Top Ribbon Tabs (Office Style) */}
      <div className="flex items-center px-1 bg-[#f3f4f6] border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-xs font-medium transition-colors rounded-t-md mt-1
                        ${activeTab === tab 
                            ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-sm relative z-10' 
                            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}
                    `}
                >
                    {t(tab.toLowerCase() as any)}
                </button>
            ))}
          </div>
          <div className="flex-1 border-b border-gray-200 transform translate-y-px"></div>
          
          {/* Always Visible Quick Actions */}
          <div className="flex items-center gap-1 pr-2 py-1 bg-[#f3f4f6]">
             {onSmartSync && (
                 <button 
                    onClick={onSmartSync}
                    disabled={isSyncing} 
                    className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded shadow-sm border mr-2 transition-all ${isSyncing ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent hover:shadow-md'}`}
                    title="Auto-fill Characters, Settings, and Timeline from text"
                 >
                    {isSyncing ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {isSyncing ? t('saving') : t('smartSync')}
                 </button>
             )}
             <button onClick={onMagicWrite} className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded shadow-sm border ${isMagicOpen ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}>
                <Sparkles size={12} /> {t('aiMagic')}
             </button>
          </div>
      </div>

      {/* 2. Main Ribbon Tools Area */}
      <div className="bg-white p-1 min-h-[50px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
        
        {/* --- HOME TAB --- */}
        {activeTab === 'Home' && (
            <div className="flex items-start gap-1 overflow-x-auto no-scrollbar py-1">
                
                {/* Clipboard */}
                <div className="flex flex-col gap-0.5 px-2 relative h-16 justify-start border-r border-gray-100">
                    <div className="flex gap-1">
                        <ToolbarButton icon={Clipboard} label="Paste" onClick={() => {navigator.clipboard.readText().then(t => document.execCommand('insertText', false, t))}} showLabel className="h-14 w-12"/>
                        <div className="flex flex-col gap-0.5">
                            <ToolbarButton icon={Scissors} label="Cut" onClick={() => document.execCommand('cut')} />
                            <ToolbarButton icon={Copy} label="Copy" onClick={copyToClipboard} />
                        </div>
                    </div>
                    <SectionLabel label="Clipboard" />
                </div>

                {/* Font */}
                <div className="flex flex-col gap-1 px-2 relative h-16 border-r border-gray-100">
                    <div className="flex gap-1 mb-0.5">
                        <select 
                            onChange={(e) => onFormat('fontName', e.target.value)}
                            className="h-6 text-xs border border-gray-300 rounded w-28 px-1 focus:ring-1 focus:ring-indigo-500"
                            title="Font Family"
                        >
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="'Playfair Display', serif">Playfair Display</option>
                            <option value="'Courier Prime', monospace">Courier Prime</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="'Times New Roman', serif">Times New Roman</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                        </select>
                        <select 
                            onChange={(e) => onFormat('fontSize', e.target.value)}
                            className="h-6 text-xs border border-gray-300 rounded w-14 px-1 focus:ring-1 focus:ring-indigo-500"
                            title="Font Size"
                            defaultValue="3"
                        >
                            <option value="1">8</option>
                            <option value="2">10</option>
                            <option value="3">12</option>
                            <option value="4">14</option>
                            <option value="5">18</option>
                            <option value="6">24</option>
                            <option value="7">36</option>
                        </select>
                        <div className="flex">
                            <button onClick={() => onFormat('increaseFontSize')} className="p-1 hover:bg-gray-100 rounded" title="Grow Font"><span className="text-xs font-bold">A^</span></button>
                            <button onClick={() => onFormat('decreaseFontSize')} className="p-1 hover:bg-gray-100 rounded" title="Shrink Font"><span className="text-xs">Aˇ</span></button>
                        </div>
                        <ToolbarButton icon={Eraser} label="Clear Format" onClick={() => onFormat('removeFormat')} />
                    </div>
                    <div className="flex gap-0.5">
                        <ToolbarButton icon={Bold} label="Bold" onClick={() => onFormat('bold')} />
                        <ToolbarButton icon={Italic} label="Italic" onClick={() => onFormat('italic')} />
                        <ToolbarButton icon={Underline} label="Underline" onClick={() => onFormat('underline')} />
                        <ToolbarButton icon={Strikethrough} label="Strikethrough" onClick={() => onFormat('strikeThrough')} />
                        <ToolbarButton icon={Subscript} label="Subscript" onClick={() => onFormat('subscript')} />
                        <ToolbarButton icon={Superscript} label="Superscript" onClick={() => onFormat('superscript')} />
                        
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        
                        {/* Text Color */}
                        <div className="relative group flex items-center justify-center p-1 hover:bg-gray-100 rounded cursor-pointer" title="Text Color">
                            <Baseline size={16} className="text-gray-800" />
                            <div className="absolute bottom-1 w-4 h-1 bg-red-500"></div>
                            <input type="color" onChange={(e) => onFormat('foreColor', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        </div>
                        {/* Highlight Color */}
                        <div className="relative group flex items-center justify-center p-1 hover:bg-gray-100 rounded cursor-pointer" title="Highlight Color">
                            <Highlighter size={16} className="text-gray-800" />
                            <div className="absolute bottom-1 w-4 h-1 bg-yellow-400"></div>
                            <input type="color" defaultValue="#fef08a" onChange={(e) => onFormat('hiliteColor', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        </div>
                    </div>
                    <SectionLabel label="Font" />
                </div>

                {/* Paragraph */}
                <div className="flex flex-col gap-1 px-2 relative h-16 border-r border-gray-100">
                    <div className="flex gap-0.5 mb-0.5">
                        <ToolbarButton icon={List} label="Bullets" onClick={() => onFormat('insertUnorderedList')} />
                        <ToolbarButton icon={ListOrdered} label="Numbering" onClick={() => onFormat('insertOrderedList')} />
                        <ToolbarButton icon={CheckSquare} label="Checklist" onClick={() => onFormat('insertChecklist')} />
                        <Divider />
                        <ToolbarButton icon={Indent} label="Indent" onClick={() => onFormat('indent')} />
                        <ToolbarButton icon={Outdent} label="Outdent" onClick={() => onFormat('outdent')} />
                    </div>
                    <div className="flex gap-0.5">
                        <ToolbarButton icon={AlignLeft} label="Left" onClick={() => onFormat('justifyLeft')} />
                        <ToolbarButton icon={AlignCenter} label="Center" onClick={() => onFormat('justifyCenter')} />
                        <ToolbarButton icon={AlignRight} label="Right" onClick={() => onFormat('justifyRight')} />
                        <ToolbarButton icon={AlignJustify} label="Justify" onClick={() => onFormat('justifyFull')} />
                        <Divider />
                        {/* Line Spacing */}
                        <div className="relative group">
                            <button className="p-1.5 hover:bg-gray-100 rounded flex items-center" title="Line Spacing">
                                <MoveVertical size={16} />
                            </button>
                            <div className="absolute top-full left-0 bg-white shadow-xl border border-gray-200 rounded py-1 w-24 hidden group-hover:block z-50">
                                {['1.0', '1.15', '1.5', '2.0'].map(val => (
                                    <button key={val} onClick={() => onFormat('lineHeight', val)} className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-xs">
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <SectionLabel label="Paragraph" />
                </div>

                {/* Styles */}
                <div className="flex flex-col gap-1 px-2 relative h-16 border-r border-gray-100 w-48">
                    <div className="grid grid-cols-2 gap-1 h-full pb-3">
                        <button onClick={() => onFormat('formatBlock', 'P')} className="text-left px-2 py-1 hover:bg-gray-100 rounded text-xs border border-transparent hover:border-gray-300">Normal</button>
                        <button onClick={() => onFormat('formatBlock', 'H1')} className="text-left px-2 py-1 hover:bg-gray-100 rounded text-xs font-bold border border-transparent hover:border-gray-300">Heading 1</button>
                        <button onClick={() => onFormat('formatBlock', 'H2')} className="text-left px-2 py-1 hover:bg-gray-100 rounded text-xs font-semibold border border-transparent hover:border-gray-300">Heading 2</button>
                        <button onClick={() => onFormat('formatBlock', 'BLOCKQUOTE')} className="text-left px-2 py-1 hover:bg-gray-100 rounded text-xs italic border border-transparent hover:border-gray-300">Quote</button>
                    </div>
                    <SectionLabel label="Styles" />
                </div>

                {/* Editing */}
                <div className="flex flex-col gap-1 px-2 relative h-16 justify-center">
                    <ToolbarButton icon={Search} label="Find" onClick={() => onFormat('toggleFindReplace')} />
                    <ToolbarButton icon={ArrowUp} label="Select All" onClick={() => onFormat('selectAll')} />
                    <SectionLabel label="Editing" />
                </div>
            </div>
        )}

        {/* --- INSERT TAB --- */}
        {activeTab === 'Insert' && (
            <div className="flex items-start gap-2 overflow-x-auto no-scrollbar py-1">
                <div className="flex gap-1 border-r border-gray-100 pr-2">
                    <ToolbarButton icon={LayoutTemplate} label="Templates" onClick={onOpenTemplates} showLabel />
                </div>
                <div className="flex gap-1 border-r border-gray-100 pr-2">
                    <ToolbarButton icon={ImageIcon} label="Image" onClick={onInsertImage} showLabel />
                    <ToolbarButton icon={Table} label="Table" onClick={handleTable} showLabel />
                    <ToolbarButton icon={LinkIcon} label="Link" onClick={handleLink} showLabel />
                    {/* Add explicit inline note button */}
                    <ToolbarButton icon={MessageSquarePlus} label="Note" onClick={() => { onFormat('toggleInlineNote'); if(!showInlineNotes) onToggleNotes(); }} showLabel />
                </div>
                <div className="flex gap-1">
                    <ToolbarButton icon={Minus} label="Line" onClick={() => onFormat('insertHorizontalRule')} showLabel />
                    <ToolbarButton icon={Calendar} label="Date" onClick={() => onFormat('insertHTML', new Date().toLocaleDateString())} showLabel />
                    <ToolbarButton icon={Hash} label="Page #" onClick={() => onFormat('insertHTML', '[PAGE]')} showLabel />
                    <ToolbarButton icon={Code} label="Code" onClick={() => onFormat('formatBlock', 'PRE')} showLabel />
                </div>
            </div>
        )}

        {/* --- VIEW TAB --- */}
        {activeTab === 'View' && (
            <div className="flex items-start gap-2 overflow-x-auto no-scrollbar py-1">
                <div className="flex gap-1 border-r border-gray-100 pr-2">
                    <ToolbarButton icon={ZoomIn} label="Zoom In" onClick={() => onFormat('zoomIn')} showLabel />
                    <ToolbarButton icon={ZoomOut} label="Zoom Out" onClick={() => onFormat('zoomOut')} showLabel />
                    <ToolbarButton icon={Maximize} label="100%" onClick={() => onFormat('zoomReset')} showLabel />
                </div>
                <div className="flex gap-1 border-r border-gray-100 pr-2">
                    <ToolbarButton icon={Palette} label="Theme" onClick={onOpenThemes || (() => {})} showLabel />
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={onToggleNotes}
                        className={`flex flex-col items-center justify-center px-3 py-1 gap-1 h-12 rounded-sm transition-all duration-200
                            ${showInlineNotes ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-gray-100'}
                        `}
                    >
                        {showInlineNotes ? <Eye size={20} /> : <EyeOff size={20} />}
                        <span className="text-[10px] font-medium leading-none">Notes</span>
                    </button>
                </div>
            </div>
        )}

        {/* --- REVIEW TAB --- */}
        {activeTab === 'Review' && (
            <div className="flex items-start gap-2 overflow-x-auto no-scrollbar py-1">
                <ToolbarButton icon={SpellCheck} label="Editor" onClick={onOpenRevision} showLabel />
                <ToolbarButton icon={FileText} label="Count" onClick={() => onFormat('wordCount')} showLabel />
            </div>
        )}

        {/* --- FILE TAB --- */}
        {activeTab === 'File' && (
            <div className="flex items-start gap-2 overflow-x-auto no-scrollbar py-1">
                <ToolbarButton icon={Download} label={t('export')} onClick={onExport} showLabel />
                <ToolbarButton icon={Printer} label={t('print')} onClick={() => window.print()} showLabel />
            </div>
        )}

        {/* --- LAYOUT TAB --- */}
        {activeTab === 'Layout' && (
            <div className="flex items-start gap-2 overflow-x-auto no-scrollbar py-1">
                <ToolbarButton icon={Book} label={t('bookDesigner')} onClick={onOpenBookDesigner} showLabel />
                <div className="px-3 py-2 text-sm text-gray-500 italic">
                    Margins, Orientation, and Size coming soon.
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
