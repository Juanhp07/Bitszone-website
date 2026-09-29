const fs = require('fs');

let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Fix Layout (Don't let it reach the bottom controls)
// Find the lyrics view area wrapper
const lyricsAreaWrapperFind = `className={\`absolute inset-0 flex flex-col items-center justify-center z-20 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] \${activeTab === 'letra' ? 'opacity-100 translate-y-[-5vh]' : 'opacity-0 translate-y-12 pointer-events-none'}\`}`;

// Replace inset-0 with top-0 left-0 right-0 bottom-[280px] to keep it strictly above the album title
// Also remove translate-y-[-5vh] because it's now positioned explicitly above the controls
const lyricsAreaWrapperReplace = `className={\`absolute top-0 left-0 right-0 bottom-[220px] xl:bottom-[280px] flex flex-col items-center justify-center z-20 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] \${activeTab === 'letra' ? 'opacity-100' : 'opacity-0 translate-y-12 pointer-events-none'}\`}`;

if (code.includes(lyricsAreaWrapperFind)) {
    code = code.replace(lyricsAreaWrapperFind, lyricsAreaWrapperReplace);
}

// 2. Adjust Sync Offset (Add ~2.5s to currentSecs so lyrics appear earlier)
const syncFind = `const currentSecs = progress * (track.duration / 1000);`;
const syncReplace = `const currentSecs = progress * (track.duration / 1000) + 2.5; // Offset to match the audio timing perfectly`;

if (code.includes(syncFind)) {
    code = code.replace(syncFind, syncReplace);
}

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Patched ImmersivePlayer layout and sync');
