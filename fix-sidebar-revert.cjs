const fs = require('fs');
let code = fs.readFileSync('src/components/player/Sidebar.tsx', 'utf8');

const newLibraryMenu = `<div className="flex flex-col gap-1">
          <button
            onClick={() => onViewChange("library")}
            className={\`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors \${
              currentView.startsWith("library")
                ? "text-white bg-white/10 shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }\`}
          >
            <Library className="w-5 h-5" />
            Biblioteca
          </button>
          
          {currentView.startsWith("library") && (
            <div className="pl-12 pr-4 flex flex-col gap-1 mt-1 mb-2">
              <button 
                onClick={() => onViewChange("library")}
                className={\`text-left text-sm py-2 px-3 rounded-lg transition-colors \${currentView === "library" ? "text-[#a855f7] font-medium bg-[#a855f7]/10" : "text-white/50 hover:text-white hover:bg-white/5"}\`}
              >
                Favoritos
              </button>
              <button 
                onClick={() => onViewChange("library_playlists")}
                className={\`text-left text-sm py-2 px-3 rounded-lg transition-colors \${currentView === "library_playlists" ? "text-[#a855f7] font-medium bg-[#a855f7]/10" : "text-white/50 hover:text-white hover:bg-white/5"}\`}
              >
                Listas de reproducción
              </button>
              <button 
                onClick={() => onViewChange("library_licenses")}
                className={\`text-left text-sm py-2 px-3 rounded-lg transition-colors \${currentView === "library_licenses" ? "text-[#a855f7] font-medium bg-[#a855f7]/10" : "text-white/50 hover:text-white hover:bg-white/5"}\`}
              >
                Licencias
              </button>
            </div>
          )}
        </div>`;

const oldLibraryBtn = `<button
          onClick={() => onViewChange("library")}
          className={\`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors \${
            currentView === "library"
              ? "text-white bg-white/10 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }\`}
        >
          <Library className="w-5 h-5" />
          Biblioteca
        </button>`;

if (code.includes('currentView.startsWith("library")')) {
  code = code.replace(newLibraryMenu, oldLibraryBtn);
  fs.writeFileSync('src/components/player/Sidebar.tsx', code);
  console.log("Reverted Sidebar");
} else {
  console.log("Could not find the new menu in Sidebar");
}
