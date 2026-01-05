
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { SlashMenu } from './SlashMenu';
import { BubbleMenu } from './BubbleMenu';
import { X, Search, ArrowDown, ArrowUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
  onMagicRequest: (type: 'generate' | 'edit', initialText?: string) => void;
  scale?: number;
  variant?: 'default' | 'scrivenings';
  onFocus?: () => void;
  placeholder?: string;
  showInlineNotes?: boolean;
}

export interface EditorRef {
  executeCommand: (command: string, value?: string) => void;
  insertContent: (content: string, type: 'text' | 'image') => void;
  getSelectionText: () => string;
}

export const Editor = forwardRef<EditorRef, EditorProps>(({ 
    content, 
    onChange, 
    onMagicRequest, 
    scale = 1, 
    variant = 'default',
    onFocus,
    placeholder,
    showInlineNotes = true
}, ref) => {
  const { t } = useLanguage();
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const [slashMenuPos, setSlashMenuPos] = useState<{ x: number, y: number } | null>(null);
  const [bubbleMenuPos, setBubbleMenuPos] = useState<{ x: number, y: number } | null>(null);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findTerm, setFindTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');

  // Default placeholder from props or translation
  const effectivePlaceholder = placeholder || t('editorPlaceholder');

  // Sync content prop to innerHTML
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
        if (editorRef.current.innerHTML !== content) {
            editorRef.current.innerHTML = content;
        }
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => { isUpdatingRef.current = false; }, 0);
    }
  };

  const updateBubbleMenu = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (editorRef.current?.contains(selection.anchorNode)) {
             setBubbleMenuPos({ x: rect.left + rect.width / 2, y: rect.top });
             return;
          }
      }
      setBubbleMenuPos(null);
  }

  const handleKeyUp = (e: React.KeyboardEvent) => {
    updateBubbleMenu();

    if (e.key === '/') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSlashMenuPos({ x: rect.left, y: rect.bottom });
        }
    } else {
        setSlashMenuPos(null);
    }
  };

  const handleMouseUp = () => {
      updateBubbleMenu();
  };

  const applyScriptStyle = (className: string, blockTag: string = 'P') => {
      document.execCommand('formatBlock', false, blockTag);
      const selection = window.getSelection();
      if (selection?.anchorNode) {
          const node = selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode as HTMLElement;
          if (node && editorRef.current?.contains(node)) {
              node.className = className;
          }
      }
  };

  const handleSlashAction = (action: string) => {
      setSlashMenuPos(null);
      // Delete the slash
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
           document.execCommand('delete');
      }
      
      switch(action) {
          case 'h1': document.execCommand('formatBlock', false, 'H1'); break;
          case 'h2': document.execCommand('formatBlock', false, 'H2'); break;
          case 'text': document.execCommand('formatBlock', false, 'P'); break;
          case 'ul': document.execCommand('insertUnorderedList'); break;
          case 'ol': document.execCommand('insertOrderedList'); break;
          case 'quote': document.execCommand('formatBlock', false, 'BLOCKQUOTE'); break;
          case 'script-scene': applyScriptStyle('script-scene', 'H3'); break;
          case 'script-action': applyScriptStyle('script-action', 'P'); break;
          case 'script-character': applyScriptStyle('script-character', 'P'); break;
          case 'script-dialogue': applyScriptStyle('script-dialogue', 'P'); break;
          case 'script-parenthetical': applyScriptStyle('script-parenthetical', 'P'); break;
          case 'script-transition': applyScriptStyle('script-transition', 'P'); break;
          case 'image': onMagicRequest('generate', 'image'); break;
          case 'magic': onMagicRequest('generate', 'text'); break;
      }
      editorRef.current?.focus();
      handleInput();
  };

  // Find & Replace Logic (Simple DOM Traversal)
  const performFindReplace = (replaceAll: boolean = false) => {
      if (!editorRef.current || !findTerm) return;
      const content = editorRef.current.innerHTML;
      const regex = new RegExp(findTerm, 'g');
      
      if (replaceAll) {
          editorRef.current.innerHTML = content.replace(regex, replaceTerm);
      } else {
          // Find Next: Highlighting implementation is complex in contentEditable.
          // For this version, we use browser native find if possible, or basic replace first
          // Basic "Replace First" logic:
          editorRef.current.innerHTML = content.replace(findTerm, replaceTerm);
      }
      handleInput();
  };

  useImperativeHandle(ref, () => ({
    executeCommand: (command: string, value?: string) => {
      if (command === 'toggleInlineNote') {
          const selection = window.getSelection();
          const text = selection?.toString();
          const html = `<span class="inline-note">${text || 'New Note...'}</span>&nbsp;`;
          document.execCommand('insertHTML', false, html);
      } else if (command === 'insertTable') {
          const [rows, cols] = (value || "3x3").split('x').map(Number);
          let tableHtml = '<table class="w-full border-collapse border border-gray-300 my-4 shadow-sm"><tbody>';
          for(let r=0; r<rows; r++) {
              tableHtml += '<tr>';
              for(let c=0; c<cols; c++) {
                  tableHtml += '<td class="border border-gray-300 p-2 min-w-[50px]">&nbsp;</td>';
              }
              tableHtml += '</tr>';
          }
          tableHtml += '</tbody></table><p><br/></p>'; // Break after table
          document.execCommand('insertHTML', false, tableHtml);
      } else if (command === 'insertChecklist') {
          document.execCommand('insertHTML', false, '<ul class="checklist"><li><input type="checkbox"> List item</li></ul>');
      } else if (command === 'lineHeight') {
          // ExecCommand doesn't support line-height. We must wrap block or apply to selection.
          // Simple hack: Apply style to current block
          const selection = window.getSelection();
          if (selection && selection.anchorNode) {
              const node = selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode as HTMLElement;
              // Walk up to P, H1-6, DIV
              let block = node;
              while(block && !['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'LI'].includes(block.tagName) && block !== editorRef.current) {
                  block = block.parentElement as HTMLElement;
              }
              if (block && block !== editorRef.current) {
                  block.style.lineHeight = value || '1.5';
              }
          }
      } else if (command === 'toggleFindReplace') {
          setShowFindReplace(!showFindReplace);
      } else if (command === 'zoomIn' || command === 'zoomOut' || command === 'zoomReset') {
          // Handled by parent usually, but consuming here to prevent error
      } else if (command === 'selectAll') {
          document.execCommand('selectAll', false, undefined);
      } else if (command === 'wordCount') {
          const text = editorRef.current?.innerText || "";
          const count = text.trim().split(/\s+/).filter(Boolean).length;
          alert(`Word Count: ${count}`);
      } else {
          const useCSS = ['fontName', 'fontSize', 'hiliteColor', 'foreColor'].includes(command);
          try { document.execCommand('styleWithCSS', false, useCSS ? 'true' : 'false'); } catch (e) {}
          document.execCommand(command, false, value);
      }
      editorRef.current?.focus();
      handleInput();
    },
    insertContent: (contentToInsert: string, type: 'text' | 'image') => {
      editorRef.current?.focus();
      if (type === 'image') {
        const imgHtml = `<div class="my-6 text-center group relative inline-block w-full"><img src="${contentToInsert}" class="max-w-full md:max-w-2xl h-auto rounded-xl shadow-lg mx-auto transition-transform" /><p><br/></p>`;
        document.execCommand('insertHTML', false, imgHtml);
      } else {
        document.execCommand('insertHTML', false, contentToInsert);
      }
      handleInput();
    },
    getSelectionText: () => window.getSelection()?.toString() || ""
  }));

  const containerClasses = variant === 'default'
    ? "w-full max-w-[850px] mx-auto min-h-[1100px] bg-white shadow-lg my-8 p-8 sm:p-16 rounded-sm border border-gray-200 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none relative group transition-transform duration-200 origin-top"
    : "w-full max-w-[850px] mx-auto bg-white/50 my-2 px-8 sm:px-16 py-4 relative group transition-transform duration-200 origin-top";

  return (
    <div 
        className={containerClasses}
        style={{ transform: `scale(${scale})` }}
        onClick={onFocus}
    >
      <style>{`
        .inline-note {
            background-color: #f3f4f6;
            color: #4b5563;
            border-left: 3px solid #f59e0b;
            padding: 2px 6px 2px 8px;
            border-radius: 0 4px 4px 0;
            font-size: 0.85em;
            margin: 0 4px;
            vertical-align: middle;
            font-family: 'Inter', sans-serif;
            display: ${showInlineNotes ? 'inline-block' : 'none'};
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            transition: all 0.2s;
        }
        .checklist { list-style: none; padding-left: 0; }
        .checklist li { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        table td { position: relative; }
        table td:hover { background-color: #f9fafb; }
      `}</style>
      
      {/* Find & Replace Floating Panel */}
      {showFindReplace && (
          <div className="absolute top-4 right-4 z-50 bg-white shadow-xl border border-gray-200 rounded-lg p-3 w-72 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold uppercase text-gray-500">Find & Replace</h3>
                  <button onClick={() => setShowFindReplace(false)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
              </div>
              <div className="space-y-2">
                  <div className="relative">
                      <Search size={14} className="absolute left-2 top-2 text-gray-400"/>
                      <input 
                        className="w-full text-sm border border-gray-300 rounded pl-8 pr-2 py-1 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder="Find..." 
                        value={findTerm}
                        onChange={e => setFindTerm(e.target.value)}
                      />
                  </div>
                  <input 
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="Replace with..."
                    value={replaceTerm}
                    onChange={e => setReplaceTerm(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                      <button onClick={() => performFindReplace(false)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded font-medium">Replace One</button>
                      <button onClick={() => performFindReplace(true)} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded font-medium">All</button>
                  </div>
              </div>
          </div>
      )}

      <div
        ref={editorRef}
        className="editor-content outline-none min-h-[800px] text-lg leading-relaxed font-serif text-gray-800"
        contentEditable
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        onFocus={onFocus}
        spellCheck={true}
        data-placeholder={effectivePlaceholder}
      />
      
      <SlashMenu position={slashMenuPos} onClose={() => setSlashMenuPos(null)} onSelect={handleSlashAction} />
      <BubbleMenu 
        position={bubbleMenuPos} 
        onFormat={(fmt) => {
            if (fmt === 'hiliteColor') {
                document.execCommand('styleWithCSS', false, 'true');
                document.execCommand(fmt, false, '#fef08a');
            } else {
                document.execCommand('styleWithCSS', false, 'false');
                document.execCommand(fmt);
            }
        }}
        onMagic={() => {
             const text = window.getSelection()?.toString();
             if (text) onMagicRequest('edit', text);
        }}
      />
    </div>
  );
});

Editor.displayName = 'Editor';
