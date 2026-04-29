import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Markdown from "./Markdown.jsx";
import { Prose, Callout, Definition, TakeHome } from "./shared-blocks.jsx";

// Vite/CRA/Webpack all support `?raw` to import a file as a string
import ch0Md from "./content/ch0-intro.md?raw";
import ch1Md from "./content/ch1-linear-systems.md?raw";
import ch2Md from "./content/ch2-transformations.md?raw";
import ch3Md from "./content/ch3-vector-shadows.md?raw";
import ch4Md from "./content/ch4-rotations.md?raw";
import ch5Md from "./content/ch5-determinants.md?raw";
import ch6Md from "./content/ch6-homogeneous.md?raw";
import ch7Md from "./content/ch7-markov-chains.md?raw";
import ch8Md from "./content/ch8-neural-networks.md?raw";
import ch9Md from "./content/ch9-summary.md?raw";

// Split a chapter's MD file on `# intro` / `# outro` headers.
// Returns { intro: string, outro: string }, either of which may be empty.
function splitMd(src) {
  const sections = { intro: "", outro: "" };
  const re = /^#\s+(intro|outro)\s*$/gim;
  const matches = [...src.matchAll(re)];
  if (matches.length === 0) {
    sections.intro = src.trim();
    return sections;
  }
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const name = m[1].toLowerCase();
    const start = m.index + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : src.length;
    sections[name] = src.slice(start, end).trim();
  }
  return sections;
}

const CONTENT = {
  0: splitMd(ch0Md),
  1: splitMd(ch1Md),
  2: splitMd(ch2Md),
  3: splitMd(ch3Md),
  4: splitMd(ch4Md),
  5: splitMd(ch5Md),
  6: splitMd(ch6Md),
  7: splitMd(ch7Md),
  8: splitMd(ch8Md),
  9: splitMd(ch9Md),
};

const COLORS = {
  bg: "#0c0c18",
  surface: "#141428",
  surfaceLight: "#1e1e3a",
  border: "#2a2a50",
  text: "#e4e4f0",
  muted: "#7878a0",
  cyan: "#00d4ff",
  magenta: "#ff4d8d",
  gold: "#ffc44d",
  green: "#4ddb7a",
  orange: "#ff8844",
  purple: "#aa66ff",
  grid: "rgba(80,80,180,0.12)",
  gridAxis: "rgba(120,120,200,0.3)",
};

