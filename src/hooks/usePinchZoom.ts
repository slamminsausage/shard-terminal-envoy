import { useEffect, useRef, useState, RefObject } from 'react';

interface PinchZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

interface UsePinchZoomOptions {
  minScale?: number;
  maxScale?: number;
  scaleSensitivity?: number;
  onZoomChange?: (scale: number) => void;
}

/**
 * Custom hook for pinch-zoom and pan functionality on touch devices
 * Also supports mouse wheel zoom for desktop
 */
export function usePinchZoom<T extends HTMLElement>(
  options: UsePinchZoomOptions = {}
) {
  const {
    minScale = 0.5,
    maxScale = 4,
    scaleSensitivity = 0.01,
    onZoomChange
  } = options;

  const ref = useRef<T>(null);
  const [transform, setTransform] = useState<PinchZoomState>({
    scale: 1,
    translateX: 0,
    translateY: 0
  });

  // Touch state
  const touchStartDistance = useRef<number | null>(null);
  const touchStartScale = useRef<number>(1);
  const touchStartTranslate = useRef({ x: 0, y: 0 });
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  const isPinching = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Calculate distance between two touches
    const getDistance = (touches: TouchList) => {
      if (touches.length < 2) return 0;
      const touch1 = touches[0];
      const touch2 = touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Calculate center point between two touches
    const getCenter = (touches: TouchList) => {
      if (touches.length < 2) return { x: touches[0].clientX, y: touches[0].clientY };
      const touch1 = touches[0];
      const touch2 = touches[1];
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Start pinch gesture
        e.preventDefault();
        isPinching.current = true;
        touchStartDistance.current = getDistance(e.touches);
        touchStartScale.current = transform.scale;
        touchStartTranslate.current = { x: transform.translateX, y: transform.translateY };
        lastTouchCenter.current = getCenter(e.touches);
      } else if (e.touches.length === 1 && !isPinching.current) {
        // Start pan gesture
        const touch = e.touches[0];
        lastTouchCenter.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinching.current) {
        // Handle pinch zoom
        e.preventDefault();
        const currentDistance = getDistance(e.touches);
        const currentCenter = getCenter(e.touches);

        if (touchStartDistance.current && lastTouchCenter.current) {
          const scaleDelta = currentDistance / touchStartDistance.current;
          let newScale = touchStartScale.current * scaleDelta;
          newScale = Math.max(minScale, Math.min(maxScale, newScale));

          // Pan during pinch
          const translateDeltaX = (currentCenter.x - lastTouchCenter.current.x);
          const translateDeltaY = (currentCenter.y - lastTouchCenter.current.y);

          setTransform({
            scale: newScale,
            translateX: touchStartTranslate.current.x + translateDeltaX,
            translateY: touchStartTranslate.current.y + translateDeltaY
          });

          if (onZoomChange) {
            onZoomChange(newScale);
          }
        }
      } else if (e.touches.length === 1 && !isPinching.current && lastTouchCenter.current) {
        // Handle single-finger pan
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouchCenter.current.x;
        const deltaY = touch.clientY - lastTouchCenter.current.y;

        setTransform(prev => ({
          ...prev,
          translateX: prev.translateX + deltaX,
          translateY: prev.translateY + deltaY
        }));

        lastTouchCenter.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        isPinching.current = false;
        touchStartDistance.current = null;
      }
      if (e.touches.length === 0) {
        lastTouchCenter.current = null;
      }
    };

    // Mouse wheel zoom support
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * scaleSensitivity;
        let newScale = transform.scale + delta;
        newScale = Math.max(minScale, Math.min(maxScale, newScale));

        setTransform(prev => ({
          ...prev,
          scale: newScale
        }));

        if (onZoomChange) {
          onZoomChange(newScale);
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('wheel', handleWheel);
    };
  }, [transform, minScale, maxScale, scaleSensitivity, onZoomChange]);

  const resetZoom = () => {
    setTransform({
      scale: 1,
      translateX: 0,
      translateY: 0
    });
  };

  return {
    ref,
    transform,
    resetZoom,
    style: {
      transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
      transformOrigin: 'center',
      transition: isPinching.current ? 'none' : 'transform 0.1s ease-out'
    }
  };
}
