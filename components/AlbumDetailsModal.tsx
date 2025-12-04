import React from 'react';
import { Album } from '../types';
import { X, Globe, PlayCircle, Users, BarChart3, Calendar, Disc, Tag } from 'lucide-react';

interface AlbumDetailsModalProps {
  album: Album | null;
  onClose: () => void;
}

export const AlbumDetailsModal: React.FC<AlbumDetailsModalProps> = ({ album, onClose }) => {
  if (!album) return null;

  // Function to strip HTML tags from Last.fm summary
  const cleanSummary = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" />
      
      <div 
        className="relative bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col md:flex-row animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Left: Cover Art */}
        <div className="md:w-1/2 relative bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
          {album.coverUrl ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-150"
                style={{ backgroundImage: `url(${album.coverUrl})` }} 
              />
              <img 
                src={album.coverUrl} 
                alt={album.title} 
                className="relative z-10 w-full h-full object-cover max-h-[500px] md:max-h-full shadow-2xl"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-600">
               <Disc size={64} className="mb-4 opacity-50" />
               <span className="text-xs uppercase tracking-widest">No Cover Art</span>
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="md:w-1/2 p-8 flex flex-col bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
          
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white leading-tight mb-2 tracking-tight">{album.title}</h2>
            <p className="text-xl text-indigo-400 font-medium">{album.artist}</p>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700/50">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-sm font-mono text-slate-200">{album.year || 'N/A'}</span>
            </div>
            {album.rating && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <span className="text-sm font-bold text-amber-400">★ {album.rating}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{album.ownership}</span>
            </div>
          </div>

          {/* Last.fm Stats */}
          {(album.listeners || album.playcount) && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs uppercase tracking-wider">
                  <Users size={14} /> Listeners
                </div>
                <div className="text-lg font-mono text-white">{parseInt(album.listeners || '0').toLocaleString()}</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs uppercase tracking-wider">
                   <BarChart3 size={14} /> Scrobbles
                </div>
                <div className="text-lg font-mono text-white">{parseInt(album.playcount || '0').toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="flex-1 overflow-y-auto pr-2 mb-8 custom-scrollbar">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">About</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {album.description ? cleanSummary(album.description) : (
                <span className="text-slate-600 italic">No description available. Fetch data to retrieve from Last.fm.</span>
              )}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {album.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-[10px] px-2 py-1 bg-slate-800 text-slate-400 rounded-full border border-slate-700">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>

          {/* External Links */}
          <div className="mt-auto flex gap-3 pt-6 border-t border-slate-800">
            <a 
              href={`https://open.spotify.com/search/${encodeURIComponent(album.artist + ' ' + album.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-3 rounded-xl transition-transform hover:-translate-y-0.5"
            >
              <PlayCircle size={18} /> Spotify
            </a>
            <a 
              href={`https://rateyourmusic.com/search?searchterm=${encodeURIComponent(album.artist + ' ' + album.title)}&searchtype=l`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-transform hover:-translate-y-0.5"
            >
              <Globe size={18} /> RYM
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};