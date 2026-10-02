import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { MagneticSelect } from './ui/MagneticSelect';

const faqs = [
  {
    question: "¿Qué es Bitszone y cómo se diferencia de otras plataformas?",
    answer: "Bitszone está diseñado específicamente para el control total de tu biblioteca musical offline, eliminando la dependencia de la red y evitando problemas de caché.",
    color: "#A020F0"
  },
  {
    question: "¿Cómo funciona el modo offline y las descargas garantizadas?",
    answer: "Nuestro sistema de sincronización asegura que cada byte del archivo esté en tu dispositivo antes de marcarlo como disponible, sin archivos temporales rotos.",
    color: "#8A2BE2"
  },
  {
    question: "¿Cómo gestiono el espacio de almacenamiento y la memoria caché?",
    answer: "Tienes un panel dedicado con visibilidad real de cuánto ocupa cada playlist o álbum, con opciones para liberar espacio con un solo clic.",
    color: "#7B68EE"
  },
  {
    question: "¿Qué calidad de audio ofrece Bitszone?",
    answer: "Soportamos múltiples formatos, incluyendo FLAC para audiófilos y opciones comprimidas de alta eficiencia para ahorrar espacio.",
    color: "#4169E1"
  },
  {
    question: "¿Tengo que pagar por las funciones offline?",
    answer: "Nuestra capa offline premium requiere una suscripción activa, pero ofrecemos un nivel básico que permite descargas limitadas.",
    color: "#00BFFF"
  },
  {
    question: "¿Puedo sincronizar mi música entre varios dispositivos?",
    answer: "Sí, todos los dispositivos conectados a tu cuenta sincronizan el estado de la biblioteca y tus preferencias de descarga automáticamente.",
    color: "#00CED1"
  },
  {
    question: "¿Funciona con Android Auto y Apple CarPlay?",
    answer: "Por supuesto. Bitszone se integra nativamente para brindarte acceso total a tu música descargada directamente desde el tablero de tu auto.",
    color: "#00FFFF"
  }
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const containerRef = useRef<HTMLElement>(null);

  // Scroll parallax: Modificado para que vaya en conjunto con el efecto del fondo (hacia arriba)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Hacemos que toda la sección se deslice suavemente hacia arriba como el fondo
  const y = useTransform(scrollYProgress, [0, 1], [150, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <motion.section 
      ref={containerRef}
      style={{ opacity, y }}
      className="py-24 lg:py-32 px-6 container mx-auto relative z-10 min-h-[90vh] flex flex-col items-center justify-center"
    >
      
      {/* 1. Título Centrado con Efecto de Parpadeo (Pulse) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center w-full max-w-4xl mx-auto mb-14 lg:mb-20"
      >
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-sora font-extrabold tracking-tight text-white leading-[1.1]">
          Tus preguntas.<br/>
          {/* Efecto animate-pulse agregado al texto con gradiente */}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A020F0] to-[#00FFFF] animate-pulse drop-shadow-[0_0_15px_rgba(160,32,240,0.4)] inline-block">
            Nuestras respuestas.
          </span>
        </h2>
      </motion.div>

      {/* 2. Clúster Interactivo */}
      <div className="w-full flex justify-center items-center mb-14 lg:mb-20 relative z-30">
        <div className="scale-[1.6] sm:scale-[1.8] lg:scale-[2.2] origin-center transition-transform duration-500 hover:scale-[1.7] sm:hover:scale-[1.9] lg:hover:scale-[2.3]">
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
      </div>

      {/* 3. Tarjeta Editorial "Bento" Redimensionada (Sleeker and smaller) */}
      <div className="w-full max-w-4xl relative z-20">
        
        {/* Cascarón de Cristal (Ajustado a proporciones más pequeñas y compactas) */}
        <div 
          className="relative overflow-hidden rounded-[1.5rem] lg:rounded-[2rem] transition-colors duration-1000"
          style={{
            background: 'rgba(12, 10, 16, 0.4)', 
            backdropFilter: 'blur(48px)',
            WebkitBackdropFilter: 'blur(48px)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            boxShadow: `
              0 20px 40px -10px rgba(0,0,0,0.8), 
              inset 0 1px 0px rgba(255,255,255,0.06)
            `
          }}
        >
          {/* Luz superior sutil del cascarón */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Área interna de transición cruzada (Crossfade) - Altura mínima fija para evitar saltos */}
          <div className="p-8 lg:p-12 min-h-[260px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={openIndex}
                initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(8px)', transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col h-full"
              >
                
                {/* Header de la tarjeta: Número y línea decorativa */}
                <div className="flex items-center gap-4 mb-6 md:mb-8 md:w-5/12">
                  <span 
                    className="font-jetbrains text-xs font-bold tracking-[0.15em] transition-colors duration-500"
                    style={{ color: faqs[openIndex].color }}
                  >
                    0{openIndex + 1}
                  </span>
                  <div 
                    className="h-[1px] flex-grow opacity-20 transition-colors duration-500"
                    style={{ background: faqs[openIndex].color }}
                  />
                </div>

                {/* Cuadrícula de contenido: Pregunta (Izquierda) y Respuesta (Derecha) */}
                <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 lg:gap-16 items-start">
                  
                  <div className="md:col-span-5 flex flex-col">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-sora font-semibold text-white leading-[1.3] tracking-tight">
                      {faqs[openIndex].question}
                    </h3>
                  </div>

                  <div className="md:col-span-7 flex flex-col relative z-10">
                    <p className="text-[#8e8d98] font-inter text-base lg:text-lg leading-[1.7] font-light">
                      {faqs[openIndex].answer}
                    </p>
                  </div>
                  
                </div>

                {/* Resplandor interno sutil ligado a la respuesta */}
                <div 
                  className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full mix-blend-screen opacity-10 pointer-events-none transition-colors duration-1000"
                  style={{ 
                    background: `radial-gradient(circle, ${faqs[openIndex].color} 0%, transparent 70%)`,
                    filter: 'blur(50px)'
                  }}
                />

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

    </motion.section>
  );
};
