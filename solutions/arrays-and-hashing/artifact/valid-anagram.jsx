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

function simulate(s, t) {
  if (!s || !t) return [];
  const steps = [];
  const count = new Array(26).fill(0);

  if (s.length !== t.length) {
    steps.push({
      phase: 'length_mismatch',
      desc: `Lengths differ (${s.length} vs ${t.length}) → return false immediately`,
      count: [...count],
      currentChar: null,
      charIdx: -1,
      iterating: null,
      result: false,
    });
    return steps;
  }

  steps.push({
    phase: 'init',
    desc: `Both strings have length ${s.length}. Initialize count[26] = all zeros.`,
    count: [...count],
    currentChar: null,
    charIdx: -1,
    iterating: null,
    result: null,
  });

  // Increment phase for s
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const idx = c.charCodeAt(0) - 97;
    count[idx]++;
    steps.push({
      phase: 'increment',
      desc: `s[${i}]='${c}' → count['${c}'-'a'] = count[${idx}]++ = ${count[idx]}`,
      count: [...count],
      currentChar: c,
      charIdx: idx,
      iterating: 's',
      result: null,
    });
  }

  // Decrement phase for t
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    const idx = c.charCodeAt(0) - 97;
    count[idx]--;
    steps.push({
      phase: 'decrement',
      desc: `t[${i}]='${c}' → count['${c}'-'a'] = count[${idx}]-- = ${count[idx]}`,
      count: [...count],
      currentChar: c,
      charIdx: idx,
      iterating: 't',
      result: null,
    });
  }

  // Check phase
  const allZero = count.every(v => v === 0);
  const nonZeroIdx = count.findIndex(v => v !== 0);
  steps.push({
    phase: allZero ? 'pass' : 'fail',
    desc: allZero
      ? `All counts are 0 → every char balances out → return true`
      : `count[${nonZeroIdx}] = ${count[nonZeroIdx]} ≠ 0 → mismatch → return false`,
    count: [...count],
    currentChar: null,
    charIdx: nonZeroIdx,
    iterating: null,
    result: allZero,
  });

  return steps;
}

