export const difficulty = 'Medium'
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
function V({ children, color }) {
  return (
    <span style={{
      display: "inline-block", padding: "1px 5px", marginLeft: 2,
      borderRadius: 4, background: `${color}28`, color, fontWeight: 700, fontSize: 12
    }}>
      {children}
    </span>
  );
}

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
  constructor(compareFn) {
    this.data = [];
    this.compareFn = compareFn;
  }
  push(v) {
    this.data.push(v);
    this._up(this.data.length - 1);
  }
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
      if (this.compareFn(this.data[p], this.data[i]) <= 0) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  _down(i) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.compareFn(this.data[l], this.data[smallest]) < 0) smallest = l;
      if (r < n && this.compareFn(this.data[r], this.data[smallest]) < 0) smallest = r;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}

// ── Algorithm Simulation ─────────────────
function simulate(numsStr, k) {
  const nums = numsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (nums.length === 0) return [];

  const steps = [];
  const freqMap = {};

  // Step 1: Count frequencies
  for (const num of nums) {
    freqMap[num] = (freqMap[num] || 0) + 1;
  }
  steps.push({
    action: 'counting',
    desc: `Count frequencies in array`,
    freqMap: { ...freqMap },
    heap: [],
    currentNum: null,
    phase: 'counting'
  });

  // Step 2: Build min-heap of size k
  const heap = new MinHeap((a, b) => freqMap[a] - freqMap[b]);
  const uniqueNums = Object.keys(freqMap).map(Number);

  for (let idx = 0; idx < uniqueNums.length; idx++) {
    const num = uniqueNums[idx];
    heap.push(num);
    steps.push({
      action: 'push',
      desc: `Push ${num} (freq=${freqMap[num]}) → heap size=${heap.size()}`,
      freqMap: { ...freqMap },
      heap: [...heap.data],
      currentNum: num,
      phase: 'building',
      heapSize: heap.size()
    });

    if (heap.size() > k) {
      const removed = heap.pop();
      steps.push({
        action: 'pop',
        desc: `Heap size > k, pop min freq=${freqMap[removed]} (${removed}) → keep top k`,
        freqMap: { ...freqMap },
        heap: [...heap.data],
        currentNum: removed,
        phase: 'building',
        heapSize: heap.size()
      });
    }
  }

  // Step 3: Result
  const result = [...heap.data].sort((a, b) => freqMap[b] - freqMap[a]);
  steps.push({
    action: 'result',
    desc: `Final result: [${result.join(', ')}]`,
    freqMap: { ...freqMap },
    heap: [...heap.data],
    phase: 'result',
    result
  });

  return steps;
}

