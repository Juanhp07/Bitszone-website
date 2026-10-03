import sys

with open('src/components/player/CatalogView.tsx', 'r') as f:
    code = f.read()
    
target = """<span className="text-white/50 text-xs mt-0.5 truncate">{album.artist}</span>
          </div>
          {(() => {"""
          
replacement = """<span className="text-white/50 text-xs mt-0.5 truncate">{album.artist}</span>
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
    with open('src/components/player/CatalogView.tsx', 'w') as f:
        f.write(code)
    print("Fixed CatalogView")
else:
    print("Not found in CatalogView")