const PRESETS = [
  { label: "Anagram", s: "anagram", t: "nagaram" },
  { label: "Not Anagram", s: "rat", t: "car" },
  { label: "Same chars", s: "listen", t: "silent" },
  { label: "Diff length", s: "abc", t: "ab" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [sInput, setSInput] = useState("anagram");
  const [tInput, setTInput] = useState("nagaram");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    const s = simulate(sInput.toLowerCase().replace(/[^a-z]/g, ''), tInput.toLowerCase().replace(/[^a-z]/g, ''));
    setSteps(s);
    setSi(0);
  }, [sInput, tInput]);

  const step = steps[si] || null;
  const activePreset = PRESETS.find(p => p.s === sInput && p.t === tInput);

  // Show only letters that appear in either string for the chart
  const relevantLetters = Array.from(new Set([...sInput, ...tInput].filter(c => /[a-z]/.test(c)))).sort();

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🔤</span>
        <h1 className="font-semibold text-base">Valid Anagram</h1>
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
                  Given two strings <strong>s</strong> and <strong>t</strong>, return <strong>true</strong> if{" "}
                  <strong>t</strong> is an anagram of <strong>s</strong>, and <strong>false</strong> otherwise.
                  An anagram uses all the original letters exactly once, just rearranged.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "boolean isAnagram(String s, String t)", desc: "Return true if t contains exactly the same characters with same frequencies as s, in any order." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-[6rem] flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — "anagram" vs "nagaram"</p>
                <CodeBlock language="text">{`Input:  s = "anagram", t = "nagaram"

char count array (index = char - 'a'):
  Process s: a→+3, n→+1, g→+1, r→+1, m→+1
  Process t: n→-1, a→-3, g→-1, r→-1, a→ already counted, m→-1

Final count: all zeros ✓
Output: true  (same characters, same frequencies)`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — "rat" vs "car"</p>
                <CodeBlock language="text">{`Input:  s = "rat", t = "car"

char count array:
  Process s: r→+1, a→+1, t→+1
  Process t: c→-1, a→-1, r→-1

Final count: t→+1, c→-1 (not all zeros!)
Output: false  (t has 't' that car doesn't, car has 'c' that rat doesn't)`}</CodeBlock>
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
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>int[26] Balance Counter</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Map each letter to an index (a=0, b=1, …, z=25). Increment for s,
                      decrement for t. Anagrams must perfectly cancel out to all zeros.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">count[c - 'a']++ / --</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>O(1) Space Trick</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Since there are only 26 lowercase letters, the array is always fixed
                      size — constant space regardless of string length.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">int[26] is always 26 slots</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`if (s.length() != t.length()) return false;  // quick exit

int[] count = new int[26];

for (char c : s.toCharArray()) count[c - 'a']++;  // increment
for (char c : t.toCharArray()) count[c - 'a']--;  // decrement

for (int freq : count) {
    if (freq != 0) return false;  // imbalance
}
return true;`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  Increment for one string, decrement for the other. If they're anagrams, every
                  character's additions and subtractions cancel perfectly — all counts hit 0.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(n)", s: "Two passes over s and t, then 26-element check" },
                    { l: "SPACE", v: "O(1)", s: "Fixed int[26] regardless of string length" }
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
                      onPress={() => { setSInput(p.s); setTInput(p.t); }}>
                      {p.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Input
                    label="s"
                    value={sInput}
                    onValueChange={v => setSInput(v)}
                    placeholder="e.g., anagram"
                    variant="bordered"
                    size="sm"
                    className="flex-1 min-w-32"
                  />
                  <Input
                    label="t"
                    value={tInput}
                    onValueChange={v => setTInput(v)}
                    placeholder="e.g., nagaram"
                    variant="bordered"
                    size="sm"
                    className="flex-1 min-w-32"
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
                    {step.phase === 'init' && <>Strings equal length · count[26] initialized</>}
                    {step.phase === 'length_mismatch' && <>Lengths differ → <V color={RED}>false</V></>}
                    {step.phase === 'increment' && (
                      <>
                        Processing <V color={TEAL}>s</V> ·
                        char: <V color={TEAL}>'{step.currentChar}'</V> ·
                        count[{step.charIdx}]: <V color={GOLD}>{step.count[step.charIdx]}</V>
                      </>
                    )}
                    {step.phase === 'decrement' && (
                      <>
                        Processing <V color={GOLD}>t</V> ·
                        char: <V color={GOLD}>'{step.currentChar}'</V> ·
                        count[{step.charIdx}]: <V color={step.count[step.charIdx] < 0 ? RED : BLUE}>{step.count[step.charIdx]}</V>
                      </>
                    )}
                    {step.phase === 'pass' && <>All counts = 0 · <V color={TEAL}>true</V></>}
                    {step.phase === 'fail' && <>Non-zero count found · <V color={RED}>false</V></>}
                  </p>

                  {/* Live Code Block */}
                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step.phase === 'length_mismatch'}
                      annotation={step.phase === 'length_mismatch' ? `${sInput.length} != ${tInput.length}` : ''}
                      annotationColor={RED}>
                      <span style={{ color: "var(--code-muted)" }}>{"if (s.length() != t.length()) return false;"}</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'increment'}
                      annotation={step.phase === 'increment' ? `count[${step.charIdx}]++ = ${step.count[step.charIdx]}` : ''}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>{"for s: count[c - 'a']++;"}</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'decrement'}
                      annotation={step.phase === 'decrement' ? `count[${step.charIdx}]-- = ${step.count[step.charIdx]}` : ''}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>{"for t: count[c - 'a']--;"}</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'pass' || step.phase === 'fail'}
                      annotation={step.phase === 'pass' ? 'all zeros ✓' : step.phase === 'fail' ? 'nonzero found ✗' : ''}
                      annotationColor={step.phase === 'pass' ? TEAL : RED}>
                      <span style={{ color: "var(--code-muted)" }}>{"if (freq != 0) return false;"}</span>
                    </CodeLine>
                  </div>

                  {/* Frequency Bar Chart */}
                  <div className="rounded-xl p-4 mb-4"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3 text-center">
                      count[] — relevant characters (+ means s has more, - means t has more)
                    </p>
                    <div className="overflow-x-auto">
                      {relevantLetters.length > 0 && (() => {
                        const maxAbs = Math.max(1, ...relevantLetters.map(c => Math.abs(step.count[c.charCodeAt(0) - 97])));
                        const barH = 40;
                        const cellW = 32;
                        const svgW = relevantLetters.length * cellW;
                        return (
                          <svg width="100%" viewBox={`0 0 ${svgW} ${barH * 2 + 30}`} style={{ display: "block" }}>
                            {relevantLetters.map((c, i) => {
                              const idx = c.charCodeAt(0) - 97;
                              const val = step.count[idx];
                              const isActive = idx === step.charIdx;
                              const barLen = Math.abs(val) / maxAbs * barH;
                              const isPos = val >= 0;
                              const color = isActive ? (step.phase === 'increment' ? TEAL : GOLD) : val === 0 ? BLUE : val > 0 ? TEAL : RED;
                              const x = i * cellW + 4;
                              const midY = barH;
                              return (
                                <g key={c}>
                                  {val !== 0 && (
                                    <rect
                                      x={x} y={isPos ? midY - barLen : midY}
                                      width={24} height={barLen}
                                      fill={`${color}44`} stroke={color} strokeWidth={isActive ? 2 : 1} rx={2}
                                    />
                                  )}
                                  <line x1={x} y1={midY} x2={x + 24} y2={midY} stroke="var(--viz-border)" strokeWidth={1} />
                                  <text x={x + 12} y={midY + barH + 16} textAnchor="middle" fontSize={10} fontFamily="monospace"
                                    fill={isActive ? color : "var(--viz-muted)"}>{c}</text>
                                  <text x={x + 12} y={isPos ? midY - barLen - 3 : midY + barLen + 12} textAnchor="middle" fontSize={9}
                                    fontFamily="monospace" fill={color}>
                                    {val !== 0 ? val : ""}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Step Description */}
                  <div className="bg-content2 rounded-lg px-4 py-3 mb-4 text-sm font-mono"
                    style={{ borderLeft: `3px solid ${step.phase === 'fail' || step.phase === 'length_mismatch' ? RED : TEAL}` }}>
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
                    <p className="text-xs text-default-400 mb-3">
                      isAnagram("{sInput}", "{tInput}")
                    </p>
                    <p className="font-bold text-3xl" style={{ color: step.result ? TEAL : RED }}>
                      {step.result ? "true" : "false"}
                    </p>
                    <p className="text-xs text-default-400 mt-3">
                      {step.result ? `"${tInput}" is a valid anagram of "${sInput}"` : `"${tInput}" is NOT an anagram of "${sInput}"`}
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
                <CodeBlock>{`class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) {
            return false;  // can't be anagram with different lengths
        }

        int[] count = new int[26];

        for (char c : s.toCharArray()) {
            count[c - 'a']++;  // increment for s
        }
        for (char c : t.toCharArray()) {
            count[c - 'a']--;  // decrement for t
        }

        for (int freq : count) {
            if (freq != 0) {
                return false;  // imbalance found
            }
        }

        return true;
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "if (s.length() != t.length()) return false", exp: "Anagrams must have identical length. This early exit saves time when lengths differ." },
                    { line: "int[] count = new int[26]", exp: "Fixed-size array indexed by letter (a=0, b=1, …, z=25). Always O(1) space — only 26 slots regardless of input." },
                    { line: "count[c - 'a']++", exp: "For each char in s, increment its slot. 'a'-'a'=0, 'b'-'a'=1, etc. Tracks s's character frequencies." },
                    { line: "count[c - 'a']--", exp: "For each char in t, decrement the same slot. Anagram means every decrement cancels an increment." },
                    { line: "if (freq != 0) return false", exp: "If any slot is nonzero, t had a different count for that letter — not an anagram." },
                    { line: "return true", exp: "Every character count balanced to zero, confirming t uses exactly the same letters as s." },
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
                    { icon: "📍", color: TEAL, tip: "int[26] is the go-to for lowercase letter frequency — always O(1) space, fast array access." },
                    { icon: "⚠️", color: GOLD, tip: "Increment for s, decrement for t. Think of it as 'adding' one string and 'subtracting' the other." },
                    { icon: "🔄", color: BLUE, tip: "Alternative: sort both strings and compare with .equals(). Cleaner code but O(n log n) time." },
                    { icon: "💡", color: TEAL, tip: "For Unicode support, use HashMap<Character, Integer> instead of int[26]." },
                    { icon: "🎯", color: BLUE, tip: "Related problems: Group Anagrams, Find All Anagrams in a String, Minimum Window Substring." },
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
