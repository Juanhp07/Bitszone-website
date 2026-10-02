import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 lg:py-32 px-6 container mx-auto flex flex-col lg:flex-row justify-between gap-12 lg:gap-16 relative">
      
      {/* Lado Izquierdo: Título y Clúster */}
      <div className="flex flex-col items-start w-full lg:w-5/12">
        
        {/* Título: Mismos tamaños que las Secciones 2 y 3 (text-3xl md:text-5xl) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9, type: "spring", bounce: 0.2 }}
          className="text-left w-full mb-12 lg:mb-20"
        >
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-[#1c1c20] font-jetbrains text-xs font-bold tracking-widest text-[#8e8d98] shadow-sm">
            PREGUNTAS FRECUENTES
          </div>
          <h2 className="text-3xl md:text-5xl font-sora font-bold text-white leading-tight tracking-tight">
            Las respuestas a<br/>tus preguntas.
          </h2>
        </motion.div>

        {/* Contenedor del Clúster: Tamaño proporcionado y no intrusivo (scale 1.8) */}
        <div className="w-full flex justify-center lg:justify-start items-center min-h-[250px] lg:pl-12">
          <div className="scale-[1.6] lg:scale-[1.8] origin-center lg:origin-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1, type: "spring", delay: 0.2 }}
            >
              <MagneticSelect 
                items={faqs.map(f => ({ color: f.color, label: f.question }))}
                selectedIndex={openIndex}
                onSelect={setOpenIndex}
                pull={55}
                give={50}
                bounce={55}
              />
            </motion.div>
          </div>
        </div>

      </div>

      {/* Lado Derecho: Popup - Tamaño en armonía con las cards de la Sección 3 */}
      <div className="w-full lg:w-7/12 flex items-center justify-center lg:justify-end relative mt-12 lg:mt-0">
        
        <div className="w-full max-w-[500px]">
          <AnimatePresence mode="wait">
            {openIndex !== null && (
              <motion.div
                key={openIndex}
                initial={{ opacity: 0, clipPath: "circle(0% at -20% 50%)", x: -20, scale: 0.95 }}
                animate={{ opacity: 1, clipPath: "circle(150% at -20% 50%)", x: 0, scale: 1 }}
                exit={{ opacity: 0, clipPath: "circle(0% at -20% 50%)", x: 20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1 }}
                className="w-full relative z-20 origin-left"
              >
                {/* Conector fluido */}
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 40, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hidden lg:block absolute -left-[40px] top-1/2 -translate-y-1/2 h-[2px] rounded-full z-0"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${faqs[openIndex].color})`,
                    boxShadow: `0 0 10px ${faqs[openIndex].color}80`
                  }}
                />

                <div 
                  className="p-8 md:p-10 relative overflow-hidden z-10"
                  style={{
                    borderRadius: '2rem 2rem 2rem 0.5rem',
                    background: 'rgba(12, 10, 18, 0.55)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    border: `1px solid ${faqs[openIndex].color}40`,
                    boxShadow: `0 20px 40px rgba(0,0,0,0.5), inset 0 0 40px ${faqs[openIndex].color}15`
                  }}
                >
                  {/* Glow interno liquid */}
                  <div 
                    className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full mix-blend-screen opacity-40 transition-colors duration-700 pointer-events-none"
                    style={{ 
                      background: `radial-gradient(circle, ${faqs[openIndex].color} 0%, transparent 70%)`,
                      filter: 'blur(40px)'
                    }}
                  />

                  <div className="relative z-10 flex flex-col">
                    <span 
                      className="text-xs font-jetbrains font-bold mb-4 inline-block tracking-widest uppercase"
                      style={{ color: faqs[openIndex].color }}
                    >
                      PREGUNTA 0{openIndex + 1}
                    </span>
                    
                    <h3 className="text-xl md:text-2xl font-sora font-bold text-white mb-4 leading-tight">
                      {faqs[openIndex].question}
                    </h3>
                    
                    <div className="w-full h-[1px] bg-white/10 mb-6" />
                    
                    <p className="text-[#A0A3BD] font-inter text-base leading-relaxed">
                      {faqs[openIndex].answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </section>
  );
};
