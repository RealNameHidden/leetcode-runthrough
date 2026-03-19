export const difficulty = 'Easy'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

import { ArtifactRevisedButton } from '../../../src/ArtifactRevisedButton'

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

// ── Min Heap Implementation ─────────────────
class MinHeap {
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
      if (this.data[p] <= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  _down(i) {
    const n = this.data.length;
    while (true) {
      let s = i, l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l] < this.data[s]) s = l;
      if (r < n && this.data[r] < this.data[s]) s = r;
      if (s === i) break;
      [this.data[i], this.data[s]] = [this.data[s], this.data[i]];
      i = s;
    }
  }
}

// ── Algorithm Simulation ─────────────────
function simulate(k, nums, adds) {
  const h = new MinHeap();
  const steps = [];

  // Initialize with nums
  for (const n of nums) h.push(n);
  while (h.size() > k) h.pop();

  steps.push({
    phase: 'init',
    heap: [...h.data],
    result: h.peek() ?? null,
    val: null,
    desc: `Init with [${nums.join(",")}], trim to k=${k} largest → heap=[${h.data.join(",")}]`,
    action: 'init'
  });

  // Process additions
  for (const val of adds) {
    h.push(val);
    const popped = h.size() > k;
    if (popped) h.pop();
    steps.push({
      phase: 'add',
      heap: [...h.data],
      result: h.peek(),
      val,
      desc: `add(${val}) → ${popped ? `heap exceeds k, pop min` : `inserted`} → kth largest = ${h.peek()}`,
      action: popped ? 'pop' : 'push'
    });
  }
  return steps;
}

