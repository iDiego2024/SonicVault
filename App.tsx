import React, { useState, useMemo, useEffect } from 'react';
import { Album, FilterState, SortField, SortOrder } from './types';
import { ImportModal } from './components/ImportModal';
import { SettingsModal } from './components/SettingsModal';
import { StatsDashboard } from './components/StatsDashboard';
import { AIChatPanel } from './components/AIChatPanel';
import { AlbumDetailsModal } from './components/AlbumDetailsModal';
import { 
  Search, Plus, Sparkles, Filter, Music, Disc, Star, Calendar, Tag, Trash2, ArrowUpDown, 
  LayoutGrid, List as ListIcon, PlayCircle, Wand2, RefreshCw, Globe, ChevronDown, FileText, Settings, Eye
} from 'lucide-react';

const INITIAL_DATA: Album[] = [
  { 
    id: '1', 
    artist: '파란노을 [Parannoul]', 
    title: 'After the Magic', 
    rating: null, 
    ownership: 'Digital', 
    year: '2023', 
    tags: ['shoegaze', 'k-indie'],
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/2/22/After_the_Magic.jpg'
  },
  { id: '2', artist: '파란노을 [Parannoul]', title: 'Sky Hundred', rating: null, ownership: 'Digital', year: '2024', tags: ['shoegaze', 'live'] },
  { id: '3', artist: '!!!', title: 'Louden Up Now', rating: 3.5, ownership: 'Digital', year: '2004', tags: ['dance-punk', 'best albums 2000-2009'] },
  { id: '4', artist: '!!!', title: 'Myth Takes', rating: 3.5, ownership: 'Digital', year: '2007', tags: ['dance-punk'] },
  { id: '5', artist: '!!!', title: 'Strange Weather, Isn\'t It?', rating: 3.0, ownership: 'Digital', year: '2010', tags: ['dance-punk'] },
  { 
    id: '6', 
    artist: '!!!', 
    title: 'THR!!!ER', 
    rating: 3.0, 
    ownership: 'Digital', 
    year: '2013', 
    tags: ['dance-punk', 'indie rock'],
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e6/Thr%21%21%21er.jpg'
  },
  { id: '7', artist: '!!!', title: 'Shake the Shudder', rating: null, ownership: 'Digital', year: '2017', tags: ['dance-punk'] },
  { id: '8', artist: '$uicideboy$', title: 'New World Depression', rating: null, ownership: 'Digital', year: '2024', tags: ['hip hop', 'trap'] },
  { id: '9', artist: '¥$', title: 'Vultures 2', rating: null, ownership: 'Digital', year: '2024', tags: ['hip hop'] },
  { id: '10', artist: '100 gecs', title: '10,000 gecs', rating: 4.0, ownership: 'Digital', year: '2023', tags: ['hyperpop'] },
  { id: '11', artist: '120 Days', title: '120 Days', rating: 3.0, ownership: 'Digital', year: '2006', tags: ['rock'] },
  { id: '12', artist: 'The 1975', title: 'The 1975', rating: 2.0, ownership: 'Digital', year: '2013', tags: ['pop rock'] },
  { id: '13', artist: 'The 1975', title: 'I Like It When You Sleep...', rating: 2.5, ownership: 'Digital', year: '2016', tags: ['pop rock'] },
  { id: '14', artist: '1990s', title: 'Cookies', rating: 2.0, ownership: 'Digital', year: '2007', tags: ['indie rock'] },
];

