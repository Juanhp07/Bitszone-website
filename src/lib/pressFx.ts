// Site-wide press micro-interaction: anything clickable dips when pressed and springs back with a small overshoot.
// It animates the standalone `scale` property with the Web Animations API, so it never fights the element's own
// transitions or `transform` utilities. data-no-pressfx opts out a whole subtree (sidebar, phone tab bar, seek bars);
// data-no-pressfx-self opts out only that element, not what is inside it.

const CLICKABLE = 'button, [role="button"], [role="tab"], [role="menuitem"], a[href], summary, .cursor-pointer';

// bigger things dip less, so a full-width button or a row doesn't visibly shrink
const dipFor = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  const small = Math.min(width, height);
  return small < 64 ? 0.86 : width < 280 ? 0.94 : 0.985;
};

export const installPressFx = () => {
  if (typeof window === 'undefined' || (window as any).__pressFx) return;
  (window as any).__pressFx = true;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  let held: { el: Element; dip: number; anim: Animation } | null = null;

  const skip = (el: Element) =>
    el.closest('[data-no-pressfx]') ||
    el.hasAttribute('data-no-pressfx-self') ||
    (el as HTMLButtonElement).disabled ||
    el.getAttribute('aria-disabled') === 'true' ||
    // these already have their own press feedback
    /(^|\s)(pop-press|active:scale-\S+)(\s|$)/.test(el.getAttribute('class') ?? '');

  const release = () => {
    if (!held) return;
    const { el, dip, anim } = held;
    held = null;
    anim.cancel();
    if (!el.isConnected) return;
    el.animate(
      [{ scale: String(dip) }, { scale: '1.04', offset: 0.55 }, { scale: '1' }],
      { duration: 300, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
    );
  };

  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const el = (e.target as Element | null)?.closest?.(CLICKABLE);
    if (!el || skip(el)) return;
    release();
    const dip = dipFor(el);
    held = { el, dip, anim: el.animate([{ scale: '1' }, { scale: String(dip) }], { duration: 90, easing: 'ease-out', fill: 'forwards' }) };
  }, true);

  document.addEventListener('pointerup', release, true);
  document.addEventListener('pointercancel', release, true);
  // dragging away from the element ends the press too
  document.addEventListener('pointerout', (e) => { if (held && e.target === held.el && !held.el.contains(e.relatedTarget as Node)) release(); }, true);
};
