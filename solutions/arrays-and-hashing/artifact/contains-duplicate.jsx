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

function simulate(numsStr) {
  const nums = numsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (nums.length === 0) return [];

  const steps = [];
  const seen = new Set();

  steps.push({
    phase: 'init',
    desc: `Starting with nums = [${nums.join(', ')}]`,
    currentIdx: -1,
    currentNum: null,
    seen: [],
    found: false,
    checking: false,
    isDuplicate: false,
    result: null,
  });

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const alreadyContains = seen.has(num);

    steps.push({
      phase: 'check',
      desc: `Check if ${num} is in the HashSet`,
      currentIdx: i,
      currentNum: num,
      seen: [...seen],
      found: false,
      checking: true,
      isDuplicate: alreadyContains,
      result: null,
    });

    if (alreadyContains) {
      steps.push({
        phase: 'found',
        desc: `${num} already in set! → return true`,
        currentIdx: i,
        currentNum: num,
        seen: [...seen],
        found: true,
        checking: false,
        isDuplicate: true,
        result: true,
      });
      return steps;
    }

    seen.add(num);

    steps.push({
      phase: 'add',
      desc: `${num} not in set → add to HashSet`,
      currentIdx: i,
      currentNum: num,
      seen: [...seen],
      found: false,
      checking: false,
      isDuplicate: false,
      result: null,
    });
  }

  steps.push({
    phase: 'done',
    desc: `All elements checked, no duplicates → return false`,
    currentIdx: -1,
    currentNum: null,
    seen: [...seen],
    found: false,
    checking: false,
    isDuplicate: false,
    result: false,
  });

  return steps;
}

