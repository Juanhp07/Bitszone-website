import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Pencil, 
  Image as ImageIcon, 
  Disc3, 
  User, 
  Music, 
  Type, 
  RotateCcw, 
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useAdminEdit, type EditTarget } from './AdminEditContext';

export const AdminEditModal: React.FC = () => {
  const { activeEditTarget, closeEditModal, saveAlbumOverride, saveTrackOverride, saveArtistOverride, saveButtonOverride, resetButtonOverride } = useAdminEdit();

  // Form states
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize form fields when target changes
  useEffect(() => {
    if (!activeEditTarget) return;

    setPreviewError(false);
    if (activeEditTarget.type === 'album' || activeEditTarget.type === 'cover') {
      setTitle(activeEditTarget.album.title || '');
      setArtist(activeEditTarget.album.artist || '');
      setCoverUrl(activeEditTarget.album.coverUrl || '');
    } else if (activeEditTarget.type === 'track') {
      setTitle(activeEditTarget.track.title || '');
      setArtist(activeEditTarget.track.artist || '');
      setCoverUrl(activeEditTarget.track.albumCover || activeEditTarget.album?.coverUrl || '');
    } else if (activeEditTarget.type === 'artist') {
      setTitle(activeEditTarget.artist.name || '');
      setCoverUrl(activeEditTarget.artist.img || '');
    } else if (activeEditTarget.type === 'button') {
      setButtonText(activeEditTarget.label || '');
    }
  }, [activeEditTarget]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeEditTarget) {
        closeEditModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeEditTarget, closeEditModal]);

  if (!activeEditTarget) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      if (activeEditTarget.type === 'album' || activeEditTarget.type === 'cover') {
        await saveAlbumOverride(activeEditTarget.album.id, {
          title: title.trim() || activeEditTarget.album.title,
          artist: artist.trim() || activeEditTarget.album.artist,
          coverUrl: coverUrl.trim() || activeEditTarget.album.coverUrl,
        });
        showToast('¡Álbum y portada actualizados con éxito!');
      } else if (activeEditTarget.type === 'track') {
        await saveTrackOverride(activeEditTarget.track.id, {
          title: title.trim() || activeEditTarget.track.title,
          artist: artist.trim() || activeEditTarget.track.artist,
          albumCover: coverUrl.trim() || activeEditTarget.track.albumCover,
        });
        showToast('¡Canción actualizada con éxito!');
      } else if (activeEditTarget.type === 'artist') {
        await saveArtistOverride(activeEditTarget.artist.name, {
          name: title.trim() || activeEditTarget.artist.name,
          img: coverUrl.trim() || activeEditTarget.artist.img,
        });
        showToast('¡Artista actualizado con éxito!');
      } else if (activeEditTarget.type === 'button') {
        saveButtonOverride(activeEditTarget.key, buttonText.trim() || activeEditTarget.defaultLabel);
        showToast('¡Texto del botón actualizado con éxito!');
      }

      setTimeout(() => {
        setIsSaving(false);
        closeEditModal();
      }, 350);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleResetButton = () => {
    if (activeEditTarget.type === 'button') {
      resetButtonOverride(activeEditTarget.key);
      setButtonText(activeEditTarget.defaultLabel);
      showToast('¡Botón restablecido a su texto original!');
      setTimeout(() => closeEditModal(), 400);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md">
        
        {/* Subtle toast */}
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[130] px-5 py-2.5 rounded-2xl bg-[#1e1035] border border-purple-400/40 text-white text-xs font-semibold shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-purple-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-lg rounded-3xl bg-[#0f0b1a] border border-white/15 p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.85)] text-white overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#8a3aed] flex items-center justify-center text-white shadow-lg shadow-purple-600/30 shrink-0">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-sora tracking-tight text-white flex items-center gap-2">
                  {activeEditTarget.type === 'album' && 'Editar Álbum & Portada'}
                  {activeEditTarget.type === 'cover' && 'Editar Portada'}
                  {activeEditTarget.type === 'artist' && 'Editar Artista'}
                  {activeEditTarget.type === 'track' && 'Editar Canción'}
                  {activeEditTarget.type === 'button' && 'Editar Texto del Botón'}
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                    Admin
                  </span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Los cambios se aplican de inmediato en la aplicación.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeEditModal}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            {/* BUTTON EDIT FORM */}
            {activeEditTarget.type === 'button' && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">
                    Texto del botón:
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder={activeEditTarget.defaultLabel}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 transition-all font-medium"
                    autoFocus
                  />
                  <div className="flex items-center justify-between text-[11px] text-white/40 mt-1.5">
                    <span>Original: "{activeEditTarget.defaultLabel}"</span>
                    {buttonText !== activeEditTarget.defaultLabel && (
                      <button
                        type="button"
                        onClick={handleResetButton}
                        className="text-purple-300 hover:text-purple-200 underline cursor-pointer"
                      >
                        Restablecer original
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview pill */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-white/40">
                    Vista Previa del Botón
                  </span>
                  <div className="flex items-center">
                    <div className="px-5 py-2.5 rounded-xl bg-[#8a3aed] text-white text-xs font-semibold shadow-md flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                      <span>{buttonText || activeEditTarget.defaultLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ALBUM / COVER / TRACK / ARTIST EDIT FORM */}
            {(activeEditTarget.type === 'album' || activeEditTarget.type === 'cover' || activeEditTarget.type === 'track') && (
              <div className="flex flex-col gap-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">
                    {activeEditTarget.type === 'track' ? 'Título de la canción:' : 'Nombre del álbum:'}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={activeEditTarget.type === 'track' ? activeEditTarget.track.title : activeEditTarget.album.title}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 transition-all"
                  />
                </div>

                {/* Artist */}
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">
                    Nombre del artista:
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder={activeEditTarget.type === 'track' ? activeEditTarget.track.artist : activeEditTarget.album.artist}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 transition-all"
                  />
                </div>

                {/* Cover URL */}
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5 flex items-center justify-between">
                    <span>URL de la portada (Imagen):</span>
                    {coverUrl && (
                      <a
                        href={coverUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-purple-300 hover:text-purple-200 inline-flex items-center gap-1"
                      >
                        <span>Abrir enlace</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => {
                      setCoverUrl(e.target.value);
                      setPreviewError(false);
                    }}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 transition-all font-mono text-xs"
                  />
                </div>

                {/* Real-time Cover Preview */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/50 border border-white/15 shrink-0 relative flex items-center justify-center">
                    {coverUrl && !previewError ? (
                      <img
                        src={coverUrl}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                        onError={() => setPreviewError(true)}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-white/30" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300">
                      Vista previa en tiempo real
                    </span>
                    <span className="text-sm font-bold text-white truncate">
                      {title || 'Sin título'}
                    </span>
                    <span className="text-xs text-white/50 truncate">
                      {artist || 'Artista'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ARTIST EDIT FORM */}
            {activeEditTarget.type === 'artist' && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">
                    Nombre del artista:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={activeEditTarget.artist.name}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">
                    URL de la foto del artista:
                  </label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => {
                      setCoverUrl(e.target.value);
                      setPreviewError(false);
                    }}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 transition-all font-mono text-xs"
                  />
                </div>

                {/* Circular preview */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-black/50 border border-white/15 shrink-0 relative flex items-center justify-center">
                    {coverUrl && !previewError ? (
                      <img
                        src={coverUrl}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                        onError={() => setPreviewError(true)}
                      />
                    ) : (
                      <User className="w-6 h-6 text-white/30" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300">
                      Foto de Perfil del Artista
                    </span>
                    <span className="text-sm font-bold text-white truncate">
                      {title || activeEditTarget.artist.name}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#8a3aed] hover:bg-[#7b2fdf] active:scale-[0.98] text-white text-xs font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar cambios'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
