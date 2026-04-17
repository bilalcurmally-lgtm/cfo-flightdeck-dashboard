let renderFn = null;

export function registerRender(fn) {
  renderFn = fn;
}

export function render() {
  if (renderFn) renderFn();
}
