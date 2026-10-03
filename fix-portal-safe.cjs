const fs = require('fs');
let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

const targetStr = `{showSort && (
            <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
            <div className={\`absolute top-full right-0 mt-4 w-[240px] border rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans shadow-2xl bg-black/30 \${type === 'licenses' ? 'border-yellow-500/20' : type === 'playlists' ? 'border-green-500/20' : 'border-[#a855f7]/20'}\`}>`;

const replacement = `{showSort && typeof document !== 'undefined' && createPortal(
            <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setShowSort(false)} />
            <div 
              style={{ top: sortPos.top, left: sortPos.left }}
              className={\`fixed mt-4 w-[280px] border rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans shadow-2xl bg-black/30 \${type === 'licenses' ? 'border-yellow-500/20' : type === 'playlists' ? 'border-green-500/20' : 'border-[#a855f7]/20'}\`}>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  // Also we need to close createPortal
  // We can just replace `</>\n          )}` with `</>,\n            document.body\n          )}`
  const closeTarget = `</>\n          )}`;
  const closeReplacement = `</>,\n            document.body\n          )}`;
  code = code.replace(closeTarget, closeReplacement);
  
  // Add state for sortPos
  if (!code.includes('const [sortPos, setSortPos]')) {
    code = code.replace(
      'const [showSort, setShowSort] = useState(false);',
      'const [showSort, setShowSort] = useState(false);\n  const [sortPos, setSortPos] = useState({ top: 0, left: 0 });'
    );
  }
  
  // Change button onClick
  const btnTarget = `onClick={() => setShowSort(!showSort)}`;
  const btnReplacement = `onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setSortPos({ top: rect.bottom, left: rect.right - 280 });
              setShowSort(!showSort);
            }}`;
  code = code.replace(btnTarget, btnReplacement);
  
  fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
  console.log("Safe replacement succeeded.");
} else {
  console.log("Target string not found!");
}
