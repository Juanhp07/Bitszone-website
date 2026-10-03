import sys

with open('src/components/player/ArtistView.tsx', 'r') as f:
    code = f.read()
    
target = """<p className="text-xs text-white/50 truncate mt-0.5">{album.artist}</p>
                  </div>
                  {(() => {"""
          
replacement = """<p className="text-xs text-white/50 truncate mt-0.5">{album.artist}</p>
                    {downloadingAlbums?.includes(String(album.id)) && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(album); }}
                        className="text-xs text-blue-400 font-medium bg-blue-400/10 px-2 py-0.5 rounded-full hover:bg-blue-400/20 transition-colors w-fit mt-1"
                      >
                        Descargando...
                      </button>
                    )}
                  </div>
                  {(() => {"""

if target in code:
    code = code.replace(target, replacement)
    with open('src/components/player/ArtistView.tsx', 'w') as f:
        f.write(code)
    print("Fixed ArtistView")
else:
    print("Not found in ArtistView")

