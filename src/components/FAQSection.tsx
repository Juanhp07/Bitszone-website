import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MagneticSelect } from './ui/MagneticSelect';

/*
 * Sección 4 — FAQ.
 * Izquierda: el clúster magnético de 7 bolitas es el selector (una bolita = una pregunta).
 * Derecha: el visor muestra la pregunta activa con un contador y una barra
 * de progreso segmentada. Mientras nadie interactúa, el visor avanza solo (la barra activa
 * se llena y pasa a la siguiente); al primer clic, tecla o hover sobre el visor se detiene.
 * ← / → navegan cuando el foco está dentro de la sección.
 */

// Paleta de la marca: del índigo #5227FF al rosa #FF9FFC pasando por los violetas.
const faqs = [
  {
    question: '¿Qué es Bitszone y en qué se diferencia?',
    answer: 'Bitszone es un reproductor web pensado para escuchar sin conexión. Descargas canciones o álbumes completos a tu equipo y los reproduces aunque no tengas internet, sin depender de la caché del navegador.',
    color: '#5227FF',
  },
  {
    question: '¿Cómo funcionan las descargas?',
    answer: 'Eliges una canción o un álbum y entra en la cola de descargas, que trabaja en segundo plano mientras sigues escuchando. Cuando termina, la pista queda marcada como disponible offline.',
    color: '#6D3BFF',
  },
  {
    question: '¿Mis descargas caducan?',
    answer: 'Cada descarga tiene una licencia de 30 días. Unos días antes de que expire te avisamos con una notificación, y si escuchas una canción cinco veces seguidas se guarda sola en tus licencias.',
    color: '#8B5CF6',
  },
  {
    question: '¿Cuánto espacio puedo usar?',
    answer: 'Tienes hasta 5 GB para tu biblioteca offline. El panel de almacenamiento te muestra cuánto ocupa cada álbum y puedes liberar espacio cuando quieras, sin que la app borre nada por su cuenta.',
    color: '#A855F7',
  },
  {
    question: '¿Qué pasa si pierdo la conexión mientras escucho?',
    answer: 'Nada. Bitszone detecta que te quedaste sin señal y cambia a tu biblioteca offline sin detener la canción ni provocar saltos de audio.',
    color: '#C084FC',
  },
  {
    question: '¿Cómo sé qué canciones tengo descargadas?',
    answer: 'La interfaz marca al instante qué pistas están listas para escucharse offline y cuáles siguen en la nube, así no te llevas sorpresas cuando no tienes internet.',
    color: '#E28FF8',
  },
  {
    question: '¿Puedo controlar el reproductor con el teclado?',
    answer: 'Sí. Espacio reproduce o pausa, las flechas cambian de canción y ajustan el volumen, L abre las letras, F activa el modo inmersivo y S guarda en favoritos. Todos están en el menú Atajos.',
    color: '#FF9FFC',
  },
];

