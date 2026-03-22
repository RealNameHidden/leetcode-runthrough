export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";
import { ArtifactRevisedButton } from '../../../src/ArtifactRevisedButton'

const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED = "#ff6b6b";

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

function simulate(numsStr) {
  const nums = numsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (nums.length < 2) return [];

  const n = nums.length;
  const steps = [];
  const output = new Array(n).fill(1);

  steps.push({
    phase: 'init',
    nums: [...nums],
    output: [...output],
    current: -1,
    suffix: 1,
    desc: `Initialize output[] = [${output.join(', ')}]. Pass 1 will build prefix products left → right.`,
  });

  // Pass 1: prefix products (left to right)
  for (let i = 1; i < n; i++) {
    output[i] = output[i - 1] * nums[i - 1];
    steps.push({
      phase: 'prefix',
      nums: [...nums],
      output: [...output],
      current: i,
      suffix: 1,
      desc: `Pass 1 — output[${i}] = output[${i-1}] × nums[${i-1}] = ${output[i-1]} × ${nums[i-1]} = ${output[i]}`,
    });
  }

  // Pass 2: suffix products (right to left)
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    const before = output[i];
    output[i] *= suffix;
    steps.push({
      phase: 'suffix',
      nums: [...nums],
      output: [...output],
      current: i,
      suffix,
      suffixAfter: suffix * nums[i],
      desc: `Pass 2 — output[${i}] = ${before} × suffix(${suffix}) = ${output[i]}; then suffix = ${suffix} × ${nums[i]} = ${suffix * nums[i]}`,
    });
    suffix *= nums[i];
  }

  steps.push({
    phase: 'result',
    nums: [...nums],
    output: [...output],
    current: -1,
    suffix,
    desc: `Done! Result: [${output.join(', ')}]`,
  });

  return steps;
}

