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

// 4. Update dynamic accent color in Tabs based on type
// Currently it uses bg-[#a855f7]/20 and text-[#c084fc]
// We can dynamically define accentColor based on type.
// But wait, the easiest way is just to add a small style object or replace them carefully.
// I'll replace bg-[#a855f7]/20 with something derived from gradientClass, OR just use white/20 for non-downloads/favorites.
// Let's replace the tab active colors to use a dynamic class or just white.
code = code.replace(
  /bg-\[\#a855f7\]\/20 text-\[\#c084fc\] shadow-md border border-\[\#a855f7\]\/30/g,
  "${type === 'licenses' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : type === 'playlists' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-[#a855f7]/20 text-[#c084fc] border-[#a855f7]/30'} shadow-md"
);

// Replace Album View play button
code = code.replace(
  "w-14 h-14 bg-[#a855f7] hover:bg-[#b066f8]",
  "${type === 'licenses' ? 'bg-yellow-500 hover:bg-yellow-400' : type === 'playlists' ? 'bg-green-500 hover:bg-green-400' : 'bg-[#a855f7] hover:bg-[#b066f8]'} w-14 h-14"
);

// Replace Table Header Sort active color
code = code.replace(
  "text-[#a855f7] font-semibold bg-white/5",
  "${type === 'licenses' ? 'text-yellow-400' : type === 'playlists' ? 'text-green-400' : 'text-[#a855f7]'} font-semibold bg-white/5"
);

// We need to also fix title typing to support ReactNode
code = code.replace("title?: string,", "title?: React.ReactNode,");

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log("Updated DownloadsView for custom colors");