const AUTO_MS = 9000;
const pad = (n: number) => String(n).padStart(2, '0');

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [auto, setAuto] = useState(true);       // auto-advance until the first interaction
  const [paused, setPaused] = useState(false);  // pointer resting on the viewer
  const containerRef = useRef<HTMLElement>(null);
  const inView = useInView(containerRef, { amount: 0.4 });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setAuto(false);
  }, []);

  // Animación de transición basada en el scroll - VOLANDO HACIA LA CÁMARA
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start 95%', 'end 5%'] });
  const headerY = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [150, 0, 0, -350]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const headerScale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.85]);
  const cardsY = useTransform(scrollYProgress, [0.1, 0.4, 0.6, 1], [250, 0, 0, -150]);
  const cardsOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const cardsScale = useTransform(scrollYProgress, [0.1, 0.4, 0.6, 1], [0.5, 1, 1, 0.9]);

  const go = (i: number, byUser = true) => {
    if (byUser) setAuto(false);
    setOpenIndex((i + faqs.length) % faqs.length);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(openIndex + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(openIndex - 1); }
  };

  const running = auto && inView && !paused;
  const current = faqs[openIndex];

  return (
    <section
      id="faq"
      ref={containerRef}
      onKeyDown={onKeyDown}
      className="py-24 lg:py-32 px-6 w-full relative min-h-screen flex items-center justify-center"
    >
      <style>{CSS}</style>

      <div className="w-full max-w-[1400px] relative z-10">
        {/* Encabezado */}
        <motion.div
          style={{ y: headerY, opacity: headerOpacity, scale: headerScale }}
          className="text-center w-full mb-16 lg:mb-24 flex flex-col items-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-sora font-extrabold tracking-tighter text-white leading-[1.05]">
            Tu música.<br />
            <span className="faq-shimmer text-transparent bg-clip-text inline-block mt-2 pb-1">Nuestras respuestas.</span>
          </h2>
          <p className="mt-6 text-[15px] md:text-[17px] text-[#a1a1aa] font-inter max-w-[52ch]">
            Toca una bolita para ver su respuesta, o deja que avancen solas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full">
          {/* Selector: clúster magnético */}
          <motion.div
            style={{ y: cardsY, opacity: cardsOpacity, scale: cardsScale }}
            className="col-span-1 lg:col-span-5 relative px-6 py-10 flex flex-col items-center justify-center min-h-[400px] sm:min-h-[460px] lg:min-h-[560px]"
          >
            <h3 className="font-jetbrains text-xs font-bold tracking-[0.2em] text-white/30 uppercase absolute top-6 lg:top-10 text-center">
              Selecciona una pregunta
            </h3>

            {/* Halo del color activo detrás del clúster */}
            <motion.div
              aria-hidden="true"
              className="absolute w-[340px] h-[340px] rounded-full pointer-events-none"
              animate={{ background: `radial-gradient(circle, ${current.color}40 0%, transparent 65%)` }}
              transition={{ duration: 0.8 }}
              style={{ filter: 'blur(30px)' }}
            />

            <div className="relative z-20 scale-[1.6] sm:scale-[1.8] lg:scale-[2.1] transition-transform duration-500 hover:scale-[1.7] sm:hover:scale-[1.9] lg:hover:scale-[2.2]">
              <MagneticSelect
                items={faqs.map(f => ({ color: f.color, label: f.question }))}
                selectedIndex={openIndex}
                onSelect={(idx) => { if (idx !== null) go(idx); }}
                accentTo="#FF9FFC"
                pull={55}
                give={50}
                bounce={55}
              />
            </div>
          </motion.div>

          {/* Visor de respuestas */}
          <motion.div
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            className="col-span-1 lg:col-span-7 relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] flex flex-col min-h-[460px] lg:min-h-[560px]"
            style={{
              y: cardsY,
              opacity: cardsOpacity,
              scale: cardsScale,
              background: 'rgba(12, 8, 20, 0.45)',
              backdropFilter: 'blur(48px)',
              WebkitBackdropFilter: 'blur(48px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8), inset 0 1px 0px rgba(255,255,255,0.05)',
            }}
          >
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="p-8 sm:p-10 lg:p-14 flex-grow flex flex-col relative z-10">
              {/* Barra de progreso segmentada (también navega) */}
              <div className="flex items-center gap-1.5 mb-10" role="tablist" aria-label="Preguntas">
                {faqs.map((f, i) => {
                  const isOn = i === openIndex;
                  return (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={isOn}
                      aria-label={`Pregunta ${i + 1}`}
                      onClick={() => go(i)}
                      className="group/seg flex-1 py-2 cursor-pointer"
                    >
                      <span className="block h-[3px] rounded-full bg-white/10 overflow-hidden group-hover/seg:bg-white/20 transition-colors">
                        <span
                          key={isOn ? `on-${openIndex}` : `off-${i}`}
                          className={`block h-full rounded-full ${isOn && auto ? 'faq-fill' : ''}`}
                          style={{
                            background: `linear-gradient(90deg, ${f.color}, #FF9FFC)`,
                            width: isOn && auto ? undefined : isOn ? '100%' : i < openIndex ? '100%' : '0%',
                            opacity: isOn ? 1 : 0.35,
                            animationDuration: `${AUTO_MS}ms`,
                            animationPlayState: running ? 'running' : 'paused',
                          }}
                          onAnimationEnd={() => { if (auto) go(openIndex + 1, false); }}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={openIndex}
                  initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -20, filter: 'blur(8px)', transition: { duration: 0.2 } }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full flex flex-col flex-grow"
                >
                  {/* Bolita activa + categoría + contador */}
                  <div className="flex items-center justify-between w-full mb-10">
                    <div className="flex items-center gap-4">
                      <motion.div
                        initial={{ x: -200, scale: 0.5, opacity: 0 }}
                        animate={{ x: 0, scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25, delay: 0.1 }}
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${current.color}, #FF9FFC)`,
                          boxShadow: `0 10px 25px ${current.color}90, inset 0 2px 4px rgba(255,255,255,0.3)`,
                        }}
                      >
                        <span className="font-sora font-bold text-white text-[15px]">{openIndex + 1}</span>
                      </motion.div>
                    </div>
                    <span className="font-jetbrains text-xs tracking-[0.2em] text-white/30">
                      {pad(openIndex + 1)} <span className="text-white/15">/ {pad(faqs.length)}</span>
                    </span>
                  </div>

                  {/* Pregunta y respuesta */}
                  <div className="flex-grow flex flex-col justify-center">
                    <h3 className="text-[1.75rem] md:text-4xl lg:text-[2.6rem] font-sora font-semibold text-white leading-[1.18] tracking-tight mb-7">
                      {current.question}
                    </h3>
                    <p className="text-[#b4b0c0] font-inter text-[17px] lg:text-xl leading-[1.75] font-light max-w-2xl">
                      {current.answer.split(' ').map((w, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, filter: 'blur(6px)' }}
                          animate={{ opacity: 1, filter: 'blur(0px)' }}
                          transition={{ duration: 0.35, delay: 0.2 + i * 0.014 }}
                          className="inline-block mr-[0.28em]"
                        >
                          {w}
                        </motion.span>
                      ))}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navegación */}
              <div className="mt-10 pt-6 border-t border-white/[0.06] flex items-center justify-end gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => go(openIndex - 1)} aria-label="Pregunta anterior" className="faq-nav">
                    <ArrowLeft size={18} />
                  </button>
                  <button onClick={() => go(openIndex + 1)} aria-label="Pregunta siguiente" className="faq-nav">
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Iluminación ambiental del color activo */}
            <AnimatePresence mode="wait">
              <motion.div
                key={openIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.18, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full mix-blend-screen pointer-events-none"
                style={{ background: `radial-gradient(circle, ${current.color} 0%, transparent 70%)`, filter: 'blur(80px)' }}
              />
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CSS = `
#faq p{margin-bottom:0}
.faq-shimmer{background-image:linear-gradient(100deg,#d8b4fe 0%,#a855f7 30%,#FF9FFC 50%,#a855f7 70%,#d8b4fe 100%);
  background-size:220% 100%;animation:faq-shimmer 6s ease-in-out infinite;
  filter:drop-shadow(0 0 22px rgba(168,85,247,0.3))}
@keyframes faq-shimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.faq-fill{width:0;animation-name:faq-fill;animation-timing-function:linear;animation-fill-mode:forwards}
@keyframes faq-fill{from{width:0}to{width:100%}}
.faq-nav{display:grid;place-items:center;width:44px;height:44px;border-radius:999px;cursor:pointer;color:rgba(255,255,255,0.75);
  background:rgba(255,255,255,0.04);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.08);
  transition:background .25s,color .25s,box-shadow .25s,transform .25s}
.faq-nav:hover{color:#fff;background:rgba(168,85,247,0.18);box-shadow:inset 0 0 0 1px rgba(216,180,254,0.35);transform:translateY(-1px)}
.faq-nav:focus-visible{outline:2px solid rgba(216,180,254,0.7);outline-offset:2px}
@media (prefers-reduced-motion:reduce){.faq-shimmer{animation:none}}
`;
