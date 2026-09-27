const fs = require('fs');
let topnav = fs.readFileSync('src/components/player/TopNav.tsx', 'utf8');

// Add isSidebarOpen prop
topnav = topnav.replace(
  'export const TopNav = ({ currentView, onViewChange, onToggleSidebar }: { currentView: string, onViewChange: (view: any) => void, onToggleSidebar: () => void }) => {',
  'export const TopNav = ({ currentView, onViewChange, onToggleSidebar, isSidebarOpen }: { currentView: string, onViewChange: (view: any) => void, onToggleSidebar: () => void, isSidebarOpen: boolean }) => {'
);

// Replace Menu icon with custom animated SVG
const oldMenu = '<Menu className="w-6 h-6" />';
const newMenu = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="overflow-visible">
            <line x1="4" y1="6" x2="20" y2="6" className="transition-transform duration-300" />
            <line x1="4" y1="12" x2="20" y2="12" className="transition-transform duration-300" />
            <line x1="4" y1="18" x2="20" y2="18" 
              className="transition-all duration-300 ease-in-out"
              style={{
                transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-12px)',
                opacity: isSidebarOpen ? 1 : 0
              }}
            />
          </svg>`;

topnav = topnav.replace(oldMenu, newMenu);

// Remove unused Menu import just in case to be clean
topnav = topnav.replace("import { Menu, User } from 'lucide-react';", "import { User } from 'lucide-react';");

fs.writeFileSync('src/components/player/TopNav.tsx', topnav);

// Now update MainApp.tsx to pass isSidebarOpen
let mainApp = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');
mainApp = mainApp.replace(
  '<TopNav \n          currentView={currentView} \n          onViewChange={setCurrentView} \n          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}\n        />',
  '<TopNav \n          currentView={currentView} \n          onViewChange={setCurrentView} \n          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}\n          isSidebarOpen={isSidebarOpen}\n        />'
);
fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);

