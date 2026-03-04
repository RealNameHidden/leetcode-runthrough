import { useState, useEffect } from "react";

const C = {
  bg: "#07101f", card: "#0c1830", border: "#162b4a",
  water: "rgba(96,165,250,0.45)", waterBright: "rgba(147,197,253,0.85)",
  left: "#f97316", right: "#c084fc",
  green: "#4ade80", greenSoft: "#4ade8018",
  amber: "#fbbf24", amberSoft: "#fbbf2418",
  accent: "#38bdf8", accentSoft: "#38bdf818",
  stone: "#334155", muted: "#4b6a8c", text: "#cbd5e1", heap: "#091420",
};

function simulate(heights) {
  const n = heights.length;
  const waterArr = new Array(n).fill(0);
  const steps = [];
  let left = 0, right = n - 1, leftMax = 0, rightMax = 0, total = 0;

  steps.push({
    left, right, leftMax, rightMax, total,
    waterArr: [...waterArr], activeIdx: null, waterAdded: 0,
    action: "init", desc: `Initialize: left=0, right=${n - 1}. Track leftMax & rightMax as we squeeze inward.`
  });

  while (left < right) {
    if (heights[left] <= heights[right]) {
      if (heights[left] >= leftMax) {
        leftMax = heights[left];
        steps.push({ left, right, leftMax, rightMax, total, waterArr: [...waterArr], activeIdx: left, waterAdded: 0, action: "updateMax", side: "left", desc: `h[${left}]=${heights[left]} ≥ leftMax → new leftMax = ${leftMax}. This bar is a wall, no water trapped.` });
      } else {
        const w = leftMax - heights[left];
        waterArr[left] = w; total += w;
        steps.push({ left, right, leftMax, rightMax, total, waterArr: [...waterArr], activeIdx: left, waterAdded: w, action: "trap", side: "left", desc: `h[${left}]=${heights[left]} < leftMax=${leftMax} → trap ${w} unit${w !== 1 ? "s" : ""}. Running total = ${total}` });
      }
      left++;
    } else {
      if (heights[right] >= rightMax) {
        rightMax = heights[right];
        steps.push({ left, right, leftMax, rightMax, total, waterArr: [...waterArr], activeIdx: right, waterAdded: 0, action: "updateMax", side: "right", desc: `h[${right}]=${heights[right]} ≥ rightMax → new rightMax = ${rightMax}. This bar is a wall, no water trapped.` });
      } else {
        const w = rightMax - heights[right];
        waterArr[right] = w; total += w;
        steps.push({ left, right, leftMax, rightMax, total, waterArr: [...waterArr], activeIdx: right, waterAdded: w, action: "trap", side: "right", desc: `h[${right}]=${heights[right]} < rightMax=${rightMax} → trap ${w} unit${w !== 1 ? "s" : ""}. Running total = ${total}` });
      }
      right--;
    }
  }
  steps.push({ left, right, leftMax, rightMax, total, waterArr: [...waterArr], activeIdx: null, waterAdded: 0, action: "done", desc: `left ≥ right — pointers met! Total trapped = ${total} units.` });
  return steps;
}

const CHART_H = 160;

