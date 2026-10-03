import sys

with open('src/components/player/DownloadsView.tsx', 'r') as f:
    code = f.read()

# 1. Fix the "Mantener para eliminar" button border
old_btn = 'className="border border-white/10 font-medium hover:!border-red-500/30 hover:!bg-red-500/10 hover:!text-red-400 transition-colors group"'
new_btn = 'className="border border-white/20 rounded-full px-4 py-1.5 font-medium hover:!border-red-500/30 hover:!bg-red-500/10 hover:!text-red-400 transition-colors group"'

if old_btn in code:
    code = code.replace(old_btn, new_btn)
    print("Fixed HoldButton border classes.")
else:
    # Try another matching approach in case classes shifted
    print("Could not find HoldButton border string to replace. Checking alternative...")
    old_btn2 = 'className="border border-transparent font-medium hover:!border-red-500/30'
    if old_btn2 in code:
        print("Found older HoldButton class")

# 2. Fix the heart icons
# Find the FuseButton for the track
fuse_target = """<FuseButton
            label=""
            undoLabel=""
            doneLabel=""
            background="transparent"
            color="rgba(255,255,255,0.3)"
            fuseColor="#ef4444"
            undoWindow={3000}
            className={`${type === 'downloads' ? 'hover:text-red-400 opacity-0 group-hover:opacity-100' : 'text-[#a855f7] hover:text-[#b066f8] opacity-100'} transition-all !w-8 !h-8 !min-w-[32px] !px-0 rounded-full`}
            icon={type === 'downloads' ? <Trash2 className="w-4 h-4" /> : <Heart className="w-4 h-4" fill="currentColor" />}
            onCommit={() => {
              if (type === 'downloads') {
                removeDownload(track.id);
              } else {
                toggleFavorite(track);
              }
            }}
          />"""

new_track_btn = """{type === 'downloads' ? (
            <FuseButton
              label=""
              undoLabel=""
              doneLabel=""
              background="transparent"
              color="rgba(255,255,255,0.3)"
              fuseColor="#ef4444"
              undoWindow={3000}
              className="hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all !w-8 !h-8 !min-w-[32px] !px-0 rounded-full"
              icon={<Trash2 className="w-4 h-4" />}
              onCommit={() => removeDownload(track.id)}
            />
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(track);
              }}
              className="text-[#a855f7] hover:text-[#b066f8] opacity-100 transition-all p-2"
              title="Quitar de favoritos"
            >
              <Heart className="w-4 h-4" fill="currentColor" />
            </button>
          )}"""

if fuse_target in code:
    code = code.replace(fuse_target, new_track_btn)
    print("Fixed track hearts!")
else:
    print("Could not find track FuseButton to replace.")

with open('src/components/player/DownloadsView.tsx', 'w') as f:
    f.write(code)

