export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const ACCENT = "#ec4899";
const GOLD = "#fbbf24";
const GREEN = "#10b981";
const RED = "#ef4444";

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

function simulate(numsStr, k) {
  const nums = numsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (nums.length === 0) return [];

  const steps = [];
  const freqMap = {};
  for (const num of nums) {
    freqMap[num] = (freqMap[num] || 0) + 1;
  }

  steps.push({
    action: 'counting',
    desc: `Count frequencies`,
    freqMap: { ...freqMap }
  });

  const heap = new MinHeap((a, b) => freqMap[a] - freqMap[b]);
  for (const num of Object.keys(freqMap).map(Number)) {
    heap.push(num);
    steps.push({
      action: 'push',
      num,
      freq: freqMap[num],
      heap: [...heap.data],
      desc: `Push ${num} (freq=${freqMap[num]})`
    });
    if (heap.size() > k) {
      const removed = heap.pop();
      steps.push({
        action: 'pop',
        num: removed,
        freq: freqMap[removed],
        heap: [...heap.data],
        desc: `Heap size > k, pop min: ${removed}`
      });
    }
  }

  const result = [...heap.data].sort((a, b) => freqMap[b] - freqMap[a]);
  steps.push({
    action: 'result',
    desc: `Result: [${result.join(', ')}]`,
    freqMap: { ...freqMap }
  });

  return steps;
}

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
                    background: isRoot ? `${ACCENT}28` : "var(--viz-surface)",
                    border: `2px solid ${isRoot ? ACCENT : "var(--viz-border)"}`,
                    color: isRoot ? ACCENT : "var(--viz-text)",
                    boxShadow: isRoot ? `0 0 12px ${ACCENT}55` : "none"
                  }}>
                  {v}
                </div>
                <div className="text-[10px] mt-1 font-mono" style={{ color: GOLD }}>freq={freqMap?.[v]}</div>
                {isRoot && <span className="text-[9px] mt-0.5 font-bold" style={{color: ACCENT}}>MIN</span>}
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
];

export default function App() {
  const [tab, setTab] = useState("Visualizer");
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
  const stepColor = step?.action === 'result' ? GREEN : step?.action === 'pop' ? RED : ACCENT;

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">📊</span>
        <h1 className="font-semibold text-base">Top K Frequent Elements</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="secondary" variant="flat">Heap · HashMap</Chip>
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

          {/* INTUITION */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${ACCENT}0d`, borderColor: `${ACCENT}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: ACCENT }}>Use a Min-Heap</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Keep a min-heap of size <strong>k</strong> ordered by frequency. The smallest element is always at the root.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">When heap exceeds k, pop the minimum</p>
                    </div>
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Why Min-Heap?</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Easy to evict the least frequent element without scanning the entire heap.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">Always O(log k) operations</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm</p>
                  <CodeBlock>{`// 1. Count frequencies (HashMap)
Map<Integer, Integer> freq = new HashMap<>();
for (int num : nums) {
  freq.put(num, freq.getOrDefault(num, 0) + 1);
}

// 2. Min-heap of size k
PriorityQueue<Integer> heap = new PriorityQueue<>(
  (a, b) -> freq.get(a) - freq.get(b)
);

// 3. Add elements, evict min when size > k
for (int num : freq.keySet()) {
  heap.offer(num);
  if (heap.size() > k) {
    heap.poll();
  }
}

// 4. Result is heap contents
return heap.stream().toArray();`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">💡 Key insight: </span>
                    Min-heap lets us efficiently maintain the top-k by always removing the weakest candidate.
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "TIME", v: "O(n log k)", s: "Count + heap ops" },
                      { l: "SPACE", v: "O(n)", s: "HashMap for frequencies" }
                    ].map(({ l, v, s }) => (
                      <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <p className="text-xs text-default-500 mb-1">{l}</p>
                        <p className="font-bold text-base" style={{ color: ACCENT }}>{v}</p>
                        <p className="text-xs text-default-400 mt-1">{s}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* VISUALIZER */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

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
                    classNames={{ label: `!text-[${ACCENT}]` }}
                  />
                </CardBody>
              </Card>

              {steps.length > 0 && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Heap State</p>
                    <HeapViz heap={step?.heap} freqMap={step?.freqMap} />

                    <div className="bg-content2 rounded-lg px-4 py-3 mt-4 text-sm font-mono" style={{ borderLeft: `3px solid ${stepColor}` }}>
                      {step?.desc}
                    </div>

                    <div className="flex gap-2 justify-between mt-6">
                      <Button size="sm" onPress={() => setSi(Math.max(0, si - 1))} isDisabled={si === 0}>← Prev</Button>
                      <span className="text-xs self-center">{si + 1} / {steps.length}</span>
                      <Button size="sm" onPress={() => setSi(Math.min(steps.length - 1, si + 1))} isDisabled={si === steps.length - 1}>Next →</Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </Tab>

        </Tabs>
      </div>
    </div>
  );
}
