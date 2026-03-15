export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

// ── Colors ────────────────────────────────────────────────────────────
const TEAL  = "#4ecca3";
const GOLD  = "#f6c90e";
const BLUE  = "#5dade2";
const RED   = "#ff6b6b";

// ── Simulate algorithm, record every decision ─────────────────────────
function simulate(numsStr, targetStr) {
  const nums   = numsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const target = parseInt(targetStr);
  if (nums.length < 2 || isNaN(target)) return [];

  const steps = [];
  let left = 0, right = nums.length - 1;

  steps.push({ phase: 'init', left, right, nums: [...nums], sum: null, result: null });

  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) {
      steps.push({ phase: 'found', left, right, nums: [...nums], sum, result: [left + 1, right + 1] });
      break;
    } else if (sum < target) {
      steps.push({ phase: 'too_small', left, right, nums: [...nums], sum, result: null });
      left++;
    } else {
      steps.push({ phase: 'too_large', left, right, nums: [...nums], sum, result: null });
      right--;
    }
  }

  return steps;
}

// ── Array visualization ───────────────────────────────────────────────
function ArrayViz({ nums, left, right }) {
  const max = Math.max(...nums);
  const HEIGHT = 90;

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-end gap-2 justify-center px-4 pt-4 pb-2">
        {nums.map((val, idx) => {
          const isL = idx === left;
          const isR = idx === right;
          const color = isL ? TEAL : isR ? GOLD : null;
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div className="transition-all duration-300 rounded-t"
                style={{
                  width: 32,
                  height: Math.max((val / max) * HEIGHT, 6),
                  background: color ? `${color}33` : "var(--viz-surface)",
                  border: `2px solid ${color || "var(--viz-border)"}`,
                  boxShadow: color ? `0 0 8px ${color}55` : "none",
                }} />
              <span className="text-xs font-mono font-bold">{val}</span>
              <span className="text-[9px]" style={{ color: "var(--viz-muted)" }}>[{idx}]</span>
              {color && (
                <span className="text-[10px] font-bold" style={{ color }}>
                  {isL ? "L" : "R"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Presets ───────────────────────────────────────────────────────────
const PRESETS = [
  { label: "LC Example 1", nums: "2,7,11,15", target: "9"  },
  { label: "LC Example 2", nums: "2,3,4",     target: "6"  },
  { label: "Longer array", nums: "1,2,3,4,5,6,7", target: "13" },
  { label: "Multiple moves", nums: "1,3,5,7,9,11", target: "16" },
];

// ── Value badge ───────────────────────────────────────────────────────
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

// ── Annotated code line ───────────────────────────────────────────────
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

// ── Phase helpers ─────────────────────────────────────────────────────
function phaseLabel(phase) {
  if (phase === 'init')      return { text: "Initialize pointers",       color: BLUE  };
  if (phase === 'found')     return { text: "✓ Target found!",           color: TEAL };
  if (phase === 'too_small') return { text: "Sum too small → left++",    color: TEAL  };
  if (phase === 'too_large') return { text: "Sum too large → right--",   color: GOLD  };
  return { text: "", color: BLUE };
}

// ── Main export ────────────────────────────────────────────────────────
export default function App() {
  const [tab,         setTab]         = useState("Problem");
  const [numsInput,   setNumsInput]   = useState("2,7,11,15");
  const [targetInput, setTargetInput] = useState("9");
  const [steps,       setSteps]       = useState([]);
  const [si,          setSi]          = useState(0);

  useEffect(() => {
    setSteps(simulate(numsInput, targetInput));
    setSi(0);
  }, [numsInput, targetInput]);

  const step   = steps[si] || null;
  const nums   = numsInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const target = parseInt(targetInput);
  const label  = step ? phaseLabel(step.phase) : { text: "", color: BLUE };

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">👈👉</span>
        <h1 className="font-semibold text-base">Two Sum II — Input Array Is Sorted</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Two Pointers</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs
          selectedKey={tab}
          onSelectionChange={key => setTab(String(key))}
          variant="underlined" color="primary" size="sm"
        >

          {/* ── PROBLEM ────────────────────────────────────────────── */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given a <strong>1-indexed</strong> sorted array of integers, find two numbers that add up to a given target. Return their indices as <code>[index1, index2]</code> (1-indexed). Exactly one solution is guaranteed, and you may not use the same element twice.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "int[] twoSum(int[] numbers, int target)", desc: "Returns [index1, index2] (1-indexed). numbers is sorted ascending. One solution always exists." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-0 flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — numbers = [2,7,11,15], target = 9</p>
                <CodeBlock language="text">{`Input:  numbers = [2, 7, 11, 15],  target = 9
Output: [1, 2]   (1-indexed)

Array is sorted, so start with widest window: L=0 (val=2), R=3 (val=15)
  2 + 15 = 17 > 9  → too large, move R left
  2 + 11 = 13 > 9  → too large, move R left
  2 +  7 =  9 = 9  → FOUND! return [1, 2]

Why two pointers work:
  - sum < target → left value is useless (can never reach target with any smaller R)
  - sum > target → right value is useless (can never reach target with any larger L)
  Each step eliminates one element permanently → O(n) total.`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          {/* ── INTUITION ──────────────────────────────────────────── */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Sorted = Predictable 📏</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Because the array is sorted, moving <strong>left right</strong> increases the sum and moving <strong>right left</strong> decreases it. We can always choose which direction closes in on the target.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">left → bigger sum, right → smaller sum</p>
                    </div>
                    <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Converging Pointers ✂️</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Start with the <strong>widest window</strong> possible (index 0 and end). Each step we eliminate one element — either the leftmost or rightmost — that can never be part of the answer.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">guaranteed to find answer in O(n)</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                  <CodeBlock>{`int[] twoSum(int[] numbers, int target) {
  int left = 0, right = numbers.length - 1;

  while (left < right) {
    int sum = numbers[left] + numbers[right];

    if (sum == target)       return new int[]{ left+1, right+1 };
    else if (sum < target)   left++;   // need bigger
    else                     right--;  // need smaller
  }
  return new int[]{};
}`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                    We never need to revisit a discarded element. If <code>sum &lt; target</code>, the current left value can never pair with any other right to reach the target (since right can only shrink), so we safely advance left.
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "TIME", v: "O(n)", s: "Each pointer moves at most n times" },
                      { l: "SPACE", v: "O(1)", s: "Only two pointer variables" },
                    ].map(({ l, v, s }) => (
                      <div key={l} className="flex-1 rounded-lg p-4 text-center"
                        style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
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

          {/* ── VISUALIZER ─────────────────────────────────────────── */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Configure */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {PRESETS.map(p => (
                      <Button key={p.label} size="sm"
                        variant={numsInput === p.nums && targetInput === p.target ? "flat" : "bordered"}
                        color={numsInput === p.nums && targetInput === p.target ? "primary" : "default"}
                        onPress={() => { setNumsInput(p.nums); setTargetInput(p.target); }}>
                        {p.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Input
                      label="numbers (sorted)" value={numsInput} onValueChange={setNumsInput}
                      variant="bordered" size="sm" className="flex-1"
                      classNames={{ label: "!text-[#4ecca3]" }}
                    />
                    <Input
                      label="target" value={targetInput} onValueChange={setTargetInput}
                      variant="bordered" size="sm" className="w-28"
                      classNames={{ label: "!text-[#f6c90e]" }}
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Debugger */}
              {steps.length > 0 && step && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Step-by-Step</p>
                    <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                      {si + 1}/{steps.length}
                    </p>

                    {/* Status line */}
                    <p className="text-xs text-default-500 mb-4">
                      L=<span className="font-semibold" style={{ color: TEAL }}>{step.left}</span>
                      {" "}({step.nums?.[step.left]}){"  "}·{"  "}
                      R=<span className="font-semibold" style={{ color: GOLD }}>{step.right}</span>
                      {" "}({step.nums?.[step.right]})
                      {step.sum !== null && <>
                        {"  "}·{"  "}sum=<span className="font-semibold" style={{ color: label.color }}>{step.sum}</span>
                        {" "}·{"  "}<span style={{ color: label.color }}>{label.text}</span>
                      </>}
                      {step.phase === 'init' && <span style={{ color: BLUE }}> Initialize pointers</span>}
                    </p>

                    {/* Live code block */}
                    <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", color: "var(--code-text)", border: "1px solid var(--code-border)" }}>

                      <CodeLine highlight={step.phase === 'init'} annotation={step.phase === 'init' ? `left=0, right=${step.nums?.length - 1}` : undefined} annotationColor={BLUE}>
                        <span style={{ color: BLUE }}>int </span>
                        <span style={{ color: "var(--code-muted)" }}>left=</span>
                        <V color={TEAL}>{step.left}</V>
                        <span style={{ color: "var(--code-muted)" }}>, right=</span>
                        <V color={GOLD}>{step.right}</V>
                      </CodeLine>

                      <CodeLine
                        highlight={step.phase === 'too_small' || step.phase === 'too_large' || step.phase === 'found' || step.phase === 'check'}
                        annotation={step.sum !== null ? `${step.nums?.[step.left]} + ${step.nums?.[step.right]} = ${step.sum}` : undefined}
                        annotationColor={step.phase === 'found' ? TEAL : BLUE}>
                        <span style={{ color: "var(--code-muted)" }}>sum = nums[L] + nums[R] → </span>
                        {step.sum !== null ? <V color={step.phase === 'found' ? TEAL : step.phase === 'too_small' ? RED : GOLD}>{step.sum}</V>
                          : <span style={{ color: "var(--code-muted)" }}>—</span>}
                      </CodeLine>

                      <CodeLine highlight={step.phase === 'found'} annotation={step.phase === 'found' ? `return [${step.result}]` : undefined} annotationColor={TEAL}>
                        <span style={{ color: BLUE }}>if </span>
                        <span style={{ color: "var(--code-muted)" }}>sum == target</span>
                        <V color={GOLD}>{target}</V>
                        <span style={{ color: "var(--code-muted)" }}> → return</span>
                      </CodeLine>

                      <CodeLine highlight={step.phase === 'too_small'} annotation={step.phase === 'too_small' ? `${step.sum} < ${target}, left++` : undefined} annotationColor={TEAL}>
                        <span style={{ color: BLUE }}>else if </span>
                        <span style={{ color: "var(--code-muted)" }}>sum &lt; target → </span>
                        <span style={{ color: TEAL }}>left++</span>
                      </CodeLine>

                      <CodeLine highlight={step.phase === 'too_large'} annotation={step.phase === 'too_large' ? `${step.sum} > ${target}, right--` : undefined} annotationColor={GOLD}>
                        <span style={{ color: BLUE }}>else</span>
                        <span style={{ color: "var(--code-muted)" }}> sum &gt; target → </span>
                        <span style={{ color: GOLD }}>right--</span>
                      </CodeLine>
                    </div>

                    {/* Array viz */}
                    <div className="rounded-xl mb-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 text-center pt-3">
                        <span style={{ color: TEAL }}>■ L</span>{"  "}·{"  "}<span style={{ color: GOLD }}>■ R</span>{"  "}·{"  "}target = {target}
                      </p>
                      <ArrayViz nums={step.nums || nums} left={step.left} right={step.right} />
                    </div>

                    {/* Result banner */}
                    {step.phase === 'found' && (
                      <div className="rounded-lg px-4 py-3 mb-4 text-xs font-mono"
                        style={{ background: `${TEAL}15`, border: `1px solid ${TEAL}44`, borderLeft: `3px solid ${TEAL}` }}>
                        <span style={{ color: TEAL }} className="font-bold">✓ Answer: </span>
                        [{step.result[0]}, {step.result[1]}] (1-indexed) —{" "}
                        nums[{step.result[0]-1}] + nums[{step.result[1]-1}] = {step.nums[step.left]} + {step.nums[step.right]} = {target}
                      </div>
                    )}

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

          {/* ── CODE ───────────────────────────────────────────────── */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Java — Two Pointer Solution</p>
                  <CodeBlock>{`class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;

        while (left < right) {
            int sum = numbers[left] + numbers[right];

            if (sum == target) {
                return new int[]{ left + 1, right + 1 }; // 1-indexed
            } else if (sum < target) {
                left++;   // sum too small, move left forward
            } else {
                right--;  // sum too large, move right back
            }
        }

        return new int[]{};  // guaranteed answer exists per problem constraints
    }
}`}</CodeBlock>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                  <div className="flex flex-col divide-y divide-divider">
                    {[
                      { line: "left = 0, right = n-1",   exp: "Start with widest possible window — indices at both ends of the sorted array." },
                      { line: "while (left < right)",     exp: "Stop when pointers meet. If they crossed, no valid pair exists (but problem guarantees one)." },
                      { line: "sum = nums[L] + nums[R]",  exp: "Compute current candidate sum. Sorted array means this is the min/max reachable from this window." },
                      { line: "sum == target",            exp: "Found it. Return 1-indexed positions as required by the problem." },
                      { line: "sum < target → left++",    exp: "Current left value is too small paired with any right ≤ current right. Discard it permanently." },
                      { line: "sum > target → right--",   exp: "Current right value is too large paired with any left ≥ current left. Discard it permanently." },
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
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Pattern Memorization</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { icon: "📏", color: TEAL, tip: "Two pointers only works because the array is SORTED. Never apply this pattern to an unsorted array." },
                      { icon: "✂️", color: GOLD, tip: "Each step eliminates one element forever. If sum < target, left can never be the answer with any remaining right." },
                      { icon: "🔢", color: BLUE, tip: "Return 1-indexed! The problem specifies 1-based indices. Easy to forget under pressure." },
                      { icon: "🔁", color: TEAL, tip: "Related: 3Sum (sort + two pointers for each fixed element), Container With Most Water (same converging logic)." },
                      { icon: "⚡", color: GOLD, tip: "O(1) space advantage over HashMap Two Sum — use this when the array is already sorted or you can sort it." },
                    ].map(({ icon, color, tip }) => (
                      <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                        style={{ background: "var(--viz-surface)", border: `1px solid var(--viz-border)`, borderLeft: `3px solid ${color}` }}>
                        <span className="text-base">{icon}</span>
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
