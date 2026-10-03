import sys

with open('src/components/player/DownloadsView.tsx', 'r') as f:
    code = f.read()

# 1. Fix HoldButton hover breaking the animation, and make border thinner
old_hold_class = 'className="!border border-white/20 font-medium hover:!border-red-500/30 hover:!bg-red-500/10 hover:!text-red-400 transition-colors group"'
new_hold_class = 'className="!border border-white/10 font-medium data-[phase=idle]:hover:border-red-500/30 data-[phase=idle]:hover:bg-red-500/10 data-[phase=idle]:hover:text-red-400 transition-colors group"'

if old_hold_class in code:
    code = code.replace(old_hold_class, new_hold_class)
    print("Fixed HoldButton animation override and border.")
else:
    print("Could not find the exact HoldButton class to replace.")

# 2. Fix heart hover to show HeartOff
old_heart = """<button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(track);
              }}
              className="text-[#a855f7] hover:text-[#b066f8] opacity-100 transition-all p-2"
              title="Quitar de favoritos"
            >
              <Heart className="w-4 h-4" fill="currentColor" />
            </button>"""

new_heart = """<button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(track);
              }}
              className="group/favbtn text-[#a855f7] hover:text-[#b066f8] opacity-100 transition-all p-2"
              title="Quitar de favoritos"
            >
              <Heart className="w-4 h-4 block group-hover/favbtn:hidden" fill="currentColor" />
              <HeartOff className="w-4 h-4 hidden group-hover/favbtn:block" />
            </button>"""

if old_heart in code:
    code = code.replace(old_heart, new_heart)
    print("Fixed heart hover to show HeartOff.")
else:
    print("Could not find the heart button to replace.")

with open('src/components/player/DownloadsView.tsx', 'w') as f:
    f.write(code)

