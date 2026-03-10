export const difficulty = 'Easy'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

// ── Colors (CLAUDE.md standard) ─────────────────
const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED = "#ff6b6b";

// ── Reusable Components ─────────────────
function CodeLine({ children, highlight, annotation, annotationColor }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12,
      padding: "6px 16px",
      background: highlight ? "rgba(78,204,163,0.08)" : "transparent",
      borderLeft: `3px solid ${highlight ? TEAL : "transparent"}`,
      transition: "background 0.2s",
    }}>
      <div style={{ fontSize: 12, fontFamily: "monospace", lineHeight: 1.5, flexShrink: 0 }}>
        {children}
      </div>
      {annotation && (
        <div style={{ fontSize: 11, color: annotationColor, whiteSpace: "nowrap", fontFamily: "monospace", opacity: 0.85 }}>
          // {annotation}
        </div>
      )}
    </div>
  );
}

// ── Max Heap Implementation ─────────────────
class MaxHeap {
  constructor() { this.data = []; }
  push(v) { this.data.push(v); this._up(this.data.length - 1); }
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this._down(0);
    }
    return top;
  }
  peek() { return this.data[0]; }
  size() { return this.data.length; }
  _up(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.data[p] >= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  _down(i) {
    const n = this.data.length;
    while (true) {
      let big = i, l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l] > this.data[big]) big = l;
      if (r < n && this.data[r] > this.data[big]) big = r;
      if (big === i) break;
      [this.data[i], this.data[big]] = [this.data[big], this.data[i]];
      i = big;
    }
  }
}

// ── Algorithm Simulation ─────────────────
function simulate(stones) {
  const steps = [], h = new MaxHeap();
  for (const s of stones) h.push(s);
  steps.push({
    heap: [...h.data],
    action: "init",
    desc: `Build max-heap from [${stones.join(",")}]`,
    x: null,
    y: null,
    result: null,
    smash: false
  });
  while (h.size() > 0) {
    if (h.size() === 1) {
      steps.push({
        heap: [...h.data],
        action: "done",
        desc: `1 stone left → return ${h.peek()}`,
        x: h.peek(),
        y: null,
        result: h.peek(),
        smash: false
      });
      break;
    }
    const x = h.pop(), y = h.pop();
    if (x === y) {
      steps.push({
        heap: [...h.data],
        action: "equal",
        desc: `Poll ${x} and ${y} — equal, both destroyed`,
        x,
        y,
        result: null,
        smash: true
      });
    } else {
      const diff = x - y;
      h.push(diff);
      steps.push({
        heap: [...h.data],
        action: "diff",
        desc: `Poll ${x} and ${y} — diff=${diff}, push back`,
        x,
        y,
        result: diff,
        smash: true
      });
    }
    if (h.size() === 0) {
      steps.push({
        heap: [],
        action: "done",
        desc: `Heap empty → return 0`,
        x: null,
        y: null,
        result: 0,
        smash: false
      });
      break;
    }
  }
  return steps;
}

