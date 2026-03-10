export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED  = "#ff6b6b";

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
  if (nums.length === 0) return [];

  const steps = [];
  let maxReach = 0;
  const goal = nums.length - 1;

  steps.push({
    i: -1, maxReach: 0, action: 'init',
    desc: `Initialize: maxReach=0, goal=${goal}`
  });

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) {
      steps.push({
        i, maxReach, action: 'unreachable', reachable: false,
        desc: `Index ${i} > maxReach (${maxReach}) — cannot reach here. Return false.`
      });
      return steps;
    }

    const prevMax = maxReach;
    maxReach = Math.max(maxReach, i + nums[i]);

    if (maxReach >= goal) {
      steps.push({
        i, maxReach, action: 'success', reachable: true, prevMax, num: nums[i],
        desc: `At [${i}]=${nums[i]}: maxReach = max(${prevMax}, ${i}+${nums[i]}) = ${maxReach} ≥ goal(${goal}) → true!`
      });
      return steps;
    }

    steps.push({
      i, maxReach, action: 'check', num: nums[i], reachable: true, prevMax,
      desc: `At [${i}]=${nums[i]}: maxReach = max(${prevMax}, ${i}+${nums[i]}) = ${maxReach}`
    });
  }

  steps.push({ i: -1, maxReach, action: 'done', reachable: true, desc: `Loop done. maxReach=${maxReach} ≥ goal(${goal}). Return true.` });
  return steps;
}

