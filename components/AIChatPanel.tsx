import React, { useState, useRef, useEffect } from 'react';
import { Album } from '../types';
import { askLibraryAssistant } from '../services/geminiService';
import { Sparkles, Send, Bot, User } from 'lucide-react';

interface AIChatPanelProps {
  library: Album[];
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ library, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your SonicVault librarian. Ask me anything about your collection.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await askLibraryAssistant(userMsg, library);

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-40 transform transition-transform duration-300 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur">
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles size={20} />
          <h2 className="font-bold text-white">AI Librarian</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
              }`}>
                {m.content.split('\n').map((line, idx) => (
                  <p key={idx} className={line.startsWith('-') ? 'ml-2' : ''}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                </div>
              </div>
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-slate-800 text-slate-200 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700"
            placeholder="Ask about your library..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};