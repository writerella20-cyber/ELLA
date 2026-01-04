import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Image as ImageIcon, Sparkles, Loader2, Wand2, Edit3, ArrowRight } from 'lucide-react';
import { generateWritingAssistance, generateImage, chatWithDocument, refineText } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  documentContext: string;
  onInsertContent: (content: string, type: 'text' | 'image') => void;
  selectionForRefine?: string;
  initialMode?: 'chat' | 'generate' | 'edit';
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
    isOpen, onClose, documentContext, onInsertContent, selectionForRefine, initialMode 
}) => {
  const [mode, setMode] = useState<'chat' | 'generate' | 'edit'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I can help you write, edit, or generate images for your document.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
    if (initialMode === 'edit' && selectionForRefine) {
        setMessages([{
            id: 'init-edit', 
            role: 'model', 
            text: `I see you selected: "${selectionForRefine.substring(0, 50)}...". How should I rewrite this?`, 
            timestamp: new Date()
        }]);
    }
  }, [initialMode, selectionForRefine, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      if (mode === 'chat') {
        const history = messages.filter(m => m.id !== 'init-edit').map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));
        const responseText = await chatWithDocument(history, userMsg.text, documentContext);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText || "Error", timestamp: new Date() }]);

      } else if (mode === 'edit' && selectionForRefine) {
         const refined = await refineText(selectionForRefine, userMsg.text);
         setMessages(prev => [...prev, { 
             id: (Date.now() + 1).toString(), 
             role: 'model', 
             text: refined, 
             timestamp: new Date() 
         }]);

      } else {
        // Generate Mode
        // Heuristic: Check if user wants an image
        const isImageRequest = userMsg.text.toLowerCase().includes('image') || userMsg.text.toLowerCase().includes('picture') || userMsg.text.toLowerCase().includes('draw');
        
        if (isImageRequest) {
           const base64Image = await generateImage(userMsg.text);
           onInsertContent(base64Image, 'image');
           setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "Image generated and inserted.",
            timestamp: new Date()
          }]);
        } else {
            const textContent = await generateWritingAssistance(userMsg.text, documentContext);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: textContent,
                timestamp: new Date()
              }]);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: "Sorry, something went wrong.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-[57px] bottom-0 w-80 sm:w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col z-30 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
        <div className="flex items-center gap-2 text-indigo-900 font-semibold">
          <Sparkles size={18} className="text-indigo-600" />
          <span>Magic Assistant</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2 bg-gray-50 border-b border-gray-200">
        <button onClick={() => setMode('chat')} className={`flex-1 py-2 rounded text-sm font-medium flex gap-2 justify-center items-center ${mode === 'chat' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:bg-gray-200'}`}><Bot size={14}/> Chat</button>
        <button onClick={() => setMode('generate')} className={`flex-1 py-2 rounded text-sm font-medium flex gap-2 justify-center items-center ${mode === 'generate' ? 'bg-white text-purple-600 shadow' : 'text-gray-500 hover:bg-gray-200'}`}><Wand2 size={14}/> Create</button>
        <button onClick={() => setMode('edit')} className={`flex-1 py-2 rounded text-sm font-medium flex gap-2 justify-center items-center ${mode === 'edit' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:bg-gray-200'}`}><Edit3 size={14}/> Edit</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
              msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.role === 'model' && (mode !== 'chat') && msg.text.length > 20 && !msg.text.includes("inserted") && (
                  <div className="mt-2 flex gap-2">
                      <button onClick={() => onInsertContent(msg.text, 'text')} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 flex items-center gap-1">
                          <ArrowRight size={12}/> Insert
                      </button>
                      <button onClick={() => {navigator.clipboard.writeText(msg.text)}} className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded hover:bg-gray-100">
                          Copy
                      </button>
                  </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="flex items-center gap-2 text-gray-400 text-sm p-2"><Loader2 className="animate-spin" size={14}/> AI is working...</div>}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={mode === 'generate' ? "Describe image or text..." : mode === 'edit' ? "How should I change this?" : "Ask me anything..."}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 pr-12 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 max-h-32"
            rows={2}
          />
          <button onClick={handleSend} disabled={!input.trim() || isLoading} className="absolute bottom-3 right-3 rounded-lg bg-indigo-600 p-1.5 text-white hover:bg-indigo-700 disabled:opacity-50">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const DownloadIcon = ({size}: {size: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
)