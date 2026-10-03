const fs = require('fs');
let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const targetBlock = `          setIsPlaying(true);
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.src = trackData.url;
              audioRef.current.load();
              audioRef.current.play().catch(e => {
                console.error("Sad play failed:", e);
                // Fallback to local file if supabaseUrl is wrong? Or just try unescaped
                audioRef.current!.src = \`\${supabaseUrl || "http://127.0.0.1:54321"}/storage/v1/object/public/music/Triste Payaso.mp3\`.replace("localhost:54321", "127.0.0.1:54321");
                audioRef.current!.play().catch(console.error);
              });
            }
          }, 150);`;

const newBlock = `          setIsPlaying(true);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = trackData.url;
            audioRef.current.load();
            audioRef.current.play().catch(e => {
              console.error("Sad play failed:", e);
              // Fallback to unescaped URL
              audioRef.current!.src = trackData.url.replace('%20', ' ');
              audioRef.current!.play().catch(console.error);
            });
          }`;

code = code.replace(targetBlock, newBlock);

fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log('Removed setTimeout to comply with browser autoplay policies');
