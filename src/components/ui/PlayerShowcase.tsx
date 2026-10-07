import React, { useEffect, useRef, useState } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { AlbumData } from './Scroll3DGallery';

/*
 * Sección 2 — anillo 3D de portadas + preview del Web Player delante.
 * Todo está atado al scrollYProgress del contenedor sticky de Scroll3DGallery.
 *
 * Anillo: la cámara está EN el centro del cilindro (perspective = R), así cada
 * portada es tangente al cilindro y mira de frente a la cámara; los bordes
 * inclinados son perspectiva, no rotación. Lo que pasa de ±CULL grados se oculta.
 */
const R = 891;
const N = 30;
const STEP = 360 / N;
const CULL = 44;
const SPEED = 2.4;      // grados por segundo
const SCROLL_SPIN = 70; // grados extra que gira el anillo a lo largo de la sección
const CARD = 150;

const WIKI = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/';
const ARTISTS = [
  { name: 'Kanye West', img: WIKI + '0/0f/Kanye_West_at_the_2009_Tribeca_Film_Festival-2_%28cropped%29.jpg/500px-Kanye_West_at_the_2009_Tribeca_Film_Festival-2_%28cropped%29.jpg' },
  { name: 'Incubus', img: WIKI + '7/7e/Incubus.jpg/500px-Incubus.jpg' },
  { name: 'LINKIN PARK', img: WIKI + 'd/d8/Linkin_Park_-_From_Zero_Lead_Press_Photo_-_James_Minchin_III.jpg/500px-Linkin_Park_-_From_Zero_Lead_Press_Photo_-_James_Minchin_III.jpg' },
  { name: 'Radiohead', img: WIKI + 'a/a1/RadioheadO2211125_composite.jpg/500px-RadioheadO2211125_composite.jpg' },
  { name: 'Michael Jackson', img: WIKI + 'b/b9/Michael_Jackson_1983_%283x4_cropped%29_%28contrast%29.jpg/500px-Michael_Jackson_1983_%283x4_cropped%29_%28contrast%29.jpg' },
  { name: 'Post Malone', img: WIKI + 'a/a9/Post_Malone_July_2021_%28cropped%29.jpg/500px-Post_Malone_July_2021_%28cropped%29.jpg' },
  { name: 'Bruno Mars', img: WIKI + 'b/b0/BrunoMars24KMagicWorldTourLive_%28cropped%29.jpg/500px-BrunoMars24KMagicWorldTourLive_%28cropped%29.jpg' },
  { name: '5 Seconds of Summer', img: WIKI + 'd/de/5sos-NZ4A4323.jpg/500px-5sos-NZ4A4323.jpg' },
  { name: 'Whitesnake', img: WIKI + 'e/ec/Whitesnake_1984_Promo_2.jpg/500px-Whitesnake_1984_Promo_2.jpg' },
];

const SONGS: Record<string, string> = {
  'Thriller': "Wanna Be Startin' Somethin'",
  'Meteoro': 'Foreword',
  "Hollywood's Bleeding": "Hollywood's Bleeding",
  'CALM': 'Best Years',
  'Face Value': 'In the Air Tonight',
  'Whitesnake': 'Here I Go Again',
  'Ahora Más Que Nunca': 'Persona Ideal',
  'Rust In Peace': 'Holy Wars',
  '25th Anniversary': 'Brujería',
  'Esto Fue Lo Que Trajo El Barco': 'El Nazareno',
  'Coverizando': 'Mi Gente',
};

const Icon = ({ id }: { id: string }) => {
  const paths: Record<string, React.ReactNode> = {
    home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
    lib: <path d="M5 4v16M9 4v16M13 4l5 16" />,
    dl: <><path d="M12 12v9m-4-4 4 4 4-4" /><path d="M4.4 15.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    heart: <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />,
    kb: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></>,
    cog: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
    hd: <><path d="M22 12H2l3.5-7h13z" /><rect x="2" y="12" width="20" height="8" rx="2" /></>,
  };
  return <svg className="pv-ic" viewBox="0 0 24 24">{paths[id]}</svg>;
};

const useViewport = () => {
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return vp;
};

