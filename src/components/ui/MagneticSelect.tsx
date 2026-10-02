import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const stillness = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// EXACT BENCHO CONSTANTS - DO NOT CHANGE
const CHIP = 44;
const H_PAD = 26;
const PITCH = 45;
const SPREAD = 2.8;

const CLUSTER: Record<number, [number, number][]> = {
  3: [[0, -26], [22.5, 13], [-22.5, 13]],
  7: [[0, 0], [45, 0], [22.5, -39], [-22.5, -39], [-45, 0], [-22.5, 39], [22.5, 39]],
};

export function MagneticSelect({
  items,
  selectedIndex,
  onSelect,
  pull = 55,
  bounce = 55,
  give = 50,
}: {
  items: Array<{ color: string, label: string }>;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  pull?: number;
  bounce?: number;
  give?: number;
}) {
  const n = items.length;
  // Use exact packing for 7 items
  const pts = CLUSTER[n] || CLUSTER[7];
  const [sel, setSel] = useState<number | null>(selectedIndex);
  
  // Keep internal state in sync with external if it changes
  useEffect(() => {
    setSel(selectedIndex);
  }, [selectedIndex]);

  const at = sel === null || sel >= n ? null : sel;
  const p = clamp(pull, 0, 100) / 100;

  const grow = 1.16 + 0.22 * p;
  const room = (CHIP * (grow - 1)) / 2;
  const aura = 3 + 9 * p;
  const tilt = 5 * p;
  const cower = 0.04 + 0.09 * p;

  const FADE = 44;
  const wrap = useRef<HTMLDivElement | null>(null);
  const hub = useRef({ x: 0, y: 0, r: 1 });
  const [lean, setLean] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const still = stillness();

  const xs = pts.map((q) => q[0]);
  const ys = pts.map((q) => q[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const W = Math.max(...xs) - minX + CHIP + H_PAD * 2;
  const H = Math.max(...ys) - minY + CHIP + H_PAD * 2;

  const zeta = 0.9 - 0.48 * (clamp(bounce, 0, 100) / 100);
  const swing = (k: number, mass: number) => ({
    type: "spring" as const,
    stiffness: k,
    damping: 2 * Math.sqrt(k * mass) * zeta,
    mass,
  });

  const field = pts.map(([px, py], i) => {
    if (at === null) {
      return { far: 0, fall: 0, push: 0, ux: 0, uy: 0,
        cx: px - minX + H_PAD + CHIP / 2,
        cy: py - minY + H_PAD + CHIP / 2 };
    }
    const [ax, ay] = pts[at];
    const dx = px - ax;
    const dy = py - ay;
    const gap = Math.hypot(dx, dy);
    const far = gap / PITCH;
    const fall = i === at ? 0 : Math.exp(-(far - 1) / SPREAD);
    const push = i === at ? 0 : room + aura;
    const ux = gap ? dx / gap : 0;
    const uy = gap ? dy / gap : 0;
    return { far, fall, push, ux, uy,
      cx: px - minX + H_PAD + CHIP / 2 + ux * push,
      cy: py - minY + H_PAD + CHIP / 2 + uy * push };
  });

  hub.current = {
    x: W / 2,
    y: H / 2,
    r: Math.max(1, ...field.map((f) =>
      Math.hypot(f.cx - W / 2, f.cy - H / 2) + CHIP / 2)),
  };

  useEffect(() => {
    const el = wrap.current;
    if (!el || !give || still) return;
    let raf = 0;
    let next = { x: 0, y: 0 };
    const publish = () => { raf = 0; setLean(next); };
    const read = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      const k = b.width / (el.offsetWidth || b.width) || 1;
      const mx = (e.clientX - b.left) / k;
      const my = (e.clientY - b.top) / k;
      const { x: hx, y: hy, r } = hub.current;
      const dx = mx - hx;
      const dy = my - hy;
      const d = Math.hypot(dx, dy);
      const rise = Math.min(1, d / r);
      const away = d <= r ? 1 : Math.max(0, 1 - (d - r) / FADE);
      const drawn = rise * away * (2 + (clamp(give, 0, 100) / 100) * 5);
      next = drawn > 0
        ? { x: (dx / (d || 1)) * drawn, y: (dy / (d || 1)) * drawn }
        : { x: 0, y: 0 };
      if (!raf) raf = requestAnimationFrame(publish);
    };
    const gone = () => { next = { x: 0, y: 0 }; if (!raf) raf = requestAnimationFrame(publish); };
    document.addEventListener("pointermove", read, { passive: true });
    document.addEventListener("pointerleave", gone);
    return () => {
      document.removeEventListener("pointermove", read);
      document.removeEventListener("pointerleave", gone);
      cancelAnimationFrame(raf);
    };
  }, [give, still, n]);

  const choose = (i: number) => {
    if (i === at) return;
    setSel(i);
    onSelect(i);
  };

  return (
    <div className="relative z-10 select-none" ref={wrap} style={{ width: W, height: H }} role="radiogroup">
      {pts.map(([px, py], i) => {
        const on = i === at;
        const { far, fall, push, ux, uy } = field[i];
        const k = 300 + 280 * (1 - Math.min(far, 3) / 4);
        const wait = far * 0.022;

        return (
          <motion.button
            key={i}
            className="absolute rounded-full flex items-center justify-center cursor-pointer transition-shadow"
            role="radio"
            aria-checked={on}
            aria-label={items[i]?.label}
            style={{
              left: px - minX + H_PAD,
              top: py - minY + H_PAD,
              width: CHIP,
              height: CHIP,
              zIndex: on ? 20 : 10,
            }}
            onClick={() => choose(i)}
            initial={false}
            animate={{
              x: ux * push,
              y: uy * push,
              scaleX: on ? grow : 1 - cower * fall,
              scaleY: on ? grow : 1 - cower * fall,
              rotate: ux * tilt * fall,
            }}
            transition={{
              x: { ...swing(k, 0.9), delay: wait },
              y: { ...swing(k, 0.9), delay: wait },
              scaleX: { ...swing(k * 1.24, 0.8), delay: wait },
              scaleY: { ...swing(k * 0.86, 0.95), delay: wait },
              rotate: { ...swing(k * 0.8, 1), delay: wait },
            }}
          >
            {/* 
              This inner element matches Bencho's .mag-skin
              It handles the lean and hover scale with a very specific springy cubic-bezier
              so it "trembles" or follows the cursor smoothly.
            */}
            <span
              className="absolute inset-0 rounded-full flex items-center justify-center hover:scale-[1.045]"
              style={{
                translate: `${lean.x.toFixed(2)}px ${lean.y.toFixed(2)}px`,
                transitionProperty: "translate, transform, background-color, box-shadow",
                transitionDuration: "260ms",
                transitionTimingFunction: "cubic-bezier(0.18, 0.89, 0.32, 1.28)",
                background: on ? `linear-gradient(135deg, ${items[i].color}, #00FFFF)` : '#1c1c20',
                boxShadow: on ? `0 10px 25px ${items[i].color}90, inset 0 2px 4px rgba(255,255,255,0.3)` : 'inset 0 1px 1px rgba(255,255,255,0.05)',
              }}
            >
              {/* Absolutamente el MISMO tamaño de fuente para todos (text-[13px]).
                  El tamaño visual crece un 28% gracias a la propiedad 'grow' del padre, 
                  evitando que el número activo se vea desproporcionadamente gordo. */}
              <span className={`font-sora font-bold transition-colors duration-300 text-[13px] ${on ? 'text-white' : 'text-white/60'}`}>
                {i + 1}
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
