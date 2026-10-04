import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { MagneticSelect } from './ui/MagneticSelect';
import { ShaderBackground } from './ui/waves-shader';

const faqs = [
  {
    question: "¿Qué es Bitszone y cómo se diferencia de otras plataformas?",
    answer: "Bitszone está diseñado específicamente para el control total de tu biblioteca musical offline, eliminando la dependencia de la red y evitando problemas de caché. Literalmente descargas la música bit a bit a tu almacenamiento local.",
    color: "#A020F0"
  },
  {
    question: "¿Cómo funciona el modo offline y las descargas garantizadas?",
    answer: "Nuestro sistema de sincronización asegura que cada byte del archivo esté en tu dispositivo antes de marcarlo como disponible. Sin búfer invisible, sin archivos temporales rotos que fallan cuando más los necesitas.",
    color: "#8A2BE2"
  },
  {
    question: "¿Cómo gestiono el espacio de almacenamiento y la memoria caché?",
    answer: "Tienes un panel de control nativo con visibilidad real de cuánto ocupa cada playlist o álbum. Podrás limpiar, auditar y liberar espacio con un solo clic, sin que la app decida por ti.",
    color: "#7B68EE"
  },
  {
    question: "¿Qué calidad de audio ofrece Bitszone?",
    answer: "Soportamos múltiples formatos sin compresión oculta. Incluye FLAC para los puristas del sonido y opciones altamente optimizadas (AAC/Opus) si necesitas ahorrar espacio drásticamente.",
    color: "#4169E1"
  },
  {
    question: "¿Qué pasa si pierdo la conexión mientras escucho música?",
    answer: "Bitszone cuenta con una transición automática (Cero Cortes). Si detecta que pierdes la señal, cambia instantáneamente a tu biblioteca offline sin detener la reproducción ni causar saltos de audio.",
    color: "#00BFFF"
  },
  {
    question: "¿Cómo sé qué canciones están ocupando mi almacenamiento?",
    answer: "Contamos con un sistema de 'Espacio Transparente' que te muestra visualmente cuánto pesa cada playlist y álbum. Además, puedes liberar espacio instantáneamente con nuestra herramienta de limpieza inteligente.",
    color: "#00CED1"
  },
  {
    question: "¿Es fácil identificar qué pistas tengo descargadas?",
    answer: "¡Totalmente! La interfaz te indica visualmente y al instante qué pistas están listas para escucharse offline y cuáles siguen en la nube, evitando sorpresas cuando no tienes acceso a internet.",
    color: "#00FFFF"
  }
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const containerRef = useRef<HTMLElement>(null);

  // Animación de transición basada en el scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 90%", "center center"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.5], [100, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  const cardsY = useTransform(scrollYProgress, [0.2, 1], [150, 0]);
  const cardsOpacity = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);
  const cardsScale = useTransform(scrollYProgress, [0.2, 1], [0.95, 1]);

  // El nuevo fondo aparece gradualmente mientras haces scroll
  const backgroundOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section 
      id="faq"
      ref={containerRef}
      className="py-24 lg:py-32 px-6 w-full relative min-h-screen flex items-center justify-center"
    >
      {/* Fondo eliminado a petición del usuario */}

      <div className="w-full max-w-[1400px] relative z-10">
        
        {/* Encabezado Principal */}
        <motion.div 
          style={{ y: headerY, opacity: headerOpacity }}
          className="text-center w-full mb-20 lg:mb-28 flex flex-col items-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-sora font-extrabold tracking-tighter text-white leading-[1.05]">
            Tu música.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A020F0] via-[#4169E1] to-[#00FFFF] animate-pulse drop-shadow-[0_0_20px_rgba(160,32,240,0.3)] inline-block mt-2">
              Nuestras respuestas.
            </span>
          </h2>
        </motion.div>

        {/* Layout Apple Bento: 2 Tarjetas Masivas Lado a Lado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full">
          
          {/* Bento Card 1: El Controlador (Izquierda, sin estilo de tarjeta) */}
          <motion.div
            style={{ y: cardsY, opacity: cardsOpacity, scale: cardsScale }}
            className="col-span-1 lg:col-span-5 relative p-10 flex flex-col items-center justify-center min-h-[450px] lg:min-h-[550px]"
          >
            
            <h3 className="font-jetbrains text-xs font-bold tracking-[0.2em] text-white/30 uppercase absolute top-10 text-center">
              Selecciona una Pregunta
            </h3>

            {/* El Clúster Magnético en el centro absoluto */}
            <div className="relative z-20 scale-[1.6] sm:scale-[1.8] lg:scale-[2.1] mt-8 transition-transform duration-500 hover:scale-[1.7] sm:hover:scale-[1.9] lg:hover:scale-[2.2]">
              <MagneticSelect 
                items={faqs.map(f => ({ color: f.color, label: f.question }))}
                selectedIndex={openIndex}
                onSelect={(idx) => {
                  if (idx !== null) setOpenIndex(idx);
                }}
                pull={55}
                give={50}
                bounce={55}
              />
            </div>
            
          </motion.div>

          {/* Bento Card 2: El Visor de Respuestas (Derecha) */}
          <motion.div
            className="col-span-1 lg:col-span-7 relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] flex flex-col min-h-[450px] lg:min-h-[550px]"
            style={{
              y: cardsY,
              opacity: cardsOpacity,
              scale: cardsScale,
              background: 'rgba(12, 10, 16, 0.4)', 
              backdropFilter: 'blur(48px)',
              WebkitBackdropFilter: 'blur(48px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8), inset 0 1px 0px rgba(255,255,255,0.05)'
            }}
          >
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="p-10 lg:p-14 flex-grow flex flex-col h-full relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={openIndex}
                  initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -20, filter: 'blur(8px)', transition: { duration: 0.2 } }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full flex flex-col h-full justify-between"
                >
                  
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex items-center justify-between w-full mb-12">
                    <div className="flex items-center gap-5">
                      
                      {/* Efecto: Bolita idéntica a la selección (Cluster) volando desde la izquierda */}
                      <motion.div 
                        initial={{ x: -200, scale: 0.5, opacity: 0 }} 
                        animate={{ x: 0, scale: 1, opacity: 1 }} 
                        transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.1 }}
                        className="w-12 h-12 rounded-full flex items-center justify-center relative flex-shrink-0"
                        style={{ 
                          background: `linear-gradient(135deg, ${faqs[openIndex].color}, #00FFFF)`,
                          boxShadow: `0 10px 25px ${faqs[openIndex].color}90, inset 0 2px 4px rgba(255,255,255,0.3)`
                        }}
                      >
                        <span className="font-sora font-bold text-white text-[15px] relative z-10">
                          {openIndex + 1}
                        </span>
                      </motion.div>

                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="h-[2px] w-12 rounded-full origin-left" 
                        style={{ background: faqs[openIndex].color, opacity: 0.6 }} 
                      />
                    </div>
                    
                    <span className="font-jetbrains text-xs tracking-[0.2em] text-white/20 uppercase hidden sm:block">
                      FAQ / Bitszone
                    </span>
                  </div>

                  {/* Contenido (Pregunta y Respuesta) */}
                  <div className="flex-grow flex flex-col justify-center">
                    <h3 className="text-3xl md:text-4xl lg:text-[2.75rem] font-sora font-semibold text-white leading-[1.2] tracking-tight mb-8 drop-shadow-lg">
                      {faqs[openIndex].question}
                    </h3>
                    
                    <p className="text-[#a1a0ab] font-inter text-lg lg:text-xl leading-[1.8] font-light max-w-2xl">
                      {faqs[openIndex].answer}
                    </p>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Iluminación Dinámica Ambiental en la esquina inferior */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={openIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.15, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full mix-blend-screen pointer-events-none"
                style={{ 
                  background: `radial-gradient(circle, ${faqs[openIndex].color} 0%, transparent 70%)`,
                  filter: 'blur(80px)'
                }}
              />
            </AnimatePresence>

          </motion.div>

        </div>
      </div>
    </section>
  );
};
