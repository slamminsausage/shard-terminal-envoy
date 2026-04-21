/**
 * Fire the global access-denied flash. Listened for by AccessDeniedFlash,
 * which is mounted inside CRTOverlay.
 */
export const ACCESS_DENIED_EVENT = 'terminal:access-denied';

export const triggerAccessDenied = (): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ACCESS_DENIED_EVENT));
};
