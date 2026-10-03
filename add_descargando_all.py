import sys

def add_to_catalog():
    with open('src/components/player/CatalogView.tsx', 'r') as f:
        code = f.read()
    
    target = """<p className="text-white/50 text-sm mt-1">{album.artist}</p>
            </div>
          </div>"""
    
    replacement = """<p className="text-white/50 text-sm mt-1">{album.artist}</p>
              {downloadingAlbums?.includes(String(album.id)) && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(album); }}
                  className="text-xs text-blue-400 font-medium bg-blue-400/10 px-2 py-0.5 rounded-full hover:bg-blue-400/20 transition-colors w-fit mt-1"
                >
                  Descargando...
                </button>
              )}
            </div>
          </div>"""
          
    if target in code:
        code = code.replace(target, replacement)
        with open('src/components/player/CatalogView.tsx', 'w') as f:
            f.write(code)
        print("Fixed CatalogView")
    else:
        print("Target not found in CatalogView")

def add_to_artist():
    with open('src/components/player/ArtistView.tsx', 'r') as f:
        code = f.read()
        
    target = """<div className="flex items-center gap-2 mt-1">
                  <span className="text-white/50 text-sm">{album.year}</span>
                  <span className="text-white/30 text-sm">•</span>
                  <span className="text-white/50 text-sm">{album.genre}</span>
                </div>
              </div>"""
              
    replacement = """<div className="flex items-center gap-2 mt-1">
                  <span className="text-white/50 text-sm">{album.year}</span>
                  <span className="text-white/30 text-sm">•</span>
                  <span className="text-white/50 text-sm">{album.genre}</span>
                </div>
                {downloadingAlbums?.includes(String(album.id)) && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(album); }}
                    className="text-xs text-blue-400 font-medium bg-blue-400/10 px-2 py-0.5 rounded-full hover:bg-blue-400/20 transition-colors w-fit mt-1"
                  >
                    Descargando...
                  </button>
                )}
              </div>"""
              
    if target in code:
        code = code.replace(target, replacement)
        with open('src/components/player/ArtistView.tsx', 'w') as f:
            f.write(code)
        print("Fixed ArtistView")
    else:
        print("Target not found in ArtistView")

def add_to_downloads():
    with open('src/components/player/DownloadsView.tsx', 'r') as f:
        code = f.read()
        
    target = """const isDownloading = downloadingAlbums?.includes(String(album.id));
                      if (isDownloading) {
                        return (
                          <div className="mt-2 w-max px-2.5 py-1 rounded-full bg-blue-500/15 backdrop-blur-md border border-blue-500/20 flex items-center justify-center shadow-sm">
                            <span className="text-blue-400 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                              Descargando...
                            </span>
                          </div>
                        );
                      }"""
                      
    replacement = """const isDownloading = downloadingAlbums?.includes(String(album.id));
                      if (isDownloading) {
                        return (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowCancelConfirm({ id: album.id, title: album.title }); }}
                            className="mt-2 w-max px-2.5 py-1 rounded-full bg-blue-500/15 hover:bg-blue-500/25 transition-colors backdrop-blur-md border border-blue-500/20 flex items-center justify-center shadow-sm"
                          >
                            <span className="text-blue-400 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                              Descargando...
                            </span>
                          </button>
                        );
                      }"""
                      
    if target in code:
        code = code.replace(target, replacement)
        with open('src/components/player/DownloadsView.tsx', 'w') as f:
            f.write(code)
        print("Fixed DownloadsView")
    else:
        print("Target not found in DownloadsView")

add_to_catalog()
add_to_artist()
add_to_downloads()
