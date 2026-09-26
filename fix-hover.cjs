const fs = require('fs');
let file = fs.readFileSync('src/components/ui/CoverflowCarousel.tsx', 'utf8');

// Remove hoveredIndex state
file = file.replace(
  /  const \[hoveredIndex, setHoveredIndex\] = useState<number \| null>\(null\);\n/,
  ""
);

// Remove isHoveringCard reference entirely if not used. Actually we just don't set it to true anymore.
// In animate():
file = file.replace(
  /      const isHovered = hoveredIndex === index;\n\s+card.style.transform = `translateX\(\$\{currentX - centerScreenX\}px\) translateZ\(\$\{translateZ\}px\) rotateY\(\$\{rotateY\}deg\)`;\n\s+card.style.zIndex = zIndex.toString\(\);\n\s+card.style.opacity = isHovered \? "1" : Math.max\(0, opacity\).toString\(\);\n\s+const inner = card.querySelector\('\.coverflow-inner'\) as HTMLDivElement;\n\s+if \(inner\) \{\n\s+const baseScale = 1 - Math.abs\(normalizedDistance\) \* 0.2;\n\s+const targetScale = isHovered \? 1.05 : baseScale;\n\s+inner.style.transform = `scale\(\$\{targetScale\}\)`;\n\s+if \(isHovered\) \{\n\s+inner.classList.add\('glow-active'\);\n\s+\} else \{\n\s+inner.classList.remove\('glow-active'\);\n\s+\}\n\s+\}/,
  `      const isCenter = Math.abs(normalizedDistance) < 0.15;
      
      card.style.transform = \`translateX(\${currentX - centerScreenX}px) translateZ(\${translateZ}px) rotateY(\${rotateY}deg)\`;
      card.style.zIndex = zIndex.toString();
      card.style.opacity = isCenter ? "1" : Math.max(0, opacity).toString();
      
      const inner = card.querySelector('.coverflow-inner') as HTMLDivElement;
      if (inner) {
        const baseScale = 1 - Math.abs(normalizedDistance) * 0.2;
        const targetScale = isCenter ? 1.05 : baseScale;
        inner.style.transform = \`scale(\${targetScale})\`;
        
        if (isCenter) {
          inner.classList.add('glow-active');
        } else {
          inner.classList.remove('glow-active');
        }
      }`
);

// Remove dependency in useCallback
file = file.replace(
  /hoveredIndex, /g,
  ""
);

// Remove the onMouseEnter and onMouseLeave props
file = file.replace(
  /          onMouseEnter=\{\(\) => \{\n            isHoveringCard.current = true;\n            setHoveredIndex\(index\);\n            centerCard\(index\);\n          \}\}\n          onMouseLeave=\{\(\) => \{\n            isHoveringCard.current = false;\n            setHoveredIndex\(null\);\n          \}\}/,
  ""
);

fs.writeFileSync('src/components/ui/CoverflowCarousel.tsx', file);
