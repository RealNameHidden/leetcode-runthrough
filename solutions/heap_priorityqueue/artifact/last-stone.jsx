import { useState, useEffect } from "react";

const C = {
  bg: "#12100e",
  card: "#1c1814",
  border: "#3d3028",
  accent: "#e8924a",
  accentSoft: "#e8924a22",
  amber: "#f5c842",
  amberSoft: "#f5c84218",
  red: "#e05c4a",
  redSoft: "#e05c4a20",
  green: "#6dbf7e",
  greenSoft: "#6dbf7e18",
  muted: "#8a7a6e",
  text: "#f0e8e0",
  heap: "#231e1a",
};

// Max-heap
class MaxHeap {
  constructor() { this.data = []; }
  push(v) { this.data.push(v); this._up(this.data.length - 1); }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) { this.data[0] = last; this._down(0); }
    return top;
  }
  peek() { return this.data[0]; }
  size() { return this.data.length; }
  _up(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.data[p] >= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]]; i = p;
    }
  }
  _down(i) {
    const n = this.data.length;
    while (true) {
      let big = i, l = 2*i+1, r = 2*i+2;
      if (l < n && this.data[l] > this.data[big]) big = l;
      if (r < n && this.data[r] > this.data[big]) big = r;
      if (big === i) break;
      [this.data[i], this.data[big]] = [this.data[big], this.data[i]]; i = big;
    }
  }
}

function simulate(stones) {
  const steps = [];
  const h = new MaxHeap();
  for (const s of stones) h.push(s);
  steps.push({ heap: [...h.data], action: "init", desc: `Build max-heap from [${stones.join(", ")}]`, x: null, y: null, result: null, smash: false });

  while (h.size() > 0) {
    if (h.size() === 1) {
      steps.push({ heap: [...h.data], action: "done", desc: `Only 1 stone left → return ${h.peek()}`, x: h.peek(), y: null, result: h.peek(), smash: false });
      break;
    }
    const x = h.pop();
    const y = h.pop();
    if (x === y) {
      steps.push({ heap: [...h.data], action: "equal", desc: `Poll ${x} and ${y} — equal, both destroyed`, x, y, result: null, smash: true });
    } else {
      const diff = x - y;
      h.push(diff);
      steps.push({ heap: [...h.data], action: "diff", desc: `Poll ${x} and ${y} — diff = ${diff}, push back`, x, y, result: diff, smash: true });
    }
    if (h.size() === 0) {
      steps.push({ heap: [], action: "done", desc: `Heap empty → return 0`, x: null, y: null, result: 0, smash: false });
      break;
    }
  }
  return steps;
}

