import { useState, useEffect, useRef } from "react";

export default function useMeasure<T extends HTMLElement>() {
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setBounds({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref as any, bounds] as const;
}
