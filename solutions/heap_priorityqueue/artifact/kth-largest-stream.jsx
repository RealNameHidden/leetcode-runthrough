import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0d1117",
  card: "#161b22",
  border: "#30363d",
  accent: "#f78166",
  accentSoft: "#ff7b7220",
  green: "#3fb950",
  greenSoft: "#3fb95020",
  blue: "#79c0ff",
  blueSoft: "#79c0ff18",
  muted: "#8b949e",
  text: "#e6edf3",
  heap: "#21262d",
};

// Min-heap implementation
class MinHeap {
  constructor() { this.data = []; }
  push(val) {
    this.data.push(val);
    this._bubbleUp(this.data.length - 1);
  }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) { this.data[0] = last; this._sinkDown(0); }
    return top;
  }
  peek() { return this.data[0]; }
  size() { return this.data.length; }
  _bubbleUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.data[p] <= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  _sinkDown(i) {
    const n = this.data.length;
    while (true) {
      let smallest = i, l = 2*i+1, r = 2*i+2;
      if (l < n && this.data[l] < this.data[smallest]) smallest = l;
      if (r < n && this.data[r] < this.data[smallest]) smallest = r;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}

function simulate(k, nums, adds) {
  const h = new MinHeap();
  const steps = [];

  // Init
  for (const n of nums) h.push(n);
  while (h.size() > k) h.pop();
  steps.push({ phase: "init", heap: [...h.data], result: null, val: null, desc: `Initialize with [${nums.join(", ")}], trim to k=${k} largest` });

  for (const val of adds) {
    h.push(val);
    if (h.size() > k) h.pop();
    steps.push({ phase: "add", heap: [...h.data], result: h.peek(), val, desc: `add(${val}) → kth largest = ${h.peek()}` });
  }
  return steps;
}

// Draw heap as tree
function HeapTree({ heap, highlight }) {
  if (!heap || heap.length === 0) return <div style={{ color: COLORS.muted, fontSize: 13, padding: "12px 0" }}>empty heap</div>;

  const levels = [];
  let i = 0, level = 0;
  while (i < heap.length) {
    const count = Math.min(Math.pow(2, level), heap.length - i);
    levels.push(heap.slice(i, i + count));
    i += count;
    level++;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "8px 0" }}>
      {levels.map((row, li) => (
        <div key={li} style={{ display: "flex", gap: Math.max(8, 48 - li * 14), justifyContent: "center" }}>
          {row.map((val, vi) => {
            const idx = Math.pow(2, li) - 1 + vi;
            const isRoot = idx === 0;
            const isHighlight = val === highlight && li === levels.length - 1;
            return (
              <div key={vi} style={{
                width: 36, height: 36, borderRadius: "50%",
                background: isRoot ? COLORS.accent : isHighlight ? COLORS.accentSoft : COLORS.heap,
                border: `2px solid ${isRoot ? COLORS.accent : COLORS.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: isRoot ? 700 : 400,
                color: isRoot ? "#fff" : COLORS.text,
                fontFamily: "monospace",
                transition: "all 0.3s ease",
                boxShadow: isRoot ? `0 0 12px ${COLORS.accent}55` : "none"
              }}>
                {val}
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
        ↑ root = kth largest
      </div>
    </div>
  );
}

const CODE = `class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        self.k = k
        self.heap = nums
        heapq.heapify(self.heap)
        # Trim to only keep top-k largest
        while len(self.heap) > k:
            heapq.heappop(self.heap)

    def add(self, val: int) -> int:
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        # Min-heap root = kth largest
        return self.heap[0]`;

const SECTIONS = ["Problem", "Intuition", "Visualizer", "Code"];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [k, setK] = useState(3);
  const [numsStr, setNumsStr] = useState("1,2,3,3");
  const [addsStr, setAddsStr] = useState("3,5,6,7,8");
  const [stepIdx, setStepIdx] = useState(0);
  const [steps, setSteps] = useState([]);
  const [addInput, setAddInput] = useState("");
  const [liveHeap, setLiveHeap] = useState(null);
  const [liveK, setLiveK] = useState(3);
  const [liveResult, setLiveResult] = useState(null);
  const [liveStream, setLiveStream] = useState([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    try {
      const nums = numsStr.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const adds = addsStr.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const s = simulate(k, nums, adds);
      setSteps(s);
      setStepIdx(0);
    } catch { }
  }, [k, numsStr, addsStr]);

  // Live playground
  const initLive = () => {
    const h = new MinHeap();
    const nums = numsStr.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    for (const n of nums) h.push(n);
    while (h.size() > liveK) h.pop();
    setLiveHeap(h);
    setLiveStream(nums);
    setLiveResult(null);
    setFeedback("Heap initialized! Now use add() below.");
  };

  const liveAdd = () => {
    const val = parseInt(addInput);
    if (isNaN(val)) return;
    if (!liveHeap) { setFeedback("Initialize first!"); return; }
    liveHeap.push(val);
    if (liveHeap.size() > liveK) liveHeap.pop();
    setLiveHeap(Object.assign(Object.create(Object.getPrototypeOf(liveHeap)), liveHeap));
    setLiveResult(liveHeap.peek());
    setLiveStream(prev => [...prev, val]);
    setFeedback(`add(${val}) → kth largest = ${liveHeap.peek()}`);
    setAddInput("");
  };

  const step = steps[stepIdx];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.5px" }}>
            Kth Largest in a Stream
          </span>
        </div>
        <div style={{ marginLeft: 8, padding: "2px 10px", borderRadius: 20, background: COLORS.greenSoft, border: `1px solid ${COLORS.green}`, fontSize: 11, color: COLORS.green }}>
          Easy · Heap
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, padding: "0 24px" }}>
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setTab(s)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "12px 16px", fontSize: 13, color: tab === s ? COLORS.accent : COLORS.muted,
            borderBottom: tab === s ? `2px solid ${COLORS.accent}` : "2px solid transparent",
            transition: "all 0.2s", fontFamily: "inherit"
          }}>{s}</button>
        ))}
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 24px" }}>

        {/* PROBLEM TAB */}
        {tab === "Problem" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card title="Problem Statement">
              <p style={{ color: COLORS.muted, lineHeight: 1.7, margin: 0 }}>
                Design a class to find the <span style={{ color: COLORS.blue }}>kth largest integer</span> in a stream of values, including duplicates.
              </p>
              <p style={{ color: COLORS.muted, lineHeight: 1.7, margin: "12px 0 0" }}>
                Implement two methods:
              </p>
              <ul style={{ color: COLORS.muted, lineHeight: 1.9, paddingLeft: 20 }}>
                <li><code style={{ color: COLORS.accent }}>__init__(k, nums)</code> — Initialize with k and a starting stream</li>
                <li><code style={{ color: COLORS.accent }}>add(val)</code> — Add val, return kth largest</li>
              </ul>
            </Card>

            <Card title="Example">
              <pre style={{ background: COLORS.heap, borderRadius: 8, padding: 16, fontSize: 12, overflowX: "auto", margin: 0, lineHeight: 1.8 }}>
                <span style={{ color: COLORS.muted }}># k=3, nums=[1,2,3,3]</span>{"\n"}
                <span style={{ color: COLORS.muted }}># Stream so far: [1,2,3,3]</span>{"\n\n"}
                <span style={{ color: COLORS.blue }}>add</span>(<span style={{ color: COLORS.accent }}>3</span>)  <span style={{ color: COLORS.muted }}># [1,2,3,3,3] → 3rd largest = <span style={{ color: COLORS.green }}>3</span></span>{"\n"}
                <span style={{ color: COLORS.blue }}>add</span>(<span style={{ color: COLORS.accent }}>5</span>)  <span style={{ color: COLORS.muted }}># [1,2,3,3,3,5] → 3rd largest = <span style={{ color: COLORS.green }}>3</span></span>{"\n"}
                <span style={{ color: COLORS.blue }}>add</span>(<span style={{ color: COLORS.accent }}>6</span>)  <span style={{ color: COLORS.muted }}># [...,6] → 3rd largest = <span style={{ color: COLORS.green }}>3</span></span>{"\n"}
                <span style={{ color: COLORS.blue }}>add</span>(<span style={{ color: COLORS.accent }}>7</span>)  <span style={{ color: COLORS.muted }}># [...,7] → 3rd largest = <span style={{ color: COLORS.green }}>5</span></span>{"\n"}
                <span style={{ color: COLORS.blue }}>add</span>(<span style={{ color: COLORS.accent }}>8</span>)  <span style={{ color: COLORS.muted }}># [...,8] → 3rd largest = <span style={{ color: COLORS.green }}>6</span></span>
              </pre>
            </Card>

            <Card title="Constraints">
              <ul style={{ color: COLORS.muted, lineHeight: 2, paddingLeft: 20, margin: 0 }}>
                <li><code style={{ color: COLORS.text }}>1 ≤ k ≤ 1000</code></li>
                <li><code style={{ color: COLORS.text }}>0 ≤ nums.length ≤ 1000</code></li>
                <li><code style={{ color: COLORS.text }}>-1000 ≤ nums[i], val ≤ 1000</code></li>
                <li>At least k integers will always exist when add() is called</li>
              </ul>
            </Card>
          </div>
        )}

        {/* INTUITION TAB */}
        {tab === "Intuition" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card title="🤔 Brute Force First">
              <p style={{ color: COLORS.muted, lineHeight: 1.7 }}>
                Naive approach: store every number. On each <code style={{ color: COLORS.accent }}>add()</code>, sort all numbers and return the kth from the end.
              </p>
              <div style={{ background: COLORS.heap, borderRadius: 8, padding: 12, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: COLORS.muted, fontSize: 13 }}>Time per add()</span>
                <span style={{ color: COLORS.accent, fontWeight: 700 }}>O(n log n) ❌</span>
              </div>
            </Card>

            <Card title="💡 Key Insight">
              <p style={{ color: COLORS.muted, lineHeight: 1.7 }}>
                We don't need <em>all</em> numbers — we only need the <span style={{ color: COLORS.blue }}>top k largest</span>.
              </p>
              <p style={{ color: COLORS.muted, lineHeight: 1.7 }}>
                The <strong style={{ color: COLORS.text }}>kth largest</strong> is just the <strong style={{ color: COLORS.accent }}>smallest among the top-k</strong>.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {[8,7,6,5,4,3,2,1].map((n, i) => (
                  <div key={n} style={{
                    padding: "6px 12px", borderRadius: 6, fontSize: 13,
                    background: i < 3 ? COLORS.accentSoft : COLORS.heap,
                    border: `1px solid ${i < 3 ? COLORS.accent : COLORS.border}`,
                    color: i < 3 ? COLORS.accent : COLORS.muted,
                    position: "relative"
                  }}>
                    {n}
                    {i === 2 && <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: COLORS.accent, whiteSpace: "nowrap" }}>3rd largest ↓</div>}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="🏗️ The Min-Heap Solution">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { n: "1", title: "Maintain a Min-Heap of exactly k elements", desc: "The heap stores the top-k largest numbers seen so far." },
                  { n: "2", title: "When adding a new value", desc: "Push it into the heap. If heap size exceeds k, pop the minimum (discard small values)." },
                  { n: "3", title: "Answer is always heap[0]", desc: "The root of a min-heap is the smallest element in the heap = the kth largest overall." },
                ].map(({ n, title, desc }) => (
                  <div key={n} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.accentSoft, border: `1px solid ${COLORS.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: COLORS.accent, flexShrink: 0, fontWeight: 700 }}>{n}</div>
                    <div>
                      <div style={{ color: COLORS.text, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{title}</div>
                      <div style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.6 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="⚡ Complexity">
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, background: COLORS.heap, borderRadius: 8, padding: 12, textAlign: "center" }}>
                  <div style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6 }}>TIME (per add)</div>
                  <div style={{ color: COLORS.green, fontWeight: 700, fontSize: 16 }}>O(log k)</div>
                </div>
                <div style={{ flex: 1, background: COLORS.heap, borderRadius: 8, padding: 12, textAlign: "center" }}>
                  <div style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6 }}>SPACE</div>
                  <div style={{ color: COLORS.green, fontWeight: 700, fontSize: 16 }}>O(k)</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* VISUALIZER TAB */}
        {tab === "Visualizer" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card title="Configure">
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <span style={{ fontSize: 12, color: COLORS.muted }}>k (rank)</span>
                  <input type="number" value={k} min={1} max={10} onChange={e => setK(parseInt(e.target.value) || 1)}
                    style={{ background: COLORS.heap, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 6, padding: "8px 12px", fontSize: 14, fontFamily: "inherit", width: "100%" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: 2 }}>
                  <span style={{ fontSize: 12, color: COLORS.muted }}>Initial nums (comma-separated)</span>
                  <input value={numsStr} onChange={e => setNumsStr(e.target.value)}
                    style={{ background: COLORS.heap, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 6, padding: "8px 12px", fontSize: 14, fontFamily: "inherit", width: "100%" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: 2 }}>
                  <span style={{ fontSize: 12, color: COLORS.muted }}>add() calls (comma-separated)</span>
                  <input value={addsStr} onChange={e => setAddsStr(e.target.value)}
                    style={{ background: COLORS.heap, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 6, padding: "8px 12px", fontSize: 14, fontFamily: "inherit", width: "100%" }} />
                </label>
              </div>
            </Card>

            {steps.length > 0 && step && (
              <Card title="Step-by-Step">
                {/* Progress */}
                <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                  {steps.map((s, i) => (
                    <button key={i} onClick={() => setStepIdx(i)} style={{
                      padding: "4px 10px", borderRadius: 4, fontSize: 12,
                      background: i === stepIdx ? COLORS.accent : COLORS.heap,
                      border: `1px solid ${i === stepIdx ? COLORS.accent : COLORS.border}`,
                      color: i === stepIdx ? "#fff" : COLORS.muted, cursor: "pointer", fontFamily: "inherit"
                    }}>
                      {i === 0 ? "init" : `add(${s.val})`}
                    </button>
                  ))}
                </div>

                <div style={{ background: COLORS.heap, borderRadius: 8, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: COLORS.blue, marginBottom: 4 }}>
                    Step {stepIdx + 1} of {steps.length}
                  </div>
                  <div style={{ fontSize: 14, color: COLORS.text }}>{step.desc}</div>
                </div>

                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>MIN-HEAP (top-{k})</div>
                    <HeapTree heap={step.heap} />
                    <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 8 }}>
                      raw: [{step.heap.join(", ")}]
                    </div>
                  </div>
                  {step.result !== null && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 120 }}>
                      <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>RESULT</div>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: COLORS.greenSoft, border: `2px solid ${COLORS.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: COLORS.green, boxShadow: `0 0 20px ${COLORS.green}33` }}>
                        {step.result}
                      </div>
                      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 8 }}>kth largest</div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button onClick={() => setStepIdx(i => Math.max(0, i - 1))}
                    disabled={stepIdx === 0}
                    style={{ flex: 1, padding: "8px", background: COLORS.heap, border: `1px solid ${COLORS.border}`, color: stepIdx === 0 ? COLORS.muted : COLORS.text, borderRadius: 6, cursor: stepIdx === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13 }}>
                    ← Prev
                  </button>
                  <button onClick={() => setStepIdx(i => Math.min(steps.length - 1, i + 1))}
                    disabled={stepIdx === steps.length - 1}
                    style={{ flex: 1, padding: "8px", background: stepIdx === steps.length - 1 ? COLORS.heap : COLORS.accent, border: `1px solid ${stepIdx === steps.length - 1 ? COLORS.border : COLORS.accent}`, color: stepIdx === steps.length - 1 ? COLORS.muted : "#fff", borderRadius: 6, cursor: stepIdx === steps.length - 1 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13 }}>
                    Next →
                  </button>
                </div>
              </Card>
            )}

            {/* Live Playground */}
            <Card title="🧪 Live Playground">
              <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, color: COLORS.muted }}>k</span>
                  <input type="number" value={liveK} min={1} onChange={e => setLiveK(parseInt(e.target.value) || 1)}
                    style={{ width: 64, background: COLORS.heap, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 6, padding: "8px 12px", fontSize: 14, fontFamily: "inherit" }} />
                </label>
                <button onClick={initLive} style={{ padding: "8px 16px", background: COLORS.blueSoft, border: `1px solid ${COLORS.blue}`, color: COLORS.blue, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                  Initialize
                </button>
              </div>

              {liveHeap && (
                <>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
                    <input
                      value={addInput}
                      onChange={e => setAddInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && liveAdd()}
                      placeholder="Enter value..."
                      style={{ flex: 1, background: COLORS.heap, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 6, padding: "8px 12px", fontSize: 14, fontFamily: "inherit" }}
                    />
                    <button onClick={liveAdd} style={{ padding: "8px 16px", background: COLORS.accentSoft, border: `1px solid ${COLORS.accent}`, color: COLORS.accent, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 13, whiteSpace: "nowrap" }}>
                      add()
                    </button>
                  </div>

                  {feedback && (
                    <div style={{ background: COLORS.greenSoft, border: `1px solid ${COLORS.green}`, borderRadius: 6, padding: "8px 12px", fontSize: 13, color: COLORS.green, marginBottom: 12 }}>
                      {feedback}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>HEAP</div>
                      <HeapTree heap={liveHeap.data} />
                    </div>
                    {liveResult !== null && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>kth LARGEST</div>
                        <div style={{ width: 56, height: 56, borderRadius: "50%", background: COLORS.greenSoft, border: `2px solid ${COLORS.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: COLORS.green }}>
                          {liveResult}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

        {/* CODE TAB */}
        {tab === "Code" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card title="Java Solution">
              <pre style={{ background: COLORS.heap, borderRadius: 8, padding: 16, fontSize: 13, overflowX: "auto", margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                <span style={{ color: COLORS.blue }}>class </span><span style={{ color: COLORS.accent }}>KthLargest</span>{"  {\n"}
                {"    "}<span style={{ color: COLORS.blue }}>private </span><span style={{ color: COLORS.text }}>PriorityQueue&lt;Integer&gt; heap;{"\n"}</span>
                {"    "}<span style={{ color: COLORS.blue }}>private int </span><span style={{ color: COLORS.text }}>k;{"\n\n"}</span>

                {"    "}<span style={{ color: COLORS.blue }}>public </span><span style={{ color: COLORS.green }}>KthLargest</span>(<span style={{ color: COLORS.blue }}>int </span><span style={{ color: COLORS.text }}>k, </span><span style={{ color: COLORS.blue }}>int</span><span style={{ color: COLORS.text }}>[] nums) {"{"}{"\n"}</span>
                {"        "}<span style={{ color: COLORS.blue }}>this</span><span style={{ color: COLORS.text }}>.k = k;{"\n"}</span>
                {"        "}<span style={{ color: COLORS.text }}>heap = </span><span style={{ color: COLORS.blue }}>new </span><span style={{ color: COLORS.text }}>PriorityQueue&lt;&gt;(); </span><span style={{ color: COLORS.muted }}>// min-heap by default{"\n"}</span>
                {"        "}<span style={{ color: COLORS.blue }}>for </span>(<span style={{ color: COLORS.blue }}>int </span><span style={{ color: COLORS.text }}>n : nums) {"{"}{"\n"}</span>
                {"            "}<span style={{ color: COLORS.text }}>heap.offer(n);{"\n"}</span>
                {"            "}<span style={{ color: COLORS.blue }}>if </span>(<span style={{ color: COLORS.text }}>heap.size() &gt; k)</span>{"\n"}
                {"                "}<span style={{ color: COLORS.text }}>heap.poll(); </span><span style={{ color: COLORS.muted }}>// remove smallest, keep top k{"\n"}</span>
                {"        }"}{"\n"}
                {"    }"}{"\n\n"}

                {"    "}<span style={{ color: COLORS.blue }}>public int </span><span style={{ color: COLORS.green }}>add</span>(<span style={{ color: COLORS.blue }}>int </span><span style={{ color: COLORS.text }}>val) {"{"}{"\n"}</span>
                {"        "}<span style={{ color: COLORS.text }}>heap.offer(val);{"\n"}</span>
                {"        "}<span style={{ color: COLORS.blue }}>if </span>(<span style={{ color: COLORS.text }}>heap.size() &gt; k){"\n"}</span>
                {"            "}<span style={{ color: COLORS.text }}>heap.poll();{"\n"}</span>
                {"        "}<span style={{ color: COLORS.blue }}>return </span><span style={{ color: COLORS.text }}>heap.peek(); </span><span style={{ color: COLORS.muted }}>// root = kth largest{"\n"}</span>
                {"    }"}{"\n"}
                {"}"}
              </pre>
            </Card>

            <Card title="Line-by-line Breakdown">
              {[
                { line: "new PriorityQueue<>()", exp: "Java's PriorityQueue is a min-heap by default — the smallest element sits at the root (peek/poll)." },
                { line: "heap.offer(n)", exp: "Inserts a value into the heap in O(log k) time. 'offer' is preferred over 'add' in queue contexts." },
                { line: "if (heap.size() > k) heap.poll()", exp: "If we exceed k elements, remove the smallest. This keeps only the top-k largest values in the heap." },
                { line: "heap.peek()", exp: "Returns (without removing) the root — the minimum of our top-k elements, which is the kth largest overall." },
              ].map(({ line, exp }) => (
                <div key={line} style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "12px 0", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <code style={{ background: COLORS.heap, padding: "3px 8px", borderRadius: 4, fontSize: 12, color: COLORS.accent, whiteSpace: "nowrap", flexShrink: 0 }}>{line}</code>
                  <span style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>{exp}</span>
                </div>
              ))}
            </Card>

            <Card title="Java Heap Cheat Sheet">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { op: "new PriorityQueue<>()", desc: "Min-heap (default)" },
                  { op: "new PriorityQueue<>(Collections.reverseOrder())", desc: "Max-heap" },
                  { op: "heap.offer(val)", desc: "Insert — O(log n)" },
                  { op: "heap.poll()", desc: "Remove & return min — O(log n)" },
                  { op: "heap.peek()", desc: "Read min without removing — O(1)" },
                  { op: "heap.size()", desc: "Current number of elements" },
                ].map(({ op, desc }) => (
                  <div key={op} style={{ background: COLORS.heap, borderRadius: 6, padding: "10px 12px" }}>
                    <code style={{ fontSize: 11, color: COLORS.accent, display: "block", marginBottom: 4 }}>{op}</code>
                    <span style={{ fontSize: 12, color: COLORS.muted }}>{desc}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Common Gotchas">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: "⚠️", text: "PriorityQueue is a min-heap — the root is the SMALLEST. To get a max-heap pass Collections.reverseOrder() to the constructor." },
                  { icon: "⚠️", text: "Use offer/poll (not add/remove) — they return false/null on failure instead of throwing exceptions." },
                  { icon: "✅", text: "You never need to sort! The heap invariant guarantees peek() always returns the minimum of the stored elements in O(1)." },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: "flex", gap: 10, background: COLORS.heap, borderRadius: 6, padding: "10px 12px" }}>
                    <span>{icon}</span>
                    <span style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>{text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase", opacity: 0.7 }}>{title}</div>
      {children}
    </div>
  );
}
