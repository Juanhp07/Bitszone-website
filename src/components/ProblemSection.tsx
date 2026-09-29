import React from 'react';
import { FileWarning, HardDrive, ClockAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const problems = [
  {
    id: 1,
    title: "El fin de los archivos fantasma",
    description: "Visualiza al instante qué pistas están listas para escucharse offline y cuáles siguen en la nube.",
    icon: <FileWarning size={28} className="text-[#d8b4fe]" />
  },
  {
    id: 2,
    title: "Control total de tu espacio",
    description: "Monitorea cuánto almacenamiento ocupa tu biblioteca y adminístralo fácilmente sin complicaciones.",
    icon: <HardDrive size={28} className="text-[#d8b4fe]" />
  },
  {
    id: 3,
    title: "Licencias siempre vigentes",
    description: "Recibe notificaciones antes de que expiren tus descargas para mantener tu música siempre activa.",
    icon: <ClockAlert size={28} className="text-[#d8b4fe]" />
  }
];

export const ProblemSection = () => {
  return (
    <section className="py-48 md:py-64 px-6 md:px-16 w-full max-w-[1440px] mx-auto relative z-10 flex flex-col items-center">
      
      {/* Background glow morado */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#a855f7]/10 blur-[120px] rounded-[100%] pointer-events-none -z-10"></div>

      {/* Typography / Copywriting Original */}
      <motion.div 
        initial={{ opacity: 0, x: 150, rotate: 5, scale: 0.95 }}
        whileInView={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, type: "spring", bounce: 0.2 }}
        className="text-center w-full max-w-[1200px] mx-auto mb-20 md:mb-32"
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-sora font-bold text-white leading-[1.2]">
          Toma el control absoluto <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d8b4fe] to-[#a855f7]">sin conexión de forma sencilla</span>
        </h2>
      </motion.div>

      {/* Animated Cards (Mantenemos la animación y el Liquid Glass) */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl mx-auto"
      >
        {problems.map((item) => (
          <motion.div 
            key={item.id} 
            variants={{
              hidden: { opacity: 0, x: 100, scale: 0.95 },
              visible: { 
                opacity: 1, 
                x: 0, 
                scale: 1, 
                transition: { type: "spring", stiffness: 50, damping: 15 } 
              }
            }}
            // LIQUID GLASS MORADO PREMIUM
            className="relative rounded-[2rem] p-8 md:p-10 flex flex-col justify-start overflow-hidden transition-all duration-500 hover:-translate-y-2 group"
            style={{
              // Translucidez tipo cristal (bajamos opacidad para que el blur haga su magia)
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(88, 28, 135, 0.05) 100%)",
              // Borde sutil brillante y sombras flotantes
              border: "1px solid rgba(216, 180, 254, 0.12)",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              // Blur profundo con saturación para hacer brillar los colores que hay debajo
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)"
            }}
          >
            {/* Resplandor dinámico en el borde superior (Liquid Reflection) */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d8b4fe]/60 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Brillo ambiental dentro de la tarjeta */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#a855f7]/20 rounded-full blur-[50px] pointer-events-none group-hover:bg-[#a855f7]/30 transition-colors duration-500"></div>

            {/* Icono del beneficio */}
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/10 shadow-[0_4px_20px_rgba(168,85,247,0.15)] flex items-center justify-center mb-8 backdrop-blur-md">
              {item.icon}
            </div>
            
            {/* Textos del beneficio */}
            <h3 className="relative z-10 text-white font-sora font-semibold text-xl md:text-2xl mb-4 leading-snug tracking-tight">{item.title}</h3>
            <p className="relative z-10 text-[#B497CF] font-inter text-[15px] md:text-base leading-relaxed flex-1">
              {item.description}
            </p>

          </motion.div>
        ))}
      </motion.div>

    </section>
  );
};