function ArrayViz({ nums, currentIdx, maxReach, goal }) {
  const maxVal = Math.max(...nums, 1);
  const HEIGHT = 80;
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-end gap-2 justify-center p-4" style={{ minWidth: 'max-content' }}>
        {nums.map((num, i) => {
          const barH = Math.max((num / maxVal) * HEIGHT, 4);
          const isGoal = i === goal;
          const isReachable = i <= maxReach;
          const isCurrent = i === currentIdx;
          let bg = isReachable ? "var(--viz-surface)" : `${RED}22`;
          if (isCurrent) bg = GOLD + "cc";
          if (isGoal) bg = `${TEAL}44`;
          let border = isReachable ? "var(--viz-border)" : RED;
          if (isCurrent) border = GOLD;
          if (isGoal) border = TEAL;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="transition-all rounded-t"
                style={{
                  width: '32px', height: barH,
                  background: bg, border: `2px solid ${border}`,
                  boxShadow: isCurrent ? `0 0 8px ${GOLD}66` : isGoal ? `0 0 8px ${TEAL}66` : 'none'
                }}
              />
              <span className="text-xs font-mono font-bold">{num}</span>
              <span className="text-[9px]" style={{ color: 'var(--viz-muted)' }}>{i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PRESETS = [
  { label: "LC Example 1", val: "2,3,1,1,4" },
  { label: "LC Example 2", val: "3,2,1,0,4" },
  { label: "Long Jump", val: "5,0,0,0,0,0" },
  { label: "All Zeros", val: "0,1,2" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [input, setInput] = useState("2,3,1,1,4");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    setSteps(simulate(input));
    setSi(0);
  }, [input]);

  const step = steps[si] || null;
  const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const goal = nums.length - 1;
  const finalStep = steps[steps.length - 1];

  const actionColor = step?.action === 'success' || step?.action === 'done' ? TEAL
    : step?.action === 'unreachable' ? RED
    : BLUE;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🦘</span>
        <h1 className="font-semibold text-base">Jump Game</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="success" variant="flat">Greedy</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">

          {/* PROBLEM */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given an integer array <code>nums</code>, where <code>nums[i]</code> is the maximum jump length
                  from index <code>i</code>, return <strong>true</strong> if you can reach the last index,
                  starting from index 0, or <strong>false</strong> otherwise.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "boolean canJump(int[] nums)", desc: "Can we reach index nums.length-1? Constraints: 1 ≤ nums.length ≤ 10⁴; 0 ≤ nums[i] ≤ 10⁵" },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — Reachable vs Blocked</p>
                <CodeBlock language="text">{`Example 1: nums = [2, 3, 1, 1, 4]
  i=0: maxReach = max(0, 0+2) = 2
  i=1: maxReach = max(2, 1+3) = 4  ← 4 >= goal(4), return true

Example 2: nums = [3, 2, 1, 0, 4]
  i=0: maxReach = max(0, 0+3) = 3
  i=1: maxReach = max(3, 1+2) = 3
  i=2: maxReach = max(3, 2+1) = 3
  i=3: maxReach = max(3, 3+0) = 3
  i=4: 4 > maxReach(3) → BLOCKED, return false`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          {/* INTUITION */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Track Farthest Reach</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Keep the <strong>maximum index we can ever reach</strong>. At each position, greedily extend it as far as possible.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">maxReach = max(maxReach, i + nums[i])</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Detect Blockage</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      If we ever step onto an index beyond <code>maxReach</code>, we're stuck — no combination of jumps can get us past this point.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">if (i &gt; maxReach) return false</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm</p>
                <CodeBlock>{`boolean canJump(int[] nums) {
  int maxReach = 0;

  for (int i = 0; i < nums.length; i++) {
    if (i > maxReach) return false; // blocked

    maxReach = Math.max(maxReach, i + nums[i]);

    if (maxReach >= nums.length - 1) return true;
  }

  return true;
}`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  Greedy works because reaching as far as possible always dominates. We never need to track which exact jump sequence we take — just whether the farthest reachable point keeps growing.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(n)", s: "Single pass" },
                    { l: "SPACE", v: "O(1)", s: "One variable" }
                  ].map(({ l, v, s }) => (
                    <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-500 mb-1">{l}</p>
                      <p className="font-bold text-base" style={{ color: TEAL }}>{v}</p>
                      <p className="text-xs text-default-400 mt-1">{s}</p>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
            </div>
          </Tab>

          {/* VISUALIZER */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

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
                  label="Array (comma-separated)"
                  value={input}
                  onValueChange={setInput}
                  placeholder="e.g., 2,3,1,1,4"
                  variant="bordered"
                  size="sm"
                />
              </CardBody></Card>

              {steps.length > 0 && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Step-by-Step</p>

                  {/* Step pills */}
                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {steps.map((s, i) => (
                      <button key={i} onClick={() => setSi(i)}
                        style={{
                          background: i === si ? TEAL : "var(--viz-surface)",
                          border: `1px solid ${i === si ? TEAL : "var(--viz-border)"}`,
                          color: i === si ? "#0b0f0e" : undefined
                        }}
                        className="px-2.5 py-1 rounded text-xs cursor-pointer">
                        #{i + 1}
                      </button>
                    ))}
                  </div>

                  {/* Status line */}
                  <p className="text-xs text-default-500 mb-4">
                    Index: <V color={TEAL}>{step?.i >= 0 ? step.i : '—'}</V> ·
                    maxReach: <V color={GOLD}>{step?.maxReach ?? 0}</V> ·
                    goal: <V color={BLUE}>{goal}</V> ·
                    {step?.action === 'success' || step?.action === 'done'
                      ? <V color={TEAL}>✓ reachable</V>
                      : step?.action === 'unreachable'
                        ? <V color={RED}>✗ blocked</V>
                        : null}
                  </p>

                  {/* Live code block */}
                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step?.action === 'init'}
                      annotation={step?.action === 'init' ? "maxReach = 0" : undefined}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>int maxReach = 0</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.action === 'unreachable'}
                      annotation={step?.action === 'unreachable' ? `${step.i} > ${step.maxReach} → false` : undefined}
                      annotationColor={RED}>
                      <span style={{ color: "var(--code-muted)" }}>{"  "}if (i &gt; maxReach) return false</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.action === 'check' || step?.action === 'success'}
                      annotation={(step?.action === 'check' || step?.action === 'success') ? `max(${step.prevMax}, ${step.i}+${step.num}) = ${step.maxReach}` : undefined}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>{"  "}maxReach = Math.max(maxReach, i + nums[i])</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.action === 'success'}
                      annotation={step?.action === 'success' ? `${step.maxReach} >= ${goal} → true!` : undefined}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>{"  "}if (maxReach &gt;= nums.length - 1) return true</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.action === 'done'}
                      annotation={step?.action === 'done' ? "true" : undefined}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>return true</span>
                    </CodeLine>
                  </div>

                  {/* Array Viz */}
                  <div className="rounded-xl p-4 mb-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3">
                      <span style={{ color: GOLD }}>■</span> current &nbsp;
                      <span style={{ color: TEAL }}>■</span> goal &nbsp;
                      <span style={{ color: RED }}>■</span> unreachable
                    </p>
                    {nums.length > 0 && (
                      <ArrayViz nums={nums} currentIdx={step?.i} maxReach={step?.maxReach ?? 0} goal={goal} />
                    )}
                    <div className="flex gap-3 mt-2">
                      <div className="flex-1 rounded-lg p-3 text-center" style={{ background: `${GOLD}0d`, border: `1px solid ${GOLD}33` }}>
                        <p className="text-xs text-default-500 mb-1">maxReach</p>
                        <p className="font-bold" style={{ color: GOLD }}>{step?.maxReach ?? 0}</p>
                      </div>
                      <div className="flex-1 rounded-lg p-3 text-center" style={{ background: `${TEAL}0d`, border: `1px solid ${TEAL}33` }}>
                        <p className="text-xs text-default-500 mb-1">goal</p>
                        <p className="font-bold" style={{ color: TEAL }}>{goal}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step description */}
                  <div className="rounded-lg px-4 py-3 text-sm font-mono mb-4" style={{ borderLeft: `3px solid ${actionColor}`, background: "var(--viz-surface)" }}>
                    {step?.desc}
                  </div>

                  {/* Prev / Next */}
                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0} onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                    <span className="text-xs self-center whitespace-nowrap">{si + 1} / {steps.length}</span>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1} onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                  </div>
                </CardBody></Card>
              )}

              {/* Final State */}
              {finalStep && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Final Result</p>
                  <div className="rounded-xl p-6 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    {finalStep.reachable !== false
                      ? <><p className="text-4xl font-bold mb-1" style={{ color: TEAL }}>✓ true</p><p className="text-sm text-default-500">Can reach the last index</p></>
                      : <><p className="text-4xl font-bold mb-1" style={{ color: RED }}>✗ false</p><p className="text-sm text-default-500">Cannot reach the last index</p></>
                    }
                  </div>
                </CardBody></Card>
              )}
            </div>
          </Tab>

          {/* CODE */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Java Solution</p>
                <CodeBlock>{`class Solution {
  public boolean canJump(int[] nums) {
    int maxReach = 0;

    for (int i = 0; i < nums.length; i++) {
      // If current index is beyond our reach, we're stuck
      if (i > maxReach) return false;

      // Greedily extend our reach
      maxReach = Math.max(maxReach, i + nums[i]);

      // Early exit: already reached the end
      if (maxReach >= nums.length - 1) return true;
    }

    return true;
  }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "int maxReach = 0", exp: "Start able to reach only index 0. We'll extend this as we find longer jumps." },
                    { line: "if (i > maxReach) return false", exp: "If we've stepped past our maximum reachable index, no combination of prior jumps can get us here. Blocked." },
                    { line: "maxReach = Math.max(..., i + nums[i])", exp: "From index i we can jump up to nums[i] steps. Greedily take the farthest possible option." },
                    { line: "if (maxReach >= nums.length - 1)", exp: "Early exit — as soon as we can theoretically reach the last index, we're done. No need to continue." },
                    { line: "return true (end of loop)", exp: "If we exit the loop normally (no blockage detected), we've covered all reachable indices successfully." },
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
                    { icon: "📍", color: TEAL, tip: "Greedy: track a single running maximum (maxReach). Never need to backtrack or try different jump sequences." },
                    { icon: "⚠️", color: GOLD, tip: "Common mistake: using DP with O(n²) — checking all previous positions that can reach i. The O(n) greedy is simpler and better." },
                    { icon: "🔄", color: BLUE, tip: "Jump Game II (LC 45) asks for the minimum jumps — that uses a similar 'current reach' + 'next reach' greedy with O(n)." },
                    { icon: "💡", color: TEAL, tip: "Key greedy argument: if maxReach can cover a position, we can always find some valid jump path. We don't need the exact path." },
                    { icon: "🎯", color: GOLD, tip: "Edge cases: nums=[0] (already at goal, true), nums=[0,1] (blocked at 0, false), nums=[1,0] (true, one jump reaches end)." },
                  ].map(({ icon, color, tip }) => (
                    <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                      style={{ background: "var(--viz-surface)", border: `1px solid var(--viz-border)`, borderLeft: `3px solid ${color}` }}>
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
