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
  const raw = numsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (raw.length === 0) return [];

  const set = new Set(raw);
  const sorted = [...set].sort((a, b) => a - b);
  const steps = [];
  let maxLen = 0;
  let bestChain = [];

  // Initial step: show all numbers loaded into set
  steps.push({
    phase: 'init',
    sorted,
    current: null,
    chain: [],
    maxLen,
    bestChain: [],
    isStart: false,
    desc: `Add all ${raw.length} numbers to HashSet → ${set.size} unique: {${sorted.join(', ')}}`,
  });

  for (const num of sorted) {
    // Check if num is a sequence start
    const isStart = !set.has(num - 1);

    if (!isStart) {
      steps.push({
        phase: 'skip',
        sorted,
        current: num,
        chain: [],
        maxLen,
        bestChain: [...bestChain],
        isStart: false,
        desc: `Skip ${num}: set contains ${num - 1}, so ${num} is NOT a sequence start`,
      });
      continue;
    }

    // num is a sequence start — count chain length
    let cur = num;
    let len = 1;
    const chain = [num];

    steps.push({
      phase: 'start',
      sorted,
      current: num,
      chain: [...chain],
      maxLen,
      bestChain: [...bestChain],
      isStart: true,
      desc: `${num} IS a sequence start (${num - 1} not in set). Begin counting...`,
    });

    while (set.has(cur + 1)) {
      cur++;
      len++;
      chain.push(cur);
      steps.push({
        phase: 'extend',
        sorted,
        current: num,
        chain: [...chain],
        maxLen,
        bestChain: [...bestChain],
        isStart: true,
        extendTo: cur,
        desc: `Extend: ${cur} is in set → chain [${chain.join(', ')}], length = ${len}`,
      });
    }

    const prevMax = maxLen;
    if (len > maxLen) {
      maxLen = len;
      bestChain = [...chain];
    }

    steps.push({
      phase: 'counted',
      sorted,
      current: num,
      chain: [...chain],
      maxLen,
      bestChain: [...bestChain],
      isStart: true,
      len,
      improved: len > prevMax,
      desc: `Sequence [${chain.join(',')}] has length ${len}. ${len > prevMax ? `New best! maxLen = ${len}` : `No improvement. maxLen stays ${maxLen}`}`,
    });
  }

  steps.push({
    phase: 'result',
    sorted,
    current: null,
    chain: [],
    maxLen,
    bestChain: [...bestChain],
    isStart: false,
    desc: `Longest consecutive sequence: [${bestChain.join(', ')}] — length ${maxLen}`,
  });

  return steps;
}

