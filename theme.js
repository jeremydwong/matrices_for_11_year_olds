// Theme tokens — derived from the reference stylesheets in styles/reference/
// (normalize.css, skeleton.css, custom.css), matching the sibling sites:
//
//   bg      #242424            custom.css  `html { background-color: #242424 }`
//   surface #28292c            custom.css  `:root { --dark: #28292c }`
//   text    #cccccc            custom.css  `body { color: #cccccc }`
//   muted   #999999            custom.css  `.heading-font-size { color: #999 }`
//   cyan    #33C3F0            skeleton.css `.button-primary` / custom.css `.navbar-link.active`
//   gold    #ffc107            custom.css  toggle checked knob gradient
//
// The remaining accents aren't in the reference files; they're chosen to sit
// alongside that palette on the dark background. theme-orig.js keeps the
// original dark theme; the warm/cream palette this replaced is in git history.
//
// NOTE: index.html has a matching body background to prevent flash-of-white
// on load. If you change colors.bg, update the <style> in index.html too.

export const colors = {
  // Backgrounds & surfaces
  bg:           "#242424",
  surface:      "#28292c",
  surfaceLight: "#2f3034",
  border:       "#3d3e42",

  // Text
  text:         "#cccccc",
  muted:        "#999999",

  // Accents
  cyan:         "#33C3F0",
  magenta:      "#e0568a",
  gold:         "#ffc107",
  green:        "#4ade80",
  orange:       "#e8944a",
  purple:       "#9d8bd6",

  // Grid overlay (used in SVG plots)
  grid:         "rgba(200, 205, 215, 0.08)",
  gridAxis:     "rgba(210, 215, 225, 0.28)",
};

export const fonts = {
  mono: "'IBM Plex Mono', monospace, monospace",
};

// Maps color names used in :::callout, :::takehome directives to hex values.
export const accentMap = {
  cyan:    colors.cyan,
  magenta: colors.magenta,
  gold:    colors.gold,
  green:   colors.green,
  orange:  colors.orange,
  purple:  colors.purple,
  muted:   colors.muted,
};
