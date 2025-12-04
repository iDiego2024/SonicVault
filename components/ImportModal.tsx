import React, { useState } from 'react';
import { Album } from '../types';
import { X, Save, FileSpreadsheet } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (albums: Album[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleProcess = () => {
    // Basic parser for Excel copy-paste (Tab separated) or CSV
    const rows = inputText.trim().split('\n');
    const newAlbums: Album[] = [];

    rows.forEach((row, index) => {
      // split by tab (excel) or common CSV delimiters if tab fails
      let cols = row.split('\t');
      if (cols.length < 2) cols = row.split(',');

      // Assuming order based on user image: Artist | Release | Rating | Ownership | Year/Tags
      // Adjusting to fit the typical schema: Artist, Title, Rating, Ownership, Year, Tags
      if (cols.length >= 2) {
        const artist = cols[0]?.trim() || 'Unknown Artist';
        const title = cols[1]?.trim() || 'Untitled';
        const ratingRaw = cols[2]?.trim();
        const ownership = cols[3]?.trim() || 'Digital';
        const year = cols[4]?.trim() || '';
        const tagsRaw = cols[5]?.trim() || '';

        const rating = ratingRaw ? parseFloat(ratingRaw) : null;
        
        // Handle tags: split by comma if present
        const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()) : [];

        newAlbums.push({
          id: `imp-${Date.now()}-${index}`,
          artist,
          title,
          rating: isNaN(rating as number) ? null : rating,
          ownership,
          year,
          tags
        });
      }
    });

    onImport(newAlbums);
    setInputText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <FileSpreadsheet size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Import from Excel</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-auto">
          <p className="text-slate-300 mb-4 text-sm">
            Copy your cells from Excel (Artist, Release, Rating, Ownership, Year, Tags) and paste them below. 
            The app will try to auto-detect columns based on standard tab separation.
          </p>
          <textarea
            className="w-full h-64 bg-slate-900 border border-slate-700 rounded-lg p-4 text-xs font-mono text-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            placeholder={`Artist\tRelease\tRating\tOwnership\tYear\tTags\nParannoul\tAfter the Magic\t\tDigital\t2023\tshoegaze\n...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleProcess}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Save size={18} />
            Parse & Import
          </button>
        </div>
      </div>
    </div>
  );
};