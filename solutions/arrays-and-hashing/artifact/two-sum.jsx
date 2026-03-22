export const difficulty = 'Easy'
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

function simulate(numsStr, target) {
  const nums = numsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (nums.length === 0 || isNaN(target)) return [];

  const steps = [];
  const map = new Map(); // value → index

  steps.push({
    phase: 'init',
    desc: `Start: nums = [${nums.join(', ')}], target = ${target}`,
    currentIdx: -1,
    currentNum: null,
    complement: null,
    map: [],
    found: false,
    result: null,
  });

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const comp = target - num;
    const compExists = map.has(comp);

    steps.push({
      phase: 'check',
      desc: `i=${i}: num=${num}, complement=${target}-${num}=${comp}. Is ${comp} in map? ${compExists ? "YES ✓" : "NO"}`,
      currentIdx: i,
      currentNum: num,
      complement: comp,
      map: [...map.entries()],
      found: false,
      compExists,
      result: null,
    });

    if (compExists) {
      const compIdx = map.get(comp);
      steps.push({
        phase: 'found',
        desc: `Found! map[${comp}] = index ${compIdx}. Return [${compIdx}, ${i}]`,
        currentIdx: i,
        currentNum: num,
        complement: comp,
        compIdx,
        map: [...map.entries()],
        found: true,
        compExists: true,
        result: [compIdx, i],
      });
      return steps;
    }

    map.set(num, i);

    steps.push({
      phase: 'store',
      desc: `${comp} not in map. Store ${num} → ${i} in map.`,
      currentIdx: i,
      currentNum: num,
      complement: comp,
      map: [...map.entries()],
      found: false,
      compExists: false,
      result: null,
    });
  }

  return steps;
}

