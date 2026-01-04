
import React, { useState, useEffect, useRef } from 'react';

interface MenuBarProps {
  onAction: (action: string) => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({ onAction }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menus = {
    File: [
      { label: 'New Document', action: 'file-new', shortcut: 'Alt+N' },
      { label: 'Export HTML', action: 'file-export', shortcut: 'Alt+E' },
      { label: 'Export Final Draft (.fdx)', action: 'file-export-fdx' },
      { label: 'Print', action: 'file-print', shortcut: 'Ctrl+P' },
    ],
    Edit: [
      { label: 'Undo', action: 'edit-undo', shortcut: 'Ctrl+Z' },
      { label: 'Redo', action: 'edit-redo', shortcut: 'Ctrl+Y' },
      { label: 'Select All', action: 'edit-select-all', shortcut: 'Ctrl+A' },
    ],
    View: [
      { label: 'Zoom In', action: 'view-zoom-in' },
      { label: 'Zoom Out', action: 'view-zoom-out' },
      { label: 'Reset Zoom', action: 'view-zoom-reset' },
    ],
    Insert: [
      { label: 'Image (Upload)', action: 'insert-image-upload' },
      { label: 'Image (URL)', action: 'insert-image-url' },
      { label: 'Current Date', action: 'insert-date' },
      { label: 'Horizontal Line', action: 'insert-hr' },
    ],
    Help: [
      { label: 'Shortcuts', action: 'help-shortcuts' },
      { label: 'About', action: 'help-about' },
    ]
  };

  return (
    <div className="flex items-center gap-1 text-sm select-none" ref={menuRef}>
      {Object.entries(menus).map(([name, items]) => (
        <div key={name} className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === name ? null : name)}
            onMouseEnter={() => activeMenu && setActiveMenu(name)}
            className={`px-3 py-1 rounded-md transition-colors cursor-default ${
              activeMenu === name ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {name}
          </button>
          
          {activeMenu === name && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-75">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    onAction(item.action);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm flex items-center justify-between group transition-colors"
                >
                  <span className="text-gray-700 group-hover:text-blue-700">{item.label}</span>
                  {item.shortcut && <span className="text-xs text-gray-400 font-mono">{item.shortcut}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