// ── Heap Visualization ─────────────────
function HeapViz({ heap, freqMap }) {
  if (!heap || heap.length === 0) return <p className="text-center text-default-400 py-4 text-xs">— empty —</p>;

  const levels = [];
  let i = 0, level = 0;
  while (i < heap.length) {
    const count = Math.min(Math.pow(2, level), heap.length - i);
    levels.push(heap.slice(i, i + count).map((v, ni) => ({ v, idx: Math.pow(2, level) - 1 + ni })));
    i += count;
    level++;
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {levels.map((lvl, li) => (
        <div key={li} className="flex gap-4 justify-center">
          {lvl.map(({ v, idx }) => {
            const isRoot = idx === 0;
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold font-mono transition-all"
                  style={{
                    background: isRoot ? `${TEAL}28` : "var(--viz-surface)",
                    border: `2px solid ${isRoot ? TEAL : "var(--viz-border)"}`,
                    color: isRoot ? TEAL : "var(--viz-text)",
                    boxShadow: isRoot ? `0 0 12px ${TEAL}55` : "none"
                  }}>
                  {v}
                </div>
                <div className="text-[10px] mt-1 font-mono" style={{ color: GOLD }}>f={freqMap?.[v]}</div>
                {isRoot && <span className="text-[9px] mt-0.5 font-bold" style={{ color: TEAL }}>MIN</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const PRESETS = [
  { label: "LC Example 1", val: "1,1,1,2,2,3 k=2" },
  { label: "LC Example 2", val: "4,1,1,1,1,2,2,3 k=1" },
  { label: "All Same", val: "5,5,5,5 k=2" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [input, setInput] = useState("1,1,1,2,2,3 k=2");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    const match = input.match(/^(.*?)\s+k=(\d+)$/);
    if (match) {
      const nums = match[1];
      const k = parseInt(match[2]);
      setSteps(simulate(nums, k));
      setSi(0);
    }
  }, [input]);

  const step = steps[si] || null;

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">📊</span>
        <h1 className="font-semibold text-base">Top K Frequent Elements</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Heap · HashMap</Chip>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3">
        <Tabs
          selectedKey={tab}
          onSelectionChange={key => setTab(String(key))}
          variant="underlined"
          color="primary"
          size="sm"
        >

          {/* PROBLEM TAB */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Problem Statement */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                  <p className="text-sm text-default-600 leading-relaxed mb-4">
                    Given an integer array <strong>nums</strong> and an integer <strong>k</strong>, return the <strong>k</strong> most frequent elements in the array. You may return the answer in <strong>any order</strong>.
                  </p>
                  <div className="flex flex-col gap-2 mb-4">
                    {[
                      { sig: "int[] topKFrequent(int[] nums, int k)", desc: "Return k most frequent elements. Array may contain duplicates, k ≥ 1 and k ≤ number of unique elements." },
                    ].map(({ sig, desc }) => (
                      <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <code className="text-xs font-mono min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                        <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-default-400 mb-2"><strong>Constraints:</strong> O(1) average time per operation required. Follow-up: Can you solve it in less than O(n log n) time?</p>
                </CardBody>
              </Card>

              {/* Example */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — nums = [1,1,1,2,2,3], k = 2</p>
                  <CodeBlock language="text">{`Input:   nums = [1,1,1,2,2,3], k = 2
Frequencies:  1 → 3 times
              2 → 2 times
              3 → 1 time

Output:  [1, 2]

Explanation: 1 appears 3 times (most frequent)
             2 appears 2 times (second most frequent)
             Return the top 2 most frequent elements`}</CodeBlock>
                </CardBody>
              </Card>

              {/* Another Example */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example 2 — nums = [4,1,1,1,1,2,2,3], k = 1</p>
                  <CodeBlock language="text">{`Input:   nums = [4,1,1,1,1,2,2,3], k = 1
Frequencies:  1 → 4 times (most frequent)
              2 → 2 times
              4 → 1 time
              3 → 1 time

Output:  [1]

Explanation: Only return the single most frequent element`}</CodeBlock>
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
                      <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Min-Heap of Size K</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Maintain a min-heap of exactly <strong>k</strong> elements, ordered by frequency. Always keep the least frequent at the root.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">Evict min when size exceeds k</p>
                    </div>
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Why This Works</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        By evicting the minimum frequency first, the remaining k elements are guaranteed to be the top k most frequent.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">O(log k) per operation, optimal for large n</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Algorithm Template */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                  <CodeBlock>{`// 1. Build frequency map
Map<Integer, Integer> freq = new HashMap<>();
for (int num : nums) {
  freq.put(num, freq.getOrDefault(num, 0) + 1);
}

// 2. Min-heap by frequency
PriorityQueue<Integer> heap = new PriorityQueue<>(
  (a, b) -> freq.get(a) - freq.get(b)
);

// 3. Maintain k-sized heap, evicting minimum
for (int num : freq.keySet()) {
  heap.offer(num);
  if (heap.size() > k) heap.poll();  // Remove smallest freq
}

// 4. Result
return new int[heap.size()];  // or heap.toArray()`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                    After processing all unique elements, the heap contains exactly the k most frequent. No need to re-sort!
                  </div>
                </CardBody>
              </Card>

              {/* Complexity */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "TIME", v: "O(n log k)", s: "Count O(n) + heap ops O(n log k)" },
                      { l: "SPACE", v: "O(n)", s: "Frequency map + heap both O(n) worst case" }
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
                    {PRESETS.map(p => (
                      <Button key={p.label} size="sm" variant={input === p.val ? "flat" : "bordered"} color={input === p.val ? "primary" : "default"} onPress={() => setInput(p.val)}>
                        {p.label}
                      </Button>
                    ))}
                  </div>
                  <Input
                    label="Input (nums, k)"
                    value={input}
                    onValueChange={setInput}
                    placeholder="e.g., 1,1,1,2,2,3 k=2"
                    variant="bordered"
                    size="sm"
                  />
                </CardBody>
              </Card>

              {/* Step-by-Step Debugger */}
              {steps.length > 0 && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Execution</p>

                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className="text-xs font-mono text-default-500"><strong style={{ color: TEAL }}>{si + 1}</strong> / {steps.length}</span>
                    </div>

                    {/* Status Line */}
                    <p className="text-xs text-default-500 mb-4 font-mono">
                      {step?.phase === 'counting' && "Counting frequencies..."}
                      {step?.phase === 'building' && (
                        <>
                          Element: <V color={TEAL}>{step.currentNum}</V> ·
                          Freq: <V color={GOLD}>{step.freqMap?.[step.currentNum]}</V> ·
                          Heap Size: <V color={BLUE}>{step.heapSize || 0}</V> ·
                          Action: <span style={{ color: step.action === 'pop' ? RED : TEAL }} className="font-bold">{step.action === 'pop' ? 'POP' : 'PUSH'}</span>
                        </>
                      )}
                      {step?.phase === 'result' && (
                        <>
                          Result: <V color={TEAL}>[{step.result?.join(', ')}]</V>
                        </>
                      )}
                    </p>

                    {/* Live Code Block */}
                    <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                      <CodeLine highlight={step?.action === 'push'} annotation={step?.action === 'push' ? `offer(${step.currentNum})` : ''} annotationColor={TEAL}>
                        <span style={{ color: "var(--code-muted)" }}>heap.offer(num)</span>
                      </CodeLine>
                      <CodeLine highlight={step?.heapSize > 0} annotation={`size = ${step?.heapSize || 0}`} annotationColor={BLUE}>
                        <span style={{ color: "var(--code-muted)" }}>if (heap.size() {'>'} k)</span>
                      </CodeLine>
                      <CodeLine highlight={step?.action === 'pop'} annotation={step?.action === 'pop' ? `poll(${step.currentNum})` : ''} annotationColor={RED}>
                        <span style={{ color: "var(--code-muted)" }}>  heap.poll()</span>
                      </CodeLine>
                    </div>

                    {/* Heap Visualization */}
                    <div className="rounded-xl p-5 mb-4 text-center"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 mb-3">Heap State (Min at Root)</p>
                      <HeapViz heap={step?.heap} freqMap={step?.freqMap} />
                    </div>

                    {/* Step Description */}
                    <div className="bg-content2 rounded-lg px-4 py-3 mb-4 text-sm font-mono"
                      style={{ borderLeft: `3px solid ${step?.action === 'result' ? TEAL : step?.action === 'pop' ? RED : GOLD}` }}>
                      {step?.desc}
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

              {/* Final State Card */}
              {step?.phase === 'result' && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Final Result</p>
                    <div className="text-center py-6" style={{ background: "var(--viz-surface)", borderRadius: "0.75rem", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 mb-3">Top K Frequent Elements</p>
                      <p className="font-bold text-2xl" style={{ color: TEAL }}>[{step.result?.join(', ')}]</p>
                      <p className="text-xs text-default-400 mt-3">Frequencies: {step.result?.map(n => `${n}→${step.freqMap?.[n]}`).join(', ')}</p>
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
                  <CodeBlock>{`import java.util.*;

class Solution {
  public int[] topKFrequent(int[] nums, int k) {
    // 1. Count frequencies
    Map<Integer, Integer> freq = new HashMap<>();
    for (int num : nums) {
      freq.put(num, freq.getOrDefault(num, 0) + 1);
    }

    // 2. Min-heap by frequency (size k)
    PriorityQueue<Integer> heap = new PriorityQueue<>(
      (a, b) -> freq.get(a) - freq.get(b)
    );

    // 3. Add to heap, maintain size k
    for (int num : freq.keySet()) {
      heap.offer(num);
      if (heap.size() > k) {
        heap.poll();  // Remove least frequent
      }
    }

    // 4. Convert heap to array
    int[] result = new int[k];
    int i = k - 1;
    while (!heap.isEmpty()) {
      result[i--] = heap.poll();
    }
    return result;
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
                      { line: "Map<Integer, Integer> freq = new HashMap<>();\nfor (int num : nums) freq.put(num, freq.getOrDefault(num, 0) + 1);", exp: "Count occurrences of each unique number in a hash map. O(n) time." },
                      { line: "PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> freq.get(a) - freq.get(b));", exp: "Create a min-heap ordered by frequency. Root is always the least frequent element." },
                      { line: "for (int num : freq.keySet()) { heap.offer(num); }", exp: "Iterate through all unique numbers (at most n). Add each to the heap." },
                      { line: "if (heap.size() > k) heap.poll();", exp: "If heap exceeds k elements, remove the smallest frequency. Keeps only top k." },
                      { line: "int[] result = new int[k]; int i = k - 1; while (!heap.isEmpty()) result[i--] = heap.poll();", exp: "Extract all k elements from heap into result array. Order doesn't matter for final answer." },
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
                      { icon: "📍", color: TEAL, tip: "Min-heap of size K maintains top-k most frequent in O(n log k)." },
                      { icon: "⚠️", color: GOLD, tip: "Use frequency map FIRST, then heap. Don't try to heap the raw array." },
                      { icon: "🔄", color: BLUE, tip: "When heap.size() > k, always poll() to evict the minimum." },
                      { icon: "💡", color: TEAL, tip: "Bonus: For very large k, use bucket sort instead (O(n) time)." },
                      { icon: "🎯", color: BLUE, tip: "Related: Kth Largest Element, Top K Frequent Words, Reorganize String." },
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
