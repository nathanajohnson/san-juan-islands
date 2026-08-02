/* Chart & Current icon helper — returns an inline <svg><use> for a sprite symbol.
   Usage: SJI.icon("orca-fin") or SJI.icon("ferry", "icon-lg") */
window.SJI = window.SJI || {};
window.SJI.icon = function (name, cls) {
  return '<svg class="icon' + (cls ? " " + cls : "") + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
};
