const fs = require('fs');
let faq = fs.readFileSync('src/components/FAQSection.tsx', 'utf8');

// Remove item 3
faq = faq.replace(
  /  \{\n    question: "¿Cuánto cuesta Bitszone y qué incluye el plan Premium\?",\n    answer: "Ofrecemos diferentes niveles, desde una versión gratuita limitada hasta Premium con descargas sin pérdida de calidad y sin límites de almacenamiento local\."\n  \},\n/,
  ""
);

// Remove item 6
faq = faq.replace(
  /  \{\n    question: "¿Puedo usar mi cuenta en múltiples dispositivos\?",\n    answer: "Sí, puedes sincronizar tu biblioteca en varios dispositivos, aunque la reproducción simultánea depende de tu plan de suscripción\."\n  \}\n/,
  ""
);

// Note: there might be a trailing comma on item 5 if we just removed item 6? Wait, item 5 has a comma in the original source:
//   {
//     question: "¿Qué calidad de audio ofrece Bitszone?",
//     answer: "Soportamos múltiples formatos, incluyendo FLAC para audiófilos y opciones comprimidas de alta eficiencia para ahorrar espacio."
//   },
// It has a comma at the end, which is valid JS/TS.

fs.writeFileSync('src/components/FAQSection.tsx', faq);
