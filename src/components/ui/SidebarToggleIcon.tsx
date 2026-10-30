/**
 * Sidebar toggle icon: a window frame with its left column drawn inside. The column is full width while the sidebar
 * is open and shrinks to a thin sliver when it is minimized, so the icon always shows what the sidebar looks like now
 * (and animates between both). `flip` mirrors it for a drawer that opens from the right.
 */
export const SidebarToggleIcon = ({ open, flip = false }: { open: boolean; flip?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-[22px] h-[22px] shrink-0 overflow-visible ${flip ? '-scale-x-100' : ''}`}
    fill="none"
    aria-hidden="true"
  >
    <rect x="3" y="4.5" width="18" height="15" rx="3.5" stroke="currentColor" strokeWidth="1.8" />
    {/* the column: scaled from its left edge, with a small overshoot, and it widens a touch on hover */}
    <rect
      x="5.6"
      y="7.1"
      width="5.6"
      height="9.8"
      rx="1.6"
      fill="currentColor"
      className="transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:duration-300"
      style={{
        transformBox: 'fill-box',
        transformOrigin: 'left center',
        transform: open ? 'scaleX(1)' : 'scaleX(0.28)',
        opacity: open ? 0.95 : 0.55,
      }}
    />
  </svg>
);
