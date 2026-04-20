export function prefersReducedMotion() {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
}

export function setAnimatedText(element, value, className = "is-updating") {
  if (!element) return;
  element.textContent = value;
  if (prefersReducedMotion()) return;
  restartClassAnimation(element, className);
}

export function markUpdated(element, className = "is-updating") {
  if (!element || prefersReducedMotion()) return;
  restartClassAnimation(element, className);
}

export function staggerChildren(container, selector, className = "motion-enter") {
  if (!container || prefersReducedMotion()) return;
  Array.from(container.querySelectorAll(selector)).forEach((child, index) => {
    child.style.setProperty("--motion-index", String(index));
    restartClassAnimation(child, className);
  });
}

function restartClassAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}
