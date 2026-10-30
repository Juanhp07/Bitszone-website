/**
 * Sidebar toggle icon: a window with the sidebar's separator line inside, nothing filled.
 * Open: the line sits further in. Minimized: it slides to the edge. It animates between both, so the icon always
 * shows how the sidebar looks right now. `flip` mirrors it for a drawer that opens from the right.
 */
export const SidebarToggleIcon = ({ open, flip = false }: { open: boolean; flip?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-[22px] h-[22px] shrink-0 overflow-visible ${flip ? '-scale-x-100' : ''}`}
    fill="none"
    aria-hidden="true"
  >
    {/* the window (same proportions as the usual panel icon, so it reads as a screen and not as a battery) */}
    <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.7" />
    {/* the separator line: slides in and out with the sidebar's width */}
    <line
      x1="10"
      y1="3.4"
      x2="10"
      y2="20.6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      style={{ transform: open ? 'translateX(0)' : 'translateX(-4px)' }}
    />
  </svg>
);