const PRESETS = [
  { label: "LC Example 1", val: "2,7,11,15", target: 9 },
  { label: "LC Example 2", val: "3,2,4", target: 6 },
  { label: "Same element", val: "3,3", target: 6 },
  { label: "Negatives", val: "-3,4,3,90", target: 0 },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [numsInput, setNumsInput] = useState("2,7,11,15");
  const [targetInput, setTargetInput] = useState("9");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    const t = parseInt(targetInput);
    const s = simulate(numsInput, t);
    setSteps(s);
    setSi(0);
  }, [numsInput, targetInput]);

  const step = steps[si] || null;
  const nums = numsInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const target = parseInt(targetInput);
  const activePreset = PRESETS.find(p => p.val === numsInput && p.target === target);

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">➕</span>
        <h1 className="font-semibold text-base">Two Sum</h1>
        <Chip size="sm" color="success" variant="flat">Easy</Chip>
        <Chip size="sm" color="primary" variant="flat">Arrays & Hashing</Chip>
      </div>

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

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given an array of integers <strong>nums</strong> and an integer <strong>target</strong>,
                  return the <strong>indices</strong> of the two numbers that add up to target.
                  Exactly one solution is guaranteed, and you may not use the same element twice.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "int[] twoSum(int[] nums, int target)", desc: "Return [i, j] where nums[i] + nums[j] == target. i != j. One solution guaranteed." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-[6rem] flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — nums = [2,7,11,15], target = 9</p>
                <CodeBlock language="text">{`Input:  nums = [2, 7, 11, 15], target = 9

i=0: num=2, complement=9-2=7. Is 7 in map? NO → store 2→0. map={2:0}
i=1: num=7, complement=9-7=2. Is 2 in map? YES! map[2]=0 → return [0, 1]

Output: [0, 1]
Check:  nums[0] + nums[1] = 2 + 7 = 9 ✓`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — nums = [3,2,4], target = 6</p>
                <CodeBlock language="text">{`Input:  nums = [3, 2, 4], target = 6

i=0: num=3, complement=6-3=3. Is 3 in map? NO → store 3→0. map={3:0}
i=1: num=2, complement=6-2=4. Is 4 in map? NO → store 2→1. map={3:0, 2:1}
i=2: num=4, complement=6-4=2. Is 2 in map? YES! map[2]=1 → return [1, 2]

Output: [1, 2]
Check:  nums[1] + nums[2] = 2 + 4 = 6 ✓`}</CodeBlock>
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
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Complement Lookup</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      For each number, compute its complement: <code>target - num</code>.
                      If that complement is already in the map, we have our answer.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">complement = target - nums[i]</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>HashMap: Value → Index</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Store each number's <strong>value as key</strong> and its <strong>index as value</strong>.
                      This lets us look up where a complement lives in O(1).
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">map.put(num, i)  →  map.get(comp)</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`Map<Integer, Integer> map = new HashMap<>();  // value → index

for (int i = 0; i < nums.length; i++) {
    int complement = target - nums[i];

    if (map.containsKey(complement)) {
        return new int[] { map.get(complement), i };  // found!
    }

    map.put(nums[i], i);  // store for future lookups
}`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  Check for the complement BEFORE storing the current number. This prevents using
                  the same index twice (e.g., num=3, target=6 — you'd falsely match 3 with itself).
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(n)", s: "Single pass — each element checked and stored once" },
                    { l: "SPACE", v: "O(n)", s: "HashMap stores up to n entries in worst case" }
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
                      variant={activePreset?.label === p.label ? "flat" : "bordered"}
                      color={activePreset?.label === p.label ? "primary" : "default"}
                      onPress={() => { setNumsInput(p.val); setTargetInput(String(p.target)); }}>
                      {p.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Input
                    label="Array"
                    value={numsInput}
                    onValueChange={v => setNumsInput(v)}
                    placeholder="e.g., 2,7,11,15"
                    variant="bordered"
                    size="sm"
                    className="flex-1 min-w-40"
                  />
                  <Input
                    label="Target"
                    value={targetInput}
                    onValueChange={v => setTargetInput(v)}
                    placeholder="e.g., 9"
                    variant="bordered"
                    size="sm"
                    className="w-24"
                  />
                </div>
              </CardBody></Card>

              {/* Step-by-Step Debugger */}
              {steps.length > 0 && step && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Execution</p>
                  <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                    {si + 1}/{steps.length}
                  </p>

                  {/* Status Line */}
                  <p className="text-xs text-default-500 mb-4 font-mono">
                    {step.phase === 'init' && <>target = <V color={GOLD}>{target}</V> · map is empty</>}
                    {step.phase === 'check' && (
                      <>
                        num[{step.currentIdx}]: <V color={TEAL}>{step.currentNum}</V> ·
                        need: <V color={GOLD}>{step.complement}</V> ·
                        in map: <V color={step.compExists ? TEAL : RED}>{step.compExists ? "YES ✓" : "NO"}</V>
                      </>
                    )}
                    {step.phase === 'store' && (
                      <>
                        Stored <V color={TEAL}>{step.currentNum}</V> → index <V color={BLUE}>{step.currentIdx}</V>
                      </>
                    )}
                    {step.phase === 'found' && (
                      <>
                        Answer: indices <V color={TEAL}>[{step.result?.[0]}, {step.result?.[1]}]</V> ·
                        {nums[step.result?.[0]]} + {nums[step.result?.[1]]} = <V color={TEAL}>{target}</V>
                      </>
                    )}
                  </p>

                  {/* Live Code Block */}
                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step.phase === 'check' || step.phase === 'found'}
                      annotation={step.phase === 'check' ? `complement = ${target} - ${step.currentNum} = ${step.complement}` : ''}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>int complement = target - nums[i];</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'check' && step.compExists}
                      annotation={(step.phase === 'check' && step.compExists) ? `map has ${step.complement}` : ''}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>if (map.containsKey(complement))</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'found'}
                      annotation={step.phase === 'found' ? `→ [${step.result}]` : ''}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>{"  return new int[]{ map.get(complement), i };"}</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'store'}
                      annotation={step.phase === 'store' ? `map[${step.currentNum}] = ${step.currentIdx}` : ''}
                      annotationColor={BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>map.put(nums[i], i);</span>
                    </CodeLine>
                  </div>

                  {/* Array Visualization */}
                  <div className="rounded-xl p-4 mb-4"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3 text-center">Array — target: {target}</p>
                    <div className="overflow-x-auto">
                      <svg width="100%" viewBox={`0 0 ${Math.max(nums.length * 64, 200)} 80`} style={{ display: "block" }}>
                        {nums.map((n, i) => {
                          const isCurrent = i === step.currentIdx;
                          const isResult = step.result && step.result.includes(i);
                          const isComplement = step.phase === 'check' && step.map.some(([v]) => v === step.complement) &&
                            step.map.find(([v]) => v === step.complement)?.[1] === i;
                          const color = isResult ? TEAL : isComplement ? GOLD : isCurrent ? BLUE : "var(--viz-border)";
                          const bg = isResult ? `${TEAL}28` : isComplement ? `${GOLD}28` : isCurrent ? `${BLUE}18` : "var(--viz-node-bg)";
                          const x = i * 64 + 4;
                          return (
                            <g key={i}>
                              <rect x={x} y={8} width={54} height={40} rx={6}
                                fill={bg} stroke={color} strokeWidth={isCurrent || isResult || isComplement ? 2 : 1} />
                              <text x={x + 27} y={33} textAnchor="middle" fontSize={14} fontFamily="monospace"
                                fontWeight={isCurrent || isResult ? "bold" : "normal"}
                                fill={isResult ? TEAL : isComplement ? GOLD : isCurrent ? BLUE : "var(--viz-muted)"}>
                                {n}
                              </text>
                              <text x={x + 27} y={62} textAnchor="middle" fontSize={10} fontFamily="monospace"
                                fill="var(--viz-muted)">[{i}]</text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* HashMap Display */}
                    <p className="text-xs text-default-400 mt-3 mb-2">HashMap (value → index):</p>
                    <div className="flex gap-2 flex-wrap min-h-[28px]">
                      {step.map.length === 0
                        ? <span className="text-xs text-default-400 italic">empty</span>
                        : step.map.map(([val, idx]) => {
                          const isComp = step.phase === 'check' && val === step.complement;
                          return (
                            <span key={`${val}-${idx}`} className="text-xs font-mono px-2 py-1 rounded"
                              style={{
                                background: isComp ? `${GOLD}28` : `${BLUE}18`,
                                color: isComp ? GOLD : BLUE,
                                border: `1px solid ${isComp ? GOLD : BLUE}44`,
                                fontWeight: isComp ? 700 : 400,
                              }}>
                              {val}→[{idx}]
                            </span>
                          );
                        })}
                    </div>
                    {step.phase === 'check' && (
                      <p className="text-xs mt-2" style={{ color: step.compExists ? TEAL : RED }}>
                        Looking for complement <strong>{step.complement}</strong>: {step.compExists ? "found ✓" : "not in map"}
                      </p>
                    )}
                  </div>

                  {/* Step Description */}
                  <div className="bg-content2 rounded-lg px-4 py-3 mb-4 text-sm font-mono"
                    style={{ borderLeft: `3px solid ${step.phase === 'found' ? TEAL : step.phase === 'store' ? BLUE : GOLD}` }}>
                    {step.desc}
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
                      onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1}
                      onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                  </div>
                </CardBody></Card>
              )}

              {/* Final State */}
              {step && step.result && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Result</p>
                  <div className="text-center py-6 rounded-xl"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3">
                      twoSum([{nums.join(', ')}], {target})
                    </p>
                    <p className="font-bold text-3xl" style={{ color: TEAL }}>
                      [{step.result.join(', ')}]
                    </p>
                    <p className="text-xs text-default-400 mt-3">
                      nums[{step.result[0]}] + nums[{step.result[1]}] = {nums[step.result[0]]} + {nums[step.result[1]]} = {target}
                    </p>
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
                <CodeBlock>{`import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();  // value → index

        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];

            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };  // found pair
            }

            map.put(nums[i], i);  // store current for future lookups
        }

        return new int[] {};  // guaranteed not to reach here
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "HashMap<Integer, Integer> map = new HashMap<>()", exp: "Map stores value → index. Key is the number's value so we can look up any number in O(1)." },
                    { line: "int complement = target - nums[i]", exp: "The number we need to complete the pair. If nums[i]=2 and target=9, we need 7." },
                    { line: "if (map.containsKey(complement))", exp: "Check if we've already seen the required complement in a previous iteration. O(1) lookup." },
                    { line: "return new int[]{ map.get(complement), i }", exp: "Return both indices: the complement's index (from the map) and the current index i." },
                    { line: "map.put(nums[i], i)", exp: "Store current number as a candidate for future complements. Done AFTER checking to avoid self-matching." },
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
                    { icon: "📍", color: TEAL, tip: "Map stores value → index (not index → value). You need to look up WHERE a value is, so it must be the key." },
                    { icon: "⚠️", color: GOLD, tip: "Check complement BEFORE storing current number. Otherwise nums=[3,3], target=6 returns [0,0] — same element used twice!" },
                    { icon: "🔄", color: BLUE, tip: "Brute force is O(n²) with two nested loops. HashMap reduces this to O(n) with one pass." },
                    { icon: "💡", color: TEAL, tip: "For sorted arrays, use two pointers instead — O(n) time, O(1) space. But problem gives unsorted input." },
                    { icon: "🎯", color: BLUE, tip: "Related problems: Three Sum, Four Sum, Two Sum II (sorted array), Two Sum III (data structure design)." },
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