const PRESETS = [
  { label: "LC Example 1", val: "1,2,3,4" },
  { label: "LC Example 2", val: "-1,1,0,-3,3" },
  { label: "Powers of 2", val: "1,2,4,8" },
  { label: "Simple 3", val: "2,3,4" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [input, setInput] = useState("1,2,3,4");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    const s = simulate(input);
    setSteps(s);
    setSi(0);
  }, [input]);

  const step = steps[si] || null;

  function cellColor(i) {
    if (!step) return "var(--viz-border)";
    if (i === step.current) return step.phase === 'suffix' ? GOLD : TEAL;
    return "var(--viz-border)";
  }

  function outputCellDone(i) {
    if (!step) return false;
    if (step.phase === 'prefix') return i <= step.current;
    if (step.phase === 'suffix') return i >= step.current;
    if (step.phase === 'result') return true;
    return false;
  }

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">✖️</span>
        <h1 className="font-semibold text-base">Product of Array Except Self</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Arrays · Prefix Product</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">

          {/* PROBLEM TAB */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given an integer array <strong>nums</strong>, return an array <strong>answer</strong> such that{" "}
                  <code>answer[i]</code> equals the product of all elements of <code>nums</code> except{" "}
                  <code>nums[i]</code>. You must solve it <strong>without division</strong> in{" "}
                  <strong>O(n)</strong> time and <strong>O(1)</strong> extra space.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      sig: "int[] productExceptSelf(int[] nums)",
                      desc: "Return array where each element is the product of all others. No division. O(1) extra space (output array doesn't count).",
                    },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-[6rem] flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — nums = [1,2,3,4]</p>
                <CodeBlock language="text">{`Input:  nums = [1, 2, 3, 4]
Output:        [24, 12,  8,  6]

For index 0: product of [2,3,4] = 24
For index 1: product of [1,3,4] = 12
For index 2: product of [1,2,4] =  8
For index 3: product of [1,2,3] =  6

Brute force O(n²): for each i, multiply all others
Optimal O(n):  two-pass prefix × suffix, no division`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example 2 — nums = [-1,1,0,-3,3]</p>
                <CodeBlock language="text">{`Input:  nums = [-1, 1, 0, -3, 3]
Output:        [  0, 0, 9,  0,  0]

Since nums[2] = 0, every product that includes index 2 is 0.
Only answer[2] (which excludes 0) can be non-zero:
  answer[2] = -1 × 1 × -3 × 3 = 9

The prefix/suffix approach handles zeros naturally!`}</CodeBlock>
              </CardBody></Card>

            </div>
          </Tab>

          {/* INTUITION TAB */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Pass 1 — Prefix Products →</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Sweep <strong>left to right</strong>. Store in <code>output[i]</code> the product of everything
                      to the <em>left</em> of index <code>i</code>. Start with <code>output[0] = 1</code> (no elements to the left).
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">output[i] = output[i-1] × nums[i-1]</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Pass 2 — Suffix Products ←</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Sweep <strong>right to left</strong> with a single running <code>suffix</code> variable
                      (product of everything to the right). Multiply <code>output[i]</code> by <code>suffix</code>,
                      then extend suffix leftward.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">output[i] *= suffix; suffix *= nums[i]</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`int[] output = new int[n];

// Pass 1: output[i] = product of all elements LEFT of i
output[0] = 1;
for (int i = 1; i < n; i++) {
    output[i] = output[i - 1] * nums[i - 1];
}

// Pass 2: multiply by suffix product (everything RIGHT of i)
int suffix = 1;
for (int i = n - 1; i >= 0; i--) {
    output[i] *= suffix;
    suffix *= nums[i];  // extend suffix leftward
}`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  answer[i] = (product of all to the left) × (product of all to the right).
                  Pass 1 stores the left half in-place. Pass 2 applies the right half using
                  a single variable — no division, O(1) extra space!
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(n)", s: "Two separate linear passes over the array" },
                    { l: "SPACE", v: "O(1)", s: "Output array excluded; only a suffix variable extra" },
                  ].map(({ l, v, s }) => (
                    <div key={l} className="flex-1 rounded-lg p-4 text-center"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-500 mb-1">{l}</p>
                      <p className="font-bold text-base" style={{ color: TEAL }}>{v}</p>
                      <p className="text-xs text-default-400 mt-1">{s}</p>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

            </div>
          </Tab>

          {/* VISUALIZER TAB */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Configure */}
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {PRESETS.map(p => (
                    <Button key={p.label} size="sm"
                      variant={input === p.val ? "flat" : "bordered"}
                      color={input === p.val ? "primary" : "default"}
                      onPress={() => setInput(p.val)}>
                      {p.label}
                    </Button>
                  ))}
                </div>
                <Input
                  label="Input array (comma-separated integers)"
                  value={input}
                  onValueChange={v => setInput(v)}
                  placeholder="e.g., 1,2,3,4"
                  variant="bordered"
                  size="sm"
                />
              </CardBody></Card>

              {/* Step-by-Step Debugger */}
              {steps.length > 0 && step && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Execution</p>

                  <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>{si + 1}/{steps.length}</p>

                  {/* Status line */}
                  <p className="text-xs text-default-500 mb-4">
                    Phase:{" "}
                    <span className="font-bold" style={{
                      color: step.phase === 'prefix' ? TEAL : step.phase === 'suffix' ? GOLD : step.phase === 'result' ? TEAL : BLUE
                    }}>
                      {step.phase === 'init' ? 'INITIALIZE' : step.phase === 'prefix' ? 'PASS 1 — Prefix →' : step.phase === 'suffix' ? 'PASS 2 — Suffix ←' : 'RESULT'}
                    </span>
                    {step.current >= 0 && <> · Index: <V color={step.phase === 'suffix' ? GOLD : TEAL}>{step.current}</V></>}
                    {step.phase === 'suffix' && <> · Suffix: <V color={GOLD}>{step.suffix}</V></>}
                  </p>

                  {/* Live Code Block */}
                  <div className="rounded-xl overflow-hidden mb-4"
                    style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step.phase === 'init'}
                      annotation="output = [1,1,...,1]"
                      annotationColor={BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>output[0] = 1</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'prefix'}
                      annotation={step.phase === 'prefix' ? `output[${step.current}] = ${step.output[step.current]}` : ''}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>output[i] = output[i-1] * nums[i-1]</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'suffix'}
                      annotation={step.phase === 'suffix' ? `output[${step.current}] *= suffix(${step.suffix})` : ''}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>output[i] *= suffix</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'suffix'}
                      annotation={step.phase === 'suffix' ? `suffix = ${step.suffix} × ${step.nums[step.current]} = ${step.suffixAfter}` : ''}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>suffix *= nums[i]</span>
                    </CodeLine>
                  </div>

                  {/* Array visualization */}
                  <div className="rounded-xl p-4 mb-4 overflow-x-auto"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-4 text-center">
                      {step.phase === 'prefix'
                        ? '→ Prefix products building left to right'
                        : step.phase === 'suffix'
                        ? '← Suffix products multiplying right to left'
                        : step.phase === 'result'
                        ? '✓ Final output'
                        : 'Array state'}
                    </p>

                    {/* nums row */}
                    <div className="mb-4">
                      <p className="text-[10px] text-default-400 mb-2 font-mono font-bold">nums[ ]</p>
                      <div className="flex gap-2">
                        {step.nums.map((n, i) => {
                          const isActive = i === step.current;
                          const activeColor = step.phase === 'suffix' ? GOLD : TEAL;
                          return (
                            <div key={i} className="flex flex-col items-center">
                              <div className="w-11 h-11 flex items-center justify-center rounded-lg font-mono text-sm font-bold transition-all"
                                style={{
                                  background: isActive ? `${activeColor}22` : "var(--viz-node-bg)",
                                  border: `2px solid ${isActive ? activeColor : "var(--viz-border)"}`,
                                  color: isActive ? activeColor : "var(--viz-muted)",
                                  boxShadow: isActive ? `0 0 10px ${activeColor}44` : "none",
                                }}>
                                {n}
                              </div>
                              <div className="text-[9px] mt-1 text-default-400 font-mono">[{i}]</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Direction arrow */}
                    <div className="mb-4 flex items-center">
                      {step.phase === 'prefix' && (
                        <div className="flex-1 flex items-center gap-2">
                          <div className="h-px flex-1" style={{ background: `${TEAL}55` }} />
                          <span className="text-[10px] font-mono font-bold" style={{ color: TEAL }}>PREFIX →</span>
                        </div>
                      )}
                      {step.phase === 'suffix' && (
                        <div className="flex-1 flex items-center gap-2 justify-end">
                          <span className="text-[10px] font-mono font-bold" style={{ color: GOLD }}>← SUFFIX</span>
                          <div className="h-px flex-1" style={{ background: `${GOLD}55` }} />
                        </div>
                      )}
                      {(step.phase === 'init' || step.phase === 'result') && (
                        <div className="text-[10px] font-mono text-default-400">↑ output computed below</div>
                      )}
                    </div>

                    {/* output row */}
                    <div>
                      <p className="text-[10px] text-default-400 mb-2 font-mono font-bold">output[ ]</p>
                      <div className="flex gap-2">
                        {step.output.map((n, i) => {
                          const isActive = i === step.current;
                          const isDone = outputCellDone(i);
                          const activeColor = step.phase === 'suffix' ? GOLD : TEAL;
                          return (
                            <div key={i} className="flex flex-col items-center">
                              <div className="w-11 h-11 flex items-center justify-center rounded-lg font-mono text-sm font-bold transition-all"
                                style={{
                                  background: isActive ? `${activeColor}33` : isDone ? `${activeColor}11` : "var(--viz-node-bg)",
                                  border: `2px solid ${isActive ? activeColor : isDone ? `${activeColor}88` : "var(--viz-border)"}`,
                                  color: isActive ? activeColor : isDone ? activeColor : "var(--viz-muted)",
                                  boxShadow: isActive ? `0 0 10px ${activeColor}44` : "none",
                                }}>
                                {n}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Step description */}
                  <div className="rounded-lg px-4 py-3 mb-4 text-xs font-mono bg-content2"
                    style={{ borderLeft: `3px solid ${step.phase === 'suffix' ? GOLD : TEAL}` }}>
                    {step.desc}
                  </div>

                  {/* Prev / Next */}
                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
                      onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1}
                      onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                  </div>
                </CardBody></Card>
              )}

              {/* Final State Card */}
              {step?.phase === 'result' && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Final Result</p>
                  <div className="py-6 text-center rounded-xl"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-2">Input</p>
                    <p className="font-mono text-sm mb-4" style={{ color: BLUE }}>[{step.nums.join(', ')}]</p>
                    <p className="text-xs text-default-400 mb-2">Product Except Self</p>
                    <p className="font-bold text-2xl font-mono" style={{ color: TEAL }}>[{step.output.join(', ')}]</p>
                    <div className="flex gap-4 justify-center mt-4 flex-wrap">
                      {step.output.map((v, i) => (
                        <div key={i} className="text-center">
                          <div className="text-[10px] text-default-400 font-mono">[{i}]</div>
                          <div className="font-bold font-mono text-sm" style={{ color: TEAL }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardBody></Card>
              )}

            </div>
          </Tab>

          {/* CODE TAB */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <ArtifactRevisedButton />

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                <CodeBlock>{`class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] output = new int[n];

        // Pass 1: output[i] = product of all elements to the left
        output[0] = 1;
        for (int i = 1; i < n; i++) {
            output[i] = output[i - 1] * nums[i - 1];
        }

        // Pass 2: multiply by running suffix product from the right
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            output[i] *= suffix;
            suffix *= nums[i];  // extend suffix leftward for next iteration
        }

        return output;
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "output[0] = 1", exp: "Nothing is to the left of index 0, so the prefix product is 1 (multiplicative identity)." },
                    { line: "output[i] = output[i-1] * nums[i-1]", exp: "Build prefix product left to right. output[i] accumulates the product of nums[0..i-1]." },
                    { line: "int suffix = 1", exp: "Running suffix product starts at 1 — nothing is to the right of the last element." },
                    { line: "output[i] *= suffix", exp: "Multiply the prefix product already stored at output[i] by the running product from the right." },
                    { line: "suffix *= nums[i]", exp: "Extend suffix leftward: include nums[i] in the running right-product for the next iteration." },
                  ].map(({ line, exp }) => (
                    <div key={line} className="py-3 flex gap-3 items-start">
                      <code className="text-[11px] px-2 py-1 rounded flex-shrink-0 font-mono"
                        style={{ background: "var(--viz-surface)", color: TEAL, border: "1px solid var(--viz-border)" }}>
                        {line}
                      </code>
                      <span className="text-sm text-default-500 leading-relaxed">{exp}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Pattern Memorization</p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: "📍", color: TEAL, tip: "Two-pass: Pass 1 builds prefix products left→right in output[]. Pass 2 multiplies suffix right→left using one variable." },
                    { icon: "⚠️", color: GOLD, tip: "Update suffix AFTER multiplying output[i]. Order matters: output[i] *= suffix; THEN suffix *= nums[i]." },
                    { icon: "🔢", color: BLUE, tip: "Handles zeros correctly — any element whose position is not the zero gets a product of 0 from the pass that crosses the zero." },
                    { icon: "💡", color: TEAL, tip: "The output array is O(n) but doesn't count as 'extra space' per the problem. The only extra variable is the suffix scalar." },
                    { icon: "🎯", color: BLUE, tip: "Related patterns: Trapping Rain Water (two-pass left/right max), Maximum Product Subarray, Running Prefix Sum." },
                  ].map(({ icon, color, tip }) => (
                    <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", borderLeft: `3px solid ${color}` }}>
                      <span className="text-base">{icon}</span>
                      <span className="text-sm text-default-500 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

            </div>
          </Tab>

        </Tabs>
      </div>
    </div>
  );
}
