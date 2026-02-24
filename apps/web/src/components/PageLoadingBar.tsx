'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function PageLoadingBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    // Clear any pending hide
    if (hideTimer.current) clearTimeout(hideTimer.current);

    // Show bar and animate to ~80%
    setVisible(true);
    setWidth(0);
    // Slight delay to allow repaint before animating
    const startTimer = setTimeout(() => setWidth(80), 16);

    // After navigation settles, complete bar then fade out
    hideTimer.current = setTimeout(() => {
      setWidth(100);
      setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 300);
    }, 400);

    return () => {
      clearTimeout(startTimer);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="page-loading-bar"
      role="progressbar"
      aria-label="Page loading"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ width: `${width}%` }}
    />
  );
}
