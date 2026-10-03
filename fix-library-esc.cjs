const fs = require('fs');
let code = fs.readFileSync('src/components/player/LibraryView.tsx', 'utf8');

const hookRegex = /useEffect\(\(\) => \{[\s\S]*?const handleClickOutside = \(event: MouseEvent\) => \{[\s\S]*?if \(dropdownRef.current && !dropdownRef.current.contains\(event.target as Node\)\) \{[\s\S]*?setIsOpen\(false\);[\s\S]*?\}[\s\S]*?\};[\s\S]*?document.addEventListener\('mousedown', handleClickOutside\);[\s\S]*?return \(\) => document.removeEventListener\('mousedown', handleClickOutside\);[\s\S]*?\}, \[\]\);/m;

const newHook = `useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);`;

if (code.match(hookRegex)) {
  code = code.replace(hookRegex, newHook);
  fs.writeFileSync('src/components/player/LibraryView.tsx', code);
  console.log("Added Esc key support to LibraryView modal.");
} else {
  console.log("Could not find useEffect in LibraryView");
}
