import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#080d14",
  card: "#0d1520",
  border: "#1a2d42",
  accent: "#38bdf8",
  accentSoft: "#38bdf820",
  teal: "#2dd4bf",
  tealSoft: "#2dd4bf18",
  water: "#1e6fa8",
  waterLight: "#38bdf850",
  red: "#f87171",
  redSoft: "#f8717120",
  green: "#4ade80",
  greenSoft: "#4ade8018",
  muted: "#4a6080",
  text: "#cde4f5",
  surface: "#0a1525",
  pointer: "#facc15",
  pointerSoft: "#facc1520",
};

function simulate(heights) {
  const steps = [];
  let l = 0, r = heights.length - 1, best = 0, bestL = 0, bestR = 0;

  steps.push({ l, r, area: 0, best, bestL, bestR, desc: "Initialize left=0, right=n-1. We'll shrink inward.", moved: null });

  while (l < r) {
    const h = Math.min(heights[l], heights[r]);
    const area = h * (r - l);
    if (area > best) { best = area; bestL = l; bestR = r; }
    const moved = heights[l] < heights[r] ? "left" : (heights[r] < heights[l] ? "right" : "left");
    const desc = area > (steps[steps.length - 1]?.best ?? 0)
      ? `area = min(${heights[l]},${heights[r]}) × ${r - l} = ${area} ✦ new best!`
      : `area = min(${heights[l]},${heights[r]}) × ${r - l} = ${area}`;
    steps.push({ l, r, area, best, bestL, bestR, desc, moved });
    if (heights[l] < heights[r]) l++;
    else r--;
  }
  steps.push({ l, r, area: null, best, bestL, bestR, desc: `Pointers met → answer = ${best}`, moved: null, done: true });
  return steps;
}

const TABS = ["Problem", "Intuition", "Visualizer", "Code"];

