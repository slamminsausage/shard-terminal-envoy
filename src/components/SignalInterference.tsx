import { useEffect, useState } from 'react';
import audioManager from '@/lib/audioManager';

interface SignalInterferenceProps {
  level?: number;
  terminalType?: 'normal' | 'secure' | 'damaged' | 'corrupted' | string;
  soundEnabled?: boolean;
}

const SignalInterference = ({
  level = 0,
  terminalType = 'normal',
  soundEnabled = true
}: SignalInterferenceProps) => {
  const [interferenceActive, setInterferenceActive] = useState(false);
  const [staticOpacity, setStaticOpacity] = useState(0);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (level <= 0.3) {
      setInterferenceActive(false);
      setStaticOpacity(0);
      return;
    }

    let intervalId: number | undefined;
    let resetId: number | undefined;

    const originalFilter = document.body.style.filter;
    const originalTransform = document.body.style.transform;

    const triggerInterference = () => {
      if (Math.random() >= level) return;

      setInterferenceActive(true);
      setStaticOpacity(Math.random() * 0.3 + 0.1);

      if (soundEnabled) {
        audioManager.playEffect('interference', 0.2);
      }

      const effects: Array<() => void> = [
        () => {
          document.body.style.filter = `brightness(${(0.3 + Math.random() * 0.7).toFixed(2)}) contrast(${(1 + Math.random() * 0.5).toFixed(2)})`;
        },
        () => {
          document.body.style.filter = `hue-rotate(${(Math.random() * 30).toFixed(2)}deg) saturate(${(0.5 + Math.random()).toFixed(2)})`;
        },
        () => {
          document.body.style.transform = `translate(${(Math.random() * 4 - 2).toFixed(2)}px, ${(Math.random() * 4 - 2).toFixed(2)}px)`;
        }
      ];

      const effect = effects[Math.floor(Math.random() * effects.length)];
      effect();

      resetId = window.setTimeout(() => {
        document.body.style.filter = originalFilter;
        document.body.style.transform = originalTransform;
        setInterferenceActive(false);
        setStaticOpacity(0);
      }, 100 + Math.random() * 200);
    };

    intervalId = window.setInterval(
      triggerInterference,
      1000 + Math.random() * 4000
    );

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      if (resetId) window.clearTimeout(resetId);
      document.body.style.filter = originalFilter;
      document.body.style.transform = originalTransform;
      setInterferenceActive(false);
      setStaticOpacity(0);
    };
  }, [level, soundEnabled]);

  useEffect(() => {
    if (!soundEnabled) {
      return;
    }

    if (level > 0.7) {
      audioManager.playEffect('static', 0.3);
    } else if (level > 0.5) {
      audioManager.playEffect('interference', 0.2);
    } else if (level > 0.3) {
      audioManager.playEffect('terminal', 0.1);
    } else if (terminalType === 'secure') {
      audioManager.playEffect('terminal', 0.15);
    } else {
      audioManager.playEffect('terminal', 0.1);
    }

    return () => {
      // No ambient stop needed since we're using effects
    };
  }, [level, terminalType, soundEnabled]);

  if (!interferenceActive) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          opacity: staticOpacity,
          background:
            "url('data:image/svg+xml,%3Csvg viewBox=\\'0 0 100 100\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noiseFilter\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.9\\' numOctaves=\\'4\\' /%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23noiseFilter)\\' /%3E%3C/svg%3E')",
          mixBlendMode: 'screen'
        }}
      />

      {level > 0.5 && (
        <div
          className="pointer-events-none fixed inset-0 z-40"
          style={{
            background:
              'repeating-linear-gradient(0deg, rgba(0,255,0,0.03) 0px, transparent 1px, transparent 2px, rgba(0,255,0,0.03) 3px)',
            animation: 'scanlines 8s linear infinite'
          }}
        />
      )}

      <div className="fixed top-4 right-4 z-50 text-green-400 font-mono text-xs bg-black/80 p-2 border border-green-400">
        <div className="flex items-center gap-2">
          <span>SIGNAL:</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`w-1 h-3 ${index < Math.floor((1 - level) * 5) ? 'bg-green-400' : 'bg-gray-700'}`}
              />
            ))}
          </div>
          <span>{Math.floor((1 - level) * 100)}%</span>
        </div>
      </div>
    </>
  );
};

export default SignalInterference;
