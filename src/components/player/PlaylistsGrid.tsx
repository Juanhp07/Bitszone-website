import React, { useState } from 'react';
import { ListMusic, Play, MoreHorizontal, Plus, Pencil, Trash2, Music2, Disc3, ListChecks, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { PopoverMenu } from '../ui/PopoverMenu';
import { usePlaylists, type Playlist } from './PlaylistsContext';
import { CreatePlaylistDialog } from './CreatePlaylistDialog';
import { SectionHero, SectionEmpty } from '../ui/SectionHero';
import { SelectableCard } from '../ui/SelectableCard';
import { SelectionBar } from '../ui/SelectionBar';
import { ConfirmDialog } from '../ui/ConfirmDialog';
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
  const { playlists, playlistAsAlbum, createPlaylist, renamePlaylist, deletePlaylist, deletePlaylists, reorderPlaylists } = usePlaylists();
  const playback = usePlayback();
  const [menu, setMenu] = useState<{ playlist: Playlist; anchor: { x: number; y: number; x2?: number } } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  // edit mode (like the iOS home screen): select lists with checks, delete them, or drag them into your own order
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const exitEditing = () => { setEditing(false); setSelected(new Set()); setDragId(null); };
  const toggleSelected = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const movePlaylist = (fromId: string, toId: string) => {
    const ids = playlists.map((p) => p.id);
    const from = ids.indexOf(fromId), to = ids.indexOf(toId);
    if (from < 0 || to < 0 || from === to) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    reorderPlaylists(ids);
  };
  const deleteSelected = () => { deletePlaylists([...selected]); setConfirmDelete(false); exitEditing(); };

  const totalTracks = playlists.reduce((n, p) => n + p.tracks.length, 0);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Hero */}
      <SectionHero
        type="playlists"
        icon={ListMusic}
        kicker="Biblioteca"
        title={title}
        stats={[
          { icon: <ListMusic className="w-3.5 h-3.5" aria-hidden="true" />, text: `${playlists.length} ${playlists.length === 1 ? 'lista' : 'listas'}` },
          { icon: <Music2 className="w-3.5 h-3.5" aria-hidden="true" />, text: `${totalTracks} ${totalTracks === 1 ? 'canción' : 'canciones'}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
          {playlists.length > 0 && (editing ? (
            <SelectionBar
              count={selected.size}
              total={playlists.length}
              noun="listas"
              onSelectAll={() => setSelected(new Set(playlists.map((p) => p.id)))}
              onClearSelection={() => setSelected(new Set())}
              onDelete={() => setConfirmDelete(true)}
              onDone={exitEditing}
            />
          ) : (
            <button
              onClick={() => (editing ? exitEditing() : setEditing(true))}
              className={`flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold backdrop-blur-xl transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer ${editing ? 'bg-white text-black hover:bg-white/90' : 'text-white bg-white/[0.09] hover:bg-white/[0.17]'}`}
            >
              <ListChecks className="w-4 h-4" aria-hidden="true" />
              Seleccionar
            </button>
          ))}
          {!editing && <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold text-white bg-white/[0.09] hover:bg-white/[0.17] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Nueva lista
          </button>}
          </div>
        }
      />

      {playlists.length === 0 ? (
        <SectionEmpty
          type="playlists"
          icon={ListMusic}
          title="Aún no tienes listas"
          text="Crea una con “Nueva lista”, o usa ⋯ en cualquier canción y elige “Guardar en lista de reproducción”."
        />
      ) : (
        <div className="px-4 md:px-8 py-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {playlists.map((p, i) => {
            const album = playlistAsAlbum(p);
            return (
              <SelectableCard
                key={p.id}
                id={p.id}
                index={i}
                editing={editing}
                selected={selected.has(p.id)}
                dragging={dragId === p.id}
                label={p.name}
                onToggle={toggleSelected}
                onEnterEdit={(id) => { setEditing(true); setSelected(new Set([id])); }}
                onDragStartId={setDragId}
                onDragOverId={(id) => { if (dragId && dragId !== id) movePlaylist(dragId, id); }}
                onDragEndId={() => setDragId(null)}
              >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onOpen(album)}
                onContextMenu={(e) => { e.preventDefault(); setMenu({ playlist: p, anchor: { x: e.clientX, y: e.clientY } }); }}
                className="group flex flex-col gap-3 p-3 rounded-3xl cursor-pointer hover:bg-white/[0.06] hover:-translate-y-1 transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] bg-white/5">
                  {p.tracks.length || p.cover ? (
                    <img src={album.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ListMusic className="w-10 h-10 text-white/25" aria-hidden="true" /></div>
                  )}
                  {p.tracks.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); playback.playAlbum(album); }}
                      className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-2xl text-white flex items-center justify-center shadow-[0_10px_28px_rgba(0,0,0,0.4)] opacity-0 scale-75 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 [@media(hover:none)]:opacity-100 [@media(hover:none)]:scale-100 [@media(hover:none)]:translate-y-0 transition-[opacity,transform,background-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
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
              </SelectableCard>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={`¿Eliminar ${selected.size} ${selected.size === 1 ? 'lista' : 'listas'}?`}
        text="Las canciones no se borran de tu biblioteca, solo las listas. Esto no se puede deshacer."
        confirmLabel="Sí, eliminar"
        onConfirm={deleteSelected}
        onCancel={() => setConfirmDelete(false)}
      />

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
