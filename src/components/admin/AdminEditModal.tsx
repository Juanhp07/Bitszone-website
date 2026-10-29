import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  UploadCloud,
  FileImage,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { useAdminEdit, type EditTarget } from './AdminEditContext';

export const AdminEditModal: React.FC = () => {
  const { 
    activeEditTarget, 
    closeEditModal, 
    saveAlbumOverride, 
    saveTrackOverride, 
    saveArtistOverride, 
    saveButtonOverride, 
    resetButtonOverride,
    uploadCoverFile 
  } = useAdminEdit();

  // Form states
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [previewError, setPreviewError] = useState(false);
  
  // Local image upload states
  const [imageSourceMode, setImageSourceMode] = useState<'local' | 'url'>('local');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saving & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState<string>('Guardando...');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize form fields when target changes
  useEffect(() => {
    if (!activeEditTarget) return;

    setPreviewError(false);
    setSelectedFile(null);
    setLocalPreviewUrl(null);
    setImageSourceMode('local');

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

  // Clean up local preview URL
  useEffect(() => {
    return () => {
      if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

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

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      alert('La imagen seleccionada supera el límite recomendado de 12 MB.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setPreviewError(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSavingStatus('Guardando cambios...');

    try {
      let finalCoverUrl = coverUrl.trim();

      // If a local image was picked, upload it to Supabase Storage first!
      if (selectedFile) {
        setSavingStatus('Subiendo imagen a Supabase...');
        const prefix = title.trim() || 'cover';
        const { url, error } = await uploadCoverFile(selectedFile, prefix);
        if (url) {
          finalCoverUrl = url;
        }
        if (error) {
          console.warn('Storage notice:', error);
        }
      }

      setSavingStatus('Sincronizando en tiempo real con Supabase...');

      if (activeEditTarget.type === 'album' || activeEditTarget.type === 'cover') {
        await saveAlbumOverride(activeEditTarget.album.id, {
          title: title.trim() || activeEditTarget.album.title,
          artist: artist.trim() || activeEditTarget.album.artist,
          coverUrl: finalCoverUrl || activeEditTarget.album.coverUrl,
        });
        showToast('¡Álbum y portada guardados permanentemente para todos!');
      } else if (activeEditTarget.type === 'track') {
        await saveTrackOverride(activeEditTarget.track.id, {
          title: title.trim() || activeEditTarget.track.title,
          artist: artist.trim() || activeEditTarget.track.artist,
          albumCover: finalCoverUrl || activeEditTarget.track.albumCover,
        });
        showToast('¡Canción guardada y transmitida en vivo!');
      } else if (activeEditTarget.type === 'artist') {
        await saveArtistOverride(activeEditTarget.artist.name, {
          name: title.trim() || activeEditTarget.artist.name,
          img: finalCoverUrl || activeEditTarget.artist.img,
        });
        showToast('¡Artista guardado y transmitido en vivo!');
      } else if (activeEditTarget.type === 'button') {
        await saveButtonOverride(activeEditTarget.key, buttonText.trim() || activeEditTarget.defaultLabel);
        showToast('¡Texto del botón guardado para todos los usuarios!');
      }

      setTimeout(() => {
        setIsSaving(false);
        closeEditModal();
      }, 400);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetButton = () => {
    if (activeEditTarget.type === 'button') {
      resetButtonOverride(activeEditTarget.key);
      setButtonText(activeEditTarget.defaultLabel);
      showToast('¡Botón restablecido a su texto original!');
      setTimeout(() => closeEditModal(), 400);
    }
  };

  // Current preview image to show
  const activePreviewImage = localPreviewUrl || coverUrl;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md">
        
        {/* Subtle toast */}
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[130] px-6 py-3 rounded-2xl bg-[#1e1035] border border-purple-400/40 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 backdrop-blur-xl"
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
          className="relative w-full max-w-lg rounded-3xl bg-[#0f0b1a] border border-white/15 p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.85)] text-white overflow-hidden max-h-[92vh] overflow-y-auto scrollbar-hide"
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
                  Cambio global permanente en Supabase con transmisión en vivo.
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
                    Texto del botón para todos los usuarios:
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

                {/* Cover Image Selector: Local Image vs URL */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-white/70">
                      Portada de la música:
                    </label>

                    {/* Segmented Mode Switch */}
                    <div className="p-0.5 rounded-lg bg-black/60 border border-white/10 flex items-center text-[11px]">
                      <button
                        type="button"
                        onClick={() => setImageSourceMode('local')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          imageSourceMode === 'local'
                            ? 'bg-[#8a3aed] text-white font-semibold'
                            : 'text-white/50 hover:text-white'
                        }`}
                      >
                        <UploadCloud className="w-3 h-3" />
                        <span>Subir Archivo Local</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImageSourceMode('url')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          imageSourceMode === 'url'
                            ? 'bg-[#8a3aed] text-white font-semibold'
                            : 'text-white/50 hover:text-white'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Enlace URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode: LOCAL FILE UPLOAD (Drag & Drop or Picker) */}
                  {imageSourceMode === 'local' ? (
                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelect(e.target.files[0]);
                          }
                        }}
                      />

                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                          isDragging
                            ? 'border-[#8a3aed] bg-purple-500/15'
                            : selectedFile
                            ? 'border-purple-400/50 bg-white/[0.04]'
                            : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30'
                        }`}
                      >
                        {selectedFile ? (
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/20 shrink-0">
                              {localPreviewUrl && (
                                <img src={localPreviewUrl} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-xs font-bold text-white truncate">
                                {selectedFile.name}
                              </span>
                              <span className="text-[11px] text-white/50">
                                {(selectedFile.size / 1024).toFixed(1)} KB • Listo para guardar en Supabase
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                                setLocalPreviewUrl(null);
                              }}
                              className="text-xs text-purple-300 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10"
                            >
                              Cambiar
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-semibold text-white">
                                Haz clic para elegir una imagen o arrástrala aquí
                              </p>
                              <p className="text-[11px] text-white/40 mt-0.5">
                                PNG, JPG, WEBP o SVG (Se subirá a Supabase Storage)
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Mode: URL */
                    <input
                      type="url"
                      value={coverUrl}
                      onChange={(e) => {
                        setCoverUrl(e.target.value);
                        setSelectedFile(null);
                        setLocalPreviewUrl(null);
                        setPreviewError(false);
                      }}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 transition-all font-mono text-xs"
                    />
                  )}
                </div>

                {/* Real-time Cover Preview */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/50 border border-white/15 shrink-0 relative flex items-center justify-center">
                    {activePreviewImage && !previewError ? (
                      <img
                        src={activePreviewImage}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                        onError={() => setPreviewError(true)}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-white/30" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-purple-300" />
                      <span>Vista previa en vivo</span>
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

                {/* Photo Source Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-white/70">
                      Foto del artista:
                    </label>

                    <div className="p-0.5 rounded-lg bg-black/60 border border-white/10 flex items-center text-[11px]">
                      <button
                        type="button"
                        onClick={() => setImageSourceMode('local')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          imageSourceMode === 'local'
                            ? 'bg-[#8a3aed] text-white font-semibold'
                            : 'text-white/50 hover:text-white'
                        }`}
                      >
                        <UploadCloud className="w-3 h-3" />
                        <span>Subir Foto Local</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImageSourceMode('url')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          imageSourceMode === 'url'
                            ? 'bg-[#8a3aed] text-white font-semibold'
                            : 'text-white/50 hover:text-white'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>URL</span>
                      </button>
                    </div>
                  </div>

                  {imageSourceMode === 'local' ? (
                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelect(e.target.files[0]);
                          }
                        }}
                      />

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-4 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center gap-3 cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                          {localPreviewUrl ? (
                            <img src={localPreviewUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UploadCloud className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-bold text-white truncate">
                            {selectedFile ? selectedFile.name : 'Subir foto del artista desde este equipo'}
                          </span>
                          <span className="text-[11px] text-white/40">
                            {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Haz clic para explorar imágenes'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={coverUrl}
                      onChange={(e) => {
                        setCoverUrl(e.target.value);
                        setSelectedFile(null);
                        setLocalPreviewUrl(null);
                        setPreviewError(false);
                      }}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400 transition-all font-mono text-xs"
                    />
                  )}
                </div>

                {/* Circular preview */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-black/50 border border-white/15 shrink-0 relative flex items-center justify-center">
                    {activePreviewImage && !previewError ? (
                      <img
                        src={activePreviewImage}
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
                className="px-6 py-2.5 rounded-xl bg-[#8a3aed] hover:bg-[#7b2fdf] active:scale-[0.98] text-white text-xs font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{savingStatus}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Guardar y Publicar para Todos</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
