import { useEffect, useState } from 'react';
import { ACCESS_DENIED_EVENT } from './triggerAccessDenied';

/**
 * Renders a full-screen red flash when a `terminal:access-denied` event
 * is dispatched on the window. Any component can fire this via
 * `triggerAccessDenied()` from ./triggerAccessDenied.
 *
 * Mounted once globally inside CRTOverlay.
 */
export default function AccessDeniedFlash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setVisible(true);
      window.setTimeout(() => setVisible(false), 700);
    };
    window.addEventListener(ACCESS_DENIED_EVENT, handler);
    return () => window.removeEventListener(ACCESS_DENIED_EVENT, handler);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9900,
        pointerEvents: 'none',
        animation: 'adFlash 0.7s ease-out forwards',
        background:
          'radial-gradient(ellipse at center, transparent 20%, rgba(255,30,30,0.5) 100%)',
      }}
    >
      <style>{`
        @keyframes adFlash {
          0%   { opacity:0; }
          10%  { opacity:1; }
          30%  { opacity:0.6; }
          55%  { opacity:0.85; }
          100% { opacity:0; }
        }
        @keyframes screenShake {
          0%   { transform:translate(0,0) rotate(0deg); }
          15%  { transform:translate(-4px,2px) rotate(-0.4deg); }
          30%  { transform:translate(3px,-3px) rotate(0.3deg); }
          45%  { transform:translate(-3px,3px) rotate(-0.3deg); }
          60%  { transform:translate(4px,-2px) rotate(0.4deg); }
          75%  { transform:translate(-2px,2px) rotate(-0.1deg); }
          90%  { transform:translate(2px,-2px) rotate(0.1deg); }
          100% { transform:translate(0,0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
