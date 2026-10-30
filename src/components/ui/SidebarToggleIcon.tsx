/**
 * Sidebar toggle icon: a screen with the sidebar's divider drawn inside.
 * Open: the divider sits further in and the column beside it is filled. Minimized: the divider slides to the edge,
 * the fill is gone and only the separator line remains. It animates between both, so the icon always shows how the
 * sidebar looks right now. `flip` mirrors it for a drawer that opens from the right.
 */
export const SidebarToggleIcon = ({ open, flip = false }: { open: boolean; flip?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-[22px] h-[22px] shrink-0 overflow-visible ${flip ? '-scale-x-100' : ''}`}
    fill="none"
    aria-hidden="true"
  >
    {/* the screen */}
    <rect x="2.5" y="5" width="19" height="14" rx="3.5" stroke="currentColor" strokeWidth="1.7" />
    {/* the column's fill, grown from the left edge with a small overshoot */}
    <rect
      x="4.4"
      y="7"
      width="5"
      height="10"
      rx="1.4"
      fill="currentColor"
      className="transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      style={{
        transformBox: 'fill-box',
        transformOrigin: 'left center',
        transform: open ? 'scaleX(1)' : 'scaleX(0)',
        opacity: open ? 0.9 : 0,
      }}
    />
    {/* the separator line: slides in/out with the sidebar's width */}
    <line
      x1="11.2"
      y1="5.2"
      x2="11.2"
      y2="18.8"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      style={{ transform: open ? 'translateX(0)' : 'translateX(-4px)' }}
    />
  </svg>
);