export const PlayerShowcase = ({ albums, progress }: { albums: AlbumData[]; progress: MotionValue<number> }) => {
  const { w: vw, h: vh } = useViewport();
  const mobile = vw < 768;
  const compact = vw < 1100; // tablets: hide the player's sidebar so the content reads larger
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const unique = albums.filter((a, i, arr) => arr.findIndex(b => b.src === a.src) === i);
  const ringAlbums = Array.from({ length: N }, (_, i) => unique[i % unique.length]);

  // ---------- geometry ----------
  const ringScale = Math.min(Math.max(vw / 1172, mobile ? 0.62 : 0.7), 1.35);
  const W = mobile ? vw * 0.94 : Math.min(1100, vw * 0.88);
  // 1 design px of the player replica. Narrower screens show fewer, larger tiles.
  const u = mobile ? W / 280 : compact ? W / 640 : W / 842;
  const H = Math.min(vh * (mobile ? 0.74 : 0.86), (mobile ? 480 : 520) * u);
  const ringCentreY = vh * (mobile ? 0.36 : 0.42);
  const peekTop = ringCentreY + CARD * 0.38 * ringScale; // the mock overlaps the lower third of the covers
  const finalTop = Math.max(16, (vh - H) / 2 + 12);

  // ---------- scroll timeline (0–1 across the 350vh section) ----------
  const ringOpacity = useTransform(progress, [0.1, 0.22, 0.46, 0.7, 0.8, 0.93], [0, 1, 1, 0.45, 0.45, 0]);
  const ringY = useTransform(progress, [0.1, 0.26, 0.42, 0.72, 0.98], [160, 0, 0, -vh * 0.22, -vh * 0.6]);
  const ringZoom = useTransform(progress, [0.1, 0.26, 0.42, 0.72], [0.86, 1, 1, 0.92]);
  const ringBlur = useTransform(progress, [0.42, 0.72], ['blur(0px)', 'blur(3px)']);

  // Rises → peeks over the ring → climbs to centre while still tilted in 3D → holds →
  // leaves upward keeping (and deepening) the tilt. Scrolling back replays it in reverse.
  const browserY = useTransform(
    progress,
    [0.16, 0.34, 0.42, 0.66, 0.76, 0.98],
    [vh + 40, peekTop, peekTop, finalTop, finalTop, -H * 0.95],
  );
  const browserScale = useTransform(progress, [0.34, 0.66, 0.76, 0.98], [0.94, 1, 1, 0.9]);
  const browserOpacity = useTransform(progress, [0.16, 0.24, 0.9, 0.99], [0, 1, 1, 0]);
  const browserTilt = useTransform(progress, [0.16, 0.34, 0.42, 0.66, 0.76, 0.98], [18, 6, 6, 9, 9, 16]);
  const glowOpacity = useTransform(progress, [0.3, 0.6, 0.76, 0.9], [0, 1, 1, 0]);
  const sweepX = useTransform(progress, [0.3, 0.55], ['-30%', '130%']);

  const row2Opacity = useTransform(progress, [0.46, 0.56], [0, 1]);
  const row2Y = useTransform(progress, [0.46, 0.56], [24, 0]);
  const row3Opacity = useTransform(progress, [0.54, 0.64], [0, 1]);
  const row3Y = useTransform(progress, [0.54, 0.64], [24, 0]);

  // ---------- ring loop (direct DOM writes, no React re-render per frame) ----------
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, last: number | null = null, phase = -2;
    const onVis = () => { last = null; };
    document.addEventListener('visibilitychange', onVis);
    const tick = (t: number) => {
      if (last === null) last = t;
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      if (!reduced) phase -= SPEED * dt;
      if (ringOpacity.get() > 0.001) {
        const p = phase - progress.get() * SCROLL_SPIN;
        for (let i = 0; i < N; i++) {
          const el = cardsRef.current[i];
          if (!el) continue;
          const a = (((i * STEP + p) % 360) + 540) % 360 - 180; // signed angle −180..180
          if (Math.abs(a) > CULL) { el.style.visibility = 'hidden'; continue; }
          el.style.visibility = 'visible';
          const r = (a * Math.PI) / 180, c = Math.cos(r);
          el.style.transform = `translate3d(${(R * Math.sin(r)).toFixed(2)}px,0,${(R * (1 - c)).toFixed(2)}px) rotateY(${(-a).toFixed(2)}deg)`;
          el.style.filter = `brightness(${(0.8 + 0.5 * (1 / c - 1)).toFixed(3)})`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); };
  }, [progress, ringOpacity]);

  const trending = unique.slice(0, 9);
  const featured = [...unique.slice(4), ...unique.slice(0, 4)].slice(0, 9);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{CSS}</style>

      {/* Anillo de portadas */}
      <motion.div className="absolute inset-0" style={{ opacity: ringOpacity, y: ringY, scale: ringZoom, filter: ringBlur }}>
        <div
          className="pv-ring"
          style={{
            left: `calc(50% - 586px)`,
            top: ringCentreY - 616,
            transform: `scale(${ringScale})`,
          }}
        >
          {ringAlbums.map((a, i) => (
            <div key={i} ref={el => { cardsRef.current[i] = el; }} className="pv-card" style={{ visibility: 'hidden' }}>
              <img src={a.src} alt="" loading="lazy" draggable={false} />
              <div className="pv-edge" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Halo detrás de la preview */}
      <motion.div
        className="pv-glow"
        style={{ opacity: glowOpacity, width: W * 1.15, height: H * 0.9, top: finalTop + H * 0.1 }}
      />

      {/* Preview del Web Player */}
      <motion.div
        className={`pv-browser${compact ? ' pv-mobile' : ''}`}
        style={{
          width: W,
          height: H,
          y: browserY,
          x: '-50%',
          scale: browserScale,
          opacity: browserOpacity,
          rotateX: browserTilt,
          transformPerspective: 1400,
          ['--u' as any]: u,
        }}
      >
        <motion.div className="pv-sweep" style={{ left: sweepX }} />
        <div className="pv-bar">
          <div className="pv-dots"><i style={{ background: '#ee5c62' }} /><i style={{ background: '#f6b719' }} /><i style={{ background: '#12c02f' }} /></div>
          <div className="pv-omni">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.8-3.8" /></svg>
            <span>bitszone.app/player</span>
          </div>
          <div className="pv-tools">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0L8 8m4-4 4 4" /><path d="M4 15v5h16v-5" /></svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            <svg viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinejoin="round"><path d="M12 3 3 8l9 5 9-5-9-5Z" fill="#fff" opacity=".95" /><path d="M3 13l9 5 9-5" fill="none" opacity=".55" /></svg>
          </div>
        </div>

        <div className="pv-page">
          <div className="pv-top">
            <div className="pv-burger"><i /><i /><i /></div>
            <div className="pv-logo">Bitszone</div>
            <div className="pv-acc"><Icon id="user" />Acceder</div>
          </div>

          <aside className="pv-side">
            <div className="pv-item on"><Icon id="home" />Inicio</div>
            <div className="pv-item"><Icon id="lib" />Biblioteca</div>
            <div className="pv-item"><Icon id="dl" />Mis descargas</div>
            <div className="pv-foot">
              <div className="pv-item"><Icon id="kb" />Atajos</div>
              <div className="pv-item"><Icon id="cog" />Configuración</div>
              <div className="pv-store">
                <small><Icon id="hd" />Almacenamiento</small>
                <p>4.94GB <span>de 5.00GB</span></p>
                <div><i /></div>
              </div>
            </div>
          </aside>

          <main className="pv-main">
            <section>
              <div className="pv-head"><h4>Canciones del momento</h4><span>Mostrar todo</span></div>
              <div className="pv-row">
                {trending.map((a, i) => (
                  <div className="pv-tile" key={i}>
                    <img src={a.src} alt="" loading="lazy" />
                    <div className="pv-meta">
                      <div><b>{SONGS[a.title] || a.title}</b><em>{a.artist}</em></div>
                      <Icon id="heart" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <motion.section style={{ opacity: row2Opacity, y: row2Y }}>
              <div className="pv-head"><h4>Artistas populares</h4><span>Mostrar todo</span></div>
              <div className="pv-row">
                {ARTISTS.map((a, i) => (
                  <div className="pv-art" key={i}>
                    <img src={a.img} alt="" loading="lazy" />
                    <b>{a.name}</b><em>Artista</em>
                  </div>
                ))}
              </div>
            </motion.section>
            <motion.section style={{ opacity: row3Opacity, y: row3Y }}>
              <div className="pv-head"><h4>Álbumes destacados</h4><span>Mostrar todo</span></div>
              <div className="pv-row">
                {featured.map((a, i) => (
                  <div className="pv-tile" key={i}>
                    <img src={a.src} alt="" loading="lazy" />
                    <div className="pv-meta"><div><b>{a.title}</b><em>{a.artist}</em></div></div>
                  </div>
                ))}
              </div>
            </motion.section>
          </main>
        </div>
      </motion.div>
    </div>
  );
};

const CSS = `
.pv-ring{position:absolute;width:1172px;height:657px;perspective:${R}px;perspective-origin:586px 918px;
  transform-style:preserve-3d;transform-origin:586px 616px;pointer-events:none}
.pv-card{position:absolute;left:586px;top:616px;width:${CARD}px;height:${CARD}px;margin:${-CARD / 2}px 0 0 ${-CARD / 2}px;
  border-radius:14px;overflow:hidden;background:#140c22;backface-visibility:hidden;will-change:transform;
  box-shadow:0 24px 46px rgba(0,0,0,.6),0 3px 8px rgba(0,0,0,.5)}
.pv-card img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover}
.pv-edge{position:absolute;inset:0;border-radius:14px;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.14),inset 0 18px 30px rgba(255,255,255,.06)}

.pv-glow{position:absolute;left:50%;transform:translateX(-50%);pointer-events:none;border-radius:50%;
  background:radial-gradient(closest-side,rgba(82,39,255,.42),rgba(255,159,252,.16) 55%,transparent);filter:blur(40px)}

.pv-browser{position:absolute;left:50%;top:0;border-radius:calc(22px*var(--u)) calc(22px*var(--u)) calc(14px*var(--u)) calc(14px*var(--u));
  overflow:hidden;transform-origin:50% 0;transform-style:preserve-3d;
  background:rgba(20,20,26,.82);
  box-shadow:0 -14px 44px rgba(0,0,0,.55),0 40px 120px rgba(0,0,0,.6),inset 0 0 0 1px rgba(255,255,255,.07);
  font-family:Inter,system-ui,sans-serif;color:#fff}
.pv-sweep{position:absolute;top:0;width:28%;height:1.5px;z-index:5;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(255,159,252,.9),transparent);filter:blur(.4px)}
.pv-bar{position:absolute;left:0;top:0;width:100%;height:calc(42px*var(--u));
  background:linear-gradient(180deg,rgba(34,22,58,.7),rgba(20,14,36,.8));
  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.pv-dots{position:absolute;left:calc(27px*var(--u));top:calc(16px*var(--u));display:flex;gap:calc(2.6px*var(--u))}
.pv-dots i{width:calc(7.6px*var(--u));height:calc(7.6px*var(--u));border-radius:50%}
.pv-omni{position:absolute;left:50%;transform:translateX(-50%);top:calc(7px*var(--u));width:40%;height:calc(26px*var(--u));
  border-radius:calc(5px*var(--u));background:rgba(9,8,20,.93);box-shadow:inset 0 0 0 1px rgba(255,255,255,.05);
  display:flex;align-items:center;justify-content:center;gap:calc(6px*var(--u))}
.pv-omni svg{width:calc(9px*var(--u));height:calc(9px*var(--u));opacity:.72}
.pv-omni span{font-size:calc(9.5px*var(--u));color:rgba(255,255,255,.72)}
.pv-tools{position:absolute;right:calc(27px*var(--u));top:calc(14px*var(--u));display:flex;align-items:center;gap:calc(4px*var(--u));opacity:.9}
.pv-tools svg{width:calc(11px*var(--u));height:calc(12px*var(--u))}

.pv-page{position:absolute;left:calc(7px*var(--u));right:calc(6px*var(--u));top:calc(42px*var(--u));bottom:0;overflow:hidden;
  border-radius:calc(10px*var(--u)) calc(10px*var(--u)) 0 0;
  background:linear-gradient(180deg,#1d0d35 0%,#140a26 35%,#0b0712 100%)}
.pv-ic{width:calc(8px*var(--u));height:calc(8px*var(--u));flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.pv-top{position:absolute;left:0;right:0;top:0;height:calc(34px*var(--u))}
.pv-burger{position:absolute;left:calc(14px*var(--u));top:50%;transform:translateY(-50%);display:grid;gap:calc(2px*var(--u))}
.pv-burger i{display:block;width:calc(8px*var(--u));height:1px;background:rgba(255,255,255,.85)}
.pv-logo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:"DM Serif Display","Playfair Display",serif;
  font-style:italic;font-size:calc(18px*var(--u));line-height:1;letter-spacing:.01em}
.pv-acc{position:absolute;right:calc(14px*var(--u));top:50%;transform:translateY(-50%);display:flex;align-items:center;
  gap:calc(3px*var(--u));height:calc(16px*var(--u));padding:0 calc(8px*var(--u));border-radius:99px;
  border:1px solid rgba(255,255,255,.2);font-size:calc(6px*var(--u));font-weight:600}
.pv-acc .pv-ic{width:calc(6px*var(--u));height:calc(6px*var(--u))}
.pv-side{position:absolute;left:0;top:calc(34px*var(--u));width:calc(110px*var(--u));bottom:0;padding-top:calc(10px*var(--u))}
.pv-item{display:flex;align-items:center;gap:calc(7px*var(--u));height:calc(21px*var(--u));
  margin:0 calc(6px*var(--u)) calc(3px*var(--u));padding-left:calc(8px*var(--u));border-radius:calc(5px*var(--u));
  font-size:calc(7px*var(--u));font-weight:600;color:rgba(255,255,255,.72)}
.pv-item.on{background:rgba(255,255,255,.09);color:#fff}
.pv-foot{position:absolute;left:0;right:0;bottom:0}
.pv-store{margin-top:calc(6px*var(--u));padding:calc(10px*var(--u)) calc(10px*var(--u)) calc(12px*var(--u));border-top:1px solid rgba(255,255,255,.06)}
.pv-store small{display:flex;align-items:center;gap:calc(3px*var(--u));font-size:calc(4.6px*var(--u));font-weight:600;letter-spacing:.08em;color:rgba(255,255,255,.55)}
.pv-store small .pv-ic{width:calc(5px*var(--u));height:calc(5px*var(--u))}
.pv-store p{margin-top:calc(3px*var(--u));font-size:calc(5.4px*var(--u));font-weight:700}
.pv-store p span{font-weight:400;color:rgba(255,255,255,.55)}
.pv-store div{margin-top:calc(5px*var(--u));height:calc(5px*var(--u));border-radius:9px;background:rgba(255,255,255,.07);overflow:hidden}
.pv-store div i{display:block;width:4%;height:100%;background:#ff4fd8;border-radius:9px}
.pv-main{position:absolute;left:calc(111px*var(--u));top:calc(34px*var(--u));right:0;bottom:0;overflow:hidden;
  border-radius:calc(10px*var(--u)) 0 0 0;padding:calc(14px*var(--u)) calc(14px*var(--u)) 0;
  background:linear-gradient(180deg,#200f33 0%,#110a1c 45%,#0a0810 100%);
  border-top:1px solid rgba(255,255,255,.06);border-left:1px solid rgba(255,255,255,.06)}
.pv-main section+section{margin-top:calc(22px*var(--u))}
.pv-head{display:flex;align-items:baseline;justify-content:space-between}
.pv-head h4{font-family:Sora,Inter,sans-serif;font-size:calc(10.5px*var(--u));font-weight:700;letter-spacing:-.015em;line-height:1;color:#fff}
.pv-head span{font-size:calc(5.8px*var(--u));color:rgba(255,255,255,.5)}
.pv-row{display:flex;gap:calc(10px*var(--u));margin-top:calc(10px*var(--u));
  -webkit-mask:linear-gradient(90deg,#000 88%,transparent);mask:linear-gradient(90deg,#000 88%,transparent)}
.pv-tile{flex:none;width:calc(83px*var(--u))}
.pv-tile img{display:block;width:100%;height:calc(83px*var(--u));max-width:none;object-fit:cover;border-radius:calc(3px*var(--u));background:#24163a}
.pv-meta{display:flex;justify-content:space-between;gap:calc(4px*var(--u));margin-top:calc(8px*var(--u))}
.pv-meta div{min-width:0}
.pv-meta b{display:block;font-size:calc(6.4px*var(--u));font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pv-meta em{display:block;font-style:normal;margin-top:calc(1.5px*var(--u));font-size:calc(5.2px*var(--u));color:rgba(255,255,255,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pv-meta .pv-ic{width:calc(6.5px*var(--u));height:calc(6.5px*var(--u));color:rgba(255,255,255,.5);margin-top:calc(1px*var(--u))}
.pv-art{flex:none;width:calc(70px*var(--u));text-align:center}
.pv-art img{display:block;width:100%;height:calc(70px*var(--u));max-width:none;object-fit:cover;border-radius:50%;background:#24163a}
.pv-art b{display:block;margin-top:calc(8px*var(--u));font-size:calc(6.4px*var(--u));font-weight:700;white-space:nowrap}
.pv-art em{display:block;font-style:normal;margin-top:calc(2px*var(--u));font-size:calc(5px*var(--u));color:rgba(255,255,255,.5)}

.pv-mobile .pv-side,.pv-mobile .pv-tools{display:none}
.pv-mobile .pv-main{left:0;border-radius:0;border-left:0}
.pv-mobile .pv-omni{width:58%}
`;

export default PlayerShowcase;