function BarChart({ heights, waterArr, leftPtr, rightPtr, activeIdx, action }) {
  const maxH = Math.max(...heights, 1);
  const n = heights.length;
  const barW = Math.max(20, Math.min(48, Math.floor(520 / n) - 5));

  return (
    <div style={{ overflowX: "auto", padding: "4px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, justifyContent: "center", minWidth: n * (barW + 4), height: CHART_H + 56 }}>
        {heights.map((h, i) => {
          const stonePx = Math.max(h > 0 ? Math.round((h / maxH) * CHART_H) : 4, h > 0 ? 6 : 4);
          const wt = waterArr[i] || 0;
          const waterPx = wt > 0 ? Math.max(Math.round((wt / maxH) * CHART_H), 4) : 0;
          const isLeft = i === leftPtr, isRight = i === rightPtr, isActive = i === activeIdx;
          const justTrapped = action === "trap" && isActive;

          let stoneColor = C.stone;
          if (isActive) stoneColor = isLeft ? C.left : C.right;
          else if (isLeft) stoneColor = "#9a3412";
          else if (isRight) stoneColor = "#6b21a8";

          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: CHART_H + 56 }}>
              <div style={{ display: "flex", flexDirection: "column", width: barW }}>
                {waterPx > 0 && (
                  <div style={{
                    height: waterPx,
                    background: justTrapped ? "rgba(96,165,250,0.88)" : C.water,
                    borderTop: `2px solid ${C.waterBright}`,
                    transition: "all 0.3s",
                    boxShadow: justTrapped ? "0 0 12px rgba(96,165,250,0.6)" : "none"
                  }} />
                )}
                <div style={{
                  height: stonePx,
                  background: stoneColor,
                  borderRadius: "2px 2px 0 0",
                  outline: isLeft ? `2px solid ${C.left}` : isRight ? `2px solid ${C.right}` : "none",
                  outlineOffset: 2,
                  transition: "all 0.25s",
                  boxShadow: isActive ? `0 0 16px ${isLeft ? C.left : C.right}88` : "none"
                }} />
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 4, fontFamily: "monospace" }}>{h}</div>
              <div style={{ fontSize: 10, fontWeight: 700, height: 16, fontFamily: "monospace", color: isLeft && isRight ? C.accent : isLeft ? C.left : isRight ? C.right : "transparent" }}>
                {isLeft && isRight ? "▲" : isLeft ? "L" : isRight ? "R" : "·"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 14, letterSpacing: "0.12em", textTransform: "uppercase" }}>{title}</div>
      {children}
    </div>
  );
}