function HeapTree({ heap, highlightIdxs = [] }) {
  if (!heap || heap.length === 0) return <div style={{ color: C.muted, fontSize: 13, padding: 16, textAlign: "center" }}>— empty —</div>;
  const levels = [];
  let i = 0, lv = 0;
  while (i < heap.length) {
    const cnt = Math.min(Math.pow(2, lv), heap.length - i);
    levels.push(heap.slice(i, i + cnt));
    i += cnt; lv++;
  }
  let idx = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "12px 0" }}>
      {levels.map((row, li) => (
        <div key={li} style={{ display: "flex", gap: Math.max(10, 52 - li * 16), justifyContent: "center" }}>
          {row.map((val) => {
            const isRoot = idx === 0;
            const isHL = highlightIdxs.includes(idx);
            idx++;
            return (
              <div key={idx} style={{
                width: 40, height: 40, borderRadius: "50%",
                background: isRoot ? C.accent : isHL ? C.amberSoft : C.heap,
                border: `2px solid ${isRoot ? C.accent : isHL ? C.amber : C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: isRoot ? 700 : 400,
                color: isRoot ? "#1a1008" : C.text,
                fontFamily: "monospace",
                boxShadow: isRoot ? `0 0 16px ${C.accent}55` : "none",
                transition: "all 0.3s",
              }}>{val}</div>
            );
          })}
        </div>
      ))}
      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>↑ root = heaviest stone</div>
    </div>
  );
}

function StoneChip({ val, popped }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 44, height: 44, borderRadius: 8,
      background: popped ? C.redSoft : C.amberSoft,
      border: `2px solid ${popped ? C.red : C.amber}`,
      color: popped ? C.red : C.amber,
      fontSize: 15, fontWeight: 700, fontFamily: "monospace",
      boxShadow: popped ? `0 0 10px ${C.red}44` : "none",
    }}>{val}</div>
  );
}

const TABS = ["Problem", "Intuition", "Visualizer", "Code"];

function Card({ title, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 14, letterSpacing: "0.12em", textTransform: "uppercase" }}>{title}</div>
      {children}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [stonesStr, setStonesStr] = useState("2,7,4,1,8,1");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);
  const [liveStones, setLiveStones] = useState("");
  const [liveResult, setLiveResult] = useState(null);
  const [liveRan, setLiveRan] = useState(false);

  useEffect(() => {
    try {
      const arr = stonesStr.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
      if (arr.length > 0) { setSteps(simulate(arr)); setSi(0); }
    } catch {}
  }, [stonesStr]);

  const step = steps[si];

  const runLive = () => {
    try {
      const arr = liveStones.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
      if (arr.length === 0) return;
      const h = new MaxHeap();
      for (const s of arr) h.push(s);
      while (h.size() > 1) {
        const x = h.pop(), y = h.pop();
        if (x !== y) h.push(x - y);
      }
      setLiveResult(h.size() === 0 ? 0 : h.peek());
      setLiveRan(true);
    } catch {}
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Courier New', 'Fira Code', monospace" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 14, background: C.card }}>
        <span style={{ fontSize: 20 }}>🪨</span>
        <span style={{ fontSize: 17, fontWeight: 700, fontFamily: "Georgia, serif", letterSpacing: "-0.3px" }}>Last Stone Weight</span>
        <div style={{ padding: "2px 10px", borderRadius: 20, background: C.greenSoft, border: `1px solid ${C.green}`, fontSize: 11, color: C.green, marginLeft: 4 }}>Easy · Max-Heap</div>
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

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* PROBLEM */}
        {tab === "Problem" && (<>
          <Card title="Problem Statement">
            <p style={{ color: C.muted, lineHeight: 1.75, margin: 0 }}>
              You are given an array of integers <span style={{ color: C.amber }}>stones</span> where <code style={{ color: C.accent }}>stones[i]</code> is the weight of the ith stone. On each turn, choose the <strong style={{ color: C.text }}>two heaviest stones</strong> and smash them together.
            </p>
            <div style={{ margin: "16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { cond: "x == y", res: "Both stones destroyed" },
                { cond: "x != y", res: "Smaller destroyed, larger becomes y - x" },
              ].map(({ cond, res }) => (
                <div key={cond} style={{ display: "flex", gap: 12, alignItems: "center", background: C.heap, borderRadius: 8, padding: "10px 14px" }}>
                  <code style={{ color: C.amber, fontSize: 13, minWidth: 80 }}>{cond}</code>
                  <span style={{ color: C.muted, fontSize: 13 }}>→ {res}</span>
                </div>
              ))}
            </div>
            <p style={{ color: C.muted, lineHeight: 1.75, margin: 0 }}>Return the weight of the last remaining stone, or <code style={{ color: C.accent }}>0</code> if none remain.</p>
          </Card>

          <Card title="Example  →  stones = [2, 7, 4, 1, 8, 1]">
            <pre style={{ background: C.heap, borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 2, margin: 0, overflowX: "auto" }}>
              <span style={{ color: C.muted }}>Step 1: smash </span><span style={{ color: C.amber }}>8</span><span style={{ color: C.muted }}> and </span><span style={{ color: C.amber }}>7</span><span style={{ color: C.muted }}> → diff=1  →  [2,4,1,1,1]{"\n"}</span>
              <span style={{ color: C.muted }}>Step 2: smash </span><span style={{ color: C.amber }}>4</span><span style={{ color: C.muted }}> and </span><span style={{ color: C.amber }}>2</span><span style={{ color: C.muted }}> → diff=2  →  [2,1,1,1]{"\n"}</span>
              <span style={{ color: C.muted }}>Step 3: smash </span><span style={{ color: C.amber }}>2</span><span style={{ color: C.muted }}> and </span><span style={{ color: C.amber }}>1</span><span style={{ color: C.muted }}> → diff=1  →  [1,1,1]{"\n"}</span>
              <span style={{ color: C.muted }}>Step 4: smash </span><span style={{ color: C.amber }}>1</span><span style={{ color: C.muted }}> and </span><span style={{ color: C.amber }}>1</span><span style={{ color: C.muted }}> → equal  →  [1]{"\n"}</span>
              <span style={{ color: C.muted }}>Result: </span><span style={{ color: C.green, fontWeight: 700 }}>1</span>
            </pre>
          </Card>

          <Card title="Constraints">
            <ul style={{ color: C.muted, lineHeight: 2.1, paddingLeft: 20, margin: 0 }}>
              <li><code style={{ color: C.text }}>1 ≤ stones.length ≤ 30</code></li>
              <li><code style={{ color: C.text }}>1 ≤ stones[i] ≤ 1000</code></li>
            </ul>
          </Card>
        </>)}

        {/* INTUITION */}
        {tab === "Intuition" && (<>
          <Card title="🔨 Why Max-Heap?">
            <p style={{ color: C.muted, lineHeight: 1.75, margin: 0 }}>
              Every step requires the <strong style={{ color: C.text }}>two heaviest</strong> stones. A max-heap always gives you the largest in O(1) via <code style={{ color: C.accent }}>peek()</code> and removes it in O(log n) via <code style={{ color: C.accent }}>poll()</code>.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1, background: C.heap, borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>BRUTE FORCE</div>
                <div style={{ color: C.red, fontWeight: 700 }}>O(n² log n)</div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>Sort each round</div>
              </div>
              <div style={{ flex: 1, background: C.heap, borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>MAX-HEAP</div>
                <div style={{ color: C.green, fontWeight: 700 }}>O(n log n)</div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>poll twice per round</div>
              </div>
            </div>
          </Card>

          <Card title="📐 Algorithm Steps">
            {[
              { n: "1", t: "Build a max-heap", d: "Insert all stones. The heaviest is always at the root." },
              { n: "2", t: "Poll the two heaviest", d: "x = poll(), y = poll(). Since it's a max-heap, x ≥ y always." },
              { n: "3", t: "If x == y", d: "Both destroyed. Don't push anything back." },
              { n: "4", t: "If x != y", d: "Push (x - y) back. The lighter one is destroyed, heavier is reduced." },
              { n: "5", t: "Repeat until ≤ 1 stone", d: "If 1 stone remains, return it. If heap is empty, return 0." },
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

          <Card title="🧠 Your Code's Logic">
            <p style={{ color: C.muted, lineHeight: 1.75, margin: "0 0 12px" }}>Your solution uses <code style={{ color: C.accent }}>(a,b) → b-a</code> as the comparator — this reverses the natural ordering so the largest element is at the root (max-heap).</p>
            <div style={{ background: C.heap, borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { k: "heap.isEmpty() check", v: "Loop exits only when 0 stones remain" },
                { k: "size() == 1 early return", v: "Returns last stone immediately, avoids popping twice" },
                { k: "y < x branch", v: "Since max-heap guarantees x ≥ y, this is always true when x ≠ y" },
              ].map(({ k, v }) => (
                <div key={k} style={{ display: "flex", gap: 10 }}>
                  <code style={{ color: C.amber, fontSize: 12, flexShrink: 0 }}>{k}</code>
                  <span style={{ color: C.muted, fontSize: 12 }}>— {v}</span>
                </div>
              ))}
            </div>
          </Card>
        </>)}

        {/* VISUALIZER */}
        {tab === "Visualizer" && (<>
          <Card title="Configure">
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Stones (comma-separated, positive integers)</span>
              <input value={stonesStr} onChange={e => setStonesStr(e.target.value)}
                style={{ background: C.heap, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "9px 14px", fontSize: 14, fontFamily: "inherit" }} />
            </label>
          </Card>

          {steps.length > 0 && step && (
            <Card title="Step-by-Step Simulation">
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {steps.map((s, i) => (
                  <button key={i} onClick={() => setSi(i)} style={{
                    padding: "4px 11px", borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                    background: i === si ? C.accent : C.heap,
                    border: `1px solid ${i === si ? C.accent : C.border}`,
                    color: i === si ? "#1a1008" : C.muted,
                    fontWeight: i === si ? 700 : 400,
                  }}>
                    {i === 0 ? "init" : `s${i}`}
                  </button>
                ))}
              </div>

              {/* Action banner */}
              <div style={{
                background: step.action === "equal" ? C.redSoft : step.action === "diff" ? C.amberSoft : step.action === "done" ? C.greenSoft : C.accentSoft,
                border: `1px solid ${step.action === "equal" ? C.red : step.action === "diff" ? C.amber : step.action === "done" ? C.green : C.accent}`,
                borderRadius: 8, padding: "10px 14px", marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>STEP {si + 1} / {steps.length}</div>
                <div style={{ fontSize: 14, color: C.text }}>{step.desc}</div>
              </div>

              {/* Stones being smashed */}
              {step.smash && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: C.muted }}>Smashing:</span>
                  <StoneChip val={step.x} popped />
                  <span style={{ fontSize: 18, color: C.muted }}>💥</span>
                  <StoneChip val={step.y} popped />
                  {step.result !== null && step.action === "diff" && (<>
                    <span style={{ fontSize: 14, color: C.muted }}>→</span>
                    <StoneChip val={step.result} popped={false} />
                    <span style={{ fontSize: 12, color: C.muted }}>pushed back</span>
                  </>)}
                  {step.action === "equal" && (
                    <span style={{ fontSize: 12, color: C.red }}>both destroyed</span>
                  )}
                </div>
              )}

              {/* Heap tree */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>MAX-HEAP STATE</div>
                  <HeapTree heap={step.heap} />
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
                    [{step.heap.join(", ")}]
                  </div>
                </div>
                {step.action === "done" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 120 }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>RESULT</div>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.greenSoft, border: `2px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: C.green, boxShadow: `0 0 20px ${C.green}44` }}>
                      {step.result}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>last stone</div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button onClick={() => setSi(i => Math.max(0, i - 1))} disabled={si === 0}
                  style={{ flex: 1, padding: 9, background: C.heap, border: `1px solid ${C.border}`, color: si === 0 ? C.muted : C.text, borderRadius: 6, cursor: si === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13 }}>← Prev</button>
                <button onClick={() => setSi(i => Math.min(steps.length - 1, i + 1))} disabled={si === steps.length - 1}
                  style={{ flex: 1, padding: 9, background: si === steps.length - 1 ? C.heap : C.accent, border: `1px solid ${si === steps.length - 1 ? C.border : C.accent}`, color: si === steps.length - 1 ? C.muted : "#1a1008", borderRadius: 6, cursor: si === steps.length - 1 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>Next →</button>
              </div>
            </Card>
          )}

          <Card title="🧪 Quick Test">
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: C.muted }}>Try your own stones</span>
                <input value={liveStones} onChange={e => { setLiveStones(e.target.value); setLiveRan(false); }}
                  onKeyDown={e => e.key === "Enter" && runLive()}
                  placeholder="e.g. 3,5,1,9,2"
                  style={{ background: C.heap, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "9px 14px", fontSize: 14, fontFamily: "inherit" }} />
              </label>
              <button onClick={runLive} style={{ padding: "9px 20px", background: C.accentSoft, border: `1px solid ${C.accent}`, color: C.accent, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Run</button>
            </div>
            {liveRan && (
              <div style={{ marginTop: 12, background: C.greenSoft, border: `1px solid ${C.green}`, borderRadius: 6, padding: "10px 14px", fontSize: 14, color: C.green }}>
                Result: <strong>{liveResult}</strong>
              </div>
            )}
          </Card>
        </>)}

        {/* CODE */}
        {tab === "Code" && (<>
          <Card title="Your Java Solution">
            <pre style={{ background: C.heap, borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 1.9, margin: 0, overflowX: "auto", whiteSpace: "pre-wrap" }}>
              <span style={{ color: C.blue }}>{"class "}</span><span style={{ color: C.accent }}>LastStone</span>{" {\n"}
              {"    "}<span style={{ color: C.muted }}>{"// (a,b)->b-a reverses order → max at root\n"}</span>
              {"    "}<span style={{ color: C.amber }}>PriorityQueue</span><span style={{ color: C.text }}>&lt;Integer&gt; heap = </span><span style={{ color: C.amber }}>new </span><span style={{ color: C.amber }}>PriorityQueue</span><span style={{ color: C.text }}>&lt;&gt;((a,b) -&gt; b-a);{"\n\n"}</span>
              {"    "}<span style={{ color: C.muted }}>{"// 1. load all stones into max-heap\n"}</span>
              {"    "}<span style={{ color: C.amber }}>for</span><span style={{ color: C.text }}>(int stone : stones) heap.offer(stone);{"\n\n"}</span>
              {"    "}<span style={{ color: C.amber }}>while</span><span style={{ color: C.text }}>(!heap.isEmpty()) {"{"}{"\n"}</span>
              {"        "}<span style={{ color: C.muted }}>{"// 2. if 1 stone left, return it\n"}</span>
              {"        "}<span style={{ color: C.amber }}>if</span><span style={{ color: C.text }}>(heap.size() == 1) </span><span style={{ color: C.amber }}>return </span><span style={{ color: C.text }}>heap.poll();{"\n\n"}</span>
              {"        "}<span style={{ color: C.muted }}>{"// 3. poll two heaviest (x ≥ y guaranteed)\n"}</span>
              {"        "}<span style={{ color: C.amber }}>int </span><span style={{ color: C.text }}>x = heap.poll(), y = heap.poll();{"\n\n"}</span>
              {"        "}<span style={{ color: C.amber }}>if</span><span style={{ color: C.text }}>(x == y) </span><span style={{ color: C.amber }}>continue</span><span style={{ color: C.text }}>; </span><span style={{ color: C.muted }}>// both destroyed{"\n"}</span>
              {"        "}<span style={{ color: C.amber }}>else </span><span style={{ color: C.text }}>heap.offer(x - y); </span><span style={{ color: C.muted }}>// push difference back{"\n"}</span>
              {"    }"}{"\n"}
              {"    "}<span style={{ color: C.amber }}>return </span><span style={{ color: C.text }}>0; </span><span style={{ color: C.muted }}>// heap emptied{"\n"}</span>
              {"}"}
            </pre>
          </Card>

          <Card title="Line-by-line Breakdown">
            {[
              { line: "(a,b) -> b-a", exp: "Comparator that reverses natural order. When b > a, b-a > 0, so b is placed first → largest element at root." },
              { line: "heap.offer(stone)", exp: "Inserts each stone into the max-heap in O(log n). All stones loaded before simulation begins." },
              { line: "if (size == 1) return poll()", exp: "Only 1 stone left — it's the answer. Early return avoids trying to poll a second stone from a 1-element heap." },
              { line: "x = poll(), y = poll()", exp: "Max-heap guarantees x ≥ y. We don't need Math.abs() or swapping — x is always the heavier one." },
              { line: "if (x == y) continue", exp: "Both destroyed. Nothing pushed back. Loop continues with smaller heap." },
              { line: "heap.offer(x - y)", exp: "Difference is the surviving reduced stone. Since x ≥ y, x-y ≥ 0 always — no need for else-if check." },
              { line: "return 0", exp: "Heap is empty — all stones cancelled each other out perfectly." },
            ].map(({ line, exp }) => (
              <div key={line} style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <code style={{ background: C.heap, padding: "3px 8px", borderRadius: 4, fontSize: 11, color: C.accent, whiteSpace: "nowrap", flexShrink: 0 }}>{line}</code>
                <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{exp}</span>
              </div>
            ))}
          </Card>

          <Card title="💡 Tiny Simplification">
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: "0 0 12px" }}>
              Your <code style={{ color: C.accent }}>else if (y &lt; x)</code> branch is always true when <code style={{ color: C.accent }}>x != y</code> since the max-heap guarantees x ≥ y. You can simplify to just <code style={{ color: C.accent }}>else</code>:
            </p>
            <pre style={{ background: C.heap, borderRadius: 8, padding: 14, fontSize: 12, lineHeight: 1.8, margin: 0 }}>
              <span style={{ color: C.amber }}>if</span><span style={{ color: C.text }}>(x == y) </span><span style={{ color: C.amber }}>continue</span><span style={{ color: C.text }}>;{"\n"}</span>
              <span style={{ color: C.amber }}>else </span><span style={{ color: C.text }}>heap.offer(x - y); </span><span style={{ color: C.muted }}>// x ≥ y always</span>
            </pre>
          </Card>

          <Card title="⚡ Complexity">
            <div style={{ display: "flex", gap: 12 }}>
              {[{ l: "TIME", v: "O(n log n)", s: "n rounds, each O(log n) poll/offer" }, { l: "SPACE", v: "O(n)", s: "heap stores all n stones initially" }].map(({ l, v, s }) => (
                <div key={l} style={{ flex: 1, background: C.heap, borderRadius: 8, padding: 12, textAlign: "center" }}>
                  <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>{l}</div>
                  <div style={{ color: C.green, fontWeight: 700, fontSize: 15 }}>{v}</div>
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