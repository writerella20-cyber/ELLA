
import React from 'react';
import { X, LayoutTemplate, Briefcase, User, PenTool, BookOpen, GraduationCap, Clapperboard, Feather, Book } from 'lucide-react';
import { DOMAIN_TEMPLATES, Template } from '../data/templates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(DOMAIN_TEMPLATES.map(t => t.category)))];
  const [activeCategory, setActiveCategory] = React.useState('All');

  const filteredTemplates = activeCategory === 'All' 
    ? DOMAIN_TEMPLATES 
    : DOMAIN_TEMPLATES.filter(t => t.category === activeCategory);

  const getIcon = (category: string) => {
    switch(category) {
        case 'Business': return <Briefcase size={20} className="text-blue-500" />;
        case 'Personal': return <User size={20} className="text-green-500" />;
        case 'Creative': return <PenTool size={20} className="text-purple-500" />;
        case 'Academic': return <BookOpen size={20} className="text-orange-500" />;
        case 'Education': return <GraduationCap size={20} className="text-red-500" />;
        case 'Scriptwriting': return <Clapperboard size={20} className="text-zinc-700" />;
        case 'Fiction': return <Feather size={20} className="text-pink-500" />;
        case 'Non-Fiction': return <Book size={20} className="text-teal-600" />;
        default: return <LayoutTemplate size={20} className="text-gray-500" />;
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <LayoutTemplate className="text-indigo-600" />
                Template Gallery
            </h2>
            <p className="text-gray-500 text-sm mt-1">Start with a professional structure</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Categories */}
        <div className="px-6 py-3 border-b border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                        ${activeCategory === cat 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="group flex flex-col text-left bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 h-full"
              >
                {/* Preview Placeholder (Abstract) */}
                <div className="h-32 bg-gray-100 relative overflow-hidden group-hover:bg-indigo-50 transition-colors">
                     <div className="absolute inset-4 bg-white shadow-sm opacity-50 rounded border border-gray-200 transform group-hover:scale-105 transition-transform origin-top">
                        <div className="h-2 w-1/3 bg-gray-200 mb-2 rounded"></div>
                        <div className="h-2 w-2/3 bg-gray-200 mb-4 rounded"></div>
                        <div className="space-y-1">
                            <div className="h-1.5 w-full bg-gray-100 rounded"></div>
                            <div className="h-1.5 w-full bg-gray-100 rounded"></div>
                            <div className="h-1.5 w-3/4 bg-gray-100 rounded"></div>
                        </div>
                     </div>
                     <div className="absolute bottom-3 right-3 bg-white p-2 rounded-lg shadow-sm">
                        {getIcon(template.category)}
                     </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                        {template.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                    {template.description}
                  </p>
                  <div className="flex items-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {template.category}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white text-center text-sm text-gray-500">
            Select a template to overwrite the current document content.
        </div>
      </div>
    </div>
  );
};