const TABS = ["Problem", "Intuition", "Visualizer", "Code"];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [hStr, setHStr] = useState("4,2,0,3,2,5");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);
  const [liveStr, setLiveStr] = useState("");
  const [liveResult, setLiveResult] = useState(null);
  const [liveRan, setLiveRan] = useState(false);

  const parseHeights = (s) => s.split(",").map(x => parseInt(x.trim())).filter(n => !isNaN(n) && n >= 0);

  useEffect(() => {
    const arr = parseHeights(hStr);
    if (arr.length >= 2) { setSteps(simulate(arr)); setSi(0); }
  }, [hStr]);

  const step = steps[si] || null;
  const heights = parseHeights(hStr);

  const runLive = () => {
    const arr = parseHeights(liveStr);
    if (arr.length < 2) return;
    const s = simulate(arr);
    setLiveResult(s[s.length - 1].total);
    setLiveRan(true);
  };

  const bannerStyle = (action) => {
    if (action === "trap") return { bg: "rgba(56,189,248,0.08)", border: C.accent };
    if (action === "updateMax") return { bg: C.amberSoft, border: C.amber };
    if (action === "done") return { bg: C.greenSoft, border: C.green };
    return { bg: C.accentSoft, border: C.accent };
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Courier New', monospace" }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "15px 24px", display: "flex", alignItems: "center", gap: 14, background: C.card }}>
        <span style={{ fontSize: 20 }}>🌧️</span>
        <span style={{ fontSize: 17, fontWeight: 700, fontFamily: "Georgia, serif", letterSpacing: "-0.3px" }}>Trapping Rain Water</span>
        <div style={{ padding: "2px 10px", borderRadius: 20, background: "#ef444418", border: "1px solid #ef4444", fontSize: 11, color: "#ef4444" }}>Hard · Two Pointers</div>
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

      <div style={{ maxWidth: 840, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── PROBLEM ── */}
        {tab === "Problem" && (<>
          <Card title="Problem Statement">
            <p style={{ color: C.muted, lineHeight: 1.8, margin: 0 }}>
              Given an array of non-negative integers <span style={{ color: C.amber }}>height</span> representing an elevation map where each bar has width 1, compute how much water it can <strong style={{ color: C.text }}>trap after raining</strong>.
            </p>
          </Card>

          <Card title="Visual Example  →  height = [4,2,0,3,2,5]">
            <div style={{ background: C.heap, borderRadius: 10, padding: 20 }}>
              {/* Static visual */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, justifyContent: "center", marginBottom: 16 }}>
                {[4,2,0,3,2,5].map((h, i) => {
                  const maxH = 5;
                  const water = [0,2,4,1,2,0][i];
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      {water > 0 && <div style={{ width: 44, height: Math.round((water/maxH)*120), background: C.water, borderTop: `2px solid ${C.waterBright}` }} />}
                      <div style={{ width: 44, height: h > 0 ? Math.round((h/maxH)*120) : 4, background: C.stone, borderRadius: "2px 2px 0 0" }} />
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontFamily: "monospace" }}>{h}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  ["idx 1", "min(4, 5) − 2", "= 2 units"],
                  ["idx 2", "min(4, 5) − 0", "= 4 units"],
                  ["idx 3", "min(4, 5) − 3", "= 1 unit"],
                  ["idx 4", "min(4, 5) − 2", "= 2 units"],
                ].map(([idx, formula, res]) => (
                  <div key={idx} style={{ display: "flex", gap: 12, fontSize: 12 }}>
                    <span style={{ color: C.muted, minWidth: 36 }}>{idx}:</span>
                    <span style={{ color: C.text }}>{formula}</span>
                    <span style={{ color: C.green, fontWeight: 700 }}>{res}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, padding: "8px 12px", background: C.greenSoft, border: `1px solid ${C.green}`, borderRadius: 6, color: C.green, fontWeight: 700, fontSize: 14 }}>
                  Total = 9 units trapped 🎉
                </div>
              </div>
            </div>
          </Card>

          <Card title="Classic Example  →  height = [0,1,0,2,1,0,1,3,2,1,2,1]">
            <div style={{ background: C.heap, borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, justifyContent: "center", marginBottom: 12 }}>
                {[0,1,0,2,1,0,1,3,2,1,2,1].map((h, i) => {
                  const water = [0,0,1,0,1,2,1,0,0,1,0,0][i];
                  const maxH = 3;
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      {water > 0 && <div style={{ width: 28, height: Math.round((water/maxH)*90), background: C.water, borderTop: `2px solid ${C.waterBright}` }} />}
                      <div style={{ width: 28, height: h > 0 ? Math.round((h/maxH)*90) : 3, background: C.stone, borderRadius: "2px 2px 0 0" }} />
                      <div style={{ fontSize: 9, color: C.muted, marginTop: 3 }}>{h}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: "center", color: C.green, fontWeight: 700 }}>Answer = 6 units</div>
            </div>
          </Card>

          <Card title="Constraints">
            <ul style={{ color: C.muted, lineHeight: 2.2, paddingLeft: 20, margin: 0 }}>
              <li><code style={{ color: C.text }}>n == height.length</code></li>
              <li><code style={{ color: C.text }}>1 ≤ n ≤ 2 × 10⁴</code></li>
              <li><code style={{ color: C.text }}>0 ≤ height[i] ≤ 10⁵</code></li>
            </ul>
          </Card>
        </>)}

        {/* ── INTUITION ── */}
        {tab === "Intuition" && (<>
          <Card title="🧠 Core Formula">
            <div style={{ background: C.heap, borderRadius: 10, padding: 18, textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 17, color: C.accent, fontWeight: 700, letterSpacing: 1 }}>
                water[i] = min(maxLeft, maxRight) − height[i]
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Water at any column is capped by the shorter surrounding wall, minus the column's own height</div>
            </div>
            <p style={{ color: C.muted, lineHeight: 1.75, margin: 0 }}>
              Imagine water trying to fill a valley. It rises until it hits the shorter wall on either side — any excess spills over. The formula captures exactly that.
            </p>
          </Card>

          <Card title="📈 Three Approaches">
            {[
              { label: "Brute Force", time: "O(n²)", space: "O(1)", color: "#ef4444", note: "For each i, scan left and right for maximums", x: true },
              { label: "Prefix Arrays", time: "O(n)", space: "O(n)", color: C.amber, note: "Precompute leftMax[] and rightMax[] in two passes", x: false },
              { label: "Two Pointers ✓", time: "O(n)", space: "O(1)", color: C.green, note: "Running maxes, single pass — optimal!", x: false },
            ].map(({ label, time, space, color, note, x }) => (
              <div key={label} style={{ display: "flex", gap: 14, alignItems: "center", background: C.heap, borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ flex: 2, color: C.text, fontSize: 13, fontWeight: 600 }}>{label}</div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: C.muted }}>TIME</div>
                  <div style={{ color, fontWeight: 700, fontSize: 13 }}>{time}</div>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: C.muted }}>SPACE</div>
                  <div style={{ color, fontWeight: 700, fontSize: 13 }}>{space}</div>
                </div>
                <div style={{ flex: 3, fontSize: 11, color: C.muted }}>{note}</div>
              </div>
            ))}
          </Card>

          <Card title="⚡ Two Pointer Deep Dive">
            {[
              { n: "1", t: "Start from both ends", d: "left=0, right=n−1. We maintain leftMax and rightMax as running maximums from each side — no arrays needed." },
              { n: "2", t: "Always process the shorter side", d: "If height[left] ≤ height[right]: the right side is at least as tall, so leftMax is the true ceiling. We can safely compute water at left right now." },
              { n: "3", t: "Update max or trap water", d: "If height[ptr] ≥ runningMax → update the max (this bar is a wall). Otherwise → water += runningMax − height[ptr]." },
              { n: "4", t: "Mirror for the right side", d: "When height[right] < height[left], rightMax is the ceiling. Process right and move right-- inward." },
              { n: "5", t: "Stop when left ≥ right", d: "Every column has been processed exactly once. Return total." },
            ].map(({ n, t, d }) => (
              <div key={n} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.accentSoft, border: `1px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.accent, flexShrink: 0, fontWeight: 700 }}>{n}</div>
                <div>
                  <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t}</div>
                  <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.7 }}>{d}</div>
                </div>
              </div>
            ))}
          </Card>

          <Card title="🔑 The Critical Insight — Why is the shorter side safe?">
            <div style={{ background: C.heap, borderRadius: 10, padding: 16 }}>
              <p style={{ color: C.muted, lineHeight: 1.8, margin: 0 }}>
                Suppose <span style={{ color: C.left }}>height[left] ≤ height[right]</span>. Water at <code style={{ color: C.accent }}>left</code> = <code>min(leftMax, rightMax) − h[left]</code>.
              </p>
              <p style={{ color: C.muted, lineHeight: 1.8, margin: "10px 0 0" }}>
                Since <span style={{ color: C.right }}>height[right]</span> is already ≥ height[left], and rightMax ≥ height[right], we know <strong style={{ color: C.text }}>rightMax ≥ leftMax is possible but doesn't matter</strong> — either way, <code>min(leftMax, rightMax) = leftMax</code>. We can compute exactly, right now. ✅
              </p>
            </div>
          </Card>
        </>)}

        {/* ── VISUALIZER ── */}
        {tab === "Visualizer" && (<>
          <Card title="Configure Heights">
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, color: C.muted }}>height array (comma-separated non-negative integers)</span>
              <input value={hStr} onChange={e => setHStr(e.target.value)}
                style={{ background: C.heap, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "9px 14px", fontSize: 14, fontFamily: "inherit" }} />
            </label>
          </Card>

          {/* Legend */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { color: C.left, label: "L = left pointer" },
              { color: C.right, label: "R = right pointer" },
              { color: "rgba(96,165,250,0.6)", label: "trapped water" },
              { color: C.amber, label: "new wall max" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: color }} />
                <span style={{ color: C.muted, fontSize: 12 }}>{label}</span>
              </div>
            ))}
          </div>

          {step && steps.length > 0 && (
            <Card title="Step-by-Step Simulation">
              {/* Step pills */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
                {steps.map((s, i) => (
                  <button key={i} onClick={() => setSi(i)} style={{
                    padding: "4px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                    background: i === si ? C.accent : C.heap, border: `1px solid ${i === si ? C.accent : C.border}`,
                    color: i === si ? "#060f1d" : C.muted, fontWeight: i === si ? 700 : 400,
                  }}>
                    {i === 0 ? "init" : i === steps.length - 1 ? "✓done" : `s${i}`}
                  </button>
                ))}
              </div>

              {/* Banner */}
              {(() => {
                const { bg, border } = bannerStyle(step.action);
                return (
                  <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>STEP {si + 1} / {steps.length}</div>
                    <div style={{ fontSize: 14, color: C.text }}>{step.desc}</div>
                  </div>
                );
              })()}

              {/* Chart */}
              <BarChart heights={heights} waterArr={step.waterArr} leftPtr={step.left} rightPtr={step.right} activeIdx={step.activeIdx} action={step.action} />

              {/* Stats */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                {[
                  { label: "leftMax", val: step.leftMax, color: C.left },
                  { label: "rightMax", val: step.rightMax, color: C.right },
                  { label: "water added", val: `+${step.waterAdded}`, color: C.accent },
                  { label: "total trapped", val: step.total, color: C.green },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ flex: 1, minWidth: 80, background: C.heap, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, textTransform: "uppercase" }}>{label}</div>
                    <div style={{ color, fontWeight: 700, fontSize: 20 }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Nav */}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={() => setSi(i => Math.max(0, i - 1))} disabled={si === 0}
                  style={{ flex: 1, padding: 9, background: C.heap, border: `1px solid ${C.border}`, color: si === 0 ? C.muted : C.text, borderRadius: 6, cursor: si === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13 }}>← Prev</button>
                <button onClick={() => setSi(i => Math.min(steps.length - 1, i + 1))} disabled={si === steps.length - 1}
                  style={{ flex: 1, padding: 9, background: si === steps.length - 1 ? C.heap : C.accent, border: `1px solid ${si === steps.length - 1 ? C.border : C.accent}`, color: si === steps.length - 1 ? C.muted : "#060f1d", borderRadius: 6, cursor: si === steps.length - 1 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>Next →</button>
              </div>
            </Card>
          )}

          <Card title="🧪 Quick Test">
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: C.muted }}>Try your own heights</span>
                <input value={liveStr} onChange={e => { setLiveStr(e.target.value); setLiveRan(false); }}
                  onKeyDown={e => e.key === "Enter" && runLive()}
                  placeholder="e.g. 0,1,0,2,1,0,1,3,2,1,2,1"
                  style={{ background: C.heap, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "9px 14px", fontSize: 14, fontFamily: "inherit" }} />
              </label>
              <button onClick={runLive} style={{ padding: "9px 20px", background: C.accentSoft, border: `1px solid ${C.accent}`, color: C.accent, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Run</button>
            </div>
            {liveRan && liveResult !== null && (
              <div style={{ marginTop: 12, background: C.greenSoft, border: `1px solid ${C.green}`, borderRadius: 6, padding: "10px 14px", fontSize: 14, color: C.green }}>
                Trapped water: <strong>{liveResult} units</strong>
              </div>
            )}
          </Card>
        </>)}

        {/* ── CODE ── */}
        {tab === "Code" && (<>
          <Card title="Java Solution — Two Pointers O(n) / O(1)">
            <pre style={{ background: C.heap, borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 2, margin: 0, overflowX: "auto", whiteSpace: "pre-wrap" }}>
              <span style={{ color: "#93c5fd" }}>class </span><span style={{ color: C.amber }}>Solution</span>{" {\n"}
              {"    "}<span style={{ color: "#93c5fd" }}>public int </span><span style={{ color: C.green }}>trap</span>(<span style={{ color: "#93c5fd" }}>int</span>{"[] height) {\n"}
              {"        "}<span style={{ color: C.muted }}>// squeeze inward from both ends{"\n"}</span>
              {"        "}<span style={{ color: "#93c5fd" }}>int </span><span style={{ color: C.text }}>left = 0, right = height.length - 1;{"\n"}</span>
              {"        "}<span style={{ color: "#93c5fd" }}>int </span><span style={{ color: C.text }}>leftMax = 0, rightMax = 0, water = 0;{"\n\n"}</span>
              {"        "}<span style={{ color: C.amber }}>while </span><span style={{ color: C.text }}>(left {"<"} right) {"{\n"}</span>
              {"            "}<span style={{ color: C.amber }}>if </span><span style={{ color: C.text }}>(height[left] {"<="} height[right]) {"{\n"}</span>
              {"                "}<span style={{ color: C.muted }}>// left is shorter — leftMax is the true ceiling{"\n"}</span>
              {"                "}<span style={{ color: C.amber }}>if </span><span style={{ color: C.text }}>(height[left] {">="} leftMax) leftMax = height[left];{"\n"}</span>
              {"                "}<span style={{ color: C.amber }}>else </span><span style={{ color: C.text }}>water += leftMax - height[left];{"\n"}</span>
              {"                "}<span style={{ color: C.text }}>left++;{"\n"}</span>
              {"            "}{" } "}<span style={{ color: C.amber }}>else </span>{"{\n"}
              {"                "}<span style={{ color: C.muted }}>// right is shorter — rightMax is the true ceiling{"\n"}</span>
              {"                "}<span style={{ color: C.amber }}>if </span><span style={{ color: C.text }}>(height[right] {">="} rightMax) rightMax = height[right];{"\n"}</span>
              {"                "}<span style={{ color: C.amber }}>else </span><span style={{ color: C.text }}>water += rightMax - height[right];{"\n"}</span>
              {"                "}<span style={{ color: C.text }}>right--;{"\n"}</span>
              {"            "}{" }\n"}
              {"        "}{" }\n"}
              {"        "}<span style={{ color: C.amber }}>return </span><span style={{ color: C.text }}>water;{"\n"}</span>
              {"    }\n}"}
            </pre>
          </Card>

          <Card title="Line-by-line Breakdown">
            {[
              { line: "left=0, right=n−1", exp: "Start from both ends. The pointers march inward until they meet — every index is visited exactly once." },
              { line: "leftMax, rightMax = 0", exp: "Running maximums from each side. These replace the O(n) prefix arrays from the naive approach." },
              { line: "height[left] <= height[right]", exp: "The left bar is the bottleneck. Since right is at least as tall, leftMax is the definitive ceiling for the left bar." },
              { line: "if height[left] >= leftMax", exp: "This bar is taller than everything to its left — it's a wall, not a valley. Update the running max, trap nothing." },
              { line: "else water += leftMax − height[left]", exp: "We're in a valley. Water fills up to leftMax. The column's own height displaces some water — take the difference." },
              { line: "left++", exp: "Move inward. We've fully accounted for this column." },
              { line: "else { ... right-- }", exp: "Exact mirror logic for the right side when height[right] < height[left]. rightMax is the ceiling." },
              { line: "return water", exp: "All columns processed. Total trapped water accumulated." },
            ].map(({ line, exp }) => (
              <div key={line} style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <code style={{ background: C.heap, padding: "3px 8px", borderRadius: 4, fontSize: 11, color: C.accent, whiteSpace: "nowrap", flexShrink: 0 }}>{line}</code>
                <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{exp}</span>
              </div>
            ))}
          </Card>

          <Card title="🧩 Pattern Recognition Cheatsheet">
            {[
              { icon: "📐", text: 'Write the formula first: water[i] = min(maxL, maxR) − h[i]. This is your anchor.' },
              { icon: "👈👉", text: "Two pointers squeezing inward: always process the shorter side — it's the bottleneck, so its max IS the ceiling." },
              { icon: "🪣", text: "Running max trick: leftMax and rightMax update as you walk — no need for prefix arrays (saves O(n) space)." },
              { icon: "🔗", text: "Same family as Container With Most Water (LC #11) — two pointers, move shorter side. Different goal: fill vs maximize." },
              { icon: "🆘", text: "Fallback: if you forget two pointers, build leftMax[] and rightMax[] prefix arrays (O(n) time+space) — still full marks." },
            ].map(({ icon, text }) => (
              <div key={icon} style={{ display: "flex", gap: 10, background: C.heap, borderRadius: 6, padding: "10px 12px", marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </Card>

          <Card title="⚡ Complexity">
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { l: "TIME", v: "O(n)", s: "each element visited once" },
                { l: "SPACE", v: "O(1)", s: "only 4 integer variables" },
              ].map(({ l, v, s }) => (
                <div key={l} style={{ flex: 1, background: C.heap, borderRadius: 8, padding: 14, textAlign: "center" }}>
                  <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>{l}</div>
                  <div style={{ color: C.green, fontWeight: 700, fontSize: 18 }}>{v}</div>
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