// --- UTILITIES ---
const m2s = (x, y, w, h, xR, yR) => [
  ((x - xR[0]) / (xR[1] - xR[0])) * w,
  (1 - (y - yR[0]) / (yR[1] - yR[0])) * h,
];
const lerp = (a, b, t) => a + (b - a) * t;
const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// --- SHARED COMPONENTS ---
function Slider({ label, value, onChange, min = -3, max = 3, step = 0.1, color = COLORS.cyan }) {
  const [textVal, setTextVal] = useState(value.toFixed(1));

  // Sync text with external value changes (e.g., preset clicks), but don't
  // overwrite in-progress typing like "1." or "-".
  useEffect(() => {
    const parsed = parseFloat(textVal);
    if (isNaN(parsed) || Math.abs(parsed - value) > 0.01) {
      setTextVal(value.toFixed(1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleTextChange = (e) => {
    const raw = e.target.value;
    setTextVal(raw);
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 13, color: COLORS.muted,
      width: "100%", minWidth: 0, boxSizing: "border-box",
    }}>
      <span style={{
        flex: "0 0 auto",
        color, fontFamily: "'Space Mono', monospace",
        fontWeight: 700, fontSize: 12,
      }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{
          flex: "1 1 0", minWidth: 0,
          accentColor: color, height: 4,
        }} />
      <input type="text" value={textVal} onChange={handleTextChange}
        style={{
          flex: "0 0 auto",
          width: 42, padding: "3px 5px",
          background: COLORS.surfaceLight,
          border: `1px solid ${COLORS.border}`, borderRadius: 4,
          color: COLORS.text, fontFamily: "'Space Mono', monospace", fontSize: 11,
          textAlign: "center", outline: "none",
        }} />
    </label>
  );
}

function MathBlock({ children }) {
  return (
    <div style={{
      background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`,
      borderRadius: 8, padding: "12px 16px", fontFamily: "'Space Mono', monospace",
      fontSize: 14, color: COLORS.gold, margin: "10px 0", overflowX: "auto",
      lineHeight: 1.6,
    }}>
      {children}
    </div>
  );
}


function SVGCanvas({ width = 360, height = 360, xRange = [-4, 4], yRange = [-4, 4], children, showGrid = true }) {
  const w = width, h = height;
  const gridLines = [];
  if (showGrid) {
    for (let x = Math.ceil(xRange[0]); x <= Math.floor(xRange[1]); x++) {
      const [sx] = m2s(x, 0, w, h, xRange, yRange);
      gridLines.push(<line key={`vg${x}`} x1={sx} y1={0} x2={sx} y2={h}
        stroke={x === 0 ? COLORS.gridAxis : COLORS.grid} strokeWidth={x === 0 ? 1.5 : 0.7} />);
    }
    for (let y = Math.ceil(yRange[0]); y <= Math.floor(yRange[1]); y++) {
      const [, sy] = m2s(0, y, w, h, xRange, yRange);
      gridLines.push(<line key={`hg${y}`} x1={0} y1={sy} x2={w} y2={sy}
        stroke={y === 0 ? COLORS.gridAxis : COLORS.grid} strokeWidth={y === 0 ? 1.5 : 0.7} />);
    }
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: w, background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
      {gridLines}
      {typeof children === "function" ? children(w, h, xRange, yRange) : children}
    </svg>
  );
}

function Arrow({ x1, y1, x2, y2, color, strokeWidth = 2, dashed = false }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return null;
  const ux = dx / len, uy = dy / len;
  const headLen = Math.min(10, len * 0.3);
  const px = x2 - ux * headLen, py = y2 - uy * headLen;
  const nx = -uy, ny = ux;
  const hw = headLen * 0.4;
  return (
    <g>
      <line x1={x1} y1={y1} x2={px} y2={py} stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={dashed ? "4 3" : "none"} />
      <polygon points={`${x2},${y2} ${px + nx * hw},${py + ny * hw} ${px - nx * hw},${py - ny * hw}`}
        fill={color} />
    </g>
  );
}

// ==================== CHAPTER 0: INTRODUCTION ====================
function Ch0() {
  return (
    <div>
      <Markdown src={CONTENT[0].intro} />
    </div>
  );
}

// ==================== CHAPTER 1 ====================
function Ch1() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [c, setC] = useState(7);
  const [d, setD] = useState(1);
  const [e, setE] = useState(-1);
  const [f, setF] = useState(1);

  const det = a * e - b * d;
  const x = det !== 0 ? (c * e - b * f) / det : null;
  const y = det !== 0 ? (a * f - c * d) / det : null;

  return (
    <div>
      <Markdown src={CONTENT[1].intro} />

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start", margin: "16px 0" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Equations</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Space Mono', monospace", fontSize: 14, color: COLORS.text }}>
              <input type="number" value={a} onChange={e => setA(+e.target.value)} style={inputStyle} />x +
              <input type="number" value={b} onChange={e => setB(+e.target.value)} style={inputStyle} />y =
              <input type="number" value={c} onChange={e => setC(+e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Space Mono', monospace", fontSize: 14, color: COLORS.text }}>
              <input type="number" value={d} onChange={e => setD(+e.target.value)} style={inputStyle} />x +
              <input type="number" value={e} onChange={e => setE(+e.target.value)} style={inputStyle} />y =
              <input type="number" value={f} onChange={e => setF(+e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={{ fontSize: 24, color: COLORS.muted, alignSelf: "center" }}>⟶</div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Matrix Form</div>
          <MathBlock>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MatBracket>
                <div>{a} {b}</div>
                <div>{d} {e}</div>
              </MatBracket>
              <MatBracket col={COLORS.cyan}>
                <div>x</div><div>y</div>
              </MatBracket>
              <span style={{ color: COLORS.text }}>=</span>
              <MatBracket col={COLORS.magenta}>
                <div>{c}</div><div>{f}</div>
              </MatBracket>
            </div>
          </MathBlock>
        </div>
      </div>

      {det !== 0 ? (
        <div style={{
          background: `${COLORS.green}15`, border: `1px solid ${COLORS.green}40`,
          borderRadius: 8, padding: "12px 16px", margin: "12px 0",
        }}>
          <span style={{ color: COLORS.green, fontFamily: "'Space Mono', monospace", fontSize: 14 }}>
            Solution: x = {round(x)}, y = {round(y)}
          </span>
          <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 4 }}>
            Check: {a}({round(x)}) + {b}({round(y)}) = {round(a * x + b * y)} ✓
          </div>
        </div>
      ) : (
        <div style={{
          background: `${COLORS.magenta}15`, border: `1px solid ${COLORS.magenta}40`,
          borderRadius: 8, padding: "12px 16px", margin: "12px 0",
        }}>
          <span style={{ color: COLORS.magenta, fontFamily: "'Space Mono', monospace", fontSize: 14 }}>
            No unique solution! The lines are parallel (or the same line).
          </span>
        </div>
      )}

      {/* Live intersection graph */}
      <div style={{ margin: "16px 0" }}>
        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
          Graph — watch the lines move as you change the equations
        </div>
        <SVGCanvas width={400} height={400} xRange={[-6, 6]} yRange={[-6, 6]}>
          {(w, h, xR, yR) => {
            // Line 1: ax + by = c  →  y = (c - ax) / b
            // Line 2: dx + ey = f  →  y = (f - dx) / e
            const linePoints = (coeffA, coeffB, coeffC) => {
              const pts = [];
              if (Math.abs(coeffB) > 0.001) {
                // Not vertical — sample x
                for (let sx = xR[0]; sx <= xR[1]; sx += 0.1) {
                  pts.push([sx, (coeffC - coeffA * sx) / coeffB]);
                }
              } else if (Math.abs(coeffA) > 0.001) {
                // Vertical line
                const xVal = coeffC / coeffA;
                pts.push([xVal, yR[0]], [xVal, yR[1]]);
              }
              return pts;
            };
            const line1 = linePoints(a, b, c);
            const line2 = linePoints(d, e, f);
            const toPath = (pts, w, h, xR, yR) => {
              const screenPts = pts.map(([px, py]) => m2s(px, py, w, h, xR, yR));
              // Clip to viewport
              return screenPts.filter(([sx, sy]) => sx >= -50 && sx <= w + 50 && sy >= -50 && sy <= h + 50);
            };
            const s1 = toPath(line1, w, h, xR, yR);
            const s2 = toPath(line2, w, h, xR, yR);

            // Intersection point
            let intPt = null;
            if (det !== 0 && x !== null && y !== null && x >= xR[0] && x <= xR[1] && y >= yR[0] && y <= yR[1]) {
              intPt = m2s(x, y, w, h, xR, yR);
            }

            // Equation labels
            const label1Y = b !== 0 ? m2s(xR[1] - 0.5, (c - a * (xR[1] - 0.5)) / b, w, h, xR, yR) : null;
            const label2Y = e !== 0 ? m2s(xR[1] - 0.5, (f - d * (xR[1] - 0.5)) / e, w, h, xR, yR) : null;

            return (
              <g>
                {/* Line 1 */}
                {s1.length >= 2 && (
                  <polyline points={s1.map(p => p.join(",")).join(" ")}
                    fill="none" stroke={COLORS.cyan} strokeWidth={2} opacity={0.85} />
                )}
                {/* Line 2 */}
                {s2.length >= 2 && (
                  <polyline points={s2.map(p => p.join(",")).join(" ")}
                    fill="none" stroke={COLORS.magenta} strokeWidth={2} opacity={0.85} />
                )}

                {/* Line labels */}
                {label1Y && label1Y[1] > 20 && label1Y[1] < h - 10 && (
                  <text x={label1Y[0] - 40} y={label1Y[1] - 8} fill={COLORS.cyan} fontSize={11}
                    fontFamily="'Space Mono', monospace" opacity={0.8}>L₁</text>
                )}
                {label2Y && label2Y[1] > 20 && label2Y[1] < h - 10 && (
                  <text x={label2Y[0] - 40} y={label2Y[1] - 8} fill={COLORS.magenta} fontSize={11}
                    fontFamily="'Space Mono', monospace" opacity={0.8}>L₂</text>
                )}

                {/* Intersection point */}
                {intPt && (
                  <g>
                    {/* Crosshair lines */}
                    <line x1={intPt[0]} y1={0} x2={intPt[0]} y2={h}
                      stroke={COLORS.green} strokeWidth={0.5} strokeDasharray="3 4" opacity={0.4} />
                    <line x1={0} y1={intPt[1]} x2={w} y2={intPt[1]}
                      stroke={COLORS.green} strokeWidth={0.5} strokeDasharray="3 4" opacity={0.4} />
                    {/* Glow */}
                    <circle cx={intPt[0]} cy={intPt[1]} r={12} fill={COLORS.green} opacity={0.12} />
                    <circle cx={intPt[0]} cy={intPt[1]} r={6} fill={COLORS.green} opacity={0.25} />
                    <circle cx={intPt[0]} cy={intPt[1]} r={3.5} fill={COLORS.green} />
                    {/* Coordinate label */}
                    <text x={intPt[0] + 10} y={intPt[1] - 10} fill={COLORS.green} fontSize={11}
                      fontFamily="'Space Mono', monospace" fontWeight={700}>
                      ({round(x)}, {round(y)})
                    </text>
                  </g>
                )}

                {/* Parallel indicator */}
                {det === 0 && (
                  <text x={w / 2} y={h / 2} fill={COLORS.magenta} fontSize={13} textAnchor="middle"
                    fontFamily="'Space Mono', monospace" opacity={0.8}>
                    Parallel — no intersection!
                  </text>
                )}
              </g>
            );
          }}
        </SVGCanvas>
      </div>

      <Callout>
        The matrix is a machine: the left grid holds the coefficients, and it transforms
        the unknown vector [x, y] into the result vector [{c}, {f}]. Solving the equations = reversing the machine.
        The <span style={{ color: COLORS.green }}>green dot</span> on the graph is exactly where the matrix "points to" — try making the lines
        parallel and watch the solution disappear!
      </Callout>

      {/* ========== Manual algebra walkthrough ========== */}
      <ManualAlgebraWalkthrough a={a} b={b} c={c} d={d} e={e} f={f} x={x} y={y} det={det} />

      {/* ========== Ax = b and the matrix inverse ========== */}
      <div style={{ marginTop: 22 }}>
        <div style={{
          fontSize: 10, color: COLORS.gold, textTransform: "uppercase", letterSpacing: 2.5,
          fontFamily: "'Space Mono', monospace", fontWeight: 700, marginBottom: 10,
        }}>
          Shorthand: Ax = b
        </div>

        <Prose>
          There's a beautiful compact way to write what's going on. Call the coefficient matrix <b>A</b>,
          the unknown vector <b>x</b>, and the right-hand side <b>b</b>. The whole system becomes a single equation:
        </Prose>

        <MathBlock>
          <div style={{ textAlign: "center", fontSize: 16 }}>
            <b style={{ color: COLORS.gold }}>A</b> <b style={{ color: COLORS.cyan }}>x</b> = <b style={{ color: COLORS.magenta }}>b</b>
          </div>
        </MathBlock>

        <MathBlock>
          <div style={{ textAlign: "center", lineHeight: 2 }}>
            <span style={{ color: COLORS.muted }}>if</span> &nbsp;
            <b style={{ color: COLORS.gold }}>A</b> <b style={{ color: COLORS.cyan }}>x</b> = <b style={{ color: COLORS.magenta }}>b</b>,
            &nbsp; <span style={{ color: COLORS.muted }}>then</span> &nbsp;
            <b style={{ color: COLORS.cyan }}>x</b> = <b style={{ color: COLORS.gold }}>A⁻¹</b> <b style={{ color: COLORS.magenta }}>b</b>
          </div>
        </MathBlock>
      </div>

      <Markdown src={CONTENT[1].outro} />
    </div>
  );
}

// Shows step-by-step "solve each for y, set equal" for the current a,b,c,d,e,f
function ManualAlgebraWalkthrough({ a, b, c, d, e, f, x, y, det }) {
  const [open, setOpen] = useState(false);

  // Safe-divide helpers for display (avoid showing NaN)
  const canUseMethod = Math.abs(b) > 0.001 && Math.abs(e) > 0.001;

  // Intermediate products
  const bf = b * f, ec = e * c;
  const bd = b * d, ae = a * e;

  return (
    <div style={{
      marginTop: 18,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      overflow: "hidden",
    }}>
      <button onClick={() => setOpen(!open)}
        style={{
          width: "100%", textAlign: "left",
          padding: "10px 14px", background: COLORS.surfaceLight,
          border: "none", borderBottom: open ? `1px solid ${COLORS.border}` : "none",
          color: COLORS.text, fontFamily: "inherit", fontSize: 13, cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
        <span>
          <span style={{ color: COLORS.gold, fontWeight: 700, marginRight: 8 }}>{open ? "▾" : "▸"}</span>
          Want to see the manual algebra? Here's how you'd solve this by hand.
        </span>
        <span style={{ color: COLORS.muted, fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
          {open ? "hide" : "show"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "14px 16px", fontSize: 13, lineHeight: 1.8 }}>
          {!canUseMethod ? (
            <div style={{ color: COLORS.muted, fontStyle: "italic" }}>
              This particular walkthrough needs non-zero y-coefficients in both equations.
              Try changing the b or e value above.
            </div>
          ) : (
            <div>
              <Prose>
                The trick: solve each equation for <b>y</b>, then set them equal. Anything equal to the same thing is equal to each other — that gives one equation in one unknown.
              </Prose>

              <StepList>
                <Step n={1} label="Isolate y in equation 1">
                  <Eq>{a}x + {b}y = {c}</Eq>
                  <Eq>{b}y = {c} − {a}x</Eq>
                  <Eq><b style={{ color: COLORS.magenta }}>y</b> = ({c} − {a}x) / {b}</Eq>
                </Step>

                <Step n={2} label="Isolate y in equation 2">
                  <Eq>{d}x + {e}y = {f}</Eq>
                  <Eq>{e}y = {f} − {d}x</Eq>
                  <Eq><b style={{ color: COLORS.magenta }}>y</b> = ({f} − {d}x) / {e}</Eq>
                </Step>

                <Step n={3} label="Set them equal (both expressions equal y)">
                  <Eq>({c} − {a}x) / {b} = ({f} − {d}x) / {e}</Eq>
                </Step>

                <Step n={4} label="Cross-multiply to clear fractions">
                  <Eq>{e} · ({c} − {a}x) = {b} · ({f} − {d}x)</Eq>
                  <Eq>{ec} − {a * e}x = {bf} − {bd}x</Eq>
                </Step>

                <Step n={5} label="Collect x terms on one side, numbers on the other">
                  <Eq>{bd}x − {a * e}x = {bf} − {ec}</Eq>
                  <Eq>({bd - ae})x = {bf - ec}</Eq>
                </Step>

                <Step n={6} label="Solve for x">
                  {det !== 0 ? (
                    <>
                      <Eq><b style={{ color: COLORS.cyan }}>x</b> = {bf - ec} / {bd - ae} = <b style={{ color: COLORS.green }}>{round(x)}</b></Eq>
                      <div style={{ color: COLORS.muted, fontSize: 11, fontStyle: "italic", marginTop: 4 }}>
                        Notice: the denominator ({bd - ae} = b·d − a·e) is −det(A). That's not a coincidence.
                      </div>
                    </>
                  ) : (
                    <div style={{ color: COLORS.magenta }}>
                      The coefficient of x is zero — the lines are parallel, no unique solution.
                    </div>
                  )}
                </Step>

                {det !== 0 && (
                  <Step n={7} label="Back-substitute to find y">
                    <Eq>y = ({c} − {a}·{round(x)}) / {b} = <b style={{ color: COLORS.green }}>{round(y)}</b></Eq>
                  </Step>
                )}
              </StepList>

              {det !== 0 && (
                <div style={{
                  marginTop: 12, padding: "10px 12px",
                  background: `${COLORS.gold}10`, border: `1px solid ${COLORS.gold}40`,
                  borderRadius: 6, fontSize: 13, color: COLORS.text, lineHeight: 1.7,
                }}>
                  <b style={{ color: COLORS.gold }}>Punchline:</b> that was 7 steps for a 2×2 system.
                  For a 3×3 system it's worse. For 10×10, it's unmanageable by hand. The matrix equation
                  <b> Ax = b</b> collapses this whole procedure into one symbolic statement — and the computer
                  can then crunch the answer directly.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepList({ children }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>;
}

function Step({ n, label, children }) {
  return (
    <div style={{
      paddingLeft: 30, position: "relative",
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0,
        width: 22, height: 22, borderRadius: "50%",
        background: `${COLORS.gold}25`, border: `1px solid ${COLORS.gold}60`,
        color: COLORS.gold, fontSize: 11, fontFamily: "'Space Mono', monospace",
        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
      }}>{n}</div>
      <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: COLORS.text }}>
        {children}
      </div>
    </div>
  );
}

function Eq({ children }) {
  return <div style={{ paddingLeft: 4, marginBottom: 2 }}>{children}</div>;
}

const inputStyle = {
  width: 42, padding: "4px 6px", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`,
  borderRadius: 4, color: COLORS.gold, fontFamily: "'Space Mono', monospace", fontSize: 14, textAlign: "center",
};

function MatBracket({ children, col = COLORS.gold }) {
  return (
    <div style={{
      display: "inline-flex", flexDirection: "column", padding: "4px 10px",
      borderLeft: `2px solid ${col}`, borderRight: `2px solid ${col}`,
      borderRadius: 3, gap: 2, fontSize: 14, color: col, textAlign: "center", minWidth: 36,
    }}>
      {children}
    </div>
  );
}

// ==================== CHAPTER 2 ====================
function Ch2({ jumpTo }) {
  const [step, setStep] = useState(1);
  const [mat, setMat] = useState([2, -1, 1, 1.5]);
  const setM = (i, v) => { const m = [...mat]; m[i] = v; setMat(m); };
  const [vx, setVx] = useState(3);
  const [vy, setVy] = useState(1);

  // Result of matrix × vector
  const rx = mat[0] * vx + mat[1] * vy;
  const ry = mat[2] * vx + mat[3] * vy;

  const presets = [
    { name: "Identity", m: [1, 0, 0, 1] },
    { name: "Stretch X", m: [2, 0, 0, 1] },
    { name: "Shear", m: [1, 0.7, 0, 1] },
    { name: "Flip", m: [-1, 0, 0, 1] },
    { name: "Rotate 45°", m: [0.707, -0.707, 0.707, 0.707] },
    { name: "Squish", m: [1, 0.5, 0.5, 1] },
  ];

  const stepBtns = [
    { n: 1, label: "The Rule" },
    { n: 2, label: "One Point" },
    { n: 3, label: "All of Space" },
  ];

  return (
    <div>
      {/* Step tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
        {stepBtns.map(s => (
          <button key={s.n} onClick={() => setStep(s.n)}
            style={{
              padding: "8px 14px", fontSize: 12, background: "transparent",
              border: "none", borderBottom: `2px solid ${step === s.n ? COLORS.cyan : "transparent"}`,
              color: step === s.n ? COLORS.cyan : COLORS.muted,
              cursor: "pointer", fontFamily: "inherit", fontWeight: step === s.n ? 700 : 400,
            }}>
            Part {String.fromCharCode(64 + s.n)}: {s.label}
          </button>
        ))}
      </div>

      {/* ===================== STEP 1: How multiplication works ===================== */}
      {step === 1 && (
        <div>
          <Prose>
            Before a matrix can do anything cool, you need to know the one rule: <b>how to multiply a matrix by a vector</b>.
            There's no "natural" reason this is how it works — mathematicians <b>defined</b> it this way because it turns out to be
            extraordinarily useful. Here's the definition:
          </Prose>

          <Definition
            formal={<>
              For a 2×2 matrix <b>M</b> with rows (a, b) and (c, d), and a column vector <b>v</b> = (x, y),
              the matrix-vector product <b>Mv</b> is defined as the column vector whose first entry is
              ax + by and whose second entry is cx + dy.
            </>}
            playful={<>
              Each row of the matrix "reaches across" and grabs the vector, multiplying matching parts
              and adding them up. Row 1 of the matrix pairs up with the vector to produce the first output number.
              Row 2 does the same to produce the second.
            </>}
          />

          {/* Sliders row */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", margin: "16px 0" }}>
            <div style={{ flex: "0 1 320px", minWidth: 220 }}>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Matrix</div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "4px 12px" }}>
                <Slider label="a" value={mat[0]} onChange={v => setM(0, v)} color={COLORS.cyan} />
                <Slider label="b" value={mat[1]} onChange={v => setM(1, v)} color={COLORS.cyan} />
                <Slider label="c" value={mat[2]} onChange={v => setM(2, v)} color={COLORS.magenta} />
                <Slider label="d" value={mat[3]} onChange={v => setM(3, v)} color={COLORS.magenta} />
              </div>
            </div>
            <div style={{ flex: "0 1 180px", minWidth: 140 }}>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Vector</div>
              <Slider label="x" value={vx} onChange={setVx} color={COLORS.green} min={-4} max={4} />
              <Slider label="y" value={vy} onChange={setVy} color={COLORS.green} min={-4} max={4} />
            </div>
          </div>

          {/* Matrix equation */}
          <MathBlock>
            <div style={{ textAlign: "center", lineHeight: 2.2 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                <MatBracket>
                  <div><span style={{ color: COLORS.cyan }}>{mat[0].toFixed(1)}</span> <span style={{ color: COLORS.cyan }}>{mat[1].toFixed(1)}</span></div>
                  <div><span style={{ color: COLORS.magenta }}>{mat[2].toFixed(1)}</span> <span style={{ color: COLORS.magenta }}>{mat[3].toFixed(1)}</span></div>
                </MatBracket>
                <span style={{ color: COLORS.muted }}>×</span>
                <MatBracket col={COLORS.green}>
                  <div>{vx.toFixed(1)}</div>
                  <div>{vy.toFixed(1)}</div>
                </MatBracket>
                <span style={{ color: COLORS.muted }}>=</span>
                <MatBracket col={COLORS.gold}>
                  <div>{round(rx)}</div>
                  <div>{round(ry)}</div>
                </MatBracket>
              </div>
            </div>
          </MathBlock>

          {/* Arithmetic + Graph side by side */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "12px 0" }}>
            {/* Expanded arithmetic */}
            <div style={{
              flex: 1, minWidth: 240,
              background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "14px 16px",
              fontFamily: "'Space Mono', monospace", fontSize: 13, lineHeight: 2.2,
            }}>
              <div style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                Here's what happened — row by row:
              </div>
              <div>
                <span style={{ color: COLORS.muted }}>Row 1 grabs the vector: </span>
                <br />
                <span style={{ color: COLORS.cyan }}>{mat[0].toFixed(1)}</span>
                <span style={{ color: COLORS.muted }}> × </span>
                <span style={{ color: COLORS.green }}>{vx.toFixed(1)}</span>
                <span style={{ color: COLORS.muted }}> + </span>
                <span style={{ color: COLORS.cyan }}>{mat[1].toFixed(1)}</span>
                <span style={{ color: COLORS.muted }}> × </span>
                <span style={{ color: COLORS.green }}>{vy.toFixed(1)}</span>
                <span style={{ color: COLORS.muted }}> = </span>
                <span style={{ color: COLORS.gold, fontWeight: 700 }}>{round(rx)}</span>
                <span style={{ color: COLORS.muted, fontSize: 11 }}> ← new x</span>
              </div>
              <div>
                <span style={{ color: COLORS.muted }}>Row 2 grabs the vector: </span>
                <br />
                <span style={{ color: COLORS.magenta }}>{mat[2].toFixed(1)}</span>
                <span style={{ color: COLORS.muted }}> × </span>
                <span style={{ color: COLORS.green }}>{vx.toFixed(1)}</span>
                <span style={{ color: COLORS.muted }}> + </span>
                <span style={{ color: COLORS.magenta }}>{mat[3].toFixed(1)}</span>
                <span style={{ color: COLORS.muted }}> × </span>
                <span style={{ color: COLORS.green }}>{vy.toFixed(1)}</span>
                <span style={{ color: COLORS.muted }}> = </span>
                <span style={{ color: COLORS.gold, fontWeight: 700 }}>{round(ry)}</span>
                <span style={{ color: COLORS.muted, fontSize: 11 }}> ← new y</span>
              </div>
            </div>

            {/* Graph showing input → output */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <SVGCanvas width={340} height={300} xRange={[-5, 5]} yRange={[-5, 5]}>
                {(w, h, xR, yR) => {
                  const o = m2s(0, 0, w, h, xR, yR);
                  const inp = m2s(vx, vy, w, h, xR, yR);
                  const out = m2s(rx, ry, w, h, xR, yR);
                  return (
                    <g>
                      {/* Curved arrow showing transformation */}
                      <path d={`M ${inp[0]} ${inp[1]} Q ${(inp[0]+out[0])/2 - 20} ${(inp[1]+out[1])/2 - 30} ${out[0]} ${out[1]}`}
                        fill="none" stroke={COLORS.muted} strokeWidth={1} strokeDasharray="3 3" opacity={0.4}
                        markerEnd="none" />
                      {/* Input vector */}
                      <Arrow x1={o[0]} y1={o[1]} x2={inp[0]} y2={inp[1]} color={COLORS.green} strokeWidth={2.5} />
                      {/* Output vector */}
                      <Arrow x1={o[0]} y1={o[1]} x2={out[0]} y2={out[1]} color={COLORS.gold} strokeWidth={2.5} />
                      {/* Labels */}
                      <text x={inp[0] + 8} y={inp[1] - 8} fill={COLORS.green} fontSize={12} fontWeight={700}
                        fontFamily="'Space Mono', monospace">
                        input
                      </text>
                      <text x={inp[0] + 8} y={inp[1] + 14} fill={COLORS.green} fontSize={10} opacity={0.7}
                        fontFamily="'Space Mono', monospace">
                        [{vx.toFixed(1)}, {vy.toFixed(1)}]
                      </text>
                      <text x={out[0] + 8} y={out[1] - 8} fill={COLORS.gold} fontSize={12} fontWeight={700}
                        fontFamily="'Space Mono', monospace">
                        output
                      </text>
                      <text x={out[0] + 8} y={out[1] + 14} fill={COLORS.gold} fontSize={10} opacity={0.7}
                        fontFamily="'Space Mono', monospace">
                        [{round(rx)}, {round(ry)}]
                      </text>
                    </g>
                  );
                }}
              </SVGCanvas>
            </div>
          </div>

          <Callout>
            That's the whole rule! Each row does a "multiply matching parts and add" with the
            vector to produce one number. Two rows → two outputs → the <span style={{ color: COLORS.gold }}>gold</span> vector on the graph.
            Try setting the matrix to [1 0 / 0 1] (the "identity") — the output equals the input. The identity matrix does nothing!
          </Callout>

          <div style={{ textAlign: "right", marginTop: 8 }}>
            <button onClick={() => setStep(2)} style={{ ...btnStyle, background: COLORS.cyan + "20", borderColor: COLORS.cyan + "50", color: COLORS.cyan }}>
              Got it — now break down the geometry →
            </button>
          </div>
        </div>
      )}

      {/* ===================== STEP 2: One point being transformed ===================== */}
      {step === 2 && (
        <div>
          <Prose>
            Now let's <b>see</b> what that multiplication does. The <span style={{ color: COLORS.green }}>green vector</span> is your input.
            The matrix grabs it and spits out the <span style={{ color: COLORS.gold }}>gold vector</span>.
            Drag the input around — the matrix transforms every point to a new location.
          </Prose>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 auto", minWidth: 180 }}>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Matrix</div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "4px 12px" }}>
                <Slider label="a" value={mat[0]} onChange={v => setM(0, v)} color={COLORS.cyan} />
                <Slider label="b" value={mat[1]} onChange={v => setM(1, v)} color={COLORS.cyan} />
                <Slider label="c" value={mat[2]} onChange={v => setM(2, v)} color={COLORS.magenta} />
                <Slider label="d" value={mat[3]} onChange={v => setM(3, v)} color={COLORS.magenta} />
              </div>
              <MathBlock>
                <div style={{ fontSize: 12, textAlign: "center" }}>
                  <MatBracket>
                    <div><span style={{ color: COLORS.cyan }}>{mat[0].toFixed(1)} {mat[1].toFixed(1)}</span></div>
                    <div><span style={{ color: COLORS.magenta }}>{mat[2].toFixed(1)} {mat[3].toFixed(1)}</span></div>
                  </MatBracket>
                  <span style={{ color: COLORS.muted }}> × </span>
                  <MatBracket col={COLORS.green}>
                    <div>{vx.toFixed(1)}</div><div>{vy.toFixed(1)}</div>
                  </MatBracket>
                  <span style={{ color: COLORS.muted }}> = </span>
                  <MatBracket col={COLORS.gold}>
                    <div>{round(rx)}</div><div>{round(ry)}</div>
                  </MatBracket>
                </div>
              </MathBlock>
              <div style={{ fontSize: 12, color: COLORS.green, marginTop: 12, marginBottom: 4 }}>Input vector</div>
              <Slider label="x" value={vx} onChange={setVx} color={COLORS.green} min={-4} max={4} />
              <Slider label="y" value={vy} onChange={setVy} color={COLORS.green} min={-4} max={4} />
            </div>

            <div style={{ flex: 1, minWidth: 280 }}>
              <SVGCanvas width={380} height={380}>
                {(w, h, xR, yR) => {
                  const o = m2s(0, 0, w, h, xR, yR);
                  const inp = m2s(vx, vy, w, h, xR, yR);
                  const out = m2s(rx, ry, w, h, xR, yR);
                  // Show the two component contributions
                  // x-component: mat[0]*vx, mat[2]*vx  (first column scaled by vx)
                  const comp1 = m2s(mat[0] * vx, mat[2] * vx, w, h, xR, yR);
                  // y-component from comp1 endpoint: mat[1]*vy, mat[3]*vy
                  const comp2end = m2s(mat[0] * vx + mat[1] * vy, mat[2] * vx + mat[3] * vy, w, h, xR, yR);
                  return (
                    <g>
                      {/* Component breakdown: column1*vx then column2*vy */}
                      <Arrow x1={o[0]} y1={o[1]} x2={comp1[0]} y2={comp1[1]}
                        color={COLORS.cyan} strokeWidth={1.5} dashed />
                      <Arrow x1={comp1[0]} y1={comp1[1]} x2={comp2end[0]} y2={comp2end[1]}
                        color={COLORS.magenta} strokeWidth={1.5} dashed />
                      {/* Input vector */}
                      <Arrow x1={o[0]} y1={o[1]} x2={inp[0]} y2={inp[1]} color={COLORS.green} strokeWidth={2.5} />
                      {/* Output vector */}
                      <Arrow x1={o[0]} y1={o[1]} x2={out[0]} y2={out[1]} color={COLORS.gold} strokeWidth={2.5} />
                      {/* Labels */}
                      <text x={inp[0] + 8} y={inp[1] - 8} fill={COLORS.green} fontSize={12} fontWeight={700}
                        fontFamily="'Space Mono', monospace">in</text>
                      <text x={out[0] + 8} y={out[1] - 8} fill={COLORS.gold} fontSize={12} fontWeight={700}
                        fontFamily="'Space Mono', monospace">out</text>
                      {/* Component labels */}
                      <text x={(o[0] + comp1[0]) / 2 + 6} y={(o[1] + comp1[1]) / 2 - 6}
                        fill={COLORS.cyan} fontSize={10} fontFamily="'Space Mono', monospace" opacity={0.8}>
                        col₁×{vx.toFixed(1)}
                      </text>
                      <text x={(comp1[0] + comp2end[0]) / 2 + 6} y={(comp1[1] + comp2end[1]) / 2 - 6}
                        fill={COLORS.magenta} fontSize={10} fontFamily="'Space Mono', monospace" opacity={0.8}>
                        col₂×{vy.toFixed(1)}
                      </text>
                    </g>
                  );
                }}
              </SVGCanvas>
            </div>
          </div>

          <Callout>
            See the <span style={{ color: COLORS.cyan }}>cyan dashed</span> and <span style={{ color: COLORS.magenta }}>pink dashed</span> arrows?
            The output is <b>x × (first column) + y × (second column)</b>.
            The matrix's columns are like building blocks — the input vector says how much of each to use.
            This is the secret of matrix multiplication: it's a <b>recipe</b> for mixing the columns.
          </Callout>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <button onClick={() => setStep(1)} style={btnStyle}>← Back to the rule</button>
            <button onClick={() => setStep(3)} style={{ ...btnStyle, background: COLORS.cyan + "20", borderColor: COLORS.cyan + "50", color: COLORS.cyan }}>
              Now show me ALL points at once →
            </button>
          </div>
        </div>
      )}

      {/* ===================== STEP 3: Whole space warp with basis vectors ===================== */}
      {step === 3 && (
        <div>
          <Definition
            formal={<>
              A <b>linear transformation</b> of the plane is a function T that maps every vector to another
              vector, while respecting two properties: it preserves addition (T(u + v) = T(u) + T(v)) and
              scalar multiplication (T(k · v) = k · T(v)). Every 2×2 matrix <b>M</b> defines exactly one
              linear transformation via the rule T(v) = Mv, and every linear transformation arises
              from a unique 2×2 matrix.
            </>}
            playful={<>
              In plain English: a matrix can <b>stretch</b> space (pull or squish along some direction),
              <b> rotate</b> it, <b>shear</b> it, or <b>flip</b> it. It can combine these operations.
              But there's one thing a matrix <i>cannot</i> do on its own: it can never <b>slide</b>
              (translate) space, because the origin always stays put. We'll unlock translation with a clever
              trick in Chapter 6 → <button onClick={() => jumpTo && jumpTo(6)}
                style={{
                  background: "transparent", border: "none", padding: 0, margin: 0,
                  color: COLORS.purple, textDecoration: "underline", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "inherit", fontWeight: 700,
                }}>Homogeneous Coordinates</button>.
            </>}
          />

          <Prose>
            If a matrix can move <b>one</b> point, it can move <b>every</b> point.
            Below, every blue dot is an original grid point. The gold dot is where the matrix sends it.
          </Prose>
          <Prose>
            Here's the key insight: you don't need to think about every point.
            You only need two special vectors: <span style={{ color: COLORS.cyan }}>x̂ = [1, 0]</span> and <span style={{ color: COLORS.magenta }}>ŷ = [0, 1]</span> — the <b>basis vectors</b>.
            Watch where the matrix sends <i>those two</i>, and everything else follows.
          </Prose>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "12px 0" }}>
            <div style={{ flex: "0 0 auto", minWidth: 200 }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "4px 16px" }}>
                <Slider label="a" value={mat[0]} onChange={v => setM(0, v)} color={COLORS.cyan} />
                <Slider label="b" value={mat[1]} onChange={v => setM(1, v)} color={COLORS.cyan} />
                <Slider label="c" value={mat[2]} onChange={v => setM(2, v)} color={COLORS.magenta} />
                <Slider label="d" value={mat[3]} onChange={v => setM(3, v)} color={COLORS.magenta} />
              </div>
              <MathBlock>
                <div style={{ textAlign: "center" }}>
                  [<span style={{ color: COLORS.cyan }}>{mat[0].toFixed(1)}</span> <span style={{ color: COLORS.cyan }}>{mat[1].toFixed(1)}</span>]
                  <br />
                  [<span style={{ color: COLORS.magenta }}>{mat[2].toFixed(1)}</span> <span style={{ color: COLORS.magenta }}>{mat[3].toFixed(1)}</span>]
                </div>
              </MathBlock>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                {presets.map(p => (
                  <button key={p.name} onClick={() => setMat(p.m)}
                    style={{
                      padding: "4px 8px", fontSize: 11, background: COLORS.surfaceLight,
                      border: `1px solid ${COLORS.border}`, borderRadius: 4, color: COLORS.muted,
                      cursor: "pointer",
                    }}>
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Basis vector readout */}
              <div style={{
                marginTop: 14, padding: "10px 12px", background: COLORS.surfaceLight,
                border: `1px solid ${COLORS.border}`, borderRadius: 8,
                fontFamily: "'Space Mono', monospace", fontSize: 12, lineHeight: 1.8,
              }}>
                <div style={{ color: COLORS.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                  Where the basis vectors land:
                </div>
                <div>
                  <span style={{ color: COLORS.cyan }}>x̂ → </span>
                  <span style={{ color: COLORS.gold }}>[{mat[0].toFixed(1)}, {mat[2].toFixed(1)}]</span>
                  <span style={{ color: COLORS.muted }}> ← column 1!</span>
                </div>
                <div>
                  <span style={{ color: COLORS.magenta }}>ŷ → </span>
                  <span style={{ color: COLORS.gold }}>[{mat[1].toFixed(1)}, {mat[3].toFixed(1)}]</span>
                  <span style={{ color: COLORS.muted }}> ← column 2!</span>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 280 }}>
              <SVGCanvas width={400} height={400}>
                {(w, h, xR, yR) => {
                  const dots = [];
                  for (let gx = -3; gx <= 3; gx++) {
                    for (let gy = -3; gy <= 3; gy++) {
                      const [sx, sy] = m2s(gx, gy, w, h, xR, yR);
                      const tx = mat[0] * gx + mat[1] * gy;
                      const ty = mat[2] * gx + mat[3] * gy;
                      const [stx, sty] = m2s(tx, ty, w, h, xR, yR);
                      dots.push(
                        <g key={`${gx},${gy}`}>
                          <circle cx={sx} cy={sy} r={2.5} fill={COLORS.cyan} opacity={0.25} />
                          <circle cx={stx} cy={sty} r={3} fill={COLORS.gold} opacity={0.7} />
                          <line x1={sx} y1={sy} x2={stx} y2={sty} stroke={COLORS.gold} strokeWidth={0.4} opacity={0.25} />
                        </g>
                      );
                    }
                  }
                  // Transformed grid lines for visual effect
                  const gridEdges = [];
                  for (let gx = -3; gx <= 3; gx++) {
                    const pts = [];
                    for (let gy = -3; gy <= 3; gy++) {
                      pts.push(m2s(mat[0] * gx + mat[1] * gy, mat[2] * gx + mat[3] * gy, w, h, xR, yR));
                    }
                    gridEdges.push(<polyline key={`tv${gx}`} points={pts.map(p => p.join(",")).join(" ")}
                      fill="none" stroke={COLORS.gold} strokeWidth={0.5} opacity={0.15} />);
                  }
                  for (let gy = -3; gy <= 3; gy++) {
                    const pts = [];
                    for (let gx = -3; gx <= 3; gx++) {
                      pts.push(m2s(mat[0] * gx + mat[1] * gy, mat[2] * gx + mat[3] * gy, w, h, xR, yR));
                    }
                    gridEdges.push(<polyline key={`th${gy}`} points={pts.map(p => p.join(",")).join(" ")}
                      fill="none" stroke={COLORS.gold} strokeWidth={0.5} opacity={0.15} />);
                  }

                  // Original basis vectors (faint)
                  const o = m2s(0, 0, w, h, xR, yR);
                  const origX = m2s(1, 0, w, h, xR, yR);
                  const origY = m2s(0, 1, w, h, xR, yR);
                  // Transformed basis vectors (bold)
                  const e1 = m2s(mat[0], mat[2], w, h, xR, yR);
                  const e2 = m2s(mat[1], mat[3], w, h, xR, yR);
                  return (
                    <g>
                      {gridEdges}
                      {dots}
                      {/* Original basis (faint) */}
                      <Arrow x1={o[0]} y1={o[1]} x2={origX[0]} y2={origX[1]} color={COLORS.cyan} strokeWidth={1.5} dashed />
                      <Arrow x1={o[0]} y1={o[1]} x2={origY[0]} y2={origY[1]} color={COLORS.magenta} strokeWidth={1.5} dashed />
                      <text x={origX[0] + 4} y={origX[1] - 6} fill={COLORS.cyan} fontSize={10} opacity={0.6}>x̂</text>
                      <text x={origY[0] + 4} y={origY[1] - 6} fill={COLORS.magenta} fontSize={10} opacity={0.6}>ŷ</text>
                      {/* Transformed basis (bold) */}
                      <Arrow x1={o[0]} y1={o[1]} x2={e1[0]} y2={e1[1]} color={COLORS.cyan} strokeWidth={3} />
                      <Arrow x1={o[0]} y1={o[1]} x2={e2[0]} y2={e2[1]} color={COLORS.magenta} strokeWidth={3} />
                      <text x={e1[0] + 6} y={e1[1] - 8} fill={COLORS.cyan} fontSize={12} fontWeight={700}
                        fontFamily="'Space Mono', monospace">x̂ʼ</text>
                      <text x={e2[0] + 6} y={e2[1] - 8} fill={COLORS.magenta} fontSize={12} fontWeight={700}
                        fontFamily="'Space Mono', monospace">ŷʼ</text>
                    </g>
                  );
                }}
              </SVGCanvas>
            </div>
          </div>

          <Callout color={COLORS.gold}>
            The <span style={{ color: COLORS.cyan }}>dashed cyan</span> is where x̂ used to be; the <span style={{ color: COLORS.cyan }}>bold cyan</span> is where the matrix sends it — and that's just the first column of the matrix!
            Same for <span style={{ color: COLORS.magenta }}>ŷ and the second column</span>.
            The entire gold grid is built from these two arrows. Every other point is just some amount of x̂ʼ plus some amount of ŷʼ.
            <br /><br />
            Try the presets: <b>Stretch X</b> pulls x̂ further while leaving ŷ alone. <b>Shear</b> tilts ŷ sideways.
            <b>Flip</b> reverses x̂. <b>Rotate 45°</b> spins both basis vectors together.
          </Callout>

          <div style={{ textAlign: "left", marginTop: 8 }}>
            <button onClick={() => setStep(2)} style={btnStyle}>← Back to one point</button>
          </div>
        </div>
      )}

      <Markdown src={CONTENT[2].outro} />
    </div>
  );
}

// ==================== CHAPTER 3 ====================
function Ch3() {
  const [part, setPart] = useState("A");
  const [v1, setV1] = useState([3, 1]);
  const [v2, setV2] = useState([-1, 2]);
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const lenA = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
  const lenB = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
  const len2sq = v2[0] * v2[0] + v2[1] * v2[1];
  const projScale = len2sq > 0.01 ? dot / len2sq : 0;
  const proj = [projScale * v2[0], projScale * v2[1]];
  const perp = [v1[0] - proj[0], v1[1] - proj[1]];
  const isPerp = Math.abs(dot) < 0.15;

  // Shadow factor: dot(a,b) / (|a|·|b|). This is cos(θ) but framed geometrically
  // as the "fractional alignment" without reference to angles.
  const shadowFactor = (lenA > 0.01 && lenB > 0.01) ? dot / (lenA * lenB) : 0;

  const [showGS, setShowGS] = useState(false);

  const partBtns = [
    { id: "A", label: "Part A: Definition" },
    { id: "B", label: "Part B: Shadows" },
  ];

  return (
    <div>
      {/* Part tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
        {partBtns.map(p => (
          <button key={p.id} onClick={() => setPart(p.id)}
            style={{
              padding: "8px 14px", fontSize: 12, background: "transparent",
              border: "none", borderBottom: `2px solid ${part === p.id ? COLORS.green : "transparent"}`,
              color: part === p.id ? COLORS.green : COLORS.muted,
              cursor: "pointer", fontFamily: "inherit", fontWeight: part === p.id ? 700 : 400,
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* ===================== PART A: Definition and perpendicularity ===================== */}
      {part === "A" && (
        <div>
          <Prose>
            Here is an operation that unlocks an enormous amount of geometry using nothing but arithmetic you already know.
          </Prose>

          <Definition
            formal={<>
              The <b>dot product</b> of two vectors <b>a</b> = (a₁, a₂) and <b>b</b> = (b₁, b₂) is defined as the single
              number <b>a</b> · <b>b</b> = a₁b₁ + a₂b₂.
            </>}
            playful={<>
              Multiply matching parts, add them up. That's it. It eats two vectors and spits out one number.
            </>}
          />

          <Prose>
            For <b>a</b> = [{v1[0].toFixed(1)}, {v1[1].toFixed(1)}] and <b>b</b> = [{v2[0].toFixed(1)}, {v2[1].toFixed(1)}]:
          </Prose>
          <MathBlock>
            a · b = ({v1[0].toFixed(1)})({v2[0].toFixed(1)}) + ({v1[1].toFixed(1)})({v2[1].toFixed(1)}) = <span style={{ color: isPerp ? COLORS.green : COLORS.gold, fontSize: 18 }}>{round(dot)}</span>
          </MathBlock>
          <Prose>
            {isPerp
              ? <span style={{ color: COLORS.green }}>✦ The dot product is zero — the vectors are <b>perpendicular</b>!</span>
              : dot > 0
                ? "Positive → they point roughly the same direction."
                : "Negative → they point roughly opposite directions."}
          </Prose>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 auto", minWidth: 180 }}>
              <div style={{ fontSize: 12, color: COLORS.cyan, marginBottom: 4 }}>Vector a</div>
              <Slider label="x" value={v1[0]} onChange={v => setV1([v, v1[1]])} color={COLORS.cyan} min={-4} max={4} />
              <Slider label="y" value={v1[1]} onChange={v => setV1([v1[0], v])} color={COLORS.cyan} min={-4} max={4} />
              <div style={{ fontSize: 12, color: COLORS.magenta, marginTop: 8, marginBottom: 4 }}>Vector b</div>
              <Slider label="x" value={v2[0]} onChange={v => setV2([v, v2[1]])} color={COLORS.magenta} min={-4} max={4} />
              <Slider label="y" value={v2[1]} onChange={v => setV2([v2[0], v])} color={COLORS.magenta} min={-4} max={4} />
              <button onClick={() => setShowGS(!showGS)} style={{
                marginTop: 12, padding: "6px 12px", fontSize: 12, background: showGS ? COLORS.green + "30" : COLORS.surfaceLight,
                border: `1px solid ${showGS ? COLORS.green : COLORS.border}`, borderRadius: 6,
                color: showGS ? COLORS.green : COLORS.muted, cursor: "pointer",
              }}>
                {showGS ? "▾ Gram-Schmidt" : "▸ Show Gram-Schmidt"}
              </button>
            </div>

            <div style={{ flex: 1, minWidth: 280 }}>
              <SVGCanvas width={380} height={380}>
                {(w, h, xR, yR) => {
                  const o = m2s(0, 0, w, h, xR, yR);
                  const a = m2s(v1[0], v1[1], w, h, xR, yR);
                  const b = m2s(v2[0], v2[1], w, h, xR, yR);
                  const p = m2s(proj[0], proj[1], w, h, xR, yR);
                  const perpEnd = m2s(perp[0], perp[1], w, h, xR, yR);
                  return (
                    <g>
                      <line x1={a[0]} y1={a[1]} x2={p[0]} y2={p[1]}
                        stroke={COLORS.gold} strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
                      <circle cx={p[0]} cy={p[1]} r={4} fill={COLORS.gold} opacity={0.7} />
                      <Arrow x1={o[0]} y1={o[1]} x2={a[0]} y2={a[1]} color={COLORS.cyan} strokeWidth={2.5} />
                      <Arrow x1={o[0]} y1={o[1]} x2={b[0]} y2={b[1]} color={COLORS.magenta} strokeWidth={2.5} />
                      {showGS && (
                        <Arrow x1={o[0]} y1={o[1]} x2={perpEnd[0]} y2={perpEnd[1]} color={COLORS.green} strokeWidth={2} dashed />
                      )}
                      {isPerp && (
                        <rect x={o[0] - 1} y={o[1] - 11} width={10} height={10}
                          fill="none" stroke={COLORS.green} strokeWidth={1.5}
                          transform={`rotate(${Math.atan2(-v2[1], v2[0]) * 180 / Math.PI}, ${o[0]}, ${o[1]})`} />
                      )}
                      <text x={a[0] + 6} y={a[1] - 6} fill={COLORS.cyan} fontSize={12} fontWeight={700}>a</text>
                      <text x={b[0] + 6} y={b[1] - 6} fill={COLORS.magenta} fontSize={12} fontWeight={700}>b</text>
                      {showGS && <text x={perpEnd[0] + 6} y={perpEnd[1] - 6} fill={COLORS.green} fontSize={11}>a⊥</text>}
                    </g>
                  );
                }}
              </SVGCanvas>
            </div>
          </div>

          {showGS && (
            <Callout color={COLORS.green}>
              <b>Gram-Schmidt trick:</b> The <span style={{ color: COLORS.gold }}>gold dot</span> is the "shadow" of <b>a</b> onto <b>b</b> (the projection).
              The <span style={{ color: COLORS.green }}>green dashed arrow</span> is what's left when you subtract the shadow: <b>a</b> − shadow = a⊥.
              This new vector is perpendicular to <b>b</b> (its dot product with <b>b</b> is zero!). You just made an orthogonal pair.
            </Callout>
          )}

          <div style={{ textAlign: "right", marginTop: 16 }}>
            <button onClick={() => setPart("B")}
              style={{ ...btnStyle, background: COLORS.green + "20", borderColor: COLORS.green + "50", color: COLORS.green }}>
              Next: what does the dot product <i>mean</i>? →
            </button>
          </div>
        </div>
      )}

      {/* ===================== PART B: The shadow interpretation ===================== */}
      {part === "B" && (
        <div>
          <Prose>
            Part A defined the dot product as a bit of arithmetic. But why would anyone care about this particular
            operation? Here's the reason: the dot product is secretly a <b>shadow-measuring device</b>.
          </Prose>

          <Prose>
            Imagine shining a light straight down onto vector <b>b</b>. The shadow that vector <b>a</b>
            casts onto <b>b</b> has a length. How long exactly? That depends on two things: how long <b>a</b> is,
            and how aligned it is with <b>b</b>. The dot product captures both at once.
          </Prose>

          <Definition
            formal={<>
              Let <b>a</b> and <b>b</b> be non-zero vectors. Define the <b>shadow factor</b>
              s(a, b) = (<b>a</b> · <b>b</b>) / (‖a‖ · ‖b‖). Then s is bounded in [−1, 1], and equivalently the
              dot product satisfies <b>a</b> · <b>b</b> = ‖a‖ · ‖b‖ · s(a, b).
            </>}
            playful={<>
              Divide the dot product by the two lengths and you get a pure number between −1 and +1 — the
              "fractional alignment" between the vectors. If you multiply it back by the two lengths, you get
              the dot product. So the dot product is nothing more than:
              <br /><b>(length of a) × (length of b) × (how aligned they are)</b>.
            </>}
          />

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 auto", minWidth: 200 }}>
              <div style={{ fontSize: 12, color: COLORS.cyan, marginBottom: 4 }}>Vector a</div>
              <Slider label="x" value={v1[0]} onChange={v => setV1([v, v1[1]])} color={COLORS.cyan} min={-4} max={4} />
              <Slider label="y" value={v1[1]} onChange={v => setV1([v1[0], v])} color={COLORS.cyan} min={-4} max={4} />
              <div style={{ fontSize: 12, color: COLORS.magenta, marginTop: 8, marginBottom: 4 }}>Vector b</div>
              <Slider label="x" value={v2[0]} onChange={v => setV2([v, v2[1]])} color={COLORS.magenta} min={-4} max={4} />
              <Slider label="y" value={v2[1]} onChange={v => setV2([v2[0], v])} color={COLORS.magenta} min={-4} max={4} />

              {/* Live shadow breakdown */}
              <div style={{
                marginTop: 14, padding: "10px 12px",
                background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`,
                borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 12, lineHeight: 1.9,
              }}>
                <div style={{ color: COLORS.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                  Live breakdown
                </div>
                <div><span style={{ color: COLORS.cyan }}>‖a‖</span> = {lenA.toFixed(2)}</div>
                <div><span style={{ color: COLORS.magenta }}>‖b‖</span> = {lenB.toFixed(2)}</div>
                <div><span style={{ color: COLORS.gold }}>a · b</span> = {round(dot)}</div>
                <div style={{ paddingTop: 4, borderTop: `1px solid ${COLORS.border}`, marginTop: 4 }}>
                  <span style={{ color: COLORS.orange }}>shadow factor</span> = (a · b) / (‖a‖ ‖b‖)
                  <br />
                  &nbsp; = {round(dot)} / ({lenA.toFixed(2)} × {lenB.toFixed(2)})
                  <br />
                  &nbsp; = <span style={{ color: COLORS.orange, fontWeight: 700 }}>{shadowFactor.toFixed(3)}</span>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 280 }}>
              <SVGCanvas width={380} height={380}>
                {(w, h, xR, yR) => {
                  const o = m2s(0, 0, w, h, xR, yR);
                  const a = m2s(v1[0], v1[1], w, h, xR, yR);
                  const b = m2s(v2[0], v2[1], w, h, xR, yR);
                  const p = m2s(proj[0], proj[1], w, h, xR, yR);
                  // Projection length in world units (signed)
                  const projLen = lenB > 0.01 ? dot / lenB : 0;
                  return (
                    <g>
                      {/* Light rays hinting at the "shadow" idea: from tip of a perpendicular to b */}
                      <line x1={a[0]} y1={a[1]} x2={p[0]} y2={p[1]}
                        stroke={COLORS.gold} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.7} />
                      {/* Shadow segment on b (highlighted) */}
                      <line x1={o[0]} y1={o[1]} x2={p[0]} y2={p[1]}
                        stroke={COLORS.orange} strokeWidth={5} opacity={0.6} strokeLinecap="round" />
                      {/* Vectors */}
                      <Arrow x1={o[0]} y1={o[1]} x2={a[0]} y2={a[1]} color={COLORS.cyan} strokeWidth={2.5} />
                      <Arrow x1={o[0]} y1={o[1]} x2={b[0]} y2={b[1]} color={COLORS.magenta} strokeWidth={2.5} />
                      {/* Tip-of-shadow marker */}
                      <circle cx={p[0]} cy={p[1]} r={5} fill={COLORS.orange} />
                      {/* Labels */}
                      <text x={a[0] + 6} y={a[1] - 6} fill={COLORS.cyan} fontSize={12} fontWeight={700}>a</text>
                      <text x={b[0] + 6} y={b[1] - 6} fill={COLORS.magenta} fontSize={12} fontWeight={700}>b</text>
                      <text x={p[0] + 8} y={p[1] + 14} fill={COLORS.orange} fontSize={10}
                        fontFamily="'Space Mono', monospace">
                        shadow len = {projLen.toFixed(2)}
                      </text>
                    </g>
                  );
                }}
              </SVGCanvas>
            </div>
          </div>

          <Callout color={COLORS.orange}>
            The <span style={{ color: COLORS.orange }}>orange segment</span> is the shadow of <b>a</b> on <b>b</b>.
            Its length equals ‖a‖ times the shadow factor.
            Equivalently: the length of the shadow is <b>(a · b) / ‖b‖</b>.
            When the shadow factor is 1, <b>a</b> and <b>b</b> point the same way; when 0, they're
            perpendicular (no shadow at all); when −1, they point opposite.
          </Callout>

          <Prose>
            This is the <b>geometric meaning</b> of the dot product. Every time someone writes <b>a · b</b>,
            they are asking the question: "how much of one vector lies along the other, scaled by both lengths?"
            That single number does a lot of work. In Chapter 4, we'll find out that sine and cosine are
            just shadows too — special ones, onto the x and y axes.
          </Prose>

          <div style={{ textAlign: "left", marginTop: 16 }}>
            <button onClick={() => setPart("A")} style={btnStyle}>← Back to Part A</button>
          </div>
        </div>
      )}

      <Markdown src={CONTENT[3].outro} />
    </div>
  );
}

// 3D viewer for Ch4 Part C: shows original + rotated coordinate frames around shared z-axis.
// Uses orthographic projection and pointer-drag for camera orbit. Depth-sorted draw order
// so the far-side axes draw first and near-side axes overlay them.
function Viewer3D({ yaw, pitch, onDragStart, onDragMove, onDragEnd, cosA, sinA, angle }) {
  const W = 380, H = 380, CX = W / 2, CY = H / 2, SCALE = 80;

  // Apply camera transform: yaw (around world y) then pitch (around x).
  const proj = (pt) => {
    let [x, y, z] = pt;
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const nx = cy * x + sy * z;
    const nz = -sy * x + cy * z;
    x = nx; z = nz;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const ny = cp * y - sp * z;
    const nz2 = sp * y + cp * z;
    return [x, ny, nz2];
  };
  const toScreen = (pt3) => {
    const [x, y] = pt3;
    return [CX + x * SCALE, CY - y * SCALE];
  };
  // Axis length
  const L = 1.4;

  // Define the line segments to draw. Each has 3D start and end, color, width, dashed.
  // We'll depth-sort by average z (after projection) so farther segments draw first.
  const segs = [
    // Floor grid (xy plane) — very faint reference
    ...(() => {
      const out = [];
      for (let i = -1; i <= 1; i++) {
        out.push({ a: [i, -1, 0], b: [i, 1, 0], color: COLORS.border, width: 0.5, dashed: false, opacity: 0.35 });
        out.push({ a: [-1, i, 0], b: [1, i, 0], color: COLORS.border, width: 0.5, dashed: false, opacity: 0.35 });
      }
      return out;
    })(),
    // Rotation path in xy plane (unit circle)
    ...(() => {
      const out = [];
      const N = 48;
      for (let i = 0; i < N; i++) {
        const a1 = (i / N) * 2 * Math.PI;
        const a2 = ((i + 1) / N) * 2 * Math.PI;
        out.push({
          a: [Math.cos(a1), Math.sin(a1), 0],
          b: [Math.cos(a2), Math.sin(a2), 0],
          color: COLORS.orange, width: 1, dashed: false, opacity: 0.35,
        });
      }
      return out;
    })(),
    // Original axes — dashed, dim
    { a: [0, 0, 0], b: [L, 0, 0], color: COLORS.cyan,    width: 1.5, dashed: true, opacity: 0.55, label: "x̂", labelAt: [L, 0, 0], labelColor: COLORS.cyan },
    { a: [0, 0, 0], b: [0, L, 0], color: COLORS.magenta, width: 1.5, dashed: true, opacity: 0.55, label: "ŷ", labelAt: [0, L, 0], labelColor: COLORS.magenta },
    { a: [0, 0, 0], b: [0, 0, L], color: COLORS.gold,    width: 2.5, dashed: false, opacity: 1,   label: "ẑ = ẑ′", labelAt: [0, 0, L], labelColor: COLORS.gold },
    // Rotated axes — solid, bold
    { a: [0, 0, 0], b: [L * cosA, L * sinA, 0],  color: COLORS.cyan,    width: 3, dashed: false, opacity: 1, label: "x̂′", labelAt: [L * cosA, L * sinA, 0], labelColor: COLORS.cyan },
    { a: [0, 0, 0], b: [-L * sinA, L * cosA, 0], color: COLORS.magenta, width: 3, dashed: false, opacity: 1, label: "ŷ′", labelAt: [-L * sinA, L * cosA, 0], labelColor: COLORS.magenta },
    // Rotation arc showing angle
    ...(() => {
      const out = [];
      const rArc = 0.35;
      const steps = Math.max(4, Math.floor(angle / 6));
      for (let i = 0; i < steps; i++) {
        const a1 = (i / steps) * (angle * Math.PI / 180);
        const a2 = ((i + 1) / steps) * (angle * Math.PI / 180);
        out.push({
          a: [rArc * Math.cos(a1), rArc * Math.sin(a1), 0],
          b: [rArc * Math.cos(a2), rArc * Math.sin(a2), 0],
          color: COLORS.orange, width: 1.8, dashed: false, opacity: 0.85,
        });
      }
      return out;
    })(),
  ];

  // Project everything and compute avg z for sorting
  const drawn = segs.map((s, i) => {
    const pa = proj(s.a);
    const pb = proj(s.b);
    return { ...s, pa, pb, sa: toScreen(pa), sb: toScreen(pb), depth: (pa[2] + pb[2]) / 2, key: i };
  });
  // Sort back-to-front (larger z = closer to viewer, drawn last)
  drawn.sort((a, b) => a.depth - b.depth);

  return (
    <svg viewBox={`0 0 ${W} ${H}`}
      style={{
        width: "100%", maxWidth: W, background: COLORS.bg,
        borderRadius: 8, border: `1px solid ${COLORS.border}`,
        touchAction: "none", cursor: "grab",
      }}
      onPointerDown={onDragStart} onPointerMove={onDragMove}
      onPointerUp={onDragEnd} onPointerCancel={onDragEnd}
    >
      {drawn.map(s => (
        <g key={s.key}>
          <line x1={s.sa[0]} y1={s.sa[1]} x2={s.sb[0]} y2={s.sb[1]}
            stroke={s.color} strokeWidth={s.width}
            strokeDasharray={s.dashed ? "4 3" : "none"}
            opacity={s.opacity} />
          {s.label && (() => {
            const lp3 = proj(s.labelAt);
            const lp = toScreen(lp3);
            return (
              <text x={lp[0] + 8} y={lp[1] - 4}
                fill={s.labelColor} fontSize={12} fontWeight={700}
                fontFamily="'Space Mono', monospace">
                {s.label}
              </text>
            );
          })()}
        </g>
      ))}
      {/* Origin */}
      <circle cx={CX} cy={CY} r={3} fill={COLORS.muted} />
    </svg>
  );
}

// ==================== CHAPTER 4 ====================
function Ch4() {
  const [part, setPart] = useState("A");
  const [angle, setAngle] = useState(30);
  const rad = (angle * Math.PI) / 180;
  const cosA = Math.cos(rad), sinA = Math.sin(rad);

  // F-shape points
  const fShape = [[0,0],[1,0],[1,0.2],[0.3,0.2],[0.3,0.45],[0.7,0.45],[0.7,0.65],[0.3,0.65],[0.3,1],[0,1]];
  const rotated = fShape.map(([x, y]) => [cosA * x - sinA * y, sinA * x + cosA * y]);

  // Refs for jump navigation to the aside and back
  const topRef = useRef(null);
  const asideRef = useRef(null);
  const jumpToAside = () => asideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const jumpToTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Aside has its own angle state so exploration there doesn't disturb the main rotation
  const [asideAngle, setAsideAngle] = useState(45);
  const asideRad = (asideAngle * Math.PI) / 180;
  const asideCos = Math.cos(asideRad), asideSin = Math.sin(asideRad);

  // Part B / C share the same rotation angle as Part A via `angle`, `rad`, `cosA`, `sinA`.

  // Part C: view orientation for the 3D viewer
  const [viewYaw, setViewYaw] = useState(0.6);
  const [viewPitch, setViewPitch] = useState(0.35);
  const dragRef = useRef({ active: false, x: 0, y: 0 });
  const onDragStart = (e) => {
    dragRef.current = { active: true, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDragMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setViewYaw(y => y - dx * 0.01);
    setViewPitch(p => Math.max(-1.4, Math.min(1.4, p - dy * 0.01)));
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;
  };
  const onDragEnd = () => { dragRef.current.active = false; };

  const partBtns = [
    { id: "A", label: "Part A: The Formula" },
    { id: "B", label: "Part B: New Frame in Old" },
    { id: "C", label: "Part C: 3D Rotation" },
  ];

  return (
    <div ref={topRef}>
      {/* Part tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `1px solid ${COLORS.border}`, overflowX: "auto" }}>
        {partBtns.map(p => (
          <button key={p.id} onClick={() => setPart(p.id)}
            style={{
              padding: "8px 14px", fontSize: 12, background: "transparent",
              border: "none", borderBottom: `2px solid ${part === p.id ? COLORS.orange : "transparent"}`,
              color: part === p.id ? COLORS.orange : COLORS.muted,
              cursor: "pointer", fontFamily: "inherit", fontWeight: part === p.id ? 700 : 400,
              whiteSpace: "nowrap",
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {part === "A" && (
        <div>
      <Prose>
        Here's the big reveal: <b>what matrix rotates things without stretching them?</b> In Chapter 3,
        you learned that perpendicular means "dot product = zero" and that lengths come from
        dot products too. A rotation must preserve both. There's exactly one family of matrices that does this:
      </Prose>

      <Definition
        formal={<>
          The <b>rotation matrix</b> by angle θ is defined as <b>R</b>(θ) = [[cos θ, −sin θ], [sin θ, cos θ]].
          It is the unique 2×2 matrix (up to reflection) that preserves the dot product of every pair of vectors.
        </>}
        playful={<>
          There's one matrix per angle. Plug in the angle, and this matrix spins every point around the origin
          by that many degrees — no stretching, no squishing, just a clean rotation.
        </>}
      />

      <MathBlock>
        <div style={{ textAlign: "center" }}>
          Rotation by θ = {rad.toFixed(3)} rad &nbsp;
          <span style={{ color: COLORS.muted, fontSize: 12 }}>({angle}°)</span>:
          <br />
          [<span style={{ color: COLORS.cyan }}> cos θ</span> <span style={{ color: COLORS.magenta }}>−sin θ</span> ] &nbsp; = &nbsp;
          [<span style={{ color: COLORS.cyan }}> {cosA.toFixed(3)}</span> <span style={{ color: COLORS.magenta }}>{(-sinA).toFixed(3)}</span> ]
          <br />
          [<span style={{ color: COLORS.cyan }}> sin θ</span> &nbsp;<span style={{ color: COLORS.magenta }}> cos θ</span> ] &nbsp; &nbsp; &nbsp;
          [<span style={{ color: COLORS.cyan }}> {sinA.toFixed(3)}</span> &nbsp;<span style={{ color: COLORS.magenta }}>{cosA.toFixed(3)}</span> ]
        </div>
      </MathBlock>

      <Prose>
        Here's the link back to Chapter 3. Take any point on the unit circle at angle θ. It's just a unit-length
        vector. What are its coordinates? They're the <b>shadows</b> of that vector onto the two axes:
        the shadow onto the x-axis is <b style={{ color: COLORS.cyan }}>cos θ</b>, and the shadow onto the y-axis
        is <b style={{ color: COLORS.magenta }}>sin θ</b>. So <b>cos</b> and <b>sin</b> aren't exotic special
        functions — they're just specific shadows of a unit vector, on the two special directions x̂ and ŷ.
        The rotation matrix puts those two shadows into the right slots to spin every other vector by the same angle.
      </Prose>

      <div style={{
        margin: "14px 0", padding: "12px 14px",
        background: `${COLORS.orange}0a`, border: `1px solid ${COLORS.orange}30`,
        borderRadius: 8, fontSize: 12, color: COLORS.text, lineHeight: 1.65,
      }}>
        <div style={{
          fontSize: 10, color: COLORS.orange, textTransform: "uppercase", letterSpacing: 2,
          fontFamily: "'Space Mono', monospace", fontWeight: 700, marginBottom: 6,
        }}>
          Note on units: radians first
        </div>
        We'll write θ in <b>radians</b> whenever we're being mathematical. A radian is simply "arc length on the
        unit circle" — a pure number, no units attached. A full turn is 2π because the circumference of a unit circle is 2π.
        Degrees exist because 360 is divisible by lots of things, which is handy for navigation and carpentry —
        but they drag a "degrees" unit along with them, which makes the math messier. Think of degrees as a display choice
        for human eyeballs; radians are what the formulas actually want.
      </div>

      {/* Jump-to-aside link — small, unobtrusive */}
      <button onClick={jumpToAside} style={{
        display: "inline-block",
        margin: "-4px 0 12px 0",
        padding: "6px 10px",
        fontSize: 11, fontFamily: "'Space Mono', monospace",
        background: "transparent", border: `1px dashed ${COLORS.muted}`,
        borderRadius: 6, color: COLORS.muted, cursor: "pointer",
        fontStyle: "italic",
      }}>
        ↓ Aside: never really memorized what cos and sin look like?
      </button>

      <Slider label="θ" value={angle} onChange={setAngle} min={0} max={360} step={1} color={COLORS.orange} />

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
        <SVGCanvas width={380} height={380}>
          {(w, h, xR, yR) => {
            const o = m2s(0, 0, w, h, xR, yR);
            // Unit circle
            const cx = o[0], cy = o[1];
            const r = (w / (xR[1] - xR[0])) * 1;
            // Original F
            const origPath = fShape.map(([x, y]) => m2s(x, y, w, h, xR, yR));
            const rotPath = rotated.map(([x, y]) => m2s(x, y, w, h, xR, yR));
            // cos/sin point on circle
            const cp = m2s(cosA, sinA, w, h, xR, yR);
            return (
              <g>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.border} strokeWidth={1} />
                {/* Angle arc */}
                <path d={`M ${o[0] + r * 0.3} ${o[1]} A ${r * 0.3} ${r * 0.3} 0 ${angle > 180 ? 1 : 0} 0 ${o[0] + r * 0.3 * cosA} ${o[1] - r * 0.3 * sinA}`}
                  fill="none" stroke={COLORS.orange} strokeWidth={1.5} />
                {/* Original shape */}
                <polygon points={origPath.map(p => p.join(",")).join(" ")}
                  fill={`${COLORS.cyan}20`} stroke={COLORS.cyan} strokeWidth={1.5} opacity={0.5} />
                {/* Rotated shape */}
                <polygon points={rotPath.map(p => p.join(",")).join(" ")}
                  fill={`${COLORS.gold}30`} stroke={COLORS.gold} strokeWidth={2} />
                {/* cos/sin point */}
                <circle cx={cp[0]} cy={cp[1]} r={5} fill={COLORS.orange} />
                <line x1={cp[0]} y1={cp[1]} x2={cp[0]} y2={o[1]} stroke={COLORS.cyan} strokeWidth={1} strokeDasharray="3 2" />
                <line x1={cp[0]} y1={cp[1]} x2={o[0]} y2={cp[1]} stroke={COLORS.magenta} strokeWidth={1} strokeDasharray="3 2" />
                <text x={cp[0] + 8} y={o[1] - 4} fill={COLORS.cyan} fontSize={10}>cos</text>
                <text x={o[0] + 4} y={cp[1] - 4} fill={COLORS.magenta} fontSize={10}>sin</text>
              </g>
            );
          }}
        </SVGCanvas>
      </div>

      <Callout color={COLORS.orange}>
        Try setting the angle to π/2 (90°) — cos becomes 0 and sin becomes 1. The matrix swaps coordinates and flips a sign.
        At π (180°), everything flips through the origin. At 2π (360°), you're back to the identity matrix.
      </Callout>

          <div style={{ textAlign: "right", marginTop: 16 }}>
            <button onClick={() => setPart("B")}
              style={{ ...btnStyle, background: COLORS.orange + "20", borderColor: COLORS.orange + "50", color: COLORS.orange }}>
              Next: where does this matrix <i>come from</i>? →
            </button>
          </div>
        </div>
      )}

      {/* ===================== PART B: Rotation matrix from new basis in old coords ===================== */}
      {part === "B" && (
        <div>
          <Prose>
            In Chapter 2 we saw a general rule: <b>the columns of any matrix tell you where the basis vectors x̂ and ŷ land.</b>
            Let's use that to <i>derive</i> the rotation matrix from scratch, without pulling the formula from a hat.
          </Prose>

          <Prose>
            Imagine you have two coordinate systems sharing the same origin. The first — the "old" frame —
            has its basis vectors x̂ = [1, 0] and ŷ = [0, 1]. The second — the "new" frame — has basis vectors
            x̂' and ŷ', rotated by angle θ from the old ones. The question: <b>what are the coordinates of x̂'
            and ŷ' when written in the old frame?</b> Those coordinates ARE the rotation matrix.
          </Prose>

          <Slider label="θ" value={angle} onChange={setAngle} min={0} max={360} step={1} color={COLORS.orange} />
          <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'Space Mono', monospace", marginTop: -6, marginBottom: 12 }}>
            θ = <span style={{ color: COLORS.orange, fontWeight: 700 }}>{rad.toFixed(3)} rad</span>
            &nbsp; <span style={{ opacity: 0.55 }}>({angle}°)</span>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <SVGCanvas width={380} height={380}>
                {(w, h, xR, yR) => {
                  const o = m2s(0, 0, w, h, xR, yR);
                  // Old basis vectors (unit length)
                  const oldX = m2s(1, 0, w, h, xR, yR);
                  const oldY = m2s(0, 1, w, h, xR, yR);
                  // New basis vectors: x̂' = (cos θ, sin θ),  ŷ' = (-sin θ, cos θ)
                  const newX = m2s(cosA, sinA, w, h, xR, yR);
                  const newY = m2s(-sinA, cosA, w, h, xR, yR);
                  // Subtle unit circle
                  const scale = (w / (xR[1] - xR[0]));
                  return (
                    <g>
                      <circle cx={o[0]} cy={o[1]} r={scale} fill="none" stroke={COLORS.border} strokeWidth={0.8} strokeDasharray="3 4" />
                      {/* Old basis (dim) */}
                      <Arrow x1={o[0]} y1={o[1]} x2={oldX[0]} y2={oldX[1]} color={COLORS.cyan} strokeWidth={1.5} dashed />
                      <Arrow x1={o[0]} y1={o[1]} x2={oldY[0]} y2={oldY[1]} color={COLORS.magenta} strokeWidth={1.5} dashed />
                      <text x={oldX[0] + 4} y={oldX[1] - 6} fill={COLORS.cyan} fontSize={11} opacity={0.6} fontFamily="'Space Mono', monospace">x̂</text>
                      <text x={oldY[0] + 4} y={oldY[1] - 6} fill={COLORS.magenta} fontSize={11} opacity={0.6} fontFamily="'Space Mono', monospace">ŷ</text>
                      {/* New basis (bright) */}
                      <Arrow x1={o[0]} y1={o[1]} x2={newX[0]} y2={newX[1]} color={COLORS.cyan} strokeWidth={3} />
                      <Arrow x1={o[0]} y1={o[1]} x2={newY[0]} y2={newY[1]} color={COLORS.magenta} strokeWidth={3} />
                      <text x={newX[0] + 6} y={newX[1] - 8} fill={COLORS.cyan} fontSize={13} fontWeight={700} fontFamily="'Space Mono', monospace">x̂′</text>
                      <text x={newY[0] + 6} y={newY[1] - 8} fill={COLORS.magenta} fontSize={13} fontWeight={700} fontFamily="'Space Mono', monospace">ŷ′</text>
                      {/* Shadow projections for x̂' */}
                      <line x1={newX[0]} y1={newX[1]} x2={newX[0]} y2={o[1]}
                        stroke={COLORS.cyan} strokeWidth={1} strokeDasharray="2 3" opacity={0.5} />
                      <line x1={newX[0]} y1={newX[1]} x2={o[0]} y2={newX[1]}
                        stroke={COLORS.cyan} strokeWidth={1} strokeDasharray="2 3" opacity={0.5} />
                      {/* Shadow projections for ŷ' */}
                      <line x1={newY[0]} y1={newY[1]} x2={newY[0]} y2={o[1]}
                        stroke={COLORS.magenta} strokeWidth={1} strokeDasharray="2 3" opacity={0.5} />
                      <line x1={newY[0]} y1={newY[1]} x2={o[0]} y2={newY[1]}
                        stroke={COLORS.magenta} strokeWidth={1} strokeDasharray="2 3" opacity={0.5} />
                    </g>
                  );
                }}
              </SVGCanvas>
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                New basis vectors, written in old-frame coordinates
              </div>
              <div style={{
                padding: "14px 16px",
                background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`,
                borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 13, lineHeight: 2.2,
              }}>
                <div>
                  <span style={{ color: COLORS.cyan, fontWeight: 700 }}>x̂′</span> = (cos θ, sin θ)
                  &nbsp; = (<span style={{ color: COLORS.gold }}>{cosA.toFixed(3)}</span>, <span style={{ color: COLORS.gold }}>{sinA.toFixed(3)}</span>)
                </div>
                <div>
                  <span style={{ color: COLORS.magenta, fontWeight: 700 }}>ŷ′</span> = (−sin θ, cos θ)
                  &nbsp; = (<span style={{ color: COLORS.gold }}>{(-sinA).toFixed(3)}</span>, <span style={{ color: COLORS.gold }}>{cosA.toFixed(3)}</span>)
                </div>
              </div>

              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 14, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                Stack them as columns →
              </div>
              <MathBlock>
                <div style={{ textAlign: "center" }}>
                  R(θ) = [
                  <span style={{ color: COLORS.cyan }}>x̂′</span> &nbsp;
                  <span style={{ color: COLORS.magenta }}>ŷ′</span>
                  ] &nbsp; = &nbsp;
                  [<span style={{ color: COLORS.cyan }}>{cosA.toFixed(3)}</span>&nbsp;
                   <span style={{ color: COLORS.magenta }}>{(-sinA).toFixed(3)}</span>]
                  <br />
                  <span style={{ opacity: 0 }}>R(θ) = [x̂′&nbsp;ŷ′] = </span>
                  [<span style={{ color: COLORS.cyan }}>{sinA.toFixed(3)}</span>&nbsp;
                   <span style={{ color: COLORS.magenta }}>{cosA.toFixed(3)}</span>]
                </div>
              </MathBlock>
            </div>
          </div>

          <Callout color={COLORS.orange}>
            The <b>x-shadow</b> and <b>y-shadow</b> of x̂′ (dashed cyan lines) are exactly cos θ and sin θ.
            The x-shadow and y-shadow of ŷ′ (dashed magenta lines) are −sin θ and cos θ.
            Those four numbers go straight into R(θ) as two columns. That's the whole derivation.
          </Callout>

          <Prose>
            This is the same recipe from Chapter 2. <b>Every</b> matrix is built from "where the basis vectors
            land, written in the old frame's coordinates." For rotations, the new basis lives on the unit
            circle, so its coordinates are cos and sin shadows. That's why those two functions show up.
          </Prose>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <button onClick={() => setPart("A")} style={btnStyle}>← Back to Part A</button>
            <button onClick={() => setPart("C")}
              style={{ ...btnStyle, background: COLORS.orange + "20", borderColor: COLORS.orange + "50", color: COLORS.orange }}>
              Next: step up to 3D →
            </button>
          </div>
        </div>
      )}

      {/* ===================== PART C: 3D rotation about shared z-axis ===================== */}
      {part === "C" && (
        <div>
          <Prose>
            In 3D, rotations need an <b>axis</b> — you can't just say "rotate by θ," you have to say
            "rotate by θ around this line." The simplest 3D rotation is around one of the coordinate axes.
            Here we'll rotate around the <b>z-axis</b>. The z-axis stays still; x̂ and ŷ spin around it.
          </Prose>

          <Prose>
            Drag the diagram below to tumble the camera. The <b>dim, dashed</b> axes are the original frame.
            The <b>bright solid</b> axes are the rotated frame. Notice that ẑ and ẑ′ overlap — they're the same.
          </Prose>

          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>Rotation angle θ about the z-axis:</div>
          <Slider label="θ" value={angle} onChange={setAngle} min={0} max={360} step={1} color={COLORS.orange} />
          <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'Space Mono', monospace", marginTop: -6, marginBottom: 12 }}>
            θ = <span style={{ color: COLORS.orange, fontWeight: 700 }}>{rad.toFixed(3)} rad</span>
            &nbsp; <span style={{ opacity: 0.55 }}>({angle}°)</span>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <Viewer3D
                yaw={viewYaw} pitch={viewPitch}
                onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd}
                cosA={cosA} sinA={sinA} angle={angle}
              />
              <div style={{ fontSize: 10, color: COLORS.muted, textAlign: "center", marginTop: 4, fontStyle: "italic" }}>
                drag to orbit the camera
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                Where each basis vector lands
              </div>
              <div style={{
                padding: "12px 14px",
                background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`,
                borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 13, lineHeight: 2,
              }}>
                <div><span style={{ color: COLORS.cyan, fontWeight: 700 }}>x̂′</span> = (cos θ, sin θ, 0) = ({cosA.toFixed(2)}, {sinA.toFixed(2)}, 0)</div>
                <div><span style={{ color: COLORS.magenta, fontWeight: 700 }}>ŷ′</span> = (−sin θ, cos θ, 0) = ({(-sinA).toFixed(2)}, {cosA.toFixed(2)}, 0)</div>
                <div><span style={{ color: COLORS.gold, fontWeight: 700 }}>ẑ′</span> = (0, 0, 1) &nbsp;&nbsp; <span style={{ color: COLORS.muted, fontStyle: "italic", fontFamily: "'DM Sans', sans-serif", fontSize: 11 }}>unchanged</span></div>
              </div>

              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 14, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                Stack them as columns (the 3×3 rotation matrix):
              </div>
              <MathBlock>
                <div style={{ textAlign: "center", fontSize: 14 }}>
                  R<sub>z</sub>(θ) = &nbsp;
                  <span style={{ display: "inline-block", textAlign: "right" }}>
                    [<span style={{ color: COLORS.cyan }}>{cosA.toFixed(2)}</span>&nbsp;
                     <span style={{ color: COLORS.magenta }}>{(-sinA).toFixed(2)}</span>&nbsp;
                     <span style={{ color: COLORS.gold }}>0</span>]<br />
                    [<span style={{ color: COLORS.cyan }}>{sinA.toFixed(2)}</span>&nbsp;&nbsp;
                     <span style={{ color: COLORS.magenta }}>{cosA.toFixed(2)}</span>&nbsp;
                     <span style={{ color: COLORS.gold }}>0</span>]<br />
                    [<span style={{ color: COLORS.cyan }}>0</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                     <span style={{ color: COLORS.magenta }}>0</span>&nbsp;&nbsp;&nbsp;
                     <span style={{ color: COLORS.gold }}>1</span>]
                  </span>
                </div>
              </MathBlock>
            </div>
          </div>

          <Callout color={COLORS.orange}>
            Look at the structure of R<sub>z</sub>. The <b>top-left 2×2 block</b> is exactly the 2D rotation matrix
            from Part A. The <b>last column is (0, 0, 1)</b> — z goes to z, no change. The <b>last row is (0, 0, 1)</b> —
            nothing from x or y contributes to z. This is the signature of "rotating around z": leave z alone, rotate the xy-plane.
            There are analogous R<sub>x</sub> and R<sub>y</sub> matrices for rotations around the other axes.
          </Callout>

          <div style={{ textAlign: "left", marginTop: 16 }}>
            <button onClick={() => setPart("B")} style={btnStyle}>← Back to Part B</button>
          </div>
        </div>
      )}

      <Markdown src={CONTENT[4].outro} />

      {/* ========== ASIDE: what sin and cos actually look like ========== */}
      <div ref={asideRef} style={{
        marginTop: 40,
        padding: "20px 22px",
        background: `${COLORS.surfaceLight}80`,
        border: `1px dashed ${COLORS.border}`,
        borderRadius: 10,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          <div style={{
            fontSize: 10, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 2.5,
            fontFamily: "'Space Mono', monospace", fontWeight: 700,
          }}>
            Aside &nbsp;·&nbsp; Sin &amp; Cos at a glance
          </div>
          <button onClick={jumpToTop} style={{
            padding: "4px 10px", fontSize: 10, fontFamily: "'Space Mono', monospace",
            background: "transparent", border: `1px solid ${COLORS.muted}`,
            borderRadius: 6, color: COLORS.muted, cursor: "pointer",
          }}>
            ↑ back to top
          </button>
        </div>

        <Prose>
          Here's the honest truth: almost nobody memorizes the full sin/cos tables. What most people actually
          keep in their heads are <b>five</b> angles — the axis crossings — and two special triangles.
          Think of the values as <b>shadows</b>: cos θ is the x-shadow and sin θ is the y-shadow of a unit vector at angle θ.
          Play with the slider below to see the shape. The vertical line tracks where you are on each curve.
        </Prose>

        <div style={{
          fontSize: 11, color: COLORS.muted, fontFamily: "'Space Mono', monospace",
          marginBottom: 6, marginTop: 8,
        }}>
          θ = <span style={{ color: COLORS.orange, fontWeight: 700 }}>{(asideAngle * Math.PI / 180).toFixed(3)} rad</span>
          &nbsp; <span style={{ opacity: 0.55 }}>({asideAngle}°)</span>
        </div>
        <Slider label="θ" value={asideAngle} onChange={setAsideAngle} min={0} max={360} step={1} color={COLORS.orange} />

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12 }}>
          {/* Unit circle */}
          <div style={{ flex: "0 1 220px", minWidth: 200 }}>
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
              Unit circle
            </div>
            <svg viewBox="0 0 220 220" style={{
              width: "100%", maxWidth: 220, background: COLORS.bg,
              borderRadius: 8, border: `1px solid ${COLORS.border}`,
            }}>
              {(() => {
                const cx = 110, cy = 110, r = 80;
                const px = cx + r * asideCos;
                const py = cy - r * asideSin;
                return (
                  <g>
                    {/* Axes */}
                    <line x1={10} y1={cy} x2={210} y2={cy} stroke={COLORS.gridAxis} strokeWidth={0.8} />
                    <line x1={cx} y1={10} x2={cx} y2={210} stroke={COLORS.gridAxis} strokeWidth={0.8} />
                    {/* Circle */}
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.border} strokeWidth={1} />
                    {/* Angle arc */}
                    <path d={`M ${cx + 22} ${cy} A 22 22 0 ${asideAngle > 180 ? 1 : 0} 0 ${cx + 22 * asideCos} ${cy - 22 * asideSin}`}
                      fill="none" stroke={COLORS.orange} strokeWidth={1.5} />
                    {/* sin (vertical) leg — "y-shadow" */}
                    <line x1={px} y1={py} x2={px} y2={cy} stroke={COLORS.magenta} strokeWidth={2} />
                    <text x={px + 6} y={(py + cy) / 2 + 3} fill={COLORS.magenta} fontSize={10}
                      fontFamily="'Space Mono', monospace">sin = {asideSin.toFixed(2)}</text>
                    {/* cos (horizontal) leg — "x-shadow" */}
                    <line x1={cx} y1={cy} x2={px} y2={cy} stroke={COLORS.cyan} strokeWidth={2} />
                    <text x={(cx + px) / 2 - 14} y={cy + 14} fill={COLORS.cyan} fontSize={10}
                      fontFamily="'Space Mono', monospace">cos = {asideCos.toFixed(2)}</text>
                    {/* Radius */}
                    <line x1={cx} y1={cy} x2={px} y2={py} stroke={COLORS.orange} strokeWidth={1.5} opacity={0.6} />
                    {/* Point */}
                    <circle cx={px} cy={py} r={4.5} fill={COLORS.orange} />
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Stacked sin and cos plots */}
          <div style={{ flex: "1 1 280px", minWidth: 260 }}>
            {[
              { name: "cos(θ)", fn: Math.cos, color: COLORS.cyan, val: asideCos },
              { name: "sin(θ)", fn: Math.sin, color: COLORS.magenta, val: asideSin },
            ].map((plot, pi) => {
              const W = 340, H = 90, pad = 10;
              // Sample curve
              const pts = [];
              for (let d = 0; d <= 360; d += 2) {
                const rad = (d * Math.PI) / 180;
                const sx = pad + (d / 360) * (W - 2 * pad);
                const sy = H / 2 - plot.fn(rad) * (H / 2 - pad);
                pts.push(`${sx},${sy}`);
              }
              const markerX = pad + (asideAngle / 360) * (W - 2 * pad);
              const markerY = H / 2 - plot.val * (H / 2 - pad);
              return (
                <div key={pi} style={{ marginBottom: pi === 0 ? 8 : 0 }}>
                  <div style={{
                    fontSize: 10, color: plot.color, fontFamily: "'Space Mono', monospace",
                    marginBottom: 2,
                  }}>
                    {plot.name}
                  </div>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{
                    width: "100%", maxWidth: W, background: COLORS.bg,
                    borderRadius: 6, border: `1px solid ${COLORS.border}`,
                  }}>
                    {/* Zero line */}
                    <line x1={0} y1={H / 2} x2={W} y2={H / 2}
                      stroke={COLORS.gridAxis} strokeWidth={0.6} />
                    {/* y axis reference ticks at ±1 */}
                    <line x1={0} y1={pad} x2={W} y2={pad}
                      stroke={COLORS.border} strokeWidth={0.4} strokeDasharray="2 3" opacity={0.4} />
                    <line x1={0} y1={H - pad} x2={W} y2={H - pad}
                      stroke={COLORS.border} strokeWidth={0.4} strokeDasharray="2 3" opacity={0.4} />
                    {/* Vertical gridlines at 90, 180, 270 */}
                    {[90, 180, 270].map(d => {
                      const x = pad + (d / 360) * (W - 2 * pad);
                      return <line key={d} x1={x} y1={0} x2={x} y2={H}
                        stroke={COLORS.border} strokeWidth={0.4} opacity={0.4} />;
                    })}
                    {/* Curve */}
                    <polyline points={pts.join(" ")} fill="none" stroke={plot.color} strokeWidth={1.8} />
                    {/* Current angle marker */}
                    <line x1={markerX} y1={0} x2={markerX} y2={H}
                      stroke={COLORS.orange} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
                    <circle cx={markerX} cy={markerY} r={4} fill={COLORS.orange} />
                    {/* Value label */}
                    <text x={markerX + 6} y={markerY - 6} fill={plot.color}
                      fontSize={10} fontFamily="'Space Mono', monospace">
                      {plot.val.toFixed(2)}
                    </text>
                    {/* Axis labels */}
                    {[0, 90, 180, 270, 360].map(d => {
                      const x = pad + (d / 360) * (W - 2 * pad);
                      return <text key={d} x={x} y={H - 2} fill={COLORS.muted}
                        fontSize={8} textAnchor="middle" fontFamily="'Space Mono', monospace">{d}°</text>;
                    })}
                  </svg>
                </div>
              );
            })}
          </div>
        </div>

        {/* Special values */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
            The simple relations
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontFamily: "'Space Mono', monospace", fontSize: 12, width: "100%", minWidth: 520 }}>
              <thead>
                <tr style={{ color: COLORS.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                  <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 400 }}>
                    θ (radians)
                    <div style={{ fontSize: 9, color: COLORS.muted, textTransform: "none", fontWeight: 400, marginTop: 2 }}>deg</div>
                  </th>
                  <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 400, color: COLORS.cyan }}>
                    shadow<sub>x</sub>
                    <div style={{ fontSize: 9, color: COLORS.muted, textTransform: "none", fontWeight: 400, marginTop: 2 }}>cos θ</div>
                  </th>
                  <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 400, color: COLORS.magenta }}>
                    shadow<sub>y</sub>
                    <div style={{ fontSize: 9, color: COLORS.muted, textTransform: "none", fontWeight: 400, marginTop: 2 }}>sin θ</div>
                  </th>
                  <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 400 }}>notes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  // [rad-primary, deg-secondary, cos, sin, note, tier]
                  ["0",      "0°",   "1",             "0",             "axis crossing",                          "common"],
                  ["π/6",    "30°",  "√3/2 ≈ 0.866",  "1/2 = 0.5",     "from 30-60-90 triangle",                 "often forgotten"],
                  ["π/4",    "45°",  "√2/2 ≈ 0.707",  "√2/2 ≈ 0.707",  "from 45-45-90 (equal-sides) triangle",   "common"],
                  ["π/3",    "60°",  "1/2 = 0.5",     "√3/2 ≈ 0.866",  "from 30-60-90 triangle",                 "often forgotten"],
                  ["π/2",    "90°",  "0",             "1",             "axis crossing",                          "common"],
                  ["π",      "180°", "−1",            "0",             "axis crossing",                          "common"],
                  ["3π/2",   "270°", "0",             "−1",            "axis crossing",                          "common"],
                  ["2π",     "360°", "1",             "0",             "full turn = back to start",              "common"],
                ].map((row, i) => {
                  const isForgotten = row[5] === "often forgotten";
                  return (
                    <tr key={i} style={{
                      borderTop: `1px solid ${COLORS.border}`,
                      opacity: isForgotten ? 0.78 : 1,
                    }}>
                      <td style={{ padding: "6px 8px", color: COLORS.orange, fontWeight: 700 }}>
                        {row[0]}
                        <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 400 }}>{row[1]}</div>
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "right", color: COLORS.cyan }}>{row[2]}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", color: COLORS.magenta }}>{row[3]}</td>
                      <td style={{ padding: "6px 8px", color: COLORS.muted, fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>
                        {row[4]}
                        {isForgotten && <span style={{ color: COLORS.orange, marginLeft: 6, fontSize: 10 }}>← many forget this one</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Callout color={COLORS.muted}>
          The axis crossings (0, π/2, π, 3π/2, 2π) are easy — they're just 0s and ±1s.
          The <b>π/4 case</b> is easy to remember too: both legs of the triangle are equal, so shadow<sub>x</sub> = shadow<sub>y</sub>.
          The <b>π/6 and π/3 cases</b> are the tricky ones. The trick: they share the same two values (1/2 and √3/2),
          just swapped — and the smaller angle (π/6) has the smaller sin (because the point is closer to the x-axis,
          so its y-shadow is small).
        </Callout>

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button onClick={jumpToTop} style={{
            padding: "6px 14px", fontSize: 11, fontFamily: "'Space Mono', monospace",
            background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`,
            borderRadius: 6, color: COLORS.muted, cursor: "pointer",
          }}>
            ↑ back to the rotation matrix
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== CHAPTER 5 ====================
function Ch5() {
  const [v1, setV1] = useState([2, 0.5]);
  const [v2, setV2] = useState([-0.5, 2]);
  const det = v1[0] * v2[1] - v1[1] * v2[0];

  return (
    <div>
      <Markdown src={CONTENT[5].intro} />

      <MathBlock>
        det = ({v1[0].toFixed(1)})({v2[1].toFixed(1)}) − ({v1[1].toFixed(1)})({v2[0].toFixed(1)}) = <span style={{
          color: Math.abs(det) < 0.2 ? COLORS.magenta : det > 0 ? COLORS.green : COLORS.orange,
          fontSize: 18
        }}>{round(det)}</span>
        &nbsp;&nbsp; area = {round(Math.abs(det))}
      </MathBlock>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "0 0 auto", minWidth: 180 }}>
          <div style={{ fontSize: 12, color: COLORS.cyan, marginBottom: 4 }}>Column 1</div>
          <Slider label="x" value={v1[0]} onChange={v => setV1([v, v1[1]])} color={COLORS.cyan} />
          <Slider label="y" value={v1[1]} onChange={v => setV1([v1[0], v])} color={COLORS.cyan} />
          <div style={{ fontSize: 12, color: COLORS.magenta, marginTop: 8, marginBottom: 4 }}>Column 2</div>
          <Slider label="x" value={v2[0]} onChange={v => setV2([v, v2[1]])} color={COLORS.magenta} />
          <Slider label="y" value={v2[1]} onChange={v => setV2([v2[0], v])} color={COLORS.magenta} />
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <SVGCanvas width={380} height={380}>
            {(w, h, xR, yR) => {
              const o = m2s(0, 0, w, h, xR, yR);
              const a = m2s(v1[0], v1[1], w, h, xR, yR);
              const b = m2s(v2[0], v2[1], w, h, xR, yR);
              const ab = m2s(v1[0] + v2[0], v1[1] + v2[1], w, h, xR, yR);
              const fillColor = Math.abs(det) < 0.2 ? COLORS.magenta : det > 0 ? COLORS.green : COLORS.orange;
              return (
                <g>
                  <polygon points={`${o[0]},${o[1]} ${a[0]},${a[1]} ${ab[0]},${ab[1]} ${b[0]},${b[1]}`}
                    fill={fillColor + "25"} stroke={fillColor} strokeWidth={1} />
                  <Arrow x1={o[0]} y1={o[1]} x2={a[0]} y2={a[1]} color={COLORS.cyan} strokeWidth={2.5} />
                  <Arrow x1={o[0]} y1={o[1]} x2={b[0]} y2={b[1]} color={COLORS.magenta} strokeWidth={2.5} />
                  <text x={(o[0] + a[0] + ab[0] + b[0]) / 4 - 15} y={(o[1] + a[1] + ab[1] + b[1]) / 4 + 5}
                    fill={fillColor} fontSize={16} fontWeight={700} fontFamily="'Space Mono', monospace">
                    {round(Math.abs(det))}
                  </text>
                </g>
              );
            }}
          </SVGCanvas>
        </div>
      </div>

      <Callout color={Math.abs(det) < 0.2 ? COLORS.magenta : COLORS.green}>
        {Math.abs(det) < 0.2
          ? "⚠ The determinant is near zero — the parallelogram has collapsed to almost a line! This means the matrix has no inverse, and the system of equations has no unique solution. Try making the vectors point in different directions."
          : "The determinant connects back to Chapter 1: when det = 0, the matrix can't be reversed, so the system of equations has no unique solution. The parallelogram collapses to a line — information is lost."}
      </Callout>

      <Markdown src={CONTENT[5].outro} />
    </div>
  );
}

// ==================== CHAPTER 6 ====================
function Ch6() {
  const [tx, setTx] = useState(1.5);
  const [ty, setTy] = useState(1);
  const [angle, setAngle] = useState(30);
  const [scale, setScale] = useState(0.8);
  const rad = (angle * Math.PI) / 180;

  // Shape: small house
  const shape = [[-0.5, 0], [0.5, 0], [0.5, 0.6], [0, 1], [-0.5, 0.6]];

  // Apply: scale → rotate → translate (reading right to left in matrix multiplication)
  const transformed = shape.map(([x, y]) => {
    // Scale
    let nx = x * scale, ny = y * scale;
    // Rotate
    let rx = Math.cos(rad) * nx - Math.sin(rad) * ny;
    let ry = Math.sin(rad) * nx + Math.cos(rad) * ny;
    // Translate
    return [rx + tx, ry + ty];
  });

  const c = Math.cos(rad), s = Math.sin(rad);
  const m = [
    [round(scale * c), round(-scale * s), round(tx)],
    [round(scale * s), round(scale * c), round(ty)],
    [0, 0, 1],
  ];

  return (
    <div>
      <Markdown src={CONTENT[6].intro} />

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "0 0 auto", minWidth: 200 }}>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Transform Pipeline</div>
          <Slider label="S" value={scale} onChange={setScale} min={0.1} max={2} step={0.05} color={COLORS.green} />
          <Slider label="θ" value={angle} onChange={setAngle} min={0} max={360} step={1} color={COLORS.orange} />
          <Slider label="tₓ" value={tx} onChange={setTx} min={-3} max={3} color={COLORS.purple} />
          <Slider label="tᵧ" value={ty} onChange={setTy} min={-3} max={3} color={COLORS.purple} />

          <MathBlock>
            <div style={{ fontSize: 12, textAlign: "center", color: COLORS.text }}>Combined 3×3 matrix:</div>
            <div style={{ textAlign: "center", marginTop: 4, fontSize: 13 }}>
              [{m[0].map((v, i) => <span key={i} style={{ color: i === 2 ? COLORS.purple : COLORS.gold }}> {v} </span>)}]<br />
              [{m[1].map((v, i) => <span key={i} style={{ color: i === 2 ? COLORS.purple : COLORS.gold }}> {v} </span>)}]<br />
              [<span style={{ color: COLORS.muted }}> 0  0  1 </span>]
            </div>
          </MathBlock>
        </div>

        <div style={{ flex: 1, minWidth: 280 }}>
          <SVGCanvas width={380} height={380}>
            {(w, h, xR, yR) => {
              const origPath = shape.map(([x, y]) => m2s(x, y, w, h, xR, yR));
              const transPath = transformed.map(([x, y]) => m2s(x, y, w, h, xR, yR));
              return (
                <g>
                  <polygon points={origPath.map(p => p.join(",")).join(" ")}
                    fill={`${COLORS.cyan}20`} stroke={COLORS.cyan} strokeWidth={1.5} strokeDasharray="4 2" />
                  <polygon points={transPath.map(p => p.join(",")).join(" ")}
                    fill={`${COLORS.gold}30`} stroke={COLORS.gold} strokeWidth={2} />
                  <text x={origPath[0][0] - 20} y={origPath[0][1] + 14} fill={COLORS.cyan} fontSize={10} opacity={0.7}>original</text>
                  <text x={transPath[0][0] - 20} y={transPath[0][1] + 14} fill={COLORS.gold} fontSize={10}>transformed</text>
                </g>
              );
            }}
          </SVGCanvas>
        </div>
      </div>

      <Callout color={COLORS.purple}>
        This is exactly how video games and animation software work. Every object's position, rotation, and size
        is encoded as a single matrix. Moving a character? Just update the matrix and multiply.
        The <span style={{ color: COLORS.purple }}>purple numbers</span> in the last column are the translation — the slide.
      </Callout>

      <Markdown src={CONTENT[6].outro} />
    </div>
  );
}

// ==================== CHAPTER 7 ====================
function Ch7() {
  // 5-state Markov chain: A person wandering a movie complex.
  // States: Lobby, ATM, Arcade, Washroom, Theatre.
  // Intuition baked into the probabilities:
  //  - You can't really play Arcade without money, so ATM tends to lead there.
  //  - Arcade gobbles money, so from Arcade you often drift back toward ATM or stay playing.
  //  - Washroom is where people go before or after the movie.
  //  - Theatre is "sticky" — once you're watching, you mostly stay.
  const labels = ["Lobby", "ATM", "Arcade", "Washroom", "Theatre"];
  const stateColors = [COLORS.muted, COLORS.green, COLORS.magenta, COLORS.cyan, COLORS.gold];
  const N = 5;

  const [matrix, setMatrix] = useState([
    // From Lobby →
    [0.10, 0.25, 0.10, 0.25, 0.30],
    // From ATM → (got money; most likely to go play arcade)
    [0.25, 0.05, 0.60, 0.10, 0.00],
    // From Arcade → (likely to keep playing, or head to ATM for more coins)
    [0.10, 0.20, 0.60, 0.05, 0.05],
    // From Washroom → (usually on way to theatre)
    [0.20, 0.05, 0.10, 0.05, 0.60],
    // From Theatre → (very sticky; sometimes a bathroom break)
    [0.05, 0.00, 0.00, 0.10, 0.85],
  ]);
  const [dist, setDist] = useState([1, 0, 0, 0, 0]);
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([[1, 0, 0, 0, 0]]);
  const [autoRun, setAutoRun] = useState(false);
  const autoRef = useRef(null);

  const hop = useCallback(() => {
    setDist(prev => {
      const next = new Array(N).fill(0);
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          next[j] += prev[i] * matrix[i][j];
        }
      }
      setHistory(h => [...h.slice(-30), next]);
      setStep(s => s + 1);
      return next;
    });
  }, [matrix]);

  const reset = () => {
    setDist([1, 0, 0, 0, 0]);
    setStep(0);
    setHistory([[1, 0, 0, 0, 0]]);
    setAutoRun(false);
  };

  useEffect(() => {
    if (autoRun) autoRef.current = setInterval(hop, 350);
    return () => clearInterval(autoRef.current);
  }, [autoRun, hop]);

  // Steady state via power iteration
  let ss = new Array(N).fill(1 / N);
  for (let iter = 0; iter < 400; iter++) {
    const next = new Array(N).fill(0);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) next[j] += ss[i] * matrix[i][j];
    ss = next;
  }

  // Pentagon node positions
  const cx0 = 200, cy0 = 200, R = 135;
  const positions = labels.map((_, i) => {
    const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / N;
    return [cx0 + R * Math.cos(angle), cy0 + R * Math.sin(angle)];
  });

  return (
    <div>
      <Markdown src={CONTENT[7].intro} />

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 300 }}>
          {/* Transition matrix display */}
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
            Transition Matrix (rows sum to 1)
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontFamily: "'Space Mono', monospace", fontSize: 11 }}>
              <thead>
                <tr>
                  <td style={{ padding: "4px 6px", fontSize: 9, color: COLORS.muted }}>from \ to</td>
                  {labels.map((l, j) => (
                    <td key={j} style={{ padding: "4px 4px", color: stateColors[j], textAlign: "center", fontSize: 10, fontWeight: 700 }}>
                      {l.slice(0, 4)}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: "3px 6px", color: stateColors[i], fontSize: 10, fontWeight: 700 }}>{labels[i]}</td>
                    {row.map((val, j) => (
                      <td key={j} style={{ padding: "2px 3px", textAlign: "center" }}>
                        <input type="number" value={val.toFixed(2)} min={0} max={1} step={0.05}
                          onChange={e => {
                            const m = matrix.map(r => [...r]);
                            m[i][j] = Math.max(0, Math.min(1, +e.target.value));
                            const sum = m[i].reduce((a, b) => a + b, 0);
                            if (sum > 0) m[i] = m[i].map(v => Math.round(v / sum * 100) / 100);
                            setMatrix(m);
                            reset();
                          }}
                          style={{
                            width: 44, padding: "2px 3px",
                            background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`,
                            borderRadius: 3, color: val > 0.35 ? COLORS.gold : COLORS.text,
                            fontFamily: "'Space Mono', monospace", fontSize: 10, textAlign: "center",
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            <button onClick={hop} style={btnStyle}>Hop</button>
            <button onClick={() => setAutoRun(!autoRun)}
              style={{ ...btnStyle, background: autoRun ? COLORS.magenta + "30" : COLORS.surfaceLight, borderColor: autoRun ? COLORS.magenta : COLORS.border }}>
              {autoRun ? "Stop" : "Auto"}
            </button>
            <button onClick={reset} style={btnStyle}>Reset</button>
          </div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 8 }}>Minute: {step}</div>

          {/* Current distribution bars */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
              Where are they right now?
            </div>
            {dist.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 11, minWidth: 62, color: stateColors[i] }}>{labels[i]}</span>
                <div style={{ flex: 1, height: 14, background: COLORS.bg, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${p * 100}%`, height: "100%", background: stateColors[i],
                    borderRadius: 3, transition: "width 0.25s",
                  }} />
                </div>
                <span style={{ fontSize: 10, color: COLORS.text, fontFamily: "'Space Mono', monospace", minWidth: 42, textAlign: "right" }}>
                  {(p * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          {/* Steady state */}
          {step >= 6 && (
            <div style={{
              marginTop: 12, padding: "10px 12px", background: COLORS.green + "10",
              border: `1px solid ${COLORS.green}40`, borderRadius: 6,
            }}>
              <div style={{ fontSize: 10, color: COLORS.green, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                Steady state (long-run fractions of time)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px" }}>
                {ss.map((p, i) => (
                  <span key={i} style={{ fontSize: 10, color: stateColors[i], fontFamily: "'Space Mono', monospace" }}>
                    {labels[i]} {(p * 100).toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* State diagram */}
        <div style={{ flex: "1 1 320px", minWidth: 300 }}>
          <svg viewBox="0 0 400 400" style={{ width: "100%", maxWidth: 400, background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
            {/* Transition arrows (only draw probable ones for clarity) */}
            {matrix.map((row, i) => row.map((p, j) => {
              if (p < 0.04 || i === j) return null;
              const [x1, y1] = positions[i];
              const [x2, y2] = positions[j];
              const dx = x2 - x1, dy = y2 - y1;
              const len = Math.sqrt(dx * dx + dy * dy);
              const ux = dx / len, uy = dy / len;
              // Offset perpendicular so i→j and j→i arrows don't overlap
              const nx = -uy * 8, ny = ux * 8;
              // Trim endpoints to node radius
              const rN = 26;
              const sx = x1 + ux * rN + nx;
              const sy = y1 + uy * rN + ny;
              const ex = x2 - ux * rN + nx;
              const ey = y2 - uy * rN + ny;
              return (
                <g key={`${i}-${j}`}>
                  <line x1={sx} y1={sy} x2={ex} y2={ey}
                    stroke={stateColors[i]} strokeWidth={Math.max(0.8, p * 3.5)}
                    opacity={0.45} />
                  {p > 0.15 && (
                    <text x={(sx + ex) / 2} y={(sy + ey) / 2 - 2} fill={COLORS.text} fontSize={9} textAnchor="middle"
                      fontFamily="'Space Mono', monospace" opacity={0.85}>
                      {p.toFixed(2)}
                    </text>
                  )}
                </g>
              );
            }))}
            {/* Self-loops (for sticky states) */}
            {matrix.map((row, i) => {
              const p = row[i];
              if (p < 0.1) return null;
              const [cx, cy] = positions[i];
              // Direction away from center
              const ax = cx - cx0, ay = cy - cy0;
              const alen = Math.sqrt(ax * ax + ay * ay) || 1;
              const lx = cx + (ax / alen) * 34;
              const ly = cy + (ay / alen) * 34;
              return (
                <g key={`self-${i}`}>
                  <circle cx={lx} cy={ly} r={16} fill="none" stroke={stateColors[i]}
                    strokeWidth={Math.max(1, p * 2.5)} opacity={0.55} />
                  <text x={lx} y={ly + 3} fill={COLORS.text} fontSize={9} textAnchor="middle"
                    fontFamily="'Space Mono', monospace" opacity={0.85}>
                    {p.toFixed(2)}
                  </text>
                </g>
              );
            })}
            {/* State nodes */}
            {positions.map(([cx, cy], i) => {
              const r = 22 + dist[i] * 22;
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r={r} fill={stateColors[i] + "20"} stroke={stateColors[i]}
                    strokeWidth={dist[i] > 0.1 ? 2.5 : 1} style={{ transition: "r 0.25s" }} />
                  <text x={cx} y={cy - 2} fill={COLORS.text} fontSize={11} textAnchor="middle" fontWeight={600}>
                    {labels[i]}
                  </text>
                  <text x={cx} y={cy + 12} fill={stateColors[i]} fontSize={10} textAnchor="middle"
                    fontFamily="'Space Mono', monospace">
                    {(dist[i] * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}
          </svg>

          {/* History sparklines */}
          {history.length > 2 && (
            <svg viewBox="0 0 400 90" style={{ width: "100%", maxWidth: 400, marginTop: 8 }}>
              {labels.map((_, si) => {
                const points = history.map((h, i) => `${(i / Math.max(1, history.length - 1)) * 390 + 5},${82 - h[si] * 72}`).join(" ");
                return <polyline key={si} points={points} fill="none" stroke={stateColors[si]} strokeWidth={1.5} opacity={0.85} />;
              })}
              <line x1={5} y1={82} x2={395} y2={82} stroke={COLORS.border} strokeWidth={0.5} />
              <text x={395} y={78} fill={COLORS.muted} fontSize={9} textAnchor="end">minute {step}</text>
            </svg>
          )}
        </div>
      </div>

      <Callout color={COLORS.green}>
        {step < 6
          ? "Hop a few times, then hit Auto. Watch how the person's probability distribution spreads out — then stops changing. That point of rest is not a coincidence."
          : <>No matter where the person started, the probabilities converge to the same <b>steady state</b>.
              This vector <b>π</b> satisfies <b>π P = π</b> — the matrix doesn't change it.
              It's your first <b>eigenvector</b>: a direction the transition matrix leaves alone.
              The steady state tells you what fraction of time, in the long run, the person spends in each area.</>}
      </Callout>

      <Markdown src={CONTENT[7].outro} />
    </div>
  );
}

const btnStyle = {
  padding: "6px 14px", fontSize: 12, background: COLORS.surfaceLight,
  border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.text, cursor: "pointer",
  fontFamily: "'Space Mono', monospace",
};

// ==================== CHAPTER 8: NEURAL NETWORKS ====================
// Live tiny neural network: classifies a concentric-rings dataset. Demonstrates
// Olah's topology argument — 2 hidden units topologically can't separate the
// rings; 3 hidden units lifts the inner ring out of the plane so a flat hyperplane
// can slice them apart. Network is trained with vanilla SGD on binary
// cross-entropy in pure JS (no TF needed for a problem this small).

// ---- Tiny NN engine: 2 → H → 1 with tanh hidden, sigmoid output. ----
// We expose: forward(x), hidden(x), step(batch, lr), loss(batch).
function makeNet(H, seed = 1) {
  // Deterministic PRNG so re-mounts give consistent demos.
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const randn = () => {
    // Box-Muller
    const u = Math.max(rnd(), 1e-9);
    const v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  // W1: H x 2,  b1: H,  W2: 1 x H,  b2: 1
  const W1 = Array.from({ length: H }, () => [randn() * 0.9, randn() * 0.9]);
  const b1 = Array.from({ length: H }, () => randn() * 0.3);
  const W2 = [Array.from({ length: H }, () => randn() * 0.9)];
  const b2 = [randn() * 0.3];

  const sigmoid = (z) => 1 / (1 + Math.exp(-z));
  // tanh + its derivative in terms of output (1 - h²)
  const hiddenActivations = (x, W1l, b1l) => {
    const h = new Array(H);
    for (let i = 0; i < H; i++) {
      h[i] = Math.tanh(W1l[i][0] * x[0] + W1l[i][1] * x[1] + b1l[i]);
    }
    return h;
  };
  const forward = (x, net) => {
    const W1l = net?.W1 || W1, b1l = net?.b1 || b1, W2l = net?.W2 || W2, b2l = net?.b2 || b2;
    const h = hiddenActivations(x, W1l, b1l);
    let z = b2l[0];
    for (let i = 0; i < H; i++) z += W2l[0][i] * h[i];
    return { y: sigmoid(z), h };
  };

  const step = (batch, lr) => {
    // Accumulate gradients
    const dW1 = Array.from({ length: H }, () => [0, 0]);
    const db1 = new Array(H).fill(0);
    const dW2 = [new Array(H).fill(0)];
    let db2 = 0;
    for (const { x, y } of batch) {
      const h = hiddenActivations(x, W1, b1);
      let z = b2[0];
      for (let i = 0; i < H; i++) z += W2[0][i] * h[i];
      const yHat = sigmoid(z);
      // dL/dz = yHat - y  (binary cross-entropy w/ sigmoid)
      const dz = yHat - y;
      db2 += dz;
      for (let i = 0; i < H; i++) {
        dW2[0][i] += dz * h[i];
        // back through tanh: dh/dpre = 1 - h²
        const dpre = dz * W2[0][i] * (1 - h[i] * h[i]);
        dW1[i][0] += dpre * x[0];
        dW1[i][1] += dpre * x[1];
        db1[i] += dpre;
      }
    }
    const N = batch.length;
    for (let i = 0; i < H; i++) {
      W1[i][0] -= lr * dW1[i][0] / N;
      W1[i][1] -= lr * dW1[i][1] / N;
      b1[i] -= lr * db1[i] / N;
      W2[0][i] -= lr * dW2[0][i] / N;
    }
    b2[0] -= lr * db2 / N;
  };

  const loss = (data) => {
    let total = 0;
    for (const { x, y } of data) {
      const { y: yHat } = forward(x);
      const eps = 1e-7;
      total += -(y * Math.log(yHat + eps) + (1 - y) * Math.log(1 - yHat + eps));
    }
    return total / data.length;
  };

  return {
    H, W1, b1, W2, b2,
    forward, step, loss,
  };
}

// Concentric-rings dataset (Olah's topological challenge case)
function makeRingsData(seed = 7) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const data = [];
  // Inner blob (class 1): radius ~ 0..0.35
  for (let i = 0; i < 60; i++) {
    const r = rnd() * 0.35;
    const t = rnd() * 2 * Math.PI;
    data.push({ x: [r * Math.cos(t), r * Math.sin(t)], y: 1 });
  }
  // Outer ring (class 0): radius ~ 0.65..1.0
  for (let i = 0; i < 100; i++) {
    const r = 0.65 + rnd() * 0.35;
    const t = rnd() * 2 * Math.PI;
    data.push({ x: [r * Math.cos(t), r * Math.sin(t)], y: 0 });
  }
  return data;
}

function Ch8() {
  const [hiddenSize, setHiddenSize] = useState(3);
  const [epoch, setEpoch] = useState(0);
  const [running, setRunning] = useState(false);
  const [lossHistory, setLossHistory] = useState([]);
  // Tiny "tick" counter that bumps every training step, so React re-renders
  // the visualizations even though the net is mutated in-place.
  const [, setTick] = useState(0);
  const netRef = useRef(null);
  const dataRef = useRef(makeRingsData());
  const runRef = useRef(null);

  // Initialize / reset the network when hidden size changes
  const reset = useCallback(() => {
    netRef.current = makeNet(hiddenSize, Math.floor(Math.random() * 1000));
    setEpoch(0);
    setLossHistory([]);
    setTick(t => t + 1);
  }, [hiddenSize]);

  useEffect(() => { reset(); }, [reset]);

  // Pre-train one epoch on mount so the user sees something sensible before pressing play
  useEffect(() => {
    if (!netRef.current) return;
    // Take 50 quick warm-up steps so initial render isn't pure noise
    for (let i = 0; i < 50; i++) {
      netRef.current.step(dataRef.current, 0.5);
    }
    setEpoch(50);
    setLossHistory([{ e: 50, l: netRef.current.loss(dataRef.current) }]);
    setTick(t => t + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenSize]);

  // Training loop
  useEffect(() => {
    if (!running) return;
    runRef.current = setInterval(() => {
      const net = netRef.current;
      if (!net) return;
      // 5 SGD steps per tick keeps things lively
      for (let i = 0; i < 5; i++) net.step(dataRef.current, 0.5);
      setEpoch(e => {
        const newE = e + 5;
        setLossHistory(h => {
          const l = net.loss(dataRef.current);
          // Sample sparsely after a while
          const last = h[h.length - 1];
          if (!last || newE - last.e >= 5) {
            return [...h.slice(-100), { e: newE, l }];
          }
          return h;
        });
        return newE;
      });
      setTick(t => t + 1);
    }, 60);
    return () => clearInterval(runRef.current);
  }, [running]);

  // Camera state for 3D viewer (re-uses Viewer3D-style projection inline)
  const [yaw, setYaw] = useState(0.6);
  const [pitch, setPitch] = useState(0.5);
  const dragRef = useRef({ active: false, x: 0, y: 0 });
  const onDragStart = (e) => {
    dragRef.current = { active: true, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDragMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setYaw(y => y - dx * 0.01);
    setPitch(p => Math.max(-1.4, Math.min(1.4, p - dy * 0.01)));
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;
  };
  const onDragEnd = () => { dragRef.current.active = false; };

  const net = netRef.current;
  const data = dataRef.current;
  const currLoss = net ? net.loss(data) : 0;
  const accuracy = net
    ? data.filter(d => (net.forward(d.x).y > 0.5 ? 1 : 0) === d.y).length / data.length
    : 0;

  return (
    <div>
      <Markdown src={CONTENT[8].intro} />

      {/* Controls */}
      <div style={{
        display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center",
        marginTop: 12, marginBottom: 14, padding: "12px 14px",
        background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 8,
      }}>
        <div style={{ fontSize: 12, color: COLORS.muted }}>Hidden units:</div>
        <div style={{ display: "flex", gap: 4 }}>
          {[2, 3, 4, 6].map(k => (
            <button key={k} onClick={() => setHiddenSize(k)}
              style={{
                padding: "5px 12px", fontSize: 12,
                background: hiddenSize === k ? COLORS.green + "30" : COLORS.bg,
                border: `1px solid ${hiddenSize === k ? COLORS.green : COLORS.border}`,
                borderRadius: 5, color: hiddenSize === k ? COLORS.green : COLORS.text,
                cursor: "pointer", fontFamily: "'Space Mono', monospace", fontWeight: 700,
              }}>
              {k}
            </button>
          ))}
        </div>
        <div style={{ width: 1, height: 22, background: COLORS.border }} />
        <button onClick={() => setRunning(!running)}
          style={{
            ...btnStyle,
            background: running ? COLORS.magenta + "30" : COLORS.green + "20",
            borderColor: running ? COLORS.magenta : COLORS.green,
            color: running ? COLORS.magenta : COLORS.green,
          }}>
          {running ? "Pause training" : "▶ Train"}
        </button>
        <button onClick={reset} style={btnStyle}>Reset</button>
        <div style={{ marginLeft: "auto", fontSize: 11, color: COLORS.muted, fontFamily: "'Space Mono', monospace" }}>
          step {epoch} &nbsp;·&nbsp; loss {currLoss.toFixed(3)} &nbsp;·&nbsp; acc <span style={{ color: accuracy > 0.95 ? COLORS.green : accuracy > 0.8 ? COLORS.gold : COLORS.magenta }}>{(accuracy * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Topological note */}
      {hiddenSize === 2 && (
        <Callout color={COLORS.magenta}>
          <b>Topological warning:</b> with only 2 hidden units, the network is mathematically incapable of
          separating these rings — there's not enough room. Watch it struggle. The accuracy plateaus
          around 80% because, no matter how it warps the 2D plane, it can't pull a surrounded blob out from
          inside a ring without tearing space (which neural network layers can't do).
        </Callout>
      )}
      {hiddenSize >= 3 && (
        <Callout color={COLORS.green}>
          <b>The trick:</b> with 3+ hidden units, the network has an extra dimension to play with. It learns
          to <b>lift the inner blob up out of the plane</b>, into 3D. Once lifted, a flat plane can slice the
          two classes apart. This is <i>exactly</i> the kind of unfolding Christopher Olah described — and
          you can see it happen live in the 3D view below.
        </Callout>
      )}

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* LEFT: Input space with classification heatmap */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
            Input space &amp; decision boundary
          </div>
          <InputSpaceHeatmap net={net} data={data} />
        </div>

        {/* RIGHT: Hidden representation */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
            Hidden representation {hiddenSize === 2 ? "(2D)" : hiddenSize === 3 ? "(3D — drag to orbit)" : `(${hiddenSize}D — first 3 axes shown)`}
          </div>
          {hiddenSize === 2
            ? <HiddenSpace2D net={net} data={data} />
            : <HiddenSpace3D net={net} data={data} yaw={yaw} pitch={pitch}
                onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} />}
          {hiddenSize !== 2 && (
            <div style={{ fontSize: 10, color: COLORS.muted, textAlign: "center", marginTop: 4, fontStyle: "italic" }}>
              drag to orbit
            </div>
          )}
        </div>
      </div>

      {/* Loss curve and weight matrices */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 14 }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
            Loss over time
          </div>
          <LossCurve history={lossHistory} />
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
            Weight matrices (live)
          </div>
          <WeightMatrices net={net} />
        </div>
      </div>

      <Markdown src={CONTENT[8].outro} />
    </div>
  );
}

// Renders a coarse heatmap of the network's predicted probability across input space,
// with the data points overlaid.
function InputSpaceHeatmap({ net, data }) {
  if (!net) return null;
  const W = 320, H = 320;
  const RES = 28; // cells per side; total = RES*RES forward passes per render
  const cellW = W / RES, cellH = H / RES;
  const cells = [];
  for (let i = 0; i < RES; i++) {
    for (let j = 0; j < RES; j++) {
      // Map cell to input coords in [-1.2, 1.2]^2
      const x = -1.2 + (i + 0.5) * 2.4 / RES;
      const y = 1.2 - (j + 0.5) * 2.4 / RES;
      const { y: p } = net.forward([x, y]);
      // Color: red for p>0.5 (inner class), blue for p<0.5 (outer class)
      const t = p; // 0..1
      const r = Math.round(255 * t);
      const b = Math.round(255 * (1 - t));
      const a = Math.abs(p - 0.5) * 1.2 + 0.15; // stronger color when more confident
      cells.push(
        <rect key={`${i},${j}`}
          x={i * cellW} y={j * cellH} width={cellW + 0.5} height={cellH + 0.5}
          fill={`rgb(${r}, 30, ${b})`} opacity={Math.min(0.85, a)} />
      );
    }
  }
  // Decision boundary at p = 0.5: render dots where p crosses 0.5 (sample at finer grid edges)
  // Data points
  const pts = data.map((d, k) => {
    const sx = (d.x[0] + 1.2) / 2.4 * W;
    const sy = (1.2 - d.x[1]) / 2.4 * H;
    return (
      <circle key={k} cx={sx} cy={sy} r={3.5}
        fill={d.y === 1 ? "#ff5577" : "#5588ff"}
        stroke="#fff" strokeWidth={0.6} opacity={0.9} />
    );
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{
      width: "100%", maxWidth: W, background: COLORS.bg,
      borderRadius: 8, border: `1px solid ${COLORS.border}`,
    }}>
      {cells}
      {pts}
    </svg>
  );
}

// 2D hidden-rep scatter. Used when H = 2.
function HiddenSpace2D({ net, data }) {
  if (!net) return null;
  const W = 320, H = 320, CX = W / 2, CY = H / 2, S = 130;
  const pts = data.map((d, k) => {
    const { h } = net.forward(d.x);
    const sx = CX + h[0] * S;
    const sy = CY - h[1] * S;
    return (
      <circle key={k} cx={sx} cy={sy} r={3.5}
        fill={d.y === 1 ? "#ff5577" : "#5588ff"}
        stroke="#fff" strokeWidth={0.6} opacity={0.85} />
    );
  });
  // Box for the ([-1, 1])² region (tanh output range)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{
      width: "100%", maxWidth: W, background: COLORS.bg,
      borderRadius: 8, border: `1px solid ${COLORS.border}`,
    }}>
      <rect x={CX - S} y={CY - S} width={2 * S} height={2 * S}
        fill="none" stroke={COLORS.border} strokeWidth={1} strokeDasharray="3 4" />
      <line x1={0} y1={CY} x2={W} y2={CY} stroke={COLORS.gridAxis} strokeWidth={0.6} />
      <line x1={CX} y1={0} x2={CX} y2={H} stroke={COLORS.gridAxis} strokeWidth={0.6} />
      {pts}
      <text x={W - 5} y={H - 5} fill={COLORS.muted} fontSize={9} textAnchor="end"
        fontFamily="'Space Mono', monospace">tanh range [-1, 1]²</text>
    </svg>
  );
}

// 3D hidden-rep scatter, with the separating hyperplane from the output layer.
function HiddenSpace3D({ net, data, yaw, pitch, onDragStart, onDragMove, onDragEnd }) {
  if (!net) return null;
  const W = 320, H = 320, CX = W / 2, CY = H / 2, SCALE = 90;
  const proj = (pt) => {
    let [x, y, z] = pt;
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const nx = cy * x + sy * z;
    const nz = -sy * x + cy * z;
    x = nx; z = nz;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const ny = cp * y - sp * z;
    const nz2 = sp * y + cp * z;
    return [x, ny, nz2];
  };
  const toScreen = (p3) => [CX + p3[0] * SCALE, CY - p3[1] * SCALE];
  // Use first 3 hidden units even if H > 3 (axes are arbitrary anyway after training)
  const pts3 = data.map(d => {
    const { h } = net.forward(d.x);
    return { p: [h[0], h[1], h[2] || 0], y: d.y };
  });
  // Sort back-to-front by depth
  const projected = pts3.map((p, k) => {
    const pp = proj(p.p);
    return { ...p, sa: toScreen(pp), depth: pp[2], k };
  }).sort((a, b) => a.depth - b.depth);

  // Axes
  const axes = [
    { a: [-1, 0, 0], b: [1, 0, 0], c: COLORS.cyan, label: "h₁" },
    { a: [0, -1, 0], b: [0, 1, 0], c: COLORS.magenta, label: "h₂" },
    { a: [0, 0, -1], b: [0, 0, 1], c: COLORS.gold, label: "h₃" },
  ].map((s, i) => {
    const pa = proj(s.a), pb = proj(s.b);
    const lp = proj(s.b);
    return {
      ...s, sa: toScreen(pa), sb: toScreen(pb),
      label_pos: toScreen(lp), depth: (pa[2] + pb[2]) / 2, k: `ax${i}`,
    };
  });

  // Approximate separating plane: W2 · h + b2 = 0, i.e., W2[0][0]*h1 + W2[0][1]*h2 + W2[0][2]*h3 + b2 = 0
  // Build a small mesh for the plane, intersected with the cube [-1,1]^3.
  let planePolys = [];
  if (net.W2[0].length >= 3 && Math.abs(net.W2[0][2]) > 0.05) {
    const w = net.W2[0], b = net.b2[0];
    // h3 = -(b + w[0]*h1 + w[1]*h2) / w[2]
    const N = 14;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const h1a = -1 + i * 2 / N, h1b = -1 + (i + 1) * 2 / N;
        const h2a = -1 + j * 2 / N, h2b = -1 + (j + 1) * 2 / N;
        const corners = [[h1a, h2a], [h1b, h2a], [h1b, h2b], [h1a, h2b]].map(([h1, h2]) => {
          const h3 = -(b + w[0] * h1 + w[1] * h2) / w[2];
          return [h1, h2, h3];
        });
        // Clip: only render if at least one corner is inside [-1, 1] in h3
        if (corners.some(c => c[2] >= -1.1 && c[2] <= 1.1)) {
          // Clamp h3 to box for nicer visual
          const clamped = corners.map(c => [c[0], c[1], Math.max(-1, Math.min(1, c[2]))]);
          const screen = clamped.map(c => toScreen(proj(c)));
          const depths = clamped.map(c => proj(c)[2]);
          planePolys.push({
            pts: screen,
            depth: depths.reduce((a, b) => a + b, 0) / 4,
            k: `pl${i}-${j}`,
          });
        }
      }
    }
  }
  planePolys.sort((a, b) => a.depth - b.depth);

  // Composite draw order: back axes, plane back, points, plane front, front axes.
  // Simpler heuristic: combine axes and points and plane and depth-sort all together.
  const everything = [
    ...axes.map(a => ({ kind: "axis", item: a, depth: a.depth })),
    ...projected.map(p => ({ kind: "pt", item: p, depth: p.depth })),
    ...planePolys.map(p => ({ kind: "plane", item: p, depth: p.depth })),
  ].sort((a, b) => a.depth - b.depth);

  return (
    <svg viewBox={`0 0 ${W} ${H}`}
      style={{
        width: "100%", maxWidth: W, background: COLORS.bg,
        borderRadius: 8, border: `1px solid ${COLORS.border}`,
        touchAction: "none", cursor: "grab",
      }}
      onPointerDown={onDragStart} onPointerMove={onDragMove}
      onPointerUp={onDragEnd} onPointerCancel={onDragEnd}
    >
      {/* Bounding cube edges (faint) */}
      {(() => {
        const corners = [
          [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
          [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
        ];
        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7],
        ];
        const sc = corners.map(c => toScreen(proj(c)));
        return edges.map(([a, b], i) => (
          <line key={`e${i}`} x1={sc[a][0]} y1={sc[a][1]} x2={sc[b][0]} y2={sc[b][1]}
            stroke={COLORS.border} strokeWidth={0.6} opacity={0.4} />
        ));
      })()}

      {everything.map(({ kind, item, depth }) => {
        if (kind === "axis") {
          return (
            <g key={item.k}>
              <line x1={item.sa[0]} y1={item.sa[1]} x2={item.sb[0]} y2={item.sb[1]}
                stroke={item.c} strokeWidth={1.5} opacity={0.7} />
              <text x={item.label_pos[0] + 6} y={item.label_pos[1] - 4}
                fill={item.c} fontSize={11} fontWeight={700}
                fontFamily="'Space Mono', monospace">{item.label}</text>
            </g>
          );
        } else if (kind === "plane") {
          return (
            <polygon key={item.k}
              points={item.pts.map(p => p.join(",")).join(" ")}
              fill={COLORS.gold} opacity={0.08} stroke={COLORS.gold} strokeOpacity={0.15} strokeWidth={0.4} />
          );
        } else {
          return (
            <circle key={item.k} cx={item.sa[0]} cy={item.sa[1]} r={3.3}
              fill={item.y === 1 ? "#ff5577" : "#5588ff"}
              stroke="#fff" strokeWidth={0.5} opacity={0.92} />
          );
        }
      })}
    </svg>
  );
}

function LossCurve({ history }) {
  const W = 320, H = 130, pad = 24;
  if (!history || history.length < 2) {
    return (
      <div style={{
        width: "100%", maxWidth: W, height: H,
        background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: COLORS.muted, fontSize: 11, fontStyle: "italic",
      }}>
        press Train to see the loss
      </div>
    );
  }
  const minE = history[0].e, maxE = history[history.length - 1].e || 1;
  const maxL = Math.max(...history.map(h => h.l), 0.1);
  const points = history.map(({ e, l }) => {
    const sx = pad + (e - minE) / Math.max(1, maxE - minE) * (W - 2 * pad);
    const sy = H - pad - (l / maxL) * (H - 2 * pad);
    return [sx, sy];
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{
      width: "100%", maxWidth: W, background: COLORS.bg,
      borderRadius: 8, border: `1px solid ${COLORS.border}`,
    }}>
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={COLORS.border} strokeWidth={0.6} />
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke={COLORS.border} strokeWidth={0.6} />
      <polyline points={points.map(p => p.join(",")).join(" ")}
        fill="none" stroke={COLORS.green} strokeWidth={1.8} />
      <text x={W - 4} y={H - 6} fill={COLORS.muted} fontSize={9} textAnchor="end" fontFamily="'Space Mono', monospace">
        steps
      </text>
      <text x={4} y={pad - 4} fill={COLORS.muted} fontSize={9} fontFamily="'Space Mono', monospace">loss</text>
    </svg>
  );
}

function WeightMatrices({ net }) {
  if (!net) return null;
  const cellSize = 22, gap = 2;
  const heat = (v, max) => {
    // v in [-max, max] → red ↔ blue
    const t = Math.max(-1, Math.min(1, v / max));
    if (t > 0) {
      const a = t;
      return `rgba(255, 80, 130, ${0.15 + 0.7 * a})`;
    } else {
      const a = -t;
      return `rgba(85, 140, 255, ${0.15 + 0.7 * a})`;
    }
  };
  const W1 = net.W1, b1 = net.b1, W2 = net.W2, b2 = net.b2;
  const max1 = Math.max(...W1.flat().map(Math.abs), ...b1.map(Math.abs), 0.5);
  const max2 = Math.max(...W2[0].map(Math.abs), Math.abs(b2[0]), 0.5);
  const renderMatrix = (rows, max) => (
    <div style={{ display: "flex", flexDirection: "column", gap: gap, alignItems: "flex-start" }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: gap }}>
          {row.map((v, j) => (
            <div key={j} title={v.toFixed(2)} style={{
              width: cellSize, height: cellSize,
              background: heat(v, max),
              border: `1px solid ${COLORS.border}`,
              borderRadius: 3,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, color: Math.abs(v) > max * 0.5 ? "#fff" : COLORS.muted,
              fontFamily: "'Space Mono', monospace",
            }}>
              {v >= 0 ? v.toFixed(1) : v.toFixed(1)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
  return (
    <div style={{
      padding: "12px 14px", background: COLORS.bg,
      border: `1px solid ${COLORS.border}`, borderRadius: 8,
      display: "flex", gap: 18, flexWrap: "wrap", fontSize: 11,
    }}>
      <div>
        <div style={{ color: COLORS.muted, fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>W₁ ({net.H}×2)</div>
        {renderMatrix(W1, max1)}
        <div style={{ color: COLORS.muted, fontFamily: "'Space Mono', monospace", marginTop: 8, marginBottom: 4 }}>b₁ ({net.H}×1)</div>
        {renderMatrix(b1.map(v => [v]), max1)}
      </div>
      <div>
        <div style={{ color: COLORS.muted, fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>W₂ (1×{net.H})</div>
        {renderMatrix(W2, max2)}
        <div style={{ color: COLORS.muted, fontFamily: "'Space Mono', monospace", marginTop: 8, marginBottom: 4 }}>b₂ (1×1)</div>
        {renderMatrix([[b2[0]]], max2)}
      </div>
    </div>
  );
}

// ==================== CHAPTER 9: SUMMARY ====================
function Ch9() {
  const sections = [
    {
      title: "Algebra ↔ Geometry",
      color: COLORS.gold,
      items: [
        "A system of linear equations is the same thing as a matrix equation Ax = b.",
        "Solving the equations means finding where the two lines cross on the graph. Algebra and geometry say the same thing.",
      ],
    },
    {
      title: "Matrix × Vector",
      color: COLORS.cyan,
      items: [
        "Defined row-by-row: multiply matching parts, add them up.",
        "Output = x · (column 1) + y · (column 2). The matrix's columns are the building blocks.",
        "The entire transformation is captured by where x̂ and ŷ land — those destinations are literally the two columns of the matrix.",
      ],
    },
    {
      title: "Dot Product",
      color: COLORS.green,
      items: [
        "a · b = a₁b₁ + a₂b₂ — pure arithmetic.",
        "Perpendicular ⟺ dot product is zero.",
        "The projection (shadow) of one vector onto another can be computed with a single formula using dot products.",
        "Gram-Schmidt: subtract the shadow to get a perpendicular vector.",
      ],
    },
    {
      title: "Rotation",
      color: COLORS.orange,
      items: [
        "The rotation matrix by angle θ is [[cos θ, −sin θ], [sin θ, cos θ]].",
        "cos and sin are the x and y coordinates of a point walking around the unit circle — nothing more mystical than that.",
        "Rotations are the unique matrices that preserve all dot products (hence all lengths and angles).",
      ],
    },
    {
      title: "Determinants",
      color: COLORS.magenta,
      items: [
        "det = ad − bc for a 2×2 matrix.",
        "|det| is the area of the parallelogram formed by the columns. The matrix scales area by this factor.",
        "det = 0 ⟺ the matrix has no inverse ⟺ the system of equations has no unique solution. This closes the loop with Chapter 1.",
      ],
    },
    {
      title: "Homogeneous Coordinates",
      color: COLORS.purple,
      items: [
        "Plain matrix multiplication can't translate, because the origin always stays fixed.",
        "Adding an extra dimension (writing points as [x, y, 1]) lets a 3×3 matrix slide, rotate, and scale all in one multiplication.",
        "This is how video games, 3D graphics, and animation software actually work under the hood.",
      ],
    },
    {
      title: "Markov Chains",
      color: COLORS.cyan,
      items: [
        "A transition matrix encodes probabilistic state-to-state hops (rows sum to 1).",
        "Matrix × probability vector = one step of time.",
        "The steady state is a vector the matrix doesn't change — your first eigenvector.",
        "This is the math behind Google PageRank and much of modern machine learning.",
      ],
    },
  ];

  return (
    <div>
      <Markdown src={CONTENT[9].intro} />

      <div style={{ margin: "20px 0" }}>
        {sections.map((s, i) => (
          <div key={i} style={{
            marginBottom: 16,
            padding: "14px 16px",
            borderLeft: `3px solid ${s.color}`,
            background: `linear-gradient(90deg, ${s.color}10, transparent)`,
            borderRadius: "4px 8px 8px 4px",
          }}>
            <div style={{
              fontSize: 11, color: s.color, textTransform: "uppercase", letterSpacing: 2,
              fontFamily: "'Space Mono', monospace", fontWeight: 700, marginBottom: 8,
            }}>
              {`0${i + 1}`.slice(-2)} &nbsp;·&nbsp; {s.title}
            </div>
            <ul style={{ paddingLeft: 18, margin: 0, listStyle: "none" }}>
              {s.items.map((item, j) => (
                <li key={j} style={{
                  fontSize: 13, color: COLORS.text, lineHeight: 1.7, marginBottom: 5,
                  position: "relative",
                }}>
                  <span style={{ position: "absolute", left: -14, color: s.color, fontWeight: 700 }}>▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Markdown src={CONTENT[9].outro} />
    </div>
  );
}

// ==================== CHAPTER DATA ====================
const chapterData = [
  { num: 0, title: "Introduction",           component: Ch0, color: COLORS.muted },
  { num: 1, title: "Linear Systems",         component: Ch1, color: COLORS.gold },
  { num: 2, title: "Transformations",        component: Ch2, color: COLORS.cyan },
  { num: 3, title: "Vector Shadows: the Dot Product", component: Ch3, color: COLORS.green },
  { num: 4, title: "Rotations",              component: Ch4, color: COLORS.orange },
  { num: 5, title: "Determinants",           component: Ch5, color: COLORS.magenta },
  { num: 6, title: "Homogeneous Coordinates", component: Ch6, color: COLORS.purple },
  { num: 7, title: "Markov Chains",          component: Ch7, color: COLORS.cyan },
  { num: 8, title: "Neural Networks",        component: Ch8, color: COLORS.green },
  { num: 9, title: "Summary",                component: Ch9, color: COLORS.gold },
];

// ==================== MAIN APP ====================
export default function MatrixExplorer() {
  const [chapter, setChapter] = useState(0);
  const ch = chapterData[chapter];
  const Comp = ch.component;

  // Jump helper: find chapter by num and switch to it. Used for cross-chapter links
  // like Ch 2 pointing forward to Ch 6.
  const jumpTo = useCallback((num) => {
    const idx = chapterData.findIndex(c => c.num === num);
    if (idx !== -1) {
      setChapter(idx);
      // Scroll to top on chapter change
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.text,
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=range] { -webkit-appearance: none; background: ${COLORS.border}; border-radius: 4px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; cursor: pointer; }
        input[type=number] { outline: none; }
        input[type=number]:focus { border-color: ${COLORS.cyan}; }
        button:hover { filter: brightness(1.2); }
        ::selection { background: ${COLORS.cyan}40; }
      `}</style>

      {/* Header */}
      <header style={{
        padding: "20px 24px 16px", borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
      }}>
        <h1 style={{
          fontSize: 22, fontWeight: 700, letterSpacing: -0.5,
          background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.gold})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Applications for Vectors and Matrices
        </h1>
      </header>

      {/* Chapter nav */}
      <nav style={{
        display: "flex", gap: 0, overflowX: "auto", borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
      }}>
        {chapterData.map((c, i) => (
          <button key={i} onClick={() => setChapter(i)}
            style={{
              padding: "10px 14px", fontSize: 12, background: "transparent",
              border: "none", borderBottom: `2px solid ${i === chapter ? c.color : "transparent"}`,
              color: i === chapter ? c.color : COLORS.muted,
              cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
              fontWeight: i === chapter ? 700 : 400,
              transition: "all 0.15s",
            }}>
            {c.num}. {c.title}
          </button>
        ))}
      </nav>

      {/* Chapter content */}
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px 48px" }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontSize: 11, color: ch.color, fontFamily: "'Space Mono', monospace",
            textTransform: "uppercase", letterSpacing: 2,
          }}>
            Chapter {ch.num}
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginTop: 4 }}>
            {ch.title}
          </h2>
        </div>
        <Comp jumpTo={jumpTo} />

        {/* Nav buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
          <button onClick={() => setChapter(Math.max(0, chapter - 1))} disabled={chapter === 0}
            style={{ ...btnStyle, opacity: chapter === 0 ? 0.3 : 1 }}>
            ← Previous
          </button>
          <button onClick={() => setChapter(Math.min(chapterData.length - 1, chapter + 1))} disabled={chapter === chapterData.length - 1}
            style={{ ...btnStyle, opacity: chapter === chapterData.length - 1 ? 0.3 : 1, background: ch.color + "20", borderColor: ch.color + "50", color: ch.color }}>
            Next →
          </button>
        </div>
      </main>
    </div>
  );
}
