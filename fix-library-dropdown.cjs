const fs = require('fs');

let code = fs.readFileSync('src/components/player/LibraryView.tsx', 'utf8');

// 1. Update DropdownItem to accept and render an icon, and ensure font-weight is reset
const oldDropdownItem = `const DropdownItem = ({ id, title, hoverBg, activeTab, onSelect }: any) => {
  return (
    <button 
      onClick={onSelect}
      className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === id ? 'bg-white/10 text-white' : \`text-white/60 \${hoverBg} hover:text-white\`}\`}
    >
      <span className="text-[15px] font-medium tracking-wide text-left">
        {title}
      </span>
    </button>
  );
};`;

const newDropdownItem = `const DropdownItem = ({ id, title, icon: Icon, hoverBg, activeTab, onSelect }: any) => {
  return (
    <button 
      onClick={onSelect}
      className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === id ? 'bg-white/10 text-white' : \`text-white/60 \${hoverBg} hover:text-white\`}\`}
    >
      <Icon className="w-5 h-5 mr-3 shrink-0" strokeWidth={2} />
      <span className="text-[15px] font-normal tracking-wide text-left" style={{ WebkitTextStroke: '0' }}>
        {title}
      </span>
    </button>
  );
};`;

code = code.replace(oldDropdownItem, newDropdownItem);

// 2. Update LibraryDropdown to pass icons, add gap-2, reset text stroke on modal, and add opacity to Chevron
const oldModal = /<div className=\{`absolute top-full mt-4 right-0 w-\[240px\] border rounded-xl p-1.5 z-\[9999\] backdrop-blur-3xl flex flex-col font-sans \$\{getModalStyles\(\)\}`\}>[\s\S]*?<\/div>/;

const newModal = `<div 
        className={\`absolute top-full mt-4 right-0 w-[240px] border rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans \${getModalStyles()}\`}
        style={{ WebkitTextStroke: '0', fontWeight: 'normal' }}
      >
          <DropdownItem 
            id="favorites" 
            title="Canciones favoritas" 
            icon={Heart}
            hoverBg={getHoverBg()}
            activeTab={activeTab}
            onSelect={() => { setActiveTab('library-favorites'); setIsOpen(false); }}
          />
          <DropdownItem 
            id="playlists" 
            title="Listas de reproducción" 
            icon={ListMusic}
            hoverBg={getHoverBg()}
            activeTab={activeTab}
            onSelect={() => { setActiveTab('library-playlists'); setIsOpen(false); }}
          />
          <DropdownItem 
            id="licenses" 
            title="Canciones con licencia" 
            icon={Star}
            hoverBg={getHoverBg()}
            activeTab={activeTab}
            onSelect={() => { setActiveTab('library-licenses'); setIsOpen(false); }}
          />
        </div>`;

code = code.replace(oldModal, newModal);

// Update ChevronDown
code = code.replace(
  /<ChevronDown className=\{`w-10 h-10 transition-transform duration-300 \$\{isOpen \? 'rotate-180' : ''\}`\} strokeWidth=\{4\} \/>/,
  '<ChevronDown className={`w-10 h-10 text-white/40 transition-transform duration-300 ${isOpen ? \'rotate-180\' : \'\'}`} strokeWidth={3} />'
);

fs.writeFileSync('src/components/player/LibraryView.tsx', code);
console.log("Updated dropdown formatting.");