// ── Heap Visualization ─────────────────
function HeapTree({ heap, highlight }) {
  if (!heap || heap.length === 0) return <p className="text-center text-default-400 py-4 text-sm">— empty heap —</p>;
  const levels = [];
  let i = 0, level = 0;
  while (i < heap.length) {
    const count = Math.min(Math.pow(2, level), heap.length - i);
    levels.push(heap.slice(i, i + count));
    i += count;
    level++;
  }
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {levels.map((lvl, li) => (
        <div key={li} className="flex gap-3 justify-center items-center">
          {lvl.map((v, ni) => {
            const isHL = v === highlight;
            const isRoot = li === 0;
            return (
              <div key={ni} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-mono transition-all"
                  style={{
                    background: isRoot ? `${TEAL}28` : isHL ? `${BLUE}28` : "var(--viz-surface)",
                    border: `2px solid ${isRoot ? TEAL : isHL ? BLUE : "var(--viz-border)"}`,
                    color: isRoot ? TEAL : isHL ? BLUE : "var(--viz-text)",
                    boxShadow: isRoot ? `0 0 12px ${TEAL}55` : isHL ? `0 0 8px ${BLUE}44` : "none"
                  }}>
                  {v}
                </div>
                {isRoot && <span className="text-[9px] mt-1" style={{ color: TEAL }}>MIN</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const PRESETS = [
  { label: "LC Example", val: "4,5,8,2 k=3" },
  { label: "k=1 (Max)", val: "10,5,3,7,2 k=1" },
  { label: "All Same", val: "5,5,5,5 k=2" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [k, setK] = useState(3);
  const [numsStr, setNumsStr] = useState("4,5,8,2");
  const [addsStr, setAddsStr] = useState("3,5,10,9,4");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    const nums = numsStr.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const adds = addsStr.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length > 0) {
      setSteps(simulate(k, nums, adds));
      setSi(0);
    }
  }, [k, numsStr, addsStr]);

  const step = steps[si] || null;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">📡</span>
        <h1 className="font-semibold text-base">Kth Largest Element in a Stream</h1>
        <Chip size="sm" color="success" variant="flat">Easy</Chip>
        <Chip size="sm" color="primary" variant="flat">Min-Heap · Stream</Chip>
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
                    Design a class to find the <strong>kth largest element</strong> in a stream. For each number added to the stream, return the kth largest element at that point.
                  </p>
                  <div className="flex flex-col gap-2 mb-4">
                    {[
                      { sig: "KthLargest(int k, int[] nums)", desc: "Constructor: initialize with k and initial array." },
                      { sig: "int add(int val)", desc: "Add a number to the stream and return the kth largest element." },
                    ].map(({ sig, desc }) => (
                      <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <code className="text-xs font-mono min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                        <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-default-400"><strong>Constraints:</strong> 1 ≤ k ≤ 10⁴, nums can be empty</p>
                </CardBody>
              </Card>

              {/* Example 1 */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — k = 3, nums = [4,5,8,2]</p>
                  <CodeBlock language="text">{`KthLargest kl = new KthLargest(3, [4,5,8,2])
Init: Sort [2,4,5,8], keep top 3 → heap = [4,5,8]
kth largest = 4 (the minimum of top-3)

add(3)  → heap becomes [3,5,8] → return 3
add(5)  → heap becomes [5,5,8] → return 5
add(10) → heap becomes [5,8,10] → return 5  (size exceeds k, pop min)
add(9)  → heap becomes [8,9,10] → return 8
add(4)  → heap becomes [8,9,10] → return 8  (4 is too small)`}</CodeBlock>
                </CardBody>
              </Card>

              {/* Example 2 */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example 2 — k = 1 (Maximum Element)</p>
                  <CodeBlock language="text">{`KthLargest kl = new KthLargest(1, [])
add(3)  → heap = [3] → return 3
add(2)  → heap = [3] (pop 2) → return 3
add(4)  → heap = [4] (pop 3) → return 4

Each add() returns the current maximum (1st largest)`}</CodeBlock>
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
                    <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Min-Heap of Size k</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Keep a min-heap of exactly <strong>k</strong> elements. The root (minimum) is always the kth largest.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">heap.peek() = kth largest</p>
                    </div>
                    <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Why Min-Heap?</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Sorting every time = O(n log n). Min-heap of size k = O(log k) per add(). Stream never needs to re-sort.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">Much faster for large streams</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Algorithm Template */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                  <CodeBlock>{`PriorityQueue<Integer> minHeap = new PriorityQueue<>();

// Constructor: add all nums, then trim to size k
for (int n : nums) minHeap.offer(n);
while (minHeap.size() > k) minHeap.poll();

// add(val): maintain heap of size k
public int add(int val) {
    minHeap.offer(val);
    if (minHeap.size() > k) {
        minHeap.poll();  // remove the smallest (too small for top-k)
    }
    return minHeap.peek();  // root = kth largest
}`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                    After each add(), if heap exceeds k, pop the minimum. The remaining k elements are guaranteed to contain the kth largest.
                  </div>
                </CardBody>
              </Card>

              {/* Complexity */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "add() TIME", v: "O(log k)", s: "One push + possible pop" },
                      { l: "Constructor", v: "O(n log k)", s: "Add n numbers, max k ops" },
                      { l: "SPACE", v: "O(k)", s: "Heap holds k elements" }
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
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {PRESETS.map(p => {
                      const [nums, kVal] = p.val.split(" k=");
                      return (
                        <Button key={p.label} size="sm" variant={k === parseInt(kVal) && numsStr === nums ? "flat" : "bordered"}
                          color={k === parseInt(kVal) && numsStr === nums ? "primary" : "default"}
                          onPress={() => {
                            setNumsStr(nums);
                            setK(parseInt(kVal));
                          }}>
                          {p.label}
                        </Button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Input label="k" type="number" value={String(k)} onValueChange={v => setK(Math.max(1, parseInt(v) || 1))}
                      variant="bordered" size="sm" className="w-20" />
                    <Input label="Initial nums" value={numsStr} onValueChange={setNumsStr}
                      variant="bordered" size="sm" className="flex-1" />
                    <Input label="Stream adds" value={addsStr} onValueChange={setAddsStr}
                      variant="bordered" size="sm" className="flex-1" />
                  </div>
                </CardBody>
              </Card>

              {/* Step-by-Step */}
              {steps.length > 0 && step && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Step-by-Step Execution</p>
                    <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                      {si + 1}/{steps.length}
                    </p>

                    {/* Status Line */}
                    <p className="text-xs text-default-500 mb-4 font-mono">
                      {step.phase === 'init' && "Initialized heap with k largest"}
                      {step.phase === 'add' && (
                        <>
                          Added: <span style={{ color: BLUE, fontWeight: 'bold' }}>{step.val}</span> ·
                          Action: <span style={{ color: step.action === 'pop' ? RED : TEAL, fontWeight: 'bold' }}>{step.action === 'pop' ? 'POP' : 'PUSH'}</span> ·
                          Kth Largest: <span style={{ color: TEAL, fontWeight: 'bold' }}>{step.result}</span>
                        </>
                      )}
                    </p>

                    {/* Live Code Block */}
                    <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                      <CodeLine highlight={step.action === 'push'} annotation={step.action === 'push' ? `offer(${step.val})` : ''} annotationColor={TEAL}>
                        <span style={{ color: "var(--code-muted)" }}>minHeap.offer(val)</span>
                      </CodeLine>
                      <CodeLine highlight={step.phase === 'add'} annotation={`size = ${step.heap.length}`} annotationColor={BLUE}>
                        <span style={{ color: "var(--code-muted)" }}>if (minHeap.size() {'>'} k)</span>
                      </CodeLine>
                      <CodeLine highlight={step.action === 'pop'} annotation={step.action === 'pop' ? `poll()` : ''} annotationColor={RED}>
                        <span style={{ color: "var(--code-muted)" }}>  minHeap.poll()</span>
                      </CodeLine>
                      <CodeLine annotation={`kth largest = ${step.result}`} annotationColor={TEAL}>
                        <span style={{ color: "var(--code-muted)" }}>return minHeap.peek()</span>
                      </CodeLine>
                    </div>

                    {/* Heap Visualization */}
                    <div className="rounded-xl p-5 mb-4 text-center"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 mb-3">Min-Heap (size={step.heap.length}, k={k}) — root = kth largest</p>
                      <HeapTree heap={step.heap} highlight={step.val} />
                    </div>

                    {/* Result */}
                    <div className="rounded-lg px-4 py-3 mb-4 text-center" style={{ background: `${TEAL}12`, border: `1px solid ${TEAL}44` }}>
                      <p className="text-xs text-default-400 mb-1">Kth Largest</p>
                      <p className="text-xl font-bold" style={{ color: TEAL }}>{step.result}</p>
                    </div>

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
              <ArtifactRevisedButton />
              {/* Full Java Solution */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                  <CodeBlock>{`class KthLargest {
    private PriorityQueue<Integer> minHeap;
    private int k;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        minHeap = new PriorityQueue<>();
        for (int n : nums) {
            minHeap.offer(n);
        }
        while (minHeap.size() > k) {
            minHeap.poll();  // Trim to k elements
        }
    }

    public int add(int val) {
        minHeap.offer(val);
        if (minHeap.size() > k) {
            minHeap.poll();  // Remove the smallest
        }
        return minHeap.peek();  // Root = kth largest
    }
}`}</CodeBlock>
                </CardBody>
              </Card>

              {/* Line-by-Line Breakdown */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                  <div className="flex flex-col divide-y divide-divider">
                    {[
                      { line: "PriorityQueue<Integer> minHeap = new PriorityQueue<>();", exp: "Create a default min-heap (smallest at root)." },
                      { line: "for (int n : nums) minHeap.offer(n);", exp: "Add all initial numbers to the heap. O(n) time." },
                      { line: "while (minHeap.size() > k) minHeap.poll();", exp: "Remove the k smallest elements until heap has exactly k elements." },
                      { line: "minHeap.offer(val);", exp: "Add the new value to the heap. O(log k) insertion." },
                      { line: "if (minHeap.size() > k) minHeap.poll();", exp: "If heap exceeds k, remove the minimum (too small to be top-k)." },
                      { line: "return minHeap.peek();", exp: "The root is always the kth largest element. O(1) access." },
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
                      { icon: "📍", color: TEAL, tip: "Min-heap of size k: heap.peek() = kth largest." },
                      { icon: "⚠️", color: GOLD, tip: "Always pop() when heap exceeds k, don't let it grow unbounded." },
                      { icon: "🔄", color: BLUE, tip: "For kth smallest: use max-heap instead (reverse comparator)." },
                      { icon: "⚡", color: TEAL, tip: "O(log k) add is crucial — much faster than re-sorting O(n log n)." },
                      { icon: "🎯", color: BLUE, tip: "Related: Top K Frequent Elements, Kth Smallest in BST, Median of Stream." },
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
