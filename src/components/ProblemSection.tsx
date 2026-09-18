import React from 'react';
import { motion } from 'framer-motion';
import { FileWarning, RefreshCcw, EyeOff } from 'lucide-react';

const problems = [
  {
    icon: <FileWarning className="w-6 h-6 text-[#A0A3BD]" />,
    title: "Caché y archivos fantasma",
    description: "Pistas que desaparecen en modo avión, dejándote sin música en el momento crítico."
  },
  {
    icon: <RefreshCcw className="w-6 h-6 text-[#A0A3BD]" />,
    title: "Reintentar y esperar",
    description: "Fallo de red a mitad de streaming y luego minutos sin saber qué falló ni el motivo real."
  },
  {
    icon: <EyeOff className="w-6 h-6 text-[#A0A3BD]" />,
    title: "Sin visibilidad real",
    description: "Cero control sobre el espacio ocupado y los mix que consumen ancho de banda."
  }
];

export const ProblemSection = () => {
  return (
    <section className="py-24 px-6 md:px-12 max-w-[1440px] mx-auto">
      <div className="text-center mb-16">
        <div className="inline-block px-3 py-1 mb-6 rounded-full border border-white/10 bg-white/5 font-jetbrains text-xs text-[#A0A3BD]">
          EL PROBLEMA
        </div>
        <h2 className="text-3xl md:text-5xl font-sora font-bold text-white mb-6 leading-tight">
          Música que no ves <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-[#55108d]">música que no es</span>
        </h2>
        <p className="text-[#A0A3BD] max-w-2xl mx-auto font-inter">
          Sincronización fallida al perder conexión, descargas incompletas y archivos fantasma que arruinan tu momento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {problems.map((problem, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="border-gradient rounded-2xl p-8 hover:shadow-[0_0_24px_rgba(45,20,145,0.15)] transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-6 group-hover:border-brand-primary/50 transition-colors bg-canvas">
              {problem.icon}
            </div>
            <h3 className="text-xl font-sora font-semibold text-white mb-3">
              {problem.title}
            </h3>
            <p className="text-[#A0A3BD] font-inter text-sm leading-relaxed">
              {problem.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
