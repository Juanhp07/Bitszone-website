import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';

const faqs = [
  {
    question: "¿Qué es Bitszone y cómo se diferencia de otras plataformas?",
    answer: "Bitszone está diseñado específicamente para el control total de tu biblioteca musical offline, eliminando la dependencia de la red y evitando problemas de caché."
  },
  {
    question: "¿Cómo funciona el modo offline y las descargas garantizadas?",
    answer: "Nuestro sistema de sincronización asegura que cada byte del archivo esté en tu dispositivo antes de marcarlo como disponible, sin archivos temporales rotos."
  },
  {
    question: "¿Cuánto cuesta Bitszone y qué incluye el plan Premium?",
    answer: "Ofrecemos diferentes niveles, desde una versión gratuita limitada hasta Premium con descargas sin pérdida de calidad y sin límites de almacenamiento local."
  },
  {
    question: "¿Cómo gestiono el espacio de almacenamiento y la memoria caché?",
    answer: "Tienes un panel dedicado con visibilidad real de cuánto ocupa cada playlist o álbum, con opciones para liberar espacio con un solo clic."
  },
  {
    question: "¿Qué calidad de audio ofrece Bitszone?",
    answer: "Soportamos múltiples formatos, incluyendo FLAC para audiófilos y opciones comprimidas de alta eficiencia para ahorrar espacio."
  },
  {
    question: "¿Puedo usar mi cuenta en múltiples dispositivos?",
    answer: "Sí, puedes sincronizar tu biblioteca en varios dispositivos, aunque la reproducción simultánea depende de tu plan de suscripción."
  }
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
      {/* CTA Box */}
      <div className="flex flex-col items-center mb-32">
        <Button className="mb-4 text-lg px-8 py-4">Probar Bitszone Gratis</Button>
        <p className="text-sm font-inter text-[#A0A3BD]">30 días sin coste para nuevos usuarios. Cancela cuando quieras.</p>
      </div>

      <div className="mb-12">
        <div className="inline-block px-3 py-1 mb-6 rounded-full border border-white/10 bg-white/5 font-jetbrains text-xs text-[#A0A3BD]">
          PREGUNTAS FRECUENTES
        </div>
        <h2 className="text-3xl md:text-5xl font-sora font-bold text-white leading-tight">
          Las respuestas a tus<br/>preguntas.
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-white/10">
            <button 
              className="w-full flex items-center justify-between py-6 text-left"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span className="font-inter font-medium text-white pr-8">{faq.question}</span>
              <div className={`w-6 h-6 rounded-full border border-white/20 flex items-center justify-center transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4 text-[#A0A3BD]" />
              </div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 text-[#A0A3BD] font-inter text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};