function App() {
  const [albums, setAlbums] = useState<Album[]>(INITIAL_DATA);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isFetchingCovers, setIsFetchingCovers] = useState(false);
  
  // Selection State for Details Modal
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  
  // Settings State - Default to provided key
  const [lastFmKey, setLastFmKey] = useState(() => localStorage.getItem('sonic_lastfm_key') || '35d1f37f24cae4311b13d6d0e4fa41fd');
  
  const [filter, setFilter] = useState<FilterState>({ 
    search: '', 
    minRating: 0,
    year: '',
    tag: ''
  });
  const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({ field: 'artist', order: 'asc' });

  // Save key when updated
  useEffect(() => {
    localStorage.setItem('sonic_lastfm_key', lastFmKey);
  }, [lastFmKey]);

  // Extract unique values for filters
  const uniqueYears = useMemo(() => {
    const years = new Set(albums.map(a => a.year).filter(y => y && y.trim() !== ''));
    return Array.from(years).sort().reverse();
  }, [albums]);

  const uniqueTags = useMemo(() => {
    const tags = new Set(albums.flatMap(a => a.tags));
    return Array.from(tags).sort();
  }, [albums]);

  // Smart Fetch: Tries Last.fm (Metadata + Cover) first, then iTunes (Cover only)
  const fetchCovers = async (specificAlbums?: Album[]) => {
    setIsFetchingCovers(true);
    
    // Process all albums that don't have a description OR don't have a cover
    const candidates = specificAlbums || albums;
    const albumsToUpdate = candidates.filter(a => !a.coverUrl || !a.description);
    
    if (albumsToUpdate.length === 0) {
      if (!specificAlbums) alert("All albums are fully updated!");
      setIsFetchingCovers(false);
      return;
    }

    for (const album of albumsToUpdate) {
      let newData: Partial<Album> = {};
      let source = '';

      // 1. Try Last.fm if Key is present
      if (lastFmKey) {
        try {
          const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${lastFmKey}&artist=${encodeURIComponent(album.artist)}&album=${encodeURIComponent(album.title)}&format=json&autocorrect=1`);
          const data = await res.json();
          if (data.album) {
            source = 'Last.fm';
            
            // Get Cover
            if (!album.coverUrl && data.album.image) {
              const images = data.album.image;
              const imgObj = 
                images.find((i: any) => i.size === 'mega') || 
                images.find((i: any) => i.size === 'extralarge') || 
                images.find((i: any) => i.size === 'large');
              if (imgObj && imgObj['#text']) newData.coverUrl = imgObj['#text'];
            }

            // Get Description (Wiki)
            if (data.album.wiki && data.album.wiki.summary) {
              newData.description = data.album.wiki.summary;
            }

            // Get Stats
            if (data.album.listeners) newData.listeners = data.album.listeners;
            if (data.album.playcount) newData.playcount = data.album.playcount;
            
            // Append top tag if tags are empty
            if (album.tags.length === 0 && data.album.tags && data.album.tags.tag) {
               const fmTags = Array.isArray(data.album.tags.tag) 
                 ? data.album.tags.tag.slice(0, 3).map((t: any) => t.name) 
                 : [data.album.tags.tag.name];
               newData.tags = fmTags;
            }
          }
        } catch (e) {
          console.warn(`Last.fm fetch failed for ${album.title}`, e);
        }
      }

      // 2. Fallback to iTunes for Cover if Last.fm failed to find one
      if (!newData.coverUrl && !album.coverUrl) {
        try {
          const query = encodeURIComponent(`${album.artist} ${album.title}`);
          const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=album&limit=1`);
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            newData.coverUrl = data.results[0].artworkUrl100?.replace('100x100bb', '600x600bb');
            if (!source) source = 'iTunes';
          }
        } catch (error) {
          console.error(`iTunes fetch failed for ${album.title}`, error);
        }
      }

      // 3. Update state if found anything
      if (Object.keys(newData).length > 0) {
        setAlbums(prev => prev.map(a => a.id === album.id ? { ...a, ...newData } : a));
        console.log(`Updated ${album.title} via ${source}`);
      }

      // Rate limiting delay
      await new Promise(r => setTimeout(r, 200)); 
    }

    setIsFetchingCovers(false);
  };

  const handleImport = (newAlbums: Album[]) => {
    setAlbums(prev => [...prev, ...newAlbums]);
    fetchCovers(newAlbums);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this album?')) {
      setAlbums(prev => prev.filter(a => a.id !== id));
      if (selectedAlbum?.id === id) setSelectedAlbum(null);
    }
  };

  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAlbums = useMemo(() => {
    return albums
      .filter(album => {
        const matchesSearch = 
          album.artist.toLowerCase().includes(filter.search.toLowerCase()) ||
          album.title.toLowerCase().includes(filter.search.toLowerCase());
        
        const matchesRating = filter.minRating === 0 || (album.rating !== null && album.rating >= filter.minRating);
        const matchesYear = filter.year === '' || album.year === filter.year;
        const matchesTag = filter.tag === '' || album.tags.includes(filter.tag);

        return matchesSearch && matchesRating && matchesYear && matchesTag;
      })
      .sort((a, b) => {
        const order = sort.order === 'asc' ? 1 : -1;
        if (sort.field === 'rating') {
          return ((a.rating || 0) - (b.rating || 0)) * order;
        } else if (sort.field === 'year') {
           return (a.year.localeCompare(b.year)) * order;
        }
        const valA = String(a[sort.field as keyof Album] || '');
        const valB = String(b[sort.field as keyof Album] || '');
        return valA.localeCompare(valB) * order;
      });
  }, [albums, filter, sort]);

  const getGradient = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 60) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 50%))`;
  };

  const getSpotifyLink = (album: Album) => {
    if (album.spotifyUrl) return album.spotifyUrl;
    return `https://open.spotify.com/search/${encodeURIComponent(album.artist + ' ' + album.title)}`;
  };

  const getReviewLink = (album: Album) => {
    if (album.reviewUrl) return album.reviewUrl;
    return `https://www.google.com/search?q=${encodeURIComponent(album.artist + ' ' + album.title + ' review')}`;
  };

  const getRymLink = (album: Album) => {
    if (album.rymUrl) return album.rymUrl;
    return `https://rateyourmusic.com/search?searchterm=${encodeURIComponent(album.artist + ' ' + album.title)}&searchtype=l`;
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* --- Ambient Background Animations --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-900/30 blur-[128px] animate-blob mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/30 blur-[128px] animate-blob animation-delay-2000 mix-blend-screen" />
        <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-900/30 blur-[128px] animate-blob animation-delay-4000 mix-blend-screen" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        
        {/* --- Floating Navbar --- */}
        <header className="px-6 py-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto glass rounded-2xl p-3 flex items-center justify-between shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3 pl-2">
              <div className="relative group">
                 <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
                 <div className="relative bg-black p-2 rounded-full border border-indigo-500/50">
                    <Disc className="text-indigo-400" size={24} />
                 </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-200">
                  SonicVault
                </h1>
                <p className="text-[10px] text-indigo-300 font-medium tracking-widest uppercase">My Collection</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={() => fetchCovers()}
                disabled={isFetchingCovers}
                className="group relative px-4 py-2 rounded-xl overflow-hidden bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-indigo-500/50 transition-all disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 relative z-10">
                   {isFetchingCovers ? (
                     <RefreshCw size={16} className="animate-spin text-indigo-400" />
                   ) : (
                     <Wand2 size={16} className="text-indigo-400" />
                   )}
                   <span className="hidden sm:inline text-xs font-bold text-slate-300 group-hover:text-white uppercase tracking-wider">
                     {isFetchingCovers ? 'Fetching...' : 'Fetch Metadata'}
                   </span>
                </div>
              </button>

              <button 
                onClick={() => setIsImportOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700 hover:border-emerald-500/50 group"
              >
                <Plus size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Add</span>
              </button>
              
              <button 
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles size={16} fill="currentColor" />
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Ask AI</span>
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-indigo-300 rounded-xl transition-all border border-slate-700 hover:border-indigo-500/50"
                title="Settings"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* --- Main Content --- */}
        <main className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Stats */}
            <StatsDashboard albums={albums} />

            {/* --- Filters Deck --- */}
            <div className="glass rounded-2xl p-2 sticky top-4 z-40 backdrop-blur-xl flex flex-col lg:flex-row gap-3 shadow-2xl shadow-black/20">
              {/* Search */}
              <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-indigo-500/5 rounded-xl group-focus-within:bg-indigo-500/10 transition-colors pointer-events-none" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search artist, album..." 
                  className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 py-3 pl-11 pr-4"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Custom Selects */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={14} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <select 
                    className="appearance-none bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-indigo-500/50 text-slate-300 text-xs font-medium rounded-lg py-2.5 pl-9 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all"
                    value={filter.year}
                    onChange={(e) => setFilter({ ...filter, year: e.target.value })}
                  >
                    <option value="">Year: All</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag size={14} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <select 
                    className="appearance-none bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-indigo-500/50 text-slate-300 text-xs font-medium rounded-lg py-2.5 pl-9 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all max-w-[150px]"
                    value={filter.tag}
                    onChange={(e) => setFilter({ ...filter, tag: e.target.value })}
                  >
                    <option value="">Genre: All</option>
                    {uniqueTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>

                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Star size={14} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <select 
                    className="appearance-none bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-amber-500/50 text-slate-300 text-xs font-medium rounded-lg py-2.5 pl-9 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer transition-all"
                    value={filter.minRating}
                    onChange={(e) => setFilter({ ...filter, minRating: Number(e.target.value) })}
                  >
                    <option value={0}>Rating: Any</option>
                    <option value={4}>4+ Stars</option>
                    <option value={3}>3+ Stars</option>
                    <option value={2}>2+ Stars</option>
                  </select>
                   <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>

                <div className="w-px h-8 bg-white/10 mx-1 hidden md:block" />

                {/* View Toggle */}
                <div className="bg-slate-800/50 p-1 rounded-lg border border-slate-700 flex">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <ListIcon size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Display */}
            {viewMode === 'list' ? (
              /* --- LIST VIEW --- */
              <div className="glass rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <th className="p-5 cursor-pointer hover:text-indigo-400 transition-colors group" onClick={() => handleSort('artist')}>
                          <div className="flex items-center gap-2">Artist <ArrowUpDown size={12} className={`opacity-0 group-hover:opacity-100 ${sort.field === 'artist' ? 'opacity-100 text-indigo-400' : ''}`} /></div>
                        </th>
                        <th className="p-5">Release</th>
                        <th className="p-5 cursor-pointer hover:text-indigo-400 transition-colors group" onClick={() => handleSort('rating')}>
                           <div className="flex items-center gap-2">Rating <ArrowUpDown size={12} className={`opacity-0 group-hover:opacity-100 ${sort.field === 'rating' ? 'opacity-100 text-indigo-400' : ''}`} /></div>
                        </th>
                        <th className="p-5">Format</th>
                        <th className="p-5 cursor-pointer hover:text-indigo-400 transition-colors group" onClick={() => handleSort('year')}>
                          <div className="flex items-center gap-2">Year <ArrowUpDown size={12} className={`opacity-0 group-hover:opacity-100 ${sort.field === 'year' ? 'opacity-100 text-indigo-400' : ''}`} /></div>
                        </th>
                        <th className="p-5">Tags</th>
                        <th className="p-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredAlbums.length > 0 ? (
                        filteredAlbums.map((album) => (
                          <tr key={album.id} className="group hover:bg-white/5 transition-colors duration-200 cursor-pointer" onClick={() => setSelectedAlbum(album)}>
                            <td className="p-5 font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {album.artist}
                            </td>
                            <td className="p-5 text-slate-300">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-800 flex-shrink-0 overflow-hidden">
                                  {album.coverUrl ? <img src={album.coverUrl} className="w-full h-full object-cover" /> : <Music className="w-full h-full p-2 text-slate-600" />}
                                </div>
                                <span className="font-medium">{album.title}</span>
                              </div>
                            </td>
                            <td className="p-5">
                              {album.rating ? (
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-lg ${
                                  album.rating >= 4 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10' 
                                    : album.rating >= 2.5 
                                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-amber-500/10'
                                      : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                }`}>
                                  <Star size={10} fill="currentColor" />
                                  {album.rating.toFixed(1)}
                                </div>
                              ) : (
                                <span className="text-slate-600 text-xs font-mono">-</span>
                              )}
                            </td>
                            <td className="p-5">
                               <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-black/40 px-2 py-1 rounded border border-white/5">
                                  {album.ownership}
                               </span>
                            </td>
                            <td className="p-5 text-indigo-300 font-mono text-sm font-medium">
                              {album.year}
                            </td>
                            <td className="p-5">
                              <div className="flex flex-wrap gap-1.5">
                                {album.tags.slice(0,3).map((tag, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 whitespace-nowrap">
                                    {tag}
                                  </span>
                                ))}
                                {album.tags.length > 3 && <span className="text-xs text-slate-500">+{album.tags.length - 3}</span>}
                              </div>
                            </td>
                            <td className="p-5 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedAlbum(album); }}
                                  className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all"
                                >
                                  <Eye size={16} />
                                </button>
                                <a 
                                  href={getSpotifyLink(album)} target="_blank" rel="noopener noreferrer"
                                  className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-all"
                                >
                                  <PlayCircle size={16} />
                                </a>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDelete(album.id); }}
                                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={7} className="p-12 text-center text-slate-500 italic">No albums found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* --- DAZZLING GRID VIEW --- */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {filteredAlbums.length > 0 ? (
                  filteredAlbums.map(album => (
                    <div 
                      key={album.id} 
                      className="group relative rounded-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                      onClick={() => setSelectedAlbum(album)}
                    >
                      
                      {/* Card Content */}
                      <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col relative z-10">
                        {/* Image Container */}
                        <div className="relative aspect-square w-full overflow-hidden bg-black">
                          {album.coverUrl ? (
                            <img 
                              src={album.coverUrl} 
                              alt={`${album.title} cover`} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center animate-pulse"
                              style={{ background: getGradient(album.title + album.artist) }}
                            >
                              <Disc size={48} className="text-white/20 mix-blend-overlay" />
                            </div>
                          )}

                          {/* Floating Badges */}
                          <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-start">
                             {album.year && (
                                <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-white shadow-lg">
                                  {album.year}
                                </span>
                             )}
                             {album.rating && (
                                <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-lg">
                                  <Star size={10} className="text-amber-400" fill="#fbbf24" />
                                  <span className="text-[10px] font-bold text-white">{album.rating.toFixed(1)}</span>
                                </span>
                             )}
                          </div>

                          {/* Hover Actions Overlay */}
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                             <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300" onClick={e => e.stopPropagation()}>
                                <a href={getSpotifyLink(album)} target="_blank" rel="noopener noreferrer" className="p-3 bg-green-500 rounded-full text-white hover:scale-110 transition-transform shadow-xl hover:bg-green-400">
                                  <PlayCircle size={20} fill="currentColor" />
                                </a>
                                <a href={getRymLink(album)} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-600 rounded-full text-white hover:scale-110 transition-transform shadow-xl hover:bg-blue-500">
                                  <Globe size={20} />
                                </a>
                                <a href={getReviewLink(album)} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform shadow-xl hover:bg-slate-200">
                                  <FileText size={20} />
                                </a>
                             </div>
                             <button onClick={(e) => { e.stopPropagation(); handleDelete(album.id); }} className="mt-4 text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 hover:underline">
                               <Trash2 size={12} /> Remove
                             </button>
                             <div className="absolute bottom-4 text-xs font-bold text-white uppercase tracking-widest border border-white/20 px-3 py-1 rounded-full bg-white/10 backdrop-blur">
                                View Details
                             </div>
                          </div>
                        </div>

                        {/* Info Pane */}
                        <div className="p-4 flex flex-col flex-1 bg-gradient-to-b from-slate-900/50 to-slate-900/90 backdrop-blur-md">
                          <h3 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-1 group-hover:text-indigo-300 transition-colors" title={album.title}>
                            {album.title}
                          </h3>
                          <p className="text-xs text-slate-400 mb-3 line-clamp-1">{album.artist}</p>
                          
                          <div className="mt-auto flex items-center justify-between gap-2">
                             <div className="flex gap-1 overflow-hidden">
                               {album.tags.slice(0, 2).map(t => (
                                 <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-200 border border-indigo-500/10 truncate max-w-[70px]">
                                   {t}
                                 </span>
                               ))}
                             </div>
                             <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider shrink-0">
                              {album.ownership.substring(0,3)}
                             </span>
                          </div>
                        </div>
                      </div>

                      {/* Neon Glow Behind */}
                      <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                    </div>
                  ))
                ) : (
                   <div className="col-span-full py-20 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 mb-4 animate-pulse">
                        <Music size={32} className="text-slate-600" />
                      </div>
                      <p className="text-slate-500 text-lg font-light">No music found in this dimension.</p>
                    </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Modals */}
      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onImport={handleImport} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={lastFmKey} 
        onSave={(k) => setLastFmKey(k)} 
      />
      <AlbumDetailsModal 
        album={selectedAlbum} 
        onClose={() => setSelectedAlbum(null)} 
      />
      
      {/* Chat Overlay */}
      <div className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isChatOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsChatOpen(false)} />
      <div className={`fixed inset-y-0 right-0 z-50 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <AIChatPanel library={albums} isOpen={true} onClose={() => setIsChatOpen(false)} />
      </div>

    </div>
  );
}

export default App;