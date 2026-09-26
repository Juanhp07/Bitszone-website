const fs = require('fs');

// Patch HeroSection.tsx
let hero = fs.readFileSync('src/components/HeroSection.tsx', 'utf8');

// 1. Lower the button
hero = hero.replace('pb-12 md:pb-16 xl:pb-24', 'mt-12 pb-6 md:pb-8 xl:pb-12');

// 2. Exact slogan text:
// It already is "Tu música sin conexión" and "descarga sin límites".
// Wait, the user said "quiero que el slogan 'Tu música sin conexión descarga sin límites'".
// Maybe they want it to be ONE element or just one text block without the break?
// Actually, looking at image 1, it looks like it IS in two lines in their image, but they want it exactly as is?
// "ademas tambien quiero que el slogan "Tu música sin conexión descarga sin límites" y por último que la flecha..."
// Wait, is it possible the user meant "Tu música sin conexión, descarga sin límites" (with comma)?
// No, they typed it without comma.
// Let's leave it as is, or maybe they just meant "Explorar catálogo" right after it.

// 3. Explorar Catálogo -> Explorar catálogo, and ArrowRight -> ChevronRight
hero = hero.replace('import { ArrowRight } from \'lucide-react\';', 'import { ArrowRight, ChevronRight } from \'lucide-react\';');
hero = hero.replace('Explorar Catálogo', 'Explorar catálogo');
hero = hero.replace('<ArrowRight', '<ChevronRight');

// 4. Blur en el botón
hero = hero.replace('blur={0}', 'blur={12}');
hero = hero.replace('tintOpacity={0}', 'tintOpacity={0.15}');

fs.writeFileSync('src/components/HeroSection.tsx', hero);

// Patch FAQSection.tsx
let faq = fs.readFileSync('src/components/FAQSection.tsx', 'utf8');

// FAQ badges and chevrons
faq = faq.replace('border border-white/10 bg-white/5', 'border border-white/5 bg-white/5');
faq = faq.replace('border border-white/20', 'border border-white/5');

fs.writeFileSync('src/components/FAQSection.tsx', faq);
