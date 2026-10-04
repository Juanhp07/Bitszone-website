const fs = require('fs');

let path = 'src/components/ProblemSection.tsx';
let content = fs.readFileSync(path, 'utf8');

// We will revert the strict opacity scroll-binding and use a spring parallax.
// First, find the imports and ensure useSpring is there
if (!content.includes('useSpring')) {
    content = content.replace(
        "import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';",
        "import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';"
    );
}

// Replace the hook definitions
const oldHooksRegex = /const headerY = useTransform[\s\S]*?const controlsOpacity = useTransform[^;]*;/;

const newHooks = `  // Scroll Parallax fluido e intuitivo
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, { damping: 25, stiffness: 120, mass: 0.5 });
  
  // Parallax offsets
  const headerY = useTransform(smoothProgress, [0, 1], [150, -100]);
  const subtitleY = useTransform(smoothProgress, [0, 1], [200, -120]);
  const controlsY = useTransform(smoothProgress, [0, 1], [250, -150]);
  const cardsY = useTransform(smoothProgress, [0, 1], [350, -200]);`;

if (oldHooksRegex.test(content)) {
    content = content.replace(oldHooksRegex, newHooks);
} else {
    // If regex fails, maybe it looks slightly different, let's use string replace for the block
    let blockStart = 'const headerY = useTransform';
    let blockEnd = 'const controlsOpacity = useTransform(scrollYProgress, [0.15, 0.9], [0, 1]);';
    let startIndex = content.indexOf(blockStart);
    let endIndex = content.indexOf(blockEnd) + blockEnd.length;
    if (startIndex !== -1 && endIndex !== -1) {
        content = content.substring(0, startIndex) + newHooks + content.substring(endIndex);
    }
}

// Now, we need to add back the whileInView opacity animations because we removed them before!
// For header:
content = content.replace(
    '<motion.div style={{ y: headerY, opacity: headerOpacity, scale: headerScale }}',
    '<motion.div style={{ y: headerY }} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false, amount: 0.3 }} transition={{ duration: 0.8, type: "spring" }}'
);

// For subtitle:
content = content.replace(
    '<motion.p style={{ y: subtitleY, opacity: subtitleOpacity }}',
    '<motion.p style={{ y: subtitleY }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false, amount: 0.3 }} transition={{ duration: 0.8, delay: 0.1 }}'
);

// For controls:
content = content.replace(
    '<motion.div style={{ y: controlsY, opacity: controlsOpacity }}',
    '<motion.div style={{ y: controlsY }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false, amount: 0.5 }} transition={{ duration: 0.8, delay: 0.2 }}'
);

// For cards container:
content = content.replace(
    '<motion.div style={{ y: cardsY, opacity: cardsOpacity, scale: cardsScale }} className="w-full max-w-[1200px] px-6">',
    '<motion.div style={{ y: cardsY }} className="w-full max-w-[1200px] px-6">'
);

// We need to restore `whileInView="visible"` on the AnimatePresence children container
content = content.replace(
    /animate="visible"/,
    'whileInView="visible" viewport={{ once: false, margin: "-100px" }}'
);

// Remove the old scrollYProgress from the top of the component
content = content.replace(
    /const \{ scrollYProgress \} = useScroll\(\{\s*target: sectionRef,\s*offset: \["start end", "center center"\]\s*\}\);\s*/,
    ''
);

fs.writeFileSync(path, content);
console.log('Fixed parallax scroll');
