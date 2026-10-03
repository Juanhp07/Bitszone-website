const fs = require('fs');
let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Update Props type
code = code.replace(
  "type?: 'downloads' | 'favorites',",
  "type?: 'downloads' | 'favorites' | 'licenses' | 'playlists',\n  gradientClass?: string,"
);

code = code.replace(
  "albums\n}: {",
  "albums,\n  gradientClass\n}: {"
);

// 2. Update Header Gradient
code = code.replace(
  "className={`w-40 h-40 shrink-0 rounded-2xl bg-gradient-to-br shadow-2xl flex items-center justify-center ${type === 'downloads' ? 'from-[#a855f7] to-[#3b82f6]' : 'from-pink-500 to-purple-600'}`}",
  "className={`w-40 h-40 shrink-0 rounded-2xl bg-gradient-to-br shadow-2xl flex items-center justify-center ${gradientClass || (type === 'downloads' ? 'from-[#a855f7] to-[#3b82f6]' : 'from-pink-500 to-purple-600')}`}"
);

// 3. Update Tracks Logic
code = code.replace(
  "const tracks = type === 'downloads' ? downloadedTracks : favoriteTracks;",
  "const tracks = type === 'downloads' ? downloadedTracks : type === 'favorites' ? favoriteTracks : [];"
);

// 4. Helper function inside component
// We can inject a helper to get accent classes at the top of the component.
const helper = `  const getAccentColor = () => {
    if (type === 'licenses') return 'text-yellow-400';
    if (type === 'playlists') return 'text-green-400';
    return 'text-[#a855f7]';
  };
  const getTabClasses = (isActive: boolean) => {
    if (!isActive) return 'border border-transparent text-white/50 hover:text-white';
    if (type === 'licenses') return 'bg-yellow-500/20 text-yellow-400 shadow-md border border-yellow-500/30';
    if (type === 'playlists') return 'bg-green-500/20 text-green-400 shadow-md border border-green-500/30';
    return 'bg-[#a855f7]/20 text-[#c084fc] shadow-md border border-[#a855f7]/30';
  };
  const getPlayBtnClasses = () => {
    if (type === 'licenses') return 'bg-yellow-500 hover:bg-yellow-400';
    if (type === 'playlists') return 'bg-green-500 hover:bg-green-400';
    return 'bg-[#a855f7] hover:bg-[#b066f8]';
  };`;

code = code.replace("const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);", "const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);\n" + helper);

// 5. Replace Tab Classes
code = code.replace(
  "className={`outline-none focus:outline-none focus:ring-0 px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${viewMode === 'canciones' ? 'bg-[#a855f7]/20 text-[#c084fc] shadow-md border border-[#a855f7]/30' : 'border border-transparent text-white/50 hover:text-white'}`}",
  "className={`outline-none focus:outline-none focus:ring-0 px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${getTabClasses(viewMode === 'canciones')}`}"
);

code = code.replace(
  "className={`outline-none focus:outline-none focus:ring-0 px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${viewMode === 'albumes' ? 'bg-[#a855f7]/20 text-[#c084fc] shadow-md border border-[#a855f7]/30' : 'border border-transparent text-white/50 hover:text-white'}`}",
  "className={`outline-none focus:outline-none focus:ring-0 px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${getTabClasses(viewMode === 'albumes')}`}"
);

// Replace Album View play button
code = code.replace(
  "className=\"w-14 h-14 bg-[#a855f7] hover:bg-[#b066f8] text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg\"",
  "className={`w-14 h-14 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg ${getPlayBtnClasses()}`}"
);

// Replace Table Header Sort active color
code = code.replace(
  "className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/5 last:border-0 ${sortBy === opt.id ? 'text-[#a855f7] font-semibold bg-white/5' : 'text-white/80 hover:text-white hover:bg-white/10'}`}",
  "className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/5 last:border-0 ${sortBy === opt.id ? getAccentColor() + ' font-semibold bg-white/5' : 'text-white/80 hover:text-white hover:bg-white/10'}`}"
);

// 6. Support ReactNode title
code = code.replace("title?: string,", "title?: React.ReactNode,");
code = code.replace("<h1 className=\"text-5xl font-black text-white tracking-tight\" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{title}</h1>", "<div className=\"text-5xl font-black text-white tracking-tight\" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{title}</div>");

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log("Safely applied custom colors");
