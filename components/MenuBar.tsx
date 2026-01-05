
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface MenuBarProps {
  onAction: (action: string) => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({ onAction }) => {
  const { t } = useLanguage();
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
    [t('file')]: [
      { label: t('file_new'), action: 'file-new', shortcut: 'Alt+N' },
      { label: t('file_export_html'), action: 'file-export', shortcut: 'Alt+E' },
      { label: t('file_export_fdx'), action: 'file-export-fdx' },
      { label: t('file_print'), action: 'file-print', shortcut: 'Ctrl+P' },
    ],
    Edit: [ // Key kept in English for logic mapping, displayed via key if needed, or mapped
      { label: t('edit_undo'), action: 'edit-undo', shortcut: 'Ctrl+Z' },
      { label: t('edit_redo'), action: 'edit-redo', shortcut: 'Ctrl+Y' },
      { label: t('edit_select_all'), action: 'edit-select-all', shortcut: 'Ctrl+A' },
    ],
    [t('view')]: [
      { label: t('view_zoom_in'), action: 'view-zoom-in' },
      { label: t('view_zoom_out'), action: 'view-zoom-out' },
      { label: t('view_reset'), action: 'view-zoom-reset' },
    ],
    [t('insert')]: [
      { label: t('insert_image'), action: 'insert-image-upload' },
      { label: t('insert_date'), action: 'insert-date' },
    ],
    Help: [
      { label: t('help_shortcuts'), action: 'help-shortcuts' },
    ]
  };

  // Map English keys to localized keys for display loop
  const displayMenus = {
      [t('file')]: menus[t('file')],
      [t('insert')]: menus[t('insert')],
      [t('view')]: menus[t('view')],
      // Hardcoded mapping for standard keys if not using t() in keys above
      // But above keys use t() where applicable.
      // Let's ensure standard 'Edit' and 'Help' are localized if not keys in t()
      // Since translation keys might not cover "Edit" as a category name directly in some contexts
      // I will use direct t calls.
  };
  
  // Reconstruct explicitly to avoid key confusion
  const menuList = [
      { name: t('file'), items: menus[t('file')] },
      { name: t('home'), items: menus['Edit'] }, // Mapping Edit to Home tools context loosely or keep Edit
      { name: t('view'), items: menus[t('view')] },
      { name: t('insert'), items: menus[t('insert')] }
  ];

  return (
    <div className="flex items-center gap-1 text-sm select-none" ref={menuRef}>
      {menuList.map((menu) => (
        <div key={menu.name} className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === menu.name ? null : menu.name)}
            onMouseEnter={() => activeMenu && setActiveMenu(menu.name)}
            className={`px-3 py-1 rounded-md transition-colors cursor-default ${
              activeMenu === menu.name ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {menu.name}
          </button>
          
          {activeMenu === menu.name && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-75">
              {menu.items.map((item) => (
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
