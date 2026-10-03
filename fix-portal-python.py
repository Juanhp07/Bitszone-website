import sys

with open('src/components/player/DownloadsView.tsx', 'r') as f:
    code = f.read()

target_str = """{showSort && (
            <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
            <div className={`absolute top-full right-0 mt-4 w-[240px] border rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans shadow-2xl bg-black/30 ${type === 'licenses' ? 'border-yellow-500/20' : type === 'playlists' ? 'border-green-500/20' : 'border-[#a855f7]/20'}`}>"""

replacement = """{showSort && typeof document !== 'undefined' && createPortal(
            <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setShowSort(false)} />
            <div 
              style={{ top: sortPos.top, left: sortPos.left }}
              className={`fixed mt-4 w-[280px] border rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans shadow-2xl bg-black/30 ${type === 'licenses' ? 'border-yellow-500/20' : type === 'playlists' ? 'border-green-500/20' : 'border-[#a855f7]/20'}`}>"""

if target_str in code:
    code = code.replace(target_str, replacement)
    
    close_target = """</>
          )}"""
    close_replacement = """</>,
            document.body
          )}"""
    code = code.replace(close_target, close_replacement)
    
    if 'const [sortPos, setSortPos]' not in code:
        code = code.replace(
            'const [showSort, setShowSort] = useState(false);',
            'const [showSort, setShowSort] = useState(false);\n  const [sortPos, setSortPos] = useState({ top: 0, left: 0 });'
        )
        
    btn_target = """onClick={() => setShowSort(!showSort)}"""
    btn_replacement = """onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setSortPos({ top: rect.bottom, left: rect.right - 280 });
              setShowSort(!showSort);
            }}"""
    code = code.replace(btn_target, btn_replacement)
    
    with open('src/components/player/DownloadsView.tsx', 'w') as f:
        f.write(code)
    print("Safe python replacement succeeded.")
else:
    print("Target string not found!")

