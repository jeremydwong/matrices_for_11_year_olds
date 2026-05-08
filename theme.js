// Theme configuration — edit this file to customize the look and feel.
// See theme-orig.js for the original dark theme.
//
// NOTE: index.html has a matching body background to prevent flash-of-white
// on load. If you change colors.bg, update the <style> in index.html too.

export const colors = {
  // Backgrounds & surfaces
  bg:           "#f5f3ee",
  surface:      "#eae7e0",
  surfaceLight: "#fff",
  border:       "#d2cfc8",

  // Text
  text:         "#2a2a2a",
  muted:        "#7a756c",

  // Accents
  cyan:         "#0079a1",
  magenta:      "#c0365e",
  gold:         "#a87b00",
  green:        "#2e854e",
  orange:       "#c25c0a",
  purple:       "#7344b0",

  // Grid overlay (used in SVG plots)
  grid:         "rgba(120, 110, 90, 0.10)",
  gridAxis:     "rgba(80, 75, 60, 0.25)",
};

export const fonts = {
  mono: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif",
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