const PRESETS = [
  { label: "LC Example 1", val: "100,4,200,1,3,2" },
  { label: "LC Example 2", val: "0,3,7,2,5,8,4,6,0,1" },
  { label: "With Gap", val: "1,2,3,10,11,12,13" },
  { label: "Single Start", val: "9,1,4,7,3,2" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [input, setInput] = useState("100,4,200,1,3,2");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    setSteps(simulate(input));
    setSi(0);
  }, [input]);

  const step = steps[si] || null;

  function getNumColor(n) {
    if (!step) return "var(--viz-border)";
    const { phase, current, chain, bestChain } = step;
    if (phase === 'result') {
      return bestChain.includes(n) ? TEAL : "var(--viz-border)";
    }
    if (chain.includes(n)) return TEAL;
    if (n === current && phase === 'skip') return GOLD;
    if (bestChain.includes(n) && phase !== 'skip') return `${TEAL}66`;
    return "var(--viz-border)";
  }

  function getNumBg(n) {
    if (!step) return "var(--viz-node-bg)";
    const { phase, current, chain, bestChain } = step;
    if (phase === 'result') {
      return bestChain.includes(n) ? `${TEAL}22` : "var(--viz-node-bg)";
    }
    if (chain.includes(n)) return `${TEAL}22`;
    if (n === current && phase === 'skip') return `${GOLD}22`;
    return "var(--viz-node-bg)";
  }

  function getNumTextColor(n) {
    if (!step) return "var(--viz-muted)";
    const { phase, chain, bestChain } = step;
    if (phase === 'result') return bestChain.includes(n) ? TEAL : "var(--viz-muted)";
    if (chain.includes(n)) return TEAL;
    if (step.current === n && phase === 'skip') return GOLD;
    return "var(--viz-muted)";
  }

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🔗</span>
        <h1 className="font-semibold text-base">Longest Consecutive Sequence</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Arrays · HashSet</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">

          {/* PROBLEM TAB */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given an unsorted array of integers <strong>nums</strong>, return the length of the
                  longest consecutive elements sequence. You must write an algorithm that runs in{" "}
                  <strong>O(n)</strong> time.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      sig: "int longestConsecutive(int[] nums)",
                      desc: "Return the length of the longest run of consecutive integers. Elements need not be adjacent or sorted in the input array.",
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
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example 1 — nums = [100,4,200,1,3,2]</p>
                <CodeBlock language="text">{`Input:  [100, 4, 200, 1, 3, 2]
Output: 4

Consecutive sequences:
  [1, 2, 3, 4]  → length 4  ← longest!
  [100]         → length 1
  [200]         → length 1

Approach: Sort → O(n log n). We need O(n)!`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example 2 — nums = [0,3,7,2,5,8,4,6,0,1]</p>
                <CodeBlock language="text">{`Input:  [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]
Output: 9

After deduplication set = {0,1,2,3,4,5,6,7,8}
Consecutive sequence: [0,1,2,3,4,5,6,7,8] → length 9

Key: duplicates are handled automatically by the HashSet.`}</CodeBlock>
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
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Start Detection</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      A number <code>n</code> is a <em>sequence start</em> only if <code>n-1</code> is{" "}
                      <strong>NOT</strong> in the set. This avoids counting the same sequence multiple
                      times from different entry points — only the leftmost element triggers counting.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">!set.contains(num - 1)</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>O(1) Lookup via HashSet</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Load all numbers into a HashSet first. Then each "is the next number present?"
                      check is <strong>O(1)</strong> average. Although we have a nested while-loop,
                      each number is visited at most <em>twice total</em> — once as a possible start,
                      once as a chain extension.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">set.contains(cur + 1) → O(1)</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`// 1. Load all numbers into a HashSet for O(1) lookup
Set<Integer> set = new HashSet<>();
for (int num : nums) set.add(num);

int maxLen = 0;

// 2. Only start counting at the BEGINNING of a sequence
for (int num : set) {
    if (!set.contains(num - 1)) {  // num is a sequence start
        int cur = num;
        int len = 1;
        while (set.contains(cur + 1)) {
            cur++;
            len++;
        }
        maxLen = Math.max(maxLen, len);
    }
}
return maxLen;`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  The while-loop looks like it could make this O(n²), but each number can only ever
                  be the "start" of one sequence and can only be traversed in one chain. Across all
                  iterations, each number is visited at most twice → O(n) total.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(n)", s: "Each element added once to set, and traversed at most once in a chain" },
                    { l: "SPACE", v: "O(n)", s: "HashSet stores all unique integers from the input" },
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
                  placeholder="e.g., 100,4,200,1,3,2"
                  variant="bordered"
                  size="sm"
                />
                <div className="mt-3 flex gap-4 flex-wrap text-xs text-default-400">
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: `${TEAL}22`, border: `1px solid ${TEAL}` }} /> active chain</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: `${GOLD}22`, border: `1px solid ${GOLD}` }} /> skipped (not a start)</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "var(--viz-node-bg)", border: "1px solid var(--viz-border)" }} /> not yet visited</span>
                </div>
              </CardBody></Card>

              {/* Step-by-Step Debugger */}
              {steps.length > 0 && step && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Execution</p>

                  <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>{si + 1}/{steps.length}</p>

                  {/* Status line */}
                  <p className="text-xs text-default-500 mb-4">
                    {step.phase === 'init' && <><span style={{ color: BLUE }} className="font-bold">INIT</span> · HashSet loaded with <V color={BLUE}>{step.sorted.length}</V> unique numbers</>}
                    {step.phase === 'skip' && <>Checking <V color={GOLD}>{step.current}</V> · {step.current - 1} is in set → <span style={{ color: GOLD }} className="font-bold">SKIP</span> (not a start)</>}
                    {step.phase === 'start' && <>Checking <V color={TEAL}>{step.current}</V> · {step.current - 1} NOT in set → <span style={{ color: TEAL }} className="font-bold">SEQUENCE START</span></>}
                    {step.phase === 'extend' && <>Extending chain from <V color={TEAL}>{step.current}</V> · Found <V color={TEAL}>{step.extendTo}</V> · Length: <V color={TEAL}>{step.chain.length}</V></>}
                    {step.phase === 'counted' && <>Sequence complete · Length: <V color={step.improved ? TEAL : GOLD}>{step.len}</V> · Max: <V color={TEAL}>{step.maxLen}</V></>}
                    {step.phase === 'result' && <><span style={{ color: TEAL }} className="font-bold">DONE</span> · Longest: <V color={TEAL}>{step.maxLen}</V></>}
                  </p>

                  {/* Live Code Block */}
                  <div className="rounded-xl overflow-hidden mb-4"
                    style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step.phase === 'init'}
                      annotation={step.phase === 'init' ? `set size = ${step.sorted.length}` : ''}
                      annotationColor={BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>for (int num : nums) set.add(num)</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'skip' || step.phase === 'start'}
                      annotation={step.phase === 'skip' ? `${step.current - 1} in set → skip` : step.phase === 'start' ? `${step.current - 1} NOT in set → start!` : ''}
                      annotationColor={step.phase === 'skip' ? GOLD : TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>if (!set.contains(num - 1))</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'extend'}
                      annotation={step.phase === 'extend' ? `cur+1=${step.extendTo} ✓ in set` : ''}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>while (set.contains(cur + 1)) cur++</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'counted'}
                      annotation={step.phase === 'counted' ? `maxLen = max(${step.maxLen}, ${step.len}) = ${step.maxLen}` : ''}
                      annotationColor={step.improved ? TEAL : GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>maxLen = Math.max(maxLen, len)</span>
                    </CodeLine>
                  </div>

                  {/* Number line visualization */}
                  <div className="rounded-xl p-4 mb-4 overflow-x-auto"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3 text-center">
                      HashSet (sorted for display) · Active chain highlighted in{" "}
                      <span style={{ color: TEAL }}>teal</span>
                    </p>

                    {/* Number boxes */}
                    <div className="flex gap-2 flex-wrap justify-center mb-4">
                      {step.sorted.map((n, i) => {
                        const inChain = step.chain.includes(n);
                        const isSkipped = n === step.current && step.phase === 'skip';
                        const inBest = step.bestChain.includes(n) && step.phase !== 'skip' && !inChain;
                        const borderColor = getNumColor(n);
                        const bg = getNumBg(n);
                        const textColor = getNumTextColor(n);
                        const isChainStart = step.chain.length > 0 && n === step.chain[0];

                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div
                              className="w-10 h-10 flex items-center justify-center rounded-lg font-mono text-sm font-bold transition-all"
                              style={{
                                background: bg,
                                border: `2px solid ${borderColor}`,
                                color: textColor,
                                boxShadow: inChain ? `0 0 8px ${TEAL}55` : "none",
                              }}
                            >
                              {n}
                            </div>
                            {isChainStart && (
                              <div className="text-[9px] mt-1 font-bold" style={{ color: TEAL }}>START</div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Chain display */}
                    {step.chain.length > 0 && (
                      <div className="text-center">
                        <p className="text-[10px] text-default-400 mb-2">Current chain:</p>
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {step.chain.map((n, i) => (
                            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span className="font-mono text-sm font-bold px-2 py-1 rounded"
                                style={{ background: `${TEAL}22`, color: TEAL, border: `1px solid ${TEAL}55` }}>
                                {n}
                              </span>
                              {i < step.chain.length - 1 && (
                                <span className="text-xs" style={{ color: TEAL }}>→</span>
                              )}
                            </span>
                          ))}
                          <span className="text-xs font-mono ml-2" style={{ color: TEAL }}>
                            (len={step.chain.length})
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Max tracker */}
                    <div className="flex justify-between items-center mt-4 pt-3"
                      style={{ borderTop: "1px solid var(--viz-border)" }}>
                      <span className="text-xs text-default-400 font-mono">maxLen =</span>
                      <span className="font-bold text-xl font-mono" style={{ color: GOLD }}>{step.maxLen}</span>
                    </div>
                  </div>

                  {/* Step description */}
                  <div className="rounded-lg px-4 py-3 mb-4 text-xs font-mono bg-content2"
                    style={{ borderLeft: `3px solid ${step.phase === 'skip' ? GOLD : step.phase === 'result' ? TEAL : TEAL}` }}>
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
                    <p className="text-xs text-default-400 mb-2">Longest Consecutive Sequence</p>
                    <div className="flex items-center justify-center gap-1 flex-wrap mb-4">
                      {step.bestChain.map((n, i) => (
                        <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span className="font-mono text-base font-bold px-2 py-1 rounded"
                            style={{ background: `${TEAL}22`, color: TEAL, border: `1px solid ${TEAL}66` }}>
                            {n}
                          </span>
                          {i < step.bestChain.length - 1 && <span style={{ color: TEAL }}>→</span>}
                        </span>
                      ))}
                    </div>
                    <p className="font-bold text-3xl font-mono" style={{ color: TEAL }}>{step.maxLen}</p>
                    <p className="text-xs text-default-400 mt-2">consecutive elements</p>
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
                <CodeBlock>{`import java.util.HashSet;

class Solution {
    public int longestConsecutive(int[] nums) {
        HashSet<Integer> set = new HashSet<>();
        for (int num : nums) {
            set.add(num);
        }

        int maxLen = 0;

        for (int num : set) {
            // Only start counting if num is the beginning of a sequence
            if (!set.contains(num - 1)) {
                int cur = num;
                int len = 1;

                while (set.contains(cur + 1)) {
                    cur++;
                    len++;
                }

                maxLen = Math.max(maxLen, len);
            }
        }

        return maxLen;
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "set.add(num)", exp: "Load all numbers into a HashSet. Duplicates are silently ignored. O(n) total." },
                    { line: "if (!set.contains(num - 1))", exp: "Sequence start check: num is a start only if num-1 is NOT in the set. Skip otherwise to avoid redundant work." },
                    { line: "int cur = num; int len = 1", exp: "Initialize the chain starting at num with length 1 (the start itself)." },
                    { line: "while (set.contains(cur + 1))", exp: "Extend the chain as long as the next consecutive number exists in O(1) per lookup." },
                    { line: "maxLen = Math.max(maxLen, len)", exp: "Update the global maximum after fully counting each consecutive sequence." },
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
                    { icon: "📍", color: TEAL, tip: "Only start counting from sequence starts: !set.contains(num - 1). This is the key insight that makes it O(n) instead of O(n²)." },
                    { icon: "⚠️", color: GOLD, tip: "The nested while-loop doesn't make it O(n²). Each number is visited at most once as a start and once in a chain extension — O(n) total across ALL iterations." },
                    { icon: "🔄", color: BLUE, tip: "Iterate over the SET, not the original array. Duplicates in nums are already removed, preventing double-counting sequence starts." },
                    { icon: "💡", color: TEAL, tip: "Load all elements into a HashSet first. The second loop only works correctly if the lookup set is fully populated before you start iterating." },
                    { icon: "🎯", color: BLUE, tip: "Related: Longest Consecutive Subsequence (DP variant), Union-Find approach, Graph connected components." },
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
