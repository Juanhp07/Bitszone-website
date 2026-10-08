import { useEffect, useState } from 'react';

/** Subscribes to a media query. Starts false on both server and client (the player is SSR'd)
 *  to avoid a hydration mismatch, then syncs on mount. */
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
};

/** Phone layout: below Tailwind's `md` (768px). Use CSS (`md:`) for pure styling; reach for this
 *  only where behavior differs (header height, lyrics panel, mini player actions). */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');

/** Phones and tablets: below Tailwind's `lg` (1024px). The fixed 256px sidebar only fits from
 *  here up; below it the sidebar becomes an overlay drawer. */
export const useIsCompact = () => useMediaQuery('(max-width: 1023px)');
