const fs = require('fs');

let content = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// 1. Add the useEffect hook for the Escape key
const useEffectStr = `  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (albumToRemove) setAlbumToRemove(null);
        if (trackToRemove) setTrackToRemove(null);
        if (showClearConfirm) {
          setShowClearConfirm(false);
          setConfirmText("");
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [albumToRemove, trackToRemove, showClearConfirm]);`;

content = content.replace(
  /const \[confirmText, setConfirmText\] = useState\(""\);/,
  `const [confirmText, setConfirmText] = useState("");\n\n${useEffectStr}`
);

// 2. Add onClick logic to albumToRemove backdrop
content = content.replace(
  /\{albumToRemove && \(\n\s*<div className="fixed inset-0 z-50 flex items-center justify-center bg-black\/60 backdrop-blur-sm px-4">/g,
  "{albumToRemove && (\n        <div className=\"fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4\" onClick={() => setAlbumToRemove(null)}>"
);
// And prevent propagation
content = content.replace(
  /className="bg-\[#18181b\] border border-white\/10 rounded-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">/g,
  "className=\"bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200\" onClick={(e) => e.stopPropagation()}>"
);

// 3. Add onClick logic to trackToRemove backdrop
content = content.replace(
  /\{trackToRemove && \(\n\s*<div className="fixed inset-0 z-50 flex items-center justify-center bg-black\/60 backdrop-blur-sm px-4">/g,
  "{trackToRemove && (\n        <div className=\"fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4\" onClick={() => setTrackToRemove(null)}>"
);

// 4. Add onClick logic to showClearConfirm backdrop
content = content.replace(
  /\{showClearConfirm && \(\n\s*<div className="fixed inset-0 z-50 flex items-center justify-center bg-black\/60 backdrop-blur-sm px-4">/g,
  "{showClearConfirm && (\n        <div className=\"fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4\" onClick={() => { setShowClearConfirm(false); setConfirmText(''); }}>"
);
// And prevent propagation for max-w-md
content = content.replace(
  /className="bg-\[#18181b\] border border-white\/10 rounded-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">/g,
  "className=\"bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200\" onClick={(e) => e.stopPropagation()}>"
);

fs.writeFileSync('src/components/player/DownloadsView.tsx', content);
console.log('Modals fixed to close on outside click and Esc!');
