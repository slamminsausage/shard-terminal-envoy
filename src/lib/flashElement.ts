/** Briefly add a CSS class to an element, then remove it after the animation completes. */
export function flashElement(
  element: HTMLElement | null,
  className = "stat-glow",
  durationMs = 800
) {
  if (!element) return;
  element.classList.add(className);
  setTimeout(() => element.classList.remove(className), durationMs);
}
