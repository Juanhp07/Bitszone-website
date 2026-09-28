import React from 'react';
import { FileWarning, HardDrive, ClockAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const problems = [
  {
    id: 1,
    title: "El fin de los archivos fantasma",
    description: "Visualiza al instante qué pistas están listas para escucharse offline y cuáles siguen en la nube.",
    icon: <FileWarning size={24} className="text-[#a855f7]" />
  },
  {
    id: 2,
    title: "Control total de tu espacio",
    description: "Monitorea cuánto almacenamiento ocupa tu biblioteca y adminístralo fácilmente.",
    icon: <HardDrive size={24} className="text-[#3b82f6]" />
  },
  {
    id: 3,
    title: "Licencias siempre vigentes",
    description: "Recibe notificaciones antes de que expiren tus descargas para mantener tu música activa.",
    icon: <ClockAlert size={24} className="text-[#06b6d4]" />
  }
];

export const ProblemSection = () => {
  return (
    <section className="py-48 md:py-64 px-6 md:px-16 w-full max-w-[1440px] mx-auto relative z-10 flex flex-col items-center">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#a855f7]/5 blur-[120px] rounded-[100%] pointer-events-none -z-10"></div>

      {/* Typography / Copywriting */}
      <motion.div 
        initial={{ opacity: 0, x: 150, rotate: 5, scale: 0.95 }}
        whileInView={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, type: "spring", bounce: 0.2 }}
        className="text-center w-full max-w-[1200px] mx-auto mb-20 md:mb-32"
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-sora font-bold text-white leading-[1.2]">
          Toma el control absoluto <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c0a3e5] to-[#818cf8]">sin conexión de forma sencilla</span>
        </h2>
      </motion.div>

      {/* Animated Cards */}
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
            className="rounded-2xl p-8 bg-white/[0.03] flex flex-col backdrop-blur-sm border border-white/5 hover:bg-white/[0.05] transition-colors"
          >
            {/* Icon Wrapper */}
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6">
              {item.icon}
            </div>
            
            {/* Text Content */}
            <h3 className="text-white font-sora font-semibold text-xl mb-3">{item.title}</h3>
            <p className="text-[#A0A3BD] font-inter text-sm leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </motion.div>

    </section>
  );
};
