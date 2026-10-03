import sys

with open('src/components/player/DownloadsView.tsx', 'r') as f:
    code = f.read()

# 1. Add fuse="outline" to all FuseButtons
code = code.replace('<FuseButton\n', '<FuseButton\n              fuse="outline"\n')
code = code.replace('<FuseButton', '<FuseButton fuse="outline"')
code = code.replace('<FuseButton fuse="outline" fuse="outline"', '<FuseButton fuse="outline"')

# 2. Add "Descargando..." to the Albums list rendering
# First we find the Album card rendering
album_render = """<p className="text-white/50 text-sm mt-0.5">{group.tracks[0]?.artist || 'Varios Artistas'}</p>
                    </div>"""
new_album_render = """<p className="text-white/50 text-sm mt-0.5">{group.tracks[0]?.artist || 'Varios Artistas'}</p>
                      {downloadingAlbums?.includes(String(group.id)) && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowCancelConfirm({ id: group.id, title: group.title }); }}
                          className="text-xs text-blue-400 font-medium bg-blue-400/10 px-2 py-0.5 rounded-full hover:bg-blue-400/20 transition-colors w-fit mt-1"
                        >
                          Descargando...
                        </button>
                      )}
                    </div>"""
code = code.replace(album_render, new_album_render)

# Add it to the top album details view as well (when an album is selected)
details_render = """<div className="text-white/50 text-sm mt-1">{groupedTracks[selectedAlbumId].tracks[0]?.artist || 'Varios Artistas'} • {groupedTracks[selectedAlbumId].tracks.length} canciones</div>"""
new_details_render = """<div className="text-white/50 text-sm mt-1">{groupedTracks[selectedAlbumId].tracks[0]?.artist || 'Varios Artistas'} • {groupedTracks[selectedAlbumId].tracks.length} canciones</div>
                  {downloadingAlbums?.includes(String(selectedAlbumId)) && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowCancelConfirm({ id: selectedAlbumId, title: groupedTracks[selectedAlbumId].title }); }}
                      className="text-xs text-blue-400 font-medium bg-blue-400/10 px-3 py-1 rounded-full hover:bg-blue-400/20 transition-colors w-fit mt-3"
                    >
                      Descargando...
                    </button>
                  )}"""
code = code.replace(details_render, new_details_render)

# Add the Cancel Modal if it's missing
if 'showCancelConfirm && typeof document' not in code:
    modal_code = """{showCancelConfirm && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCancelConfirm(null)} />
          <div className="relative bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Cancelar descarga?</h3>
                <p className="text-sm text-white/60 mt-1">Se detendrá la descarga de "{showCancelConfirm.title}".</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCancelConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                Continuar descarga
              </button>
              <button onClick={() => { cancelAlbumDownload(String(showCancelConfirm.id)); setShowCancelConfirm(null); }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}"""
    # Insert before the last closing tag
    code = code.rsplit('</div>', 1)
    code = code[0] + modal_code + '\n    </div>' + code[1]

with open('src/components/player/DownloadsView.tsx', 'w') as f:
    f.write(code)

print("Restored Descargando pills, cancel modal, and outline fuses in DownloadsView.")
