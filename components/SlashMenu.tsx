
import React, { useEffect, useState } from 'react';
import { Heading1, Heading2, Image, Sparkles, List, ListOrdered, Type, Quote, Clapperboard, User, MessageCircle, ArrowRight, Parentheses } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SlashMenuProps {
    position: { x: number, y: number } | null;
    onClose: () => void;
    onSelect: (action: string) => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({ position, onClose, onSelect }) => {
    const { t } = useLanguage();
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    const items = [
        // Basic
        { id: 'text', label: t('slash_text'), icon: Type, category: 'Basic' },
        { id: 'h1', label: t('slash_h1'), icon: Heading1, category: 'Basic' },
        { id: 'h2', label: t('slash_h2'), icon: Heading2, category: 'Basic' },
        { id: 'ul', label: t('slash_bullet'), icon: List, category: 'Basic' },
        { id: 'ol', label: t('slash_number'), icon: ListOrdered, category: 'Basic' },
        { id: 'quote', label: t('slash_quote'), icon: Quote, category: 'Basic' },
        
        // Scriptwriting
        { id: 'script-scene', label: t('slash_scene'), icon: Clapperboard, category: 'Script' },
        { id: 'script-action', label: t('slash_action'), icon: Type, category: 'Script' },
        { id: 'script-character', label: t('slash_char'), icon: User, category: 'Script' },
        { id: 'script-dialogue', label: t('slash_dialogue'), icon: MessageCircle, category: 'Script' },
        { id: 'script-parenthetical', label: t('slash_parenthetical'), icon: Parentheses, category: 'Script' },
        { id: 'script-transition', label: t('slash_transition'), icon: ArrowRight, category: 'Script' },

        // AI
        { id: 'image', label: t('slash_image'), icon: Image, category: 'AI' },
        { id: 'magic', label: t('slash_magic'), icon: Sparkles, category: 'AI' },
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % items.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                onSelect(items[selectedIndex].id);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, items, onSelect, onClose]);

    if (!position) return null;

    return (
        <div 
            className="fixed z-50 bg-white shadow-xl rounded-lg border border-gray-200 w-64 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5 max-h-[300px] overflow-y-auto"
            style={{ top: position.y + 24, left: position.x }}
        >
            {['Basic', 'Script', 'AI'].map(category => (
                <div key={category}>
                    <div className="p-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1 bg-gray-50 border-y border-gray-100 first:border-t-0 sticky top-0">
                        {category}
                    </div>
                    <div>
                        {items.filter(i => i.category === category).map((item) => {
                             const globalIndex = items.findIndex(i => i.id === item.id);
                             return (
                                <button
                                    key={item.id}
                                    onClick={() => onSelect(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors
                                        ${globalIndex === selectedIndex ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}
                                    `}
                                >
                                    <item.icon size={16} className={globalIndex === selectedIndex ? 'text-indigo-600' : 'text-gray-400'} />
                                    {item.label}
                                </button>
                             );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