// ── Heap Visualization ─────────────────
function HeapTree({ heap, highlightIdxs = [] }) {
  if (!heap || heap.length === 0) return <p className="text-center text-default-400 py-4 text-sm">— empty —</p>;
  const levels = [];
  let i = 0, level = 0;
  while (i < heap.length) {
    const count = Math.min(Math.pow(2, level), heap.length - i);
    levels.push(heap.slice(i, i + count).map((v, ni) => ({ v, idx: Math.pow(2, level) - 1 + ni })));
    i += count;
    level++;
  }
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {levels.map((lvl, li) => (
        <div key={li} className="flex gap-3 justify-center">
          {lvl.map(({ v, idx }) => {
            const isHL = highlightIdxs.includes(idx);
            const isRoot = idx === 0;
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-mono transition-all"
                  style={{
                    background: isRoot ? `${TEAL}28` : isHL ? `${RED}28` : "var(--viz-surface)",
                    border: `2px solid ${isRoot ? TEAL : isHL ? RED : "var(--viz-border)"}`,
                    color: isRoot ? TEAL : isHL ? RED : "var(--viz-text)",
                    boxShadow: isRoot ? `0 0 12px ${TEAL}55` : "none"
                  }}>
                  {v}
                </div>
                {isRoot && <span className="text-[9px] mt-0.5" style={{ color: TEAL }}>MAX</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const PRESETS = [
  { label: "LC Example 1", val: "2,7,4,1,8,1" },
  { label: "LC Example 2", val: "1" },
  { label: "All Equal", val: "3,3,3,3" },
  { label: "Descending", val: "9,7,5,3,1" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [stonesStr, setStonesStr] = useState("2,7,4,1,8,1");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    const stones = stonesStr.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    if (stones.length > 0) {
      setSteps(simulate(stones));
      setSi(0);
    }
  }, [stonesStr]);

  const step = steps[si] || null;
  const stepColor = step?.action === "done" ? TEAL : step?.action === "equal" ? RED : step?.smash ? GOLD : BLUE;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🪨</span>
        <h1 className="font-semibold text-base">Last Stone Weight</h1>
        <Chip size="sm" color="success" variant="flat">Easy</Chip>
        <Chip size="sm" color="warning" variant="flat">Max-Heap</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={k => setTab(String(k))} variant="underlined" color="primary" size="sm">

          {/* PROBLEM TAB */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Problem Statement */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                  <p className="text-sm text-default-600 leading-relaxed mb-4">
                    You have a collection of stones with positive integer weights. Each turn, take the two <strong>heaviest</strong> stones and smash them together. If the stones have equal weight, both are destroyed. Otherwise, return the survivor with weight equal to their difference.
                  </p>
                  <div className="flex flex-col gap-2 mb-4">
                    {[
                      { sig: "int lastStoneWeight(int[] stones)", desc: "Return the weight of the last remaining stone, or 0 if all are destroyed." },
                    ].map(({ sig, desc }) => (
                      <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <code className="text-xs font-mono min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                        <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-default-400"><strong>Constraints:</strong> 1 ≤ stones.length ≤ 30</p>
                </CardBody>
              </Card>

              {/* Example 1 */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example 1 — stones = [2,7,4,1,8,1]</p>
                  <CodeBlock language="text">{`Initial: [2,7,4,1,8,1]
Sorted:  [8,7,4,2,1,1]

Step 1: Take 8 and 7 → 8-7=1 left. Stones: [4,2,1,1,1]
Step 2: Take 4 and 2 → 4-2=2 left. Stones: [2,1,1,1]
Step 3: Take 2 and 1 → 2-1=1 left. Stones: [1,1,1]
Step 4: Take 1 and 1 → equal, both destroyed. Stones: [1]
Step 5: Only 1 stone left. Return 1`}</CodeBlock>
                </CardBody>
              </Card>

              {/* Example 2 */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example 2 — stones = [1]</p>
                  <CodeBlock language="text">{`Only one stone. No smashing needed.
Return 1`}</CodeBlock>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* INTUITION TAB */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Core Idea */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Max-Heap Greedy</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Always smash the <strong>two heaviest</strong> stones. A max-heap gives you them in O(log n) per round.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">Greedy is optimal here</p>
                    </div>
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Two Outcomes</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        If <strong>x == y</strong>: both destroyed (nothing to push). If <strong>x != y</strong>: push the difference back.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">Keep heap up to date</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Algorithm Template */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                  <CodeBlock>{`PriorityQueue<Integer> maxHeap =
    new PriorityQueue<>(Collections.reverseOrder());

for (int s : stones) maxHeap.offer(s);

while (maxHeap.size() > 1) {
    int y = maxHeap.poll();  // heaviest
    int x = maxHeap.poll();  // 2nd heaviest

    if (x != y) {
        maxHeap.offer(y - x);  // push survivor back
    }
    // if x == y, both destroyed, nothing to push
}

return maxHeap.isEmpty() ? 0 : maxHeap.peek();`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                    Always process the two heaviest stones first. Greedy approach guarantees the optimal final result.
                  </div>
                </CardBody>
              </Card>

              {/* Complexity */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "TIME", v: "O(n log n)", s: "n smash rounds, log n per pop/push" },
                      { l: "SPACE", v: "O(n)", s: "Heap holds up to n stones" }
                    ].map(({ l, v, s }) => (
                      <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <p className="text-xs text-default-500 mb-1">{l}</p>
                        <p className="font-bold text-base" style={{ color: TEAL }}>{v}</p>
                        <p className="text-xs text-default-400 mt-1">{s}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* VISUALIZER TAB */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Configure */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {PRESETS.map(p => (
                      <Button key={p.label} size="sm"
                        variant={stonesStr === p.val ? "flat" : "bordered"}
                        color={stonesStr === p.val ? "primary" : "default"}
                        onPress={() => setStonesStr(p.val)}>
                        {p.label}
                      </Button>
                    ))}
                  </div>
                  <Input label="Stones (comma-separated)" value={stonesStr}
                    onValueChange={setStonesStr} variant="bordered" size="sm" />
                </CardBody>
              </Card>

              {/* Step-by-Step */}
              {steps.length > 0 && step && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Smash Simulation</p>

                    {/* Step Pills */}
                    <div className="flex gap-1.5 mb-4 flex-wrap">
                      {steps.map((s, i) => {
                        const c = s.action === "done" ? TEAL : s.action === "equal" ? RED : s.smash ? GOLD : BLUE;
                        return (
                          <button key={i} onClick={() => setSi(i)}
                            className="px-2 py-0.5 rounded text-[11px] cursor-pointer font-mono"
                            style={{
                              background: i === si ? `${c}20` : "var(--viz-surface)",
                              border: `1px solid ${i === si ? c : "var(--viz-border)"}`,
                              color: i === si ? c : "var(--viz-muted)"
                            }}>
                            {i === 0 ? "init" : i}
                          </button>
                        );
                      })}
                    </div>

                    {/* Status Line */}
                    <p className="text-xs text-default-500 mb-4 font-mono">
                      {step.action === "init" && "Initialized max-heap from stones"}
                      {step.action === "done" && `Final result: ${step.result}`}
                      {step.action === "equal" && (
                        <>
                          Smash: <span style={{ color: RED, fontWeight: 'bold' }}>{step.x}</span> + <span style={{ color: RED, fontWeight: 'bold' }}>{step.y}</span> = equal, both destroyed
                        </>
                      )}
                      {step.action === "diff" && (
                        <>
                          Smash: <span style={{ color: TEAL, fontWeight: 'bold' }}>{step.y}</span> - <span style={{ color: RED, fontWeight: 'bold' }}>{step.x}</span> = <span style={{ color: GOLD, fontWeight: 'bold' }}>{step.result}</span>
                        </>
                      )}
                    </p>

                    {/* Live Code Block */}
                    <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                      <CodeLine highlight={step.action === "diff" || step.action === "equal"} annotation={`y = ${step.y}`} annotationColor={TEAL}>
                        <span style={{ color: "var(--code-muted)" }}>int y = maxHeap.poll()</span>
                      </CodeLine>
                      <CodeLine highlight={step.action === "diff" || step.action === "equal"} annotation={`x = ${step.x}`} annotationColor={BLUE}>
                        <span style={{ color: "var(--code-muted)" }}>int x = maxHeap.poll()</span>
                      </CodeLine>
                      <CodeLine highlight={step.action === "diff"} annotation={step.action === "diff" ? `push(${step.result})` : ''} annotationColor={GOLD}>
                        <span style={{ color: "var(--code-muted)" }}>if (x != y) maxHeap.offer(y - x)</span>
                      </CodeLine>
                    </div>

                    {/* Heap Visualization */}
                    <div className="rounded-xl p-5 mb-4 text-center"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-center text-default-400 mb-2">Max-Heap — root = heaviest stone</p>
                      <HeapTree heap={step.heap} highlightIdxs={[]} />
                    </div>

                    {/* Detail Box */}
                    <div className="rounded-lg px-4 py-3 mb-4" style={{ background: `${stepColor}12`, border: `1px solid ${stepColor}40` }}>
                      <p className="text-[10px] text-default-400 mb-0.5">STEP {si + 1}/{steps.length}</p>
                      <p className="text-sm text-foreground">{step.desc}</p>
                      {step.smash && step.x !== null && (
                        <div className="flex gap-3 mt-2 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${TEAL}18`, color: TEAL }}>Heaviest: {step.y}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${RED}18`, color: RED }}>2nd Heaviest: {step.x}</span>
                          {step.result !== null && <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${GOLD}18`, color: GOLD }}>Difference: {step.result}</span>}
                        </div>
                      )}
                    </div>

                    {/* Final Result */}
                    {step.action === "done" && (
                      <div className="rounded-lg px-4 py-3 mb-4 text-center" style={{ background: `${TEAL}12`, border: `1px solid ${TEAL}44` }}>
                        <p className="text-xs text-default-400 mb-1">Final Answer</p>
                        <p className="text-xl font-bold" style={{ color: TEAL }}>{step.result}</p>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-2">
                      <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
                        onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                      <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1}
                        onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </Tab>

          {/* CODE TAB */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Full Java Solution */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                  <CodeBlock>{`public int lastStoneWeight(int[] stones) {
    PriorityQueue<Integer> maxHeap =
        new PriorityQueue<>(Collections.reverseOrder());

    for (int s : stones) {
        maxHeap.offer(s);
    }

    while (maxHeap.size() > 1) {
        int y = maxHeap.poll();  // heaviest
        int x = maxHeap.poll();  // 2nd heaviest

        if (x != y) {
            maxHeap.offer(y - x);  // survivor with reduced weight
        }
    }

    return maxHeap.isEmpty() ? 0 : maxHeap.peek();
}`}</CodeBlock>
                </CardBody>
              </Card>

              {/* Line-by-Line Breakdown */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                  <div className="flex flex-col divide-y divide-divider">
                    {[
                      { line: "PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());", exp: "Create a max-heap using reverseOrder() comparator (largest at root)." },
                      { line: "for (int s : stones) maxHeap.offer(s);", exp: "Add all stones to the max-heap. O(n log n) initialization." },
                      { line: "while (maxHeap.size() > 1)", exp: "Continue smashing while at least 2 stones remain." },
                      { line: "int y = maxHeap.poll(); int x = maxHeap.poll();", exp: "Remove the two heaviest stones. y ≥ x (max-heap property)." },
                      { line: "if (x != y) maxHeap.offer(y - x);", exp: "If different, push the survivor with weight y - x. If equal, both destroyed (nothing to push)." },
                      { line: "return maxHeap.isEmpty() ? 0 : maxHeap.peek();", exp: "If heap empty, all stones destroyed (return 0). Otherwise, return the last stone." },
                    ].map(({ line, exp }) => (
                      <div key={line} className="py-3 flex gap-3 items-start">
                        <code className="text-[11px] px-2 py-1 rounded min-w-0 font-mono whitespace-pre-wrap break-all"
                          style={{ background: "var(--viz-surface)", color: TEAL, border: "1px solid var(--viz-border)" }}>
                          {line}
                        </code>
                        <span className="text-sm text-default-500 leading-relaxed">{exp}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Pattern Memorization */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Pattern Memorization</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { icon: "🏔️", color: TEAL, tip: "Max-heap always gives the two heaviest stones in O(log n). Use Collections.reverseOrder() in Java." },
                      { icon: "💥", color: GOLD, tip: "If y == x, both destroyed (nothing to push). If y > x, push (y-x) back." },
                      { icon: "0️⃣", color: BLUE, tip: "Empty heap → return 0. This handles the case where all stones cancel out." },
                      { icon: "⚡", color: TEAL, tip: "O(n log n) total: n rounds, log n per pop/push. Greedy is optimal here." },
                      { icon: "🎯", color: BLUE, tip: "Related: Top K Frequent, Kth Largest in Stream, Reorganize String." },
                    ].map(({ icon, color, tip }) => (
                      <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                        style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", borderLeft: `3px solid ${color}` }}>
                        <span className="text-base flex-shrink-0">{icon}</span>
                        <span className="text-sm text-default-500 leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

        </Tabs>
      </div>
    </div>
  );
}
