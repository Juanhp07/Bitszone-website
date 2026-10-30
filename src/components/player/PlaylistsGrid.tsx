import React, { useState } from 'react';
import { ListMusic, Play, MoreHorizontal, Plus, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PopoverMenu } from '../ui/PopoverMenu';
import { usePlaylists, type Playlist } from './PlaylistsContext';
import { CreatePlaylistDialog } from './CreatePlaylistDialog';
import { usePlayback } from './PlaybackContext';
import type { Album, Track } from './types';

/** Library → Listas de reproducción: your playlists shown like albums */
export const PlaylistsGrid = ({
  title,
  onOpen,
  onPlayTrack,
}: {
  title: React.ReactNode;
  onOpen: (album: Album) => void;
  onPlayTrack: (track: Track, album: Album) => void;
}) => {
  const { playlists, playlistAsAlbum, createPlaylist, renamePlaylist, deletePlaylist } = usePlaylists();
  const playback = usePlayback();
  const [menu, setMenu] = useState<{ playlist: Playlist; anchor: { x: number; y: number; x2?: number } } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const totalTracks = playlists.reduce((n, p) => n + p.tracks.length, 0);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Hero */}
      <div className="px-4 md:px-8 pt-4 md:pt-8 pb-4 md:pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-40 border-b border-white/5">
        <div className="flex items-center gap-4 md:gap-6 min-w-0 w-full md:w-auto">
          <div className="w-20 h-20 md:w-40 md:h-40 shrink-0 rounded-2xl flex items-center justify-center bg-green-500">
            <ListMusic className="w-9 h-9 md:w-16 md:h-16 text-white" />
          </div>
          <div className="flex flex-col gap-1 md:gap-2 min-w-0">
            <span className="text-white/70 text-[11px] md:text-sm font-semibold tracking-widest uppercase md:mt-2">Biblioteca</span>
            <div className="text-[24px] leading-tight md:text-4xl lg:text-5xl md:leading-none font-black text-white tracking-tight">{title}</div>
            <div className="flex items-center gap-x-2 mt-1 md:mt-2 text-white/80 font-medium text-xs md:text-sm">
              <span>{playlists.length} {playlists.length === 1 ? 'lista' : 'listas'}</span>
              <span className="text-white/30">•</span>
              <span>{totalTracks} {totalTracks === 1 ? 'canción' : 'canciones'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-black/30 hover:bg-black/40 backdrop-blur-2xl border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nueva lista
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 gap-3">
          <ListMusic className="w-12 h-12 text-white/20" aria-hidden="true" />
          <p className="text-white/70 font-semibold">Aún no tienes listas</p>
          <p className="text-white/40 text-sm max-w-sm">Usa ⋯ o clic derecho en cualquier canción y elige “Guardar en lista de reproducción”, o guarda tu cola desde el reproductor.</p>
        </div>
      ) : (
        <div className="px-4 md:px-8 py-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {playlists.map((p, i) => {
            const album = playlistAsAlbum(p);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onOpen(album)}
                onContextMenu={(e) => { e.preventDefault(); setMenu({ playlist: p, anchor: { x: e.clientX, y: e.clientY } }); }}
                className="group flex flex-col gap-3 p-3 rounded-2xl cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.4)] bg-white/5">
                  {p.tracks.length || p.cover ? (
                    <img src={album.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ListMusic className="w-10 h-10 text-white/25" aria-hidden="true" /></div>
                  )}
                  {p.tracks.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); playback.playAlbum(album); }}
                      className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#a855f7] text-white flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 [@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0 transition-all duration-300 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                      aria-label={`Reproducir ${p.name}`}
                    >
                      <Play className="w-5 h-5 ml-0.5" fill="currentColor" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <div className="flex items-start gap-2 min-w-0">
                  <div className="flex-1 min-w-0">
                    {renamingId === p.id ? (
                      <input
                        autoFocus
                        defaultValue={p.name}
                        aria-label="Nombre de la lista"
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.currentTarget.select()}
                        onBlur={(e) => { renamePlaylist(p.id, e.currentTarget.value); setRenamingId(null); }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.currentTarget.blur();
                          if (e.key === 'Escape') { e.stopPropagation(); setRenamingId(null); }
                        }}
                        className="w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-white font-semibold text-sm outline-none focus:border-purple-400/60"
                      />
                    ) : (
                      <p className="text-white font-semibold text-sm md:text-[15px] truncate">{p.name}</p>
                    )}
                    <p className="text-white/50 text-xs md:text-sm mt-0.5">{p.tracks.length} {p.tracks.length === 1 ? 'canción' : 'canciones'}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const r = e.currentTarget.getBoundingClientRect();
                      setMenu({ playlist: p, anchor: { x: r.left, y: r.bottom + 6, x2: r.right } });
                    }}
                    className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
                    aria-label={`Más opciones para ${p.name}`}
                  >
                    <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <CreatePlaylistDialog open={creating} onClose={() => setCreating(false)} onCreate={(name, cover) => createPlaylist([], name, cover)} />

      <PopoverMenu
        open={!!menu}
        anchor={menu?.anchor ?? null}
        width={220}
        onClose={() => setMenu(null)}
        items={menu ? [
          ...(menu.playlist.tracks.length ? [{ label: 'Reproducir', icon: <Play className="w-4 h-4" />, onSelect: () => playback.playAlbum(playlistAsAlbum(menu.playlist)) }] : []),
          { label: 'Cambiar nombre', icon: <Pencil className="w-4 h-4" />, onSelect: () => setRenamingId(menu.playlist.id) },
          { label: 'Eliminar lista', icon: <Trash2 className="w-4 h-4" />, danger: true, onSelect: () => deletePlaylist(menu.playlist.id) },
        ] : []}
      />
    </div>
  );
};
