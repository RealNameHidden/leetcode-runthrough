export const difficulty = 'Medium';

import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { ArtifactRevisedButton } from '../../../src/ArtifactRevisedButton';
import { ArtifactTabs, Tab } from '../../../src/ArtifactTabs';
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

// ── Colors ──────────────────────────────────────────────────────────
const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED = "#ff6b6b";

// ── Inline components ───────────────────────────────────────────────
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

// ── Array visualization with highlights ─────────────────────────────
function ArrayViz({ arr, left, right, mid, minIdx }) {
  return (
    <div className="flex gap-1 justify-center flex-wrap mb-3">
      {arr.map((val, i) => {
        let borderColor = "var(--viz-border)";
        let bg = "var(--viz-node-bg)";

        if (i === minIdx) {
          borderColor = TEAL;
          bg = `${TEAL}22`;
        } else if (i === mid) {
          borderColor = GOLD;
          bg = `${GOLD}22`;
        } else if (i >= left && i <= right) {
          borderColor = BLUE;
          bg = `${BLUE}15`;
        } else {
          opacity: 0.4;
        }

        return (
          <div
            key={i}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-lg text-sm font-bold"
            style={{
              border: `2px solid ${borderColor}`,
              background: bg,
              color: "var(--viz-text)",
              opacity: (i < left || i > right) && i !== minIdx ? 0.4 : 1,
            }}
          >
            {val}
            <span className="text-[10px] text-default-400 mt-0.5">
              {i === mid ? "mid" : i === left ? "L" : i === right ? "R" : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Algorithm simulation ────────────────────────────────────────────
function simulate(arr) {
  const steps = [];
  let left = 0, right = arr.length - 1;

  steps.push({
    left, right, mid: null,
    event: `Initialize: left=0, right=${arr.length - 1}`,
    comparison: null
  });

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    const comparison = arr[mid] > arr[right] ? ">" : "≤";

    steps.push({
      left, right, mid,
      event: `mid = ${left} + (${right} - ${left}) / 2 = ${mid}`,
      comparison: null
    });

    steps.push({
      left, right, mid,
      event: `nums[${mid}] = ${arr[mid]}, nums[${right}] = ${arr[right]} → ${arr[mid]} ${comparison} ${arr[right]}`,
      comparison
    });

    if (arr[mid] > arr[right]) {
      left = mid + 1;
      steps.push({
        left, right: right, mid,
        event: `nums[mid] > nums[right] → min is to the right. left = ${mid + 1}`,
        comparison: ">"
      });
    } else {
      right = mid;
      steps.push({
        left: left, right: mid, mid,
        event: `nums[mid] ≤ nums[right] → min could be at mid or left. right = ${mid}`,
        comparison: "≤"
      });
    }
  }

  steps.push({
    left, right, mid: null,
    event: `Found: left == right at index ${left}. Minimum = ${arr[left]}`,
    comparison: null
  });

  return steps;
}

export default function App() {
  const [si, setSi] = useState(0);
  const [sim, setSim] = useState(null);
  const [arrStr, setArrStr] = useState("3,4,5,1,2");

  const PRESETS = [
    { label: "LC Example", arr: [3, 4, 5, 1, 2] },
    { label: "Simple", arr: [1, 2, 3] },
    { label: "One Rotation", arr: [2, 1] },
    { label: "Large Rotation", arr: [4, 5, 6, 7, 0, 1, 2] },
  ];

  const applyPreset = (preset) => {
    const s = simulate(preset.arr);
    setSim({ arr: preset.arr, steps: s });
    setSi(0);
    setArrStr(preset.arr.join(','));
  };

  const parseCustom = (str) => {
    const arr = str.split(',').map(x => parseInt(x.trim())).filter(n => !isNaN(n));
    if (arr.length > 0) {
      const s = simulate(arr);
      setSim({ arr, steps: s });
      setSi(0);
    }
    setArrStr(str);
  };

  useEffect(() => {
    applyPreset(PRESETS[0]);
  }, []);

  if (!sim) return null;
  const step = sim.steps[si];
  const minIdx = sim.arr.findIndex((v, i) => {
    if (step.left <= i && i <= step.right) return true;
    return false;
  });

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🔍</span>
        <h1 className="font-semibold text-base">Find Minimum in Rotated Sorted Array</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Binary Search</Chip>
      </div>

      {/* Tabs */}
      <ArtifactTabs className="flex-1 px-6 py-4">
        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 0: PROBLEM */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Tab key="problem" title="Problem">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Suppose an array of length <span style={{ color: TEAL, fontWeight: "bold" }}>n</span> sorted in ascending order is <span style={{ color: TEAL, fontWeight: "bold" }}>rotated</span> between 1 and n times at some unknown pivot. For example, the array <code>[0,1,2,4,5,6,7]</code> might become <code>[4,5,6,7,0,1,2]</code> if rotated 4 times.
                </p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given the rotated array, find the <strong>minimum element</strong>. You must write an algorithm that runs in <span style={{ color: TEAL, fontWeight: "bold" }}>O(log n)</span> time.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "int findMin(int[] nums)", desc: "Return the minimum element in a rotated sorted array of distinct integers." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-0 flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — Rotated at Pivot</p>
                <CodeBlock language="text">{`Input: nums = [3,4,5,1,2]
Output: 1

Explanation:
  Original sorted: [1,2,3,4,5]
  Rotated by 3: [3,4,5,1,2]
  Minimum is 1`}</CodeBlock>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — Rotated Once</p>
                <CodeBlock language="text">{`Input: nums = [2,1]
Output: 1

Explanation:
  Original: [1,2]
  Rotated by 1: [2,1]
  Minimum is 1`}</CodeBlock>
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 1: INTUITION */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Tab key="intuition" title="Intuition">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Rotation Property</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      A rotated sorted array has <strong>two sorted subarrays</strong>. The minimum is always at the pivot point (where the rotation happens).
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">[4,5,6,7] | [0,1,2]</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Smart Comparison</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Compare <code>nums[mid]</code> with <code>nums[right]</code> (not left). If mid &gt; right, the rotation point is to the right. Otherwise, it's at or to the left.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">mid vs right = key</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Why Compare with Right?</p>
                <div className="flex flex-col gap-3">
                  <div className="rounded-lg p-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs font-bold text-default-500 mb-2">Right Subarray is Always Sorted</p>
                    <p className="text-sm text-default-500 leading-relaxed">
                      In a rotated array, <span style={{ color: GOLD, fontWeight: "bold" }}>the right side from any point is always in sorted order</span> (no pivot). So <code>nums[right]</code> is always the largest in the right subarray, making it a reliable boundary.
                    </p>
                  </div>
                  <CodeBlock language="text">{`Array:    [4,5,6,7 | 0,1,2]
                                  ↑
                        Right is always sorted
If nums[mid] > nums[right]: pivot is to the right
If nums[mid] ≤ nums[right]: pivot is at/left of mid`}</CodeBlock>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock language="java">{`int left = 0, right = nums.length - 1;

while (left < right) {
  int mid = left + (right - left) / 2;

  if (nums[mid] > nums[right]) {
    // Pivot is to the right
    left = mid + 1;
  } else {
    // Pivot is at or to the left
    right = mid;
  }
}

return nums[left];`}</CodeBlock>

                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key Insight: </span>
                  When <code>nums[mid] ≤ nums[right]</code>, set <code>right = mid</code> (not <code>mid - 1</code>), because mid itself could be the minimum.
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3">
                  {[{ l: "TIME", v: "O(log n)", s: "Binary search: halve search space each iteration" }, { l: "SPACE", v: "O(1)", s: "Only constant pointers, no extra structures" }].map(({ l, v, s }) => (
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

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 2: VISUALIZER */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Tab key="visualizer" title="Visualizer">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {PRESETS.map((p) => (
                    <Button
                      key={p.label}
                      size="sm"
                      variant={JSON.stringify(sim.arr) === JSON.stringify(p.arr) ? "flat" : "bordered"}
                      color={JSON.stringify(sim.arr) === JSON.stringify(p.arr) ? "primary" : "default"}
                      onPress={() => applyPreset(p)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <Input
                  label="Custom array (comma-separated)"
                  value={arrStr}
                  onValueChange={parseCustom}
                  placeholder="3,4,5,1,2"
                  variant="bordered"
                  size="sm"
                />
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Binary Search</p>

                <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                  {si + 1}/{sim.steps.length}
                </p>

                <p className="text-xs text-default-500 mb-4">{step.event}</p>

                <div className="rounded-xl p-5 mb-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                  <p className="text-xs text-default-400 mb-3 text-center">Array (search space: <V color={BLUE}>[{step.left}...{step.right}]</V>)</p>
                  <ArrayViz arr={sim.arr} left={step.left} right={step.right} mid={step.mid} minIdx={sim.arr.length - 1} />

                  {step.mid !== null && (
                    <div className="mt-4 pt-3 border-t border-divider text-xs text-default-500 space-y-1">
                      <p><strong>nums[{step.mid}]:</strong> <V color={GOLD}>{sim.arr[step.mid]}</V></p>
                      <p><strong>nums[{step.right}]:</strong> <V color={GOLD}>{sim.arr[step.right]}</V></p>
                      {step.comparison && (
                        <p style={{ color: step.comparison === ">" ? RED : TEAL }}>
                          <strong>Comparison:</strong> {sim.arr[step.mid]} <V color={step.comparison === ">" ? RED : TEAL}>{step.comparison}</V> {sim.arr[step.right]}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
                    onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                  <Button fullWidth color="primary" size="sm" isDisabled={si === sim.steps.length - 1}
                    onPress={() => setSi(i => Math.min(sim.steps.length - 1, i + 1))}>Next →</Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Final Result</p>
                <div className="text-center py-6 rounded-lg" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                  <p className="text-xs text-default-500 mb-2">Minimum Found</p>
                  <p style={{ fontSize: 32, fontWeight: "bold", color: TEAL }}>
                    {sim.arr[sim.arr.indexOf(Math.min(...sim.arr))]}
                  </p>
                  <p className="text-xs text-default-400 mt-2">at index {sim.arr.indexOf(Math.min(...sim.arr))}</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 3: CODE */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Tab key="code" title="Code">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
            <ArtifactRevisedButton />

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Solution</p>
                <CodeBlock language="java">{`class Solution {
  public int findMin(int[] nums) {
    int left = 0;
    int right = nums.length - 1;

    // Shrink search space until left == right
    while (left < right) {
      int mid = left + (right - left) / 2;

      // Key: compare mid with right (not left)
      if (nums[mid] > nums[right]) {
        // Pivot is to the right
        left = mid + 1;
      } else {
        // Pivot is at or to the left; include mid
        right = mid;
      }
    }

    return nums[left];
  }
}`}</CodeBlock>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "int left = 0, right = nums.length - 1", exp: "Initialize pointers to array boundaries." },
                    { line: "while (left < right)", exp: "Continue until pointers converge; when left == right, we've found the minimum." },
                    { line: "int mid = left + (right - left) / 2", exp: "Compute mid without overflow. Avoids integer overflow on large indices." },
                    { line: "if (nums[mid] > nums[right])", exp: "If mid is larger than right, the pivot (minimum) is definitely to the right." },
                    { line: "left = mid + 1", exp: "Exclude mid since it's not the minimum. Move left boundary to mid + 1." },
                    { line: "right = mid", exp: "If mid ≤ right, the minimum could be at mid or left. Include mid by setting right = mid." },
                    { line: "return nums[left]", exp: "When loop ends, left == right and points to the minimum element." },
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
                    { icon: "📍", color: TEAL, tip: "Always compare mid with RIGHT in rotated array problems. Right is always in correct sorted order." },
                    { icon: "⚠️", color: GOLD, tip: "When nums[mid] ≤ nums[right], use right = mid (not mid-1). Mid could be the answer." },
                    { icon: "🔄", color: BLUE, tip: "Related: Search in Rotated Sorted Array (find a target), Find Peak in Mountain Array (similar concept)." },
                    { icon: "💡", color: TEAL, tip: "The rotation point (pivot) is where the array breaks from sorted to smaller values." },
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
      </ArtifactTabs>
    </div>
  );
}
