
import { WorkspaceTheme } from "../types";

export const WORKSPACE_THEMES: WorkspaceTheme[] = [
    {
        id: 'default',
        name: 'Nebula Light',
        background: '#F9FBFD',
        isDark: false
    },
    {
        id: 'midnight',
        name: 'Midnight Focus',
        background: '#0f172a',
        isDark: true
    },
    {
        id: 'sepia',
        name: 'Warm Sepia',
        background: '#fdf6e3',
        isDark: false
    },
    {
        id: 'forest',
        name: 'Deep Forest',
        background: '#064e3b',
        isDark: true
    },
    {
        id: 'gradient-ocean',
        name: 'Ocean Calm',
        background: 'linear-gradient(to bottom right, #e0f2fe, #f0f9ff)',
        isDark: false
    },
    {
        id: 'gradient-dusk',
        name: 'Creative Dusk',
        background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)',
        isDark: true
    },
    {
        id: 'texture-graph',
        name: 'Graph Paper',
        background: 'radial-gradient(#cbd5e1 1px, #f8fafc 1px) 0 0 / 20px 20px',
        isDark: false
    },
    {
        id: 'texture-dots-dark',
        name: 'Cyber Grid',
        background: 'radial-gradient(#334155 1px, #020617 1px) 0 0 / 24px 24px',
        isDark: true
    },
    {
        id: 'texture-paper',
        name: 'Old Paper',
        background: 'linear-gradient(0deg, #fefce8 0%, #fef9c3 100%)', // Simplified representation
        isDark: false
    },
    {
        id: 'texture-blueprint',
        name: 'Blueprint',
        background: 'linear-gradient(#1e3a8a 2px, transparent 2px), linear-gradient(90deg, #1e3a8a 2px, transparent 2px), linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px) 0 0 / 100px 100px, 0 0 / 100px 100px, 0 0 / 20px 20px, 0 0 / 20px 20px',
        isDark: true
    },
    {
        id: 'modern-gray',
        name: 'Minimal Gray',
        background: '#f3f4f6',
        isDark: false
    },
    {
        id: 'lavender',
        name: 'Soft Lavender',
        background: '#f5f3ff',
        isDark: false
    }
];