const PRESETS = [
  { label: "Has Duplicate", val: "1,2,3,1" },
  { label: "All Unique", val: "1,2,3,4" },
  { label: "All Same", val: "5,5,5,5" },
  { label: "Edge: 2 elems", val: "7,7" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [input, setInput] = useState("1,2,3,1");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    const s = simulate(input);
    setSteps(s);
    setSi(0);
  }, [input]);

  const step = steps[si] || null;
  const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🔍</span>
        <h1 className="font-semibold text-base">Contains Duplicate</h1>
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
                  Given an integer array <strong>nums</strong>, return <strong>true</strong> if any value appears
                  at least twice in the array, and <strong>false</strong> if every element is distinct.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "boolean containsDuplicate(int[] nums)", desc: "Return true if any element appears more than once, false if all elements are unique." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-[6rem] flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — nums = [1,2,3,1]</p>
                <CodeBlock language="text">{`Input:  nums = [1, 2, 3, 1]

Step 1: Check 1 → not in set → add. set = {1}
Step 2: Check 2 → not in set → add. set = {1, 2}
Step 3: Check 3 → not in set → add. set = {1, 2, 3}
Step 4: Check 1 → ALREADY IN SET! → return true

Output: true`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — nums = [1,2,3,4]</p>
                <CodeBlock language="text">{`Input:  nums = [1, 2, 3, 4]

Step 1: Check 1 → not in set → add. set = {1}
Step 2: Check 2 → not in set → add. set = {1, 2}
Step 3: Check 3 → not in set → add. set = {1, 2, 3}
Step 4: Check 4 → not in set → add. set = {1, 2, 3, 4}

Loop ends without finding duplicate.
Output: false`}</CodeBlock>
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
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>HashSet as Memory</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      A HashSet tracks which numbers we've already seen. O(1) average
                      lookup means we can check membership instantly.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">seen.contains(num) → O(1)</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Early Return</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      The moment we find a number already in the set, we stop immediately
                      and return true. No need to check the rest of the array.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">return true on first duplicate found</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`HashSet<Integer> seen = new HashSet<>();
for (int num : nums) {
    if (seen.contains(num)) {
        return true;  // duplicate found
    }
    seen.add(num);    // mark as visited
}
return false;         // all unique`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  Check BEFORE adding. This prevents a number from matching itself — we're looking
                  for a second occurrence, not a first.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(n)", s: "Single pass through the array" },
                    { l: "SPACE", v: "O(n)", s: "HashSet holds up to n distinct elements" }
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
                  label="Array (comma-separated)"
                  value={input}
                  onValueChange={v => setInput(v)}
                  placeholder="e.g., 1,2,3,1"
                  variant="bordered"
                  size="sm"
                />
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
                    {step.phase === 'init' && "Ready to scan the array"}
                    {step.phase === 'check' && (
                      <>
                        Checking: <V color={TEAL}>{step.currentNum}</V> ·
                        In set: <V color={step.isDuplicate ? RED : GOLD}>{step.isDuplicate ? "YES" : "NO"}</V> ·
                        Set size: <V color={BLUE}>{step.seen.length}</V>
                      </>
                    )}
                    {step.phase === 'add' && (
                      <>
                        Added <V color={TEAL}>{step.currentNum}</V> to set ·
                        Set size: <V color={BLUE}>{step.seen.length}</V>
                      </>
                    )}
                    {step.phase === 'found' && (
                      <>
                        Duplicate found: <V color={RED}>{step.currentNum}</V> · Return <V color={RED}>true</V>
                      </>
                    )}
                    {step.phase === 'done' && (
                      <>
                        No duplicates found · Return <V color={TEAL}>false</V>
                      </>
                    )}
                  </p>

                  {/* Live Code Block */}
                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step.phase === 'check' || step.phase === 'found'}
                      annotation={step.phase === 'check' ? `seen.contains(${step.currentNum}) = ${step.isDuplicate}` : ''}
                      annotationColor={step.isDuplicate ? RED : TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>{"if (seen.contains(num))"}</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'found'}
                      annotation={step.phase === 'found' ? 'duplicate!' : ''}
                      annotationColor={RED}>
                      <span style={{ color: "var(--code-muted)" }}>{"  return true;"}</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'add'}
                      annotation={step.phase === 'add' ? `added ${step.currentNum}` : ''}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>{"seen.add(num);"}</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'done'}
                      annotation={step.phase === 'done' ? 'all unique' : ''}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>{"return false;"}</span>
                    </CodeLine>
                  </div>

                  {/* Array Visualization */}
                  <div className="rounded-xl p-5 mb-4"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3 text-center">Array — current element highlighted</p>
                    <div className="overflow-x-auto">
                      <svg width="100%" viewBox={`0 0 ${Math.max(nums.length * 56, 200)} 80`} style={{ display: "block" }}>
                        {nums.map((n, i) => {
                          const isCurrent = i === step.currentIdx;
                          const isInSet = step.seen.includes(n) && !isCurrent;
                          const isDupFound = isCurrent && step.phase === 'found';
                          const x = i * 56 + 4;
                          const fill = isDupFound
                            ? `${RED}28`
                            : isCurrent
                            ? `${TEAL}28`
                            : isInSet
                            ? `${BLUE}18`
                            : "var(--viz-node-bg)";
                          const stroke = isDupFound ? RED : isCurrent ? TEAL : isInSet ? BLUE : "var(--viz-border)";
                          return (
                            <g key={i}>
                              <rect x={x} y={8} width={48} height={40} rx={6}
                                fill={fill} stroke={stroke} strokeWidth={isCurrent ? 2 : 1} />
                              <text x={x + 24} y={33} textAnchor="middle" fontSize={14} fontFamily="monospace"
                                fontWeight={isCurrent ? "bold" : "normal"}
                                fill={isDupFound ? RED : isCurrent ? TEAL : "var(--viz-muted)"}>
                                {n}
                              </text>
                              <text x={x + 24} y={62} textAnchor="middle" fontSize={10} fontFamily="monospace"
                                fill="var(--viz-muted)">[{i}]</text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                    <p className="text-xs text-default-400 mt-3 mb-1">HashSet contents:</p>
                    <div className="flex gap-2 flex-wrap min-h-[28px]">
                      {step.seen.length === 0
                        ? <span className="text-xs text-default-400 italic">empty</span>
                        : step.seen.map((v, i) => (
                          <span key={i} className="text-xs font-mono px-2 py-1 rounded"
                            style={{ background: `${TEAL}22`, color: TEAL, border: `1px solid ${TEAL}44` }}>
                            {v}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Step Description */}
                  <div className="bg-content2 rounded-lg px-4 py-3 mb-4 text-sm font-mono"
                    style={{ borderLeft: `3px solid ${step.phase === 'found' ? RED : TEAL}` }}>
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
              {step && step.result !== null && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Result</p>
                  <div className="text-center py-6 rounded-xl"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3">containsDuplicate([{nums.join(', ')}])</p>
                    <p className="font-bold text-3xl" style={{ color: step.result ? RED : TEAL }}>
                      {step.result ? "true" : "false"}
                    </p>
                    <p className="text-xs text-default-400 mt-3">
                      {step.result ? "Duplicate element detected" : "All elements are unique"}
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
                <CodeBlock>{`import java.util.HashSet;

class Solution {
    public boolean containsDuplicate(int[] nums) {
        HashSet<Integer> seen = new HashSet<>();
        for (int num : nums) {
            if (seen.contains(num)) {
                return true;  // found a duplicate
            }
            seen.add(num);    // mark as seen
        }
        return false;         // no duplicates found
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "HashSet<Integer> seen = new HashSet<>()", exp: "Create a set to track which numbers we've visited. HashSet gives O(1) average lookup and insert." },
                    { line: "for (int num : nums)", exp: "Iterate through every element in the array from left to right." },
                    { line: "if (seen.contains(num))", exp: "Check if this number was already encountered. If yes, we've found a duplicate." },
                    { line: "return true", exp: "Early exit as soon as the first duplicate is detected. No need to scan further." },
                    { line: "seen.add(num)", exp: "Number not seen before — record it in the set and move to the next element." },
                    { line: "return false", exp: "The loop completed without finding any duplicate, so all elements are distinct." },
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
                    { icon: "📍", color: TEAL, tip: "HashSet = O(1) lookup. Use it whenever you need 'have I seen this before?'" },
                    { icon: "⚠️", color: GOLD, tip: "Check contains() BEFORE add(). Otherwise a lone element would never match itself." },
                    { icon: "🔄", color: BLUE, tip: "Compact alternative: if (!seen.add(num)) return true — add() returns false if already present." },
                    { icon: "💡", color: TEAL, tip: "Brute force O(n²) uses nested loops. Sorting + adjacent check is O(n log n). HashSet is the optimal O(n) approach." },
                    { icon: "🎯", color: BLUE, tip: "Related problems: Two Sum, Intersection of Two Arrays, Find the Duplicate Number." },
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
