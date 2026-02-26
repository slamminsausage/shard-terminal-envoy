import { useRef, useCallback } from 'react';

/**
 * Returns a ref to attach to any element and a `shake()` function.
 * Calling shake() adds `.screen-shake` for one animation cycle then removes it.
 */
export function useScreenShake<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  const shake = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Remove first in case it's still animating, force reflow, then re-add
    el.classList.remove('screen-shake');
    void el.offsetWidth; // reflow
    el.classList.add('screen-shake');
    const onEnd = () => {
      el.classList.remove('screen-shake');
      el.removeEventListener('animationend', onEnd);
    };
    el.addEventListener('animationend', onEnd);
  }, []);

  return { ref, shake };
}
