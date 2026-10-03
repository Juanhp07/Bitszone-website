const fs = require('fs');
let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const targetUrl = 'url: `${supabaseUrl}/storage/v1/object/public/music/Triste%20Payaso.mp3`,';
const newUrl = 'url: `${supabaseUrl || "http://127.0.0.1:54321"}/storage/v1/object/public/music/Triste%20Payaso.mp3`.replace("localhost:54321", "127.0.0.1:54321"),';

code = code.replace(targetUrl, newUrl);

const targetPreview = 'previewUrl: "",';
const newPreview = 'previewUrl: `${supabaseUrl || "http://127.0.0.1:54321"}/storage/v1/object/public/music/Triste%20Payaso.mp3`.replace("localhost:54321", "127.0.0.1:54321"),';

code = code.replace(targetPreview, newPreview);

const targetPlay = `setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.src = trackData.url;
              audioRef.current.play().catch(console.error);
            }
          }, 100);`;

const newPlay = `setTimeout(() => {
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

code = code.replace(targetPlay, newPlay);

fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log('Fixed sad track URL encoding and play sequence');
