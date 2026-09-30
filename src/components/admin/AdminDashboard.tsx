import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCog, 
  Disc3, 
  Plus, 
  ArrowLeft, 
  ExternalLink, 
  Sparkles, 
  X, 
  UploadCloud, 
  CheckCircle2, 
  Radio
} from 'lucide-react';

export const AdminDashboard = () => {
  const [activeModal, setActiveModal] = useState<'catalog' | 'release' | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form states for "Nuevo Lanzamiento"
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Pop / Alternativo');

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    setNotification(`¡Lanzamiento "${title || 'Pista de prueba'}" registrado para revisión en Supabase!`);
    setTitle('');
    setArtist('');
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="relative z-10 max-w-2xl w-full">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-3 text-white text-sm shadow-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(85, 16, 141, 0.9) 0%, rgba(34, 4, 91, 0.9) 100%)",
              border: "1px solid rgba(222, 183, 255, 0.3)",
              backdropFilter: "blur(20px) saturate(180%)",
              boxShadow: "0 10px 30px rgba(168, 85, 247, 0.3)"
            }}
          >
            <CheckCircle2 className="w-5 h-5 text-[#deb7ff]" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
        className="w-full rounded-[2.5rem] p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(20, 20, 28, 0.75) 0%, rgba(14, 15, 23, 0.85) 100%)",
          border: "1px solid rgba(216, 180, 254, 0.15)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)"
        }}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#deb7ff]/50 to-transparent" />
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-purple-600/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-blue-600/20 rounded-full blur-[60px] pointer-events-none" />

        {/* Header Icon */}
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-[#55108d] to-[#deb7ff]/60 mb-6 shadow-xl shadow-purple-600/25 border border-white/20">
          <UserCog className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl md:text-4xl font-sora font-bold text-white mb-3 tracking-tight">
          Panel de Administración
        </h1>
        
        <p className="text-[#cec2d3] mb-8 text-base md:text-lg max-w-lg leading-relaxed">
          Centro de control de <span className="text-white font-medium">BitsZone</span>. Administra tu catálogo musical, supervisa pistas offline y sincroniza nuevos lanzamientos.
        </p>

        {/* ACTION BUTTONS (Highlighted) */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          
          {/* BOTÓN 1: Gestionar Catálogo */}
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal('catalog')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-sora font-semibold text-white flex items-center justify-center gap-2.5 shadow-lg group relative overflow-hidden transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(85, 16, 141, 0.45) 100%)",
              border: "1px solid rgba(222, 183, 255, 0.3)",
              boxShadow: "0 10px 25px -5px rgba(168, 85, 247, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(20px)"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Disc3 className="w-5 h-5 text-[#deb7ff] group-hover:rotate-180 transition-transform duration-700 ease-out" />
            <span>Gestionar Catálogo</span>
          </motion.button>

          {/* BOTÓN 2: Nuevo Lanzamiento */}
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal('release')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-sora font-semibold text-white flex items-center justify-center gap-2.5 shadow-lg group relative overflow-hidden transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(255, 159, 252, 0.2) 0%, rgba(138, 61, 198, 0.4) 100%)",
              border: "1px solid rgba(255, 159, 252, 0.3)",
              boxShadow: "0 10px 25px -5px rgba(255, 159, 252, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(20px)"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Plus className="w-5 h-5 text-[#FF9FFC] group-hover:scale-110 transition-transform duration-300" />
            <span>Nuevo Lanzamiento</span>
          </motion.button>

        </div>

        {/* SECONDARY NAVIGATION BUTTONS */}
        <div className="w-full pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium">
          <a 
            href="/login" 
            className="flex items-center gap-2 text-[#cec2d3] hover:text-white transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Login</span>
          </a>

          <a 
            href="/player" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#deb7ff] hover:text-white transition-colors duration-200 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <Radio className="w-4 h-4 text-[#deb7ff]" />
            <span>Abrir Web Player</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>

      </motion.div>

      {/* MODAL: Gestionar Catálogo */}
      <AnimatePresence>
        {activeModal === 'catalog' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl p-6 md:p-8 text-left text-white shadow-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(25, 25, 35, 0.95) 0%, rgba(14, 15, 23, 0.98) 100%)",
                border: "1px solid rgba(222, 183, 255, 0.2)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(168, 85, 247, 0.2)"
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-[#deb7ff] border border-purple-500/30">
                    <Disc3 className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-sora font-semibold">Estado del Catálogo</h3>
                    <p className="text-xs text-[#cec2d3]">Base de datos Supabase & Pistas Offline</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6 font-inter text-sm">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-300">Conexión Supabase</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    En Línea
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-300">Colección de Álbumes</span>
                  <span className="text-white font-semibold">Thriller, Linkin Park, Post Malone...</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-gray-300">Sincronización Offline</span>
                  <span className="text-[#deb7ff] font-semibold">IndexedDB Habilitado</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setNotification("¡Catálogo sincronizado exitosamente con Supabase!");
                    setTimeout(() => setNotification(null), 4000);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-md shadow-purple-600/30"
                >
                  Forzar Sincronización
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Nuevo Lanzamiento */}
      <AnimatePresence>
        {activeModal === 'release' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl p-6 md:p-8 text-left text-white shadow-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(25, 25, 35, 0.95) 0%, rgba(14, 15, 23, 0.98) 100%)",
                border: "1px solid rgba(255, 159, 252, 0.25)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 159, 252, 0.15)"
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-pink-500/20 text-[#FF9FFC] border border-pink-500/30">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-sora font-semibold">Registrar Lanzamiento</h3>
                    <p className="text-xs text-[#cec2d3]">Subir nuevo álbum o sencillo a BitsZone</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSimulateSubmit} className="space-y-4 font-inter text-sm">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Título de la pista o álbum
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Liquid Beats Vol. 1"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#deb7ff] focus:ring-1 focus:ring-[#deb7ff] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Artista o Grupo
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. J3T & JuanHP"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#deb7ff] focus:ring-1 focus:ring-[#deb7ff] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Género Principal
                  </label>
                  <select 
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a24] border border-white/10 text-white focus:outline-none focus:border-[#deb7ff] transition-all"
                  >
                    <option value="Pop / Alternativo">Pop / Alternativo</option>
                    <option value="Rock / Metal">Rock / Metal</option>
                    <option value="Salsa / Tropical">Salsa / Tropical</option>
                    <option value="Electrónica / Synth">Electrónica / Synth</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#deb7ff]/50 transition-colors">
                  <UploadCloud className="w-8 h-8 text-[#deb7ff] mb-2" />
                  <p className="text-xs text-gray-300">Arrastra la carátula o audio aquí</p>
                  <span className="text-[10px] text-gray-500 mt-0.5">Soporta MP3, FLAC, JPG, PNG hasta 100MB</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm transition-all shadow-md shadow-purple-600/30"
                  >
                    Registrar Pista
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
