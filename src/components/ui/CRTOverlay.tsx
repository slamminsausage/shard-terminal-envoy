/**
 * CRTOverlay Component
 *
 * Provides vintage CRT monitor effects across the entire application:
 * - Animated scanlines + vignette (via .crt-overlay CSS in design-system.css)
 * - Access-denied flash broadcast (listens on `terminal:access-denied`)
 * - Optional idle Builder screensaver
 *
 * Mounted once in App.tsx. All inner overlays are pointer-events: none
 * except the screensaver, which intercepts input to dismiss itself.
 */

import { useEffect, useRef, useState } from 'react';
import AccessDeniedFlash from '@/components/effects/AccessDeniedFlash';
import BuilderScreensaver from '@/components/effects/BuilderScreensaver';

interface CRTOverlayProps {
  /** Enable the idle Builder screensaver. Default: true. */
  idleScreensaver?: boolean;
  /** ms of inactivity before the screensaver appears. Default: 120000 (2 min). */
  idleTimeout?: number;
}

export default function CRTOverlay({
  idleScreensaver = true,
  idleTimeout = 120000,
}: CRTOverlayProps = {}) {
  const [showScreensaver, setShowScreensaver] = useState(false);
  const idleRef = useRef<number | null>(null);

  useEffect(() => {
    if (!idleScreensaver) return;
    const clear = () => {
      if (idleRef.current !== null) {
        window.clearTimeout(idleRef.current);
        idleRef.current = null;
      }
    };
    const reset = () => {
      clear();
      if (showScreensaver) return;
      idleRef.current = window.setTimeout(
        () => setShowScreensaver(true),
        idleTimeout
      );
    };
    const events: Array<keyof WindowEventMap> = [
      'keydown',
      'mousemove',
      'click',
      'touchstart',
    ];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clear();
    };
  }, [idleScreensaver, idleTimeout, showScreensaver]);

  return (
    <>
      <div className="crt-overlay" />
      <AccessDeniedFlash />
      {showScreensaver && (
        <BuilderScreensaver onDismiss={() => setShowScreensaver(false)} />
      )}
    </>
  );
}
