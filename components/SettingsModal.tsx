import React, { useState, useEffect } from 'react';
import { X, Key } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, onSave }) => {
  const [key, setKey] = useState(apiKey);

  useEffect(() => {
    setKey(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Key size={20} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">API Settings</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-5 bg-gradient-to-b from-slate-800 to-slate-900">
          <div>
            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Last.fm API Key</label>
            <div className="relative group">
              <input 
                type="text" 
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-black/40 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all placeholder:text-slate-600 font-mono text-sm"
                placeholder="Ex: 3b1f... (32 chars)"
              />
              <div className="absolute inset-0 border border-indigo-500/30 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
              Required to fetch high-quality covers from Last.fm. If left empty, the app will fallback to iTunes Search API (Standard quality).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-700 flex justify-end gap-3 bg-slate-900/80 backdrop-blur">
           <button 
             onClick={onClose} 
             className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={() => { onSave(key); onClose(); }}
             className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5"
           >
             Save Changes
           </button>
        </div>
      </div>
    </div>
  );
};