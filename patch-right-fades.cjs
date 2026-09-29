const fs = require('fs');

let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// Replace the right section's side fades
// from: bg-gradient-to-r from-[#05050A] via-transparent to-[#05050A]
// to: bg-gradient-to-r from-transparent via-transparent to-[#05050A]
// This removes the dark block on the left edge of the 65% container

code = code.replace(
  'className="absolute inset-0 bg-gradient-to-r from-[#05050A] via-transparent to-[#05050A] opacity-90 z-10 pointer-events-none"',
  'className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#05050A] opacity-90 z-10 pointer-events-none"'
);

// We should also check the radial gradient. radial-gradient from center to #05050A.
// At the left edge of the container, it will be somewhat #05050A.
// If we mask the entire group of backgrounds in the 65% container, it will be perfectly smooth.
// How? We can wrap the img and the 3 fades in a div that has maskImage.
const targetFadesBlock = `{/* Background Cover Image */}
           <img 
             src={album.coverUrl} 
             alt="Artist/Album Cover" 
             className={\`absolute inset-0 w-full h-full object-cover z-0 grayscale-[20%] contrast-125 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] \${activeTab === 'letra' ? 'opacity-5 scale-105 blur-sm' : 'opacity-50 scale-100 blur-0'}\`} 
             style={{ 
               maskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)',
               WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)'
             }}
           />
           
           {/* Fades on all sides */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#05050A] opacity-90 z-10 pointer-events-none" />
           <div className="absolute inset-0 bg-gradient-to-b from-[#05050A] via-transparent to-[#05050A] opacity-90 z-10 pointer-events-none" />
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05050A_100%)] opacity-80 z-10 pointer-events-none" />`;

const replacementFadesBlock = `{/* Background Cover Image with Fades */}
           <div className="absolute inset-0 z-0 pointer-events-none" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 100%)' }}>
             <img 
               src={album.coverUrl} 
               alt="Artist/Album Cover" 
               className={\`absolute inset-0 w-full h-full object-cover grayscale-[20%] contrast-125 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] \${activeTab === 'letra' ? 'opacity-5 scale-105 blur-sm' : 'opacity-50 scale-100 blur-0'}\`} 
             />
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#05050A] opacity-90" />
             <div className="absolute inset-0 bg-gradient-to-b from-[#05050A] via-transparent to-[#05050A] opacity-90" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05050A_100%)] opacity-80" />
           </div>`;

// Apply the block replacement
if (code.includes('alt="Artist/Album Cover"')) {
    // Revert the first simple replace just in case we can do the block one
    let codeBlock = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');
    
    // We need to match the actual text in the file:
    const regex = /\{\/\*\s*Background Cover Image\s*\*\/\}[\s\S]*?opacity-80 z-10 pointer-events-none" \/>/;
    codeBlock = codeBlock.replace(regex, replacementFadesBlock);
    fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', codeBlock);
    console.log('Successfully wrapped right side backgrounds in a mask block');
}

