// Theme configuration — edit this file to customize the look and feel.
//
// NOTE: index.html has a matching body background to prevent flash-of-white
// on load. If you change colors.bg, update the <style> in index.html too.

export const colors = {
  // Backgrounds & surfaces
  bg:           "#0c0c18",
  surface:      "#141428",
  surfaceLight: "#1e1e3a",
  border:       "#2a2a50",

  // Text
  text:         "#e4e4f0",
  muted:        "#7878a0",

  // Accents
  cyan:         "#00d4ff",
  magenta:      "#ff4d8d",
  gold:         "#ffc44d",
  green:        "#4ddb7a",
  orange:       "#ff8844",
  purple:       "#aa66ff",

  // Grid overlay (used in SVG plots)
  grid:         "rgba(80, 80, 180, 0.12)",
  gridAxis:     "rgba(120, 120, 200, 0.3)",
};

export const fonts = {
  mono: "'Space Mono', monospace",
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
