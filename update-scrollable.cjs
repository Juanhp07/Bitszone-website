const fs = require('fs');
let content = fs.readFileSync('src/components/ui/ScrollableList.tsx', 'utf8');

// Add getMaskImage function before return
const maskFunc = `
  const getMaskImage = () => {
    if (showLeft && showRight) {
      return 'linear-gradient(to right, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%)';
    } else if (showRight) {
      return 'linear-gradient(to right, black 0%, black calc(100% - 60px), transparent 100%)';
    } else if (showLeft) {
      return 'linear-gradient(to right, transparent 0px, black 60px, black 100%)';
    }
    return 'none';
  };
`;
content = content.replace('  return (', maskFunc + '\n  return (');

// Update style attribute
content = content.replace(
  "style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}",
  "style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitMaskImage: getMaskImage(), maskImage: getMaskImage(), transition: 'mask-image 0.3s ease' }}"
);

fs.writeFileSync('src/components/ui/ScrollableList.tsx', content);