function Card({ title, children, accent }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${accent ? C.accent + "44" : C.border}`, borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: accent ? C.accent : C.muted, marginBottom: 14, letterSpacing: "0.12em", textTransform: "uppercase" }}>{title}</div>
      {children}
    </div>
  );
}

function WaterViz({ heights, l, r, best, bestL, bestR, done }) {
  if (!heights || heights.length === 0) return null;
  const maxH = Math.max(...heights);
  const BAR_W = Math.min(44, Math.floor(520 / heights.length) - 4);
  const GAP = Math.max(3, Math.floor(520 / heights.length) - BAR_W);
  const VIZ_H = 180;

  const areaH = l !== undefined && r !== undefined && !done
    ? Math.min(heights[l], heights[r])
    : null;

  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{
        display: "flex", alignItems: "flex-end", gap: GAP,
        minWidth: heights.length * (BAR_W + GAP),
        height: VIZ_H + 28,
        padding: "0 8px",
        position: "relative",
      }}>
        {heights.map((h, i) => {
          const barH = (h / maxH) * VIZ_H;
          const isL = i === l && !done;
          const isR = i === r && !done;
          const isBestL = i === bestL;
          const isBestR = i === bestR;
          const inWater = l !== undefined && r !== undefined && i > l && i < r && !done;
          const waterH = areaH ? (areaH / maxH) * VIZ_H : 0;

          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              {/* pointer label */}
              {(isL || isR) && (
                <div style={{
                  position: "absolute", top: VIZ_H - barH - 22,
                  fontSize: 11, fontWeight: 700,
                  color: C.pointer,
                  background: C.pointerSoft,
                  border: `1px solid ${C.pointer}55`,
                  borderRadius: 4, padding: "1px 5px",
                  whiteSpace: "nowrap",
                }}>
                  {isL ? "L" : "R"}
                </div>
              )}
              {/* bar */}
              <div style={{
                width: BAR_W,
                height: barH,
                borderRadius: "4px 4px 0 0",
                background: isL || isR
                  ? `linear-gradient(180deg, ${C.pointer}, ${C.pointer}88)`
                  : (isBestL || isBestR) && done
                  ? `linear-gradient(180deg, ${C.teal}, ${C.teal}88)`
                  : C.border,
                border: `1px solid ${isL || isR ? C.pointer : (isBestL || isBestR) && done ? C.teal : C.border}`,
                position: "relative",
                zIndex: 2,
                transition: "all 0.25s ease",
                boxShadow: isL || isR ? `0 0 10px ${C.pointer}55` : "none",
              }}>
                {/* water fill inside bar */}
                {inWater && waterH > 0 && (
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: Math.min(waterH, barH),
                    background: C.waterLight,
                    borderRadius: "2px 2px 0 0",
                  }} />
                )}
              </div>
              {/* water between bars */}
              {inWater && waterH > 0 && (
                <div style={{
                  position: "absolute", bottom: 0, left: -GAP / 2,
                  width: BAR_W + GAP, height: waterH,
                  background: `linear-gradient(180deg, ${C.water}44, ${C.water}88)`,
                  zIndex: 1,
                  pointerEvents: "none",
                }} />
              )}
              {/* index */}
              <div style={{ fontSize: 10, color: isL || isR ? C.pointer : C.muted, marginTop: 4, fontFamily: "monospace" }}>{i}</div>
              {/* height value */}
              <div style={{ fontSize: 9, color: C.muted, fontFamily: "monospace" }}>{h}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [inputStr, setInputStr] = useState("1,8,6,2,5,4,8,3,7");
  const [heights, setHeights] = useState([1, 8, 6, 2, 5, 4, 8, 3, 7]);
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);
  const [liveInput, setLiveInput] = useState("");
  const [liveResult, setLiveResult] = useState(null);

  useEffect(() => {
    try {
      const arr = inputStr.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
      if (arr.length >= 2) { setHeights(arr); setSteps(simulate(arr)); setSi(0); }
    } catch {}
  }, [inputStr]);

  const step = steps[si];

  const runLive = () => {
    try {
      const arr = liveInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
      if (arr.length < 2) return;
      let l = 0, r = arr.length - 1, best = 0;
      while (l < r) {
        best = Math.max(best, Math.min(arr[l], arr[r]) * (r - l));
        if (arr[l] < arr[r]) l++; else r--;
      }
      setLiveResult(best);
    } catch {}
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Courier New', 'Fira Code', monospace" }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${C.border}`, padding: "16px 24px",
        display: "flex", alignItems: "center", gap: 14,
        background: `linear-gradient(90deg, ${C.card}, ${C.bg})`,
      }}>
        <span style={{ fontSize: 22 }}>🌊</span>
        <span style={{ fontSize: 17, fontWeight: 700, fontFamily: "Georgia, serif", letterSpacing: "-0.3px", color: C.text }}>
          Container With Most Water
        </span>
        <div style={{ padding: "2px 10px", borderRadius: 20, background: C.tealSoft, border: `1px solid ${C.teal}`, fontSize: 11, color: C.teal }}>
          Medium · Two Pointers
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 24px", background: C.card }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "11px 16px", fontSize: 13,
            color: tab === t ? C.accent : C.muted,
            borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent",
            fontFamily: "inherit", transition: "color 0.2s"
          }}>{t}</button>
        ))}
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ─── PROBLEM ─── */}
        {tab === "Problem" && (<>
          <Card title="Problem Statement">
            <p style={{ color: C.muted, lineHeight: 1.75, margin: 0 }}>
              You are given an integer array <span style={{ color: C.accent }}>height</span> of length <code style={{ color: C.teal }}>n</code>. There are <code style={{ color: C.teal }}>n</code> vertical lines drawn such that the two endpoints of the <code style={{ color: C.teal }}>i-th</code> line are <code style={{ color: C.teal }}>(i, 0)</code> and <code style={{ color: C.teal }}>(i, height[i])</code>.
            </p>
            <p style={{ color: C.muted, lineHeight: 1.75, margin: "12px 0 0" }}>
              Find two lines that together with the x-axis form a container that holds the <strong style={{ color: C.text }}>most water</strong>. Return the maximum amount of water.
            </p>
            <div style={{ margin: "16px 0 0", background: C.surface, borderRadius: 8, padding: "12px 16px", border: `1px solid ${C.border}` }}>
              <code style={{ color: C.accent, fontSize: 13 }}>
                area = min(height[l], height[r]) × (r − l)
              </code>
            </div>
          </Card>

          <Card title="Example  →  height = [1, 8, 6, 2, 5, 4, 8, 3, 7]">
            <div style={{ marginBottom: 16 }}>
              <WaterViz heights={[1,8,6,2,5,4,8,3,7]} l={1} r={8} best={49} bestL={1} bestR={8} />
            </div>
            <pre style={{ background: C.surface, borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 2, margin: 0, overflowX: "auto" }}>
              <span style={{ color: C.muted }}>Best container: lines at index </span><span style={{ color: C.pointer }}>1</span><span style={{ color: C.muted }}> and </span><span style={{ color: C.pointer }}>8</span>{"\n"}
              <span style={{ color: C.muted }}>area = min(</span><span style={{ color: C.accent }}>8</span><span style={{ color: C.muted }}>, </span><span style={{ color: C.accent }}>7</span><span style={{ color: C.muted }}>) × (8−1) = 7 × 7 = </span><span style={{ color: C.green, fontWeight: 700 }}>49</span>
            </pre>
          </Card>

          <Card title="Constraints">
            <ul style={{ color: C.muted, lineHeight: 2.1, paddingLeft: 20, margin: 0 }}>
              <li><code style={{ color: C.text }}>n == height.length</code></li>
              <li><code style={{ color: C.text }}>2 ≤ n ≤ 10⁵</code></li>
              <li><code style={{ color: C.text }}>0 ≤ height[i] ≤ 10⁴</code></li>
            </ul>
          </Card>
        </>)}

        {/* ─── INTUITION ─── */}
        {tab === "Intuition" && (<>
          <Card title="🤔 Brute Force First">
            <p style={{ color: C.muted, lineHeight: 1.75, margin: 0 }}>
              Try every pair <code style={{ color: C.accent }}>(l, r)</code> and compute the area. Works, but slow.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <div style={{ flex: 1, background: C.surface, borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>BRUTE FORCE</div>
                <div style={{ color: C.red, fontWeight: 700 }}>O(n²) ❌</div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>nested loop over all pairs</div>
              </div>
              <div style={{ flex: 1, background: C.surface, borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>TWO POINTERS</div>
                <div style={{ color: C.green, fontWeight: 700 }}>O(n) ✅</div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>single pass, shrink inward</div>
              </div>
            </div>
          </Card>

          <Card title="💡 The Greedy Insight">
            <p style={{ color: C.muted, lineHeight: 1.75, margin: "0 0 14px" }}>
              Start with the <strong style={{ color: C.text }}>widest possible container</strong>: <code style={{ color: C.pointer }}>l=0</code>, <code style={{ color: C.pointer }}>r=n-1</code>. To potentially increase area, we need a taller wall.
            </p>
            <div style={{ background: C.surface, borderRadius: 8, padding: 14, marginBottom: 14, border: `1px solid ${C.accent}33` }}>
              <p style={{ color: C.text, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                Area is limited by the <span style={{ color: C.red }}>shorter</span> wall. Moving the <span style={{ color: C.teal }}>taller</span> pointer inward can <em>only decrease</em> width with no chance of a taller limiting wall. So we <strong style={{ color: C.accent }}>always move the shorter pointer</strong>.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "📐", q: "Why not move the taller pointer?", a: "Width shrinks AND the shorter wall still limits height → area can only decrease." },
                { icon: "⚖️", q: "What if heights are equal?", a: "Move either — both walls limit equally, so one must be replaced to find a better answer." },
              ].map(({ icon, q, a }) => (
                <div key={q} style={{ background: C.surface, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>{icon} {q}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{a}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="🏗️ Algorithm Steps">
            {[
              { n: "1", t: "Place pointers at both ends", d: "l = 0, r = n-1. This gives the maximum possible width." },
              { n: "2", t: "Compute current area", d: "area = min(height[l], height[r]) × (r - l). Track the maximum." },
              { n: "3", t: "Move the shorter wall inward", d: "If height[l] < height[r], l++. Else r--. This is the greedy choice." },
              { n: "4", t: "Repeat until pointers meet", d: "When l == r there's no container to form. Return max area seen." },
            ].map(({ n, t, d }) => (
              <div key={n} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.accentSoft, border: `1px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.accent, flexShrink: 0, fontWeight: 700 }}>{n}</div>
                <div>
                  <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t}</div>
                  <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{d}</div>
                </div>
              </div>
            ))}
          </Card>

          <Card title="🧠 Pattern Memorization Pointers">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { tag: "TRIGGER", color: C.accent, text: 'Any time a problem asks for max/min between pairs in an array — think Two Pointers.' },
                { tag: "MANTRA", color: C.teal, text: '"Move the shorter wall." Say it out loud. The bottleneck determines the area, so replacing the bottleneck is the only hope.' },
                { tag: "PATTERN", color: C.pointer, text: 'Widest first, then greedy shrink. Start O(n²) search space → reduce to O(n) by proving moves are safe.' },
                { tag: "RELATED", color: C.green, text: 'Trapping Rain Water (same bar chart, different rule), 3Sum (multi-pointer variant), Longest Substring patterns.' },
              ].map(({ tag, color, text }) => (
                <div key={tag} style={{ display: "flex", gap: 12, background: C.surface, borderRadius: 8, padding: "10px 14px", border: `1px solid ${color}22` }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color, background: color + "22", border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap", alignSelf: "flex-start", letterSpacing: "0.08em" }}>{tag}</span>
                  <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{text}</span>
                </div>
              ))}
            </div>
          </Card>
        </>)}

        {/* ─── VISUALIZER ─── */}
        {tab === "Visualizer" && (<>
          <Card title="Configure">
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Heights (comma-separated, positive integers)</span>
              <input value={inputStr} onChange={e => setInputStr(e.target.value)}
                style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "9px 14px", fontSize: 14, fontFamily: "inherit" }} />
            </label>
          </Card>

          {steps.length > 0 && step && (
            <Card title="Step-by-Step Simulation">
              {/* Step pills */}
              <div style={{ display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap" }}>
                {steps.map((s, i) => (
                  <button key={i} onClick={() => setSi(i)} style={{
                    padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                    background: i === si ? C.accent : C.surface,
                    border: `1px solid ${i === si ? C.accent : C.border}`,
                    color: i === si ? C.bg : C.muted, fontWeight: i === si ? 700 : 400,
                  }}>
                    {i === 0 ? "init" : s.done ? "done" : `s${i}`}
                  </button>
                ))}
              </div>

              {/* Status banner */}
              <div style={{
                background: step.done ? C.greenSoft : step.area > (steps[si - 1]?.best ?? -1) && si > 0 ? C.accentSoft : C.surface,
                border: `1px solid ${step.done ? C.green : step.area > (steps[si - 1]?.best ?? -1) && si > 0 ? C.accent : C.border}`,
                borderRadius: 8, padding: "10px 14px", marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>STEP {si + 1} / {steps.length}</div>
                <div style={{ fontSize: 14, color: C.text }}>{step.desc}</div>
                {!step.done && si > 0 && (
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
                    Moving <span style={{ color: C.pointer, fontWeight: 700 }}>{step.moved === "left" ? "LEFT ↦" : "RIGHT ↤"}</span> pointer (shorter wall)
                  </div>
                )}
              </div>

              {/* Water visualization */}
              <WaterViz heights={heights} l={step.done ? undefined : step.l} r={step.done ? undefined : step.r} best={step.best} bestL={step.bestL} bestR={step.bestR} done={step.done} />

              {/* Stats row */}
              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                {[
                  { label: "L pointer", val: step.done ? "—" : step.l, color: C.pointer },
                  { label: "R pointer", val: step.done ? "—" : step.r, color: C.pointer },
                  { label: "Current area", val: step.area ?? "—", color: C.accent },
                  { label: "Max so far", val: step.best, color: C.green },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ flex: 1, minWidth: 90, background: C.surface, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={() => setSi(i => Math.max(0, i - 1))} disabled={si === 0}
                  style={{ flex: 1, padding: 9, background: C.surface, border: `1px solid ${C.border}`, color: si === 0 ? C.muted : C.text, borderRadius: 6, cursor: si === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13 }}>← Prev</button>
                <button onClick={() => setSi(i => Math.min(steps.length - 1, i + 1))} disabled={si === steps.length - 1}
                  style={{ flex: 1, padding: 9, background: si === steps.length - 1 ? C.surface : C.accent, border: `1px solid ${si === steps.length - 1 ? C.border : C.accent}`, color: si === steps.length - 1 ? C.muted : C.bg, borderRadius: 6, cursor: si === steps.length - 1 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>Next →</button>
              </div>
            </Card>
          )}

          <Card title="🧪 Quick Test">
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: C.muted }}>Try your own heights</span>
                <input value={liveInput} onChange={e => { setLiveInput(e.target.value); setLiveResult(null); }}
                  onKeyDown={e => e.key === "Enter" && runLive()}
                  placeholder="e.g. 4,3,2,1,4"
                  style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "9px 14px", fontSize: 14, fontFamily: "inherit" }} />
              </label>
              <button onClick={runLive} style={{ padding: "9px 20px", background: C.accentSoft, border: `1px solid ${C.accent}`, color: C.accent, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Run</button>
            </div>
            {liveResult !== null && (
              <div style={{ marginTop: 12, background: C.greenSoft, border: `1px solid ${C.green}`, borderRadius: 6, padding: "10px 14px", fontSize: 14, color: C.green }}>
                Max water: <strong>{liveResult}</strong>
              </div>
            )}
          </Card>
        </>)}

        {/* ─── CODE ─── */}
        {tab === "Code" && (<>
          <Card title="Java Solution" accent>
            <pre style={{ background: C.surface, borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 1.9, margin: 0, overflowX: "auto", whiteSpace: "pre-wrap" }}>
              <span style={{ color: C.teal }}>class </span><span style={{ color: C.accent }}>Solution</span>{" {\n"}
              {"    "}<span style={{ color: C.teal }}>public int </span><span style={{ color: C.green }}>maxArea</span>(<span style={{ color: C.teal }}>int</span><span style={{ color: C.text }}>[] height) {"{\n"}</span>
              {"        "}<span style={{ color: C.teal }}>int </span><span style={{ color: C.text }}>l = 0, r = height.length - 1;{"\n"}</span>
              {"        "}<span style={{ color: C.teal }}>int </span><span style={{ color: C.text }}>maxWater = 0;{"\n\n"}</span>
              {"        "}<span style={{ color: C.teal }}>while </span>(<span style={{ color: C.text }}>l &lt; r) {"{\n"}</span>
              {"            "}<span style={{ color: C.muted }}>// area = shorter wall × width{"\n"}</span>
              {"            "}<span style={{ color: C.teal }}>int </span><span style={{ color: C.text }}>water = Math.min(height[l], height[r]) * (r - l);{"\n"}</span>
              {"            "}<span style={{ color: C.text }}>maxWater = Math.max(maxWater, water);{"\n\n"}</span>
              {"            "}<span style={{ color: C.muted }}>// move the shorter wall inward{"\n"}</span>
              {"            "}<span style={{ color: C.teal }}>if </span>(<span style={{ color: C.text }}>height[l] &lt; height[r]) l++;{"\n"}</span>
              {"            "}<span style={{ color: C.teal }}>else </span><span style={{ color: C.text }}>r--;{"\n"}</span>
              {"        }"}{"\n"}
              {"        "}<span style={{ color: C.teal }}>return </span><span style={{ color: C.text }}>maxWater;{"\n"}</span>
              {"    }"}{"\n"}
              {"}"}
            </pre>
          </Card>

          <Card title="Line-by-line Breakdown">
            {[
              { line: "l = 0, r = n-1", exp: "Start with widest container. Maximum width = n-1. We trade width for potential height gain as we shrink." },
              { line: "Math.min(height[l], height[r])", exp: "Water height is capped by the shorter wall. No matter how tall the other wall is, water spills over the shorter one." },
              { line: "* (r - l)", exp: "Width of the container. Multiplying by the effective height gives the area." },
              { line: "Math.max(maxWater, water)", exp: "Track the global best. Every step is a candidate — we never skip a valid container." },
              { line: "if (height[l] < height[r]) l++", exp: "The left wall is shorter → it's the bottleneck. Moving left is the only way to potentially increase min(h[l], h[r]). Moving right would only decrease width with no upside." },
              { line: "else r--", exp: "Right wall is shorter (or equal). Same logic — shrink from the limiting side." },
            ].map(({ line, exp }) => (
              <div key={line} style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <code style={{ background: C.surface, padding: "3px 8px", borderRadius: 4, fontSize: 11, color: C.accent, whiteSpace: "nowrap", flexShrink: 0 }}>{line}</code>
                <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{exp}</span>
              </div>
            ))}
          </Card>

          <Card title="Two Pointer Cheat Sheet">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { op: "Widest first", desc: "Always start l=0, r=n-1 for max-area two-pointer problems" },
                { op: "Move shorter", desc: "Greedy: only moving the bottleneck can improve area" },
                { op: "O(n) time", desc: "Each pointer moves at most n steps total → linear" },
                { op: "O(1) space", desc: "Only two index variables, no extra data structures" },
                { op: "l < r condition", desc: "Stop when pointers meet — no container can be formed with same index" },
                { op: "Math.min for height", desc: "Water level = shorter wall. Classic container logic." },
              ].map(({ op, desc }) => (
                <div key={op} style={{ background: C.surface, borderRadius: 6, padding: "10px 12px" }}>
                  <code style={{ fontSize: 11, color: C.accent, display: "block", marginBottom: 4 }}>{op}</code>
                  <span style={{ fontSize: 12, color: C.muted }}>{desc}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Common Gotchas">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "⚠️", text: "Moving the taller pointer when heights differ is WRONG — it can never help. The shorter wall is the constraint." },
                { icon: "⚠️", text: "Off-by-one: use (r - l) not (r - l + 1). Index distance, not count of bars." },
                { icon: "✅", text: "When heights are equal, moving either pointer is fine — both walls limit equally, so one must go." },
                { icon: "✅", text: "This is NOT the same as Trapping Rain Water — here you choose ONE container; there you fill all gaps between walls." },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", gap: 10, background: C.surface, borderRadius: 6, padding: "10px 12px" }}>
                  <span>{icon}</span>
                  <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{text}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="⚡ Complexity">
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { l: "TIME", v: "O(n)", s: "each pointer moves at most n steps" },
                { l: "SPACE", v: "O(1)", s: "only two index variables" },
              ].map(({ l, v, s }) => (
                <div key={l} style={{ flex: 1, background: C.surface, borderRadius: 8, padding: 12, textAlign: "center" }}>
                  <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>{l}</div>
                  <div style={{ color: C.green, fontWeight: 700, fontSize: 16 }}>{v}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{s}</div>
                </div>
              ))}
            </div>
          </Card>
        </>)}
      </div>
    </div>
  );
}
