
import React, { useState } from 'react';
import { History, Plus, RotateCcw, Trash2, X, FileClock } from 'lucide-react';
import { DocumentVersion } from '../types';

interface VersionHistoryProps {
    isOpen: boolean;
    onClose: () => void;
    versions: DocumentVersion[];
    onCreateSnapshot: (name: string) => void;
    onRestoreSnapshot: (version: DocumentVersion) => void;
    onDeleteSnapshot: (versionId: string) => void;
    documentTitle: string;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
    isOpen, onClose, versions, onCreateSnapshot, onRestoreSnapshot, onDeleteSnapshot, documentTitle
}) => {
    const [newSnapshotName, setNewSnapshotName] = useState('');

    if (!isOpen) return null;

    const handleCreate = () => {
        onCreateSnapshot(newSnapshotName || `Snapshot ${new Date().toLocaleTimeString()}`);
        setNewSnapshotName('');
    }

    return (
        <div className="fixed right-0 top-[57px] bottom-0 w-80 bg-white shadow-2xl border-l border-gray-200 flex flex-col z-30 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="overflow-hidden">
                    <div className="flex items-center gap-2 text-gray-800 font-semibold">
                        <History size={18} className="text-indigo-600" />
                        <span>History</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">For: {documentTitle}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>

            {/* Create Section */}
            <div className="p-4 border-b border-gray-100 bg-white">
                <p className="text-xs text-gray-500 mb-2">Save the current state to return to it later.</p>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newSnapshotName}
                        onChange={(e) => setNewSnapshotName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        placeholder="Name (Optional)"
                        className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button 
                        onClick={handleCreate}
                        className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                        title="Save Snapshot"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {versions.length === 0 && (
                    <div className="text-center text-gray-400 py-8 flex flex-col items-center">
                        <FileClock size={40} className="mb-3 opacity-20" />
                        <p className="text-sm font-medium text-gray-500">No snapshots yet.</p>
                        <p className="text-xs mt-1">Create one to track your progress.</p>
                    </div>
                )}
                {[...versions].reverse().map(version => (
                    <div key={version.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm group hover:border-indigo-300 transition-all">
                        <div className="flex justify-between items-start mb-1.5">
                            <h4 className="font-semibold text-sm text-gray-800">{version.name}</h4>
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{new Date(version.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2 mb-3 font-serif bg-gray-50 p-2 rounded border border-gray-100 italic">
                             "{version.content.replace(/<[^>]*>?/gm, '').substring(0, 100) || 'Empty document'}"
                        </div>
                        <div className="flex justify-end gap-2 border-t border-gray-50 pt-2">
                             <button 
                                onClick={() => onDeleteSnapshot(version.id)}
                                className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition-colors" 
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                            <button 
                                onClick={() => {
                                    if(confirm("Restore this version? Current unsaved changes will be overwritten.")) {
                                        onRestoreSnapshot(version);
                                    }
                                }}
                                className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors font-medium"
                            >
                                <RotateCcw size={12} /> Restore
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
