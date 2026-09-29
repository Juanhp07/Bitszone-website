const fs = require('fs');

let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Add animation style to ImmersivePlayer
const styleBlock = `
  const waveSvg = "data:image/svg+xml,%3Csvg width='24' height='12' viewBox='0 0 24 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6C4 0 8 12 12 6C16 0 20 12 24 6' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E";

  return createPortal(
    <>
      <style>{\`
        @keyframes wave-slide {
          from { background-position-x: 0px; }
          to { background-position-x: -24px; }
        }
        .animate-wave-slide {
          animation: wave-slide 1s linear infinite;
        }
      \`}</style>
      {/* Backdrop (though the modal is fullscreen, keeping this for transition) */}`;

code = code.replace(`  return createPortal(\n    <>\n      {/* Backdrop (though the modal is fullscreen, keeping this for transition) */}`, styleBlock);

// 2. Add dynamic gradient to background
const bgTarget = `      <div \n        onClick={(e) => e.stopPropagation()}\n        className={\`fixed z-[100] inset-0 w-full h-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[#05050A] flex \${`;
const bgReplace = `      <div \n        onClick={(e) => e.stopPropagation()}\n        className={\`fixed z-[100] inset-0 w-full h-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[#05050A] flex \${`;

const bgContentTarget = `      >\n        \n\n        <button \n          onClick={onClose}`;
const bgContentReplace = `      >\n        \n        {/* Dynamic Gradient from Album Colors (Focused on Tracklist) */}\n        <div className="absolute top-0 left-0 bottom-0 w-[50%] z-0 pointer-events-none overflow-hidden">\n           <img \n             src={album.coverUrl} \n             className="w-full h-full object-cover blur-[100px] saturate-[2.5] opacity-60 scale-150 transform origin-left" \n             alt=""\n           />\n           <div className="absolute inset-0 bg-gradient-to-r from-[#05050A]/20 via-[#05050A]/60 to-[#05050A]" />\n        </div>\n\n        <button \n          onClick={onClose}`;

code = code.replace(bgContentTarget, bgContentReplace);

// 3. Replace Progress Bar
const pbTarget = `              {/* Simple Timeline Progress Bar */}
              <div className={\`w-full max-w-xl flex items-center gap-4 font-bold text-white/50 tracking-wider transition-all duration-[1200ms] \${activeTab === 'letra' ? 'text-lg md:text-xl' : 'text-xs'}\`}>
                 <span className={\`text-right transition-all duration-[1200ms] \${activeTab === 'letra' ? 'w-16' : 'w-10'}\`}>{formatTime(progress * track.duration)}</span>
                 <div 
                   className="flex-1 h-2.5 md:h-3 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"
                   onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const p = (e.clientX - rect.left) / rect.width;
                      onSeek?.(p);
                   }}
                 >
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#a855f7] rounded-full pointer-events-none group-hover:brightness-125 transition-all duration-100" 
                      style={{ width: \`\${progress * 100}%\` }} 
                    />
                 </div>
                 <span className={\`transition-all duration-[1200ms] \${activeTab === 'letra' ? 'w-16' : 'w-10'}\`}>{formatTime(track.duration)}</span>
              </div>`;

const pbReplace = `              {/* Squiggly Timeline Progress Bar */}
              <div className={\`w-full max-w-xl flex items-center gap-4 font-bold text-white/50 tracking-wider transition-all duration-[1200ms] \${activeTab === 'letra' ? 'text-lg md:text-xl' : 'text-xs'}\`}>
                 <span className={\`text-right transition-all duration-[1200ms] \${activeTab === 'letra' ? 'w-16' : 'w-10'}\`}>{formatTime(progress * track.duration)}</span>
                 
                 <div 
                   className="flex-1 h-8 flex items-center relative cursor-pointer group"
                   onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const p = (e.clientX - rect.left) / rect.width;
                      onSeek?.(p);
                   }}
                 >
                    {/* Unplayed straight line */}
                    <div className="absolute left-0 right-0 h-[2px] bg-white/20 rounded-full" />
                    
                    {/* Played wavy line clipping container */}
                    <div className="absolute left-0 top-0 bottom-0 overflow-hidden" style={{ width: \`\${progress * 100}%\` }}>
                       <div 
                         className={\`absolute left-0 top-0 bottom-0 w-[200vw] \${isPlaying ? 'animate-wave-slide' : ''}\`}
                         style={{
                           backgroundImage: \`url("\${waveSvg}")\`,
                           backgroundRepeat: 'repeat-x',
                           backgroundPosition: 'left center',
                           backgroundSize: '24px 12px'
                         }}
                       />
                    </div>
                    
                    {/* The Dot (Handle) */}
                    <div 
                       className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transform -translate-x-1/2 pointer-events-none group-hover:scale-125 transition-transform"
                       style={{ left: \`\${progress * 100}%\` }}
                    />
                 </div>

                 <span className={\`transition-all duration-[1200ms] \${activeTab === 'letra' ? 'w-16' : 'w-10'}\`}>{formatTime(track.duration)}</span>
              </div>`;

code = code.replace(pbTarget, pbReplace);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Successfully patched ImmersivePlayer.tsx');

